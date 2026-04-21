import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import ToolLayout from '../../components/ToolLayout';
import FileDropzone from '../../components/FileDropzone';
import ResultCard from '../../components/ResultCard';
import { enhanceImage, formatBytes } from '../../lib/api';

export default function EnhanceImage() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [scale, setScale] = useState(2);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const onFile = f => { setFile(f[0]); setPreview(URL.createObjectURL(f[0])); setResult(null); };
  const handle = async () => {
    if (!file) { toast.error('Select an image'); return; }
    setLoading(true);
    const fd = new FormData(); fd.append('file', file); fd.append('scale', scale);
    try { const res = await enhanceImage(fd); setResult(res.data); toast.success('Image enhanced!'); }
    catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };
  const reset = () => { setFile(null); setPreview(null); setResult(null); };

  return (
    <ToolLayout tool="enhance-image" title="Image Enhancer" description="Upscale and sharpen images using AI-powered processing." keywords="image enhancer, upscale image, sharpen image, ai image">
      <div className="tool-page-container">
        <div className="tool-header">
          <div className="tool-icon-wrapper bg-fuchsia-100"><span className="text-3xl">✨</span></div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Image Enhancer</h1>
          <p className="text-gray-500 text-sm">Upscale and sharpen images with smart processing.</p>
        </div>
        {!result ? (<>
          {!file ? <FileDropzone onFiles={onFile} accept={{ 'image/*':['.jpg','.jpeg','.png','.webp'] }} icon="✨" label="Drop image here" /> : (
            <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} className="space-y-4">
              {preview && <div className="flex justify-center"><img src={preview} alt="" className="max-h-48 rounded-2xl shadow-md object-contain" /></div>}
              <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl px-4 py-3">
                <span>🖼️</span><div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{file.name}</p><p className="text-xs text-gray-400">{formatBytes(file.size)}</p></div>
                <button onClick={reset} className="text-gray-400 hover:text-red-500 p-1">✕</button>
              </div>
              <div className="card"><label className="label">Upscale Factor</label>
                <div className="flex gap-2">
                  {[2,3,4].map(s=><button key={s} onClick={()=>setScale(s)} className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${scale===s?'bg-primary-600 text-white':'bg-gray-100 text-gray-600'}`}>{s}×</button>)}
                </div>
              </div>
              <div className="flex gap-3 justify-center">
                <button onClick={handle} disabled={loading} className="btn-primary px-10 py-3">
                  {loading?<><span className="spinner sm"/>Enhancing...</>:<><span>✨</span>Enhance Image</>}</button>
                <button onClick={reset} className="btn-secondary py-3">Reset</button>
              </div>
            </motion.div>
          )}
        </>) : <ResultCard result={result} onReset={reset} />}
      </div>
    </ToolLayout>
  );
}
