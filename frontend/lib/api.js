import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({ baseURL: API_URL, timeout: 360000 });

api.interceptors.response.use(
  res => res,
  err => Promise.reject(new Error(err.response?.data?.error || err.message || 'Network error'))
);

export const formatBytes = (bytes, d=2) => {
  if (!bytes) return '0 B';
  const k=1024, s=['B','KB','MB','GB'];
  const i=Math.floor(Math.log(bytes)/Math.log(k));
  return `${parseFloat((bytes/k**i).toFixed(d))} ${s[i]}`;
};

export const getDownloadUrl = (p) => !p ? '' : p.startsWith('http') ? p : `${API_URL}${p}`;

export const downloadFile = async (urlPath, filename) => {
  try {
    const r = await fetch(getDownloadUrl(urlPath));
    const blob = await r.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename || 'download';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  } catch { window.open(getDownloadUrl(urlPath), '_blank'); }
};

const mp = { headers: { 'Content-Type': 'multipart/form-data' } };

// PDF
export const mergePDF = fd => api.post('/api/pdf/merge', fd, mp);
export const splitPDF = fd => api.post('/api/pdf/split', fd, mp);
export const compressPDF = fd => api.post('/api/pdf/compress', fd, mp);
export const pdfToJpg = fd => api.post('/api/pdf/to-jpg', fd, mp);
export const jpgToPdf = fd => api.post('/api/pdf/from-jpg', fd, mp);
export const pdfToWord = fd => api.post('/api/pdf/to-word', fd, mp);
export const wordToPdf = fd => api.post('/api/pdf/from-word', fd, mp);
export const lockPDF = fd => api.post('/api/pdf/lock', fd, mp);
export const unlockPDF = fd => api.post('/api/pdf/unlock', fd, mp);
export const rotatePDF = fd => api.post('/api/pdf/rotate', fd, mp);
export const watermarkPDF = fd => api.post('/api/pdf/watermark', fd, mp);
export const extractImages = fd => api.post('/api/pdf/extract-images', fd, mp);
export const ocrFile = fd => api.post('/api/pdf/ocr', fd, mp);

// Image
export const compressImage = fd => api.post('/api/image/compress', fd, mp);
export const resizeImage = fd => api.post('/api/image/resize', fd, mp);
export const cropImage = fd => api.post('/api/image/crop', fd, mp);
export const jpgToPng = fd => api.post('/api/image/jpg-to-png', fd, mp);
export const pngToJpg = fd => api.post('/api/image/png-to-jpg', fd, mp);
export const toWebp = fd => api.post('/api/image/to-webp', fd, mp);
export const enhanceImage = fd => api.post('/api/image/enhance', fd, mp);
export const bgRemove = fd => api.post('/api/image/bg-remove', fd, mp);

// Document
export const txtToPdf = fd => api.post('/api/document/txt-to-pdf', fd, mp);

// Tools
export const wordCount = text => api.post('/api/tools/word-count', { text });
export const jsonFormat = (json, indent) => api.post('/api/tools/json-format', { json, indent });
export const base64Encode = text => api.post('/api/tools/base64-encode', { text });
export const base64Decode = text => api.post('/api/tools/base64-decode', { text });
export const generateQR = data => api.post('/api/tools/qr-generate', data);
export const htmlToPdf = data => api.post('/api/tools/html-to-pdf', data);

// Admin
export const getAdminConfig = () => api.get('/api/admin/config');
export const updateAdminConfig = (data, email) => api.post('/api/admin/config', data, { headers:{ 'x-user-email':email } });
export const logUser = data => api.post('/api/admin/log-user', data);
export const getUsers = email => api.get('/api/admin/users', { headers:{ 'x-user-email':email } });
export const getSystemInfo = email => api.get('/api/admin/system', { headers:{ 'x-user-email':email } });

// SEO
export const getSeo = tool => api.get(`/api/seo/${tool}`);
export const updateSeo = (tool, data, email) => api.post(`/api/seo/${tool}`, data, { headers:{ 'x-user-email':email } });
export const getAllSeo = () => api.get('/api/seo');

// Analytics
export const trackUsage = data => api.post('/api/analytics/track', data).catch(()=>{});
export const getAnalytics = email => api.get('/api/analytics/stats', { headers:{ 'x-user-email':email } });

// Chat
export const getChatMessages = userId => api.get(`/api/chat/messages/${userId}`);
export const sendChatMessage = data => api.post('/api/chat/send', data);
export const getAllChats = email => api.get('/api/chat/all', { headers:{ 'x-user-email':email } });

export default api;
