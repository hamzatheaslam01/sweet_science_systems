const Attendance = require('../models/Attendance');
const { computeReadinessScore, readinessLabel, disciplineLabel } = require('./scoring');

async function getAttendanceStats(fighterId) {
  const records = await Attendance.find({ fighter_id: fighterId }).select('attended');

  const total = records.length;
  const attended = records.filter((item) => item.attended).length;
  const disciplineScore = total ? Math.round((attended / total) * 100) : 0;

  return {
    total,
    attended,
    missed: total - attended,
    disciplineScore,
    disciplineLabel: disciplineLabel(disciplineScore),
  };
}

async function enrichFighter(fighter) {
  const fighterObj = fighter.toObject ? fighter.toObject() : fighter;
  const stats = await getAttendanceStats(fighterObj._id);

  const trainingFrequency = fighterObj.sessions_per_week || fighterObj.training_frequency || 0;
  const readinessScore = computeReadinessScore({
    cardio: fighterObj.cardio,
    striking: fighterObj.striking,
    grappling: fighterObj.grappling,
    disciplineScore: stats.disciplineScore,
    trainingFrequency,
  });

  return {
    ...fighterObj,
    id: fighterObj._id,
    training_frequency: trainingFrequency,
    discipline_score: stats.disciplineScore,
    discipline_label: stats.disciplineLabel,
    attendance_pct: stats.disciplineScore,
    readiness_score: readinessScore,
    readiness_label: readinessLabel(readinessScore),
  };
}

module.exports = {
  getAttendanceStats,
  enrichFighter,
};
