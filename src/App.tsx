/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { LivePanel } from './components/LivePanel';
import { BetControls } from './components/BetControls';
import { PaymentModal, ProfileModal, ProvablyFairModal } from './components/Modals';
import { Leaderboard, BonusSection } from './components/DashboardSections';
import { DesktopNav, MobileMenu } from './components/Navigation';
import { HomeSection } from './components/HomeSection';
import { WalletSection } from './components/WalletSection';
import { ProfileSection } from './components/ProfileSection';
import { AdminPanel } from './components/AdminPanel';
import { AuthModal } from './components/AuthModals';
import { GameStatus, WinHistory } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { History, ShieldCheck, MessageCircle, MoreVertical, Star, Gift, Menu, Headset, Volume2, VolumeX } from 'lucide-react';
import { auth, logout, db } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, addDoc, collection, updateDoc, arrayUnion, onSnapshot } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from './lib/firestoreUtils';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authType, setAuthType] = useState<'login' | 'signup'>('login');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isBanned, setIsBanned] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('soundEnabled');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [multiplier, setMultiplier] = useState(1.0);
  const multiplierRef = useRef(1.0);
  const [status, setStatus] = useState<GameStatus>('FLYING');

  // Sound Effects Refs
  const audioRefs = useRef({
    engine: new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'),
    cashout: new Audio('https://assets.mixkit.co/active_storage/sfx/2012/2012-preview.mp3'),
    crash: new Audio('https://assets.mixkit.co/active_storage/sfx/2513/2513-preview.mp3'),
    waiting: new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3'),
    bgMusic: new Audio('https://assets.mixkit.co/active_storage/sfx/123/123-preview.mp3') // Placeholder music
  });

  useEffect(() => {
    const sounds = audioRefs.current;
    sounds.engine.loop = true;
    sounds.engine.volume = 0.2;
    sounds.waiting.loop = true;
    sounds.waiting.volume = 0.15;
    sounds.bgMusic.loop = true;
    sounds.bgMusic.volume = 0.1;
    
    // Set initial volumes based on state
    Object.values(sounds).forEach(audio => {
      (audio as HTMLAudioElement).muted = !isSoundEnabled;
    });

    // Start background music on user interaction
    const startMusic = () => {
      if (isSoundEnabled) {
        sounds.bgMusic.play().catch(() => {});
      }
      window.removeEventListener('click', startMusic);
    };
    window.addEventListener('click', startMusic);
    
    return () => {
      Object.values(sounds).forEach(s => {
        const audio = s as HTMLAudioElement;
        audio.pause();
        audio.src = '';
      });
      window.removeEventListener('click', startMusic);
    };
  }, []);

  useEffect(() => {
    const sounds = audioRefs.current;
    if (status === 'FLYING') {
      sounds.waiting.pause();
      sounds.waiting.currentTime = 0;
      sounds.engine.play().catch(() => {});
    } else if (status === 'WAITING') {
      sounds.engine.pause();
      sounds.engine.currentTime = 0;
      sounds.waiting.play().catch(() => {});
    } else if (status === 'CRASHED') {
      sounds.engine.pause();
      sounds.engine.currentTime = 0;
      sounds.crash.play().catch(() => {});
    }
  }, [status]);

  useEffect(() => {
    localStorage.setItem('soundEnabled', JSON.stringify(isSoundEnabled));
    const sounds = audioRefs.current;
    Object.values(sounds).forEach(audio => {
      (audio as HTMLAudioElement).muted = !isSoundEnabled;
    });
    
    if (isSoundEnabled) {
      if (status === 'FLYING') sounds.engine.play().catch(() => {});
      else if (status === 'WAITING') sounds.waiting.play().catch(() => {});
      sounds.bgMusic.play().catch(() => {});
    } else {
      Object.values(sounds).forEach(audio => (audio as HTMLAudioElement).pause());
    }
  }, [isSoundEnabled, status]);

  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isProvablyFairOpen, setIsProvablyFairOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [balance, setBalance] = useState(1000);
  const balanceRef = useRef(1000); // Ref to keep track of latest balance for calculations
  const [crashPoint, setCrashPoint] = useState<number>(2.0);
  const [history, setHistory] = useState<WinHistory[]>([
    { multiplier: 1.25, time: '12:00' },
    { multiplier: 12.4, time: '11:58' },
    { multiplier: 2.15, time: '11:55' },
    { multiplier: 1.05, time: '11:50' },
    { multiplier: 45.2, time: '11:45' },
    { multiplier: 1.88, time: '11:40' },
    { multiplier: 3.12, time: '11:35' },
    { multiplier: 1.11, time: '11:30' },
  ]);
  const [bet1, setBet1] = useState({ isActive: false, isQueued: false, amount: 0, currentId: null as string | null });
  const [bet2, setBet2] = useState({ isActive: false, isQueued: false, amount: 0, currentId: null as string | null });

  const bet1IdRef = useRef<string | null>(null);
  const bet2IdRef = useRef<string | null>(null);
  const queuedBet1IdRef = useRef<string | null>(null);
  const queuedBet2IdRef = useRef<string | null>(null);

  // Sync refs with state for engine visibility
  useEffect(() => {
    bet1IdRef.current = bet1.currentId;
  }, [bet1.currentId]);
  useEffect(() => {
    bet2IdRef.current = bet2.currentId;
  }, [bet2.currentId]);
  
  const tickRef = useRef<number>(0);
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const userPath = `users/${firebaseUser.uid}`;
        const userRef = doc(db, userPath);
        
        try {
          const userDoc = await getDoc(userRef);
          const isSystemOwner = firebaseUser.email === 'mdkawsarforazi.biz@gmail.com';
          
          if (!userDoc.exists()) {
            await setDoc(userRef, {
              uid: firebaseUser.uid,
              displayName: firebaseUser.displayName || 'PILOT',
              email: firebaseUser.email,
              photoURL: firebaseUser.photoURL,
              balance: 1000,
              isAdmin: isSystemOwner,
              role: isSystemOwner ? 'admin' : 'user',
              createdAt: serverTimestamp()
            });
          } else if (isSystemOwner && !userDoc.data().isAdmin) {
             await updateDoc(userRef, { isAdmin: true, role: 'admin' });
          }
        } catch (err) {
          console.error("User setup error:", err);
        }

        const unsubProfile = onSnapshot(userRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            const newBal = data.balance || 0;
            setBalance(newBal);
            balanceRef.current = newBal;
            setIsAdmin(data.role === 'admin' || data.isAdmin === true || firebaseUser.email === 'mdkawsarforazi.biz@gmail.com');
            setIsBanned(!!data.isBanned);
          }
        }, (err) => {
          handleFirestoreError(err, OperationType.GET, userPath);
        });

        return () => unsubProfile();
      } else {
        setIsAdmin(false);
        setBalance(0);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const handleLogin = () => {
    setAuthType('login');
    setIsAuthOpen(true);
  };

  const handleTransaction = async (type: 'deposit' | 'withdraw', amount: number, method: string, accountNumber: string) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'transactions'), {
        userId: user.uid,
        userName: user.displayName || 'Pilot',
        amount,
        type,
        method,
        accountNumber,
        status: 'pending',
        timestamp: Date.now()
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setIsProfileOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRedeem = async (codeStr: string): Promise<boolean> => {
    if (!user) return false;
    try {
      const codeRef = doc(db, 'redeemCodes', codeStr);
      const codeDoc = await getDoc(codeRef);
      
      if (codeDoc.exists()) {
        const data = codeDoc.data();
        if (data.usedBy && data.usedBy.includes(user.uid)) {
          alert('You have already used this code!');
          return false;
        }
        
        const newBalance = balance + data.amount;
        // Update user balance
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, { 
          balance: newBalance,
          usedCodes: arrayUnion(codeStr)
        });
        
        // Mark code as used by this user
        await updateDoc(codeRef, {
          usedBy: arrayUnion(user.uid)
        });
        
        setBalance(newBalance);
        return true;
      }
    } catch (err) {
      console.error(err);
    }
    return false;
  };

  const [betAmount, setBetAmount] = useState(10);

  const handleBet = async (slot: 1 | 2, amount: number) => {
    if (!user || balanceRef.current < amount || amount < 10) return;
    if (isBanned) {
      alert("Your account has been suspended. Please contact support.");
      return;
    }
    
    const newBalance = balanceRef.current - amount;
    setBalance(newBalance);
    balanceRef.current = newBalance;
    
    let betId = null;
    try {
      const betRef = await addDoc(collection(db, 'bets'), {
        userId: user.uid,
        userName: user.displayName || 'Pilot',
        userPhoto: user.photoURL || '',
        amount: amount,
        multiplier: 1.0,
        status: 'playing',
        timestamp: serverTimestamp()
      });
      betId = betRef.id;
    } catch (err) {
      console.error('Error creating bet:', err);
    }

    if (slot === 1) {
      if (status === 'WAITING') {
        setBet1(prev => ({ ...prev, isActive: true, amount, currentId: betId }));
      } else {
        setBet1(prev => ({ ...prev, isQueued: true, amount }));
        queuedBet1IdRef.current = betId;
      }
    } else {
      if (status === 'WAITING') {
        setBet2(prev => ({ ...prev, isActive: true, amount, currentId: betId }));
      } else {
        setBet2(prev => ({ ...prev, isQueued: true, amount }));
        queuedBet2IdRef.current = betId;
      }
    }

    const userPath = `users/${user.uid}`;
    try {
      const userRef = doc(db, userPath);
      await updateDoc(userRef, { balance: newBalance });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, userPath);
    }
  };

  const [lastWin, setLastWin] = useState<{ amount: number, multiplier: number } | null>(null);

  const bet1Ref = useRef(bet1);
  const bet2Ref = useRef(bet2);
  useEffect(() => { bet1Ref.current = bet1; }, [bet1]);
  useEffect(() => { bet2Ref.current = bet2; }, [bet2]);

  const handleCashOut = useCallback(async (slot: 1 | 2) => {
    if (!user) return;
    
    // Captured ref-based bet state for zero-latency
    const targetBet = slot === 1 ? bet1Ref.current : bet2Ref.current;

    if (targetBet.isQueued) {
      const newBalance = balanceRef.current + targetBet.amount;
      setBalance(newBalance);
      balanceRef.current = newBalance;
      if (slot === 1) {
        setBet1(prev => ({ ...prev, isQueued: false, amount: 0 }));
        queuedBet1IdRef.current = null;
      } else {
        setBet2(prev => ({ ...prev, isQueued: false, amount: 0 }));
        queuedBet2IdRef.current = null;
      }

      const userPath = `users/${user.uid}`;
      try {
        const userRef = doc(db, userPath);
        await updateDoc(userRef, { balance: newBalance });
      } catch (err) { console.error(err); }
      return;
    }

    // Capture multiplier from Ref at the exact microsecond of click
    const clickMultiplier = multiplierRef.current;

    if (!targetBet.isActive || status !== 'FLYING' || !targetBet.currentId || clickMultiplier <= 1.0) return;
    
    const betAmount = targetBet.amount;
    const betId = targetBet.currentId;

    const winAmount = Number((clickMultiplier * betAmount).toFixed(2));
    const newBalance = balanceRef.current + winAmount;
    
    // 1. INSTANT STATE UPDATES
    setBalance(newBalance);
    balanceRef.current = newBalance;
    audioRefs.current.cashout.play().catch(() => {});
    
    if (slot === 1) {
      setBet1(prev => ({ ...prev, isActive: false, currentId: null }));
      bet1IdRef.current = null;
    } else {
      setBet2(prev => ({ ...prev, isActive: false, currentId: null }));
      bet2IdRef.current = null;
    }

    setLastWin({ amount: winAmount, multiplier: clickMultiplier });
    setTimeout(() => setLastWin(null), 3000);

    // 2. BACKGROUND SERVER SYNC
    try {
      await updateDoc(doc(db, 'bets', betId), {
        status: 'WON',
        multiplier: clickMultiplier,
        winAmount: winAmount,
        cashedOutAt: serverTimestamp()
      });

      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { balance: increment(winAmount) });
    } catch (err) {
      console.error('Critical Cashout Sync Error:', err);
    }
  }, [user, status]);

  const startTimeRef = useRef<number>(Date.now());
  
  const prepareNextRound = useCallback(() => {
    multiplierRef.current = 1.0;
    setMultiplier(1.0);
    // Convert queued bets to active bets for both slots
    setBet1(prev => {
      if (prev.isQueued) {
        return { ...prev, isActive: true, isQueued: false, currentId: queuedBet1IdRef.current };
      }
      return { ...prev, isActive: false, currentId: null, amount: 0 };
    });
    setBet2(prev => {
      if (prev.isQueued) {
        return { ...prev, isActive: true, isQueued: false, currentId: queuedBet2IdRef.current };
      }
      return { ...prev, isActive: false, currentId: null, amount: 0 };
    });

    queuedBet1IdRef.current = null;
    queuedBet2IdRef.current = null;

    setMultiplier(1.0);
    
    // AI Crash Logic
    const rand = Math.random();
    let newCrashPoint;
    if (rand < 0.1) newCrashPoint = 1 + Math.random() * 0.1;
    else if (rand < 0.5) newCrashPoint = 1.1 + Math.random() * 1.5;
    else if (rand < 0.8) newCrashPoint = 2.5 + Math.random() * 5;
    else if (rand < 0.95) newCrashPoint = 8 + Math.random() * 12;
    else newCrashPoint = 20 + Math.random() * 50;
    
    setCrashPoint(newCrashPoint);
  }, []);

  useEffect(() => {
    if (status !== 'WAITING') return;
    
    prepareNextRound();

    const timerId = setTimeout(() => {
      setStatus('FLYING');
      startTimeRef.current = Date.now();
    }, 4000);
    
    return () => clearTimeout(timerId);
  }, [status, prepareNextRound]);

  useEffect(() => {
    if (status !== 'FLYING') return;

    const tick = () => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const newMultiplier = Math.pow(Math.E, 0.12 * elapsed);
      multiplierRef.current = newMultiplier;
      setMultiplier(newMultiplier);

      if (newMultiplier >= crashPoint) {
        setStatus('CRASHED');
        // Handle losses for both slots
        if (bet1IdRef.current) {
          updateDoc(doc(db, 'bets', bet1IdRef.current), { 
            status: 'lost', 
            multiplier: newMultiplier 
          }).catch(console.error);
        }
        if (bet2IdRef.current) {
          updateDoc(doc(db, 'bets', bet2IdRef.current), { 
            status: 'lost', 
            multiplier: newMultiplier 
          }).catch(console.error);
        }

        setBet1(prev => ({ ...prev, isActive: false, currentId: null }));
        setBet2(prev => ({ ...prev, isActive: false, currentId: null }));

        setHistory(prev => [{ multiplier: newMultiplier, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }, ...prev].slice(0, 20));
        setTimeout(() => setStatus('WAITING'), 3000);
      } else {
        tickRef.current = requestAnimationFrame(tick);
      }
    };

    tickRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(tickRef.current);
  }, [status, prepareNextRound, crashPoint]);

  const handleTabChange = (id: string) => {
    if (id === 'provably-fair') {
      setIsProvablyFairOpen(true);
    } else if (id === 'withdraw') {
      setActiveTab('wallet');
    } else {
      setActiveTab(id);
    }
  };

  return (
    <div className="flex flex-col h-screen select-none overflow-hidden bg-aviator-bg font-sans">
      <header className="h-20 glass flex items-center justify-between px-4 md:px-8 z-50 border-white/5">
        <div className="flex items-center gap-12">
          <div className="flex flex-col items-start leading-none group cursor-pointer" onClick={() => setActiveTab('play')}>
            <span className="text-2xl font-black tracking-tighter bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent group-hover:from-aviator-accent group-hover:to-aviator-accent/50 transition-all">TF <span className="italic uppercase">Aviator</span></span>
            <span className="text-[10px] font-black text-aviator-accent tracking-[0.4em] uppercase">Enterprise</span>
          </div>

          <DesktopNav activeTab={activeTab} onTabChange={handleTabChange} isAdmin={isAdmin} />
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsSoundEnabled(!isSoundEnabled)}
            className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-all active:scale-90"
            title={isSoundEnabled ? "Mute Sound" : "Unmute Sound"}
          >
            {isSoundEnabled ? (
              <Volume2 className="w-5 h-5 text-aviator-accent" />
            ) : (
              <VolumeX className="w-5 h-5 text-white/20" />
            )}
          </button>

          <button 
            onClick={() => setActiveTab('wallet')}
            className="hidden sm:flex bg-aviator-accent text-black text-[11px] font-black px-6 py-2.5 rounded-xl hover:brightness-110 transition-all active:scale-95 shadow-lg shadow-aviator-accent/30"
          >
            DEPOSIT
          </button>
          
          {user ? (
            <div className="flex items-center gap-2 sm:gap-4">
              <div 
                onClick={() => setActiveTab('wallet')}
                className="flex flex-col items-end cursor-pointer group"
              >
                <div className="flex items-center gap-1.5">
                  <Star className="w-3 h-3 text-aviator-accent group-hover:scale-125 transition-transform" />
                  <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] leading-none">Wallet</span>
                </div>
                <span className="text-sm sm:text-base font-game font-black text-aviator-accent leading-tight">৳{balance.toLocaleString()}</span>
              </div>
              <button 
                onClick={() => setIsProfileOpen(true)}
                className="h-10 w-10 sm:h-12 sm:w-12 rounded-2xl bg-gradient-to-br from-aviator-purple via-blue-600 to-aviator-accent p-0.5 cursor-pointer hover:scale-110 transition-all shadow-2xl active:scale-95"
              >
                <div className="h-full w-full rounded-2xl bg-black flex items-center justify-center overflow-hidden">
                   {user.photoURL ? (
                      <img src={user.photoURL} alt="User" className="w-full h-full object-cover" />
                   ) : (
                      <span className="text-sm font-black text-white font-game">{user.displayName?.charAt(0) || 'U'}</span>
                   )}
                </div>
              </button>
            </div>
          ) : (
            <button 
              onClick={handleLogin}
              className="px-6 sm:px-10 h-12 sm:h-14 rounded-2xl bg-white text-[12px] font-black text-black hover:bg-aviator-accent transition-all shadow-xl uppercase tracking-widest active:scale-95"
            >
              Log In
            </button>
          )}

          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="xl:hidden p-3 bg-white/5 rounded-2xl hover:bg-white/10"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col md:flex-row overflow-hidden p-2 md:p-4 gap-4 relative">
        <AnimatePresence mode="wait">
          {activeTab === 'home' ? (
            <motion.div 
               key="home"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="flex-1 w-full overflow-y-auto scrollbar-hide pb-20"
            >
               <HomeSection onStart={() => setActiveTab('play')} />
            </motion.div>
          ) : activeTab === 'play' ? (
            <motion.div 
              key="play"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="flex-1 flex flex-col md:flex-row gap-4 w-full h-full overflow-hidden"
            >
              <div className="hidden xl:block w-80 h-full shrink-0">
                <LivePanel />
              </div>

              <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                <div className="glass rounded-[1.5rem] p-1.5 flex items-center justify-between">
                  <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide flex-1 pl-2">
                    {history.map((h, i) => (
                      <div 
                        key={i} 
                        className={`px-4 py-1.5 rounded-full text-[11px] font-black font-mono whitespace-nowrap shadow-sm border border-white/5 transition-all hover:scale-105 cursor-pointer flex items-center gap-1.5 ${
                          h.multiplier > 10 ? 'bg-aviator-purple text-white shadow-purple-500/20' : 
                          h.multiplier > 2 ? 'bg-aviator-accent text-black shadow-cyan-500/20' : 
                          'bg-white/5 text-white/40'
                        }`}
                      >
                        <Gift className={`w-3 h-3 ${h.multiplier < 2 ? 'hidden' : 'block'}`} />
                        {h.multiplier.toFixed(2)}x
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setActiveTab('statistics')} className="p-2.5 ml-2 hover:bg-white/5 rounded-2xl transition-colors shrink-0">
                    <History className="w-4 h-4 text-white/40" />
                  </button>
                </div>

                <div className="flex-1 relative glass rounded-[2.5rem] overflow-hidden group border border-white/5 bg-gradient-to-br from-aviator-bg to-black/80">
                  <div className="absolute inset-x-0 h-40 bottom-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none z-10"></div>
                  
                  <GameCanvas multiplier={multiplier} status={status} />

                  <AnimatePresence>
                    {lastWin && (
                      <motion.div 
                        initial={{ opacity: 0, y: 100, scale: 0.5 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.5, filter: 'blur(10px)' }}
                        className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none"
                      >
                         <div className="bg-aviator-accent text-black p-8 rounded-[3rem] shadow-[0_0_100px_rgba(0,242,255,0.4)] flex flex-col items-center gap-2 border-4 border-white/20">
                            <span className="text-xl font-game font-black tracking-widest uppercase">Cashed Out!</span>
                             <div className="text-6xl font-game font-black">৳{lastWin.amount.toFixed(2)}</div>
                             <div className="flex items-center gap-4 mt-2">
                                <span className="text-sm font-black opacity-60">@{lastWin.multiplier.toFixed(2)}x</span>
                                <div className="w-1 h-1 rounded-full bg-black/20"></div>
                                <span className="text-sm font-black text-green-700">PROFIT: ৳{(lastWin.amount - (lastWin.amount / lastWin.multiplier)).toFixed(2)}</span>
                             </div>
                         </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20">
                     <AnimatePresence mode="wait">
                        {status === 'FLYING' ? (
                          <motion.div
                            key="multiplier"
                            initial={{ scale: 0.7, opacity: 0, filter: 'blur(10px)' }}
                            animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
                            exit={{ scale: 1.3, opacity: 0, filter: 'blur(20px)' }}
                            className="text-[6rem] md:text-[11rem] font-game font-black tracking-tighter neon-text flex items-baseline gap-2 text-white/90"
                          >
                            {multiplier.toFixed(2)}<span className="text-4xl md:text-6xl opacity-30 italic font-sans">x</span>
                          </motion.div>
                        ) : status === 'CRASHED' ? (
                          <motion.div
                            key="crashed"
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="flex flex-col items-center gap-3"
                          >
                             <span className="text-3xl md:text-5xl font-display font-black text-aviator-red tracking-[0.25em] italic drop-shadow-[0_0_20px_rgba(255,0,77,0.5)]">FLEW AWAY!</span>
                             <div className="bg-black/60 backdrop-blur-md px-8 py-2 rounded-2xl border border-white/10">
                                <span className="text-5xl md:text-7xl font-mono font-black text-white/90">{multiplier.toFixed(2)}x</span>
                             </div>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="waiting"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center gap-6"
                          >
                             <div className="relative w-40 h-40">
                                <motion.div 
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                                  className="absolute inset-0 rounded-full border-2 border-dashed border-aviator-accent/30 shadow-[0_0_30px_rgba(0,242,255,0.2)]"
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                   <img src="https://i.ibb.co/SD4SDF7n/1000033012.png" className="w-32 animate-float drop-shadow-2xl" />
                                </div>
                             </div>
                             <span className="text-sm font-black text-white/50 tracking-[0.6em] uppercase animate-pulse">Wait for takeoff</span>
                          </motion.div>
                        )}
                     </AnimatePresence>
                  </div>

                  <div 
                    onClick={() => setIsProvablyFairOpen(true)}
                    className="absolute top-6 right-6 flex items-center gap-2 glass px-3 py-1.5 rounded-full border-white/5 backdrop-blur-md z-30 cursor-pointer hover:bg-white/5 group transition-all"
                  >
                    <ShieldCheck className="w-3 h-3 text-green-400 group-hover:scale-110 transition-transform" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] leading-none text-white/40 group-hover:text-white">Provably Fair</span>
                  </div>
                </div>

                <BetControls 
                  isFlying={status === 'FLYING'} 
                  bet1={bet1}
                  bet2={bet2}
                  onBet={handleBet}
                  onCashOut={handleCashOut}
                  multiplier={multiplier}
                />
              </div>
            </motion.div>
          ) : activeTab === 'leaderboard' ? (
            <motion.div 
              key="leaderboard"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 w-full max-w-6xl mx-auto overflow-y-auto pb-20"
            >
              <Leaderboard />
            </motion.div>
          ) : activeTab === 'bonuses' ? (
            <motion.div 
              key="bonuses"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 w-full max-w-6xl mx-auto overflow-y-auto pb-20"
            >
              <BonusSection />
            </motion.div>
          ) : activeTab === 'wallet' ? (
            <motion.div 
              key="wallet"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 w-full max-w-6xl mx-auto overflow-y-auto pb-20"
            >
              <WalletSection balance={balance} user={user} onTransaction={handleTransaction} onRedeem={handleRedeem} />
            </motion.div>
          ) : activeTab === 'profile' ? (
            <motion.div 
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 w-full max-w-6xl mx-auto overflow-y-auto pb-20"
            >
              <ProfileSection user={user} balance={balance} onLogout={handleLogout} onTabChange={handleTabChange} />
            </motion.div>
          ) : activeTab === 'admin' && isAdmin ? (
            <motion.div 
              key="admin"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 w-full overflow-hidden"
            >
              <AdminPanel />
            </motion.div>
          ) : activeTab === 'support' ? (
            <motion.div 
              key="support"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex flex-col items-center justify-center p-12 text-center"
            >
               <div className="w-24 h-24 rounded-[2rem] bg-aviator-accent/10 flex items-center justify-center mb-8">
                  <Headset className="w-12 h-12 text-aviator-accent" />
               </div>
               <h2 className="text-4xl font-game font-black mb-4">LIVE SUPPORT</h2>
               <p className="text-white/40 max-w-md italic mb-10">Our agents are online 24/7 to help you with deposits, withdrawals, or technical issues.</p>
               <a 
                href="https://wa.me/8801700000000" 
                target="_blank" 
                rel="noreferrer"
                className="px-12 py-5 bg-[#25D366] text-white font-black rounded-2xl hover:brightness-110 transition-all uppercase tracking-widest shadow-xl flex items-center gap-3"
               >
                 <MessageCircle className="w-6 h-6" />
                 Chat on WhatsApp
               </a>
            </motion.div>
          ) : (
            <motion.div 
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center text-center p-12 glass rounded-[2.5rem]"
            >
              <div className="w-24 h-24 rounded-full bg-aviator-accent/20 flex items-center justify-center mb-8">
                <Star className="w-12 h-12 text-aviator-accent animate-pulse" />
              </div>
              <h2 className="text-4xl font-black mb-4 uppercase tracking-tighter">{activeTab.replace('-', ' ')}</h2>
              <p className="max-w-md text-white/40 font-medium leading-relaxed italic">
                This section is coming soon to the TF Aviator platform. Stay tuned for advanced analytics, personalized promotions, and integrated features.
              </p>
              <button 
                onClick={() => setActiveTab('play')}
                className="mt-8 px-12 py-4 bg-white text-black font-black rounded-2xl hover:bg-aviator-accent transition-all uppercase tracking-widest"
              >
                Return to Game
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <PaymentModal isOpen={isDepositOpen} onClose={() => setIsDepositOpen(false)} />
      <ProfileModal 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
        user={user}
        onLogout={handleLogout}
        balance={balance}
      />
      <ProvablyFairModal isOpen={isProvablyFairOpen} onClose={() => setIsProvablyFairOpen(false)} />
      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
        activeTab={activeTab}
        onTabChange={handleTabChange}
        user={user}
        onLogout={handleLogout}
        isAdmin={isAdmin}
      />
      
      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        type={authType} 
        setType={setAuthType} 
      />

      <footer className="h-12 px-8 flex items-center justify-between text-[10px] uppercase tracking-[0.3em] text-white/10 font-black border-t border-white/5 bg-black/20">
        <div className="hidden lg:flex gap-8">
          <span>RNG BSI Certified</span>
          <span>Responsible Gaming Member</span>
          <span>PCI DSS Secure</span>
        </div>
        <div className="flex items-center gap-3">
           <span className="text-aviator-accent tracking-[0.1em]">TF AVIATOR SYSTEM v4.2</span>
           <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
        </div>
      </footer>
    </div>
  );
}
