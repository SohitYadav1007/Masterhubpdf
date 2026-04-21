import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import ToolLayout from '../../components/ToolLayout';
import FileDropzone from '../../components/FileDropzone';
import ResultCard from '../../components/ResultCard';
import { jpgToPdf, formatBytes } from '../../lib/api';

export default function JpgToPdf() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [previews, setPreviews] = useState({});

  const onFiles = useCallback((newFiles) => {
    const items = newFiles.map(f => ({ file: f, id: Math.random().toString(36).slice(2) }));
    setFiles(prev => [...prev, ...items]);
    items.forEach(({ file, id }) => { setPreviews(p => ({ ...p, [id]: URL.createObjectURL(file) })); });
    setResult(null);
  }, []);

  const remove = (id) => { setFiles(prev => prev.filter(f => f.id !== id)); };

  const handle = async () => {
    if (!files.length) { toast.error('Add at least one image'); return; }
    setLoading(true);
    const fd = new FormData(); files.forEach(({ file }) => fd.append('files', file));
    try {
      const res = await jpgToPdf(fd); setResult(res.data); toast.success('Images converted to PDF!');
    } catch (err) { toast.error(err.message || 'Conversion failed'); }
    finally { setLoading(false); }
  };
  const reset = () => { setFiles([]); setPreviews({}); setResult(null); };

  return (
    <ToolLayout title="JPG to PDF" description="Convert JPG and PNG images into a single PDF document." keywords="jpg to pdf, image to pdf, png to pdf, photos to pdf">
      <div className="tool-page-container">
        <div className="tool-header">
          <div className="tool-icon-wrapper bg-pink-100"><span className="text-3xl">📄</span></div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Images to PDF</h1>
          <p className="text-gray-500 text-sm">Combine JPG, PNG images into a single PDF document.</p>
        </div>
        {!result ? (
          <>
            <FileDropzone onFiles={onFiles} accept={{ 'image/*': ['.jpg','.jpeg','.png','.webp'] }} multiple icon="📷" label="Drop images here" sublabel="JPG, PNG, WEBP · Add multiple files" />
            {files.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 space-y-2">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold text-sm text-gray-700">{files.length} image{files.length !== 1 ? 's' : ''} selected</p>
                </div>
                <AnimatePresence>
                  {files.map(({ file, id }, idx) => (
                    <motion.div key={id} layout initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }}
                      className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl px-4 py-2.5">
                      <span className="text-gray-400 text-xs font-bold w-5">{idx+1}</span>
                      {previews[id] && <img src={previews[id]} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />}
                      <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{file.name}</p><p className="text-xs text-gray-400">{formatBytes(file.size)}</p></div>
                      <button onClick={() => remove(id)} className="text-gray-400 hover:text-red-500 p-1 flex-shrink-0">✕</button>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                  <button onClick={handle} disabled={loading} className="btn-primary px-10 py-3">
                    {loading ? <><span className="spinner sm" />Converting...</> : <><span>📄</span>Convert to PDF</>}
                  </button>
                  <button onClick={reset} className="btn-secondary py-3">Clear All</button>
                </div>
              </motion.div>
            )}
          </>
        ) : <ResultCard result={result} onReset={reset} />}
      </div>
    </ToolLayout>
  );
}
