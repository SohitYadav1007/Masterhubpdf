import Link from 'next/link';
const LINKS = {
  'PDF Tools':[['Merge PDF','/tools/merge-pdf'],['Split PDF','/tools/split-pdf'],['Compress PDF','/tools/compress-pdf'],['Lock PDF','/tools/lock-pdf'],['Unlock PDF','/tools/unlock-pdf'],['Add Watermark','/tools/watermark-pdf'],['Rotate PDF','/tools/rotate-pdf'],['PDF to JPG','/tools/pdf-to-jpg']],
  'Image Tools':[['Compress Image','/tools/compress-image'],['Resize Image','/tools/resize-image'],['Crop Image','/tools/crop-image'],['JPG to PNG','/tools/jpg-to-png'],['PNG to JPG','/tools/png-to-jpg'],['To WEBP','/tools/to-webp'],['Enhance Image','/tools/enhance-image'],['Remove BG','/tools/remove-bg']],
  'More Tools':[['OCR Tool','/tools/ocr'],['QR Generator','/tools/qr-generator'],['Word Counter','/tools/word-counter'],['JSON Formatter','/tools/json-formatter'],['Base64 Tool','/tools/base64'],['TXT to PDF','/tools/txt-to-pdf'],['HTML to PDF','/tools/html-to-pdf'],['Word to PDF','/tools/word-to-pdf']],
};
export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-3">
              <img src="/logo.svg" alt="MasterhubPDF" className="w-8 h-8 rounded-xl"/>
              <span className="font-bold text-white text-lg">Masterhub<span className="text-primary-400">PDF</span></span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed">35+ free PDF & image tools. Fast, secure, no signup.</p>
            <div className="mt-4 flex gap-2 flex-wrap">
              {['Free','Secure','No Signup'].map(t=><span key={t} className="text-xs bg-gray-800 text-gray-400 px-2.5 py-1 rounded-full">{t}</span>)}
            </div>
          </div>
          {Object.entries(LINKS).map(([group,links])=>(
            <div key={group}>
              <h4 className="font-semibold text-white mb-3 text-sm">{group}</h4>
              <ul className="space-y-2">
                {links.map(([label,href])=><li key={href}><Link href={href} className="text-sm text-gray-500 hover:text-white transition-colors">{label}</Link></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
          <p className="text-gray-600">© {new Date().getFullYear()} MasterhubPDF. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/404" className="text-gray-600 hover:text-white transition-colors">Privacy</Link>
            <Link href="/404" className="text-gray-600 hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
