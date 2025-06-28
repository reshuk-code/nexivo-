const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { isAuthenticated } = require('../middlewares/auth');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// User registration
router.post('/register', userController.register);

// Send OTP for login
router.post('/send-otp', userController.sendOTP);

// Login with email and OTP
router.post('/login', userController.login);

// Verify email
router.post('/verify-email', userController.verifyEmail);

// Edit profile
router.put('/edit-profile', isAuthenticated, upload.single('profileImage'), userController.editProfile);

// Delete profile
router.delete('/delete-profile', isAuthenticated, userController.deleteProfile);

// Get profile
router.get('/profile', isAuthenticated, userController.getProfile);

module.exports = router;