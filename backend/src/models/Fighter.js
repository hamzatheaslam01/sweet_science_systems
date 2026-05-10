const mongoose = require('mongoose');

const fighterSchema = new mongoose.Schema({
  coach_id:           { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name:               { type: String, required: true },
  weight:             { type: Number, default: null },
  weight_lbs:         { type: Number, default: null },
  weight_class:       { type: String, default: null },
  cardio:             { type: Number, required: true, min: 1, max: 10 },
  striking:           { type: Number, required: true, min: 1, max: 10 },
  grappling:          { type: Number, required: true, min: 1, max: 10 },
  training_frequency: { type: Number, default: 0 },
  sessions_per_week:  { type: Number, default: 0 },
  training_since:     { type: Number, default: null },
  photo_url:          { type: String, default: null },
  created_at:         { type: Date,   default: Date.now },
  updated_at:         { type: Date,   default: Date.now },
}, {
  timestamps: false,
});

fighterSchema.pre('save', function () {
  this.updated_at = new Date();
});

fighterSchema.pre('findOneAndUpdate', function () {
  this.set({ updated_at: new Date() });
});

module.exports = mongoose.model('Fighter', fighterSchema);
