import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Mail, Lock, User, UserPlus, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: ''
  });
  const [loading, setLoading] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    const checkUser = async () => {
      try {
        const { data } = await api.get('/public/personal');
        if (data.profile) setIsLocked(true);
      } catch (err) {
        // No user yet, safe to register
      }
    };
    checkUser();
  }, []);

  if (isLocked) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Registration Disabled</h2>
          <p className="text-gray-500 mb-6">This is a personal platform and the admin has already registered.</p>
          <button onClick={() => navigate('/login')} className="bg-blue-600 text-white px-6 py-2 rounded-xl">Go to Login</button>
        </div>
      </div>
    );
  }

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', formData);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      toast.success('Registration Successful!');
      navigate('/admin');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-indigo-100 p-4 font-inter">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-white/20"
      >
        <div className="p-8 text-center bg-white border-b border-gray-100 relative">
          <button 
            onClick={() => navigate('/')}
            className="absolute top-6 left-6 p-2 text-gray-400 hover:text-blue-600 transition-all rounded-lg hover:bg-blue-50"
          >
            <ChevronRight size={18} className="rotate-180" />
          </button>
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 text-white shadow-lg mb-4">
            <UserPlus size={32} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2 font-outfit">Join us</h2>
          <p className="text-gray-500">Create your link-in-bio in seconds</p>
        </div>

        <form onSubmit={handleRegister} className="p-8 space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700 ml-1">Username</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors">
                <User size={18} />
              </div>
              <input
                type="text"
                required
                className="block w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all"
                placeholder="yourname"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700 ml-1">Email Address</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors">
                <Mail size={18} />
              </div>
              <input
                type="email"
                required
                className="block w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700 ml-1">Password</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors">
                <Lock size={18} />
              </div>
              <input
                type="password"
                required
                className="block w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:shadow-blue-500/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-70 group mt-4"
          >
            <span>{loading ? 'Creating account...' : 'Create Account'}</span>
            <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>

          <p className="text-center text-sm text-gray-600 mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 font-bold hover:underline underline-offset-4 decoration-2">
              Sign in here
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
};

export default Register;
