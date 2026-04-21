import { motion } from 'framer-motion';
import Link from 'next/link';
import ToolLayout from '../components/ToolLayout';

const ALL_TOOLS = [
  { cat:'PDF Tools', icon:'📄', bg:'', tools:[
    { icon:'🔗', label:'Merge PDF', href:'/tools/merge-pdf', color:'from-blue-500 to-blue-600', desc:'Combine multiple PDFs' },
    { icon:'✂️', label:'Split PDF', href:'/tools/split-pdf', color:'from-purple-500 to-purple-600', desc:'Extract pages' },
    { icon:'🗜️', label:'Compress PDF', href:'/tools/compress-pdf', color:'from-green-500 to-green-600', desc:'Reduce file size' },
    { icon:'🔒', label:'Lock PDF', href:'/tools/lock-pdf', color:'from-yellow-500 to-orange-500', desc:'Password protect' },
    { icon:'🔓', label:'Unlock PDF', href:'/tools/unlock-pdf', color:'from-teal-500 to-cyan-500', desc:'Remove password' },
    { icon:'💧', label:'Add Watermark', href:'/tools/watermark-pdf', color:'from-blue-400 to-cyan-500', desc:'Add text watermark' },
    { icon:'🔄', label:'Rotate PDF', href:'/tools/rotate-pdf', color:'from-indigo-500 to-blue-500', desc:'Rotate pages' },
    { icon:'🖼️', label:'PDF to JPG', href:'/tools/pdf-to-jpg', color:'from-orange-500 to-orange-600', desc:'Pages to images' },
    { icon:'📄', label:'JPG to PDF', href:'/tools/jpg-to-pdf', color:'from-pink-500 to-pink-600', desc:'Images to PDF' },
    { icon:'📝', label:'PDF to Word', href:'/tools/pdf-to-word', color:'from-indigo-500 to-indigo-600', desc:'Extract text (OCR)' },
    { icon:'📑', label:'Word to PDF', href:'/tools/word-to-pdf', color:'from-violet-500 to-violet-600', desc:'DOCX to PDF' },
    { icon:'🔍', label:'Extract Images', href:'/tools/extract-images', color:'from-rose-500 to-red-600', desc:'Get all images' },
    { icon:'🔠', label:'OCR Tool', href:'/tools/ocr', color:'from-amber-500 to-yellow-500', desc:'Image/PDF to text' },
  ]},
  { cat:'Image Tools', icon:'🖼️', bg:'bg-gray-50', tools:[
    { icon:'📷', label:'Compress Image', href:'/tools/compress-image', color:'from-yellow-500 to-orange-500', desc:'Target size control' },
    { icon:'📐', label:'Resize Image', href:'/tools/resize-image', color:'from-red-500 to-pink-500', desc:'Change dimensions' },
    { icon:'✂️', label:'Crop Image', href:'/tools/crop-image', color:'from-violet-500 to-purple-600', desc:'Custom crop area' },
    { icon:'🔄', label:'JPG to PNG', href:'/tools/jpg-to-png', color:'from-cyan-500 to-blue-500', desc:'Lossless format' },
    { icon:'🔄', label:'PNG to JPG', href:'/tools/png-to-jpg', color:'from-emerald-500 to-teal-500', desc:'Smaller size' },
    { icon:'🌐', label:'To WEBP', href:'/tools/to-webp', color:'from-rose-500 to-red-600', desc:'Modern web format' },
    { icon:'✨', label:'Enhance Image', href:'/tools/enhance-image', color:'from-fuchsia-500 to-pink-500', desc:'AI upscale+sharpen' },
    { icon:'🎭', label:'Remove BG', href:'/tools/remove-bg', color:'from-sky-500 to-blue-600', desc:'Background removal' },
  ]},
  { cat:'More Tools', icon:'🛠️', bg:'', tools:[
    { icon:'📊', label:'QR Generator', href:'/tools/qr-generator', color:'from-slate-600 to-gray-700', desc:'Generate QR codes' },
    { icon:'🔢', label:'Word Counter', href:'/tools/word-counter', color:'from-amber-500 to-yellow-500', desc:'Count words & chars' },
    { icon:'{}', label:'JSON Formatter', href:'/tools/json-formatter', color:'from-lime-500 to-green-500', desc:'Format & validate' },
    { icon:'🔐', label:'Base64 Tool', href:'/tools/base64', color:'from-sky-500 to-cyan-500', desc:'Encode & decode' },
    { icon:'📃', label:'TXT to PDF', href:'/tools/txt-to-pdf', color:'from-fuchsia-500 to-pink-600', desc:'Text file to PDF' },
    { icon:'🌐', label:'HTML to PDF', href:'/tools/html-to-pdf', color:'from-orange-400 to-red-500', desc:'HTML code to PDF' },
  ]},
];

