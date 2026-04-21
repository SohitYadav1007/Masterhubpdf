const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  email: { type: String, default: '' },
  displayName: { type: String, default: '' },
  lastSeen: { type: Date, default: Date.now },
}, { timestamps: true });
module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
