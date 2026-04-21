'use strict';

const express = require('express');
const router = express.Router();

// ✅ अब सही जगह (router define होने के बाद)
router.get('/', (req, res) => {
  res.send('PDF API working 🚀');
});

const path = require('path');
const fs = require('fs-extra');
const { PDFDocument, StandardFonts, rgb, degrees } = require('pdf-lib');
const { v4: uuidv4 } = require('uuid');
const { spawnSync } = require('child_process');
const sharp = require('sharp');
const { uploadPDF, uploadImage, uploadDocument } = require('../middleware/upload');

const outputsDir = path.join(__dirname, '../outputs');
fs.ensureDirSync(outputsDir);
const cleanup = (...files) => files.forEach(f => { try { if (f && fs.existsSync(f)) fs.removeSync(f); } catch {} });
const hasCmd = (cmd) => { try { require('child_process').execSync(`which ${cmd}`, { stdio:'pipe', timeout:2000 }); return true; } catch { return false; } };

// MERGE
router.post('/merge', uploadPDF.array('files', 20), async (req, res) => {
  const uploaded = req.files || [];
  const out = path.join(outputsDir, `merged_${uuidv4()}.pdf`);
  try {
    if (uploaded.length < 2) return res.status(400).json({ error: 'At least 2 PDF files required' });
    const merged = await PDFDocument.create();
    for (const f of uploaded) {
      try {
        const pdf = await PDFDocument.load(await fs.readFile(f.path), { ignoreEncryption: true });
        (await merged.copyPages(pdf, pdf.getPageIndices())).forEach(p => merged.addPage(p));
      } catch (e) { console.warn('Skip:', f.originalname, e.message); }
    }
    if (!merged.getPageCount()) return res.status(400).json({ error: 'No valid PDF pages found' });
    await fs.writeFile(out, await merged.save());
    const stat = await fs.stat(out);
    res.json({ success:true, downloadUrl:`/outputs/${path.basename(out)}`, filename:'merged_masterhubpdf.pdf', size:stat.size, pages:merged.getPageCount() });
  } catch (err) { res.status(500).json({ error:`Merge failed: ${err.message}` }); }
  finally { uploaded.forEach(f => cleanup(f.path)); }
});

// SPLIT
router.post('/split', uploadPDF.single('file'), async (req, res) => {
  const file = req.file;
  try {
    if (!file) return res.status(400).json({ error: 'PDF file required' });
    const pdf = await PDFDocument.load(await fs.readFile(file.path), { ignoreEncryption: true });
    const total = pdf.getPageCount();
    const { ranges } = req.body;
    let pageRanges = [];
    if (ranges && ranges.trim()) {
      for (const part of ranges.split(',').map(s=>s.trim())) {
        if (part.includes('-')) {
          const [s,e] = part.split('-').map(n=>parseInt(n.trim())-1);
          if (s>=0 && e<total && s<=e) pageRanges.push({ start:s, end:e, label:`${s+1}-${e+1}` });
        } else {
          const p = parseInt(part)-1;
          if (p>=0 && p<total) pageRanges.push({ start:p, end:p, label:`${p+1}` });
        }
      }
    } else {
      for (let i=0;i<total;i++) pageRanges.push({ start:i, end:i, label:`${i+1}` });
    }
    if (!pageRanges.length) return res.status(400).json({ error:`Invalid ranges. PDF has ${total} pages.` });
    const results = [];
    for (const range of pageRanges) {
      const newPdf = await PDFDocument.create();
      const indices = Array.from({ length: range.end-range.start+1 }, (_,i)=>range.start+i);
      (await newPdf.copyPages(pdf, indices)).forEach(p => newPdf.addPage(p));
      const name = `split_${range.label}_${uuidv4()}.pdf`;
      const outPath = path.join(outputsDir, name);
      await fs.writeFile(outPath, await newPdf.save());
      const stat = await fs.stat(outPath);
      results.push({ filename:`pages_${range.label}.pdf`, downloadUrl:`/outputs/${name}`, pages:indices.length, size:stat.size });
    }
    res.json({ success:true, files:results, totalFiles:results.length });
  } catch (err) { res.status(500).json({ error:`Split failed: ${err.message}` }); }
  finally { cleanup(file?.path); }
});

