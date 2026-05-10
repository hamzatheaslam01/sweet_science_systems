const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  coach_id:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fighter_id:   { type: mongoose.Schema.Types.ObjectId, ref: 'Fighter', required: true },
  session_date: { type: String, required: true },
  attended:     { type: Boolean, required: true },
  status:       { type: String, required: true, enum: ['present', 'absent'] },
  note:         { type: String, default: null },
  created_at:   { type: Date,   default: Date.now },
});

attendanceSchema.index({ fighter_id: 1, session_date: -1 });
attendanceSchema.index({ fighter_id: 1, session_date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
