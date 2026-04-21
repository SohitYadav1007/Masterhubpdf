const mongoose = require('mongoose');
const SeoSchema = new mongoose.Schema({
  tool: { type: String, required: true, unique: true, index: true },
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  keywords: { type: String, default: '' },
  h1: { type: String, default: '' },
  article: { type: String, default: '' },
}, { timestamps: true });
module.exports = mongoose.models.Seo || mongoose.model('Seo', SeoSchema);