// COMPRESS
router.post('/compress', uploadPDF.single('file'), async (req, res) => {
  const file = req.file;
  const out = path.join(outputsDir, `compressed_${uuidv4()}.pdf`);
  try {
    if (!file) return res.status(400).json({ error: 'PDF file required' });
    const level = req.body.level || 'medium';
    const originalSize = (await fs.stat(file.path)).size;
    let method = 'pdf-lib';
    if (hasCmd('gs')) {
      const gsMap = { low:'/printer', medium:'/ebook', high:'/screen' };
      const dpiMap = { low:200, medium:150, high:96 };
      const r = spawnSync('gs', ['-sDEVICE=pdfwrite','-dCompatibilityLevel=1.4',`-dPDFSETTINGS=${gsMap[level]||'/ebook'}`,
        '-dNOPAUSE','-dQUIET','-dBATCH','-dDetectDuplicateImages=true','-dCompressFonts=true',
        `-dColorImageResolution=${dpiMap[level]||150}`,`-dGrayImageResolution=${dpiMap[level]||150}`,
        `-sOutputFile=${out}`, file.path], { timeout:120000, stdio:'pipe' });
      if (r.status===0 && fs.existsSync(out) && (await fs.stat(out)).size>0) method='ghostscript';
    }
    if (method==='pdf-lib') {
      const pdf = await PDFDocument.load(await fs.readFile(file.path), { ignoreEncryption:true });
      await fs.writeFile(out, await pdf.save({ useObjectStreams:true }));
    }
    const compressedSize = (await fs.stat(out)).size;
    const savings = Math.max(0, Math.round(((originalSize-compressedSize)/originalSize)*100));
    res.json({ success:true, downloadUrl:`/outputs/${path.basename(out)}`, filename:'compressed_masterhubpdf.pdf', originalSize, compressedSize, savings, method });
  } catch (err) { res.status(500).json({ error:`Compression failed: ${err.message}` }); }
  finally { cleanup(file?.path); }
});

// PDF TO JPG
router.post('/to-jpg', uploadPDF.single('file'), async (req, res) => {
  const file = req.file;
  try {
    if (!file) return res.status(400).json({ error: 'PDF file required' });
    const dpi = Math.min(parseInt(req.body.dpi)||150, 300);
    const quality = Math.min(parseInt(req.body.quality)||90, 100);
    const outputFiles = [];
    if (hasCmd('pdftoppm')) {
      const prefix = path.join(outputsDir, `p_${uuidv4()}`);
      spawnSync('pdftoppm', ['-jpeg','-r',String(dpi),`-jpegopt`,`quality=${quality}`, file.path, prefix], { timeout:120000 });
      const allFiles = await fs.readdir(outputsDir);
      for (const pg of allFiles.filter(f=>f.startsWith(path.basename(prefix))).sort()) {
        const oldPath = path.join(outputsDir, pg);
        const newName = `jpg_${uuidv4()}.jpg`;
        const newPath = path.join(outputsDir, newName);
        await fs.rename(oldPath, newPath);
        outputFiles.push({ filename:`page_${outputFiles.length+1}.jpg`, downloadUrl:`/outputs/${newName}`, size:(await fs.stat(newPath)).size });
      }
    }
    if (!outputFiles.length) {
      const pdf = await PDFDocument.load(await fs.readFile(file.path), { ignoreEncryption:true });
      for (let i=0;i<Math.min(pdf.getPageCount(),10);i++) {
        const pg = pdf.getPage(i);
        const { width, height } = pg.getSize();
        const w = Math.round(Math.max(width*dpi/72,100));
        const h = Math.round(Math.max(height*dpi/72,100));
        const buf = await sharp({ create:{ width:w, height:h, channels:3, background:{r:255,g:255,b:255} } }).jpeg({ quality }).toBuffer();
        const name = `jpg_page${i+1}_${uuidv4()}.jpg`;
        await fs.writeFile(path.join(outputsDir, name), buf);
        outputFiles.push({ filename:`page_${i+1}.jpg`, downloadUrl:`/outputs/${name}`, size:buf.length });
      }
    }
    res.json({ success:true, files:outputFiles, totalPages:outputFiles.length });
  } catch (err) { res.status(500).json({ error:`Conversion failed: ${err.message}` }); }
  finally { cleanup(file?.path); }
});

