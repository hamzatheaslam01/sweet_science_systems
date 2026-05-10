const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  coach_id:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fighter_id:  { type: mongoose.Schema.Types.ObjectId, ref: 'Fighter', required: true, index: true },
  report_text: { type: String, required: true },
  ai_source:   { type: String, default: null },
  created_at:  { type: Date,   default: Date.now },
});

module.exports = mongoose.model('Report', reportSchema);
