const mongoose = require('mongoose');

const fighterHistorySchema = new mongoose.Schema({
  fighter_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Fighter', required: true, index: true },
  field_name: { type: String, default: null },
  old_value:  { type: String, default: null },
  new_value:  { type: String, default: null },
  note:       { type: String, default: null },
  logged_at:  { type: Date,   default: Date.now },
});

module.exports = mongoose.model('FighterHistory', fighterHistorySchema);
