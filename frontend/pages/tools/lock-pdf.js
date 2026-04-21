import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import ToolLayout from '../../components/ToolLayout';
import FileDropzone from '../../components/FileDropzone';
import ResultCard from '../../components/ResultCard';
import { lockPDF } from '../../lib/api';

export default function LockPDF() {
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');
  const [showOwner, setShowOwner] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const onFile = (f) => { setFile(f[0]); setResult(null); };

  const handle = async () => {
    if (!file) { toast.error('Please select a PDF file'); return; }
    if (!password || password.length < 4) { toast.error('Password must be at least 4 characters'); return; }
    setLoading(true);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('password', password);
    if (ownerPassword) fd.append('ownerPassword', ownerPassword);
    try {
      const res = await lockPDF(fd);
      setResult(res.data);
      toast.success('PDF locked with password!');
    } catch (err) {
      toast.error(err.message || 'Failed to lock PDF');
    } finally { setLoading(false); }
  };

  const reset = () => { setFile(null); setResult(null); setPassword(''); setOwnerPassword(''); };

  return (
    <ToolLayout title="Lock PDF" description="Password protect your PDF files. Add encryption to secure documents." keywords="lock pdf, password protect pdf, encrypt pdf, secure pdf">
      <div className="tool-page-container">
        <div className="tool-header">
          <div className="tool-icon-wrapper bg-yellow-100"><span className="text-3xl">🔒</span></div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Lock PDF</h1>
          <p className="text-gray-500">Add password protection to your PDF document.</p>
        </div>

        <div className="mb-5 bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
          <span className="text-blue-500 text-xl flex-shrink-0 mt-0.5">ℹ️</span>
          <p className="text-sm text-blue-700">For strongest encryption install <strong>qpdf</strong>: <code className="bg-blue-100 px-1 rounded">sudo apt-get install qpdf</code></p>
        </div>

        {!result ? (
          <>
            {!file ? (
              <FileDropzone onFiles={onFile} accept={{ 'application/pdf': ['.pdf'] }} icon="🔒" label="Drop PDF to lock" sublabel="Select PDF to password protect" />
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl px-4 py-3">
                  <span className="text-2xl">📄</span>
                  <div className="flex-1 min-w-0"><p className="font-medium text-gray-800 truncate">{file.name}</p></div>
                  <button onClick={() => setFile(null)} className="text-gray-400 hover:text-red-500 transition-colors">✕</button>
                </div>

                <div className="card space-y-4">
                  <div>
                    <label className="label">User Password <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <input
                        type={showPass ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Enter password (min 4 chars)"
                        className="input pr-10"
                        minLength={4}
                      />
                      <button type="button" onClick={() => setShowPass(!showPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showPass ? '🙈' : '👁️'}
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">This password is needed to open the PDF</p>
                  </div>

                  <button onClick={() => setShowOwner(!showOwner)}
                    className="text-sm text-primary-600 hover:text-primary-800 font-medium flex items-center gap-1">
                    {showOwner ? '▼' : '▶'} Advanced: Owner Password (optional)
                  </button>

                  {showOwner && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                      <label className="label">Owner Password</label>
                      <input type="password" value={ownerPassword} onChange={e => setOwnerPassword(e.target.value)}
                        placeholder="Owner/master password (optional)" className="input" />
                      <p className="text-xs text-gray-400 mt-1">Owner password controls editing/printing permissions</p>
                    </motion.div>
                  )}
                </div>

                <div className="flex gap-3 justify-center">
                  <button onClick={handle} disabled={loading || !password} className="btn-primary px-10 py-3">
                    {loading ? <><div className="spinner w-5 h-5 border-2" />Locking...</> : <><span>🔒</span> Lock PDF</>}
                  </button>
                  <button onClick={reset} className="btn-secondary py-3">Reset</button>
                </div>
              </motion.div>
            )}
          </>
        ) : (
          <ResultCard result={result} onReset={reset} label="PDF Locked!" />
        )}

        <div className="mt-10 card">
          <h2 className="font-bold text-gray-800 mb-2">About PDF Password Protection</h2>
          <p className="text-sm text-gray-500 leading-relaxed">PDF encryption protects your documents from unauthorized access. The user password is required to open the file. With qpdf or Ghostscript installed, we apply 128-bit AES encryption for strong security.</p>
        </div>
      </div>
    </ToolLayout>
  );
}
