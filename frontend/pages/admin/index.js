import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import Head from 'next/head';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Chat from '../../components/Chat';
import { useAuth } from '../../lib/authContext';
import { getAdminConfig, updateAdminConfig, getUsers, getAllChats, sendChatMessage, getSystemInfo, getAnalytics, getAllSeo, updateSeo } from '../../lib/api';

const TABS = ['📊 Dashboard','🔍 SEO','📢 Announcement','💬 Chat','👥 Users','🖥️ System'];

export default function AdminPanel() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState('📊 Dashboard');
  const [config, setConfig] = useState(null);
  const [users, setUsers] = useState([]);
  const [chats, setChats] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [saving, setSaving] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const [system, setSystem] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [allSeo, setAllSeo] = useState({});
  const [editSeo, setEditSeo] = useState({ tool:'', title:'', description:'', keywords:'' });
  const [savingSeo, setSavingSeo] = useState(false);
  const chatBottomRef = useRef(null);

  useEffect(() => { if (!loading && !isAdmin) router.replace('/'); }, [loading, isAdmin]);

  const load = useCallback(async () => {
    if (!isAdmin || !user) return;
    try { const r = await getAdminConfig(); setConfig(r.data); setAnnouncement(r.data?.announcement||''); } catch {}
    try { const r = await getUsers(user.email); setUsers(r.data||[]); } catch {}
    try { const r = await getAllChats(user.email); setChats(r.data||{}); } catch {}
    try { const r = await getAnalytics(user.email); setAnalytics(r.data); } catch {}
    try { const r = await getSystemInfo(user.email); setSystem(r.data); } catch {}
    try { const r = await getAllSeo(); setAllSeo(r.data||{}); } catch {}
  }, [isAdmin, user]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setTimeout(()=>chatBottomRef.current?.scrollIntoView({ behavior:'smooth' }),80); }, [chats, selectedUser]);

  const saveConfig = async () => {
    setSaving(true);
    try { await updateAdminConfig(config, user?.email); toast.success('Saved!'); } catch { toast.error('Failed to save'); }
    setSaving(false);
  };

  const saveAnnouncement = async () => {
    setSaving(true);
    try {
      await updateAdminConfig({ ...config, announcement, announcementActive: !!announcement.trim() }, user?.email);
      setConfig(c=>({ ...c, announcement, announcementActive: !!announcement.trim() }));
      toast.success(announcement.trim() ? 'Announcement activated!' : 'Announcement cleared!');
    } catch { toast.error('Failed to save'); }
    setSaving(false);
  };

  const sendReply = async () => {
    if (!replyText.trim() || !selectedUser) return;
    const msg = replyText.trim(); setReplyText('');
    try {
      await sendChatMessage({ userId: selectedUser, message: msg, userName: 'Admin Support', fromAdmin: true });
      setChats(p=>({ ...p, [selectedUser]: [...(p[selectedUser]||[]), { id:Date.now(), message:msg, fromAdmin:true, timestamp:new Date().toISOString() }] }));
    } catch { toast.error('Failed to send'); setReplyText(msg); }
  };

  const saveSeo = async () => {
    if (!editSeo.tool) { toast.error('Select a tool'); return; }
    setSavingSeo(true);
    try {
      await updateSeo(editSeo.tool, editSeo, user?.email);
      setAllSeo(p=>({ ...p, [editSeo.tool]: editSeo }));
      toast.success('SEO saved!');
    } catch { toast.error('Failed to save SEO'); }
    setSavingSeo(false);
  };

  if (loading||!isAdmin) return <div className="min-h-screen flex items-center justify-center"><div className="spinner"/></div>;

  const TOOL_LIST = ['home','merge-pdf','split-pdf','compress-pdf','lock-pdf','unlock-pdf','watermark-pdf','rotate-pdf','pdf-to-jpg','jpg-to-pdf','pdf-to-word','word-to-pdf','extract-images','ocr','compress-image','resize-image','crop-image','jpg-to-png','png-to-jpg','to-webp','enhance-image','remove-bg','qr-generator','word-counter','json-formatter','base64','txt-to-pdf','html-to-pdf'];

  return (
    <>
      <Head><title>Admin Panel - MasterhubPDF</title></Head>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div><h1 className="text-3xl font-extrabold text-gray-900">Admin Panel</h1>
              <p className="text-gray-400 text-sm mt-0.5">Logged in as <span className="text-primary-600 font-semibold">{user?.email}</span></p></div>
            <span className="bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-bold">⚡ Admin</span>
          </div>

          <div className="flex gap-1 mb-6 bg-white border border-gray-100 p-1 rounded-2xl overflow-x-auto shadow-sm">
            {TABS.map(t=>(
              <button key={t} onClick={()=>setTab(t)}
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${tab===t?'bg-primary-600 text-white shadow':'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>{t}</button>
            ))}
          </div>

          {/* DASHBOARD */}
          {tab==='📊 Dashboard' && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[['👥','Users',users.length,'bg-blue-50 text-blue-700'],['💬','Chats',Object.keys(chats).length,'bg-green-50 text-green-700'],['📊','Total Uses',analytics?.total||0,'bg-purple-50 text-purple-700'],["📅","Today's Uses",analytics?.today||0,'bg-orange-50 text-orange-700']].map(([icon,label,val,color])=>(
                  <div key={label} className={`rounded-2xl p-5 ${color}`}><div className="text-2xl mb-2">{icon}</div><p className="text-2xl font-extrabold">{val}</p><p className="text-sm font-medium opacity-70">{label}</p></div>
                ))}
              </div>
              {analytics?.byTool?.length>0 && (
                <div className="card"><h3 className="font-bold text-gray-800 mb-4">Top Tools</h3>
                  <div className="space-y-2">
                    {analytics.byTool.slice(0,8).map(({_id,count})=>(
                      <div key={_id} className="flex items-center gap-3">
                        <span className="text-sm text-gray-700 w-40 truncate">{_id}</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                          <div className="h-full bg-primary-500 rounded-full" style={{ width:`${Math.min((count/(analytics.byTool[0]?.count||1))*100,100)}%` }}/>
                        </div>
                        <span className="text-sm font-bold text-gray-600 w-8 text-right">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SEO */}
          {tab==='🔍 SEO' && (
            <div className="grid md:grid-cols-2 gap-5">
              <div className="card space-y-4">
                <h3 className="font-bold text-gray-800">Edit Per-Tool SEO</h3>
                <div><label className="label">Tool</label>
                  <select value={editSeo.tool} onChange={e=>{ const t=e.target.value; setEditSeo({ tool:t, title:allSeo[t]?.title||'', description:allSeo[t]?.description||'', keywords:allSeo[t]?.keywords||'' }); }} className="input">
                    <option value="">Select tool...</option>
                    {TOOL_LIST.map(t=><option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                {editSeo.tool && (<>
                  {[['SEO Title','title','MasterhubPDF - ...'],['Meta Description','description','Free online...'],['Keywords','keywords','pdf tools, merge pdf...']].map(([label,key,ph])=>(
                    <div key={key}><label className="label">{label}</label>
                      <textarea value={editSeo[key]} onChange={e=>setEditSeo(p=>({...p,[key]:e.target.value}))} placeholder={ph} className="input h-16 resize-none" /></div>
                  ))}
                  <button onClick={saveSeo} disabled={savingSeo} className="btn-primary py-2.5 px-6">{savingSeo?'Saving...':'💾 Save SEO'}</button>
                </>)}
              </div>
              <div className="card"><h3 className="font-bold text-gray-800 mb-4">All Tool SEO Status</h3>
                <div className="space-y-1.5 max-h-96 overflow-y-auto">
                  {TOOL_LIST.map(t=>(
                    <div key={t} onClick={()=>setEditSeo({ tool:t, title:allSeo[t]?.title||'', description:allSeo[t]?.description||'', keywords:allSeo[t]?.keywords||'' })}
                      className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
                      <span className="text-sm font-medium text-gray-700">{t}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${allSeo[t]?.title?'bg-green-100 text-green-700':'bg-gray-100 text-gray-400'}`}>
                        {allSeo[t]?.title?'✓ Set':'Not set'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ANNOUNCEMENT */}
          {tab==='📢 Announcement' && (
            <div className="card max-w-2xl space-y-4">
              <h3 className="font-bold text-gray-800 text-lg">Site Announcement Banner</h3>
              <div><label className="label">Announcement Text</label>
                <textarea value={announcement} onChange={e=>setAnnouncement(e.target.value)} placeholder="e.g. 🎉 New tool: QR Code Generator!" className="input h-24 resize-none" />
                <p className="text-xs text-gray-400 mt-1">Leave blank to disable</p>
              </div>
              {announcement && <div className="announcement-bar rounded-xl px-4 py-2.5 text-sm">Preview: 📢 {announcement}</div>}
              <div className="flex gap-3">
                <button onClick={saveAnnouncement} disabled={saving} className="btn-primary py-2.5 px-6">
                  {saving?'Saving...':(announcement.trim()?'📢 Activate':'🗑️ Clear')}</button>
                {announcement && <button onClick={()=>setAnnouncement('')} className="btn-secondary py-2.5">Clear</button>}
              </div>
            </div>
          )}

          {/* CHAT */}
          {tab==='💬 Chat' && (
            <div className="grid md:grid-cols-5 gap-4" style={{ height:'520px' }}>
              <div className="md:col-span-2 card overflow-y-auto">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-sm text-gray-800">Conversations ({Object.keys(chats).length})</h3>
                  <button onClick={load} className="text-xs text-primary-600">🔄</button>
                </div>
                {Object.keys(chats).length===0 ? <div className="text-center text-gray-400 py-12"><p className="text-3xl mb-2">💬</p><p className="text-sm">No chats yet</p></div> :
                  Object.entries(chats).map(([uid,msgs])=>{
                    const last=msgs[msgs.length-1];
                    return (<button key={uid} onClick={()=>setSelectedUser(uid)}
                      className={`w-full text-left p-3 rounded-xl mb-1.5 transition-all ${selectedUser===uid?'bg-primary-50 border border-primary-200':'hover:bg-gray-50 border border-transparent'}`}>
                      <p className="font-semibold text-sm text-gray-800 truncate">{last?.userName||'User '+uid.substring(0,6)}</p>
                      <p className="text-xs text-gray-400 truncate mt-0.5">{last?.message}</p>
                    </button>);
                  })
                }
              </div>
              <div className="md:col-span-3 card flex flex-col overflow-hidden">
                {selectedUser ? (<>
                  <div className="pb-3 mb-3 border-b border-gray-100 flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-sm font-bold text-primary-700">{(chats[selectedUser]?.[0]?.userName||'U')[0].toUpperCase()}</div>
                    <p className="font-semibold text-sm">{chats[selectedUser]?.[0]?.userName||selectedUser.substring(0,8)}</p>
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-2 mb-3">
                    {(chats[selectedUser]||[]).map((msg,i)=>(
                      <div key={i} className={`flex ${msg.fromAdmin?'justify-end':'justify-start'}`}>
                        <div className={msg.fromAdmin?'chat-bubble-user text-sm max-w-[80%]':'chat-bubble-admin text-sm max-w-[80%]'}>
                          <p>{msg.message}</p>
                          <p className={`text-[10px] mt-1 ${msg.fromAdmin?'text-primary-200':'text-gray-300'}`}>{new Date(msg.timestamp||Date.now()).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</p>
                        </div>
                      </div>
                    ))}
                    <div ref={chatBottomRef}/>
                  </div>
                  <div className="flex gap-2">
                    <input value={replyText} onChange={e=>setReplyText(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendReply();}}} placeholder="Reply... (Enter to send)" className="input py-2.5 text-sm"/>
                    <button onClick={sendReply} disabled={!replyText.trim()} className="btn-primary py-2.5 px-4 text-sm">Send ➤</button>
                  </div>
                </>) : (<div className="flex-1 flex items-center justify-center text-gray-300"><div className="text-center"><p className="text-5xl mb-3">💬</p><p>Select a conversation</p></div></div>)}
              </div>
            </div>
          )}

          {/* USERS */}
          {tab==='👥 Users' && (
            <div className="card overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800">All Users ({users.length})</h3>
                <button onClick={load} className="text-sm text-primary-600 font-medium">🔄 Refresh</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="bg-gray-50">{['#','Name','Email','Last Seen'].map(h=><th key={h} className="text-left py-3 px-4 text-gray-500 font-semibold text-xs uppercase tracking-wide">{h}</th>)}</tr></thead>
                  <tbody className="divide-y divide-gray-50">
                    {users.length===0 ? <tr><td colSpan={4} className="text-center py-10 text-gray-400">No users yet</td></tr> :
                      users.map((u,i)=>(
                        <tr key={u.uid||i} className="hover:bg-gray-50">
                          <td className="py-3 px-4 text-gray-400 text-xs">{i+1}</td>
                          <td className="py-3 px-4 font-medium text-gray-800">{u.displayName||'—'}</td>
                          <td className="py-3 px-4 text-gray-500">{u.email}</td>
                          <td className="py-3 px-4 text-gray-400 text-xs">{u.lastSeen?new Date(u.lastSeen).toLocaleDateString():'—'}</td>
                        </tr>
                      ))
                    }
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SYSTEM */}
          {tab==='🖥️ System' && system && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[['Node.js',system.node],['Platform',system.platform],['Uptime',`${Math.round(system.uptime/60)}m`],['Database',system.db]].map(([k,v])=>(
                  <div key={k} className="card text-center"><p className="text-xs text-gray-400 mb-1">{k}</p><p className="font-bold text-gray-800">{v}</p></div>
                ))}
              </div>
              <div className="card">
                <h3 className="font-bold text-gray-800 mb-4">System Tools</h3>
                <div className="space-y-3">
                  {Object.entries(system.tools||{}).map(([name,info])=>(
                    <div key={name} className="flex items-center justify-between py-3 px-4 rounded-xl bg-gray-50">
                      <div><p className="font-semibold text-sm text-gray-800 capitalize">{name}</p><p className="text-xs text-gray-400">{info.desc}</p></div>
                      <div className="flex items-center gap-3">
                        {info.installed ? <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-semibold">✓ Installed</span> :
                          <div className="text-right">
                            <span className="text-xs bg-red-100 text-red-600 px-2.5 py-1 rounded-full font-semibold block mb-1">✗ Missing</span>
                            <code className="text-[10px] text-gray-400 bg-gray-200 px-2 py-0.5 rounded">{info.install}</code>
                          </div>
                        }
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
        <Footer /><Chat />
      </div>
    </>
  );
}
