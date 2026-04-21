import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import ToolLayout from '../../components/ToolLayout';
import FileDropzone from '../../components/FileDropzone';
import ResultCard from '../../components/ResultCard';
import { pdfToWord, formatBytes } from '../../lib/api';

const STEPS = ['Uploading file...', 'Initializing OCR engine...', 'Converting pages to images...', 'Running OCR text extraction...', 'Building Word document...', 'Finalizing output...'];

export default function PdfToWord() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [step, setStep] = useState(0);
  const stepTimer = useRef(null);

  const onFile = (files) => { setFile(files[0]); setResult(null); };

  const handle = async () => {
    if (!file) { toast.error('Please select a PDF file'); return; }
    setLoading(true); setStep(0);
    let si = 0;
    stepTimer.current = setInterval(() => { si = Math.min(si + 1, STEPS.length - 1); setStep(si); }, 4000);
    const fd = new FormData(); fd.append('file', file);
    try {
      const res = await pdfToWord(fd);
      setResult(res.data); toast.success('PDF converted to Word!');
    } catch (err) { toast.error(err.message || 'Conversion failed'); }
    finally { clearInterval(stepTimer.current); setLoading(false); setStep(0); }
  };
  const reset = () => { setFile(null); setResult(null); };

  return (
    <ToolLayout title="PDF to Word" description="Convert PDF to editable Word DOCX using Tesseract OCR. Install poppler-utils for best results." keywords="pdf to word, pdf to docx, ocr pdf, extract text pdf">
      <div className="tool-page-container">
        <div className="tool-header">
          <div className="tool-icon-wrapper bg-indigo-100"><span className="text-3xl">📝</span></div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">PDF to Word</h1>
          <p className="text-gray-500 text-sm">Extract text from PDF using Tesseract OCR and export as editable Word document.</p>
        </div>
        <div className="mb-5 bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-sm text-amber-700">
          <span className="flex-shrink-0 text-lg">⚠️</span>
          <div>OCR takes 1–3 minutes for large files. For best results install: <code className="bg-amber-100 px-1 rounded">sudo apt-get install poppler-utils tesseract-ocr</code></div>
        </div>
        {!result ? (
          <>
            {!file ? (
              <FileDropzone onFiles={onFile} accept={{ 'application/pdf': ['.pdf'] }} icon="📝" label="Drop PDF here" sublabel="OCR will extract all text" />
            ) : (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl px-4 py-3">
                  <span className="text-xl">📄</span>
                  <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{file.name}</p><p className="text-xs text-gray-400">{formatBytes(file.size)}</p></div>
                  <button onClick={() => setFile(null)} className="text-gray-400 hover:text-red-500 p-1">✕</button>
                </div>
                {loading && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card text-center py-10">
                    <div className="spinner mx-auto mb-4" />
                    <p className="font-semibold text-gray-700 text-sm">{STEPS[step]}</p>
                    <p className="text-xs text-gray-400 mt-1.5">This may take 1–3 minutes for large PDFs</p>
                    <div className="progress-bar mt-4 max-w-xs mx-auto">
                      <motion.div className="progress-fill" animate={{ width: `${((step+1)/STEPS.length)*100}%` }} transition={{ duration: 0.5 }} />
                    </div>
                  </motion.div>
                )}
                {!loading && (
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button onClick={handle} className="btn-primary px-10 py-3"><span>📝</span>Convert to Word</button>
                    <button onClick={reset} className="btn-secondary py-3">Reset</button>
                  </div>
                )}
              </motion.div>
            )}
          </>
        ) : <ResultCard result={result} onReset={reset} />}
      </div>
    </ToolLayout>
  );
}
