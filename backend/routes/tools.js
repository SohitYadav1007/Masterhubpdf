'use strict';
const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs-extra');

const outputsDir = path.join(__dirname, '../outputs');
fs.ensureDirSync(outputsDir);

router.post('/word-count', (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.json({ words:0, chars:0, charsNoSpace:0, sentences:0, paragraphs:0, readTime:0 });
    const words = text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0;
    res.json({ words, chars: text.length, charsNoSpace: text.replace(/\s/g,'').length,
      sentences: text.split(/[.!?]+/).filter(s=>s.trim()).length,
      paragraphs: text.split(/\n\n+/).filter(p=>p.trim()).length || 1,
      readTime: Math.max(1, Math.ceil(words/200)) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/json-format', (req, res) => {
  try {
    const { json, indent=2 } = req.body;
    const parsed = JSON.parse(json);
    res.json({ success: true, formatted: JSON.stringify(parsed, null, parseInt(indent)), isValid: true });
  } catch (err) { res.json({ success: false, error: err.message, isValid: false }); }
});

router.post('/base64-encode', (req, res) => {
  try { res.json({ success: true, result: Buffer.from(req.body.text||'', 'utf8').toString('base64') }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/base64-decode', (req, res) => {
  try { res.json({ success: true, result: Buffer.from(req.body.text||'', 'base64').toString('utf8') }); }
  catch (err) { res.status(500).json({ error: 'Invalid Base64 input' }); }
});

// QR Code Generator
router.post('/qr-generate', async (req, res) => {
  try {
    const { text, size = 300, color = '#000000', bg = '#ffffff' } = req.body;
    if (!text) return res.status(400).json({ error: 'text is required' });
    const outName = `qr_${uuidv4()}.png`;
    const outPath = path.join(outputsDir, outName);
    await QRCode.toFile(outPath, text, {
      width: Math.min(parseInt(size) || 300, 1000),
      color: { dark: color || '#000000', light: bg || '#ffffff' },
      errorCorrectionLevel: 'H',
    });
    const stat = await fs.stat(outPath);
    res.json({ success: true, downloadUrl: `/outputs/${outName}`, filename: 'qrcode_masterhubpdf.png', size: stat.size });
  } catch (err) { res.status(500).json({ error: `QR generation failed: ${err.message}` }); }
});

// HTML to PDF (basic - uses puppeteer if available, else pdf-lib)
router.post('/html-to-pdf', async (req, res) => {
  try {
    const { html } = req.body;
    if (!html) return res.status(400).json({ error: 'html is required' });
    const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
    // Strip HTML tags for basic conversion
    const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const pdf = await PDFDocument.create();
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const PW = 595.28, PH = 841.89, M = 50, FS = 11, LH = FS * 1.6;
    const maxW = PW - M * 2;
    let page = pdf.addPage([PW, PH]), y = PH - M;
    const words = text.split(' ');
    let cur = '';
    for (const w of words) {
      const test = cur ? `${cur} ${w}` : w;
      if (font.widthOfTextAtSize(test, FS) > maxW && cur) {
        if (y < M + 20) { page = pdf.addPage([PW, PH]); y = PH - M; }
        page.drawText(cur, { x: M, y, size: FS, font, color: rgb(0.1,0.1,0.1) });
        y -= LH; cur = w;
      } else cur = test;
    }
    if (cur) { page.drawText(cur, { x: M, y, size: FS, font, color: rgb(0.1,0.1,0.1) }); }
    const outName = `html_to_pdf_${uuidv4()}.pdf`;
    const outPath = path.join(outputsDir, outName);
    await fs.writeFile(outPath, await pdf.save());
    const stat = await fs.stat(outPath);
    res.json({ success: true, downloadUrl: `/outputs/${outName}`, filename: 'html_to_pdf_masterhubpdf.pdf', size: stat.size });
  } catch (err) { res.status(500).json({ error: `HTML to PDF failed: ${err.message}` }); }
});

module.exports = router;
