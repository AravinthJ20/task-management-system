const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true, unique: true },
  role: { type: String, default: 'User' },
  passwordHash: { type: String, required: true },
  sessionTokenHash: { type: String, default: null },
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
