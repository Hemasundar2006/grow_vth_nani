import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  ExternalLink, 
  Settings, 
  Link as LinkIcon, 
  LogOut, 
  Eye, 
  User as UserIcon,
  Save,
  Palette,
  Zap,
  BarChart3,
  Globe,
  Layout,
  MessageSquare,
  X,
  ChevronRight,
  TrendingUp,
  Share2,
  PlayCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminDashboard = () => {
  const [links, setLinks] = useState([]);
  const [profile, setProfile] = useState({});
  const [activeTab, setActiveTab] = useState('links');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  
  const navigate = useNavigate();

  const [linkForm, setLinkForm] = useState({
    title: '', url: '', buttonText: 'Visit', status: 'published', type: 'link', startDate: null, expiryDate: null
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [linksRes, profileRes] = await Promise.all([
        api.get('/admin/links'),
        api.get('/auth/profile')
      ]);
      setLinks(linksRes.data);
      setProfile(profileRes.data);
    } catch (error) {
      toast.error('Data retrieval failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdateLink = async (e) => {
    e.preventDefault();
    try {
      if (editingLink) {
        await api.put(`/admin/links/${editingLink._id}`, linkForm);
        toast.success('Protocol refined');
      } else {
        await api.post('/admin/links', linkForm);
        toast.success('Content launched');
      }
      setShowForm(false);
      setEditingLink(null);
      setLinkForm({ title: '', url: '', buttonText: 'Visit', status: 'published', type: 'link', startDate: null, expiryDate: null });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Protocol failure');
    }
  };

  const handleDeleteLink = async (id) => {
    if (window.confirm('Wipe this asset?')) {
      try {
        await api.delete(`/admin/links/${id}`);
        toast.success('Asset wiped');
        fetchData();
      } catch (error) {
        toast.error('Wipe failed');
      }
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await api.put('/auth/profile', profile);
      toast.success('Identity locked');
    } catch (error) {
      toast.error('Identity sync failed');
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 font-inter">
      <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const totalClicks = links.reduce((p, c) => p + (c.clickCount || 0), 0);
  const totalShares = links.reduce((p, c) => p + (c.shareCount || 0), 0);

  const stats = [
    { label: 'Global Reach', value: totalClicks, icon: TrendingUp, color: 'text-indigo-500' },
    { label: 'Cloud Shares', value: totalShares, icon: Share2, color: 'text-purple-500' },
    { label: 'Asset Count', value: links.length, icon: Layout, color: 'text-blue-500' }
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white font-inter flex flex-col md:flex-row">
      
      {/* SIDEBAR (DESKTOP) */}
      <aside className="hidden md:flex w-72 bg-[#111114] border-r border-white/5 flex-col p-8 space-y-10">
         <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-2xl shadow-indigo-500/20"><Zap size={20} fill="white" /></div>
            <span className="font-black text-xs uppercase tracking-[0.3em] italic text-indigo-100">vth_protocol</span>
         </div>
         <nav className="flex-1 space-y-4">
            {[
              { id: 'links', label: 'Feed Stream', icon: Layout },
              { id: 'profile', label: 'Identity', icon: UserIcon },
              { id: 'theme', label: 'Aesthetic', icon: Palette },
              { id: 'analytics', label: 'Data Bank', icon: BarChart3 }
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full flex items-center p-4 rounded-2xl transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>
                <tab.icon size={20} className="mr-4" /><span className="font-black text-[10px] uppercase tracking-widest">{tab.label}</span>
              </button>
            ))}
         </nav>
         <div className="pt-8 border-t border-white/5 space-y-4">
            <button onClick={() => window.open('/', '_blank')} className="w-full flex items-center p-4 text-gray-400 hover:text-white transition-all bg-white/5 rounded-2xl"><Eye size={18} className="mr-4" /><span className="font-bold text-[10px] uppercase tracking-widest">Live Page</span></button>
            <button onClick={() => { localStorage.clear(); navigate('/login'); }} className="w-full flex items-center p-4 text-red-500 hover:bg-red-500/10 rounded-2xl"><LogOut size={18} className="mr-4" /><span className="font-bold text-[10px] uppercase tracking-widest">Disconnect</span></button>
         </div>
      </aside>

      {/* NEW PREMIUM HEADER (EXPOSED ACTIONS) */}
      <div className="sticky top-0 z-[1000] flex flex-col w-full bg-[#111114]/80 backdrop-blur-3xl border-b border-white/5 md:bg-transparent md:border-none">
         <div className="flex items-center justify-between p-6 md:p-14 md:pb-0">
            <div className="flex items-center space-x-3">
               <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-xl shadow-indigo-600/30 md:hidden"><Zap size={20} fill="white" /></div>
               <div>
                  <h1 className="text-[13px] font-black uppercase tracking-[0.4em] text-gray-500 mb-1">Command Center</h1>
                  <div className="flex items-center space-x-3">
                     <span className="text-xl font-black italic tracking-tight">{profile.creatorName || 'vth_nani'}</span>
                     <div className="px-3 py-1 bg-indigo-500/10 rounded-full border border-indigo-500/20 flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-green-500/50 shadow-sm"></div>
                        <span className="text-[8px] font-black uppercase text-indigo-400 tracking-widest">vth_internal</span>
                     </div>
                  </div>
               </div>
            </div>
            <div className="flex items-center space-x-4">
               <button onClick={() => window.open('/', '_blank')} className="w-11 h-11 bg-white/5 rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition-all border border-white/5"><Eye size={20} /></button>
               <button onClick={() => { localStorage.clear(); navigate('/login'); }} className="w-11 h-11 bg-red-500/5 rounded-xl flex items-center justify-center text-red-500 hover:bg-red-500/10 transition-all border border-red-500/10"><LogOut size={20} /></button>
            </div>
         </div>
         
         {/* SUB-NAV IN HEADER FOR MOBILE FAST-ACCESS */}
         <div className="md:hidden flex items-center space-x-6 px-6 py-4 overflow-x-auto no-scrollbar border-t border-white/5 bg-white/5">
            {[
              { id: 'links', label: 'Feed', icon: Layout },
              { id: 'profile', label: 'Identity', icon: UserIcon },
              { id: 'theme', label: 'Aesthetics', icon: Palette }
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center space-x-2 whitespace-nowrap p-2 rounded-lg transition-all ${activeTab === tab.id ? 'text-indigo-400' : 'text-gray-500'}`}>
                <tab.icon size={16} />
                <span className="text-[9px] font-black uppercase tracking-widest">{tab.label}</span>
              </button>
            ))}
         </div>
      </div>

      <main className="flex-1 overflow-y-auto h-screen p-6 md:p-14 space-y-12 no-scrollbar md:pt-14">
         
         {/* STATS ENGINE */}
         <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {stats.map((s, i) => (
              <div key={i} className="bg-[#111114] p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden group">
                 <s.icon className={`absolute -right-6 -bottom-6 w-24 h-24 opacity-5 ${s.color}`} /><p className="text-[9px] font-black uppercase tracking-[0.25em] text-gray-500 mb-2">{s.label}</p><h3 className="text-4xl font-black italic">{s.value}</h3>
              </div>
            ))}
         </section>

         <AnimatePresence mode="wait">
            {activeTab === 'links' && (
              <motion.div key="links" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                 <div className="flex items-center justify-between mb-8">
                    <h2 className="text-[13px] font-black uppercase tracking-[0.4em] text-gray-500">Asset Stream</h2>
                    <button onClick={() => { setEditingLink(null); setShowForm(true); }} className="bg-indigo-600 text-white font-black uppercase text-[10px] px-8 py-4 rounded-2xl shadow-xl shadow-indigo-600/20 flex items-center space-x-3"><Plus size={16} /><span>Launch Content</span></button>
                 </div>
                 <div className="grid grid-cols-1 gap-4">
                    {links.map(link => (
                      <div key={link._id} className="bg-[#111114] p-6 rounded-[2.5rem] border border-white/5 flex items-center justify-between group hover:border-indigo-500/30 transition-all">
                         <div className="flex items-center space-x-6">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${link.type === 'video' ? 'bg-red-500/10 text-red-500' : 'bg-indigo-500/10 text-indigo-500'}`}>{link.type === 'video' ? <PlayCircle size={24} /> : <LinkIcon size={24} />}</div>
                            <div><h4 className="font-black text-[11px] uppercase tracking-wider">{link.title}</h4><div className="flex items-center space-x-4 mt-2"><div className="flex items-center text-[10px] space-x-1.5 text-gray-500"><Eye size={12} className="text-indigo-400" /> <span>{link.clickCount || 0}</span></div><div className="flex items-center text-[10px] space-x-1.5 text-gray-500"><Share2 size={12} className="text-purple-400" /> <span>{link.shareCount || 0}</span></div></div></div>
                         </div>
                         <div className="flex space-x-2">
                            <button onClick={() => { setEditingLink(link); setLinkForm(link); setShowForm(true); }} className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-gray-400 hover:text-indigo-500 transition-colors"><Edit2 size={16} /></button>
                            <button onClick={() => handleDeleteLink(link._id)} className="w-10 h-10 bg-red-500/5 rounded-xl flex items-center justify-center text-red-400 hover:bg-red-500/10 transition-colors"><Trash2 size={16} /></button>
                         </div>
                      </div>
                    ))}
                 </div>
              </motion.div>
            )}

            {activeTab === 'profile' && (
               <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-2xl">
                   <h2 className="text-[13px] font-black uppercase tracking-[0.45em] text-gray-500 mb-8">Identity Config</h2>
                   <form onSubmit={handleUpdateProfile} className="bg-[#111114] p-10 rounded-[3rem] border border-white/5 space-y-10 shadow-2xl">
                      <div className="flex flex-col items-center">
                         <div className="w-32 h-32 rounded-full border-4 border-white/10 ring-[12px] ring-indigo-500/5 relative mb-6">
                            {profile.profilePicture ? ( <img src={profile.profilePicture} className="w-full h-full object-cover rounded-full" alt="P" /> ) : ( <div className="w-full h-full flex items-center justify-center font-black italic text-4xl text-gray-700 uppercase">{profile.username?.[0]}</div> )}
                         </div>
                         <input type="file" id="pfp" className="hidden" accept="image/*" onChange={async (e) => {
                            const file = e.target.files[0]; if (!file) return; const fd = new FormData(); fd.append('image', file);
                            const { data } = await api.post('/upload', fd); setProfile({...profile, profilePicture: data.url}); toast.success('Portrait Captured');
                         }} />
                         <label htmlFor="pfp" className="bg-indigo-600 px-10 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest cursor-pointer active:scale-95 transition-all shadow-xl shadow-indigo-600/20">Change Portrait</label>
                      </div>
                      <div className="grid grid-cols-1 gap-8">
                         <div className="space-y-1.5"><label className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-600 ml-1">Universal Handle</label><input className="w-full p-5 bg-[#0a0a0c] border border-white/5 rounded-2xl outline-none focus:border-indigo-500 font-bold" value={profile.creatorName || ''} onChange={(e) => setProfile({...profile, creatorName: e.target.value})} /></div>
                         <div className="space-y-1.5"><label className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-600 ml-1">Mantra Core</label><textarea className="w-full p-5 bg-[#0a0a0c] border border-white/5 rounded-2xl outline-none focus:border-indigo-500 font-bold h-32" value={profile.bio || ''} onChange={(e) => setProfile({...profile, bio: e.target.value})} /></div>
                         <div className="grid grid-cols-2 gap-6">
                            {['instagram', 'youtube'].map(plat => (
                               <div key={plat} className="space-y-1.5"><label className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-600 ml-1">{plat} Entry</label><input className="w-full p-4 bg-[#0a0a0c] border border-white/5 rounded-2xl outline-none focus:border-indigo-500 font-bold text-xs" value={profile.socialLinks?.[plat] || ''} onChange={(e) => setProfile({...profile, socialLinks: {...profile.socialLinks, [plat]: e.target.value}})} /></div>
                            ))}
                         </div>
                      </div>
                      <button className="w-full bg-indigo-600 p-5 rounded-[2rem] font-black text-[11px] uppercase tracking-widest flex items-center justify-center space-x-3 shadow-2xl shadow-indigo-600/20">
                         <Save size={18} /> <span>Lock Identity</span>
                      </button>
                   </form>
               </motion.div>
            )}

            {activeTab === 'theme' && (
              <motion.div key="theme" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-2xl">
                  <h2 className="text-[13px] font-black uppercase tracking-[0.45em] text-gray-500 mb-8">Page Skin Engine</h2>
                  <div className="bg-[#111114] p-10 rounded-[3rem] border border-white/5 space-y-12">
                     <div className="grid grid-cols-2 gap-10">
                        <div className="space-y-4"><h4 className="text-[10px] font-black uppercase tracking-widest">Base Canvas</h4><input type="color" className="w-full h-16 rounded-2xl cursor-pointer bg-transparent border-2 border-white/5 p-1" value={profile.theme?.backgroundColor || '#0a0a0c'} onChange={(e) => setProfile({...profile, theme: {...profile.theme, backgroundColor: e.target.value }})} /></div>
                        <div className="space-y-4"><h4 className="text-[10px] font-black uppercase tracking-widest">Hyper Accent</h4><input type="color" className="w-full h-16 rounded-2xl cursor-pointer bg-transparent border-2 border-white/5 p-1" value={profile.theme?.buttonColor || '#4f46e5'} onChange={(e) => setProfile({...profile, theme: {...profile.theme, buttonColor: e.target.value }})} /></div>
                     </div>
                     <button onClick={handleUpdateProfile} className="w-full bg-indigo-600 p-5 rounded-[2rem] font-black text-[11px] uppercase tracking-widest shadow-xl shadow-indigo-600/20">Update Atmosphere</button>
                  </div>
              </motion.div>
            )}
         </AnimatePresence>
      </main>

      {/* MOBILE NAV (BOTTOM) */}
      <nav className="md:hidden fixed bottom-6 left-6 right-6 z-[1000] bg-[#111114]/90 backdrop-blur-3xl rounded-[2.5rem] border border-white/5 p-3 flex justify-around shadow-2xl">
         {[ { id: 'links', icon: Layout }, { id: 'profile', icon: UserIcon }, { id: 'theme', icon: Palette } ].map(tab => (
           <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`p-4 rounded-full transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20' : 'text-gray-600'}`}><tab.icon size={22} /></button>
         ))}
      </nav>

      {/* OVERLAY FORM */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[2000] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6">
             <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-[#111114] w-full max-w-xl rounded-[4rem] p-12 border border-white/10 relative overflow-hidden shadow-[0_0_100px_rgba(79,70,229,0.2)]">
                <button onClick={() => setShowForm(false)} className="absolute top-10 right-10 text-gray-500 hover:text-white transition-colors"><X size={28} /></button>
                <div className="mb-12 text-center">
                   <h3 className="text-3xl font-black uppercase italic tracking-tighter">{editingLink ? 'Refine Objective' : 'New Content Protocol'}</h3>
                   <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-700 mt-3">vth_internal access only</p>
                </div>
                <form onSubmit={handleCreateOrUpdateLink} className="space-y-6">
                   <div className="space-y-4">
                      <input className="w-full bg-[#0a0a0c] border border-white/5 p-5 rounded-3xl outline-none focus:border-indigo-500 font-bold transition-all" placeholder="Content Label" value={linkForm.title} onChange={(e) => setLinkForm({...linkForm, title: e.target.value})} required/>
                      <input className="w-full bg-[#0a0a0c] border border-white/5 p-5 rounded-3xl outline-none focus:border-indigo-500 font-bold transition-all" placeholder="Entry URL (https://...)" value={linkForm.url} onChange={(e) => setLinkForm({...linkForm, url: e.target.value})} required/>
                      <div className="grid grid-cols-2 gap-4">
                         <select className="w-full bg-[#0a0a0c] border border-white/5 p-5 rounded-3xl outline-none focus:border-indigo-500 font-black text-[10px] uppercase tracking-widest text-gray-500" value={linkForm.type} onChange={(e) => setLinkForm({...linkForm, type: e.target.value})}>
                            <option value="link">General Navigate</option><option value="video">YouTube Engine</option>
                         </select>
                         <select className="w-full bg-[#0a0a0c] border border-white/5 p-5 rounded-3xl outline-none focus:border-indigo-500 font-black text-[10px] uppercase tracking-widest text-indigo-500" value={linkForm.status} onChange={(e) => setLinkForm({...linkForm, status: e.target.value})}>
                            <option value="published">ACTIVE STATUS</option><option value="draft">STAGED / HIDDEN</option>
                         </select>
                      </div>
                   </div>
                   <div className="p-8 bg-indigo-600/5 rounded-[3rem] border border-indigo-600/10 space-y-6">
                      <div className="flex items-center space-x-3 text-indigo-500"><Zap size={14} fill="currentColor" /> <span className="text-[10px] font-black uppercase tracking-[0.5em]">Scheduling Engine</span></div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="space-y-1.5"><label className="text-[9px] font-black uppercase text-gray-600 ml-1 tracking-widest">Boot Protocol</label><input className="w-full p-4 bg-[#0a0a0c] border border-white/5 rounded-2xl font-bold text-xs" type="datetime-local" value={linkForm.startDate ? new Date(linkForm.startDate).toISOString().slice(0, 16) : ''} onChange={(e) => setLinkForm({...linkForm, startDate: e.target.value})}/></div>
                         <div className="space-y-1.5"><label className="text-[9px] font-black uppercase text-gray-600 ml-1 tracking-widest">Eject Protocol</label><input className="w-full p-4 bg-[#0a0a0c] border border-white/5 rounded-2xl font-bold text-xs text-red-500" type="datetime-local" value={linkForm.expiryDate ? new Date(linkForm.expiryDate).toISOString().slice(0, 16) : ''} onChange={(e) => setLinkForm({...linkForm, expiryDate: e.target.value})}/></div>
                      </div>
                   </div>
                   <button className="w-full bg-indigo-600 p-6 rounded-[3rem] font-black uppercase text-xs tracking-widest shadow-2xl shadow-indigo-600/20 active:scale-95 transition-all">Launch Transmission</button>
                </form>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default AdminDashboard;
