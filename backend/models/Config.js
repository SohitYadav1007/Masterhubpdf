const mongoose = require('mongoose');
const ConfigSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed, default: null },
}, { timestamps: true });
module.exports = mongoose.models.Config || mongoose.model('Config', ConfigSchema);
