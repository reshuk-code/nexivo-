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

    // Check if email has reached account limit
    const hasReachedLimit = await User.hasReachedAccountLimit(email);
    if (hasReachedLimit) {
      return res.status(400).json({ 
        error: 'Account limit reached', 
        message: 'Maximum 5 accounts allowed per email address' 
      });
    }

    // Check if username is already taken
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ 
        error: 'Username taken',
        message: 'This username is already in use' 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = crypto.randomInt(100000, 999999).toString();
    const user = new User({ username, email, password: hashedPassword, phone, verificationCode });
    await user.save();
    await sendOTPEmail(email, verificationCode);
    
    // Get current account count for this email
    const accountCount = await User.countAccountsByEmail(email);
    
    res.status(201).json({ 
      message: 'Registration successful. Please verify your email.',
      accountCount,
      accountsRemaining: 5 - accountCount
    });
  } catch (err) {
    console.error('Registration error:', err);
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
    const { email, password } = req.body;
    if (!password) return res.status(400).json({ error: 'Password is required' });

    const users = await User.find({ email });
    if (!users.length) return res.status(404).json({ error: 'No account found' });

    const validUsers = [];
    for (const user of users) {
      if (!user.password) continue; // skip users with no password
      const isMatch = await user.comparePassword(password);
      if (isMatch) validUsers.push(user);
    }
    if (!validUsers.length) return res.status(401).json({ error: 'Invalid credentials' });

    if (validUsers.length > 1) {
      return res.json({
        multiple: true,
        accounts: validUsers.map(u => ({
          _id: u._id,
          username: u.username,
          email: u.email,
          profileImage: u.profileImage,
          status: u.status,
          role: u.role
        }))
      });
    }

    const user = validUsers[0];
    res.json({ user, token: generateToken(user) });
  } catch (err) {
    res.status(500).json({ error: 'Login failed', details: err.message });
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
    if (!email) return res.status(400).json({ error: 'Email is required' });
    const users = await User.find({ email }).select('_id username email profileImage');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
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