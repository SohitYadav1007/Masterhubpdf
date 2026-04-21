import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import ToolLayout from '../../components/ToolLayout';
import FileDropzone from '../../components/FileDropzone';
import { MultiResultCard } from '../../components/ResultCard';
import { splitPDF, formatBytes } from '../../lib/api';

export default function SplitPDF() {
  const [file, setFile] = useState(null);
  const [ranges, setRanges] = useState('');
  const [mode, setMode] = useState('all');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const onFile = (files) => { setFile(files[0]); setResults(null); };
  const handle = async () => {
    if (!file) { toast.error('Please select a PDF file'); return; }
    if (mode === 'range' && !ranges.trim()) { toast.error('Enter page ranges'); return; }
    setLoading(true);
    const fd = new FormData(); fd.append('file', file);
    if (mode === 'range') fd.append('ranges', ranges);
    try {
      const res = await splitPDF(fd);
      setResults(res.data.files); toast.success(`Split into ${res.data.totalFiles} file(s)!`);
    } catch (err) { toast.error(err.message || 'Split failed'); }
    finally { setLoading(false); }
  };
  const reset = () => { setFile(null); setResults(null); setRanges(''); };

  return (
    <ToolLayout title="Split PDF" description="Split a PDF into multiple files by page range or extract individual pages." keywords="split pdf, extract pages pdf, pdf splitter">
      <div className="tool-page-container">
        <div className="tool-header">
          <div className="tool-icon-wrapper bg-purple-100"><span className="text-3xl">✂️</span></div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Split PDF</h1>
          <p className="text-gray-500 text-sm">Extract specific pages or split every page into separate files.</p>
        </div>
        {!results ? (
          <>
            {!file ? (
              <FileDropzone onFiles={onFile} accept={{ 'application/pdf': ['.pdf'] }} icon="✂️" label="Drop PDF to split" />
            ) : (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl px-4 py-3">
                  <span className="text-xl">📄</span>
                  <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{file.name}</p><p className="text-xs text-gray-400">{formatBytes(file.size)}</p></div>
                  <button onClick={() => setFile(null)} className="text-gray-400 hover:text-red-500 p-1">✕</button>
                </div>
                <div className="card space-y-3">
                  <h3 className="font-semibold text-gray-800 text-sm">Split Mode</h3>
                  <div className="flex gap-2">
                    {[['all','Extract All Pages'],['range','Custom Range']].map(([v,l]) => (
                      <button key={v} onClick={() => setMode(v)}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${mode===v ? 'bg-primary-600 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{l}</button>
                    ))}
                  </div>
                  {mode === 'range' && (
                    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}>
                      <label className="label">Page Ranges</label>
                      <input value={ranges} onChange={e => setRanges(e.target.value)} placeholder="e.g. 1-3, 4-6, 7, 9-11" className="input" />
                      <p className="text-xs text-gray-400 mt-1.5">Use ranges like "1-5" or individual pages like "3,7,9" separated by commas</p>
                    </motion.div>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button onClick={handle} disabled={loading} className="btn-primary px-10 py-3">
                    {loading ? <><span className="spinner sm" />Splitting...</> : <><span>✂️</span>Split PDF</>}
                  </button>
                  <button onClick={reset} className="btn-secondary py-3">Reset</button>
                </div>
              </motion.div>
            )}
          </>
        ) : <MultiResultCard results={results} label="PDFs" onReset={reset} />}
      </div>
    </ToolLayout>
  );
}