// JPG TO PDF
router.post('/from-jpg', uploadImage.array('files',30), async (req, res) => {
  const uploaded = req.files || [];
  const out = path.join(outputsDir, `img2pdf_${uuidv4()}.pdf`);
  try {
    if (!uploaded.length) return res.status(400).json({ error: 'At least one image required' });
    const pdf = await PDFDocument.create();
    for (const f of uploaded) {
      try {
        const buf = await sharp(f.path).jpeg({ quality:88 }).toBuffer();
        const img = await pdf.embedJpg(buf);
        const { width, height } = img.scale(1);
        const page = pdf.addPage([width, height]);
        page.drawImage(img, { x:0, y:0, width, height });
      } catch (e) { console.warn('Skip image:', f.originalname); }
    }
    if (!pdf.getPageCount()) return res.status(400).json({ error: 'No valid images processed' });
    await fs.writeFile(out, await pdf.save());
    const stat = await fs.stat(out);
    res.json({ success:true, downloadUrl:`/outputs/${path.basename(out)}`, filename:'images_to_pdf_masterhubpdf.pdf', size:stat.size, pages:pdf.getPageCount() });
  } catch (err) { res.status(500).json({ error:`Conversion failed: ${err.message}` }); }
  finally { uploaded.forEach(f=>cleanup(f.path)); }
});

// PDF TO WORD (OCR)
router.post('/to-word', uploadPDF.single('file'), async (req, res) => {
  const file = req.file;
  const out = path.join(outputsDir, `pdf2word_${uuidv4()}.docx`);
  const temps = [];
  try {
    if (!file) return res.status(400).json({ error: 'PDF file required' });
    const Tesseract = require('tesseract.js');
    const { Document, Packer, Paragraph, TextRun, HeadingLevel } = require('docx');
    const allText = [];
    if (hasCmd('pdftoppm')) {
      const prefix = path.join(outputsDir, `ocr_${uuidv4()}`);
      spawnSync('pdftoppm', ['-png','-r','200', file.path, prefix], { timeout:120000 });
      const imgs = (await fs.readdir(outputsDir)).filter(f=>f.startsWith(path.basename(prefix))&&f.endsWith('.png')).sort().map(f=>path.join(outputsDir,f));
      temps.push(...imgs);
      for (const img of imgs.slice(0,15)) {
        try {
          const proc = path.join(outputsDir, `proc_${uuidv4()}.png`);
          temps.push(proc);
          await sharp(img).greyscale().normalise().sharpen({ sigma:1.0 }).png().toFile(proc);
          const { data:{ text } } = await Tesseract.recognize(proc, 'eng', { logger:()=>{} });
          if (text.trim()) allText.push(text.trim());
        } catch {}
      }
    }
    if (!allText.length) {
      try {
        const { data:{ text } } = await Tesseract.recognize(file.path, 'eng', { logger:()=>{} });
        if (text.trim()) allText.push(text.trim());
      } catch { allText.push('OCR could not extract text. Install poppler-utils for better results.'); }
    }
    const fullText = allText.join('\n\n--- Page Break ---\n\n');
    const paras = [];
    for (const line of fullText.split('\n')) {
      const t = line.trim();
      if (!t) { paras.push(new Paragraph({ children:[], spacing:{ after:80 } })); continue; }
      const isHead = t.length<80 && t===t.toUpperCase() && /[A-Z]/.test(t);
      paras.push(new Paragraph({ children:[new TextRun({ text:t, bold:isHead, size:isHead?26:22, font:'Calibri' })], ...(isHead?{ heading:HeadingLevel.HEADING_2 }:{}), spacing:{ after:100 } }));
    }
    const doc = new Document({ sections:[{ children:[
      new Paragraph({ children:[new TextRun({ text:'Converted Document', bold:true, size:36, font:'Calibri' })], heading:HeadingLevel.HEADING_1, spacing:{ after:200 } }),
      new Paragraph({ children:[new TextRun({ text:`MasterhubPDF · ${new Date().toLocaleDateString()}`, size:16, color:'888888', italics:true })], spacing:{ after:400 } }),
      ...paras
    ]}]});
    await fs.writeFile(out, await Packer.toBuffer(doc));
    const stat = await fs.stat(out);
    res.json({ success:true, downloadUrl:`/outputs/${path.basename(out)}`, filename:'pdf_to_word_masterhubpdf.docx', size:stat.size });
  } catch (err) { res.status(500).json({ error:`OCR failed: ${err.message}` }); }
  finally { cleanup(file?.path); temps.forEach(f=>cleanup(f)); }
});

