'use strict';
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs-extra');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const { uploadImage } = require('../middleware/upload');

const outputsDir = path.join(__dirname, '../outputs');
fs.ensureDirSync(outputsDir);
const cleanup = (...files) => files.forEach(f => { try { if (f && fs.existsSync(f)) fs.removeSync(f); } catch {} });
const getExt = (name) => { const e=path.extname(name||'').toLowerCase(); return ['.jpg','.jpeg'].includes(e)?'jpg':'png'; };

// COMPRESS
router.post('/compress', uploadImage.single('file'), async (req, res) => {
  const file = req.file;
  try {
    if (!file) return res.status(400).json({ error: 'Image file required' });
    const targetKB = parseInt(req.body.targetKB)||0;
    const originalSize = (await fs.stat(file.path)).size;
    const ext = getExt(file.originalname);
    const outName = `compressed_${uuidv4()}.${ext}`;
    const out = path.join(outputsDir, outName);
    let finalBuffer;
    if (targetKB>0) {
      const targetBytes=targetKB*1024;
      let lo=5,hi=95,best=null;
      for (let i=0;i<12&&lo<=hi;i++) {
        const mid=Math.floor((lo+hi)/2);
        let buf;
        try {
          if (ext==='jpg') buf=await sharp(file.path).jpeg({ quality:mid, mozjpeg:true }).toBuffer();
          else buf=await sharp(file.path).png({ quality:mid, compressionLevel:9 }).toBuffer();
          if (buf.length<=targetBytes) { lo=mid+1; best=buf; } else hi=mid-1;
        } catch {}
      }
      if (!best) {
        if (ext==='jpg') best=await sharp(file.path).jpeg({ quality:5, mozjpeg:true }).toBuffer();
        else best=await sharp(file.path).png({ compressionLevel:9 }).toBuffer();
      }
      finalBuffer=best;
    } else {
      if (ext==='jpg') finalBuffer=await sharp(file.path).jpeg({ quality:70, mozjpeg:true }).toBuffer();
      else finalBuffer=await sharp(file.path).png({ compressionLevel:8 }).toBuffer();
    }
    await fs.writeFile(out, finalBuffer);
    const savings=Math.max(0,Math.round(((originalSize-finalBuffer.length)/originalSize)*100));
    res.json({ success:true, downloadUrl:`/outputs/${outName}`, filename:`compressed_masterhubpdf.${ext}`, originalSize, compressedSize:finalBuffer.length, savings });
  } catch (err) { res.status(500).json({ error:`Compression failed: ${err.message}` }); }
  finally { cleanup(file?.path); }
});

// RESIZE
router.post('/resize', uploadImage.single('file'), async (req, res) => {
  const file = req.file;
  try {
    if (!file) return res.status(400).json({ error: 'Image file required' });
    const width=parseInt(req.body.width)||null;
    const height=parseInt(req.body.height)||null;
    if (!width&&!height) return res.status(400).json({ error:'Width or height required' });
    const maintain=req.body.maintainAspect!=='false';
    const ext=getExt(file.originalname);
    const outName=`resized_${uuidv4()}.${ext}`;
    const out=path.join(outputsDir,outName);
    let inst=sharp(file.path).resize({ width:width||undefined, height:height||undefined, fit:maintain?'inside':'fill', withoutEnlargement:false });
    if (ext==='jpg') inst=inst.jpeg({ quality:92 }); else inst=inst.png({ compressionLevel:7 });
    const info=await inst.toFile(out);
    const stat=await fs.stat(out);
    res.json({ success:true, downloadUrl:`/outputs/${outName}`, filename:`resized_masterhubpdf.${ext}`, width:info.width, height:info.height, size:stat.size });
  } catch (err) { res.status(500).json({ error:`Resize failed: ${err.message}` }); }
  finally { cleanup(file?.path); }
});

// CROP
router.post('/crop', uploadImage.single('file'), async (req, res) => {
  const file = req.file;
  try {
    if (!file) return res.status(400).json({ error: 'Image file required' });
    const left=Math.max(0,parseInt(req.body.left)||0);
    const top=Math.max(0,parseInt(req.body.top)||0);
    const width=parseInt(req.body.width);
    const height=parseInt(req.body.height);
    if (!width||!height||width<1||height<1) return res.status(400).json({ error:'Valid width and height required' });
    const meta=await sharp(file.path).metadata();
    const safeL=Math.min(left,Math.max(0,(meta.width||0)-1));
    const safeT=Math.min(top,Math.max(0,(meta.height||0)-1));
    const safeW=Math.min(width,(meta.width||0)-safeL);
    const safeH=Math.min(height,(meta.height||0)-safeT);
    if (safeW<1||safeH<1) return res.status(400).json({ error:`Crop area out of bounds. Image is ${meta.width}×${meta.height}px` });
    const ext=getExt(file.originalname);
    const outName=`cropped_${uuidv4()}.${ext}`;
    const out=path.join(outputsDir,outName);
    let inst=sharp(file.path).extract({ left:safeL, top:safeT, width:safeW, height:safeH });
    if (ext==='jpg') inst=inst.jpeg({ quality:92 }); else inst=inst.png();
    const info=await inst.toFile(out);
    const stat=await fs.stat(out);
    res.json({ success:true, downloadUrl:`/outputs/${outName}`, filename:`cropped_masterhubpdf.${ext}`, width:info.width, height:info.height, size:stat.size });
  } catch (err) { res.status(500).json({ error:`Crop failed: ${err.message}` }); }
  finally { cleanup(file?.path); }
});

