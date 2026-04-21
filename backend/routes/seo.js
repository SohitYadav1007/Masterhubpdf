'use strict';
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs-extra');
const { isDbConnected } = require('../db');

const dataFile = path.join(__dirname, '../data/seo.json');
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'sohityadav0211@gmail.com';

const readSeo = async () => {
  if (isDbConnected()) {
    const Seo = require('../models/Seo');
    const docs = await Seo.find({}).lean();
    const obj = {};
    docs.forEach(d => { obj[d.tool] = d; });
    return obj;
  }
  return (await fs.pathExists(dataFile)) ? fs.readJson(dataFile) : {};
};

const writeSeo = async (tool, data) => {
  if (isDbConnected()) {
    const Seo = require('../models/Seo');
    await Seo.findOneAndUpdate({ tool }, { ...data, tool }, { upsert: true, new: true });
  } else {
    const all = await readSeo();
    all[tool] = { ...all[tool], ...data, tool };
    await fs.ensureFile(dataFile);
    await fs.writeJson(dataFile, all, { spaces: 2 });
  }
};

// GET /api/seo/:tool
router.get('/:tool', async (req, res) => {
  try {
    const all = await readSeo();
    const seo = all[req.params.tool] || {};
    res.json({ tool: req.params.tool, title: seo.title || '', description: seo.description || '', keywords: seo.keywords || '', h1: seo.h1 || '', article: seo.article || '' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/seo (all - admin)
router.get('/', async (req, res) => {
  try { res.json(await readSeo()); } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/seo/:tool (admin)
router.post('/:tool', async (req, res) => {
  if (req.headers['x-user-email'] !== ADMIN_EMAIL) return res.status(403).json({ error: 'Unauthorized' });
  try {
    await writeSeo(req.params.tool, req.body);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
