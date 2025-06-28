const express = require('express');
const router = express.Router();
const vacancyController = require('../controllers/vacancy.controller');
const { isAdmin } = require('../middlewares/auth');
const multer = require('multer');
const upload = multer();

// Vacancy CRUD
router.get('/', vacancyController.getAllVacancies);
router.get('/:id', vacancyController.getVacancyById);
router.post('/', isAdmin, vacancyController.createVacancy);
router.put('/:id', isAdmin, vacancyController.updateVacancy);
router.delete('/:id', isAdmin, vacancyController.deleteVacancy);

// Vacancy Application
router.post('/apply', upload.single('cv'), vacancyController.applyVacancy);
router.get('/applications/all', isAdmin, vacancyController.getAllApplications);
router.patch('/applications/:id/status', isAdmin, vacancyController.updateApplicationStatus);

module.exports = router; 