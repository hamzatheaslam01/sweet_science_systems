const express = require('express');
const Fighter = require('../models/Fighter');
const Goal = require('../models/Goal');
const { authRequired } = require('../middleware/auth');
const { getAttendanceStats } = require('../services/fighterMetrics');
const { getGroqCoachSummary } = require('../services/aiCoach');

const router = express.Router();
router.use(authRequired);

router.post('/coach-feedback', async (req, res) => {
  const { fighter_id: fighterId, question } = req.body;
  if (!fighterId) {
    return res.status(400).json({ error: 'fighter_id is required.' });
  }

  try {
    const fighter = await Fighter.findOne({ _id: fighterId, coach_id: req.user.id });

    if (!fighter) {
      return res.status(404).json({ error: 'Fighter not found for this coach.' });
    }

    const stats = await getAttendanceStats(fighter._id);
    const goals = await Goal.find({
      fighter_id: fighter._id,
      coach_id: req.user.id,
    }).sort({ created_at: -1 });

    const aiResult = await getGroqCoachSummary({
      cardio: fighter.cardio,
      striking: fighter.striking,
      grappling: fighter.grappling,
      discipline: stats.disciplineScore,
      goals: goals || [],
      question: question || '',
    });

    return res.json(aiResult);
  } catch (error) {
    return res.status(502).json({ error: error.message || 'AI provider request failed.' });
  }
});

module.exports = router;
