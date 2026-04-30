import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, Settings, ShieldAlert, DollarSign, 
  BarChart3, UserCheck, UserMinus, Plus, 
  AlertTriangle, Save, RefreshCcw, Search, Key
} from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, getDocs, doc, setDoc, updateDoc, getDoc, addDoc, deleteDoc, orderBy, limit, increment } from 'firebase/firestore';

export const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [codes, setCodes] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [newCode, setNewCode] = useState({ code: '', amount: 100 });
  const [settings, setSettings] = useState({
    supportNumber: '+880 1700-000000',
    aiControlMode: 'fair',
    minDeposit: 500,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'users' | 'transactions' | 'settings'>('users');
  const [editingUser, setEditingUser] = useState<any>(null);

  const methods = [
    { id: 'bkash', label: 'bKash', icon: 'https://i.ibb.co/37XyZzG/bkash.png' },
    { id: 'nagad', label: 'Nagad', icon: 'https://i.ibb.co/L5hY8mX/nagad.png' },
    { id: 'binance', label: 'Binance', icon: 'https://i.ibb.co/0XyZzG/binance.png' }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const [bets, setBets] = useState<any[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const usersSnap = await getDocs(query(collection(db, 'users')));
      setUsers(usersSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      
      const codesSnap = await getDocs(query(collection(db, 'redeemCodes')));
      setCodes(codesSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      const txSnap = await getDocs(query(collection(db, 'transactions'), orderBy('timestamp', 'desc')));
      setTransactions(txSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      
      const betsSnap = await getDocs(query(collection(db, 'bets'), limit(100)));
      setBets(betsSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      const settingsSnap = await getDoc(doc(db, 'settings', 'global'));
      if (settingsSnap.exists()) {
        setSettings(settingsSnap.data() as any);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const totalHouseProfit = bets.reduce((acc, bet) => {
    if (bet.status === 'lost') return acc + (bet.amount || 0);
    if (bet.status === 'cashed-out') return acc - ((bet.profit || 0));
    return acc;
  }, 0);

  const handleApproveTransaction = async (tx: any) => {
    try {
      const userRef = doc(db, 'users', tx.userId);
      const userDoc = await getDoc(userRef);
      if (!userDoc.exists()) return;
      
      const currentBalance = userDoc.data().balance || 0;
      const amount = tx.amount;
      const newBalance = tx.type === 'deposit' ? currentBalance + amount : currentBalance - amount;
      
      await updateDoc(userRef, { balance: newBalance });
      await updateDoc(doc(db, 'transactions', tx.id), { status: 'completed' });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRejectTransaction = async (txId: string) => {
    try {
      await updateDoc(doc(db, 'transactions', txId), { status: 'rejected' });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateCode = async () => {
    if (!newCode.code) return;
    try {
      await setDoc(doc(db, 'redeemCodes', newCode.code), {
        code: newCode.code,
        amount: newCode.amount,
        usedBy: []
      });
      fetchData();
      setNewCode({ code: '', amount: 100 });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCode = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'redeemCodes', id));
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleBan = async (userId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'users', userId), { isBanned: !currentStatus });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateBalance = async (userId: string, currentBalance: number, amount: number) => {
    if (isNaN(amount)) return;
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { 
        balance: increment(amount) 
      });
      if (editingUser && editingUser.id === userId) {
        setEditingUser({ ...editingUser, balance: (editingUser.balance || 0) + amount });
      }
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const saveSettings = async () => {
    try {
      await setDoc(doc(db, 'settings', 'global'), settings);
      alert('Settings saved!');
    } catch (err) {
      console.error(err);
    }
  };

  const filteredUsers = users.filter(u => 
    u.displayName?.toLowerCase().includes(search.toLowerCase()) || 
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.uid === search
  );

  return (
    <div className="flex flex-col lg:flex-row h-full min-h-[600px] bg-black/40 overflow-hidden text-white">
      {loading && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <RefreshCcw className="w-10 h-10 text-aviator-accent animate-spin" />
        </div>
      )}
      {/* Side Menu */}
      <div className="w-full lg:w-72 bg-black/60 border-b lg:border-b-0 lg:border-r border-white/5 p-6 flex flex-col gap-8 h-auto lg:h-full shrink-0 z-10">
        <div>
          <div className="text-xl font-game font-black text-aviator-accent mb-1 uppercase tracking-tighter">Admin <span className="text-white italic">Suite</span></div>
          <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Game Management</p>
        </div>

        <nav className="flex flex-col gap-2 flex-1">
          {[
            { id: 'users', label: 'USER DIRECTORY', icon: Users, desc: 'Manage players & funds' },
            { id: 'transactions', label: 'TRANSACTIONS', icon: RefreshCcw, desc: 'Deposit & Withdrawal' },
            { id: 'settings', label: 'SYSTEM CONFIG', icon: Settings, desc: 'Game engine & limits' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex flex-col gap-0.5 p-4 rounded-2xl transition-all text-left relative group ${
                activeTab === t.id ? 'bg-aviator-accent text-black' : 'hover:bg-white/5 text-white/40'
              }`}
            >
              <div className="flex items-center gap-3">
                <t.icon className={`w-4 h-4 ${activeTab === t.id ? 'text-black' : 'text-white/30 group-hover:text-white'}`} />
                <span className="text-[11px] font-black uppercase tracking-widest">{t.label}</span>
              </div>
              <span className={`text-[9px] font-bold opacity-60 ml-7 ${activeTab === t.id ? 'text-black' : ''}`}>{t.desc}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 rounded-3xl bg-aviator-accent/10 border border-aviator-accent/20 space-y-3">
           <div className="text-[10px] font-black text-aviator-accent uppercase tracking-widest">House Performance</div>
           <div className="text-2xl font-game font-black">৳{totalHouseProfit.toLocaleString()}</div>
           <div className="flex items-center gap-2 text-[9px] font-black text-white/40 uppercase">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
              Real-time Monitoring
           </div>
        </div>
      </div>

      <div className="flex-1 p-6 lg:p-10 overflow-y-auto h-full scrollbar-hide">
        <AnimatePresence mode="wait">
          {activeTab === 'users' ? (
            <motion.div 
              key="users"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-3xl font-black">PLAYERS</h3>
                  <p className="text-xs font-black text-white/30 uppercase tracking-[0.2em] mt-1">Directory of all registered aviators</p>
                </div>
                <div className="relative group">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-aviator-accent transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Search UID, Email or Name..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="bg-black/60 border border-white/10 rounded-2xl pl-14 pr-6 py-4 text-xs font-bold w-full md:w-80 focus:border-aviator-accent outline-none shadow-xl"
                  />
                </div>
              </div>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="glass p-8 rounded-[2.5rem] border border-white/5">
                    <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-2">Total Accounts</div>
                    <div className="text-4xl font-game font-black">{users.length}</div>
                 </div>
                 <div className="glass p-8 rounded-[2.5rem] border border-white/5">
                    <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-2">Circulating Capital</div>
                    <div className="text-4xl font-game font-black text-aviator-accent">৳{(users.reduce((acc, u) => acc + (u.balance || 0), 0) / 1000).toFixed(1)}k</div>
                 </div>
                 <div className="glass p-8 rounded-[2.5rem] border border-white/5">
                    <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-2">Suspended</div>
                    <div className="text-4xl font-game font-black text-red-500">{users.filter(u => u.isBanned).length}</div>
                 </div>
              </div>

              <div className="glass rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
                <table className="w-full text-left">
                  <thead className="bg-white/5 border-b border-white/5">
                    <tr>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white/40">User Profile</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white/40">Financials</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white/40 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-8 py-6">
                           <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                                {u.photoURL ? <img src={u.photoURL} alt="" className="w-full h-full object-cover" /> : <Users className="w-5 h-5 text-white/20" />}
                              </div>
                              <div className="flex flex-col min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-black truncate">{u.displayName || 'Pilot'}</span>
                                  <button 
                                    onClick={() => setEditingUser(u)}
                                    className="p-1 hover:bg-aviator-accent/20 rounded-md text-aviator-accent transition-all"
                                    title="Edit User"
                                  >
                                    <Settings className="w-3 h-3" />
                                  </button>
                                  {u.isBanned && <span className="bg-red-500/10 text-red-500 text-[8px] font-black px-1.5 py-0.5 rounded uppercase shrink-0">Suspended</span>}
                                </div>
                                <span className="text-[10px] text-white/30 font-mono truncate">{u.email}</span>
                                <span className="text-[9px] text-white/20 font-mono tracking-tighter uppercase mt-1">UID: {u.uid}</span>
                              </div>
                           </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex flex-col gap-2">
                            <div 
                              onClick={() => setEditingUser(u)}
                              className="cursor-pointer group"
                            >
                              <span className="text-2xl font-mono font-black text-aviator-accent leading-none font-game group-hover:text-white transition-colors">৳{u.balance?.toLocaleString()}</span>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Settings className="w-2.5 h-2.5 text-white/40" />
                                <span className="text-[8px] font-black text-white/40 uppercase">Manage Funds</span>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                               {[500, 1000, 5000].map(amt => (
                                 <button 
                                  key={amt}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUpdateBalance(u.id, u.balance || 0, amt);
                                  }}
                                  className="px-3 py-1.5 rounded-xl bg-green-500/10 text-green-500 text-[10px] font-black hover:bg-green-500 hover:text-black transition-all border border-green-500/20"
                                 >
                                  +৳{amt}
                                 </button>
                               ))}
                               <button 
                                 onClick={() => {
                                   const custom = prompt('Enter custom amount:');
                                   if (custom && !isNaN(parseInt(custom))) handleUpdateBalance(u.id, u.balance || 0, parseInt(custom));
                                 }}
                                 className="px-3 py-1.5 rounded-xl bg-white/5 text-white/60 text-[10px] font-black hover:bg-white hover:text-black transition-all border border-white/10 italic"
                               >
                                 CUSTOM
                               </button>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <button 
                              onClick={() => handleToggleBan(u.id, !!u.isBanned)}
                              title={u.isBanned ? "Lift Ban" : "Apply Ban"}
                              className={`w-11 h-11 flex items-center justify-center rounded-2xl transition-all border shadow-lg ${
                                u.isBanned 
                                ? "bg-green-500 text-black border-transparent shadow-green-500/20" 
                                : "hover:bg-red-500 text-white border-white/5 hover:border-transparent shadow-red-500/10"
                              }`}
                            >
                              {u.isBanned ? <UserCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        ) : activeTab === 'transactions' ? (
          <motion.div 
            key="transactions"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <h3 className="text-2xl font-black flex items-center gap-3">
              <RefreshCcw className="w-6 h-6 text-aviator-accent" />
              TRANSACTION HISTORY
            </h3>
            <div className="glass rounded-[2rem] border border-white/5 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-white/5 border-b border-white/5">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/40">Requester</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/40">Method & Account</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/40">Amount</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/40 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black uppercase">{tx.userName || 'System User'}</span>
                          <span className="text-[9px] font-mono font-bold text-white/40">{tx.userId}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                             <img src={methods.find(m => m.id === tx.method)?.icon} className="h-3 w-auto" alt="" />
                             <span className={`text-[10px] font-black uppercase ${tx.type === 'deposit' ? 'text-green-400' : 'text-orange-400'}`}>
                                {tx.type} via {tx.method}
                             </span>
                          </div>
                          <span className="text-[11px] font-mono font-black text-white/60 tracking-wider">ACC: {tx.accountNumber || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                         <div className="flex flex-col">
                           <span className="text-lg font-mono font-black">৳{tx.amount?.toLocaleString()}</span>
                           <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full inline-block w-fit mt-1 ${
                             tx.status === 'completed' ? 'bg-green-500/20 text-green-500' : 
                             tx.status === 'rejected' ? 'bg-red-500/20 text-red-500' : 
                             'bg-yellow-500/20 text-yellow-500'
                           }`}>
                             {tx.status}
                           </span>
                         </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {tx.status === 'pending' && (
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => handleRejectTransaction(tx.id)}
                              className="px-3 py-1.5 rounded-xl bg-red-500/10 text-red-500 text-[10px] font-black hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
                            >
                              REJECT
                            </button>
                            <button 
                              onClick={() => handleApproveTransaction(tx)}
                              className="px-3 py-1.5 rounded-xl bg-green-500 text-black text-[10px] font-black hover:brightness-110 transition-all shadow-lg shadow-green-500/20"
                            >
                              APPROVE
                            </button>
                          </div>
                        )}
                        <span className="text-[9px] text-white/20 font-mono block mt-2">
                           {new Date(tx.timestamp).toLocaleString()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="settings"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            <section className="glass p-8 rounded-[2rem] border border-white/5 space-y-6">
              <h3 className="text-xl font-black flex items-center gap-3">
                <Key className="w-5 h-5 text-aviator-accent" />
                REDEEM CODES
              </h3>
              <div className="space-y-4">
                <input 
                  type="text" 
                  placeholder="PROMO-CODE" 
                  value={newCode.code}
                  onChange={(e) => setNewCode({...newCode, code: e.target.value.toUpperCase()})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-aviator-accent"
                />
                <input 
                  type="number" 
                  placeholder="Amount (৳)" 
                  value={newCode.amount}
                  onChange={(e) => setNewCode({...newCode, amount: parseInt(e.target.value)})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-aviator-accent"
                />
                <button 
                  onClick={handleCreateCode}
                  className="w-full py-3 bg-white text-black font-black text-[10px] rounded-xl hover:bg-aviator-accent transition-all uppercase tracking-widest"
                >
                  Create Code
                </button>
              </div>

              <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                {codes.map(c => (
                  <div key={c.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                    <div>
                      <div className="text-xs font-black text-aviator-accent">{c.code}</div>
                      <div className="text-[10px] font-mono text-white/40">৳{c.amount}</div>
                    </div>
                    <button onClick={() => handleDeleteCode(c.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg">
                      <AlertTriangle className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            <section className="glass p-8 rounded-[2rem] border border-white/5 space-y-6 h-fit">
              <h3 className="text-xl font-black flex items-center gap-3">
                <Settings className="w-5 h-5 text-aviator-accent" />
                SYSTEM CONFIG
              </h3>

              <div className="flex justify-center gap-4 py-2 border-b border-white/5">
                  {methods.map(m => (
                    <img key={m.id} src={m.icon} alt={m.label} className="h-8 object-contain" />
                  ))}
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] px-1">Support WhatsApp</label>
                  <input 
                    type="text" 
                    value={settings.supportNumber}
                    onChange={(e) => setSettings({...settings, supportNumber: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-aviator-accent"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] px-1">Game Engine Mode</label>
                  <select 
                    value={settings.aiControlMode}
                    onChange={(e) => setSettings({...settings, aiControlMode: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-aviator-accent appearance-none cursor-pointer"
                  >
                    <option value="fair">100% Provably Fair</option>
                    <option value="house-win">Maximize House Win</option>
                    <option value="house-loss">Promo Mode (High Multipliers)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] px-1">Min Deposit (BDT)</label>
                  <input 
                    type="number" 
                    value={settings.minDeposit}
                    onChange={(e) => setSettings({...settings, minDeposit: parseInt(e.target.value)})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-aviator-accent"
                  />
                </div>

                <button 
                  onClick={saveSettings}
                  className="w-full py-4 bg-aviator-accent text-black font-black text-xs rounded-xl shadow-lg shadow-aviator-accent/20 flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  SAVE GLOBAL CONFIG
                </button>

                <div className="pt-4 border-t border-white/5 space-y-4">
                  <h3 className="text-xl font-black flex items-center gap-3 text-red-500">
                    <AlertTriangle className="w-5 h-5" />
                    EMERGENCY
                  </h3>
                  <button className="w-full py-4 border border-red-500/20 text-red-500 text-xs font-black rounded-xl hover:bg-red-500 hover:text-white transition-all">
                    PAUSE ALL ROUNDS
                  </button>
                </div>
              </div>
            </section>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingUser(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg glass border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl"
            >
              <div className="p-8 space-y-8">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                    {editingUser.photoURL ? <img src={editingUser.photoURL} alt="" /> : <Users className="w-8 h-8 text-white/10" />}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black">{editingUser.displayName || 'Pilot'}</h3>
                    <p className="text-xs font-mono text-white/30">{editingUser.email}</p>
                    <p className="text-[10px] font-mono text-white/20 mt-1 uppercase tracking-widest">ID: {editingUser.id}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="glass p-5 rounded-3xl border border-white/5">
                    <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Current Balance</div>
                    <div className="text-2xl font-game font-black text-aviator-accent">৳{editingUser.balance?.toLocaleString()}</div>
                  </div>
                  <div className="glass p-5 rounded-3xl border border-white/5">
                    <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Status</div>
                    <div className={`text-sm font-black uppercase ${editingUser.isBanned ? 'text-red-500' : 'text-green-500'}`}>
                      {editingUser.isBanned ? 'Permanent Ban' : 'Active Account'}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] px-1">Management Actions</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={async () => {
                        await handleToggleBan(editingUser.id, !!editingUser.isBanned);
                        setEditingUser(null);
                      }}
                      className={`py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
                        editingUser.isBanned 
                        ? 'bg-green-500 text-black shadow-lg shadow-green-500/20' 
                        : 'border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white'
                      }`}
                    >
                      {editingUser.isBanned ? 'Revoke Ban' : 'Suspend Account'}
                    </button>
                    <button 
                      onClick={async () => {
                        const amt = prompt('Add/Subtract amount (e.g. 500 or -500):');
                        if (amt && !isNaN(parseInt(amt))) {
                          await handleUpdateBalance(editingUser.id, editingUser.balance || 0, parseInt(amt));
                          setEditingUser(null);
                        }
                      }}
                      className="py-4 bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-aviator-accent transition-all"
                    >
                      Adjust Balance
                    </button>
                    <button 
                      onClick={async () => {
                        const amt = prompt('Enter exact new total balance (৳):');
                        if (amt && !isNaN(parseInt(amt))) {
                          const current = editingUser.balance || 0;
                          const diff = parseInt(amt) - current;
                          await handleUpdateBalance(editingUser.id, current, diff);
                          setEditingUser(null);
                        }
                      }}
                      className="py-4 border border-white/10 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/5 transition-all"
                    >
                      Set Total 
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 flex gap-4">
                  <button 
                    onClick={async () => {
                      await handleToggleBan(editingUser.id, !!editingUser.isBanned);
                      setEditingUser(null);
                    }}
                    className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
                      editingUser.isBanned 
                      ? 'bg-green-500 text-black shadow-lg shadow-green-500/20' 
                      : 'border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white'
                    }`}
                  >
                    {editingUser.isBanned ? 'Revoke User Ban' : 'Suspend Account'}
                  </button>
                </div>

                <button 
                  onClick={() => setEditingUser(null)}
                  className="w-full py-4 text-[10px] font-black uppercase text-white/20 hover:text-white transition-colors"
                >
                  Close Manager
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
};
