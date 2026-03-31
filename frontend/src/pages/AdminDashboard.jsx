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
  Palette
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

  // Form states for new/edit link
  const [linkForm, setLinkForm] = useState({
    title: '',
    url: '',
    buttonText: 'Visit',
    status: 'published'
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
      setLinkForm({ title: '', url: '', buttonText: 'Visit', status: 'published' });
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

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-inter">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-100 flex flex-col shadow-sm">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-indigo-600 font-outfit flex items-center">
            <LinkIcon className="mr-2" /> Admin
          </h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          <button 
            onClick={() => setActiveTab('links')}
            className={`w-full flex items-center p-3 rounded-xl transition-all ${activeTab === 'links' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <LinkIcon size={20} className="mr-3" /> Links
          </button>
          <button 
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center p-3 rounded-xl transition-all ${activeTab === 'profile' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <UserIcon size={20} className="mr-3" /> Profile
          </button>
          <button 
            onClick={() => setActiveTab('theme')}
            className={`w-full flex items-center p-3 rounded-xl transition-all ${activeTab === 'theme' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <Palette size={20} className="mr-3" /> Appearance
          </button>
          <button 
            onClick={() => setActiveTab('analytics')}
            className={`w-full flex items-center p-3 rounded-xl transition-all ${activeTab === 'analytics' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <Eye size={20} className="mr-3" /> Analytics
          </button>
        </nav>

        <div className="p-4 border-t border-gray-100">
          <a 
            href={`/profile/${profile.username}`} 
            target="_blank" 
            rel="noreferrer"
            className="w-full flex items-center p-3 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all font-semibold"
          >
            <Eye size={20} className="mr-3" /> View Public Page
          </a>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all mt-2"
          >
            <LogOut size={20} className="mr-3" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto max-h-screen">
        <AnimatePresence mode="wait">
          {activeTab === 'links' && (
            <motion.div 
              key="links"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-4xl mx-auto"
            >
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-3xl font-bold font-outfit text-gray-900">My Links</h2>
                  <p className="text-gray-500">Manage your published and draft links</p>
                </div>
                <button 
                  onClick={() => {
                    setEditingLink(null);
                    setLinkForm({ title: '', url: '', buttonText: 'Visit', status: 'published' });
                    setShowForm(!showForm);
                  }}
                  className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 shadow-lg flex items-center space-x-2 font-bold transition-all"
                >
                  <Plus size={20} />
                  <span>{showForm ? 'Cancel' : 'Add Link'}</span>
                </button>
              </div>

              {showForm && (
                <div className="bg-white p-6 rounded-2xl shadow-md border border-indigo-100 mb-8 animate-slide-up">
                  <h3 className="text-xl font-bold mb-4 font-outfit">{editingLink ? 'Edit Link' : 'Add New Link'}</h3>
                  <form onSubmit={handleCreateOrUpdateLink} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input 
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-indigo-600"
                      placeholder="Title (e.g. My Website)"
                      value={linkForm.title}
                      onChange={(e) => setLinkForm({...linkForm, title: e.target.value})}
                      required
                    />
                    <input 
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-indigo-600"
                      placeholder="URL (e.g. https://...)"
                      value={linkForm.url}
                      onChange={(e) => setLinkForm({...linkForm, url: e.target.value})}
                      required
                    />
                    <input 
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-indigo-600"
                      placeholder="Button Text"
                      value={linkForm.buttonText}
                      onChange={(e) => setLinkForm({...linkForm, buttonText: e.target.value})}
                    />
                    <select 
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-indigo-600"
                      value={linkForm.type || 'link'}
                      onChange={(e) => setLinkForm({...linkForm, type: e.target.value})}
                    >
                      <option value="link">General Link</option>
                      <option value="video">YouTube/Video Link</option>
                    </select>
                    <select 
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-indigo-600 appearance-none"
                      value={linkForm.status}
                      onChange={(e) => setLinkForm({...linkForm, status: e.target.value})}
                    >
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                    </select>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:col-span-2 p-5 bg-indigo-50/50 rounded-[2rem] border border-indigo-100/50">
                       <div className="md:col-span-2 flex items-center space-x-2 text-indigo-600 mb-2">
                          <Zap size={16} />
                          <span className="text-[10px] font-black uppercase tracking-widest">Link Scheduling</span>
                       </div>
                       
                       <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase text-gray-400 block ml-1">Start Promoting (Optional)</label>
                          <input 
                            className="w-full p-3 bg-white border border-gray-100 rounded-xl outline-none focus:border-indigo-600 font-bold text-xs"
                            type="datetime-local"
                            value={linkForm.startDate ? new Date(linkForm.startDate).toISOString().slice(0, 16) : ''}
                            onChange={(e) => setLinkForm({...linkForm, startDate: e.target.value})}
                          />
                       </div>

                       <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase text-gray-400 block ml-1">Archive Link (Optional)</label>
                          <input 
                             className="w-full p-3 bg-white border border-gray-100 rounded-xl outline-none focus:border-indigo-600 font-bold text-xs text-red-500"
                             type="datetime-local"
                             value={linkForm.expiryDate ? new Date(linkForm.expiryDate).toISOString().slice(0, 16) : ''}
                             onChange={(e) => setLinkForm({...linkForm, expiryDate: e.target.value})}
                          />
                       </div>

                       <div className="md:col-span-2 pt-2">
                          <button 
                            type="button"
                            onClick={() => setLinkForm({...linkForm, startDate: null, expiryDate: null, status: 'published'})}
                            className="text-[10px] font-black text-indigo-600 uppercase hover:underline"
                          >
                             ← Clear Scheduling & Publish Now
                          </button>
                       </div>
                    </div>
                    <button className="md:col-span-2 bg-indigo-600 text-white font-bold p-3 rounded-xl hover:bg-indigo-700 transition-all">
                      {editingLink ? 'Update Link' : 'Save Link'}
                    </button>
                  </form>
                </div>
              )}

              <div className="space-y-4">
                {links.map((link) => (
                  <div key={link._id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md transition-all">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                        <LinkIcon size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{link.title}</h4>
                        <div className="flex items-center space-x-2 text-sm text-gray-400">
                          <span className="truncate max-w-[150px]">{link.url}</span>
                          <span>•</span>
                          <span className="font-bold text-indigo-500 whitespace-nowrap">{link.clickCount || 0} clicks</span>
                          <span>•</span>
                          <span className="font-bold text-purple-600 whitespace-nowrap">{link.shareCount || 0} shares</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                       <span className={`px-3 py-1 rounded-full text-xs font-bold ${link.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {link.status}
                      </span>
                      <button 
                        onClick={() => {
                          setEditingLink(link);
                          setLinkForm(link);
                          setShowForm(true);
                        }}
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDeleteLink(link._id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}

                {links.length === 0 && !showForm && (
                  <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                    <LinkIcon className="mx-auto mb-4 text-gray-300" size={48} />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No links yet</h3>
                    <p className="text-gray-500">Add your first link to show the world!</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div 
               key="profile"
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
               className="max-w-2xl mx-auto"
            >
               <h2 className="text-3xl font-bold font-outfit text-gray-900 mb-8">Profile Settings</h2>
               <form onSubmit={handleUpdateProfile} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
                 <div className="flex flex-col items-center mb-8">
                   <div className="w-24 h-24 rounded-full bg-gray-100 mb-4 overflow-hidden border-4 border-white shadow-md">
                     {profile.profilePicture ? (
                       <img src={profile.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                     ) : (
                       <div className="w-full h-full flex items-center justify-center text-gray-400">
                         <UserIcon size={40} />
                       </div>
                     )}
                   </div>
                   <input 
                     type="file" 
                     id="profile-pic" 
                     className="hidden" 
                     accept="image/*"
                     onChange={async (e) => {
                       const file = e.target.files[0];
                       if (!file) return;
                       const formData = new FormData();
                       formData.append('image', file);
                       try {
                         const { data } = await api.post('/upload', formData);
                         setProfile({ ...profile, profilePicture: data.url });
                         toast.success('Picture uploaded');
                       } catch (err) {
                         toast.error('Upload failed');
                       }
                     }}
                   />
                   <label htmlFor="profile-pic" className="text-indigo-600 font-bold cursor-pointer hover:underline">
                     Change Photo
                   </label>
                 </div>

                 <div className="space-y-2">
                   <label className="text-sm font-bold text-gray-700">Display Name</label>
                   <input 
                     className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-indigo-600"
                     value={profile.creatorName || ''}
                     onChange={(e) => setProfile({ ...profile, creatorName: e.target.value })}
                     placeholder="How you appear on your page"
                   />
                 </div>
                 <div className="space-y-2">
                   <label className="text-sm font-bold text-gray-700">Bio / Description</label>
                   <textarea 
                     className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-indigo-600 h-32"
                     value={profile.bio || ''}
                     onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                     placeholder="Tell the world about yourself..."
                   />
                 </div>
                 <div>
                   <h4 className="font-bold mb-4">Social Links</h4>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {['instagram', 'twitter', 'youtube', 'tiktok'].map(platform => (
                       <div key={platform} className="space-y-1">
                         <label className="text-xs font-bold text-gray-500 capitalize">{platform}</label>
                         <input 
                           className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-indigo-600"
                           value={profile.socialLinks?.[platform] || ''}
                           onChange={(e) => setProfile({ 
                             ...profile, 
                             socialLinks: { ...profile.socialLinks, [platform]: e.target.value } 
                           })}
                           placeholder="URL"
                         />
                       </div>
                     ))}
                   </div>
                 </div>
                 <button className="w-full bg-indigo-600 text-white font-bold p-4 rounded-2xl hover:bg-indigo-700 shadow-lg transition-all flex items-center justify-center space-x-2">
                    <Save size={20} />
                    <span>Save Changes</span>
                 </button>
               </form>
            </motion.div>
          )}

          {activeTab === 'theme' && (
            <motion.div 
               key="theme"
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
               className="max-w-2xl mx-auto"
            >
               <h2 className="text-3xl font-bold font-outfit text-gray-900 mb-8">Page Appearance</h2>
               <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-8">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <h4 className="font-bold flex items-center"><div className="w-4 h-4 rounded-full mr-2" style={{backgroundColor: profile.theme?.backgroundColor}}></div> Background Color</h4>
                      <input 
                        type="color" 
                        className="w-full h-12 p-1 bg-white border border-gray-200 rounded-xl cursor-pointer"
                        value={profile.theme?.backgroundColor || '#f3f4f6'}
                        onChange={(e) => setProfile({
                          ...profile,
                          theme: { ...profile.theme, backgroundColor: e.target.value }
                        })}
                      />
                    </div>
                    <div className="space-y-4">
                      <h4 className="font-bold flex items-center"><div className="w-4 h-4 rounded-full mr-2" style={{backgroundColor: profile.theme?.buttonColor}}></div> Button Color</h4>
                      <input 
                        type="color" 
                        className="w-full h-12 p-1 bg-white border border-gray-200 rounded-xl cursor-pointer"
                        value={profile.theme?.buttonColor || '#3b82f6'}
                        onChange={(e) => setProfile({
                          ...profile,
                          theme: { ...profile.theme, buttonColor: e.target.value }
                        })}
                      />
                    </div>
                 </div>
                 <button 
                   onClick={handleUpdateProfile}
                   className="w-full bg-indigo-600 text-white font-bold p-4 rounded-2xl hover:bg-indigo-700 shadow-lg transition-all"
                 >
                    Apply Theme
                 </button>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default AdminDashboard;
