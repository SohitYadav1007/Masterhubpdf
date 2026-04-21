import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import ToolLayout from '../../components/ToolLayout';
import FileDropzone from '../../components/FileDropzone';
import ResultCard from '../../components/ResultCard';
import { mergePDF, formatBytes } from '../../lib/api';

export default function MergePDF() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const onFiles = useCallback((newFiles) => {
    setFiles(prev => [...prev, ...newFiles.map(f => ({ file: f, id: Math.random().toString(36).slice(2) }))]);
    setResult(null);
  }, []);

  const remove = (id) => setFiles(prev => prev.filter(f => f.id !== id));
  const moveUp = (i) => setFiles(prev => { const a=[...prev]; [a[i-1],a[i]]=[a[i],a[i-1]]; return a; });
  const moveDown = (i) => setFiles(prev => { const a=[...prev]; [a[i],a[i+1]]=[a[i+1],a[i]]; return a; });

  const handle = async () => {
    if (files.length < 2) { toast.error('Add at least 2 PDF files'); return; }
    setLoading(true);
    const fd = new FormData();
    files.forEach(({ file }) => fd.append('files', file));
    try {
      const res = await mergePDF(fd);
      setResult(res.data); toast.success('PDFs merged successfully!');
    } catch (err) { toast.error(err.message || 'Merge failed'); }
    finally { setLoading(false); }
  };

  const reset = () => { setFiles([]); setResult(null); };

  return (
    <ToolLayout title="Merge PDF" description="Combine multiple PDF files into one document. Drag to reorder pages before merging." keywords="merge pdf, combine pdf, join pdf files">
      <div className="tool-page-container">
        <div className="tool-header">
          <div className="tool-icon-wrapper bg-blue-100"><span className="text-3xl">🔗</span></div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Merge PDF Files</h1>
          <p className="text-gray-500 text-sm">Upload multiple PDFs and reorder them. We'll combine them into one document.</p>
        </div>

        {!result ? (
          <>
            <FileDropzone onFiles={onFiles} accept={{ 'application/pdf': ['.pdf'] }} multiple maxFiles={20} icon="📄" label="Drop PDF files here" sublabel="Add multiple PDFs to merge · Max 100MB each" />

            {files.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-semibold text-gray-700 text-sm">{files.length} file{files.length !== 1 ? 's' : ''} selected</p>
                  <label className="text-sm text-primary-600 hover:text-primary-800 font-semibold cursor-pointer flex items-center gap-1">
                    <span>➕</span> Add More
                    <input type="file" accept=".pdf" multiple hidden onChange={e => onFiles(Array.from(e.target.files))} />
                  </label>
                </div>
                <div className="space-y-2">
                  <AnimatePresence>
                    {files.map(({ file, id }, idx) => (
                      <motion.div key={id} layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                        className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl px-4 py-3 hover:border-primary-200 transition-colors">
                        <span className="text-gray-400 text-xs font-bold w-5 text-center flex-shrink-0">{idx + 1}</span>
                        <span className="text-red-400 flex-shrink-0">📄</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                          <p className="text-xs text-gray-400">{formatBytes(file.size)}</p>
                        </div>
                        <div className="flex items-center gap-0.5 flex-shrink-0">
                          <button disabled={idx === 0} onClick={() => moveUp(idx)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 disabled:opacity-30 transition-colors" title="Move up">▲</button>
                          <button disabled={idx === files.length-1} onClick={() => moveDown(idx)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 disabled:opacity-30 transition-colors" title="Move down">▼</button>
                          <button onClick={() => remove(id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">✕</button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
                <div className="mt-5 flex flex-col sm:flex-row gap-3 justify-center">
                  <button onClick={handle} disabled={loading || files.length < 2} className="btn-primary px-10 py-3">
                    {loading ? <><span className="spinner sm" />Merging PDFs...</> : <><span>🔗</span>Merge {files.length} PDFs</>}
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