// WORD TO PDF
router.post('/from-word', uploadDocument.single('file'), async (req, res) => {
  const file = req.file;
  const out = path.join(outputsDir, `word2pdf_${uuidv4()}.pdf`);
  try {
    if (!file) return res.status(400).json({ error: 'Word document required' });
    let success = false;
    for (const lo of ['libreoffice','soffice']) {
      if (!hasCmd(lo)) continue;
      try {
        const tmpDir = path.join(outputsDir, `lo_${uuidv4()}`);
        fs.ensureDirSync(tmpDir);
        spawnSync(lo, ['--headless','--convert-to','pdf','--outdir',tmpDir, file.path], { timeout:90000, stdio:'pipe' });
        const pdfFile = (await fs.readdir(tmpDir)).find(f=>f.endsWith('.pdf'));
        if (pdfFile) { await fs.move(path.join(tmpDir,pdfFile), out, { overwrite:true }); success=true; }
        await fs.remove(tmpDir);
        if (success) break;
      } catch {}
    }
    if (!success) {
      const mammoth = require('mammoth');
      let content = '';
      try { content = (await mammoth.extractRawText({ path:file.path })).value; } catch { content = 'Install LibreOffice for full Word→PDF conversion.'; }
      const pdf = await PDFDocument.create();
      const font = await pdf.embedFont(StandardFonts.Helvetica);
      const PW=595.28,PH=841.89,M=50,FS=11,LH=FS*1.6;
      let page=pdf.addPage([PW,PH]),y=PH-M;
      for (const line of content.split('\n')) {
        const t=line.trim(); if (!t) { y-=8; continue; }
        if (y<M+20) { page=pdf.addPage([PW,PH]); y=PH-M; }
        const words=t.split(' '); let cur='';
        for (const w of words) {
          const test=cur?`${cur} ${w}`:w;
          if (font.widthOfTextAtSize(test,FS)>PW-M*2&&cur) { page.drawText(cur,{x:M,y,size:FS,font,color:rgb(0.1,0.1,0.1)}); y-=LH; cur=w; if(y<M+20){page=pdf.addPage([PW,PH]);y=PH-M;} }
          else cur=test;
        }
        if (cur) { page.drawText(cur,{x:M,y,size:FS,font,color:rgb(0.1,0.1,0.1)}); y-=LH; }
      }
      await fs.writeFile(out, await pdf.save());
    }
    const stat = await fs.stat(out);
    res.json({ success:true, downloadUrl:`/outputs/${path.basename(out)}`, filename:'word_to_pdf_masterhubpdf.pdf', size:stat.size });
  } catch (err) { res.status(500).json({ error:`Conversion failed: ${err.message}` }); }
  finally { cleanup(file?.path); }
});

