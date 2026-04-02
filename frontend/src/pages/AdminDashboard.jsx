import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { ExternalLink, Eye, LogOut, Pencil, Plus, Save, Search, Trash2 } from 'lucide-react';

const AdminDashboard = () => {
  const [links, setLinks] = useState([]);
  const [profile, setProfile] = useState({});
  const [activeTab, setActiveTab] = useState('links'); // 'links' | 'profile'
  const [loading, setLoading] = useState(true);
  const [editingLink, setEditingLink] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all | published | draft
  const [filterType, setFilterType] = useState('all'); // all | link | video
  
  const navigate = useNavigate();

  const [linkForm, setLinkForm] = useState({
    title: '',
    url: '',
    status: 'published',
    type: 'link',
    startDate: '',
    expiryDate: ''
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
      const payload = {
        ...linkForm,
        startDate: linkForm.startDate ? new Date(linkForm.startDate) : null,
        expiryDate: linkForm.expiryDate ? new Date(linkForm.expiryDate) : null,
      };

      if (editingLink) {
        await api.put(`/admin/links/${editingLink._id}`, payload);
        toast.success('Link updated');
      } else {
        await api.post('/admin/links', payload);
        toast.success('Link created');
      }
      setEditingLink(null);
      setLinkForm({ title: '', url: '', status: 'published', type: 'link', startDate: '', expiryDate: '' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Save failed');
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
      toast.success('Profile saved');
    } catch (error) {
      toast.error('Profile save failed');
    }
  };

  const sortedLinks = useMemo(() => {
    return [...links].sort((a, b) => {
      const aDate = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bDate = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bDate - aDate;
    });
  }, [links]);

  const filteredLinks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return sortedLinks.filter((link) => {
      const status = link.status || 'published';
      const type = link.type || 'link';
      if (filterStatus !== 'all' && status !== filterStatus) return false;
      if (filterType !== 'all' && type !== filterType) return false;
      if (!q) return true;
      const haystack = `${link.title || ''} ${link.url || ''}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [sortedLinks, searchQuery, filterStatus, filterType]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0c] text-white font-inter">
      <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" aria-label="Loading" />
    </div>
  );

  const beginCreate = () => {
    setEditingLink(null);
    setLinkForm({ title: '', url: '', status: 'published', type: 'link', startDate: '', expiryDate: '' });
  };

  const beginEdit = (link) => {
    setEditingLink(link);
    setLinkForm({
      title: link.title || '',
      url: link.url || '',
      status: link.status || 'published',
      type: link.type || 'link',
      startDate: link.startDate ? new Date(link.startDate).toISOString().slice(0, 16) : '',
      expiryDate: link.expiryDate ? new Date(link.expiryDate).toISOString().slice(0, 16) : '',
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white font-inter">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#0a0a0c]/90 backdrop-blur border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-black tracking-tight">Admin Dashboard</h1>
            <p className="text-xs text-gray-400 truncate">
              {profile.creatorName || profile.username || 'Admin'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.open('/', '_blank')}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-bold text-gray-200 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <Eye size={16} />
              <span className="hidden sm:inline">View landing</span>
            </button>
            <button
              type="button"
              onClick={() => { localStorage.clear(); navigate('/login'); }}
              className="inline-flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm font-bold text-red-200 hover:bg-red-500/15 focus:outline-none focus:ring-2 focus:ring-red-400"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-3">
          <div className="inline-flex rounded-xl border border-white/10 bg-white/5 p-1">
            {[
              { id: 'links', label: 'Links' },
              { id: 'profile', label: 'Profile' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`px-4 py-2 rounded-lg text-sm font-black focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  activeTab === t.id ? 'bg-white text-black' : 'text-gray-200 hover:bg-white/10'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {activeTab === 'links' && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Form */}
            <section className="lg:col-span-2 bg-[#111114] border border-white/10 rounded-2xl p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-black uppercase tracking-widest text-gray-300">
                  {editingLink ? 'Edit link' : 'Add link'}
                </h2>
                <button
                  type="button"
                  onClick={beginCreate}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-bold text-gray-200 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <Plus size={16} />
                  New
                </button>
              </div>

              <form onSubmit={handleCreateOrUpdateLink} className="mt-5 space-y-4">
                <div>
                  <label htmlFor="link-title" className="block text-xs font-black uppercase tracking-widest text-gray-400">
                    Title
                  </label>
                  <input
                    id="link-title"
                    className="mt-2 w-full rounded-xl bg-[#0a0a0c] border border-white/10 px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
                    value={linkForm.title}
                    onChange={(e) => setLinkForm({ ...linkForm, title: e.target.value })}
                    placeholder="e.g. My store"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="link-url" className="block text-xs font-black uppercase tracking-widest text-gray-400">
                    URL
                  </label>
                  <input
                    id="link-url"
                    className="mt-2 w-full rounded-xl bg-[#0a0a0c] border border-white/10 px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
                    value={linkForm.url}
                    onChange={(e) => setLinkForm({ ...linkForm, url: e.target.value })}
                    placeholder="https://..."
                    required
                    inputMode="url"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="link-type" className="block text-xs font-black uppercase tracking-widest text-gray-400">
                      Type
                    </label>
                    <select
                      id="link-type"
                      className="mt-2 w-full rounded-xl bg-[#0a0a0c] border border-white/10 px-4 py-3 text-sm font-black outline-none focus:ring-2 focus:ring-indigo-500"
                      value={linkForm.type}
                      onChange={(e) => setLinkForm({ ...linkForm, type: e.target.value })}
                    >
                      <option value="link">Link</option>
                      <option value="video">YouTube</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="link-status" className="block text-xs font-black uppercase tracking-widest text-gray-400">
                      Visibility
                    </label>
                    <select
                      id="link-status"
                      className="mt-2 w-full rounded-xl bg-[#0a0a0c] border border-white/10 px-4 py-3 text-sm font-black outline-none focus:ring-2 focus:ring-indigo-500"
                      value={linkForm.status}
                      onChange={(e) => setLinkForm({ ...linkForm, status: e.target.value })}
                    >
                      <option value="published">Published</option>
                      <option value="draft">Draft (hidden)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="link-start" className="block text-xs font-black uppercase tracking-widest text-gray-400">
                      Start (optional)
                    </label>
                    <input
                      id="link-start"
                      type="datetime-local"
                      className="mt-2 w-full rounded-xl bg-[#0a0a0c] border border-white/10 px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
                      value={linkForm.startDate}
                      onChange={(e) => setLinkForm({ ...linkForm, startDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <label htmlFor="link-expiry" className="block text-xs font-black uppercase tracking-widest text-gray-400">
                      Expiry (optional)
                    </label>
                    <input
                      id="link-expiry"
                      type="datetime-local"
                      className="mt-2 w-full rounded-xl bg-[#0a0a0c] border border-white/10 px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
                      value={linkForm.expiryDate}
                      onChange={(e) => setLinkForm({ ...linkForm, expiryDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-black text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  >
                    <Save size={16} />
                    {editingLink ? 'Save changes' : 'Create link'}
                  </button>

                  {editingLink && (
                    <button
                      type="button"
                      onClick={beginCreate}
                      className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-black text-gray-200 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </section>

            {/* Links list */}
            <section className="lg:col-span-3 bg-[#111114] border border-white/10 rounded-2xl p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-black uppercase tracking-widest text-gray-300">Your links</h2>
                <span className="text-xs font-bold text-gray-400">{filteredLinks.length} shown</span>
              </div>

              {/* Search + filters */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label htmlFor="links-search" className="sr-only">Search links</label>
                  <div className="flex items-center gap-2 rounded-xl bg-[#0a0a0c] border border-white/10 px-3 py-2 focus-within:ring-2 focus-within:ring-indigo-500">
                    <Search size={16} className="text-gray-500 shrink-0" />
                    <input
                      id="links-search"
                      className="w-full bg-transparent outline-none text-sm font-semibold placeholder:text-gray-600"
                      placeholder="Search title or URL..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="links-status" className="sr-only">Filter by status</label>
                  <select
                    id="links-status"
                    className="w-full rounded-xl bg-[#0a0a0c] border border-white/10 px-4 py-2.5 text-sm font-black outline-none focus:ring-2 focus:ring-indigo-500"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="all">All status</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="links-type" className="sr-only">Filter by type</label>
                  <select
                    id="links-type"
                    className="w-full rounded-xl bg-[#0a0a0c] border border-white/10 px-4 py-2.5 text-sm font-black outline-none focus:ring-2 focus:ring-indigo-500"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                  >
                    <option value="all">All types</option>
                    <option value="link">Link</option>
                    <option value="video">YouTube</option>
                  </select>
                </div>
              </div>

              <div className="mt-5 divide-y divide-white/10">
                {filteredLinks.length === 0 ? (
                  <p className="py-10 text-center text-sm text-gray-400">No links yet.</p>
                ) : (
                  filteredLinks.map((link) => (
                    <div key={link._id} className="py-4 flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-black text-sm text-white truncate max-w-[22rem]">
                            {link.title}
                          </p>
                          <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full border ${
                            (link.status || 'published') === 'published'
                              ? 'border-emerald-400/20 text-emerald-200 bg-emerald-500/10'
                              : 'border-amber-400/20 text-amber-200 bg-amber-500/10'
                          }`}>
                            {link.status || 'published'}
                          </span>
                          <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full border border-white/10 text-gray-200 bg-white/5">
                            {link.type || 'link'}
                          </span>
                        </div>

                        <a
                          href={link.url}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1 inline-flex items-center gap-2 text-xs text-gray-400 hover:text-gray-200 break-all"
                        >
                          <ExternalLink size={14} />
                          <span>{link.url}</span>
                        </a>

                        <p className="mt-2 text-xs text-gray-500">
                          Clicks: <span className="font-bold text-gray-300">{link.clickCount || 0}</span>
                          {' · '}
                          Shares: <span className="font-bold text-gray-300">{link.shareCount || 0}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => beginEdit(link)}
                          className="inline-flex items-center justify-center w-10 h-10 rounded-xl border border-white/10 bg-white/5 text-gray-200 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          aria-label={`Edit ${link.title}`}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteLink(link._id)}
                          className="inline-flex items-center justify-center w-10 h-10 rounded-xl border border-red-500/20 bg-red-500/10 text-red-200 hover:bg-red-500/15 focus:outline-none focus:ring-2 focus:ring-red-400"
                          aria-label={`Delete ${link.title}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'profile' && (
          <section className="bg-[#111114] border border-white/10 rounded-2xl p-5 sm:p-6 max-w-2xl">
            <h2 className="text-sm font-black uppercase tracking-widest text-gray-300">Profile</h2>

            <form onSubmit={handleUpdateProfile} className="mt-5 space-y-4">
              <div>
                <label htmlFor="profile-name" className="block text-xs font-black uppercase tracking-widest text-gray-400">
                  Display name
                </label>
                <input
                  id="profile-name"
                  className="mt-2 w-full rounded-xl bg-[#0a0a0c] border border-white/10 px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
                  value={profile.creatorName || ''}
                  onChange={(e) => setProfile({ ...profile, creatorName: e.target.value })}
                  placeholder="e.g. grow_vth_nani"
                />
              </div>

              <div>
                <label htmlFor="profile-bio" className="block text-xs font-black uppercase tracking-widest text-gray-400">
                  Caption / bio
                </label>
                <textarea
                  id="profile-bio"
                  className="mt-2 w-full rounded-xl bg-[#0a0a0c] border border-white/10 px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500 min-h-28"
                  value={profile.bio || ''}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  placeholder="Write a short caption..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="profile-instagram" className="block text-xs font-black uppercase tracking-widest text-gray-400">
                    Instagram URL
                  </label>
                  <input
                    id="profile-instagram"
                    className="mt-2 w-full rounded-xl bg-[#0a0a0c] border border-white/10 px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
                    value={profile.socialLinks?.instagram || ''}
                    onChange={(e) => setProfile({ ...profile, socialLinks: { ...profile.socialLinks, instagram: e.target.value } })}
                    placeholder="https://instagram.com/..."
                    inputMode="url"
                  />
                </div>
                <div>
                  <label htmlFor="profile-youtube" className="block text-xs font-black uppercase tracking-widest text-gray-400">
                    YouTube URL
                  </label>
                  <input
                    id="profile-youtube"
                    className="mt-2 w-full rounded-xl bg-[#0a0a0c] border border-white/10 px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
                    value={profile.socialLinks?.youtube || ''}
                    onChange={(e) => setProfile({ ...profile, socialLinks: { ...profile.socialLinks, youtube: e.target.value } })}
                    placeholder="https://youtube.com/@..."
                    inputMode="url"
                  />
                </div>
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-black text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  <Save size={16} />
                  Save profile
                </button>
              </div>
            </form>
          </section>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
