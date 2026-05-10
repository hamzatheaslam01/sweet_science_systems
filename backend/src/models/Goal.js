const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  coach_id:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fighter_id:    { type: mongoose.Schema.Types.ObjectId, ref: 'Fighter', required: true, index: true },
  type:          { type: String, required: true, enum: ['weight', 'skill', 'consistency'] },
  description:   { type: String, default: null },
  target_value:  { type: Number, required: true },
  current_value: { type: Number, required: true },
  deadline:      { type: Date,   default: null },
  created_at:    { type: Date,   default: Date.now },
  updated_at:    { type: Date,   default: Date.now },
});

goalSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updated_at: new Date() });
  next();
});

module.exports = mongoose.model('Goal', goalSchema);
