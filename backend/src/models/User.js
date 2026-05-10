const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name:          { type: String, required: true },
  email:         { type: String, required: true, unique: true, lowercase: true, trim: true },
  password_hash: { type: String, required: true },
  gym_name:      { type: String, default: null },
  created_at:    { type: Date,   default: Date.now },
});

module.exports = mongoose.model('User', userSchema);
