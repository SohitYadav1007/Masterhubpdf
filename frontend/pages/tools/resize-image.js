import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import ToolLayout from '../../components/ToolLayout';
import FileDropzone from '../../components/FileDropzone';
import ResultCard from '../../components/ResultCard';
import { resizeImage, formatBytes } from '../../lib/api';

export default function ResizeImage() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [origSize, setOrigSize] = useState({ w: 0, h: 0 });
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [lock, setLock] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const imgRef = useRef(null);

  const onFile = (files) => {
    const f = files[0]; setFile(f); setResult(null);
    const url = URL.createObjectURL(f);
    setPreview(url);
    const img = new Image();
    img.onload = () => { setOrigSize({ w: img.naturalWidth, h: img.naturalHeight }); setWidth(String(img.naturalWidth)); setHeight(String(img.naturalHeight)); };
    img.src = url;
  };

  const onWidthChange = (v) => {
    setWidth(v);
    if (lock && origSize.w && v) {
      const ratio = origSize.h / origSize.w;
      setHeight(String(Math.round(parseInt(v) * ratio) || ''));
    }
  };
  const onHeightChange = (v) => {
    setHeight(v);
    if (lock && origSize.h && v) {
      const ratio = origSize.w / origSize.h;
      setWidth(String(Math.round(parseInt(v) * ratio) || ''));
    }
  };

  const handle = async () => {
    if (!file) { toast.error('Please select an image'); return; }
    if (!width && !height) { toast.error('Enter width or height'); return; }
    setLoading(true);
    const fd = new FormData();
    fd.append('file', file);
    if (width) fd.append('width', width);
    if (height) fd.append('height', height);
    fd.append('maintainAspect', lock);
    try {
      const res = await resizeImage(fd);
      setResult(res.data);
      toast.success('Image resized!');
    } catch (err) { toast.error(err.message || 'Resize failed'); }
    finally { setLoading(false); }
  };

  const reset = () => { setFile(null); setPreview(null); setResult(null); setWidth(''); setHeight(''); };

  return (
    <ToolLayout title="Image Resizer" description="Resize images to specific dimensions with aspect ratio lock." keywords="resize image, image resizer, change image dimensions">
      <div className="tool-page-container">
        <div className="tool-header">
          <div className="tool-icon-wrapper bg-red-100"><span className="text-3xl">📐</span></div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Image Resizer</h1>
          <p className="text-gray-500 text-sm">Resize images to exact pixel dimensions with optional aspect ratio lock.</p>
        </div>

        {!result ? (
          <>
            {!file ? (
              <FileDropzone onFiles={onFile} accept={{ 'image/*': ['.jpg','.jpeg','.png','.webp'] }} icon="📐" label="Drop image here" />
            ) : (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                {preview && <div className="flex justify-center"><img src={preview} alt="Preview" className="max-h-48 rounded-2xl shadow-md object-contain" /></div>}
                {origSize.w > 0 && <p className="text-center text-xs text-gray-400">Original: {origSize.w} × {origSize.h} px · {formatBytes(file.size)}</p>}
                <div className="card space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">Width (px)</label>
                      <input value={width} onChange={e => onWidthChange(e.target.value.replace(/\D/g,''))} type="text" inputMode="numeric" placeholder="e.g. 1920" className="input" />
                    </div>
                    <div>
                      <label className="label">Height (px)</label>
                      <input value={height} onChange={e => onHeightChange(e.target.value.replace(/\D/g,''))} type="text" inputMode="numeric" placeholder="e.g. 1080" className="input" />
                    </div>
                  </div>
                  <button onClick={() => setLock(l => !l)}
                    className={`flex items-center gap-2.5 text-sm font-medium transition-colors ${lock ? 'text-primary-600' : 'text-gray-400'}`}>
                    <div className={`w-10 h-6 rounded-full transition-colors relative ${lock ? 'bg-primary-600' : 'bg-gray-200'}`}>
                      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${lock ? 'left-[18px]' : 'left-0.5'}`} />
                    </div>
                    Lock aspect ratio {origSize.w > 0 ? `(${origSize.w}:${origSize.h})` : ''}
                  </button>
                  {/* Presets */}
                  <div className="flex flex-wrap gap-2">
                    {[['HD 1280×720',1280,720],['Full HD 1920×1080',1920,1080],['Square 1:1',Math.min(origSize.w||800,800),Math.min(origSize.w||800,800)],['Thumbnail 150×150',150,150]].map(([lbl,w,h]) => (
                      <button key={lbl} onClick={() => { setWidth(String(w)); setHeight(String(h)); }}
                        className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-primary-100 hover:text-primary-700 rounded-lg transition-colors font-medium">{lbl}</button>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button onClick={handle} disabled={loading} className="btn-primary px-10 py-3">
                    {loading ? <><span className="spinner sm" />Resizing...</> : <><span>📐</span>Resize Image</>}
                  </button>
                  <button onClick={reset} className="btn-secondary py-3">Reset</button>
                </div>
              </motion.div>
            )}
          </>
        ) : <ResultCard result={result} onReset={reset} />}
      </div>
    </ToolLayout>
  );
}
