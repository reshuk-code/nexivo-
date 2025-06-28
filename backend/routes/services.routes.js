const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/service.controller');
const { isAdmin, isAuthenticated } = require('../middlewares/auth');
const multer = require('multer');
const upload = multer();

// Get all services
router.get('/', serviceController.getAllServices);

// Admin: Create a new service (with image upload)
router.post('/', isAuthenticated, isAdmin, upload.single('image'), serviceController.createService);

// User: Choose services
router.post('/choose', isAuthenticated, serviceController.chooseServices);

// New enrollment route
router.post('/enroll', isAuthenticated, serviceController.enrollInService);

// Admin routes
router.put('/:id', isAuthenticated, isAdmin, upload.single('image'), serviceController.updateService);
router.delete('/:id', isAuthenticated, isAdmin, serviceController.deleteService);

// Admin: Get all enrollments
router.get('/enrollments', isAuthenticated, serviceController.getAllEnrollments);

// Admin: Update enrollment status
router.patch('/enrollments/:id/status', isAuthenticated, serviceController.updateEnrollmentStatus);

module.exports = router; 