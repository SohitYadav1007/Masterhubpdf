import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';

export default function FileDropzone({ onFiles, accept, multiple=false, maxFiles=20, label, sublabel, icon='📁' }) {
  const onDrop = useCallback((accepted) => { if (accepted?.length) onFiles(accepted); }, [onFiles]);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept, multiple, maxFiles });
  return (
    <motion.div {...getRootProps()} whileTap={{scale:0.99}}
      className={`drop-zone ${isDragActive?'drop-zone-active':''}`}>
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-3">
        <motion.div animate={isDragActive?{scale:1.15,rotate:5}:{scale:1,rotate:0}} transition={{type:'spring',stiffness:300,damping:20}} className="text-5xl sm:text-6xl">
          {icon}
        </motion.div>
        <div className="space-y-1">
          <p className="text-base sm:text-lg font-semibold text-gray-700">{isDragActive?'Drop files here...':(label||'Drag & drop files here')}</p>
          <p className="text-sm text-gray-400">{sublabel||'or click to browse files'}</p>
        </div>
        <div className="inline-flex items-center gap-2 mt-1 px-5 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors">
          Choose File{multiple?'s':''}
        </div>
      </div>
    </motion.div>
  );
}
