const express = require('express');
const Fighter = require('../models/Fighter');
const Goal = require('../models/Goal');
const Report = require('../models/Report');
const { authRequired } = require('../middleware/auth');
const { enrichFighter, getAttendanceStats } = require('../services/fighterMetrics');
const { computeGoalStatus } = require('../services/scoring');
const { getGroqCoachSummary } = require('../services/aiCoach');
const { buildFighterReport } = require('../services/reportBuilder');

const router = express.Router();
router.use(authRequired);

async function getOwnedFighter(fighterId, coachId) {
  try {
    return await Fighter.findOne({ _id: fighterId, coach_id: coachId });
  } catch (error) {
    return null;
  }
}

router.post('/generate', async (req, res) => {
  const fighterId = req.body.fighter_id;
  if (!fighterId) {
    return res.status(400).json({ error: 'fighter_id is required.' });
  }

  try {
    const fighter = await getOwnedFighter(fighterId, req.user.id);
    if (!fighter) {
      return res.status(404).json({ error: 'Fighter not found for this coach.' });
    }

    const enriched = await enrichFighter(fighter);
    const attendanceStats = await getAttendanceStats(fighter._id);

    const goals = await Goal.find({
      fighter_id: fighter._id,
      coach_id: req.user.id,
    }).sort({ created_at: -1 });

    const normalizedGoals = goals.map((goal) => {
      const goalObj = goal.toObject ? goal.toObject() : goal;
      return { ...goalObj, status: computeGoalStatus(goalObj) };
    });

    const ai = await getGroqCoachSummary({
      cardio: fighter.cardio,
      striking: fighter.striking,
      grappling: fighter.grappling,
      discipline: attendanceStats.disciplineScore,
      goals: normalizedGoals,
    });

    const reportText = buildFighterReport({
      fighter,
      readinessScore: enriched.readiness_score,
      disciplineScore: attendanceStats.disciplineScore,
      goals: normalizedGoals,
      aiSummary: ai.summary,
    });

    const saved = await Report.create({
      coach_id: req.user.id,
      fighter_id: fighter._id,
      report_text: reportText,
      ai_source: ai.source,
    });

    return res.status(201).json({
      ...saved.toObject(),
      readiness_score: enriched.readiness_score,
      discipline_score: attendanceStats.disciplineScore,
      goals: normalizedGoals,
      ai_summary: ai.summary,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Unexpected server error generating report.' });
  }
});

router.get('/:fighter_id', async (req, res) => {
  try {
    const fighter = await getOwnedFighter(req.params.fighter_id, req.user.id);
    if (!fighter) {
      return res.status(404).json({ error: 'Fighter not found for this coach.' });
    }

    const reports = await Report.find({
      fighter_id: req.params.fighter_id,
      coach_id: req.user.id,
    }).sort({ created_at: -1 });

    return res.json(reports);
  } catch (error) {
    return res.status(500).json({ error: 'Unexpected server error fetching reports.' });
  }
});

module.exports = router;
