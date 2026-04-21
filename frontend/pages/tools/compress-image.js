import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import ToolLayout from '../../components/ToolLayout';
import FileDropzone from '../../components/FileDropzone';
import ResultCard from '../../components/ResultCard';
import { compressImage, formatBytes } from '../../lib/api';

export default function CompressImage() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [targetKB, setTargetKB] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const onFile = (files) => {
    const f = files[0];
    setFile(f); setResult(null);
    setPreview(URL.createObjectURL(f));
  };

  const handle = async () => {
    if (!file) { toast.error('Please select an image'); return; }
    setLoading(true);
    const fd = new FormData();
    fd.append('file', file);
    if (targetKB) fd.append('targetKB', targetKB);
    try {
      const res = await compressImage(fd);
      setResult(res.data);
      toast.success(`Compressed! Saved ${res.data.savings}%`);
    } catch (err) { toast.error(err.message || 'Compression failed'); }
    finally { setLoading(false); }
  };

  const reset = () => { setFile(null); setPreview(null); setResult(null); setTargetKB(''); };

  return (
    <ToolLayout title="Compress Image" description="Compress images accurately to target file size using binary search. Supports JPG, PNG, WEBP." keywords="compress image, reduce image size, image optimizer, target size">
      <div className="tool-page-container">
        <div className="tool-header">
          <div className="tool-icon-wrapper bg-yellow-100"><span className="text-3xl">📷</span></div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Image Compressor</h1>
          <p className="text-gray-500 text-sm">Compress images with accurate target size control using binary search algorithm.</p>
        </div>

        {!result ? (
          <>
            {!file ? (
              <FileDropzone onFiles={onFile} accept={{ 'image/*': ['.jpg','.jpeg','.png','.webp'] }} icon="📷" label="Drop image here" sublabel="JPG, PNG, WEBP supported · Max 50MB" />
            ) : (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                {preview && (
                  <div className="flex justify-center">
                    <img src={preview} alt="Preview" className="max-h-52 rounded-2xl shadow-md object-contain border border-gray-100" />
                  </div>
                )}
                <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl px-4 py-3">
                  <span className="text-xl">🖼️</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate text-sm">{file.name}</p>
                    <p className="text-xs text-gray-400">{formatBytes(file.size)}</p>
                  </div>
                  <button onClick={reset} className="text-gray-400 hover:text-red-500 transition-colors p-1">✕</button>
                </div>

                <div className="card space-y-3">
                  <div>
                    <label className="label">Target Size (KB) — Optional</label>
                    <input value={targetKB} onChange={e => setTargetKB(e.target.value.replace(/\D/g,''))}
                      type="text" inputMode="numeric" placeholder="e.g. 200 — leave blank for auto 70% quality"
                      className="input" />
                    <p className="text-xs text-gray-400 mt-1.5">
                      {targetKB ? `Binary search will find best quality to hit ~${targetKB}KB` : 'Auto mode applies 70% quality for a good balance'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button onClick={handle} disabled={loading} className="btn-primary px-10 py-3">
                    {loading ? <><span className="spinner sm" />Compressing...</> : <><span>🗜️</span>Compress Image</>}
                  </button>
                  <button onClick={reset} className="btn-secondary py-3">Reset</button>
                </div>
              </motion.div>
            )}
          </>
        ) : <ResultCard result={result} onReset={reset} />}

        <div className="mt-10 card text-sm text-gray-500 space-y-1">
          <h2 className="font-bold text-gray-700 mb-2">How it works</h2>
          <p>Our binary search algorithm finds the exact quality setting that hits your target file size, maximizing output quality. Supports JPG (mozjpeg), PNG, and WEBP formats.</p>
        </div>
      </div>
    </ToolLayout>
  );
}
