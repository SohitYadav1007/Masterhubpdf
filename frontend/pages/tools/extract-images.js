import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import ToolLayout from '../../components/ToolLayout';
import FileDropzone from '../../components/FileDropzone';
import { MultiResultCard } from '../../components/ResultCard';
import { extractImages } from '../../lib/api';

export default function ExtractImages() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const onFile = f => { setFile(f[0]); setResults(null); };
  const handle = async () => {
    if (!file) { toast.error('Select a PDF file'); return; }
    setLoading(true);
    const fd = new FormData(); fd.append('file', file);
    try {
      const res = await extractImages(fd);
      setResults(res.data.files||[]);
      if (!res.data.files?.length) toast('No images found or install poppler-utils', { icon:'ℹ️' });
      else toast.success(`${res.data.totalFiles} image(s) extracted!`);
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };
  const reset = () => { setFile(null); setResults(null); };

  return (
    <ToolLayout tool="extract-images" title="Extract Images from PDF" description="Extract all embedded images from a PDF file." keywords="extract images pdf, pdf images, get images from pdf">
      <div className="tool-page-container">
        <div className="tool-header">
          <div className="tool-icon-wrapper bg-rose-100"><span className="text-3xl">🔍</span></div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Extract Images from PDF</h1>
          <p className="text-gray-500 text-sm">Extract all embedded images from a PDF document.</p>
        </div>
        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-xl p-3 flex gap-2 text-sm text-blue-700">
          <span>ℹ️</span><span>Requires <strong>poppler-utils</strong>: <code className="bg-blue-100 px-1 rounded">sudo apt-get install poppler-utils</code></span>
        </div>
        {!results ? (<>
          {!file ? <FileDropzone onFiles={onFile} accept={{ 'application/pdf':['.pdf'] }} icon="🔍" label="Drop PDF here" /> : (
            <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} className="space-y-4">
              <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl px-4 py-3">
                <span>📄</span><div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{file.name}</p></div>
                <button onClick={()=>setFile(null)} className="text-gray-400 hover:text-red-500 p-1">✕</button>
              </div>
              <div className="flex gap-3 justify-center">
                <button onClick={handle} disabled={loading} className="btn-primary px-10 py-3">
                  {loading?<><span className="spinner sm"/>Extracting...</>:<><span>🔍</span>Extract Images</>}</button>
                <button onClick={reset} className="btn-secondary py-3">Reset</button>
              </div>
            </motion.div>
          )}
        </>) : (results.length ? <MultiResultCard results={results} label="images" onReset={reset} /> :
          <div className="card text-center py-10">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-gray-700 font-semibold">No embedded images found</p>
            <p className="text-gray-400 text-sm mt-1">Try installing poppler-utils for better extraction</p>
            <button onClick={reset} className="btn-secondary mt-4">Try Another PDF</button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
