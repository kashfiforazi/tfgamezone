import React from 'react';
import { User, ShieldCheck, Star, Wallet, History, Settings, LogOut, CreditCard } from 'lucide-react';
import { motion } from 'motion/react';

interface ProfileSectionProps {
  user: any;
  balance: number;
  onLogout: () => void;
  onTabChange: (tab: string) => void;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({ user, balance, onLogout, onTabChange }) => {
  if (!user) return null;

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto space-y-8 py-8 px-4">
      <div className="glass rounded-[2.5rem] overflow-hidden border border-white/5 relative">
        <div className="absolute top-0 right-0 p-8">
           <button onClick={onLogout} className="p-3 border border-red-500/20 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all">
             <LogOut className="w-5 h-5" />
           </button>
        </div>

        <div className="p-10 flex flex-col md:flex-row items-center gap-10">
          <div className="relative group">
            <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-aviator-purple to-aviator-accent p-1 shadow-2xl group-hover:scale-105 transition-transform">
               <div className="w-full h-full rounded-[2.5rem] bg-black flex items-center justify-center overflow-hidden">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="User" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-12 h-12 text-aviator-accent text-4xl" />
                  )}
               </div>
            </div>
            <div className="absolute -bottom-2 -right-2 bg-green-500 p-1.5 rounded-xl border-4 border-black">
               <ShieldCheck className="w-4 h-4 text-white" />
            </div>
          </div>

          <div className="text-center md:text-left space-y-2">
            <h2 className="text-4xl font-game font-black tracking-tight">{user.displayName?.toUpperCase() || 'ELITE PILOT'}</h2>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/5 text-[10px] font-black text-white/40 uppercase tracking-widest font-mono">UID: {user.uid}</span>
              <span className="px-3 py-1 rounded-lg bg-aviator-accent/20 border border-aviator-accent/20 text-[10px] font-black text-aviator-accent uppercase tracking-widest font-mono">Level 42</span>
            </div>
            <p className="text-xs text-white/20 italic font-medium">{user.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 border-t border-white/5">
          <div className="p-8 border-r border-white/5 flex flex-col items-center gap-2">
            <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Balance</span>
            <div className="text-2xl font-game font-black text-aviator-accent">৳{balance.toLocaleString()}</div>
          </div>
          <div className="p-8 border-r border-white/5 flex flex-col items-center gap-2">
            <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Wins</span>
            <div className="text-2xl font-game font-black text-green-400">142</div>
          </div>
          <div className="p-8 border-r border-white/5 flex flex-col items-center gap-2">
            <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Ranks</span>
            <div className="text-2xl font-game font-black text-purple-400">#4</div>
          </div>
          <div className="p-8 flex flex-col items-center gap-2">
            <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Profit</span>
            <div className="text-2xl font-game font-black text-cyan-400">82%</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass rounded-[2rem] p-8 border border-white/5 space-y-6">
           <div className="flex items-center justify-between">
              <h3 className="text-xl font-game font-black flex items-center gap-3">
                 <Wallet className="w-5 h-5 text-aviator-accent" />
                 WALLET ACTIONS
              </h3>
           </div>
           <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => onTabChange('wallet')}
                className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-white/5 hover:bg-white/10 transition-all border border-white/5 active:scale-95"
              >
                  <CreditCard className="w-6 h-6 text-aviator-accent" />
                  <span className="text-xs font-black uppercase tracking-widest">Withdrawal</span>
              </button>
              <button 
                onClick={() => onTabChange('wallet')}
                className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-aviator-accent text-black transition-all border border-aviator-accent active:scale-95 shadow-lg shadow-aviator-accent/20"
              >
                  <Star className="w-6 h-6" />
                  <span className="text-xs font-black uppercase tracking-widest">Deposit</span>
              </button>
           </div>
        </div>

        <div className="glass rounded-[2rem] p-8 border border-white/5 space-y-6">
           <div className="flex items-center justify-between">
              <h3 className="text-xl font-game font-black flex items-center gap-3">
                 <History className="w-5 h-5 text-aviator-accent" />
                 RECENT BETS
              </h3>
              <button className="text-[10px] font-black text-white/30 uppercase tracking-widest hover:text-white">View All</button>
           </div>
           
           <div className="space-y-3">
              {[
                { game: 'Aviator', amt: 500, mult: 2.5, win: 1250, date: '2 min ago' },
                { game: 'Aviator', amt: 100, mult: 1.0, win: 0, date: '5 min ago' },
                { game: 'Aviator', amt: 250, mult: 4.8, win: 1200, date: '12 min ago' },
              ].map((bet, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-black/40 border border-white/5">
                   <div className="flex flex-col">
                      <span className="text-xs font-black">{bet.game}</span>
                      <span className="text-[9px] text-white/20 font-mono italic">{bet.date}</span>
                   </div>
                   <div className="text-right">
                      <div className={`text-sm font-black font-mono ${bet.win > 0 ? 'text-green-400' : 'text-white/20'}`}>
                        {bet.win > 0 ? `+৳${bet.win.toLocaleString()}` : `-৳${bet.amt.toLocaleString()}`}
                      </div>
                      <div className="text-[10px] text-white/20 font-bold italic">{bet.mult.toFixed(2)}x</div>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};