function ToolCard({ tool, i }) {
  return (
    <motion.div initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:i*0.03, duration:0.25 }}>
      <Link href={tool.href}>
        <div className="group bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-lg hover:border-primary-200 hover:-translate-y-1 transition-all duration-200 cursor-pointer h-full">
          <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition-transform duration-200`}>
            {tool.icon}
          </div>
          <h3 className="font-semibold text-gray-800 text-sm mb-0.5 group-hover:text-primary-600 transition-colors">{tool.label}</h3>
          <p className="text-xs text-gray-400">{tool.desc}</p>
        </div>
      </Link>
    </motion.div>
  );
}

export default function Home() {
  return (
    <ToolLayout tool="home" title="Free PDF & Image Tools" description="Free online PDF tools: merge, split, compress, lock, OCR, watermark PDF and convert images. No signup." keywords="pdf tools, merge pdf, compress pdf, image converter, ocr, watermark pdf">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-purple-50 py-20 px-4">
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-40 pointer-events-none" />
        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }}>
            <span className="inline-block bg-primary-100 text-primary-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-5">🎉 Free · No signup · No watermark</span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 mb-5 leading-tight">
              All-in-One PDF &<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-purple-600">Image Toolkit</span>
            </h1>
            <p className="text-lg text-gray-500 mb-8 max-w-2xl mx-auto">35+ tools to merge, split, compress, lock, OCR, watermark PDFs and more. Instant, secure, free.</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link href="/tools/merge-pdf" className="btn-primary px-8 py-3 text-base">Get Started Free</Link>
              <Link href="#tools" className="btn-secondary px-8 py-3 text-base">Browse All Tools</Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-8 px-4 bg-white border-y border-gray-100">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {[['⚡','Lightning Fast','Seconds per file'],['🔒','100% Secure','Auto-deleted'],['📱','Any Device','Mobile friendly'],['🆓','Always Free','No limits']].map(([icon,title,desc],i)=>(
            <motion.div key={title} initial={{ opacity:0, y:10 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:i*0.08 }} className="text-center">
              <div className="text-3xl mb-2">{icon}</div>
              <h3 className="font-bold text-gray-800 text-sm mb-0.5">{title}</h3>
              <p className="text-xs text-gray-400">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Tool Sections */}
      <div id="tools">
        {ALL_TOOLS.map(({ cat, icon, bg, tools }) => (
          <section key={cat} className={`py-12 px-4 ${bg}`}>
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center gap-3 mb-7">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-xl shadow-sm border border-gray-100">{icon}</div>
                <h2 className="text-2xl font-extrabold text-gray-900">{cat}</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {tools.map((t, i) => <ToolCard key={t.href} tool={t} i={i} />)}
              </div>
            </div>
          </section>
        ))}
      </div>

      {/* FAQ */}
      <section className="py-14 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-10">FAQs</h2>
          <div className="space-y-3">
            {[
              ['Is MasterhubPDF free?','All 35+ tools are completely free with no signup required.'],
              ['Are my files secure?','Files are auto-deleted after processing. We never store your data.'],
              ['How does PDF compression work?','We use Ghostscript for real compression when installed, with selectable quality levels.'],
              ['Can I lock a PDF?','Yes! Use Lock PDF. Install qpdf for 128-bit AES encryption.'],
              ['What is OCR?','OCR extracts text from images or scanned PDFs using Tesseract AI.'],
            ].map(([q,a])=>(
              <div key={q} className="bg-white rounded-2xl p-5 border border-gray-100">
                <h3 className="font-semibold text-gray-800 text-sm mb-1.5">{q}</h3>
                <p className="text-gray-500 text-sm">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </ToolLayout>
  );
}
