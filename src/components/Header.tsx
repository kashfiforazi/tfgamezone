import React from 'react';
import { Wallet, Bell, Menu, User, TrendingUp } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="h-16 glass flex items-center justify-between px-4 md:px-8 z-50">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2 cursor-pointer">
          <img src="https://i.ibb.co/0V2ht3JL/1000032997.png" alt="TF Aviator" className="h-10" />
          <span className="font-display font-bold text-xl tracking-tighter hidden md:block italic">
            TF <span className="text-aviator-accent">AVIATOR</span>
          </span>
        </div>

        <nav className="hidden lg:flex items-center gap-6">
          {['Home', 'Play', 'Leaderboard', 'Bonuses'].map((item) => (
            <a
              key={item}
              href="#"
              className="text-sm font-medium text-white/60 hover:text-white transition-colors"
            >
              {item}
            </a>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-3 bg-black/40 rounded-full pl-3 pr-1 py-1 border border-white/5">
          <div className="flex items-center gap-1.5">
            <Wallet className="w-3.5 h-3.5 text-aviator-accent" />
            <span className="text-sm font-mono font-bold">$12,450.00</span>
          </div>
          <button className="bg-aviator-accent text-black text-xs font-bold px-4 py-1.5 rounded-full hover:brightness-110 transition-all active:scale-95">
            DEPOSIT
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-white/5 rounded-full transition-colors relative">
            <Bell className="w-5 h-5 text-white/70" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-aviator-red rounded-full border border-aviator-bg"></span>
          </button>
          
          <div className="h-8 w-8 rounded-full bg-aviator-purple p-0.5 cursor-pointer hover:ring-2 hover:ring-aviator-accent transition-all">
            <div className="h-full w-full rounded-full bg-black flex items-center justify-center overflow-hidden">
              <User className="w-5 h-5 text-aviator-accent" />
            </div>
          </div>
          
          <button className="lg:hidden p-2 hover:bg-white/5 rounded-full transition-colors">
            <Menu className="w-5 h-5 text-white/70" />
          </button>
        </div>
      </div>
    </header>
  );
};
