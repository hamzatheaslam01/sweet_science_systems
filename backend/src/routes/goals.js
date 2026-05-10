const express = require('express');
const Fighter = require('../models/Fighter');
const Goal = require('../models/Goal');
const { authRequired } = require('../middleware/auth');
const { computeGoalProgress, computeGoalStatus } = require('../services/scoring');

const router = express.Router();
router.use(authRequired);

async function verifyFighterOwnership(fighterId, coachId) {
  try {
    return await Fighter.findOne({ _id: fighterId, coach_id: coachId }).select('_id name');
  } catch (error) {
    return null;
  }
}

async function normalizeGoal(goal) {
  const goalObj = goal.toObject ? goal.toObject() : goal;
  const progress_pct = computeGoalProgress(goalObj);
  const status = computeGoalStatus(goalObj);
  return {
    ...goalObj,
    progress_pct,
    status,
  };
}

router.get('/', async (req, res) => {
  try {
    const goals = await Goal.find({ coach_id: req.user.id }).sort({ created_at: -1 });

    const result = await Promise.all(
      goals.map(async (goal) => {
        const fighter = await Fighter.findById(goal.fighter_id).select('name');
        const normalized = await normalizeGoal(goal);
        return {
          ...normalized,
          goal_type: goal.type,
          fighter_name: fighter?.name || 'Unknown fighter',
        };
      })
    );

    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: 'Unexpected server error fetching goals.' });
  }
});

router.post('/', async (req, res) => {
  const { fighter_id: fighterId, type, target_value: targetValue, current_value: currentValue, deadline, description } = req.body;

  if (!fighterId || !type || targetValue == null || currentValue == null) {
    return res.status(400).json({ error: 'fighter_id, type, target_value, and current_value are required.' });
  }

  try {
    const fighter = await verifyFighterOwnership(fighterId, req.user.id);
    if (!fighter) {
      return res.status(404).json({ error: 'Fighter not found for this coach.' });
    }

    const goal = await Goal.create({
      coach_id: req.user.id,
      fighter_id: fighterId,
      type,
      target_value: Number(targetValue),
      current_value: Number(currentValue),
      deadline: deadline || null,
      description: description || `${type} target`,
    });

    const normalized = await normalizeGoal(goal);
    return res.status(201).json(normalized);
  } catch (error) {
    return res.status(500).json({ error: 'Unexpected server error creating goal.' });
  }
});

router.get('/:fighter_id', async (req, res) => {
  try {
    const fighter = await verifyFighterOwnership(req.params.fighter_id, req.user.id);
    if (!fighter) {
      return res.status(404).json({ error: 'Fighter not found for this coach.' });
    }

    const goals = await Goal.find({
      fighter_id: req.params.fighter_id,
      coach_id: req.user.id,
    }).sort({ created_at: -1 });

    const normalized = await Promise.all(goals.map(normalizeGoal));
    return res.json(normalized);
  } catch (error) {
    return res.status(500).json({ error: 'Unexpected server error fetching fighter goals.' });
  }
});

router.put('/:id', async (req, res) => {
  const { target_value: targetValue, current_value: currentValue, deadline, description, type } = req.body;

  try {
    const goal = await Goal.findOne({ _id: req.params.id, coach_id: req.user.id });

    if (!goal) {
      return res.status(404).json({ error: 'Goal not found.' });
    }

    const updates = {};
    if (targetValue != null) updates.target_value = Number(targetValue);
    if (currentValue != null) updates.current_value = Number(currentValue);
    if (deadline !== undefined) updates.deadline = deadline || null;
    if (description !== undefined) updates.description = description;
    if (type !== undefined) updates.type = type;

    const updated = await Goal.findOneAndUpdate(
      { _id: req.params.id, coach_id: req.user.id },
      updates,
      { new: true }
    );

    const normalized = await normalizeGoal(updated);
    return res.json(normalized);
  } catch (error) {
    return res.status(500).json({ error: 'Unexpected server error updating goal.' });
  }
});

module.exports = router;
