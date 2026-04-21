const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs-extra');

const uploadsDir = path.join(__dirname, '../uploads');
fs.ensureDirSync(uploadsDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, `${uuidv4()}${path.extname(file.originalname).toLowerCase()}`),
});

const filterFor = (exts) => (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  cb(exts.includes(ext) ? null : new Error(`File type ${ext} not allowed`), exts.includes(ext));
};

const opts = { limits: { fileSize: 100 * 1024 * 1024 } };

module.exports = {
  uploadPDF: multer({ ...opts, storage, fileFilter: filterFor(['.pdf']) }),
  uploadImage: multer({ ...opts, limits: { fileSize: 50*1024*1024 }, storage, fileFilter: filterFor(['.jpg','.jpeg','.png','.webp','.gif','.bmp']) }),
  uploadDocument: multer({ ...opts, storage, fileFilter: filterFor(['.docx','.doc','.txt','.pdf','.jpg','.jpeg','.png']) }),
  uploadAny: multer({ ...opts, storage }),
};
