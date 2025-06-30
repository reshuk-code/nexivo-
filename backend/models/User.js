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

// Static method to count accounts for an email
userSchema.statics.countAccountsByEmail = async function(email) {
  return await this.countDocuments({ email });
};

// Static method to check if email has reached account limit
userSchema.statics.hasReachedAccountLimit = async function(email) {
  const count = await this.countAccountsByEmail(email);
  return count >= 5; // Maximum 5 accounts per email
};

module.exports = mongoose.model('User', userSchema); 