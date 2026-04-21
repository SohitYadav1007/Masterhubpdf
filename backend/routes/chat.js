'use strict';
const express = require('express');
const path = require('path');
const fs = require('fs-extra');
const { isDbConnected } = require('../db');

const dataPath = path.join(__dirname, '../data');
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'sohityadav0211@gmail.com';

const readChats = async () => {
  if (isDbConnected()) {
    const Chat = require('../models/Chat');
    const msgs = await Chat.find({}).sort({ createdAt: 1 }).limit(1000).lean();
    const grouped = {};
    msgs.forEach(m => {
      if (!grouped[m.userId]) grouped[m.userId] = [];
      grouped[m.userId].push({ ...m, id: m._id, timestamp: m.createdAt });
    });
    return grouped;
  }
  const f = path.join(dataPath, 'chats.json');
  return (await fs.pathExists(f)) ? fs.readJson(f) : {};
};

const saveMsg = async (msg) => {
  if (isDbConnected()) {
    const Chat = require('../models/Chat');
    return Chat.create(msg);
  }
  const f = path.join(dataPath, 'chats.json');
  const all = (await fs.pathExists(f)) ? await fs.readJson(f) : {};
  if (!all[msg.userId]) all[msg.userId] = [];
  all[msg.userId].push({ ...msg, id: Date.now(), timestamp: new Date().toISOString() });
  await fs.writeJson(f, all, { spaces: 2 });
};

module.exports = (io) => {
  const router = express.Router();

  router.get('/messages/:userId', async (req, res) => {
    try {
      const all = await readChats();
      res.json(all[req.params.userId] || []);
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  router.get('/all', async (req, res) => {
    if (req.headers['x-user-email'] !== ADMIN_EMAIL) return res.status(403).json({ error: 'Unauthorized' });
    try { res.json(await readChats()); } catch (err) { res.status(500).json({ error: err.message }); }
  });

  router.post('/send', async (req, res) => {
    try {
      const { userId, message, userName, fromAdmin } = req.body;
      if (!userId || !message) return res.status(400).json({ error: 'userId and message required' });
      const msg = { userId, userName: userName || 'User', message, fromAdmin: !!fromAdmin };
      await saveMsg(msg);
      const out = { ...msg, id: Date.now(), timestamp: new Date().toISOString() };
      if (fromAdmin) io.to(`user_${userId}`).emit('admin_message', out);
      else io.to('admin_room').emit('new_message', out);
      res.json({ success: true, message: out });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  return router;
};
