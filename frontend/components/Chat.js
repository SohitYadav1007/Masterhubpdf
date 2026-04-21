import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../lib/authContext';
import { sendChatMessage, getChatMessages } from '../lib/api';

let sock = null;

export default function Chat() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [unread, setUnread] = useState(0);
  const [connected, setConnected] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    getChatMessages(user.uid).then(r => setMsgs(r.data||[])).catch(()=>{});
    const init = async () => {
      try {
        const { io } = await import('socket.io-client');
        const url = process.env.NEXT_PUBLIC_API_URL||'http://localhost:5000';
        if (sock?.connected) { sock.emit('join_chat', user.uid); return; }
        sock = io(url, { transports:['websocket','polling'], reconnectionDelay:1000 });
        sock.on('connect', () => { setConnected(true); sock.emit('join_chat', user.uid); });
        sock.on('disconnect', () => setConnected(false));
        sock.on('admin_message', msg => { setMsgs(p=>[...p,msg]); if(!open) setUnread(u=>u+1); });
      } catch {}
    };
    init();
    return () => { if(sock) sock.off('admin_message'); };
  }, [user]);

  useEffect(() => { if(open){setUnread(0);setTimeout(()=>bottomRef.current?.scrollIntoView({behavior:'smooth'}),80);inputRef.current?.focus();} }, [open]);
  useEffect(() => { if(open) bottomRef.current?.scrollIntoView({behavior:'smooth'}); }, [msgs]);

  const send = async () => {
    if (!input.trim()||!user||sending) return;
    const text = input.trim(); setInput(''); setSending(true);
    try {
      const r = await sendChatMessage({ userId:user.uid, message:text, userName:user.displayName||user.email?.split('@')[0]||'User', fromAdmin:false });
      setMsgs(p=>[...p, r.data.message]);
    } catch { setInput(text); }
    finally { setSending(false); }
  };

  if (!user) return null;

  return (
    <>
      <motion.button whileHover={{scale:1.08}} whileTap={{scale:0.93}} onClick={()=>setOpen(o=>!o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-primary-600 text-white rounded-full shadow-2xl shadow-primary-500/40 flex items-center justify-center text-2xl focus:outline-none">
        <AnimatePresence mode="wait">
          <motion.span key={open?'x':'c'} initial={{scale:0}} animate={{scale:1}} exit={{scale:0}} transition={{duration:0.15}}>
            {open?'✕':'💬'}
          </motion.span>
        </AnimatePresence>
        {unread>0&&!open && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">{unread>9?'9+':unread}</span>}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{opacity:0,y:20,scale:0.94}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:20,scale:0.94}} transition={{duration:0.18}}
            className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden" style={{height:'440px'}}>
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-4 py-3.5 flex items-center gap-3">
              <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center text-lg">🤖</div>
              <div className="flex-1">
                <p className="font-bold text-sm">Support Chat</p>
                <p className="text-xs text-primary-200 flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${connected?'bg-green-400':'bg-gray-400'}`}/>
                  {connected?'Online':'Connecting...'}
                </p>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {msgs.length===0 && <div className="text-center text-gray-400 pt-10"><p className="text-4xl mb-3">👋</p><p className="font-medium text-gray-600">Hi {user.displayName?.split(' ')[0]||'there'}!</p><p className="text-sm mt-1">How can we help you today?</p></div>}
              {msgs.map((m,i)=>(
                <div key={m.id||i} className={`flex ${m.fromAdmin?'justify-start':'justify-end'}`}>
                  <div className={m.fromAdmin?'chat-bubble-admin text-sm':'chat-bubble-user text-sm'}>
                    <p>{m.message}</p>
                    <p className={`text-[10px] mt-1.5 ${m.fromAdmin?'text-gray-300':'text-primary-200'}`}>{new Date(m.timestamp||Date.now()).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</p>
                  </div>
                </div>
              ))}
              <div ref={bottomRef}/>
            </div>
            <div className="p-3 border-t border-gray-100 bg-white flex gap-2">
              <input ref={inputRef} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();}}}
                placeholder="Type a message..." className="flex-1 px-3 py-2.5 text-sm bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 transition-all"/>
              <button onClick={send} disabled={!input.trim()||sending}
                className="w-10 h-10 bg-primary-600 text-white rounded-xl flex items-center justify-center hover:bg-primary-700 transition-colors disabled:opacity-40 flex-shrink-0">
                {sending?<span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>:'➤'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
