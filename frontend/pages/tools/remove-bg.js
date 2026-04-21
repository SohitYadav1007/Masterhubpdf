import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import ToolLayout from '../../components/ToolLayout';
import FileDropzone from '../../components/FileDropzone';
import ResultCard from '../../components/ResultCard';
import { bgRemove, formatBytes } from '../../lib/api';

export default function RemoveBG() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [threshold, setThreshold] = useState(30);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const onFile = f => { setFile(f[0]); setPreview(URL.createObjectURL(f[0])); setResult(null); };
  const handle = async () => {
    if (!file) { toast.error('Select an image'); return; }
    setLoading(true);
    const fd = new FormData(); fd.append('file', file); fd.append('threshold', threshold);
    try { const res = await bgRemove(fd); setResult(res.data); toast.success('Background removed!'); }
    catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };
  const reset = () => { setFile(null); setPreview(null); setResult(null); };

  return (
    <ToolLayout tool="remove-bg" title="Background Remover" description="Remove image background. Works best with solid color backgrounds." keywords="remove background, background remover, transparent background">
      <div className="tool-page-container">
        <div className="tool-header">
          <div className="tool-icon-wrapper bg-sky-100"><span className="text-3xl">🎭</span></div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Background Remover</h1>
          <p className="text-gray-500 text-sm">Remove solid color backgrounds from images. Output is PNG with transparency.</p>
        </div>
        {!result ? (<>
          {!file ? <FileDropzone onFiles={onFile} accept={{ 'image/*':['.jpg','.jpeg','.png'] }} icon="🎭" label="Drop image here" sublabel="Works best with plain backgrounds" /> : (
            <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} className="space-y-4">
              {preview && <div className="flex justify-center"><img src={preview} alt="" className="max-h-48 rounded-2xl shadow-md object-contain" /></div>}
              <div className="card"><label className="label">Color Tolerance: {threshold}</label>
                <input type="range" min="5" max="80" value={threshold} onChange={e=>setThreshold(parseInt(e.target.value))} className="w-full accent-primary-600 h-2" />
                <p className="text-xs text-gray-400 mt-1">Higher = remove more similar colors (use for noisy backgrounds)</p>
              </div>
              <div className="flex gap-3 justify-center">
                <button onClick={handle} disabled={loading} className="btn-primary px-10 py-3">
                  {loading?<><span className="spinner sm"/>Removing BG...</>:<><span>🎭</span>Remove Background</>}</button>
                <button onClick={reset} className="btn-secondary py-3">Reset</button>
              </div>
            </motion.div>
          )}
        </>) : <ResultCard result={result} onReset={reset} />}
      </div>
    </ToolLayout>
  );
}
