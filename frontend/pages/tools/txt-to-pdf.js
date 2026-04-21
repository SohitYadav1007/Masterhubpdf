import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import ToolLayout from '../../components/ToolLayout';
import FileDropzone from '../../components/FileDropzone';
import ResultCard from '../../components/ResultCard';
import { txtToPdf } from '../../lib/api';

export default function TxtToPdf() {
  const [file, setFile] = useState(null);
  const [text, setText] = useState('');
  const [mode, setMode] = useState('file');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handle = async () => {
    setLoading(true);
    const fd = new FormData();
    if (mode === 'file') {
      if (!file) { toast.error('Select a TXT file'); setLoading(false); return; }
      fd.append('file', file);
    } else {
      if (!text.trim()) { toast.error('Enter some text'); setLoading(false); return; }
      fd.append('file', new Blob([text], { type: 'text/plain' }), 'input.txt');
    }
    try {
      const res = await txtToPdf(fd); setResult(res.data); toast.success('Converted to PDF!');
    } catch (err) { toast.error(err.message || 'Conversion failed'); }
    finally { setLoading(false); }
  };
  const reset = () => { setFile(null); setResult(null); setText(''); };

  return (
    <ToolLayout title="TXT to PDF" description="Convert plain text files or typed text to PDF format." keywords="txt to pdf, text to pdf, convert text file">
      <div className="tool-page-container">
        <div className="tool-header">
          <div className="tool-icon-wrapper bg-fuchsia-100"><span className="text-3xl">📃</span></div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">TXT to PDF</h1>
          <p className="text-gray-500 text-sm">Convert plain text files or paste text directly to PDF.</p>
        </div>
        {!result ? (
          <>
            <div className="flex gap-1.5 mb-5 p-1 bg-gray-100 rounded-2xl w-fit mx-auto">
              {[['file','📁 Upload File'],['text','✏️ Type Text']].map(([v,l]) => (
                <button key={v} onClick={() => setMode(v)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${mode===v ? 'bg-white shadow text-primary-700' : 'text-gray-500 hover:text-gray-700'}`}>{l}</button>
              ))}
            </div>
            {mode === 'file' ? (
              !file ? (
                <FileDropzone onFiles={f => { setFile(f[0]); setResult(null); }} accept={{ 'text/plain': ['.txt'] }} icon="📃" label="Drop TXT file here" />
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl px-4 py-3">
                  <span className="text-xl">📃</span>
                  <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{file.name}</p></div>
                  <button onClick={() => setFile(null)} className="text-gray-400 hover:text-red-500 p-1">✕</button>
                </motion.div>
              )
            ) : (
              <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Type or paste your text here..." className="input h-56 resize-none" />
            )}
            {(file || text.trim()) && (
              <div className="mt-5 flex flex-col sm:flex-row gap-3 justify-center">
                <button onClick={handle} disabled={loading} className="btn-primary px-10 py-3">
                  {loading ? <><span className="spinner sm" />Converting...</> : <><span>📃</span>Convert to PDF</>}
                </button>
                <button onClick={reset} className="btn-secondary py-3">Reset</button>
              </div>
            )}
          </>
        ) : <ResultCard result={result} onReset={reset} />}
      </div>
    </ToolLayout>
  );
}
