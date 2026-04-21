import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import ToolLayout from '../../components/ToolLayout';
import FileDropzone from '../../components/FileDropzone';
import ResultCard from '../../components/ResultCard';
import { wordToPdf, formatBytes } from '../../lib/api';

export default function WordToPdf() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const onFile = (files) => { setFile(files[0]); setResult(null); };
  const handle = async () => {
    if (!file) { toast.error('Please select a Word document'); return; }
    setLoading(true);
    const fd = new FormData(); fd.append('file', file);
    try {
      const res = await wordToPdf(fd); setResult(res.data); toast.success('Word converted to PDF!');
    } catch (err) { toast.error(err.message || 'Conversion failed'); }
    finally { setLoading(false); }
  };
  const reset = () => { setFile(null); setResult(null); };

  return (
    <ToolLayout title="Word to PDF" description="Convert Word DOCX documents to PDF. Uses LibreOffice for best formatting." keywords="word to pdf, docx to pdf, convert word document">
      <div className="tool-page-container">
        <div className="tool-header">
          <div className="tool-icon-wrapper bg-teal-100"><span className="text-3xl">📑</span></div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Word to PDF</h1>
          <p className="text-gray-500 text-sm">Convert DOCX/DOC Word documents to PDF format.</p>
        </div>
        <div className="mb-5 bg-blue-50 border border-blue-200 rounded-xl p-3 flex gap-2 text-sm text-blue-700">
          <span>ℹ️</span><span>Install <strong>LibreOffice</strong> for best quality: <code className="bg-blue-100 px-1 rounded">sudo apt-get install libreoffice</code></span>
        </div>
        {!result ? (
          <>
            {!file ? (
              <FileDropzone onFiles={onFile}
                accept={{ 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'], 'application/msword': ['.doc'] }}
                icon="📑" label="Drop Word file here" sublabel=".docx and .doc supported" />
            ) : (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl px-4 py-3">
                  <span className="text-xl">📝</span>
                  <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{file.name}</p><p className="text-xs text-gray-400">{formatBytes(file.size)}</p></div>
                  <button onClick={() => setFile(null)} className="text-gray-400 hover:text-red-500 p-1">✕</button>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button onClick={handle} disabled={loading} className="btn-primary px-10 py-3">
                    {loading ? <><span className="spinner sm" />Converting...</> : <><span>📑</span>Convert to PDF</>}
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
