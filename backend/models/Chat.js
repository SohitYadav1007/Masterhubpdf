const mongoose = require('mongoose');
const MsgSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  userName: { type: String, default: 'User' },
  message: { type: String, required: true },
  fromAdmin: { type: Boolean, default: false },
}, { timestamps: true });
module.exports = mongoose.models.Chat || mongoose.model('Chat', MsgSchema);