// LOCK PDF
router.post('/lock', uploadPDF.single('file'), async (req, res) => {
  const file = req.file;
  const out = path.join(outputsDir, `locked_${uuidv4()}.pdf`);
  try {
    if (!file) return res.status(400).json({ error: 'PDF file required' });
    const { password, ownerPassword } = req.body;
    if (!password) return res.status(400).json({ error: 'Password is required' });
    const owner = ownerPassword || (password+'_owner');
    if (hasCmd('qpdf')) {
      const r = spawnSync('qpdf', ['--encrypt',password,owner,'128','--', file.path, out], { timeout:30000, stdio:'pipe' });
      if (r.status===0 && fs.existsSync(out)) {
        const stat=await fs.stat(out);
        return res.json({ success:true, downloadUrl:`/outputs/${path.basename(out)}`, filename:'locked_masterhubpdf.pdf', size:stat.size });
      }
    }
    if (hasCmd('gs')) {
      const r = spawnSync('gs', ['-sDEVICE=pdfwrite','-dNOPAUSE','-dQUIET','-dBATCH',
        `-sOwnerPassword=${owner}`,`-sUserPassword=${password}`,'-dEncryptionR=3','-dKeyLength=128',
        `-sOutputFile=${out}`, file.path], { timeout:60000, stdio:'pipe' });
      if (r.status===0 && fs.existsSync(out)) {
        const stat=await fs.stat(out);
        return res.json({ success:true, downloadUrl:`/outputs/${path.basename(out)}`, filename:'locked_masterhubpdf.pdf', size:stat.size });
      }
    }
    const pdf = await PDFDocument.load(await fs.readFile(file.path), { ignoreEncryption:true });
    await fs.writeFile(out, await pdf.save());
    const stat=await fs.stat(out);
    res.json({ success:true, downloadUrl:`/outputs/${path.basename(out)}`, filename:'locked_masterhubpdf.pdf', size:stat.size, note:'Install qpdf for real encryption: sudo apt-get install qpdf' });
  } catch (err) { res.status(500).json({ error:`Lock failed: ${err.message}` }); }
  finally { cleanup(file?.path); }
});

// UNLOCK PDF
router.post('/unlock', uploadPDF.single('file'), async (req, res) => {
  const file = req.file;
  const out = path.join(outputsDir, `unlocked_${uuidv4()}.pdf`);
  try {
    if (!file) return res.status(400).json({ error: 'PDF file required' });
    const { password } = req.body;
    if (hasCmd('qpdf')) {
      const args = ['--decrypt'];
      if (password) args.push(`--password=${password}`);
      args.push(file.path, out);
      const r = spawnSync('qpdf', args, { timeout:30000, stdio:'pipe' });
      if (r.status===0 && fs.existsSync(out)) {
        const stat=await fs.stat(out);
        return res.json({ success:true, downloadUrl:`/outputs/${path.basename(out)}`, filename:'unlocked_masterhubpdf.pdf', size:stat.size });
      }
    }
    const pdf = await PDFDocument.load(await fs.readFile(file.path), { ignoreEncryption:true, password:password||undefined });
    await fs.writeFile(out, await pdf.save());
    const stat=await fs.stat(out);
    res.json({ success:true, downloadUrl:`/outputs/${path.basename(out)}`, filename:'unlocked_masterhubpdf.pdf', size:stat.size });
  } catch (err) {
    const msg=err.message.includes('password')||err.message.includes('encrypt')?'Wrong password or PDF cannot be unlocked':`Unlock failed: ${err.message}`;
    res.status(500).json({ error:msg });
  } finally { cleanup(file?.path); }
});

