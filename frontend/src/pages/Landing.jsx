import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Instagram, Youtube, Music, ExternalLink, Share2, PlayCircle, Zap, TrendingUp, Users, Globe, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Landing = () => {
  const [profile, setProfile] = useState(null);
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adminCode, setAdminCode] = useState('');
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [currentLinkPage, setCurrentLinkPage] = useState(1);
  const linksPerPage = 6;
  const videoRef = React.useRef(null);
  const navigate = useNavigate();

  const handleNextVideo = (total) => {
    setCurrentVideoIndex((prev) => (prev + 1) % total);
  };

  const handlePrevVideo = (total) => {
    setCurrentVideoIndex((prev) => (prev - 1 + total) % total);
  };

  useEffect(() => {
    const fetchPersonalData = async () => {
      try {
        const { data } = await api.get('/api/public/personal');
        if (data.profile) setProfile(data.profile);
        
        const dbLinks = data.links || [];
        const hasManualVideos = dbLinks.some(l => l.type === 'video');
        
        // If no videos manually added, try to auto-fetch from YouTube RSS
        if (!hasManualVideos) {
          try {
            // Note: Channel ID for @grow_vth_nani. In a real app, this would be in profile settings.
            const channelId = 'UCn_q7Y6A1HxkF1b9iXW7b3w'; // Placeholder ID for the user's handle
            const rssUrl = `https://api.rss2json.com/v1/api.json?rss_url=https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
            const rssRes = await fetch(rssUrl);
            const rssData = await rssRes.json();
            
            if (rssData.items) {
               const ytVideos = rssData.items.slice(0, 5).map(item => ({
                  _id: item.guid,
                  title: item.title,
                  url: item.link,
                  type: 'video',
                  createdAt: new Date(item.pubDate)
               }));
               setLinks([...dbLinks, ...ytVideos]);
            } else {
               setLinks(dbLinks);
            }
          } catch (rssErr) {
            setLinks(dbLinks);
          }
        } else {
          setLinks(dbLinks);
        }

      } catch (err) {
        console.error('Profile fetch failed');
      } finally {
        setLoading(false);
      }
    };
    fetchPersonalData();
  }, []);

  const handleLinkClick = async (linkId, url) => {
    try {
      if (linkId) await api.get(`/api/public/link/${linkId}/click`);
      window.open(url, '_blank');
    } catch (err) {
      window.open(url, '_blank');
    }
  };

  const handleShareClick = async (e, link) => {
    e.stopPropagation();
    try {
      if (link._id) await api.get(`/api/public/link/${link._id}/share`);
      if (navigator.share) {
        await navigator.share({ title: link.title, url: link.url });
      } else {
        await navigator.clipboard.writeText(link.url);
        alert('Link copied!');
      }
    } catch (err) {
      console.error('Sharing failed', err);
    }
  };

  const getYTEmbedUrl = (url) => {
    const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) 
      ? `https://www.youtube.com/embed/${match[2]}?autoplay=1&mute=1&loop=1&playlist=${match[2]}` 
      : null;
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const displayProfile = profile || {
    creatorName: 'grow_vth_nani',
    socialLinks: { youtube: 'https://youtube.com/@grow_vth_nani', instagram: 'https://instagram.com/grow_vth_nani' },
    theme: { backgroundColor: '#ffffff', textColor: '#111827' }
  };

  const defaultLinks = [
    { _id: null, title: 'Check out our latest Workshop', url: 'https://youtube.com/watch?v=dQw4w9WgXcQ', type: 'video', createdAt: new Date() },
    { _id: null, title: 'Download Growth Checklist', url: 'https://instagram.com/grow_vth_nani', type: 'link', createdAt: new Date() }
  ];

  const sortedLinks = [...links].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const finalLinks = links.length > 0 ? sortedLinks : defaultLinks;
  
  // SCHEDULER FILTER: Hide if not started or if expired
  const now = new Date();
  const activeLinks = finalLinks.filter(link => {
    const start = link.startDate ? new Date(link.startDate) : null;
    const end = link.expiryDate ? new Date(link.expiryDate) : null;
    if (start && start > now) return false;
    if (end && end < now) return false;
    return true;
  });

  const videoLinks = activeLinks.filter(l => l.type === 'video');
  const generalLinks = activeLinks.filter(l => l.type !== 'video');

  const totalLinkPages = Math.ceil(generalLinks.length / linksPerPage);
  const paginatedLinks = generalLinks.slice((currentLinkPage - 1) * linksPerPage, currentLinkPage * linksPerPage);

  return (
    <div className="min-h-screen w-full bg-[#f0f0f0] flex justify-center overflow-x-hidden">
      <div className="w-full max-w-sm bg-white min-h-screen shadow-2xl relative flex flex-col font-inter overflow-y-auto overflow-x-hidden max-h-screen scroll-smooth">
        
        {/* SOLID STICKY HEADER */}
        <header className="sticky top-0 z-[100] bg-white border-b-2 border-indigo-50 px-5 py-5 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
              <Zap size={15} className="text-white" fill="white" />
            </div>
            <span className="font-black text-[13px] uppercase tracking-tighter italic text-gray-900 leading-none">grow_vth_nani</span>
          </div>
          <div className="flex items-center space-x-4 text-gray-800">
             <Instagram size={19} className="hover:text-indigo-600 transition-colors cursor-pointer" />
             <Youtube size={19} className="hover:text-indigo-600 transition-colors cursor-pointer" />
          </div>
        </header>

        {/* PROFILE SECTION */}
        <div className="flex flex-col items-center pt-8 pb-4 relative">
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-indigo-50/30 to-transparent"></div>
          
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative mb-5 z-10">
            <div className="w-32 h-32 rounded-full ring-8 ring-indigo-50 p-1.5 bg-white shadow-2xl relative transition-transform hover:scale-105 duration-500">
               <div className="w-full h-full rounded-full bg-gray-50 overflow-hidden flex items-center justify-center font-black text-4xl text-indigo-600 uppercase italic border-2 border-indigo-100">
                  {displayProfile.profilePicture ? (
                    <img src={displayProfile.profilePicture} className="w-full h-full object-cover" />
                  ) : (
                    <img 
                      src={`https://unavatar.io/youtube/${displayProfile.creatorName || 'grow_vth_nani'}`} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  )}
                  <div className="hidden items-center justify-center w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                    {displayProfile.creatorName?.[0]}
                  </div>
               </div>
              <div className="absolute top-0 right-0 bg-white p-2.5 rounded-full shadow-lg border border-gray-100 flex items-center justify-center">
                 <TrendingUp size={16} className="text-indigo-600" />
              </div>
            </div>
          </motion.div>

             <div className="mt-6 flex flex-col items-center text-center">
                <h1 className="text-[34px] font-black uppercase tracking-tight italic text-gray-900 leading-none mb-3">
                  {displayProfile.creatorName}
                </h1>
                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-4 px-8">
                  Plan Today , Build Today , Launch Today  Repeat
                </p>
                <div className="inline-flex items-center bg-indigo-600 px-5 py-2 rounded-2xl shadow-xl shadow-indigo-100 space-x-2">
                   <Zap size={10} className="text-white animate-pulse" fill="currentColor" />
                   <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Verified Growth Partner</span>
                </div>
             </div>
        </div>

        {/* PILLARS - Tightened Layout */}
        <div className="grid grid-cols-3 gap-3 px-6 mb-8 mt-4">
          {[ { icon: Zap, label: 'Speed' }, { icon: TrendingUp, label: 'Growth' }, { icon: Users, label: 'Social' } ].map((p, i) => (
            <div key={i} className="bg-white border border-gray-100 px-3 py-4 rounded-[2rem] flex flex-col items-center shadow-sm">
              <p.icon size={20} className="text-indigo-600 mb-2.5" />
              <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">{p.label}</span>
            </div>
          ))}
        </div>

        {/* ESSENTIAL NAVIGATION - Public Links */}
        <section className="px-6 mb-10">
          <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400 mb-5 flex items-center">
            <Globe size={14} className="mr-2 text-indigo-500" /> Essential Navigation
          </h2>
          <div className="space-y-3.5">
             {paginatedLinks.map((link) => (
               <button
                 key={link._id || link.title}
                 onClick={() => handleLinkClick(link._id, link.url)}
                 className="w-full group bg-white border border-gray-50 p-5 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-between relative overflow-hidden"
               >
                 <div className="flex items-center space-x-4">
                   <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <ExternalLink size={20} />
                   </div>
                   <span className="font-black text-sm uppercase tracking-tight text-gray-800 text-left line-clamp-1 max-w-[160px]">{link.title}</span>
                 </div>
                 <div onClick={(e) => handleShareClick(e, link)} className="p-2 text-gray-200 hover:text-indigo-600 transition-colors">
                   <Share2 size={16} />
                 </div>
               </button>
             ))}

             {totalLinkPages > 1 && (
               <div className="flex items-center justify-center space-x-6 pt-4">
                  <button disabled={currentLinkPage === 1} onClick={() => setCurrentLinkPage(p => p - 1)} className="p-3 border border-gray-50 rounded-2xl disabled:opacity-20 hover:bg-gray-50"><ChevronLeft size={20} className="text-indigo-600" /></button>
                  <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Pg {currentLinkPage} / {totalLinkPages}</span>
                  <button disabled={currentLinkPage === totalLinkPages} onClick={() => setCurrentLinkPage(p => p + 1)} className="p-3 border border-gray-50 rounded-2xl disabled:opacity-20 hover:bg-gray-50"><ChevronRight size={20} className="text-indigo-600" /></button>
               </div>
             )}
          </div>
        </section>

        {/* VIDEOS - Redesigned Card */}
        {videoLinks.length > 0 && (
          <section className="px-6 mb-12">
             <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400 mb-5 flex items-center">
               <PlayCircle size={14} className="mr-2 text-red-500" /> Featured Content
             </h2>
             <div className="relative">
                <div className="aspect-video bg-black rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white relative z-0">
                  {getYTEmbedUrl(videoLinks[currentVideoIndex].url) && (
                    <iframe 
                      key={currentVideoIndex} 
                      width="100%" height="100%" 
                      src={getYTEmbedUrl(videoLinks[currentVideoIndex].url)} 
                      frameBorder="0" allowFullScreen 
                    />
                  )}
                </div>
                <div className="absolute inset-y-0 -left-4 flex items-center z-10">
                  <button onClick={() => handlePrevVideo(videoLinks.length)} className="w-10 h-10 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-xl border-4 border-white active:scale-90 transition-all"><ChevronLeft size={20} /></button>
                </div>
                <div className="absolute inset-y-0 -right-4 flex items-center z-10">
                  <button onClick={() => handleNextVideo(videoLinks.length)} className="w-10 h-10 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-xl border-4 border-white active:scale-90 transition-all"><ChevronRight size={20} /></button>
                </div>
             </div>
             <p className="mt-5 text-center text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] italic px-4 line-clamp-1">{videoLinks[currentVideoIndex].title}</p>
          </section>
        )}

        {/* FOOTER */}
        <footer className="mt-auto pt-10 pb-16 flex flex-col items-center px-6">
           <button onClick={() => navigate('/login')} className="flex items-center space-x-2 text-[10px] font-black uppercase text-gray-200 hover:text-indigo-600 transition-colors">
              <Zap size={14} /> <span>Powered by grow_vth_nani</span>
           </button>
        </footer>

      </div>
    </div>
  );
};

export default Landing;
