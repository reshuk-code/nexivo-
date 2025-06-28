const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, enum: ['Website', 'Mobile Application', 'AI/ML', 'UI/UX'], required: true },
  items: [{ type: String }], // e.g., features or sub-services
  image: { type: String }, // Google Drive file ID
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Admin
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Service', serviceSchema); 