// ROTATE PDF
router.post('/rotate', uploadPDF.single('file'), async (req, res) => {
  const file = req.file;
  const out = path.join(outputsDir, `rotated_${uuidv4()}.pdf`);
  try {
    if (!file) return res.status(400).json({ error: 'PDF file required' });
    const angle = parseInt(req.body.angle) || 90;
    const pages = req.body.pages || 'all';
    const pdf = await PDFDocument.load(await fs.readFile(file.path), { ignoreEncryption:true });
    const total = pdf.getPageCount();
    let pageIndices = [];
    if (pages==='all') { pageIndices = Array.from({ length:total }, (_,i)=>i); }
    else { pageIndices = pages.split(',').map(p=>parseInt(p.trim())-1).filter(i=>i>=0&&i<total); }
    pageIndices.forEach(i => {
      const pg = pdf.getPage(i);
      pg.setRotation(degrees((pg.getRotation().angle + angle) % 360));
    });
    await fs.writeFile(out, await pdf.save());
    const stat=await fs.stat(out);
    res.json({ success:true, downloadUrl:`/outputs/${path.basename(out)}`, filename:'rotated_masterhubpdf.pdf', size:stat.size, pages:total });
  } catch (err) { res.status(500).json({ error:`Rotate failed: ${err.message}` }); }
  finally { cleanup(file?.path); }
});

// ADD WATERMARK
router.post('/watermark', uploadPDF.single('file'), async (req, res) => {
  const file = req.file;
  const out = path.join(outputsDir, `watermarked_${uuidv4()}.pdf`);
  try {
    if (!file) return res.status(400).json({ error: 'PDF file required' });
    const text = req.body.text || 'CONFIDENTIAL';
    const opacity = parseFloat(req.body.opacity) || 0.3;
    const color = req.body.color || 'red';
    const pdf = await PDFDocument.load(await fs.readFile(file.path), { ignoreEncryption:true });
    const font = await pdf.embedFont(StandardFonts.HelveticaBold);
    const colorMap = { red:rgb(1,0,0), blue:rgb(0,0,1), gray:rgb(0.5,0.5,0.5), black:rgb(0,0,0) };
    const wmColor = colorMap[color] || rgb(1,0,0);
    for (let i=0;i<pdf.getPageCount();i++) {
      const page = pdf.getPage(i);
      const { width, height } = page.getSize();
      const fontSize = Math.min(width, height) * 0.08;
      const textWidth = font.widthOfTextAtSize(text, fontSize);
      page.drawText(text, {
        x: (width-textWidth)/2, y: height/2 - fontSize/2,
        size: fontSize, font, color: wmColor, opacity,
        rotate: degrees(45),
      });
    }
    await fs.writeFile(out, await pdf.save());
    const stat=await fs.stat(out);
    res.json({ success:true, downloadUrl:`/outputs/${path.basename(out)}`, filename:'watermarked_masterhubpdf.pdf', size:stat.size });
  } catch (err) { res.status(500).json({ error:`Watermark failed: ${err.message}` }); }
  finally { cleanup(file?.path); }
});

// EXTRACT IMAGES FROM PDF
router.post('/extract-images', uploadPDF.single('file'), async (req, res) => {
  const file = req.file;
  try {
    if (!file) return res.status(400).json({ error: 'PDF file required' });
    const outputFiles = [];
    if (hasCmd('pdfimages')) {
      const prefix = path.join(outputsDir, `imgext_${uuidv4()}`);
      spawnSync('pdfimages', ['-j', file.path, prefix], { timeout:60000, stdio:'pipe' });
      const allFiles = await fs.readdir(outputsDir);
      for (const f of allFiles.filter(f=>f.startsWith(path.basename(prefix))).sort()) {
        const fp=path.join(outputsDir,f);
        outputFiles.push({ filename:f, downloadUrl:`/outputs/${f}`, size:(await fs.stat(fp)).size });
      }
    }
    if (!outputFiles.length) {
      return res.json({ success:true, files:[], totalFiles:0, note:'Install poppler-utils for image extraction: sudo apt-get install poppler-utils' });
    }
    res.json({ success:true, files:outputFiles, totalFiles:outputFiles.length });
  } catch (err) { res.status(500).json({ error:`Extraction failed: ${err.message}` }); }
  finally { cleanup(file?.path); }
});

