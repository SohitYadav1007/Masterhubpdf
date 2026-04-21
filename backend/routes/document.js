const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs-extra');
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const { v4: uuidv4 } = require('uuid');
const { uploadDocument } = require('../middleware/upload');

const outputsDir = path.join(__dirname, '../outputs');
fs.ensureDirSync(outputsDir);
const cleanup = (...files) => { files.forEach(f => { try { if (f && fs.existsSync(f)) fs.removeSync(f); } catch {} }); };

router.post('/txt-to-pdf', uploadDocument.single('file'), async (req, res) => {
  const file = req.file;
  try {
    if (!file) return res.status(400).json({ error: 'Text file required' });
    const text = await fs.readFile(file.path, 'utf8');
    const pdf = await PDFDocument.create();
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const PW = 595.28, PH = 841.89, M = 50, FS = 11, LH = FS * 1.6;
    const maxW = PW - M * 2;
    let page = pdf.addPage([PW, PH]), y = PH - M;

    for (const line of text.split('\n')) {
      const t = line.trimEnd();
      if (!t) { y -= LH * 0.6; if (y < M) { page = pdf.addPage([PW, PH]); y = PH - M; } continue; }
      const words = t.split(' ');
      let cur = '';
      for (const w of words) {
        const test = cur ? `${cur} ${w}` : w;
        if (font.widthOfTextAtSize(test, FS) > maxW && cur) {
          if (y < M + 20) { page = pdf.addPage([PW, PH]); y = PH - M; }
          page.drawText(cur, { x: M, y, size: FS, font, color: rgb(0.1, 0.1, 0.1) });
          y -= LH; cur = w;
        } else cur = test;
      }
      if (cur) {
        if (y < M + 20) { page = pdf.addPage([PW, PH]); y = PH - M; }
        page.drawText(cur, { x: M, y, size: FS, font, color: rgb(0.1, 0.1, 0.1) });
        y -= LH;
      }
    }

    const outName = `txt_to_pdf_${uuidv4()}.pdf`;
    const outPath = path.join(outputsDir, outName);
    await fs.writeFile(outPath, await pdf.save());
    const stat = await fs.stat(outPath);
    res.json({ success: true, downloadUrl: `/outputs/${outName}`, filename: 'text_to_pdf_masterhubpdf.pdf', size: stat.size });
  } catch (err) {
    res.status(500).json({ error: `Conversion failed: ${err.message}` });
  } finally { cleanup(file?.path); }
});

module.exports = router;
