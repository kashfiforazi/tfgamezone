import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CreditCard, Wallet, Smartphone, Shield, CheckCircle2, Zap, History } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-lg glass rounded-[2.5rem] overflow-hidden shadow-2xl border-white/10"
          >
            <div className="p-6 flex items-center justify-between border-b border-white/5 bg-white/5">
              <h2 className="text-xl font-display font-bold tracking-tight">{title}</h2>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/40 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-8">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export const PaymentModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="DEPOSIT FUNDS">
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'bkash', name: 'bKash', icon: Smartphone, color: 'text-[#E2136E]' },
            { id: 'nagad', name: 'Nagad', icon: Smartphone, color: 'text-[#F7941D]' },
            { id: 'crypto', name: 'Crypto', icon: CreditCard, color: 'text-aviator-accent' },
          ].map((method) => (
            <button key={method.id} className="flex flex-col items-center gap-3 p-4 rounded-3xl bg-white/5 border border-white/5 hover:border-white/20 hover:bg-white/10 transition-all group">
              <div className={`w-12 h-12 rounded-2xl bg-black/40 flex items-center justify-center ${method.color} group-hover:scale-110 transition-transform`}>
                <method.icon className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-white/60">{method.name}</span>
            </button>
          ))}
        </div>

        <div className="space-y-4">
           <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] px-1">Choose Amount</label>
           <div className="grid grid-cols-4 gap-2">
             {[500, 1000, 5000, 10000].map(amt => (
               <button key={amt} className="py-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 text-xs font-mono font-bold transition-all">
                 ৳{amt}
               </button>
             ))}
           </div>
           <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 font-bold">৳</div>
              <input 
                type="number" 
                placeholder="Custom Amount" 
                className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-10 pr-4 text-sm font-mono focus:outline-none focus:border-aviator-accent transition-colors"
              />
           </div>
        </div>

        <button className="w-full py-5 bg-aviator-accent text-black rounded-2xl font-display font-black text-lg hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-aviator-accent/20">
          PROCEED TO PAY
        </button>

        <div className="flex items-center justify-center gap-2 opacity-30">
          <Shield className="w-4 h-4" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Secure 256-bit Encrypted Transaction</span>
        </div>
      </div>
    </Modal>
  );
};

export const ProfileModal: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void;
  user: any;
  onLogout: () => void;
  balance: number;
}> = ({ isOpen, onClose, user, onLogout, balance }) => {
  if (!user) return null;
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="USER PROFILE">
      <div className="space-y-8">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-[2rem] bg-aviator-purple p-0.5 shadow-xl">
             <div className="w-full h-full rounded-[2rem] bg-black flex items-center justify-center overflow-hidden">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="User" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-3xl font-display font-black text-aviator-accent">
                    {user.displayName?.charAt(0) || 'U'}
                  </div>
                )}
             </div>
          </div>
          <div>
            <h3 className="text-2xl font-display font-black tracking-tight leading-none mb-1">
              {user.displayName || 'Unnamed Pilot'}
            </h3>
            <p className="text-xs text-white/40 font-mono">UID: {user.uid}</p>
            <div className="flex items-center gap-2 mt-2">
               <span className="text-[10px] px-2 py-0.5 rounded bg-green-500/20 text-green-400 font-bold uppercase tracking-tighter border border-green-500/20">Verified</span>
               <span className="text-[10px] px-2 py-0.5 rounded bg-aviator-accent/20 text-aviator-accent font-bold uppercase tracking-tighter border border-aviator-accent/20">Elite Rank</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
           <div className="glass p-4 rounded-3xl space-y-1">
              <span className="text-[10px] font-bold text-white/30 uppercase">Current Balance</span>
              <div className="text-xl font-mono font-black text-aviator-accent">৳{balance.toLocaleString()}</div>
           </div>
           <div className="glass p-4 rounded-3xl space-y-1">
              <span className="text-[10px] font-bold text-white/30 uppercase">Status</span>
              <div className="text-xl font-mono font-black text-green-400">ONLINE</div>
           </div>
        </div>

        <div className="space-y-4">
           {[
             { label: 'Security Settings', icon: Shield },
             { label: 'Transaction History', icon: History },
             { label: 'Referral Bonus', icon: Zap },
           ].map((item) => (
             <button key={item.label} className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                <div className="flex items-center gap-4">
                   <item.icon className="w-5 h-5 text-aviator-accent" />
                   <span className="text-sm font-bold text-white/70">{item.label}</span>
                </div>
                <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center">
                  <CheckCircle2 className="w-3 h-3 text-white/20" />
                </div>
             </button>
           ))}
        </div>

        <button 
          onClick={() => {
             onLogout();
             onClose();
          }}
          className="w-full py-4 text-aviator-red text-sm font-bold border border-aviator-red/20 rounded-2xl hover:bg-aviator-red hover:text-white transition-all shadow-lg"
        >
          LOG OUT ACCOUNT
        </button>
      </div>
    </Modal>
  );
};

export const ProvablyFairModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      />
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="relative w-full max-w-lg glass rounded-[2.5rem] p-8 border border-white/10"
      >
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-green-500/20 flex items-center justify-center">
            <Shield className="w-6 h-6 text-green-500" />
          </div>
          <div>
            <h2 className="text-2xl font-game font-black tracking-tight leading-none mb-1 text-white">PROVABLY <span className="text-green-500 italic">FAIR</span></h2>
            <p className="text-[10px] text-white/30 uppercase font-bold tracking-widest">RNG Hashing Verification</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
            <div className="text-[10px] uppercase font-black text-white/40 tracking-widest">Server Seed (Hashed)</div>
            <div className="font-mono text-[10px] break-all text-aviator-accent bg-black/40 p-3 rounded-xl border border-white/5 font-bold">
              a7b8c9d0e1f2g3h4i5j6k7l8m9n0o1p2q3r4s5t6u7v8w9x0y1z2a3b4c5d6e7f8
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
            <div className="text-[10px] uppercase font-black text-white/40 tracking-widest">Client Seed</div>
            <div className="font-mono text-[10px] break-all text-white/80 bg-black/40 p-3 rounded-xl border border-white/5 font-bold">
              user_session_928374
            </div>
          </div>

          <div className="bg-green-500/5 border border-green-500/10 p-6 rounded-2xl">
             <p className="text-xs text-white/60 leading-relaxed italic">
               Each round's crash point is generated using a combination of the Server Seed and Client Seed through a SHA-256 HMAC algorithm. This ensures that the outcome is predetermined and cannot be altered.
             </p>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="w-full mt-8 py-4 bg-white text-black text-sm font-black rounded-2xl hover:bg-aviator-accent transition-all uppercase tracking-widest shadow-xl"
        >
          Verify Result
        </button>
      </motion.div>
    </div>
  );
};

