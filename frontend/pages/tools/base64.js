import { useState } from 'react';
import toast from 'react-hot-toast';
import ToolLayout from '../../components/ToolLayout';

export default function Base64Tool() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState('encode');

  const process = () => {
    if (!input.trim()) { toast.error('Enter text to process'); return; }
    try {
      if (mode === 'encode') setOutput(btoa(unescape(encodeURIComponent(input))));
      else setOutput(decodeURIComponent(escape(atob(input.trim()))));
      toast.success(mode === 'encode' ? 'Encoded!' : 'Decoded!');
    } catch { toast.error(mode === 'decode' ? 'Invalid Base64 string' : 'Encoding failed'); }
  };

  const swap = () => { setInput(output); setOutput(''); };
  const copy = () => { if (output) { navigator.clipboard.writeText(output); toast.success('Copied!'); } };
  const clear = () => { setInput(''); setOutput(''); };

  return (
    <ToolLayout title="Base64 Encoder & Decoder" description="Encode text to Base64 or decode Base64 back to text online." keywords="base64 encoder, base64 decoder, base64 tool, encode decode">
      <div className="tool-page-container">
        <div className="tool-header">
          <div className="tool-icon-wrapper bg-sky-100"><span className="text-3xl">🔐</span></div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Base64 Tool</h1>
          <p className="text-gray-500 text-sm">Encode text to Base64 or decode Base64 back to plain text.</p>
        </div>

        <div className="flex gap-1.5 mb-5 p-1 bg-gray-100 rounded-2xl w-fit mx-auto">
          {[['encode','🔒 Encode'],['decode','🔓 Decode']].map(([v,l]) => (
            <button key={v} onClick={() => { setMode(v); setOutput(''); }}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${mode===v ? 'bg-white shadow text-primary-700' : 'text-gray-500 hover:text-gray-700'}`}>{l}</button>
          ))}
        </div>

        <div className="space-y-4">
          <div>
            <label className="label">{mode === 'encode' ? 'Plain Text Input' : 'Base64 Input'}</label>
            <textarea value={input} onChange={e => setInput(e.target.value)}
              placeholder={mode === 'encode' ? 'Enter text to encode to Base64...' : 'Enter Base64 string to decode...'}
              className="input h-36 resize-none font-mono text-sm" />
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            <button onClick={process} className="btn-primary px-10 py-3">{mode === 'encode' ? '🔒 Encode' : '🔓 Decode'}</button>
            {output && <button onClick={swap} className="btn-secondary py-3 px-5">⇄ Swap</button>}
            {(input || output) && <button onClick={clear} className="btn-secondary py-3 px-5 text-gray-400">🗑️ Clear</button>}
          </div>
          {output && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="label mb-0">{mode === 'encode' ? 'Base64 Output' : 'Decoded Text'}</label>
                <button onClick={copy} className="text-sm text-primary-600 hover:text-primary-800 font-semibold">📋 Copy</button>
              </div>
              <textarea readOnly value={output} className="input h-36 resize-none font-mono text-sm bg-green-50 border-green-200" />
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}
