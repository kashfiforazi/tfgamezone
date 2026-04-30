import React, { useState, useEffect } from 'react';
import { Users, MessageSquare, History, Trophy } from 'lucide-react';
import { Player, ChatMessage } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { collection, query, orderBy, limit, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

export const LivePanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'bets' | 'chat'>('bets');
  const [bets, setBets] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    const qChats = query(
      collection(db, 'messages'),
      orderBy('timestamp', 'desc'),
      limit(20)
    );

    const unsubChats = onSnapshot(qChats, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).reverse());
    });

    const qBets = query(
      collection(db, 'bets'),
      orderBy('timestamp', 'desc'),
      limit(20)
    );

    const unsubBets = onSnapshot(qBets, (snapshot) => {
      setBets(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => { unsubChats(); unsubBets(); };
  }, []);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      await addDoc(collection(db, 'messages'), {
        user: auth.currentUser?.displayName || 'Pilot',
        userId: auth.currentUser?.uid,
        message: newMessage,
        timestamp: serverTimestamp()
      });
      setNewMessage('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col h-full glass rounded-l-2xl overflow-hidden">
      <div className="flex p-2 gap-1 border-bottom border-white/5">
        <button
          onClick={() => setActiveTab('bets')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'bets' ? 'bg-white/10 text-white' : 'text-white/40 hover:bg-white/5'
          }`}
        >
          <Users className="w-4 h-4" />
          LIVE BETS
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'chat' ? 'bg-white/10 text-white' : 'text-white/40 hover:bg-white/5'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          CHAT
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-2">
        <AnimatePresence mode="wait">
          {activeTab === 'bets' ? (
            <motion.div
              key="bets"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between text-[10px] uppercase font-bold text-white/30 px-1">
                <span>User</span>
                <div className="flex gap-8">
                   <span>Bet</span>
                   <span>Cash Out</span>
                </div>
              </div>
              {bets.length === 0 && (
                <div className="py-20 text-center text-[10px] font-black text-white/20 uppercase tracking-widest italic">
                   Waiting for bets...
                </div>
              )}
              {bets.map((bet) => (
                <div key={bet.id} className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5 group hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-aviator-purple/20 flex items-center justify-center text-aviator-accent text-[10px] font-bold border border-aviator-accent/20 overflow-hidden">
                      {bet.userPhoto ? (
                        <img src={bet.userPhoto} alt="" className="w-full h-full object-cover" />
                      ) : (
                        bet.userName?.charAt(0) || 'P'
                      )}
                    </div>
                    <span className="text-[10px] font-bold text-white/80">{bet.userName}</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-xs font-mono font-bold">৳{bet.amount}</span>
                    <div className="w-20 flex flex-col items-end">
                      {bet.status === 'cashed-out' ? (
                        <>
                          <span className="text-[10px] text-aviator-accent font-black">{bet.multiplier.toFixed(2)}x</span>
                          <span className="text-xs font-mono font-bold text-green-400">৳{bet.winAmount?.toLocaleString()}</span>
                        </>
                      ) : bet.status === 'lost' ? (
                        <span className="text-[10px] text-red-500 font-black italic">LOST</span>
                      ) : (
                        <span className="text-[10px] text-white/20 italic animate-pulse">Playing...</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex flex-col h-full"
            >
              <div className="flex-1 space-y-4 mb-4">
                {messages.length === 0 && (
                  <div className="py-20 text-center text-[10px] font-black text-white/20 uppercase tracking-widest italic">
                    Start the conversation...
                  </div>
                )}
                {messages.map((msg) => (
                  <div key={msg.id} className="flex gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
                    <div className="w-8 h-8 rounded-full bg-aviator-purple/20 shrink-0 flex items-center justify-center text-[10px] font-bold text-aviator-accent">
                      {msg.user?.[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[11px] font-bold text-aviator-accent">{msg.user}</span>
                      </div>
                      <p className="text-xs text-white/70 bg-white/5 p-2 rounded-lg rounded-tl-none">{msg.message}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-auto border-t border-white/10 pt-4 pb-2">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Type a message..." 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-aviator-accent transition-colors"
                  />
                  <button 
                    onClick={handleSendMessage}
                    className="absolute right-2 top-2 bottom-2 bg-aviator-accent text-black px-3 rounded-lg text-xs font-bold hover:brightness-110 active:scale-95 transition-all"
                  >
                    SEND
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="p-4 bg-black/40 border-t border-white/5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-aviator-accent" />
            <span className="text-xs font-bold tracking-wider uppercase">Today's Best</span>
          </div>
          <span className="text-[10px] text-white/40">Updated 2m ago</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
             {[1, 2, 3].map(i => (
               <div key={i} className="w-6 h-6 rounded-full border border-black bg-white/10 flex items-center justify-center text-[8px] font-bold">
                 U{i}
               </div>
             ))}
          </div>
          <span className="text-[11px] text-white/60">Top player won <span className="text-aviator-accent font-bold">$4,500</span></span>
        </div>
      </div>
    </div>
  );
};
