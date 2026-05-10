function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeTrainingFrequency(trainingFrequency) {
  const sessions = clamp(toNumber(trainingFrequency), 0, 14);
  return Math.round((sessions / 7) * 100);
}

function skillAveragePercent(cardio, striking, grappling) {
  const avg = (toNumber(cardio) + toNumber(striking) + toNumber(grappling)) / 3;
  return clamp(Math.round(avg * 10), 0, 100);
}

function readinessLabel(score) {
  if (score >= 70) return 'Fight-Ready';
  if (score >= 40) return 'Developing';
  return 'Beginner';
}

function disciplineLabel(score) {
  if (score >= 80) return 'High';
  if (score >= 50) return 'Moderate';
  return 'Low';
}

function computeReadinessScore({ cardio, striking, grappling, disciplineScore, trainingFrequency }) {
  const averageSkill = skillAveragePercent(cardio, striking, grappling);
  const discipline = clamp(toNumber(disciplineScore), 0, 100);
  const consistency = normalizeTrainingFrequency(trainingFrequency);
  return Math.round((averageSkill + discipline + consistency) / 3);
}

function computeGoalProgress(goal) {
  const target = toNumber(goal.target_value);
  const current = toNumber(goal.current_value);
  if (target === 0 && current === 0) return 100;

  const max = Math.max(Math.abs(target), Math.abs(current), 1);
  const diff = Math.abs(target - current);
  const progress = 100 - (diff / max) * 100;
  return clamp(Math.round(progress), 0, 100);
}

function computeGoalStatus(goal) {
  const progress = computeGoalProgress(goal);
  if (progress >= 100) return 'achieved';

  const deadline = goal.deadline ? new Date(goal.deadline) : null;
  if (!deadline || Number.isNaN(deadline.getTime())) {
    return progress >= 60 ? 'on-track' : 'behind';
  }

  const now = new Date();
  if (deadline < now) {
    return progress >= 100 ? 'achieved' : 'behind';
  }

  return progress >= 50 ? 'on-track' : 'behind';
}

module.exports = {
  computeReadinessScore,
  readinessLabel,
  disciplineLabel,
  computeGoalProgress,
  computeGoalStatus,
};
