import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Instagram, Youtube, ExternalLink, Share2, PlayCircle, Zap, TrendingUp, Users, Globe, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Landing = () => {
  const [profile, setProfile] = useState(null);
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [currentLinkPage, setCurrentLinkPage] = useState(1);
  const linksPerPage = 6;
  const navigate = useNavigate();

  const handleNextVideo = (total) => setCurrentVideoIndex((prev) => (prev + 1) % total);
  const handlePrevVideo = (total) => setCurrentVideoIndex((prev) => (prev - 1 + total) % total);

  useEffect(() => {
    const fetchPersonalData = async () => {
      try {
        const { data } = await api.get('/api/public/personal');
        if (data.profile) setProfile(data.profile);
        
        const dbLinks = data.links || [];
        const hasManualVideos = dbLinks.some(l => l.type === 'video');
        
        if (!hasManualVideos) {
          try {
            const channelId = 'UCn_q7Y6A1HxkF1b9iXW7b3w'; // Placeholder Nani Channel ID
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
    socialLinks: { youtube: 'https://youtube.com/@grow_vth_nani', instagram: 'https://instagram.com/grow_vth_nani' }
  };

  const sortedLinks = [...links].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const now = new Date();
  const activeLinks = sortedLinks.filter(link => {
    const start = link.startDate ? new Date(link.startDate) : null;
    const end = link.expiryDate ? new Date(link.expiryDate) : null;
    if (start && start > now) return false;
    if (end && end < now) return false;
    return true;
  });

  const videoLinks = activeLinks.filter(l => l.type === 'video');
  const generalLinks = activeLinks.filter(l => l.type !== 'video');
  const paginatedLinks = generalLinks.slice((currentLinkPage - 1) * linksPerPage, currentLinkPage * linksPerPage);
  const totalLinkPages = Math.ceil(generalLinks.length / linksPerPage);

  return (
    <div className="min-h-screen w-full bg-[#f8f9fc] flex justify-center selection:bg-indigo-100 overflow-x-hidden">
      <div className="w-full max-w-sm bg-white min-h-screen shadow-2xl relative flex flex-col font-inter overflow-y-auto max-h-screen no-scrollbar">
        
        {/* PREMIUM FIXED HEADER */}
        <header className="sticky top-0 z-[100] bg-white/95 backdrop-blur-md border-b-[3px] border-indigo-50 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100 transform -rotate-3 hover:rotate-0 transition-transform">
              <Zap size={18} className="text-white" fill="white" />
            </div>
            <span className="font-black text-[14px] uppercase tracking-tighter italic text-gray-900 leading-none pt-0.5">grow_vth_nani</span>
          </div>
          <div className="flex items-center space-x-4 text-gray-800">
             <Instagram size={20} className="hover:text-indigo-600 transition-colors cursor-pointer" />
             <Youtube size={20} className="hover:text-indigo-600 transition-colors cursor-pointer" />
          </div>
        </header>

        {/* PROFILE SECTION */}
        <div className="flex flex-col items-center pt-10 pb-6 relative">
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-indigo-50/40 to-transparent"></div>
          
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative mb-6 z-10">
            <div className="w-36 h-36 rounded-full ring-[12px] ring-indigo-50 p-1.5 bg-white shadow-2xl relative overflow-hidden group">
               <div className="w-full h-full rounded-full bg-gray-50 overflow-hidden flex items-center justify-center font-black text-5xl text-indigo-100 border-2 border-indigo-50">
                  {displayProfile.profilePicture ? (
                    <img src={displayProfile.profilePicture} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  ) : (
                    <img 
                      src={`https://unavatar.io/youtube/${displayProfile.creatorName || 'grow_vth_nani'}`} 
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.classList.remove('hidden'); }}
                    />
                  )}
                  <div className="hidden items-center justify-center w-full h-full bg-gradient-to-br from-indigo-500 to-indigo-700 text-white font-black italic">
                    {displayProfile.creatorName?.[0]}
                  </div>
               </div>
               <div className="absolute top-1 right-1 bg-white p-2.5 rounded-full shadow-lg border-2 border-gray-100 flex items-center justify-center">
                  <TrendingUp size={18} className="text-indigo-600" />
               </div>
            </div>
          </motion.div>

          <div className="text-center px-6 z-10 flex flex-col items-center">
             <h1 className="text-[38px] font-black uppercase tracking-tight italic text-gray-900 leading-none mb-3">
               {displayProfile.creatorName}
             </h1>
             <p className="text-[11px] font-black uppercase tracking-[0.25em] text-indigo-600 mb-6 px-4 leading-relaxed max-w-[280px]">
               Plan Today , Build Today , Launch Today  Repeat
             </p>
             <div className="inline-flex items-center bg-indigo-600 px-6 py-2.5 rounded-2xl shadow-xl shadow-indigo-100 space-x-2 border-4 border-white">
                <Zap size={11} className="text-white animate-pulse" fill="currentColor" />
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white">Verified Growth Partner</span>
             </div>
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="px-6 space-y-12 pb-16">
          
          {/* PILLARS */}
          <div className="grid grid-cols-3 gap-3">
            {[ { icon: Zap, label: 'Speed' }, { icon: TrendingUp, label: 'Growth' }, { icon: Users, label: 'Social' } ].map((p, i) => (
              <div key={i} className="bg-white border border-gray-100 px-3 py-5 rounded-[2.5rem] flex flex-col items-center shadow-sm hover:shadow-indigo-100 transition-all">
                <p.icon size={22} className="text-indigo-600 mb-2.5" />
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{p.label}</span>
              </div>
            ))}
          </div>

          {/* PUBLIC LINKS */}
          <section>
            <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-400 mb-6 flex items-center pl-1">
              <Globe size={14} className="mr-2.5 text-indigo-500" /> Essential Navigation
            </h2>
            <div className="space-y-4">
               {paginatedLinks.map((link) => (
                 <button
                   key={link._id || link.title}
                   onClick={() => handleLinkClick(link._id, link.url)}
                   className="w-full group bg-white border border-gray-100 p-6 rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all flex items-center justify-between relative overflow-hidden"
                 >
                   <div className="flex items-center space-x-5">
                     <div className="w-14 h-14 bg-indigo-50 rounded-[1.5rem] flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all transform group-hover:rotate-6">
                        <ExternalLink size={24} />
                     </div>
                     <span className="font-black text-[15px] uppercase tracking-tight text-gray-900 text-left line-clamp-1 italic">{link.title}</span>
                   </div>
                   <div onClick={(e) => handleShareClick(e, link)} className="p-3 text-gray-200 hover:text-indigo-600 transition-colors">
                     <Share2 size={18} />
                   </div>
                 </button>
               ))}

               {totalLinkPages > 1 && (
                 <div className="flex items-center justify-center space-x-8 pt-4">
                    <button disabled={currentLinkPage === 1} onClick={() => setCurrentLinkPage(p => p - 1)} className="w-12 h-12 bg-white border border-gray-100 rounded-2xl disabled:opacity-20 flex items-center justify-center shadow-sm"><ChevronLeft size={24} className="text-indigo-600" /></button>
                    <span className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">{currentLinkPage} / {totalLinkPages}</span>
                    <button disabled={currentLinkPage === totalLinkPages} onClick={() => setCurrentLinkPage(p => p + 1)} className="w-12 h-12 bg-white border border-gray-100 rounded-2xl disabled:opacity-20 flex items-center justify-center shadow-sm"><ChevronRight size={24} className="text-indigo-600" /></button>
                 </div>
               )}
            </div>
          </section>

          {/* VIDEOS */}
          {videoLinks.length > 0 && (
            <section>
               <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-400 mb-6 flex items-center pl-1">
                 <PlayCircle size={14} className="mr-2.5 text-red-500" /> Featured Content
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
                    <button onClick={() => handlePrevVideo(videoLinks.length)} className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-xl border-4 border-white active:scale-90 transition-all"><ChevronLeft size={24} /></button>
                  </div>
                  <div className="absolute inset-y-0 -right-4 flex items-center z-10">
                    <button onClick={() => handleNextVideo(videoLinks.length)} className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-xl border-4 border-white active:scale-90 transition-all"><ChevronRight size={24} /></button>
                  </div>
               </div>
               <p className="mt-6 text-center text-[11px] font-black text-indigo-400 uppercase tracking-[0.3em] italic px-6 line-clamp-1">{videoLinks[currentVideoIndex].title}</p>
            </section>
          )}

          {/* FOOTER */}
          <footer className="pt-12 flex flex-col items-center">
             <button onClick={() => navigate('/login')} className="flex items-center space-x-2 text-[11px] font-black uppercase text-gray-200 hover:text-indigo-600 transition-all tracking-widest">
                <Zap size={14} /> <span>Powered by grow_vth_nani</span>
             </button>
          </footer>

        </div>
      </div>
    </div>
  );
};

export default Landing;
