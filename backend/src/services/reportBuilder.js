function buildFighterReport({ fighter, readinessScore, disciplineScore, goals, aiSummary }) {
  const lines = [];

  lines.push(`Fighter Report - ${fighter.name}`);
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push('');
  lines.push('Fighter Info');
  lines.push(`- Weight: ${fighter.weight_lbs || fighter.weight || 'N/A'}`);
  lines.push(`- Cardio: ${fighter.cardio}/5`);
  lines.push(`- Striking: ${fighter.striking}/5`);
  lines.push(`- Grappling: ${fighter.grappling}/5`);
  lines.push(`- Training Frequency: ${fighter.sessions_per_week || fighter.training_frequency || 0} sessions/week`);
  lines.push('');
  lines.push('Performance Summary');
  lines.push(`- Readiness Score: ${readinessScore}`);
  lines.push(`- Discipline Score: ${disciplineScore}%`);
  lines.push('');
  lines.push('Goal Progress');

  if ((goals || []).length === 0) {
    lines.push('- No active goals found.');
  } else {
    for (const goal of goals) {
      lines.push(
        `- ${goal.goal_type || goal.type}: current=${goal.current_value}, target=${goal.target_value}, status=${goal.status}`
      );
    }
  }

  lines.push('');
  lines.push('AI Coach Summary');
  lines.push(aiSummary || 'AI summary unavailable.');

  return lines.join('\n');
}

module.exports = { buildFighterReport };
