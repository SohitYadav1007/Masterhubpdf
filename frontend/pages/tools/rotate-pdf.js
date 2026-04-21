import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import ToolLayout from '../../components/ToolLayout';
import FileDropzone from '../../components/FileDropzone';
import ResultCard from '../../components/ResultCard';
import { rotatePDF, formatBytes } from '../../lib/api';

export default function RotatePDF() {
  const [file, setFile] = useState(null);
  const [angle, setAngle] = useState(90);
  const [pages, setPages] = useState('all');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const onFile = f => { setFile(f[0]); setResult(null); };
  const handle = async () => {
    if (!file) { toast.error('Select a PDF file'); return; }
    setLoading(true);
    const fd = new FormData();
    fd.append('file', file); fd.append('angle', angle); fd.append('pages', pages);
    try { const res = await rotatePDF(fd); setResult(res.data); toast.success('PDF rotated!'); }
    catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };
  const reset = () => { setFile(null); setResult(null); };

  return (
    <ToolLayout tool="rotate-pdf" title="Rotate PDF" description="Rotate PDF pages 90, 180 or 270 degrees." keywords="rotate pdf, flip pdf, pdf rotation">
      <div className="tool-page-container">
        <div className="tool-header">
          <div className="tool-icon-wrapper bg-indigo-100"><span className="text-3xl">🔄</span></div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Rotate PDF</h1>
          <p className="text-gray-500 text-sm">Rotate all or specific pages of your PDF.</p>
        </div>
        {!result ? (<>
          {!file ? <FileDropzone onFiles={onFile} accept={{ 'application/pdf':['.pdf'] }} icon="🔄" label="Drop PDF here" /> : (
            <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} className="space-y-4">
              <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl px-4 py-3">
                <span>📄</span><div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{file.name}</p></div>
                <button onClick={()=>setFile(null)} className="text-gray-400 hover:text-red-500 p-1">✕</button>
              </div>
              <div className="card space-y-4">
                <div><label className="label">Rotation Angle</label>
                  <div className="flex gap-2">
                    {[90,180,270].map(a=>(
                      <button key={a} onClick={()=>setAngle(a)}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${angle===a?'bg-primary-600 text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                        {a}°
                      </button>
                    ))}
                  </div>
                </div>
                <div><label className="label">Pages</label>
                  <input value={pages} onChange={e=>setPages(e.target.value)} placeholder="all or e.g. 1,3,5-8" className="input" />
                  <p className="text-xs text-gray-400 mt-1">Type "all" or specify: 1, 2-5, 7</p>
                </div>
              </div>
              <div className="flex gap-3 justify-center">
                <button onClick={handle} disabled={loading} className="btn-primary px-10 py-3">
                  {loading?<><span className="spinner sm"/>Rotating...</>:<><span>🔄</span>Rotate PDF</>}</button>
                <button onClick={reset} className="btn-secondary py-3">Reset</button>
              </div>
            </motion.div>
          )}
        </>) : <ResultCard result={result} onReset={reset} />}
      </div>
    </ToolLayout>
  );
}
