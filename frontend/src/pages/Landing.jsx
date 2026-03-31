import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Instagram, Youtube, ExternalLink, Share2, PlayCircle, Zap, TrendingUp, Users, Globe, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

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
    fetchPersonalData();
  }, []);

  const fetchPersonalData = async () => {
    try {
      const { data } = await api.get('/public/personal');
      if (data.profile) setProfile(data.profile);
      const dbLinks = data.links || [];
      
      const enrichedLinks = dbLinks.map(l => {
        const isYT = l.url?.includes('youtube.com') || l.url?.includes('youtu.be');
        if (isYT && l.type !== 'video') return { ...l, type: 'video' };
        return l;
      });

      const hasManualVideos = enrichedLinks.some(l => l.type === 'video');
      
      if (!hasManualVideos) {
        try {
          const channelId = 'UCn_q7Y6A1HxkF1b9iXW7b3w'; 
          const rssUrl = `https://api.rss2json.com/v1/api.json?rss_url=https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
          const rssRes = await fetch(rssUrl);
          const rssData = await rssRes.json();
          if (rssData.items) {
             const ytVideos = rssData.items.slice(0, 5).map(item => ({
                _id: item.guid, title: item.title, url: item.link, type: 'video', createdAt: new Date(item.pubDate)
             }));
             setLinks([...enrichedLinks, ...ytVideos]);
          } else { setLinks(enrichedLinks); }
        } catch (rssErr) { setLinks(enrichedLinks); }
      } else { setLinks(enrichedLinks); }
    } catch (err) { console.error('Profile fetch failed'); } finally { setLoading(false); }
  };

  const handleLinkClick = async (linkId, url) => {
    try {
      if (linkId) await api.get(`/public/link/${linkId}/click`);
      window.open(url, '_blank');
    } catch (err) { window.open(url, '_blank'); }
  };

  const handleShareClick = async (e, link) => {
    e.stopPropagation();
    try {
      if (link._id) await api.get(`/public/link/${link._id}/share`);
      if (navigator.share) { await navigator.share({ title: link.title, url: link.url }); } 
      else { await navigator.clipboard.writeText(link.url); alert('Link copied!'); }
    } catch (err) { console.error('Sharing failed', err); }
  };

  const getYTEmbedUrl = (url) => {
    const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) 
      ? `https://www.youtube.com/embed/${match[2]}?autoplay=1&mute=1&loop=1&playlist=${match[2]}` : null;
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafe] font-inter">
      <div className="w-12 h-12 border-[4px] border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  // 🛠️ Robust Display Profile with real fallbacks
  const displayProfile = {
    creatorName: profile?.creatorName || 'grow_vth_nani',
    bio: profile?.bio || 'Plan Today , Build Today , Launch Today Repeat',
    profilePicture: profile?.profilePicture,
    socialLinks: profile?.socialLinks || { youtube: 'https://youtube.com/@grow_vth_nani', instagram: 'https://instagram.com/grow_vth_nani' }
  };

  const sortedLinks = [...links].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const activeLinks = sortedLinks.filter(link => {
    const start = link.startDate ? new Date(link.startDate) : null;
    const end = link.expiryDate ? new Date(link.expiryDate) : null;
    if (start && start > new Date()) return false;
    if (end && end < new Date()) return false;
    return true;
  });

  const videoLinks = activeLinks.filter(l => l.type === 'video');
  const generalLinks = activeLinks.filter(l => l.type !== 'video');
  const paginatedLinks = generalLinks.slice((currentLinkPage - 1) * linksPerPage, currentLinkPage * linksPerPage);

  return (
    <div className="min-h-screen w-full bg-[#f8fafe] flex flex-col items-center selection:bg-indigo-600 selection:text-white p-0 sm:p-10 font-inter scroll-smooth">
      
      {/* BRAND MASTER HEADER */}
      <header className="sticky top-4 z-[1000] w-full max-w-sm bg-white/95 backdrop-blur-2xl border border-gray-100 px-6 py-5 flex items-center justify-between shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)] rounded-[2.5rem] mb-10 border-b-indigo-100">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200/50 transform -rotate-2">
            <Zap size={20} className="text-white" fill="white" />
          </div>
          <div>
            <span className="font-extrabold text-sm uppercase tracking-tighter italic text-gray-950 leading-none">{displayProfile.creatorName}</span>
            <div className="flex items-center space-x-1.5 mt-0.5 animate-pulse">
              <div className="w-1 h-1 bg-green-500 rounded-full shadow-green-500/50"></div>
              <span className="text-[9px] font-bold uppercase text-indigo-400 tracking-widest italic text-center">Protocol Active</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-4">
           <a href={displayProfile.socialLinks?.instagram} target="_blank" rel="noreferrer" className="p-2.5 bg-gray-50 rounded-xl hover:text-indigo-600 hover:bg-white transition-all shadow-sm border border-gray-100"><Instagram size={18} /></a>
           <a href={displayProfile.socialLinks?.youtube} target="_blank" rel="noreferrer" className="p-2.5 bg-gray-50 rounded-xl hover:text-indigo-600 hover:bg-white transition-all shadow-sm border border-gray-100"><Youtube size={18} /></a>
        </div>
      </header>

      {/* MOBILE CONTAINER FRAME */}
      <div className="w-full max-w-sm bg-white rounded-[4rem] shadow-[0_48px_96px_-24px_rgba(0,10,30,0.2)] relative flex flex-col border border-gray-100/50 mb-20">
        
        {/* PROFILE SECTION */}
        <div className="flex flex-col items-center pt-16 pb-12 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-56 bg-gradient-to-b from-indigo-50/80 via-indigo-50/20 to-transparent"></div>
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative mb-10 z-10">
            <div className="w-44 h-44 rounded-full ring-[18px] ring-white shadow-2xl relative overflow-hidden group border border-gray-100">
               <div className="w-full h-full rounded-full bg-gray-50 flex items-center justify-center">
                  {displayProfile.profilePicture ? ( <img src={displayProfile.profilePicture} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt="PFP" /> ) : (
                    <img src={`https://unavatar.io/youtube/${displayProfile.creatorName || 'grow_vth_nani'}`} className="w-full h-full object-cover" alt="YT" />
                  )}
               </div>
               <div className="absolute top-2 right-2 bg-white p-3.5 rounded-full shadow-xl border border-gray-50"><TrendingUp size={24} className="text-indigo-600" /></div>
            </div>
          </motion.div>
          <div className="text-center px-10 z-10 flex flex-col items-center">
             {/* ✅ SHOWING PROFILE NAME */}
             <h1 className="text-[48px] font-black uppercase tracking-tighter italic text-gray-950 leading-none mb-6">{displayProfile.creatorName}</h1>
             {/* ✅ SHOWING CAPTION (BIO) */}
             <p className="text-[14px] font-bold text-slate-700 mb-12 px-6 leading-relaxed max-w-[340px] text-center lowercase opacity-90">{displayProfile.bio}</p>
             <div className="inline-flex items-center bg-indigo-600 px-10 py-4 rounded-2xl shadow-2xl shadow-indigo-200/60 space-x-3 border-[6px] border-white ring-1 ring-gray-100 animate-slide-up">
                <Zap size={14} className="text-white animate-pulse" fill="currentColor" />
                <span className="text-xs font-black uppercase tracking-[0.25em] text-white">Verified Partner</span>
             </div>
          </div>
        </div>

        <div className="px-8 space-y-20 pb-28 relative">
            {/* MISSION CONTROLS (LINKS) */}
            <section>
              <h2 className="text-[12px] font-black uppercase tracking-[0.45em] text-slate-400 mb-12 flex items-center pl-1"><Globe size={20} className="mr-5 text-indigo-500" /> Mission Controls</h2>
              {paginatedLinks.length > 0 ? (
                <div className="space-y-7">
                  {paginatedLinks.map((link) => (
                    <button key={link._id || link.title} onClick={() => handleLinkClick(link._id, link.url)} className="w-full group bg-white border border-gray-100 p-8 rounded-[3.5rem] shadow-sm hover:shadow-[0_40px_80px_-20px_rgba(79,70,229,0.18)] hover:-translate-y-3 transition-all flex items-center justify-between relative overflow-hidden">
                      <div className="flex items-center space-x-7">
                        <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center text-gray-950 group-hover:bg-indigo-600 group-hover:text-white transition-all transform group-hover:rotate-6 shadow-sm"><ExternalLink size={32} /></div>
                        <span className="font-black text-xl uppercase tracking-tighter text-gray-950 text-left line-clamp-1 italic">{link.title}</span>
                      </div>
                      <div onClick={(e) => handleShareClick(e, link)} className="p-4 text-gray-300 hover:text-indigo-600 transition-all"><Share2 size={26} /></div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="py-24 border-2 border-dashed border-gray-100 rounded-[4rem] text-center"><p className="text-[12px] font-black text-gray-200 uppercase tracking-[0.5em] italic">No Mission Protocols Detected</p></div>
              )}
            </section>

            {/* LATEST INSIGHTS (VIDEOS) */}
            {videoLinks.length > 0 && (
              <section>
                 <h2 className="text-[12px] font-black uppercase tracking-[0.45em] text-slate-400 mb-12 flex items-center pl-1"><PlayCircle size={20} className="mr-5 text-red-500" /> Latest Insights</h2>
                 <div className="relative group p-1 bg-white rounded-[3.1rem] border border-gray-100 shadow-[0_60px_100px_-20px_rgba(0,0,0,0.12)] overflow-hidden">
                    <div className="aspect-video bg-black rounded-[3rem] overflow-hidden relative z-0">
                      {getYTEmbedUrl(videoLinks[currentVideoIndex].url) && <iframe key={currentVideoIndex} width="100%" height="100%" src={getYTEmbedUrl(videoLinks[currentVideoIndex].url)} frameBorder="0" allowFullScreen className="w-full h-full" />}
                    </div>
                    <div className="absolute inset-y-0 left-4 flex items-center z-10"><button onClick={() => handlePrevVideo(videoLinks.length)} className="w-14 h-14 bg-white/40 backdrop-blur-xl text-white rounded-2xl flex items-center justify-center active:scale-90 transition-all font-black hover:bg-white/60 border border-white/20"><ChevronLeft size={28} /></button></div>
                    <div className="absolute inset-y-0 right-4 flex items-center z-10"><button onClick={() => handleNextVideo(videoLinks.length)} className="w-14 h-14 bg-white/40 backdrop-blur-xl text-white rounded-2xl flex items-center justify-center active:scale-90 transition-all font-black hover:bg-white/60 border border-white/20"><ChevronRight size={28} /></button></div>
                 </div>
              </section>
            )}
          
            {/* BRAND PILLARS */}
            <div className="grid grid-cols-3 gap-6 pt-6 pb-6">
              {[ { icon: Zap, label: 'Speed' }, { icon: TrendingUp, label: 'Growth' }, { icon: Users, label: 'Social' } ].map((p, i) => (
                <div key={i} className="bg-white border border-gray-100 px-4 py-10 rounded-[3rem] flex flex-col items-center shadow-xl shadow-gray-100/30"><p.icon size={36} className="text-indigo-600 mb-5" /><span className="text-[13px] font-black uppercase tracking-[0.25em] text-slate-400">{p.label}</span></div>
              ))}
            </div>

            <footer className="pt-28 pb-12 flex flex-col items-center border-t border-gray-50">
              <button onClick={() => navigate('/login')} className="flex items-center space-x-5 text-xs font-black uppercase text-slate-300 hover:text-indigo-600 hover:scale-110 transition-all tracking-[0.5em]"><Zap size={24} className="mb-0.5" /> <span>Powered by vth_nani ecosystem</span></button>
            </footer>
        </div>
      </div>
    </div>
  );
};

export default Landing;
