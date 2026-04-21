const mongoose = require('mongoose');
const AnalyticsSchema = new mongoose.Schema({
  tool: { type: String, required: true },
  action: { type: String, default: 'use' },
  userId: { type: String, default: 'anonymous' },
  userEmail: { type: String, default: '' },
}, { timestamps: true });
module.exports = mongoose.models.Analytics || mongoose.model('Analytics', AnalyticsSchema);