// JPG TO PNG
router.post('/jpg-to-png', uploadImage.single('file'), async (req, res) => {
  const file = req.file;
  try {
    if (!file) return res.status(400).json({ error: 'Image file required' });
    const outName=`converted_${uuidv4()}.png`;
    const out=path.join(outputsDir,outName);
    const info=await sharp(file.path).png({ compressionLevel:7 }).toFile(out);
    const stat=await fs.stat(out);
    res.json({ success:true, downloadUrl:`/outputs/${outName}`, filename:'converted_masterhubpdf.png', width:info.width, height:info.height, size:stat.size });
  } catch (err) { res.status(500).json({ error:`JPG to PNG failed: ${err.message}` }); }
  finally { cleanup(file?.path); }
});

// PNG TO JPG
router.post('/png-to-jpg', uploadImage.single('file'), async (req, res) => {
  const file = req.file;
  try {
    if (!file) return res.status(400).json({ error: 'Image file required' });
    const quality=Math.max(10,Math.min(100,parseInt(req.body.quality)||90));
    const outName=`converted_${uuidv4()}.jpg`;
    const out=path.join(outputsDir,outName);
    const info=await sharp(file.path).flatten({ background:{r:255,g:255,b:255} }).jpeg({ quality, mozjpeg:true }).toFile(out);
    const stat=await fs.stat(out);
    res.json({ success:true, downloadUrl:`/outputs/${outName}`, filename:'converted_masterhubpdf.jpg', width:info.width, height:info.height, size:stat.size });
  } catch (err) { res.status(500).json({ error:`PNG to JPG failed: ${err.message}` }); }
  finally { cleanup(file?.path); }
});

// TO WEBP
router.post('/to-webp', uploadImage.single('file'), async (req, res) => {
  const file = req.file;
  try {
    if (!file) return res.status(400).json({ error: 'Image file required' });
    const quality=Math.max(10,Math.min(100,parseInt(req.body.quality)||85));
    const outName=`converted_${uuidv4()}.webp`;
    const out=path.join(outputsDir,outName);
    const info=await sharp(file.path).webp({ quality }).toFile(out);
    const stat=await fs.stat(out);
    res.json({ success:true, downloadUrl:`/outputs/${outName}`, filename:'converted_masterhubpdf.webp', width:info.width, height:info.height, size:stat.size });
  } catch (err) { res.status(500).json({ error:`WEBP conversion failed: ${err.message}` }); }
  finally { cleanup(file?.path); }
});

// IMAGE ENHANCE (sharpen + upscale via sharp)
router.post('/enhance', uploadImage.single('file'), async (req, res) => {
  const file = req.file;
  try {
    if (!file) return res.status(400).json({ error: 'Image file required' });
    const scale = Math.min(parseInt(req.body.scale)||2, 4);
    const ext=getExt(file.originalname);
    const outName=`enhanced_${uuidv4()}.${ext}`;
    const out=path.join(outputsDir,outName);
    const meta=await sharp(file.path).metadata();
    let inst = sharp(file.path)
      .resize({ width: Math.min((meta.width||500)*scale, 4096), height: Math.min((meta.height||500)*scale, 4096), fit:'fill' })
      .sharpen({ sigma:1.5 })
      .normalise();
    if (ext==='jpg') inst=inst.jpeg({ quality:95 }); else inst=inst.png({ compressionLevel:6 });
    const info=await inst.toFile(out);
    const stat=await fs.stat(out);
    res.json({ success:true, downloadUrl:`/outputs/${outName}`, filename:`enhanced_masterhubpdf.${ext}`, width:info.width, height:info.height, size:stat.size });
  } catch (err) { res.status(500).json({ error:`Enhancement failed: ${err.message}` }); }
  finally { cleanup(file?.path); }
});

// BACKGROUND REMOVE (simple: alpha channel via sharp - requires bg color)
router.post('/bg-remove', uploadImage.single('file'), async (req, res) => {
  const file = req.file;
  try {
    if (!file) return res.status(400).json({ error: 'Image file required' });
    const outName=`bg_removed_${uuidv4()}.png`;
    const out=path.join(outputsDir,outName);
    // Get dominant background color and make it transparent
    const { dominant } = await sharp(file.path).stats();
    const r=dominant.r, g=dominant.g, b=dominant.b;
    const threshold=parseInt(req.body.threshold)||30;
    // Use sharp to convert and create simple transparency
    const rawBuf = await sharp(file.path).ensureAlpha().raw().toBuffer({ resolveWithObject:true });
    const { data, info:imgInfo } = rawBuf;
    const pixels=new Uint8Array(data.buffer);
    for (let i=0;i<pixels.length;i+=4) {
      const dr=Math.abs(pixels[i]-r), dg=Math.abs(pixels[i+1]-g), db=Math.abs(pixels[i+2]-b);
      if (dr<threshold && dg<threshold && db<threshold) pixels[i+3]=0;
    }
    await sharp(Buffer.from(pixels), { raw:{ width:imgInfo.width, height:imgInfo.height, channels:4 } }).png().toFile(out);
    const stat=await fs.stat(out);
    res.json({ success:true, downloadUrl:`/outputs/${outName}`, filename:'bg_removed_masterhubpdf.png', size:stat.size });
  } catch (err) { res.status(500).json({ error:`Background removal failed: ${err.message}` }); }
  finally { cleanup(file?.path); }
});

module.exports = router;
