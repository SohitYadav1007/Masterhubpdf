'use strict';
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs-extra');
const { execSync } = require('child_process');
const { isDbConnected } = require('../db');
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 30 });

const dataPath = path.join(__dirname, '../data');
fs.ensureDirSync(dataPath);
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'sohityadav0211@gmail.com';
const isAdmin = (req) => req.headers['x-user-email'] === ADMIN_EMAIL;

const readJson = async (file, def) => {
  const p = path.join(dataPath, file);
  return (await fs.pathExists(p)) ? fs.readJson(p) : def;
};
const writeJson = async (file, data) => {
  await fs.ensureDir(dataPath);
  await fs.writeJson(path.join(dataPath, file), data, { spaces: 2 });
};

// ─── CONFIG ───────────────────────────────────────────────────────────────────
router.get('/config', async (req, res) => {
  try {
    let config;
    if (isDbConnected()) {
      const Config = require('../models/Config');
      const doc = await Config.findOne({ key: 'site_config' }).lean();
      config = doc?.value || {};
    } else {
      config = await readJson('config.json', {});
    }
    const defaults = {
      announcement: '', announcementActive: false, siteName: 'MasterhubPDF',
      seoTitle: 'MasterhubPDF - Free PDF & Image Tools', seoDescription: '', seoKeywords: '',
      toolsEnabled: {}, maintenanceMode: false,
    };
    res.json({ ...defaults, ...config });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/config', async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: 'Unauthorized' });
  try {
    let existing = {};
    if (isDbConnected()) {
      const Config = require('../models/Config');
      const doc = await Config.findOne({ key: 'site_config' }).lean();
      existing = doc?.value || {};
      const updated = { ...existing, ...req.body, updatedAt: new Date().toISOString() };
      await Config.findOneAndUpdate({ key: 'site_config' }, { value: updated }, { upsert: true });
      res.json({ success: true, config: updated });
    } else {
      existing = await readJson('config.json', {});
      const updated = { ...existing, ...req.body, updatedAt: new Date().toISOString() };
      await writeJson('config.json', updated);
      res.json({ success: true, config: updated });
    }
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── USER MANAGEMENT ──────────────────────────────────────────────────────────
router.post('/log-user', async (req, res) => {
  try {
    const { uid, email, displayName } = req.body;
    if (!uid) return res.status(400).json({ error: 'uid required' });
    if (isDbConnected()) {
      const User = require('../models/User');
      await User.findOneAndUpdate({ uid }, { uid, email, displayName, lastSeen: new Date() }, { upsert: true });
    } else {
      const users = await readJson('users.json', {});
      users[uid] = { uid, email, displayName, lastSeen: new Date().toISOString(), firstSeen: users[uid]?.firstSeen || new Date().toISOString() };
      await writeJson('users.json', users);
    }
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/users', async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: 'Unauthorized' });
  try {
    if (isDbConnected()) {
      const User = require('../models/User');
      const users = await User.find({}).sort({ lastSeen: -1 }).limit(200).lean();
      res.json(users);
    } else {
      res.json(Object.values(await readJson('users.json', {})));
    }
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── SYSTEM MONITOR ───────────────────────────────────────────────────────────
router.get('/system', async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: 'Unauthorized' });
  try {
    const cached = cache.get('system');
    if (cached) return res.json(cached);

    const checkCmd = (cmd) => {
      try { execSync(`which ${cmd}`, { stdio: 'pipe', timeout: 3000 }); return true; }
      catch { return false; }
    };
    const tools = {
      ghostscript: { installed: checkCmd('gs'), cmd: 'gs', desc: 'PDF compression', install: 'sudo apt-get install ghostscript' },
      poppler: { installed: checkCmd('pdftoppm'), cmd: 'pdftoppm', desc: 'PDF→JPG conversion', install: 'sudo apt-get install poppler-utils' },
      libreoffice: { installed: checkCmd('libreoffice') || checkCmd('soffice'), cmd: 'libreoffice', desc: 'Word↔PDF', install: 'sudo apt-get install libreoffice' },
      qpdf: { installed: checkCmd('qpdf'), cmd: 'qpdf', desc: 'Lock/Unlock PDF', install: 'sudo apt-get install qpdf' },
      tesseract: { installed: checkCmd('tesseract'), cmd: 'tesseract', desc: 'OCR (PDF→Word)', install: 'sudo apt-get install tesseract-ocr' },
      imagemagick: { installed: checkCmd('convert'), cmd: 'convert', desc: 'Image processing', install: 'sudo apt-get install imagemagick' },
    };
    const info = {
      node: process.version, platform: process.platform,
      uptime: Math.round(process.uptime()),
      memory: process.memoryUsage(),
      db: isDbConnected() ? 'connected' : 'file-only',
      tools,
    };
    cache.set('system', info);
    res.json(info);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
