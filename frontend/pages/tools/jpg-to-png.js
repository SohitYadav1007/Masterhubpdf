import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import ToolLayout from '../../components/ToolLayout';
import FileDropzone from '../../components/FileDropzone';
import ResultCard from '../../components/ResultCard';
import { jpgToPng, formatBytes } from '../../lib/api';

export default function JpgToPng() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const onFile = (files) => { setFile(files[0]); setPreview(URL.createObjectURL(files[0])); setResult(null); };
  const handle = async () => {
    if (!file) { toast.error('Please select a JPG image'); return; }
    setLoading(true);
    const fd = new FormData(); fd.append('file', file);
    try {
      const res = await jpgToPng(fd);
      setResult(res.data); toast.success('Converted to PNG!');
    } catch (err) { toast.error(err.message || 'Conversion failed'); }
    finally { setLoading(false); }
  };
  const reset = () => { setFile(null); setPreview(null); setResult(null); };

  return (
    <ToolLayout title="JPG to PNG" description="Convert JPG/JPEG images to PNG with transparency support." keywords="jpg to png, jpeg to png, convert jpg png">
      <div className="tool-page-container">
        <div className="tool-header">
          <div className="tool-icon-wrapper bg-cyan-100"><span className="text-3xl">🔄</span></div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">JPG to PNG</h1>
          <p className="text-gray-500 text-sm">Convert JPG or JPEG images to lossless PNG format.</p>
        </div>
        {!result ? (
          <>
            {!file ? (
              <FileDropzone onFiles={onFile} accept={{ 'image/jpeg': ['.jpg','.jpeg'], 'image/*': ['.jpg','.jpeg'] }} icon="🔄" label="Drop JPG/JPEG image here" />
            ) : (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                {preview && <div className="flex justify-center"><img src={preview} alt="" className="max-h-48 rounded-2xl shadow-md object-contain" /></div>}
                <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl px-4 py-3">
                  <span className="text-xl">🖼️</span>
                  <div className="flex-1 min-w-0"><p className="font-medium text-sm truncate">{file.name}</p><p className="text-xs text-gray-400">{formatBytes(file.size)}</p></div>
                  <button onClick={reset} className="text-gray-400 hover:text-red-500 p-1">✕</button>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button onClick={handle} disabled={loading} className="btn-primary px-10 py-3">
                    {loading ? <><span className="spinner sm" />Converting...</> : <><span>🔄</span>Convert to PNG</>}
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
