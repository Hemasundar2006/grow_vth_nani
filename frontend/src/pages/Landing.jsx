import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ExternalLink, Instagram, PlayCircle, Youtube, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const Landing = () => {
  const [profile, setProfile] = useState(null);
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [showPromo, setShowPromo] = useState(true);
  const navigate = useNavigate();

  const fadeUp = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
  };

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
  };

  const handleNextVideo = (total) => setCurrentVideoIndex((prev) => (prev + 1) % total);
  const handlePrevVideo = (total) => setCurrentVideoIndex((prev) => (prev - 1 + total) % total);

  useEffect(() => {
    fetchPersonalData();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setShowPromo(false), 8000);
    return () => clearTimeout(t);
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

  const getYTEmbedUrl = (url) => {
    if (!url) return null;

    // Supports common YouTube URL formats admins paste:
    // - youtube.com/watch?v=VIDEOID
    // - youtu.be/VIDEOID
    // - youtube.com/embed/VIDEOID
    // - youtube.com/shorts/VIDEOID
    // - youtube.com/live/VIDEOID
    const regExp = /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/|v\/))([A-Za-z0-9_-]{11})/;
    const match = String(url).match(regExp);
    if (!match?.[1]) return null;

    const videoId = match[1];
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&playsinline=1`;
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafe] font-inter">
      <div className="w-12 h-12 border-[4px] border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  // 🛠️ Robust Display Profile with real fallbacks
  const displayProfile = {
    creatorName:
      (profile?.creatorName && String(profile.creatorName).trim()) ? String(profile.creatorName).trim() : 'grow_vth_nani',
    bio:
      (profile?.bio && String(profile.bio).trim()) ? String(profile.bio).trim() : 'Plan Today , Build Today , Launch Today Repeat',
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

  // Only treat as "video" if we can actually build an iframe.
  // Otherwise, show it as a normal external link button.
  const videoLinks = activeLinks.filter(l => l.type === 'video' && getYTEmbedUrl(l.url));
  const topLinks = activeLinks.filter(link => !(link.type === 'video' && getYTEmbedUrl(link.url))).slice(0, 6);

  const currentVideo = videoLinks[currentVideoIndex];
  const currentVideoEmbedUrl = currentVideo ? getYTEmbedUrl(currentVideo.url) : null;

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#fff1f6] via-[#fff7fb] to-[#ffffff] flex flex-col items-center selection:bg-pink-600 selection:text-white px-5 py-8 font-inter scroll-smooth">
      <motion.div
        className="w-full max-w-sm space-y-6"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {/* Floating promo (no layout space) */}
        <AnimatePresence>
          {showPromo && (displayProfile.socialLinks?.youtube || displayProfile.socialLinks?.instagram) && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center px-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              onClick={() => setShowPromo(false)}
              role="dialog"
              aria-modal="true"
              aria-label="Promotion"
            >
              {/* backdrop (clicking empty space closes) */}
              <div className="absolute inset-0 bg-black/25 backdrop-blur-sm" />

              <motion.div
                className="relative w-full max-w-sm rounded-[1.8rem] border border-pink-100 bg-gradient-to-br from-white/95 via-white/85 to-[#fff1f6] p-5 text-left shadow-[0_26px_70px_-30px_rgba(236,72,153,0.45)]"
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{
                  opacity: 1,
                  y: [0, -3, 0],
                  scale: 1,
                  boxShadow: [
                    '0 22px 60px -32px rgba(236,72,153,0.32)',
                    '0 30px 78px -30px rgba(236,72,153,0.55)',
                    '0 22px 60px -32px rgba(236,72,153,0.32)'
                  ]
                }}
                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                transition={{
                  opacity: { duration: 0.2, ease: 'easeOut' },
                  y: { duration: 2.6, repeat: Infinity, ease: 'easeInOut' },
                  boxShadow: { duration: 2.6, repeat: Infinity, ease: 'easeInOut' },
                  scale: { duration: 0.2, ease: 'easeOut' }
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => setShowPromo(false)}
                  className="absolute top-3 right-3 w-10 h-10 rounded-2xl border border-pink-100 bg-white/80 flex items-center justify-center text-pink-500 hover:bg-white focus:outline-none focus:ring-2 focus:ring-pink-400"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl overflow-hidden border border-pink-100 bg-[#fff7fb] shrink-0">
                      <img
                        src={
                          displayProfile.profilePicture
                            ? displayProfile.profilePicture
                            : `https://unavatar.io/youtube/${displayProfile.creatorName || 'grow_vth_nani'}`
                        }
                        className="w-full h-full object-cover"
                        alt="Profile"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[12px] font-black text-gray-950 truncate">Quick support</p>
                      <p className="text-[11px] font-semibold text-gray-600">
                        Subscribe & follow in <span className="font-black text-pink-600">only 3 seconds</span>.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  {displayProfile.socialLinks?.youtube ? (
                    <motion.a
                      href={displayProfile.socialLinks.youtube}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-[12px] font-black tracking-tight bg-pink-600 text-white hover:bg-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-400"
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Youtube size={16} />
                      Subscribe
                    </motion.a>
                  ) : (
                    <div className="inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-[12px] font-black tracking-tight bg-gray-100 text-gray-400">
                      <Youtube size={16} />
                      Subscribe
                    </div>
                  )}

                  {displayProfile.socialLinks?.instagram ? (
                    <motion.a
                      href={displayProfile.socialLinks.instagram}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-[12px] font-black tracking-tight border border-pink-200 bg-white text-pink-600 hover:bg-pink-50 focus:outline-none focus:ring-2 focus:ring-pink-400"
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Instagram size={16} />
                      Follow
                    </motion.a>
                  ) : (
                    <div className="inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-[12px] font-black tracking-tight border border-gray-200 bg-gray-50 text-gray-400">
                      <Instagram size={16} />
                      Follow
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <motion.header className="sticky top-3 z-10" variants={fadeUp}>
          <div className="bg-white/80 backdrop-blur border border-pink-100 rounded-[1.6rem] px-4 py-3 shadow-[0_18px_50px_-28px_rgba(236,72,153,0.35)] flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-pink-300">Link in bio</p>
              <p className="text-sm font-extrabold text-gray-950 truncate">{displayProfile.creatorName}</p>
            </div>
            <div className="flex items-center gap-2">
              <motion.a
                href={displayProfile.socialLinks?.instagram}
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-xl border border-pink-100 bg-white/70 flex items-center justify-center text-pink-500 hover:bg-white focus:outline-none focus:ring-2 focus:ring-pink-400"
                aria-label="Open Instagram"
                whileHover={{ y: -1, scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
              >
                <Instagram size={18} />
              </motion.a>
              <motion.a
                href={displayProfile.socialLinks?.youtube}
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-xl border border-pink-100 bg-white/70 flex items-center justify-center text-pink-500 hover:bg-white focus:outline-none focus:ring-2 focus:ring-pink-400"
                aria-label="Open YouTube"
                whileHover={{ y: -1, scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
              >
                <Youtube size={18} />
              </motion.a>
            </div>
          </div>
        </motion.header>

        {/* Profile */}
        <motion.div className="bg-white/90 backdrop-blur rounded-[2.5rem] border border-pink-100 p-8 flex flex-col items-center text-center shadow-[0_24px_60px_-24px_rgba(236,72,153,0.35)] text-gray-900" variants={fadeUp}>
          <div className="w-28 h-28 rounded-full overflow-hidden ring-[14px] ring-white bg-[#fff7fb] shadow-lg border border-pink-100 relative">
            <img
              src={
                displayProfile.profilePicture
                  ? displayProfile.profilePicture
                  : `https://unavatar.io/youtube/${displayProfile.creatorName || 'grow_vth_nani'}`
              }
              className="w-full h-full object-cover"
              alt="Profile"
            />
          </div>

          <h1 className="mt-6 text-[40px] font-black tracking-tight text-gray-950 leading-none">
            {displayProfile.creatorName}
          </h1>
          <p className="mt-3 text-[14px] font-semibold text-gray-700 px-2 leading-relaxed opacity-100">
            {displayProfile.bio}
          </p>
          <div className="mt-5 flex items-center justify-center gap-3">
            {displayProfile.socialLinks?.instagram && (
              <motion.a
                href={displayProfile.socialLinks.instagram}
                target="_blank"
                rel="noreferrer"
                className="w-11 h-11 rounded-2xl border border-pink-100 bg-white/80 flex items-center justify-center text-pink-500 hover:bg-white focus:outline-none focus:ring-2 focus:ring-pink-400"
                aria-label="Instagram"
                whileHover={{ y: -1, scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
              >
                <Instagram size={20} />
              </motion.a>
            )}
            {displayProfile.socialLinks?.youtube && (
              <motion.a
                href={displayProfile.socialLinks.youtube}
                target="_blank"
                rel="noreferrer"
                className="w-11 h-11 rounded-2xl border border-pink-100 bg-white/80 flex items-center justify-center text-pink-500 hover:bg-white focus:outline-none focus:ring-2 focus:ring-pink-400"
                aria-label="YouTube"
                whileHover={{ y: -1, scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
              >
                <Youtube size={20} />
              </motion.a>
            )}
          </div>

          <div className="mt-5 h-px w-full bg-gradient-to-r from-transparent via-pink-100 to-transparent" />
        </motion.div>

        {/* Top links */}
        <motion.section className="space-y-3" variants={fadeUp}>
          {topLinks.length > 0 ? (
            topLinks.map((link) => (
              <motion.button
                key={link._id || link.title}
                onClick={() => handleLinkClick(link._id, link.url)}
                className="w-full bg-white/90 backdrop-blur border border-pink-100 px-5 py-4 rounded-[1.6rem] flex items-center justify-between hover:border-pink-200 hover:-translate-y-[1px] transition-all shadow-[0_18px_40px_-24px_rgba(236,72,153,0.30)] focus:outline-none focus:ring-2 focus:ring-pink-400"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="font-extrabold text-[15px] tracking-tight text-gray-950 line-clamp-1">
                  {link.title}
                </span>
                <ExternalLink size={18} className="text-pink-400" />
              </motion.button>
            ))
          ) : (
            <div className="py-12 border-2 border-dashed border-pink-100 rounded-[2rem] text-center bg-white/60">
              <p className="text-[11px] font-black text-pink-200 uppercase tracking-[0.5em]">
                No Links Found
              </p>
            </div>
          )}
        </motion.section>

        {/* YouTube section (9:16) */}
        {videoLinks.length > 0 && currentVideoEmbedUrl && (
          <motion.section className="space-y-4" variants={fadeUp}>
            <h2 className="text-[11px] font-black uppercase tracking-[0.45em] text-pink-300 flex items-center justify-center">
              <PlayCircle size={18} className="mr-3 text-pink-500" /> YouTube
            </h2>

            <motion.div
              className="relative bg-white/90 backdrop-blur p-2 rounded-[2rem] border border-pink-100 shadow-[0_24px_60px_-24px_rgba(236,72,153,0.35)] overflow-hidden"
              whileHover={{ y: -1 }}
            >
              <div className="aspect-[9/16] bg-black rounded-[1.6rem] overflow-hidden relative">
                <iframe
                  key={currentVideo?._id || currentVideoIndex}
                  width="100%"
                  height="100%"
                  src={currentVideoEmbedUrl}
                  frameBorder="0"
                  allowFullScreen
                  className="w-full h-full"
                />

                {videoLinks.length > 1 && (
                  <>
                    <div className="absolute inset-y-0 left-2 flex items-center">
                      <button
                        onClick={() => handlePrevVideo(videoLinks.length)}
                        className="w-10 h-10 bg-white/50 backdrop-blur-xl text-white rounded-2xl flex items-center justify-center active:scale-90 transition-all font-black hover:bg-white/70 border border-white/20 focus:outline-none focus:ring-2 focus:ring-pink-400"
                        aria-label="Previous video"
                      >
                        <ChevronLeft size={22} />
                      </button>
                    </div>
                    <div className="absolute inset-y-0 right-2 flex items-center">
                      <button
                        onClick={() => handleNextVideo(videoLinks.length)}
                        className="w-10 h-10 bg-white/50 backdrop-blur-xl text-white rounded-2xl flex items-center justify-center active:scale-90 transition-all font-black hover:bg-white/70 border border-white/20 focus:outline-none focus:ring-2 focus:ring-pink-400"
                        aria-label="Next video"
                      >
                        <ChevronRight size={22} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </motion.section>
        )}

        {/* Footer (below YouTube) */}
        <motion.footer className="pt-6 pb-2 flex flex-col items-center border-t border-pink-100" variants={fadeUp}>
          <motion.button
            onClick={() => navigate('/login')}
            className="flex items-center space-x-3 text-xs font-black uppercase text-pink-300 hover:text-pink-600 hover:scale-105 transition-all tracking-[0.25em] focus:outline-none focus:ring-2 focus:ring-pink-400 rounded-lg px-2 py-1"
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.98 }}
          >
            <span>Powered by Grow_vth_nani</span>
          </motion.button>
        </motion.footer>
      </motion.div>
    </div>
  );
};

export default Landing;
