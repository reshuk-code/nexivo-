const mongoose = require('mongoose');

const vacancyApplicationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  cv: { type: String, required: true }, // Google Drive file ID
  message: { type: String },
  vacancyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vacancy', required: true },
  status: { type: String, enum: ['pending', 'reviewed', 'accepted', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('VacancyApplication', vacancyApplicationSchema); 