import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { Instagram, Twitter, Youtube, Music, ExternalLink, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';

const PublicProfile = () => {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPublicData = async () => {
      try {
        const { data } = await api.get(`/public/profile/${username}`);
        setProfile(data.profile);
        setLinks(data.links);
      } catch (err) {
        setError('Profile not found');
      } finally {
        setLoading(false);
      }
    };
    fetchPublicData();
  }, [username]);

  const handleLinkClick = async (linkId, url) => {
    try {
      await api.get(`/public/link/${linkId}/click`);
      window.open(url, '_blank');
    } catch (err) {
      window.open(url, '_blank');
    }
  };

  const getSocialIcon = (platform) => {
    switch (platform) {
      case 'instagram': return <Instagram size={24} />;
      case 'twitter': return <Twitter size={24} />;
      case 'youtube': return <Youtube size={24} />;
      case 'tiktok': return <Music size={24} />;
      default: return <Share2 size={24} />;
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
      <h2 className="text-4xl font-bold text-gray-900 mb-4 font-outfit">Oops! 404</h2>
      <p className="text-gray-500 mb-8">{error}</p>
      <a href="/" className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-500/25">Go Home</a>
    </div>
  );

  const { theme } = profile;

  return (
    <div 
      className="min-h-screen w-full flex flex-col items-center p-6 transition-colors duration-500"
      style={{ backgroundColor: theme?.backgroundColor || '#f3f4f6', color: theme?.textColor || '#1f2937' }}
    >
      <div className="max-w-2xl w-full flex flex-col items-center mt-12">
        {/* Profile Section */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative mb-6"
        >
          <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl overflow-hidden bg-indigo-100 flex items-center justify-center">
             {profile.profilePicture ? (
               <img src={profile.profilePicture} alt={profile.creatorName} className="w-full h-full object-cover" />
             ) : (
               <span className="text-4xl font-bold text-indigo-400 font-outfit uppercase">
                 {profile.creatorName?.[0] || profile.username[0]}
               </span>
             )}
          </div>
          <div className="absolute -bottom-2 -right-2 bg-green-400 w-6 h-6 rounded-full border-4 border-white shadow-sm"></div>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-gray-900 mb-2 font-outfit"
        >
          @{profile.username}
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-gray-600 text-center mb-8 px-4 font-medium opacity-80"
        >
          {profile.bio || "Sharing my world, one link at a time."}
        </motion.p>

        {/* Social Icons */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center space-x-6 mb-12"
        >
          {Object.entries(profile.socialLinks || {}).map(([platform, url]) => (
            url && (
              <a 
                key={platform} 
                href={url} 
                target="_blank" 
                rel="noreferrer"
                className="text-gray-600 hover:text-indigo-600 transition-all transform hover:scale-110"
              >
                {getSocialIcon(platform)}
              </a>
            )
          ))}
        </motion.div>

        {/* Links List */}
        <div className="w-full space-y-4 mb-12">
          {links.map((link, index) => (
            <motion.button
              key={link._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + (index * 0.1) }}
              onClick={() => handleLinkClick(link._id, link.url)}
              className="w-full group relative flex items-center justify-between p-5 rounded-3xl transition-all shadow-sm hover:shadow-xl hover:-translate-y-1 active:scale-[0.98]"
              style={{ backgroundColor: theme?.buttonColor || '#ffffff', color: theme?.buttonTextColor || '#ffffff' }}
            >
              <div className="flex items-center space-x-4">
                 <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                   <ExternalLink size={18} />
                 </div>
                 <div className="flex flex-col items-start">
                   <span className="font-bold text-lg font-inter leading-none mb-1">{link.title}</span>
                   {link.clickCount > 0 && (
                     <span className="text-[10px] opacity-60 font-bold uppercase tracking-widest">{link.clickCount} views</span>
                   )}
                 </div>
              </div>
              <Share2 size={18} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.button>
          ))}
          
          {links.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              No links shared yet.
            </div>
          )}
        </div>

        {/* Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-auto py-8"
        >
          <div className="bg-white/50 backdrop-blur-md px-6 py-2 rounded-full shadow-sm flex items-center space-x-2 border border-white/50">
             <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Built with</span>
             <span className="text-sm font-bold text-indigo-600 font-outfit">LinkFlow</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PublicProfile;
