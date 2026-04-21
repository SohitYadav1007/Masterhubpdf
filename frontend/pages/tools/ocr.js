import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import ToolLayout from '../../components/ToolLayout';
import FileDropzone from '../../components/FileDropzone';
import { ocrFile } from '../../lib/api';

export default function OCRTool() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState('');

  const onFile = f => { setFile(f[0]); setText(''); };
  const handle = async () => {
    if (!file) { toast.error('Select an image or PDF'); return; }
    setLoading(true);
    const fd = new FormData(); fd.append('file', file);
    try {
      const res = await ocrFile(fd);
      setText(res.data.text || 'No text found');
      toast.success(`Extracted ${res.data.length} characters!`);
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };
  const copy = () => { navigator.clipboard.writeText(text); toast.success('Copied!'); };
  const reset = () => { setFile(null); setText(''); };

  return (
    <ToolLayout tool="ocr" title="OCR - Image/PDF to Text" description="Extract text from images and PDFs using Tesseract OCR." keywords="ocr, image to text, pdf to text, tesseract">
      <div className="tool-page-container">
        <div className="tool-header">
          <div className="tool-icon-wrapper bg-amber-100"><span className="text-3xl">🔠</span></div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">OCR Tool</h1>
          <p className="text-gray-500 text-sm">Extract text from images or scanned PDFs using Tesseract AI.</p>
        </div>
        <>
          {!file ? <FileDropzone onFiles={onFile} accept={{ 'image/*':['.jpg','.jpeg','.png'],'application/pdf':['.pdf'] }} icon="🔠" label="Drop image or PDF here" sublabel="JPG, PNG, PDF supported" /> : (
            <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} className="space-y-4">
              <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl px-4 py-3">
                <span>📄</span><div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{file.name}</p></div>
                <button onClick={reset} className="text-gray-400 hover:text-red-500 p-1">✕</button>
              </div>
              {loading && <div className="card text-center py-8"><div className="spinner mx-auto mb-3"/><p className="text-gray-600 font-medium">Running OCR...</p><p className="text-xs text-gray-400 mt-1">This may take a minute</p></div>}
              {!loading && !text && <div className="flex gap-3 justify-center">
                <button onClick={handle} className="btn-primary px-10 py-3"><span>🔠</span>Extract Text</button>
                <button onClick={reset} className="btn-secondary py-3">Reset</button>
              </div>}
              {text && (<>
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-gray-700 text-sm">Extracted Text</p>
                  <button onClick={copy} className="text-sm text-primary-600 font-semibold hover:text-primary-800">📋 Copy</button>
                </div>
                <textarea readOnly value={text} className="input h-64 resize-none font-mono text-xs leading-relaxed bg-gray-50" />
                <div className="flex gap-3 justify-center">
                  <button onClick={() => { const b=new Blob([text],{type:'text/plain'}); const a=document.createElement('a'); a.href=URL.createObjectURL(b); a.download='ocr_result.txt'; a.click(); }} className="btn-primary py-3 px-6">⬇ Download .txt</button>
                  <button onClick={reset} className="btn-secondary py-3">Process Another</button>
                </div>
              </>)}
            </motion.div>
          )}
        </>
      </div>
    </ToolLayout>
  );
}
