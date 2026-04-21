import { useState, useRef, useEffect, memo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../lib/authContext';
import { signInWithGoogle, signOutUser } from '../lib/firebase';
import toast from 'react-hot-toast';

const MENUS = [
  { label: 'PDF Tools', items: [
    {label:'Merge PDF',href:'/tools/merge-pdf',icon:'🔗'},{label:'Split PDF',href:'/tools/split-pdf',icon:'✂️'},
    {label:'Compress PDF',href:'/tools/compress-pdf',icon:'🗜️'},{label:'Lock PDF',href:'/tools/lock-pdf',icon:'🔒'},
    {label:'Unlock PDF',href:'/tools/unlock-pdf',icon:'🔓'},{label:'Add Watermark',href:'/tools/watermark-pdf',icon:'💧'},
    {label:'Rotate PDF',href:'/tools/rotate-pdf',icon:'🔄'},{label:'PDF to JPG',href:'/tools/pdf-to-jpg',icon:'🖼️'},
    {label:'JPG to PDF',href:'/tools/jpg-to-pdf',icon:'📄'},{label:'PDF to Word',href:'/tools/pdf-to-word',icon:'📝'},
    {label:'Word to PDF',href:'/tools/word-to-pdf',icon:'📑'},{label:'Extract Images',href:'/tools/extract-images',icon:'🔍'},
    {label:'OCR Tool',href:'/tools/ocr',icon:'🔠'},
  ]},
  { label: 'Image Tools', items: [
    {label:'Compress Image',href:'/tools/compress-image',icon:'📷'},{label:'Resize Image',href:'/tools/resize-image',icon:'📐'},
    {label:'Crop Image',href:'/tools/crop-image',icon:'✂️'},{label:'JPG to PNG',href:'/tools/jpg-to-png',icon:'🔄'},
    {label:'PNG to JPG',href:'/tools/png-to-jpg',icon:'🔄'},{label:'To WEBP',href:'/tools/to-webp',icon:'🌐'},
    {label:'Enhance Image',href:'/tools/enhance-image',icon:'✨'},{label:'Remove Background',href:'/tools/remove-bg',icon:'🎭'},
  ]},
  { label: 'More Tools', items: [
    {label:'QR Generator',href:'/tools/qr-generator',icon:'📊'},{label:'Word Counter',href:'/tools/word-counter',icon:'🔢'},
    {label:'JSON Formatter',href:'/tools/json-formatter',icon:'{}'},{label:'Base64 Tool',href:'/tools/base64',icon:'🔐'},
    {label:'TXT to PDF',href:'/tools/txt-to-pdf',icon:'📃'},{label:'HTML to PDF',href:'/tools/html-to-pdf',icon:'🌐'},
  ]},
];

const Navbar = memo(function Navbar({ announcement }) {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const timer = useRef(null);

  useEffect(() => { setMobileOpen(false); setActiveMenu(null); setUserMenuOpen(false); }, [router.pathname]);

  const openMenu = (l) => { clearTimeout(timer.current); setActiveMenu(l); };
  const closeMenu = () => { timer.current = setTimeout(() => setActiveMenu(null), 150); };

  const handleLogin = async () => {
    const tid = toast.loading('Signing in...');
    const { error } = await signInWithGoogle();
    if (error) toast.error('Sign in failed', { id: tid });
    else toast.success('Welcome!', { id: tid });
  };

  const handleLogout = async () => {
    setUserMenuOpen(false);
    await signOutUser();
    toast.success('Signed out');
  };

  return (
    <>
      {announcement && <div className="announcement-bar"><span>📢 {announcement}</span></div>}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform">
                <img src="/logo.svg" alt="MasterhubPDF" width={32} height={32} style={{width:'100%',height:'100%',objectFit:'cover'}} />
              </div>
              <span className="font-bold text-lg text-gray-900 hidden sm:block">Masterhub<span className="text-primary-600">PDF</span></span>
            </Link>

            <div className="hidden md:flex items-center gap-0.5">
              {MENUS.map(group => (
                <div key={group.label} className="relative" onMouseEnter={() => openMenu(group.label)} onMouseLeave={closeMenu}>
                  <button className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-all ${activeMenu===group.label?'text-primary-600 bg-primary-50':'text-gray-600 hover:text-primary-600 hover:bg-gray-50'}`}>
                    {group.label}
                    <svg className={`w-3.5 h-3.5 transition-transform ${activeMenu===group.label?'rotate-180':''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7"/></svg>
                  </button>
                  <AnimatePresence>
                    {activeMenu===group.label && (
                      <motion.div initial={{opacity:0,y:6,scale:0.97}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:6,scale:0.97}} transition={{duration:0.12}}
                        onMouseEnter={()=>openMenu(group.label)} onMouseLeave={closeMenu}
                        className="absolute top-full left-0 mt-1 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                        {group.items.map(item => (
                          <Link key={item.href} href={item.href}
                            className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${router.pathname===item.href?'text-primary-600 bg-primary-50 font-medium':'text-gray-700 hover:bg-primary-50 hover:text-primary-600'}`}>
                            <span>{item.icon}</span>{item.label}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              {loading ? <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse"/> : user ? (
                <div className="relative">
                  <button onClick={()=>setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100 transition-colors">
                    {user.photoURL ? <img src={user.photoURL} alt="" className="w-7 h-7 rounded-full ring-2 ring-primary-100" referrerPolicy="no-referrer"/> :
                      <div className="w-7 h-7 rounded-full bg-primary-600 text-white flex items-center justify-center text-xs font-bold">{(user.displayName||user.email||'U')[0].toUpperCase()}</div>}
                    <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-[90px] truncate">{user.displayName?.split(' ')[0]||'User'}</span>
                  </button>
                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div initial={{opacity:0,y:6,scale:0.95}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:6,scale:0.95}} transition={{duration:0.12}}
                        className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                        <div className="px-4 py-2.5 border-b border-gray-100">
                          <p className="font-semibold text-sm text-gray-800 truncate">{user.displayName||'User'}</p>
                          <p className="text-xs text-gray-400 truncate">{user.email}</p>
                          {isAdmin && <span className="inline-block mt-1.5 text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-semibold">⚡ Admin</span>}
                        </div>
                        {isAdmin && <Link href="/admin" onClick={()=>setUserMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-primary-700 hover:bg-primary-50 transition-colors font-semibold"><span>⚙️</span>Admin Panel</Link>}
                        <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"><span>🚪</span>Sign Out</button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <button onClick={handleLogin} className="btn-primary py-2 px-4 text-sm"><span>🔑</span>Sign In</button>
              )}
              <button onClick={()=>setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors" aria-label="Menu">
                <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {mobileOpen?<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>:<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>}
                </svg>
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}} transition={{duration:0.2}}
              className="md:hidden border-t border-gray-100 bg-white overflow-hidden">
              <div className="px-4 py-3 max-h-[75vh] overflow-y-auto space-y-1">
                {MENUS.map(group => (
                  <div key={group.label}>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest px-3 py-2">{group.label}</p>
                    {group.items.map(item => (
                      <Link key={item.href} href={item.href}
                        className={`flex items-center gap-3 px-3 py-2.5 text-sm rounded-xl transition-colors ${router.pathname===item.href?'bg-primary-50 text-primary-700 font-medium':'text-gray-700 hover:bg-gray-50'}`}>
                        <span>{item.icon}</span>{item.label}
                      </Link>
                    ))}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
});
export default Navbar;
