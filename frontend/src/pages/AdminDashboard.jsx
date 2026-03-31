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
  LayoutDashboard,
  LineChart,
  Calendar,
  X,
  Share2
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
    title: '',
    url: '',
    buttonText: 'Visit',
    status: 'published',
    type: 'link',
    startDate: null,
    expiryDate: null
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [linksRes, profileRes] = await Promise.all([
        api.get('/admin/links'),
        api.get('/auth/profile')
      ]);
      setLinks(linksRes.data);
      setProfile(profileRes.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out');
    navigate('/login');
  };

  const handleCreateOrUpdateLink = async (e) => {
    e.preventDefault();
    try {
      if (editingLink) {
        await api.put(`/admin/links/${editingLink._id}`, linkForm);
        toast.success('Link updated');
      } else {
        await api.post('/admin/links', linkForm);
        toast.success('Link created');
      }
      setShowForm(false);
      setEditingLink(null);
      setLinkForm({ title: '', url: '', buttonText: 'Visit', status: 'published', type: 'link', startDate: null, expiryDate: null });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    }
  };

  const handleDeleteLink = async (id) => {
    if (window.confirm('Delete this link?')) {
      try {
        await api.delete(`/admin/links/${id}`);
        toast.success('Link deleted');
        fetchData();
      } catch (error) {
        toast.error('Failed to delete');
      }
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await api.put('/auth/profile', profile);
      toast.success('Profile updated');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white font-inter">
      <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const totalClicksArray = links.map(l => l.clickCount || 0);
  const totalSharesArray = links.map(l => l.shareCount || 0);
  const totalClicks = totalClicksArray.reduce((p, c) => p + c, 0);
  const totalShares = totalSharesArray.reduce((p, c) => p + c, 0);

  return (
    <div className="min-h-screen bg-[#fcfcfc] pb-24 font-inter">
      {/* MOBILE PREMIUM HEADER */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 flex items-center justify-between px-6 py-5">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-[1.2rem] flex items-center justify-center shadow-lg shadow-indigo-100">
             <Zap size={18} className="text-white" fill="white" />
          </div>
          <div>
             <h1 className="text-[14px] font-black uppercase tracking-tighter italic leading-none">Admin Panel</h1>
             <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">vth_nani ecosystem</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
           <button onClick={() => window.open(`/`, '_blank')} className="p-3 bg-gray-50 rounded-2xl text-gray-400 hover:text-indigo-600 transition-colors">
              <Eye size={20} />
           </button>
           <button onClick={handleLogout} className="p-3 bg-red-50 rounded-2xl text-red-400 hover:bg-red-100 transition-all">
              <LogOut size={20} />
           </button>
        </div>
      </header>

      {/* ANALYTICS SUMMARY BOX */}
      <div className="px-6 pt-8 grid grid-cols-2 gap-4">
         <div className="bg-indigo-600 p-6 rounded-[2.5rem] shadow-xl shadow-indigo-100 text-white relative overflow-hidden group">
            <LineChart className="absolute -right-4 -bottom-4 text-white/10 w-24 h-24 group-hover:scale-110 transition-transform" />
            <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Total Visibility</p>
            <h3 className="text-3xl font-black italic">{totalClicks}</h3>
            <p className="text-[9px] font-bold mt-1 opacity-70 italic tracking-tight">Active link interactions</p>
         </div>
         <div className="bg-white border border-gray-100 p-6 rounded-[2.5rem] shadow-sm relative overflow-hidden">
            <Share2 className="absolute -right-4 -bottom-4 text-indigo-50 w-24 h-24" />
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Social Shares</p>
            <h3 className="text-3xl font-black italic text-gray-900">{totalShares}</h3>
            <p className="text-[9px] font-bold mt-1 text-indigo-400 italic tracking-tight">Community referrals</p>
         </div>
      </div>

      <main className="px-6 mt-8">
        <AnimatePresence mode="wait">
          {activeTab === 'links' && (
            <motion.div key="links" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
               <div className="flex items-center justify-between mb-6 pl-1">
                  <h2 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400">Content Stream</h2>
                  <span className="text-[10px] font-black text-indigo-600 uppercase bg-indigo-50 px-3 py-1 rounded-full">{links.length} Active Items</span>
               </div>

               <div className="space-y-4">
                  {links.map((link) => (
                    <div key={link._id} className="bg-white p-5 rounded-[2.5rem] border border-gray-50 shadow-sm flex items-center justify-between group">
                       <div className="flex items-center space-x-4">
                          <div className={`w-14 h-14 rounded-[1.5rem] flex items-center justify-center ${link.type === 'video' ? 'bg-red-50 text-red-600' : 'bg-indigo-50 text-indigo-600'}`}>
                             {link.type === 'video' ? <PlayCircle size={24} /> : <LinkIcon size={24} />}
                          </div>
                          <div className="max-w-[150px]">
                             <h4 className="font-black text-sm uppercase tracking-tight text-gray-900 truncate">{link.title}</h4>
                             <div className="flex items-center space-x-3 mt-1.5 grayscale opacity-60">
                                <div className="flex items-center space-x-1">
                                   <Eye size={10} /> <span className="text-[9px] font-black">{link.clickCount || 0}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                   <Share2 size={10} /> <span className="text-[9px] font-black">{link.shareCount || 0}</span>
                                </div>
                             </div>
                          </div>
                       </div>
                       <div className="flex items-center space-x-2">
                          <button onClick={() => { setEditingLink(link); setLinkForm(link); setShowForm(true); }} className="w-10 h-10 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400"><Edit2 size={16} /></button>
                          <button onClick={() => handleDeleteLink(link._id)} className="w-10 h-10 bg-red-50 rounded-2xl flex items-center justify-center text-red-400"><Trash2 size={16} /></button>
                       </div>
                    </div>
                  ))}

                  {links.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
                       <LinkIcon className="mx-auto mb-4 text-gray-200" size={48} />
                       <h3 className="text-sm font-black text-gray-900 uppercase">Nothing to show yet</h3>
                       <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mt-2 px-12">Start by adding your first masterpiece using the + button below</p>
                    </div>
                  )}
               </div>
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
               <h2 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 mb-6 pl-1">Identity & Bio</h2>
               <form onSubmit={handleUpdateProfile} className="bg-white p-8 rounded-[3rem] border border-gray-50 space-y-8 shadow-sm">
                  <div className="flex flex-col items-center">
                    <div className="w-28 h-28 rounded-full bg-gray-50 mb-5 relative group overflow-hidden border-4 border-white shadow-xl ring-8 ring-indigo-50">
                      {profile.profilePicture ? (
                        <img src={profile.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-200 font-bold text-4xl italic">G</div>
                      )}
                    </div>
                    <input type="file" id="pfp" className="hidden" accept="image/*" onChange={async (e) => {
                       const file = e.target.files[0]; if (!file) return; const fd = new FormData(); fd.append('image', file);
                       try { const { data } = await api.post('/upload', fd); setProfile({ ...profile, profilePicture: data.url }); toast.success('Portrait Updated');
                       } catch (err) { toast.error('Upload failed'); }
                    }}/>
                    <label htmlFor="pfp" className="bg-indigo-600 text-white text-[10px] font-black uppercase px-6 py-2.5 rounded-2xl shadow-xl shadow-indigo-100 cursor-pointer hover:scale-105 transition-transform">Update Portrait</label>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1">
                       <label className="text-[9px] font-black uppercase tracking-widest text-gray-300 ml-1">Creator Handle</label>
                       <input className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 font-bold" value={profile.creatorName || ''} onChange={(e) => setProfile({ ...profile, creatorName: e.target.value })}/>
                    </div>
                    <div className="space-y-1">
                       <label className="text-[9px] font-black uppercase tracking-widest text-gray-300 ml-1">The Mantra</label>
                       <textarea className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 font-bold h-24" value={profile.bio || ''} onChange={(e) => setProfile({ ...profile, bio: e.target.value })}/>
                    </div>
                  </div>

                  <button className="w-full bg-indigo-600 text-white font-black uppercase text-[12px] p-5 rounded-[2rem] shadow-xl shadow-indigo-100 flex items-center justify-center space-x-3">
                     <Save size={18} /> <span>Save Profile</span>
                  </button>
               </form>
            </motion.div>
          )}

          {activeTab === 'theme' && (
            <motion.div key="theme" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
               <h2 className="text-[12px] font-black uppercase tracking-[0.4em] text-gray-400 mb-6 pl-1">The Aesthetic</h2>
               <div className="bg-white p-8 rounded-[3rem] border border-gray-50 space-y-8 shadow-sm">
                  <div className="space-y-6">
                     <div className="flex items-center justify-between">
                        <div>
                           <h4 className="text-[11px] font-black uppercase tracking-widest text-gray-900">Background Canvas</h4>
                           <p className="text-[9px] font-bold text-gray-400 mt-1 italic">Main page theme color</p>
                        </div>
                        <input type="color" className="w-14 h-14 rounded-2xl border-4 border-white shadow-lg cursor-pointer" value={profile.theme?.backgroundColor || '#fcfcfc'} onChange={(e) => setProfile({ ...profile, theme: { ...profile.theme, backgroundColor: e.target.value } })} />
                     </div>
                     <div className="flex items-center justify-between">
                        <div>
                           <h4 className="text-[11px] font-black uppercase tracking-widest text-gray-900">Hyper Buttons</h4>
                           <p className="text-[9px] font-bold text-gray-400 mt-1 italic">Clickable element colors</p>
                        </div>
                        <input type="color" className="w-14 h-14 rounded-2xl border-4 border-white shadow-lg cursor-pointer" value={profile.theme?.buttonColor || '#4f46e5'} onChange={(e) => setProfile({ ...profile, theme: { ...profile.theme, buttonColor: e.target.value } })} />
                     </div>
                  </div>
                  <button onClick={handleUpdateProfile} className="w-full bg-indigo-600 text-white font-black uppercase text-[12px] p-5 rounded-[2rem] shadow-xl shadow-indigo-100">Apply New Theme</button>
               </div>
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div key="analytics" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <h2 className="text-[12px] font-black uppercase tracking-[0.4em] text-gray-400 mb-6 pl-1">Performance Details</h2>
                <div className="space-y-4">
                   {links.map(link => (
                     <div key={link._id} className="bg-white p-6 rounded-[2.5rem] border border-gray-50 shadow-sm flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                           <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-indigo-600 font-black italic">
                              {link.title[0]}
                           </div>
                           <div>
                              <h4 className="text-[11px] font-black uppercase tracking-tight text-gray-900">{link.title}</h4>
                              <p className="text-[9px] font-bold text-gray-300 truncate w-32">{link.url}</p>
                           </div>
                        </div>
                        <div className="flex items-center space-x-6 pr-2 font-black italic">
                            <div className="text-center">
                               <p className="text-xs text-indigo-600 leading-none">{link.clickCount || 0}</p>
                               <span className="text-[7px] uppercase tracking-widest text-gray-300">Clicks</span>
                            </div>
                            <div className="text-center">
                               <p className="text-xs text-purple-600 leading-none">{link.shareCount || 0}</p>
                               <span className="text-[7px] uppercase tracking-widest text-gray-300">Shares</span>
                            </div>
                        </div>
                     </div>
                   ))}
                </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* MOBILE MODAL FORM */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm flex items-end p-4">
             <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="bg-white w-full rounded-[3rem] p-8 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-8">
                   <h3 className="text-xl font-black uppercase italic italic">{editingLink ? 'Refine Link' : 'New Masterpiece'}</h3>
                   <button onClick={() => { setShowForm(false); setEditingLink(null); }} className="w-10 h-10 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400"><X size={24} /></button>
                </div>
                <form onSubmit={handleCreateOrUpdateLink} className="space-y-6 pb-6">
                   <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase tracking-widest text-gray-300 ml-1">Content Title</label>
                        <input className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 font-bold" placeholder="e.g. My Latest Short" value={linkForm.title} onChange={(e) => setLinkForm({...linkForm, title: e.target.value})} required/>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase tracking-widest text-gray-300 ml-1">Destination URL</label>
                        <input className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 font-bold" placeholder="https://..." value={linkForm.url} onChange={(e) => setLinkForm({...linkForm, url: e.target.value})} required/>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-1">
                           <label className="text-[9px] font-black uppercase tracking-widest text-gray-300 ml-1">Content Type</label>
                           <select className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 font-bold appearance-none" value={linkForm.type} onChange={(e) => setLinkForm({...linkForm, type: e.target.value})}>
                              <option value="link">General Nav</option>
                              <option value="video">YouTube Video</option>
                           </select>
                         </div>
                         <div className="space-y-1">
                           <label className="text-[9px] font-black uppercase tracking-widest text-gray-300 ml-1">Status</label>
                           <select className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 font-bold appearance-none" value={linkForm.status} onChange={(e) => setLinkForm({...linkForm, status: e.target.value})}>
                              <option value="published">Active</option>
                              <option value="draft">Draft (Hidden)</option>
                           </select>
                         </div>
                      </div>
                   </div>

                   <div className="p-6 bg-indigo-50/50 rounded-[2rem] border border-indigo-100 space-y-6">
                      <div className="flex items-center space-x-2 text-indigo-600">
                         <Zap size={14} /> <span className="text-[9px] font-black uppercase tracking-[0.3em]">Schedule Engine</span>
                      </div>
                      <div className="grid grid-cols-1 gap-6">
                         <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">Promotion Start</label>
                            <input className="w-full p-3 bg-white border-2 border-indigo-100 rounded-xl outline-none font-bold text-xs" type="datetime-local" value={linkForm.startDate ? new Date(linkForm.startDate).toISOString().slice(0, 16) : ''} onChange={(e) => setLinkForm({...linkForm, startDate: e.target.value})}/>
                         </div>
                         <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">Promotion End (Archive)</label>
                            <input className="w-full p-3 bg-white border-2 border-red-50 rounded-xl outline-none font-bold text-xs text-red-500" type="datetime-local" value={linkForm.expiryDate ? new Date(linkForm.expiryDate).toISOString().slice(0, 16) : ''} onChange={(e) => setLinkForm({...linkForm, expiryDate: e.target.value})}/>
                         </div>
                      </div>
                      <button type="button" onClick={() => setLinkForm({...linkForm, startDate: null, expiryDate: null, status: 'published'})} className="text-[10px] font-black text-indigo-600 uppercase w-full">Fast Sync: Clear & Publish Now</button>
                   </div>

                   <button className="w-full bg-indigo-600 text-white font-black uppercase text-[12px] p-5 rounded-[2rem] shadow-xl shadow-indigo-100 transition-all active:scale-95">
                      {editingLink ? 'Save Changes' : 'Launch Content'}
                   </button>
                </form>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB - ADD BUTTON */}
      <button 
        onClick={() => { setEditingLink(null); setLinkForm({ title: '', url: '', buttonText: 'Visit', status: 'published', type: 'link', startDate: null, expiryDate: null }); setShowForm(true); }}
        className="fixed bottom-28 right-6 w-16 h-16 bg-white rounded-full shadow-[0_20px_50px_rgba(79,70,229,0.3)] shadow-indigo-100 flex items-center justify-center text-indigo-600 z-[900] border-4 border-indigo-50/50 hover:scale-110 active:scale-90 transition-all animate-pulse"
      >
        <Plus size={32} />
      </button>

      {/* PREMIUM BOTTOM NAV */}
      <nav className="fixed bottom-6 left-6 right-6 z-[1000] bg-white/90 backdrop-blur-2xl rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-indigo-100/50 flex items-center justify-around p-3">
         {[
           { id: 'links', icon: LayoutDashboard, label: 'Feed' },
           { id: 'profile', icon: UserIcon, label: 'Bio' },
           { id: 'theme', icon: Palette, label: 'Skin' },
           { id: 'analytics', icon: LineChart, label: 'Data' }
         ].map(tab => (
           <button
             key={tab.id}
             onClick={() => setActiveTab(tab.id)}
             className={`flex flex-col items-center p-3 rounded-[1.5rem] transition-all relative ${activeTab === tab.id ? 'text-indigo-600' : 'text-gray-300'}`}
           >
              <tab.icon size={22} fill={activeTab === tab.id ? 'currentColor' : 'transparent'} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
              <span className={`text-[8px] font-black uppercase tracking-[0.2em] mt-1.5 ${activeTab === tab.id ? 'opacity-100' : 'opacity-0'}`}>{tab.label}</span>
              {activeTab === tab.id && <motion.div layoutId="nav-bg" className="absolute -inset-0 bg-indigo-50/50 rounded-3xl -z-10" />}
           </button>
         ))}
      </nav>

    </div>
  );
};

export default AdminDashboard;
