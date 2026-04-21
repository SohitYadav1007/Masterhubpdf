import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import ToolLayout from '../../components/ToolLayout';
import FileDropzone from '../../components/FileDropzone';
import ResultCard from '../../components/ResultCard';
import { compressPDF, formatBytes } from '../../lib/api';

const LEVELS = [
  { id: 'low', label: 'Low Compression', desc: 'Best quality, small savings (~printer DPI 200)', icon: '🟢' },
  { id: 'medium', label: 'Medium Compression', desc: 'Balanced quality & size (ebook DPI 150)', icon: '🟡' },
  { id: 'high', label: 'High Compression', desc: 'Maximum reduction, lower quality (screen DPI 96)', icon: '🔴' },
];

export default function CompressPDF() {
  const [file, setFile] = useState(null);
  const [level, setLevel] = useState('medium');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const onFile = (files) => { setFile(files[0]); setResult(null); };
  const handle = async () => {
    if (!file) { toast.error('Please select a PDF file'); return; }
    setLoading(true);
    const fd = new FormData(); fd.append('file', file); fd.append('level', level);
    try {
      const res = await compressPDF(fd);
      setResult(res.data);
      toast.success(`Compressed! Saved ${res.data.savings}% via ${res.data.method}`);
    } catch (err) { toast.error(err.message || 'Compression failed'); }
    finally { setLoading(false); }
  };
  const reset = () => { setFile(null); setResult(null); };

  return (
    <ToolLayout title="Compress PDF" description="Compress PDF files using Ghostscript for real size reduction. Multiple quality levels." keywords="compress pdf, reduce pdf size, pdf compressor">
      <div className="tool-page-container">
        <div className="tool-header">
          <div className="tool-icon-wrapper bg-green-100"><span className="text-3xl">🗜️</span></div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Compress PDF</h1>
          <p className="text-gray-500 text-sm">Real PDF compression using Ghostscript. Reduces images, removes metadata.</p>
        </div>
        {!result ? (
          <>
            {!file ? (
              <FileDropzone onFiles={onFile} accept={{ 'application/pdf': ['.pdf'] }} icon="🗜️" label="Drop PDF to compress" />
            ) : (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl px-4 py-3">
                  <span className="text-xl">📄</span>
                  <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{file.name}</p><p className="text-xs text-gray-400">{formatBytes(file.size)}</p></div>
                  <button onClick={() => setFile(null)} className="text-gray-400 hover:text-red-500 p-1">✕</button>
                </div>
                <div className="card space-y-2">
                  <h3 className="font-semibold text-gray-800 text-sm mb-1">Compression Level</h3>
                  {LEVELS.map(l => (
                    <button key={l.id} onClick={() => setLevel(l.id)}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${level===l.id ? 'border-primary-500 bg-primary-50' : 'border-gray-100 hover:border-gray-200'}`}>
                      <span className="text-xl flex-shrink-0">{l.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold text-sm ${level===l.id ? 'text-primary-700' : 'text-gray-800'}`}>{l.label}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{l.desc}</p>
                      </div>
                      {level === l.id && <div className="w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0">✓</div>}
                    </button>
                  ))}
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button onClick={handle} disabled={loading} className="btn-primary px-10 py-3">
                    {loading ? <><span className="spinner sm" />Compressing...</> : <><span>🗜️</span>Compress PDF</>}
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
