import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import ToolLayout from '../../components/ToolLayout';
import FileDropzone from '../../components/FileDropzone';
import ResultCard from '../../components/ResultCard';
import { watermarkPDF, formatBytes } from '../../lib/api';

export default function WatermarkPDF() {
  const [file, setFile] = useState(null);
  const [text, setText] = useState('CONFIDENTIAL');
  const [color, setColor] = useState('red');
  const [opacity, setOpacity] = useState(0.3);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const onFile = f => { setFile(f[0]); setResult(null); };
  const handle = async () => {
    if (!file) { toast.error('Select a PDF file'); return; }
    if (!text.trim()) { toast.error('Enter watermark text'); return; }
    setLoading(true);
    const fd = new FormData();
    fd.append('file', file); fd.append('text', text); fd.append('color', color); fd.append('opacity', opacity);
    try { const res = await watermarkPDF(fd); setResult(res.data); toast.success('Watermark added!'); }
    catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };
  const reset = () => { setFile(null); setResult(null); };

  return (
    <ToolLayout tool="watermark-pdf" title="Add Watermark to PDF" description="Add text watermark to PDF pages." keywords="watermark pdf, add watermark, pdf watermark">
      <div className="tool-page-container">
        <div className="tool-header">
          <div className="tool-icon-wrapper bg-blue-100"><span className="text-3xl">💧</span></div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Add Watermark to PDF</h1>
          <p className="text-gray-500 text-sm">Add a diagonal text watermark to all PDF pages.</p>
        </div>
        {!result ? (<>
          {!file ? <FileDropzone onFiles={onFile} accept={{ 'application/pdf':['.pdf'] }} icon="💧" label="Drop PDF here" /> : (
            <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} className="space-y-4">
              <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl px-4 py-3">
                <span>📄</span><div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{file.name}</p></div>
                <button onClick={()=>setFile(null)} className="text-gray-400 hover:text-red-500 p-1">✕</button>
              </div>
              <div className="card space-y-4">
                <div><label className="label">Watermark Text</label>
                  <input value={text} onChange={e=>setText(e.target.value)} placeholder="CONFIDENTIAL" className="input" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="label">Color</label>
                    <select value={color} onChange={e=>setColor(e.target.value)} className="input">
                      {['red','blue','gray','black'].map(c=><option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
                    </select></div>
                  <div><label className="label">Opacity: {Math.round(opacity*100)}%</label>
                    <input type="range" min="0.1" max="0.8" step="0.05" value={opacity} onChange={e=>setOpacity(parseFloat(e.target.value))} className="w-full accent-primary-600 mt-3 h-2" /></div>
                </div>
              </div>
              <div className="flex gap-3 justify-center">
                <button onClick={handle} disabled={loading} className="btn-primary px-10 py-3">
                  {loading?<><span className="spinner sm"/>Adding...</>:<><span>💧</span>Add Watermark</>}</button>
                <button onClick={reset} className="btn-secondary py-3">Reset</button>
              </div>
            </motion.div>
          )}
        </>) : <ResultCard result={result} onReset={reset} />}
      </div>
    </ToolLayout>
  );
}
