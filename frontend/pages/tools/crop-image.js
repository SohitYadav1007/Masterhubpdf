import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import ToolLayout from '../../components/ToolLayout';
import FileDropzone from '../../components/FileDropzone';
import ResultCard from '../../components/ResultCard';
import { cropImage } from '../../lib/api';

export default function CropImage() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [natural, setNatural] = useState({ w: 0, h: 0 });
  const [crop, setCrop] = useState({ left: 0, top: 0, width: 0, height: 0 });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const onFile = (files) => {
    const f = files[0]; setFile(f); setResult(null);
    const url = URL.createObjectURL(f);
    setPreview(url);
    const img = new Image();
    img.onload = () => {
      const w = img.naturalWidth, h = img.naturalHeight;
      setNatural({ w, h });
      setCrop({ left: 0, top: 0, width: w, height: h });
    };
    img.src = url;
  };

  const setPreset = (preset) => {
    const { w, h } = natural;
    if (!w) return;
    if (preset === 'square') { const s = Math.min(w, h); setCrop({ left: Math.floor((w-s)/2), top: Math.floor((h-s)/2), width: s, height: s }); }
    else if (preset === 'full') setCrop({ left: 0, top: 0, width: w, height: h });
    else if (preset === '16:9') { const nh = Math.floor(w * 9 / 16); setCrop({ left: 0, top: Math.max(0,Math.floor((h-nh)/2)), width: w, height: Math.min(nh, h) }); }
    else if (preset === '4:3') { const nh = Math.floor(w * 3 / 4); setCrop({ left: 0, top: Math.max(0,Math.floor((h-nh)/2)), width: w, height: Math.min(nh, h) }); }
  };

  const handle = async () => {
    if (!file) { toast.error('Please select an image'); return; }
    if (!crop.width || !crop.height) { toast.error('Enter crop dimensions'); return; }
    if (crop.left + crop.width > natural.w || crop.top + crop.height > natural.h) {
      toast.error(`Crop exceeds image bounds (${natural.w}×${natural.h}px)`); return;
    }
    setLoading(true);
    const fd = new FormData();
    fd.append('file', file);
    Object.entries(crop).forEach(([k, v]) => fd.append(k, Math.round(v)));
    try {
      const res = await cropImage(fd);
      setResult(res.data);
      toast.success('Image cropped!');
    } catch (err) { toast.error(err.message || 'Crop failed'); }
    finally { setLoading(false); }
  };

  const reset = () => { setFile(null); setPreview(null); setResult(null); };

  return (
    <ToolLayout title="Crop Image" description="Crop images to custom pixel dimensions with presets." keywords="crop image, image cropper, cut image online">
      <div className="tool-page-container">
        <div className="tool-header">
          <div className="tool-icon-wrapper bg-violet-100"><span className="text-3xl">✂️</span></div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Crop Image</h1>
          <p className="text-gray-500 text-sm">Crop to exact pixel dimensions or use preset aspect ratios.</p>
        </div>

        {!result ? (
          <>
            {!file ? (
              <FileDropzone onFiles={onFile} accept={{ 'image/*': ['.jpg','.jpeg','.png','.webp'] }} icon="✂️" label="Drop image here" />
            ) : (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                {preview && <div className="flex justify-center"><img src={preview} alt="Preview" className="max-h-52 rounded-2xl shadow-md object-contain" /></div>}
                {natural.w > 0 && <p className="text-center text-xs text-gray-400">Image size: {natural.w} × {natural.h} px</p>}

                <div className="card space-y-4">
                  <div className="flex flex-wrap gap-2 mb-1">
                    {[['Full Image','full'],['Square 1:1','square'],['16:9','16:9'],['4:3','4:3']].map(([l,p]) => (
                      <button key={p} onClick={() => setPreset(p)} className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-primary-100 hover:text-primary-700 rounded-lg transition-colors font-medium">{l}</button>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[['Left (px)','left',natural.w],['Top (px)','top',natural.h],['Width (px)','width',natural.w],['Height (px)','height',natural.h]].map(([lbl,key,max]) => (
                      <div key={key}>
                        <label className="label">{lbl}</label>
                        <input value={crop[key]} onChange={e => setCrop(c => ({ ...c, [key]: parseInt(e.target.value)||0 }))}
                          type="number" min="0" max={max} className="input" />
                      </div>
                    ))}
                  </div>
                  {natural.w > 0 && (
                    <p className="text-xs text-gray-400 bg-gray-50 rounded-lg p-2">
                      Result: {Math.min(crop.width, natural.w - crop.left)} × {Math.min(crop.height, natural.h - crop.top)} px
                    </p>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button onClick={handle} disabled={loading} className="btn-primary px-10 py-3">
                    {loading ? <><span className="spinner sm" />Cropping...</> : <><span>✂️</span>Crop Image</>}
                  </button>
                  <button onClick={reset} className="btn-secondary py-3">Reset</button>
                </div>
              </motion.div>
            )}
          </>
        ) : <ResultCard result={result} onReset={reset} />}
      </div>
    </ToolLayout>
  );
}
