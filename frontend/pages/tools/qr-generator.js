import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import ToolLayout from '../../components/ToolLayout';
import ResultCard from '../../components/ResultCard';
import { generateQR } from '../../lib/api';

export default function QRGenerator() {
  const [text, setText] = useState('');
  const [size, setSize] = useState(300);
  const [color, setColor] = useState('#000000');
  const [bg, setBg] = useState('#ffffff');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handle = async () => {
    if (!text.trim()) { toast.error('Enter text or URL'); return; }
    setLoading(true);
    try {
      const res = await generateQR({ text, size, color, bg });
      setResult(res.data); toast.success('QR Code generated!');
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  return (
    <ToolLayout tool="qr-generator" title="QR Code Generator" description="Generate QR codes from text or URLs. Customize color and size." keywords="qr code generator, create qr code, qr maker">
      <div className="tool-page-container">
        <div className="tool-header">
          <div className="tool-icon-wrapper bg-slate-100"><span className="text-3xl">📊</span></div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">QR Code Generator</h1>
          <p className="text-gray-500 text-sm">Generate QR codes from any text, URL, or data.</p>
        </div>
        {!result ? (
          <div className="card space-y-4">
            <div><label className="label">Text or URL</label>
              <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="https://example.com or any text..." className="input h-28 resize-none" /></div>
            <div className="grid grid-cols-3 gap-4">
              <div><label className="label">Size (px)</label>
                <select value={size} onChange={e=>setSize(parseInt(e.target.value))} className="input">
                  {[150,200,300,400,500].map(s=><option key={s} value={s}>{s}×{s}</option>)}
                </select></div>
              <div><label className="label">QR Color</label>
                <div className="flex items-center gap-2"><input type="color" value={color} onChange={e=>setColor(e.target.value)} className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer" /><span className="text-sm text-gray-500">{color}</span></div></div>
              <div><label className="label">Background</label>
                <div className="flex items-center gap-2"><input type="color" value={bg} onChange={e=>setBg(e.target.value)} className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer" /><span className="text-sm text-gray-500">{bg}</span></div></div>
            </div>
            <div className="flex justify-center pt-2">
              <button onClick={handle} disabled={loading||!text.trim()} className="btn-primary px-10 py-3">
                {loading?<><span className="spinner sm"/>Generating...</>:<><span>📊</span>Generate QR Code</>}</button>
            </div>
          </div>
        ) : (
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} className="space-y-4">
            <div className="card flex justify-center py-6"><img src={`${process.env.NEXT_PUBLIC_API_URL||'http://localhost:5000'}${result.downloadUrl}`} alt="QR Code" className="max-w-xs rounded-xl shadow-md" /></div>
            <ResultCard result={result} onReset={()=>setResult(null)} />
          </motion.div>
        )}
      </div>
    </ToolLayout>
  );
}
