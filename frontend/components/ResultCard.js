import { motion } from 'framer-motion';
import { downloadFile, formatBytes } from '../lib/api';

export function ProgressBar({ label='Processing...' }) {
  return (
    <div className="mt-6 card text-center py-10">
      <div className="spinner mx-auto mb-4"/>
      <p className="font-semibold text-gray-700">{label}</p>
      <p className="text-sm text-gray-400 mt-1">Please wait, do not close this tab</p>
    </div>
  );
}

export default function ResultCard({ result, onReset, label }) {
  if (!result) return null;
  return (
    <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{duration:0.3}} className="mt-6 rounded-2xl overflow-hidden border border-green-200 shadow-sm">
      <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-4 flex items-center gap-3">
        <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center text-white text-lg">✓</div>
        <div><h3 className="font-bold text-white">{label||'Processing Complete!'}</h3>
          <p className="text-green-100 text-sm truncate">{result.filename}</p></div>
      </div>
      <div className="bg-green-50 px-6 py-4">
        {(result.originalSize||result.compressedSize||result.pages||result.width||result.size) && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {result.originalSize>0 && <Stat label="Original" value={formatBytes(result.originalSize)} color="text-gray-800"/>}
            {result.compressedSize>0 && <Stat label="Result" value={formatBytes(result.compressedSize)} color="text-green-700"/>}
            {result.savings>0 && <Stat label="Saved" value={`${result.savings}%`} color="text-green-600"/>}
            {result.pages>0 && <Stat label="Pages" value={result.pages} color="text-gray-800"/>}
            {result.width>0&&result.height>0 && <Stat label="Size" value={`${result.width}×${result.height}`} color="text-gray-800"/>}
            {result.size>0&&!result.originalSize && <Stat label="File Size" value={formatBytes(result.size)} color="text-gray-800"/>}
          </div>
        )}
        {result.note && <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3">ℹ️ {result.note}</p>}
        <div className="flex flex-col sm:flex-row gap-3">
          <motion.button whileHover={{scale:1.02}} whileTap={{scale:0.98}}
            onClick={()=>downloadFile(result.downloadUrl,result.filename)}
            className="flex-1 flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors shadow-md shadow-primary-500/20">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
            Download File
          </motion.button>
          {onReset && <button onClick={onReset} className="btn-secondary py-3 px-6">↩ Process Another</button>}
        </div>
      </div>
    </motion.div>
  );
}

function Stat({ label, value, color }) {
  return (
    <div className="bg-white rounded-xl p-3 text-center shadow-sm">
      <p className="text-[11px] text-gray-400 font-medium mb-1 uppercase tracking-wide">{label}</p>
      <p className={`font-bold text-sm ${color}`}>{value}</p>
    </div>
  );
}

export function MultiResultCard({ results, label='files', onReset }) {
  if (!results?.length) return null;
  const downloadAll = async () => {
    for (let i=0;i<results.length;i++) {
      await new Promise(r=>setTimeout(r,i*400));
      downloadFile(results[i].downloadUrl, results[i].filename);
    }
  };
  return (
    <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{duration:0.3}} className="mt-6 rounded-2xl overflow-hidden border border-green-200 shadow-sm">
      <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-4 flex items-center gap-3">
        <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center text-white">✓</div>
        <div><h3 className="font-bold text-white">{results.length} {label} ready</h3>
          <p className="text-green-100 text-sm">Download individually or all at once</p></div>
      </div>
      <div className="bg-green-50 px-6 py-4">
        <div className="space-y-2 mb-4 max-h-56 overflow-y-auto pr-1">
          {results.map((r,i)=>(
            <motion.div key={i} initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}} transition={{delay:i*0.04}}
              className="flex items-center justify-between bg-white rounded-xl px-4 py-2.5 shadow-sm">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-green-500 text-sm flex-shrink-0">✓</span>
                <span className="text-sm font-medium text-gray-700 truncate">{r.filename}</span>
                {r.size>0 && <span className="text-xs text-gray-400 flex-shrink-0">{formatBytes(r.size)}</span>}
              </div>
              <button onClick={()=>downloadFile(r.downloadUrl,r.filename)} className="ml-3 text-sm text-primary-600 hover:text-primary-800 font-semibold flex-shrink-0">↓ Get</button>
            </motion.div>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <motion.button whileHover={{scale:1.02}} whileTap={{scale:0.98}} onClick={downloadAll}
            className="flex-1 flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors shadow-md shadow-primary-500/20">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
            Download All {results.length} {label}
          </motion.button>
          {onReset && <button onClick={onReset} className="btn-secondary py-3">↩ Process Another</button>}
        </div>
      </div>
    </motion.div>
  );
}
