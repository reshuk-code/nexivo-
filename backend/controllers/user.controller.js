const User = require('../models/User');
const { sendOTPEmail } = require('../utils/email');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { uploadToDrive } = require('../utils/googleDrive');
const jwt = require('jsonwebtoken');
const VacancyApplication = require('../models/VacancyApplication');

// Register user
exports.register = async (req, res) => {
  try {
    const { username, email, password, phone } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = crypto.randomInt(100000, 999999).toString();
    const user = new User({ username, email, password: hashedPassword, phone, verificationCode });
    await user.save();
    await sendOTPEmail(email, verificationCode);
    res.status(201).json({ message: 'Registration successful. Please verify your email.' });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed' });
  }
};

// Send OTP for login
exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const users = await User.find({ email });
    if (!users || users.length === 0) return res.status(404).json({ error: 'User not found' });
    const verificationCode = crypto.randomInt(100000, 999999).toString();
    // Set OTP for all accounts with this email
    for (const user of users) {
      user.verificationCode = verificationCode;
      await user.save();
    }
    await sendOTPEmail(email, verificationCode);
    // Return minimal info for account selection if multiple accounts
    if (users.length > 1) {
      return res.json({
        message: 'OTP sent to email',
        accounts: users.map(u => ({ _id: u._id, username: u.username, role: u.role, status: u.status }))
      });
    }
    res.json({ message: 'OTP sent to email' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send OTP' });
  }
};

// Login with email, OTP, and (if needed) username/userId
exports.login = async (req, res) => {
  try {
    const { email, code, userId } = req.body;
    let user;
    if (userId) {
      user = await User.findOne({ _id: userId, email });
    } else {
      // fallback: if only one account, use it
      const users = await User.find({ email });
      if (users.length === 1) user = users[0];
    }
    if (!user || user.verificationCode !== code) {
      return res.status(400).json({ error: 'Invalid email, code, or user selection' });
    }
    user.isVerified = true;
    user.verificationCode = null;
    await user.save();
    // Generate and return JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ message: 'Login successful', user, token });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
};

// Verify email (OTP)
exports.verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;
    const user = await User.findOne({ email });
    if (!user || user.verificationCode !== code) {
      return res.status(400).json({ error: 'Invalid code' });
    }
    user.isVerified = true;
    user.verificationCode = null;
    await user.save();
    res.json({ message: 'Email verified successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Verification failed' });
  }
};

// Edit profile (except username)
exports.editProfile = async (req, res) => {
  try {
    const { phone, password } = req.body;
    const update = {};
    
    if (phone) update.phone = phone;
    if (password) update.password = await bcrypt.hash(password, 10);
    
    // Handle profile image upload
    if (req.file) {
      try {
        console.log('Starting profile image upload...');
        const fileName = `profile_${Date.now()}_${req.file.originalname}`;
        const driveUrl = await uploadToDrive(req.file.buffer, fileName, req.file.mimetype);
        update.profileImage = driveUrl;
        console.log('Profile image upload successful:', driveUrl);
      } catch (uploadError) {
        console.error('Profile image upload error:', uploadError);
        return res.status(500).json({ 
          error: 'Failed to upload profile image', 
          details: uploadError.message 
        });
      }
    }
    
    const user = await User.findByIdAndUpdate(req.user._id, update, { new: true });
    console.log('Profile updated successfully:', user._id);
    res.json({ message: 'Profile updated', user });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ error: 'Profile update failed' });
  }
};

// Delete profile (self or admin)
exports.deleteProfile = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Account deletion failed' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all accounts for an email (for selection UI)
exports.getAccountsByEmail = async (req, res) => {
  try {
    const { email } = req.query;
    const users = await User.find({ email });
    if (!users || users.length === 0) return res.status(404).json({ error: 'No accounts found for this email' });
    res.json(users.map(u => ({ _id: u._id, username: u.username, role: u.role, status: u.status })));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch accounts' });
  }
};

// Get all enrolled vacancies/applications for the logged-in user
exports.getMyVacancyApplications = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const applications = await VacancyApplication.find({ email: user.email }).populate('vacancyId').sort({ createdAt: -1 });
    res.json(applications);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch your applications' });
  }
}; 