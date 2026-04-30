import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User, LogIn, UserPlus } from 'lucide-react';
import { loginWithEmail, registerWithEmail, loginWithGoogle } from '../lib/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'login' | 'signup';
  setType: (type: 'login' | 'signup') => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, type, setType }) => {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (type === 'signup') {
        await registerWithEmail(email, pass, name);
      } else {
        await loginWithEmail(email, pass);
      }
      onClose();
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setLoading(true);
    setError('');
    try {
      await loginWithGoogle();
      onClose();
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/popup-blocked') {
        setError('Popup blocked! Please allow popups for this site in your browser settings.');
      } else if (err.code === 'auth/cancelled-popup-request') {
        // User closed the popup, do nothing
      } else {
        setError(err.message || 'Login failed');
      }
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/90 backdrop-blur-md"
        onClick={onClose}
      />
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="relative w-full max-w-md glass rounded-[2.5rem] p-10 border border-white/10 shadow-2xl"
      >
        <button onClick={onClose} className="absolute top-8 right-8 text-white/20 hover:text-white transition-colors">
          <X className="w-6 h-6" />
        </button>

        <div className="text-center space-y-2 mb-10">
          <h2 className="text-4xl font-game font-black tracking-tight uppercase leading-none">
            {type === 'signup' ? 'Create' : 'Welcome'} <br />
            <span className="text-aviator-accent italic">{type === 'signup' ? 'Account' : 'Back'}</span>
          </h2>
          <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.4em]">TF Aviator Network</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {type === 'signup' && (
            <div className="relative group">
              <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-aviator-accent transition-colors" />
              <input 
                type="text" 
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-black/40 border-2 border-white/5 rounded-2xl pl-14 pr-6 py-4 text-sm font-bold outline-none focus:border-aviator-accent transition-all"
              />
            </div>
          )}
          <div className="relative group">
            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-aviator-accent transition-colors" />
            <input 
              type="email" 
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-black/40 border-2 border-white/5 rounded-2xl pl-14 pr-6 py-4 text-sm font-bold outline-none focus:border-aviator-accent transition-all"
            />
          </div>
          <div className="relative group">
            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-aviator-accent transition-colors" />
            <input 
              type="password" 
              placeholder="Password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              required
              className="w-full bg-black/40 border-2 border-white/5 rounded-2xl pl-14 pr-6 py-4 text-sm font-bold outline-none focus:border-aviator-accent transition-all"
            />
          </div>

          {error && <div className="text-[10px] text-red-500 font-bold uppercase tracking-widest text-center px-4">{error}</div>}

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-white text-black font-black text-sm rounded-2xl hover:bg-aviator-accent transition-all shadow-xl flex items-center justify-center gap-3 uppercase tracking-widest mt-6"
          >
            {type === 'signup' ? <UserPlus className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
            {loading ? 'Processing...' : type === 'signup' ? 'Join the Fleet' : 'Secure Login'}
          </button>
        </form>

        <div className="mt-8 space-y-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
            <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest"><span className="bg-aviator-bg px-4 text-white/20">OR SOCIAL LOGIN</span></div>
          </div>

          <button 
            type="button"
            onClick={handleGoogle}
            className="w-full py-4 glass border border-white/10 rounded-2xl hover:bg-white/5 transition-all text-[11px] font-black tracking-widest flex items-center justify-center gap-3"
          >
            <img src="https://www.google.com/favicon.ico" className="w-4 h-4 grayscale group-hover:grayscale-0 transition-all" />
            CONTINUE WITH GOOGLE
          </button>

          <p className="text-center text-[11px] font-bold text-white/40">
            {type === 'signup' ? 'Already a pilot?' : 'New here?'} 
            <button 
              onClick={() => setType(type === 'login' ? 'signup' : 'login')}
              className="text-aviator-accent ml-2 hover:underline tracking-widest uppercase"
            >
              {type === 'login' ? 'Create Account' : 'Sign In'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
