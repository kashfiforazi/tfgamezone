import React from 'react';
import { 
  Gamepad2, Home, Trophy, Gift, BarChart3, Wallet, User, 
  Megaphone, Headset, ShieldCheck, X, Menu, MoreVertical,
  LogOut, Settings, Bell, CreditCard, History
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  primary?: boolean;
}

const MENU_ITEMS: NavItem[] = [
  { id: 'play', label: 'Play', icon: Gamepad2, primary: true },
  { id: 'home', label: 'Home', icon: Home },
  { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
  { id: 'bonuses', label: 'Bonuses', icon: Gift },
  { id: 'statistics', label: 'Statistics', icon: BarChart3 },
  { id: 'wallet', label: 'Wallet', icon: Wallet },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'promotions', label: 'Promotions', icon: Megaphone },
  { id: 'support', label: 'Support', icon: Headset },
  { id: 'provably-fair', label: 'Provably Fair', icon: ShieldCheck },
  { id: 'admin', label: 'Admin', icon: Settings },
];

export const DesktopNav: React.FC<{ activeTab: string; onTabChange: (id: string) => void; isAdmin: boolean }> = ({ activeTab, onTabChange, isAdmin }) => {
  const visibleItems = MENU_ITEMS.slice(0, 5);
  const moreItems = MENU_ITEMS.slice(5).filter(item => item.id !== 'admin' || isAdmin);
  const [isMoreOpen, setIsMoreOpen] = React.useState(false);

  return (
    <nav className="hidden xl:flex items-center gap-6">
      {visibleItems.map((item) => (
        <button
          key={item.id}
          onClick={() => onTabChange(item.id)}
          className={`group relative flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] transition-all py-2 ${
            activeTab === item.id ? 'text-aviator-accent' : 'text-white/40 hover:text-white'
          }`}
        >
          <item.icon className="w-3.5 h-3.5" />
          {item.label}
          {activeTab === item.id && (
            <motion.div 
              layoutId="activeNav"
              className="absolute -bottom-1 left-0 right-0 h-1 bg-aviator-accent rounded-full shadow-[0_0_10px_#00F2FF]" 
            />
          )}
        </button>
      ))}

      <div className="relative">
        <button 
          onClick={() => setIsMoreOpen(!isMoreOpen)}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-white/40 hover:text-white"
        >
          <MoreVertical className="w-5 h-5" />
        </button>

        <AnimatePresence>
          {isMoreOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsMoreOpen(false)} />
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-4 w-56 glass rounded-2xl border border-white/10 p-2 z-50 shadow-2xl"
              >
                {moreItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onTabChange(item.id);
                      setIsMoreOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-[11px] font-black uppercase tracking-wider text-white/60 hover:text-white transition-all text-left"
                  >
                    <item.icon className="w-4 h-4 text-aviator-accent" />
                    {item.label}
                  </button>
                ))}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export const MobileMenu: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  activeTab: string;
  onTabChange: (id: string) => void;
  user: any; 
  onLogout: () => void;
  isAdmin: boolean;
}> = ({ isOpen, onClose, activeTab, onTabChange, user, onLogout, isAdmin }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-80 z-[101] bg-aviator-bg border-l border-white/10 flex flex-col shadow-[-20px_0_40px_rgba(0,0,0,0.5)]"
          >
            <div className="h-20 flex items-center justify-between px-6 border-b border-white/5">
              <span className="font-game font-black text-xl tracking-tighter">TF <span className="text-aviator-accent italic">MENU</span></span>
              <button onClick={onClose} className="p-2 bg-white/5 rounded-xl"><X className="w-6 h-6" /></button>
            </div>

            <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8">
              {user && (
                <div className="glass p-5 rounded-3xl space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white p-0.5 shadow-xl">
                      <div className="w-full h-full rounded-2xl bg-black flex items-center justify-center overflow-hidden">
                        {user.photoURL ? (
                          <img src={user.photoURL} alt="User" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-6 h-6 text-aviator-accent" />
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="font-game font-black text-sm tracking-tight">{user.displayName?.toUpperCase() || 'PILOT'}</div>
                      <div className="text-[10px] text-aviator-accent font-black uppercase tracking-widest leading-none mt-1">Elite Member</div>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-white/5 grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => { onTabChange('wallet'); onClose(); }}
                      className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-all border border-white/5"
                    >
                      <CreditCard className="w-4 h-4 text-aviator-accent" />
                      <span className="text-[9px] font-black uppercase">Wallet</span>
                    </button>
                    <button 
                      onClick={() => { onTabChange('profile'); onClose(); }}
                      className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-all border border-white/5"
                    >
                      <User className="w-4 h-4 text-aviator-accent" />
                      <span className="text-[9px] font-black uppercase">Profile</span>
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-1">
                {MENU_ITEMS.filter(i => i.id !== 'admin' || isAdmin).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onTabChange(item.id);
                      onClose();
                    }}
                    className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all group ${
                      activeTab === item.id 
                        ? 'bg-aviator-accent text-black font-black shadow-lg shadow-aviator-accent/20' 
                        : 'hover:bg-white/5 text-white/60 hover:text-white'
                    }`}
                  >
                    <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-black' : 'text-aviator-accent'}`} />
                    <span className="text-xs font-black uppercase tracking-widest">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {user && (
              <div className="p-4 border-t border-white/5">
                <button 
                  onClick={() => {
                    onLogout();
                    onClose();
                  }}
                  className="w-full py-4 rounded-2xl border border-aviator-red/20 text-aviator-red text-xs font-black flex items-center justify-center gap-3 hover:bg-aviator-red hover:text-white transition-all shadow-lg"
                >
                  <LogOut className="w-4 h-4" />
                  LOG OUT
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
