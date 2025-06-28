const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  serviceName: { type: String, required: true },
  userType: { type: String, enum: ['individual', 'organization'], required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  companyType: { type: String },
  companyName: { type: String },
  employees: { type: String },
  turnover: { type: String },
  profession: { type: String },
  message: { type: String },
  status: { type: String, enum: ['pending', 'reviewed', 'accepted', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Enrollment', enrollmentSchema); 