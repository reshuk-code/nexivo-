const express = require('express');
const router = express.Router();
const joinController = require('../controllers/join.controller');

// Submit join request
router.post('/register', joinController.registerJoinRequest);

// Get all join requests (for admin panel)
router.get('/', joinController.getAllJoinRequests);

module.exports = router; 