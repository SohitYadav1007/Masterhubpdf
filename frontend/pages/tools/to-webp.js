import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import ToolLayout from '../../components/ToolLayout';
import FileDropzone from '../../components/FileDropzone';
import ResultCard from '../../components/ResultCard';
import { toWebp, formatBytes } from '../../lib/api';

export default function ToWebp() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [quality, setQuality] = useState(85);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const onFile = (files) => { setFile(files[0]); setPreview(URL.createObjectURL(files[0])); setResult(null); };
  const handle = async () => {
    if (!file) { toast.error('Please select an image'); return; }
    setLoading(true);
    const fd = new FormData(); fd.append('file', file); fd.append('quality', quality);
    try {
      const res = await toWebp(fd); setResult(res.data); toast.success('Converted to WEBP!');
    } catch (err) { toast.error(err.message || 'Conversion failed'); }
    finally { setLoading(false); }
  };
  const reset = () => { setFile(null); setPreview(null); setResult(null); };

  return (
    <ToolLayout title="Image to WEBP" description="Convert JPG, PNG to WEBP format for faster web performance." keywords="to webp, convert webp, image webp">
      <div className="tool-page-container">
        <div className="tool-header">
          <div className="tool-icon-wrapper bg-rose-100"><span className="text-3xl">🌐</span></div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Convert to WEBP</h1>
          <p className="text-gray-500 text-sm">Convert images to WEBP for smaller size and faster web loading.</p>
        </div>
        {!result ? (
          <>
            {!file ? (
              <FileDropzone onFiles={onFile} accept={{ 'image/*': ['.jpg','.jpeg','.png','.gif','.bmp'] }} icon="🌐" label="Drop image here" sublabel="JPG, PNG, GIF, BMP supported" />
            ) : (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                {preview && <div className="flex justify-center"><img src={preview} alt="" className="max-h-48 rounded-2xl shadow-md object-contain" /></div>}
                <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl px-4 py-3">
                  <span className="text-xl">🖼️</span>
                  <div className="flex-1 min-w-0"><p className="font-medium text-sm truncate">{file.name}</p><p className="text-xs text-gray-400">{formatBytes(file.size)}</p></div>
                  <button onClick={reset} className="text-gray-400 hover:text-red-500 p-1">✕</button>
                </div>
                <div className="card">
                  <label className="label">Quality: <span className="text-primary-600 font-bold">{quality}%</span></label>
                  <input type="range" min="10" max="100" value={quality} onChange={e => setQuality(parseInt(e.target.value))} className="w-full accent-primary-600 h-2" />
                  <div className="flex justify-between text-xs text-gray-400 mt-1"><span>Smaller file</span><span>Better quality</span></div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button onClick={handle} disabled={loading} className="btn-primary px-10 py-3">
                    {loading ? <><span className="spinner sm" />Converting...</> : <><span>🌐</span>Convert to WEBP</>}
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
