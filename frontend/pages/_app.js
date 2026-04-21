import '../styles/globals.css';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '../lib/authContext';
import { useEffect } from 'react';
import Router from 'next/router';

function PageLoader() {
  useEffect(() => {
    const bar = () => { const b = document.getElementById('pbar'); if(b){b.style.transition='none';b.style.width='0%';b.style.opacity='1';requestAnimationFrame(()=>{b.style.transition='width 8s ease';b.style.width='85%';});} };
    const done = () => { const b = document.getElementById('pbar'); if(b){b.style.width='100%';setTimeout(()=>{b.style.opacity='0';setTimeout(()=>{b.style.width='0%';},300);},200);} };
    Router.events.on('routeChangeStart', bar);
    Router.events.on('routeChangeComplete', done);
    Router.events.on('routeChangeError', done);
    return () => { Router.events.off('routeChangeStart', bar); Router.events.off('routeChangeComplete', done); Router.events.off('routeChangeError', done); };
  }, []);
  return null;
}

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <div id="pbar" style={{ position:'fixed', top:0, left:0, height:'3px', width:'0%', background:'linear-gradient(90deg,#4f46e5,#7c3aed)', zIndex:99999, opacity:0, borderRadius:'0 2px 2px 0' }} />
      <PageLoader />
      <Component {...pageProps} />
      <Toaster position="top-right" toastOptions={{ duration:4000,
        style:{ fontFamily:'Poppins,sans-serif', borderRadius:'12px', padding:'12px 16px', fontSize:'14px' },
        success:{ style:{ background:'#f0fdf4', color:'#166534', border:'1px solid #bbf7d0' } },
        error:{ style:{ background:'#fef2f2', color:'#991b1b', border:'1px solid #fecaca' } },
        loading:{ style:{ background:'#f0f4ff', color:'#3730a3', border:'1px solid #c7d2fe' } },
      }} />
    </AuthProvider>
  );
}
