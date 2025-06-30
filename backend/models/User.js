const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  password: { type: String }, // Required only during registration
  phone: { type: String },
  profileImage: { type: String }, // Google Drive URL
  isVerified: { type: Boolean, default: false },
  verificationCode: { type: String }, // OTP for email verification
  services: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  status: { type: String, enum: ['pending', 'verified', 'completed'], default: 'pending' }, // profile status
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema); 