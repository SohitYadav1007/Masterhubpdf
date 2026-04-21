import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import ToolLayout from '../../components/ToolLayout';

export default function JsonFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [indent, setIndent] = useState(2);
  const [error, setError] = useState('');
  const [isValid, setIsValid] = useState(null);

  const format = () => {
    if (!input.trim()) { toast.error('Enter JSON to format'); return; }
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, indent));
      setIsValid(true); setError('');
      toast.success('JSON formatted!');
    } catch (e) { setIsValid(false); setError(e.message); setOutput(''); }
  };

  const minify = () => {
    if (!input.trim()) { toast.error('Enter JSON to minify'); return; }
    try {
      setOutput(JSON.stringify(JSON.parse(input)));
      setIsValid(true); setError(''); toast.success('JSON minified!');
    } catch (e) { setIsValid(false); setError(e.message); }
  };

  const copy = () => { if (output) { navigator.clipboard.writeText(output); toast.success('Copied!'); } };
  const clear = () => { setInput(''); setOutput(''); setIsValid(null); setError(''); };

  return (
    <ToolLayout title="JSON Formatter" description="Format, validate and minify JSON data online. Instant JSON beautifier." keywords="json formatter, json validator, json beautifier, json minifier">
      <div className="tool-page-container max-w-5xl">
        <div className="tool-header">
          <div className="tool-icon-wrapper bg-lime-100"><span className="text-2xl font-bold font-mono text-lime-700">{'{}'}</span></div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">JSON Formatter</h1>
          <p className="text-gray-500 text-sm">Format, validate, and minify JSON data instantly.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600">Indent:</span>
            {[2, 4].map(v => (
              <button key={v} onClick={() => setIndent(v)}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${indent===v ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {v} spaces
              </button>
            ))}
          </div>
          <div className="flex gap-2 ml-auto flex-wrap">
            <button onClick={format} className="btn-primary py-2 px-5 text-sm">✨ Format</button>
            <button onClick={minify} className="btn-secondary py-2 px-4 text-sm">⚡ Minify</button>
            <button onClick={clear} className="btn-secondary py-2 px-4 text-sm text-gray-400">🗑️ Clear</button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="label">Input JSON</label>
            <textarea value={input} onChange={e => setInput(e.target.value)}
              placeholder={'{\n  "key": "value",\n  "number": 42\n}'}
              className="input h-80 resize-none font-mono text-xs leading-relaxed" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="label mb-0">Output</label>
              {output && <button onClick={copy} className="text-xs text-primary-600 hover:text-primary-800 font-semibold">📋 Copy</button>}
            </div>
            {isValid === false ? (
              <div className="h-80 rounded-xl border-2 border-red-200 bg-red-50 p-4 overflow-auto">
                <p className="text-red-600 font-bold text-sm mb-2">❌ Invalid JSON</p>
                <p className="text-red-500 text-xs font-mono whitespace-pre-wrap">{error}</p>
              </div>
            ) : (
              <textarea readOnly value={output} placeholder="Formatted output appears here..."
                className={`input h-80 resize-none font-mono text-xs leading-relaxed ${isValid === true ? 'border-green-300 bg-green-50/50' : ''}`} />
            )}
          </div>
        </div>
        {isValid === true && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 text-green-600 text-sm font-medium flex items-center gap-1">
            <span>✅</span> Valid JSON
          </motion.p>
        )}
      </div>
    </ToolLayout>
  );
}
