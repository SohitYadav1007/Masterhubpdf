'use strict';
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs-extra');
const { isDbConnected } = require('../db');
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 60 });
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'sohityadav0211@gmail.com';
const dataFile = path.join(__dirname, '../data/analytics.json');

// POST /api/analytics/track
router.post('/track', async (req, res) => {
  try {
    const { tool, action = 'use', userId = 'anonymous', userEmail = '' } = req.body;
    if (!tool) return res.status(400).json({ error: 'tool required' });
    if (isDbConnected()) {
      const Analytics = require('../models/Analytics');
      await Analytics.create({ tool, action, userId, userEmail });
    } else {
      const logs = (await fs.pathExists(dataFile)) ? await fs.readJson(dataFile) : [];
      logs.unshift({ tool, action, userId, userEmail, timestamp: new Date().toISOString() });
      await fs.writeJson(dataFile, logs.slice(0, 5000), { spaces: 2 });
    }
    cache.del('stats');
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/analytics/stats (admin)
router.get('/stats', async (req, res) => {
  if (req.headers['x-user-email'] !== ADMIN_EMAIL) return res.status(403).json({ error: 'Unauthorized' });
  try {
    const cached = cache.get('stats');
    if (cached) return res.json(cached);

    let stats;
    if (isDbConnected()) {
      const Analytics = require('../models/Analytics');
      const total = await Analytics.countDocuments();
      const byTool = await Analytics.aggregate([{ $group: { _id: '$tool', count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 20 }]);
      const today = new Date(); today.setHours(0,0,0,0);
      const todayCount = await Analytics.countDocuments({ createdAt: { $gte: today } });
      stats = { total, today: todayCount, byTool };
    } else {
      const logs = (await fs.pathExists(dataFile)) ? await fs.readJson(dataFile) : [];
      const byTool = {};
      logs.forEach(l => { byTool[l.tool] = (byTool[l.tool] || 0) + 1; });
      const today = new Date().toDateString();
      stats = {
        total: logs.length,
        today: logs.filter(l => new Date(l.timestamp).toDateString() === today).length,
        byTool: Object.entries(byTool).map(([_id, count]) => ({ _id, count })).sort((a,b) => b.count-a.count)
      };
    }
    cache.set('stats', stats);
    res.json(stats);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
