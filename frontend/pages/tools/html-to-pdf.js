import { useState } from 'react';
import toast from 'react-hot-toast';
import ToolLayout from '../../components/ToolLayout';
import ResultCard from '../../components/ResultCard';
import { htmlToPdf } from '../../lib/api';

export default function HtmlToPdf() {
  const [html, setHtml] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handle = async () => {
    if (!html.trim()) { toast.error('Enter HTML code'); return; }
    setLoading(true);
    try { const res = await htmlToPdf({ html }); setResult(res.data); toast.success('HTML converted to PDF!'); }
    catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  return (
    <ToolLayout tool="html-to-pdf" title="HTML to PDF" description="Convert HTML code to PDF document." keywords="html to pdf, convert html, webpage to pdf">
      <div className="tool-page-container">
        <div className="tool-header">
          <div className="tool-icon-wrapper bg-orange-100"><span className="text-3xl">🌐</span></div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">HTML to PDF</h1>
          <p className="text-gray-500 text-sm">Convert HTML code into a PDF document.</p>
        </div>
        {!result ? (
          <div className="space-y-4">
            <div><label className="label">HTML Code</label>
              <textarea value={html} onChange={e=>setHtml(e.target.value)} placeholder="<h1>Hello</h1><p>Your content here...</p>" className="input h-64 resize-none font-mono text-sm" /></div>
            <div className="flex justify-center">
              <button onClick={handle} disabled={loading||!html.trim()} className="btn-primary px-10 py-3">
                {loading?<><span className="spinner sm"/>Converting...</>:<><span>🌐</span>Convert to PDF</>}</button>
            </div>
          </div>
        ) : <ResultCard result={result} onReset={()=>setResult(null)} />}
      </div>
    </ToolLayout>
  );
}
