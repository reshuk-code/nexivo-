const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { isAdmin } = require('../middlewares/auth');

// Admin: Delete user
router.delete('/delete-user/:id', isAdmin, adminController.deleteUser);

// Admin: Get all join requests
router.get('/join-requests', isAdmin, adminController.getAllJoinRequests);

// Admin: Get all users
router.get('/users', isAdmin, adminController.getAllUsers);

// Admin: Subscribe to emails
router.post('/subscribe', adminController.subscribe);

// Admin: Get all subscribers
router.get('/subscribers', isAdmin, adminController.getAllSubscribers);

module.exports = router; 