# MasterhubPDF v3.0 — 35+ PDF & Image Tools

## 🚀 Quick Start

```bash
# 1. Backend
cd backend
cp .env.example .env
# Edit .env — set MONGO_URI if you have MongoDB, leave as-is for file-only mode
npm install
npm start        # → http://localhost:5000

# 2. Frontend (new terminal)
cd frontend
npm install
npm run dev      # → http://localhost:3000
```

## ⚙️ Optional System Tools
```bash
sudo apt-get install -y ghostscript poppler-utils libreoffice qpdf tesseract-ocr
```
| Tool | Feature |
|------|---------|
| ghostscript | Real PDF compression |
| poppler-utils | PDF→JPG, OCR quality |
| libreoffice | Word→PDF |
| qpdf | Lock/Unlock PDF |
| tesseract-ocr | OCR (PDF→Word) |

## 🔐 Admin Access
Email: `sohityadav0211@gmail.com` → Admin Panel auto-activates after Google login.

## 📦 All Tools (35+)
**PDF:** Merge, Split, Compress, Lock, Unlock, Watermark, Rotate, Extract Images, OCR, PDF↔JPG, PDF↔Word  
**Image:** Compress, Resize, Crop, JPG↔PNG, WEBP, Enhance, Remove BG  
**Other:** QR Generator, Word Counter, JSON Formatter, Base64, TXT→PDF, HTML→PDF

## 🌐 Production
```bash
# Backend
PORT=5000 MONGO_URI=mongodb://... FRONTEND_URL=https://yourdomain.com node index.js

# Frontend (Vercel)
NEXT_PUBLIC_API_URL=https://your-backend.com npm run build
```
