import React from 'react';
import { Trophy, Gift, Users, Zap, TrendingUp, Star, ShieldCheck } from 'lucide-react';
import { Player } from '../types';

const TOP_PLAYERS: Player[] = [
  { id: '1', name: 'Zayden_Aviator', avatar: 'Z', betAmount: 500, multiplier: 85.2, winAmount: 42600, status: 'cashed-out' },
  { id: '2', name: 'Luna_High', avatar: 'L', betAmount: 1200, multiplier: 12.4, winAmount: 14880, status: 'cashed-out' },
  { id: '3', name: 'Crypto_King', avatar: 'C', betAmount: 3000, multiplier: 4.5, winAmount: 13500, status: 'cashed-out' },
];

export const Leaderboard: React.FC = () => {
  return (
    <div className="glass rounded-[2rem] p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-yellow-500" />
          </div>
          <h2 className="text-xl font-game font-black uppercase tracking-tight">Today's <span className="text-aviator-accent italic">Legends</span></h2>
        </div>
        <div className="flex bg-black/40 rounded-xl p-1 border border-white/5">
          <button className="px-4 py-1.5 rounded-lg text-[10px] font-black bg-white/10 text-white">DAILY</button>
          <button className="px-4 py-1.5 rounded-lg text-[10px] font-black text-white/30 hover:text-white transition-colors">WEEKLY</button>
        </div>
      </div>

      <div className="space-y-3">
        {TOP_PLAYERS.map((player, i) => (
          <div key={player.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 group hover:bg-white/10 transition-all hover:scale-[1.02]">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-aviator-purple/20 flex items-center justify-center text-xl font-black text-aviator-accent border border-aviator-accent/20">
                  {player.avatar}
                </div>
                <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shadow-lg ${
                  i === 0 ? 'bg-yellow-500 text-black' : i === 1 ? 'bg-slate-300 text-black' : 'bg-orange-500 text-white'
                }`}>
                  #{i + 1}
                </div>
              </div>
              <div>
                <div className="font-bold text-sm text-white/90">{player.name}</div>
                <div className="text-[10px] text-white/30 font-mono">Win: {player.multiplier?.toFixed(2)}x</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-mono font-black text-green-400">+৳{player.winAmount?.toLocaleString()}</div>
              <div className="text-[9px] text-white/20 uppercase font-black tracking-widest">Payout Verified</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const BonusSection: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Welcome Bonus */}
      <div className="glass rounded-[2rem] p-6 bg-gradient-to-br from-aviator-purple/20 to-transparent border-aviator-purple/10 group cursor-pointer hover:scale-[1.02] transition-all">
        <div className="flex items-start justify-between mb-8">
          <div className="w-12 h-12 rounded-2xl bg-aviator-purple flex items-center justify-center shadow-[0_0_20px_rgba(112,0,255,0.4)] group-hover:rotate-12 transition-transform">
            <Gift className="w-6 h-6 text-white" />
          </div>
          <span className="text-[10px] font-black text-aviator-accent border border-aviator-accent/20 px-3 py-1 rounded-full bg-aviator-accent/5">WELCOME PACK</span>
        </div>
        <h3 className="text-2xl font-game font-black tracking-tighter leading-none mb-2">300% FIRST <span className="text-aviator-purple italic">DEPOSIT</span></h3>
        <p className="text-xs text-white/40 mb-6 font-medium">Get up to ৳5,000 on your first deposit with instant activation.</p>
        <button className="w-full py-3.5 bg-aviator-purple text-white rounded-xl text-xs font-black uppercase tracking-[0.2em] shadow-lg shadow-purple-500/20 hover:brightness-110 active:scale-95 transition-all">Claim Now</button>
      </div>

      {/* Referral */}
      <div className="glass rounded-[2rem] p-6 bg-gradient-to-br from-aviator-accent/10 to-transparent border-aviator-accent/10 group cursor-pointer hover:scale-[1.02] transition-all">
        <div className="flex items-start justify-between mb-8">
          <div className="w-12 h-12 rounded-2xl bg-aviator-accent flex items-center justify-center shadow-[0_0_20px_rgba(0,242,255,0.4)] group-hover:-rotate-12 transition-transform">
            <Users className="w-6 h-6 text-black" />
          </div>
          <span className="text-[10px] font-black text-aviator-accent border border-aviator-accent/20 px-3 py-1 rounded-full bg-aviator-accent/5">REFERRAL</span>
        </div>
        <h3 className="text-2xl font-game font-black tracking-tighter leading-none mb-2">INVITE FRIENDS, <span className="text-aviator-accent italic">EARN 10%</span></h3>
        <p className="text-xs text-white/40 mb-6 font-medium">Earn commission on every flight your referrals take. Lifetime rewards.</p>
        <button className="w-full py-3.5 bg-white/5 border border-white/10 text-white rounded-xl text-xs font-black uppercase tracking-[0.2em] hover:bg-white/10 active:scale-95 transition-all">Copy Link</button>
      </div>

      {/* VIP / RNG */}
      <div className="glass rounded-[2rem] p-6 bg-gradient-to-br from-green-500/10 to-transparent border-green-500/10 group cursor-pointer hover:scale-[1.02] transition-all">
        <div className="flex items-start justify-between mb-8">
          <div className="w-12 h-12 rounded-2xl bg-green-500 flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.4)] group-hover:scale-110 transition-transform">
            <ShieldCheck className="w-6 h-6 text-black" />
          </div>
          <span className="text-[10px] font-black text-green-400 border border-green-500/20 px-3 py-1 rounded-full bg-green-500/5">SECURITY</span>
        </div>
        <h3 className="text-2xl font-game font-black tracking-tighter leading-none mb-2">PROVABLY <span className="text-green-500 italic">FAIR RNG</span></h3>
        <p className="text-xs text-white/40 mb-6 font-medium">Our system uses cryptographic hashing to ensure 100% fair outcomes.</p>
        <button className="w-full py-3.5 bg-green-500/10 border border-green-500/20 text-green-500 rounded-xl text-xs font-black uppercase tracking-[0.2em] hover:bg-green-500/20 active:scale-95 transition-all">Verify Game</button>
      </div>
    </div>
  );
};
