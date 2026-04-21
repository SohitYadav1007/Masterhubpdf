import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import ToolLayout from '../../components/ToolLayout';
import FileDropzone from '../../components/FileDropzone';
import { MultiResultCard } from '../../components/ResultCard';
import { pdfToJpg, formatBytes } from '../../lib/api';

export default function PdfToJpg() {
  const [file, setFile] = useState(null);
  const [dpi, setDpi] = useState(150);
  const [quality, setQuality] = useState(90);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const onFile = (files) => { setFile(files[0]); setResults(null); };
  const handle = async () => {
    if (!file) { toast.error('Please select a PDF'); return; }
    setLoading(true);
    const fd = new FormData(); fd.append('file', file); fd.append('dpi', dpi); fd.append('quality', quality);
    try {
      const res = await pdfToJpg(fd);
      setResults(res.data.files); toast.success(`Converted ${res.data.totalPages} page(s) to JPG!`);
    } catch (err) { toast.error(err.message || 'Conversion failed'); }
    finally { setLoading(false); }
  };
  const reset = () => { setFile(null); setResults(null); };

  return (
    <ToolLayout title="PDF to JPG" description="Convert each PDF page to a high-quality JPG image. Uses poppler for best results." keywords="pdf to jpg, pdf to image, convert pdf pages">
      <div className="tool-page-container">
        <div className="tool-header">
          <div className="tool-icon-wrapper bg-orange-100"><span className="text-3xl">🖼️</span></div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">PDF to JPG</h1>
          <p className="text-gray-500 text-sm">Convert each PDF page into a high-quality JPG image.</p>
        </div>
        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-xl p-3 flex gap-2 text-sm text-blue-700">
          <span className="flex-shrink-0">ℹ️</span>
          <span>Install <strong>poppler-utils</strong> for real PDF rendering: <code className="bg-blue-100 px-1 rounded">sudo apt-get install poppler-utils</code></span>
        </div>
        {!results ? (
          <>
            {!file ? (
              <FileDropzone onFiles={onFile} accept={{ 'application/pdf': ['.pdf'] }} icon="🖼️" label="Drop PDF here" sublabel="Each page becomes a JPG image" />
            ) : (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl px-4 py-3">
                  <span className="text-xl">📄</span>
                  <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{file.name}</p><p className="text-xs text-gray-400">{formatBytes(file.size)}</p></div>
                  <button onClick={() => setFile(null)} className="text-gray-400 hover:text-red-500 p-1">✕</button>
                </div>
                <div className="card grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Resolution (DPI)</label>
                    <select value={dpi} onChange={e => setDpi(parseInt(e.target.value))} className="input">
                      <option value={96}>96 DPI (fast)</option>
                      <option value={150}>150 DPI (balanced)</option>
                      <option value={200}>200 DPI (high)</option>
                      <option value={300}>300 DPI (best)</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Quality: {quality}%</label>
                    <input type="range" min="50" max="100" value={quality} onChange={e => setQuality(parseInt(e.target.value))} className="w-full accent-primary-600 h-2 mt-3" />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button onClick={handle} disabled={loading} className="btn-primary px-10 py-3">
                    {loading ? <><span className="spinner sm" />Converting...</> : <><span>🖼️</span>Convert to JPG</>}
                  </button>
                  <button onClick={reset} className="btn-secondary py-3">Reset</button>
                </div>
              </motion.div>
            )}
          </>
        ) : <MultiResultCard results={results} label="images" onReset={reset} />}
      </div>
    </ToolLayout>
  );
}
