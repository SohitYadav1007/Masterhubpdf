import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import ToolLayout from '../../components/ToolLayout';
import FileDropzone from '../../components/FileDropzone';
import ResultCard from '../../components/ResultCard';
import { unlockPDF } from '../../lib/api';

export default function UnlockPDF() {
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const onFile = (f) => { setFile(f[0]); setResult(null); };

  const handle = async () => {
    if (!file) { toast.error('Please select a PDF file'); return; }
    setLoading(true);
    const fd = new FormData();
    fd.append('file', file);
    if (password) fd.append('password', password);
    try {
      const res = await unlockPDF(fd);
      setResult(res.data);
      toast.success('PDF unlocked successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to unlock PDF. Check your password.');
    } finally { setLoading(false); }
  };

  const reset = () => { setFile(null); setResult(null); setPassword(''); };

  return (
    <ToolLayout title="Unlock PDF" description="Remove password protection from PDF files. Decrypt secured PDFs." keywords="unlock pdf, remove pdf password, decrypt pdf, unprotect pdf">
      <div className="tool-page-container">
        <div className="tool-header">
          <div className="tool-icon-wrapper bg-green-100"><span className="text-3xl">🔓</span></div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Unlock PDF</h1>
          <p className="text-gray-500">Remove password protection from your PDF document.</p>
        </div>

        <div className="mb-5 bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
          <span className="text-amber-500 text-xl flex-shrink-0 mt-0.5">⚠️</span>
          <p className="text-sm text-amber-700">Only unlock PDFs that you own or have permission to unlock. Install <strong>qpdf</strong> for best results: <code className="bg-amber-100 px-1 rounded">sudo apt-get install qpdf</code></p>
        </div>

        {!result ? (
          <>
            {!file ? (
              <FileDropzone onFiles={onFile} accept={{ 'application/pdf': ['.pdf'] }} icon="🔓" label="Drop locked PDF here" sublabel="Select a password-protected PDF" />
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl px-4 py-3">
                  <span className="text-2xl">📄</span>
                  <div className="flex-1 min-w-0"><p className="font-medium text-gray-800 truncate">{file.name}</p></div>
                  <button onClick={() => setFile(null)} className="text-gray-400 hover:text-red-500">✕</button>
                </div>

                <div className="card">
                  <label className="label">PDF Password</label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Enter PDF password (leave blank if unknown)"
                      className="input pr-10"
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPass ? '🙈' : '👁️'}
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Enter the password used to protect this PDF</p>
                </div>

                <div className="flex gap-3 justify-center">
                  <button onClick={handle} disabled={loading} className="btn-primary px-10 py-3">
                    {loading ? <><div className="spinner w-5 h-5 border-2" />Unlocking...</> : <><span>🔓</span> Unlock PDF</>}
                  </button>
                  <button onClick={reset} className="btn-secondary py-3">Reset</button>
                </div>
              </motion.div>
            )}
          </>
        ) : (
          <ResultCard result={result} onReset={reset} label="PDF Unlocked!" />
        )}
      </div>
    </ToolLayout>
  );
}
