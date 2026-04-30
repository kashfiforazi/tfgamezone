import React from 'react';
import { motion } from 'motion/react';
import { Gamepad2, ShieldCheck, Zap, Globe, Trophy, Users } from 'lucide-react';

export const HomeSection: React.FC<{ onStart: () => void }> = ({ onStart }) => {
  return (
    <div className="flex-1 w-full max-w-7xl mx-auto space-y-24 py-12 px-4">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden rounded-[3rem] glass border border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-aviator-bg via-black/40 to-aviator-purple/20"></div>
        
        {/* Animated Background Elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-aviator-accent/5 rounded-full blur-[120px] animate-pulse"></div>
        
        <div className="relative z-20 text-center space-y-8 px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md"
          >
            <Zap className="w-4 h-4 text-aviator-accent" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">New Enterprise Server v4.2</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-game font-black tracking-tighter leading-none"
          >
            THE SKY IS <br />
            <span className="text-aviator-accent italic">NOT THE LIMIT</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/40 text-lg max-w-2xl mx-auto font-medium"
          >
            Experience the most advanced social crash game in the multiverse. <br className="hidden md:block" />
            Real-time multiplayer, provably fair engine, and instant ৳ withdrawals.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <button 
              onClick={onStart}
              className="px-12 py-5 bg-aviator-accent text-black font-black text-sm rounded-2xl hover:brightness-110 hover:shadow-[0_0_40px_rgba(0,242,255,0.4)] transition-all uppercase tracking-widest flex items-center gap-3"
            >
              <Gamepad2 className="w-5 h-5" />
              Start Flying Now
            </button>
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-aviator-bg bg-white/10 flex items-center justify-center overflow-hidden">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=pilot${i}`} alt="Pilot" />
                </div>
              ))}
              <div className="pl-6 text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center">
                +1,240 Online
              </div>
            </div>
          </motion.div>
        </div>

        {/* Floating Plane Image */}
        <motion.img 
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          src="https://i.ibb.co/SD4SDF7n/1000033012.png" 
          className="absolute -right-20 top-1/2 -translate-y-1/2 w-[600px] opacity-20 pointer-events-none drop-shadow-2xl grayscale"
        />
      </section>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { icon: ShieldCheck, title: "Provably Fair", desc: "Every round outcome is pre-hashed and verifiable via blockchain technology." },
          { icon: Globe, title: "Global Lobby", desc: "Compete with players worldwide in our state-of-the-art live interaction system." },
          { icon: Zap, title: "Instant Payouts", desc: "Lightning fast withdrawals via bKash, Nagad, and Binance Smart Chain." }
        ].map((f, i) => (
          <motion.div 
            key={i}
            whileHover={{ y: -10 }}
            className="p-10 glass rounded-[2.5rem] border border-white/5 space-y-6"
          >
            <div className="w-16 h-16 rounded-2xl bg-aviator-accent/10 flex items-center justify-center">
              <f.icon className="w-8 h-8 text-aviator-accent" />
            </div>
            <h3 className="text-2xl font-black">{f.title}</h3>
            <p className="text-white/40 leading-relaxed italic">{f.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Stats Counter */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Active Rounds", val: "8.4M", icon: Zap },
          { label: "Total Paid", val: "৳120M+", icon: Trophy },
          { label: "Elite Pilots", val: "45K", icon: Users },
          { label: "Uptime", val: "99.9%", icon: Globe }
        ].map((s, i) => (
          <div key={i} className="glass p-8 rounded-3xl text-center space-y-2">
            <span className="text-[10px] font-black text-aviator-accent uppercase tracking-widest">{s.label}</span>
            <div className="text-3xl font-game font-black">{s.val}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