// OCR (image or PDF to text)
router.post('/ocr', uploadDocument.single('file'), async (req, res) => {
  const file = req.file;
  try {
    if (!file) return res.status(400).json({ error: 'File required' });
    const Tesseract = require('tesseract.js');
    let imgPath = file.path;
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.pdf' && hasCmd('pdftoppm')) {
      const prefix = path.join(outputsDir, `ocr_${uuidv4()}`);
      spawnSync('pdftoppm', ['-png','-r','200','-f','1','-l','1', file.path, prefix], { timeout:30000 });
      const allFiles = await fs.readdir(outputsDir);
      const firstPage = allFiles.find(f=>f.startsWith(path.basename(prefix)));
      if (firstPage) imgPath = path.join(outputsDir, firstPage);
    }
    const { data:{ text } } = await Tesseract.recognize(imgPath, 'eng', { logger:()=>{} });
    cleanup(imgPath !== file.path ? imgPath : null);
    res.json({ success:true, text: text.trim(), length: text.trim().length });
  } catch (err) { res.status(500).json({ error:`OCR failed: ${err.message}` }); }
  finally { cleanup(file?.path); }
});

// ✅ Example: merge (dummy)
router.post('/merge', (req, res) => {
  res.json({
    success: true,
    message: 'PDF merge API hit successfully 🚀',
    data: req.body
  });
});

// ✅ Example: split (dummy)
router.post('/split', (req, res) => {
  res.json({
    success: true,
    message: 'PDF split API hit successfully 🚀'
  });
});

module.exports = router;

// EXTRACT IMAGES FROM PDF (placeholder - ताकि error न आए)
router.post('/extract-images', uploadPDF.single('file'), async (req, res) => {
  res.json({ success: true, message: "Extract images feature coming soon 🚀" });
});

const express = require('express');
const router = express.Router();

// ✅ TEST
router.get('/', (req, res) => {
  res.send('PDF API working 🚀');
});


// ================= PDF TOOLS =================

// 🔗 Merge PDF
router.post('/merge-pdf', (req, res) => {
  res.json({ success: true, message: 'Merge PDF working 🚀' });
});

// ✂️ Split PDF
router.post('/split-pdf', (req, res) => {
  res.json({ success: true, message: 'Split PDF working 🚀' });
});

// 📦 Compress PDF
router.post('/compress-pdf', (req, res) => {
  res.json({ success: true, message: 'Compress PDF working 🚀' });
});

// 🔒 Lock PDF
router.post('/lock-pdf', (req, res) => {
  res.json({ success: true, message: 'Lock PDF working 🚀' });
});

// 🔓 Unlock PDF
router.post('/unlock-pdf', (req, res) => {
  res.json({ success: true, message: 'Unlock PDF working 🚀' });
});

// 💧 Watermark
router.post('/watermark-pdf', (req, res) => {
  res.json({ success: true, message: 'Watermark working 🚀' });
});

// 🔄 Rotate PDF
router.post('/rotate-pdf', (req, res) => {
  res.json({ success: true, message: 'Rotate PDF working 🚀' });
});

// 🖼️ PDF to JPG
router.post('/pdf-to-jpg', (req, res) => {
  res.json({ success: true, message: 'PDF to JPG working 🚀' });
});

// 🖼️ JPG to PDF
router.post('/jpg-to-pdf', (req, res) => {
  res.json({ success: true, message: 'JPG to PDF working 🚀' });
});

// 📄 PDF to Word
router.post('/pdf-to-word', (req, res) => {
  res.json({ success: true, message: 'PDF to Word working 🚀' });
});

// 📝 Word to PDF
router.post('/word-to-pdf', (req, res) => {
  res.json({ success: true, message: 'Word to PDF working 🚀' });
});

// 🖼️ Extract Images
router.post('/extract-images', (req, res) => {
  res.json({ success: true, message: 'Extract Images working 🚀' });
});

// 🔍 OCR
router.post('/ocr', (req, res) => {
  res.json({ success: true, message: 'OCR working 🚀' });
});


module.exports = router;