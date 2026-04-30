import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wallet, ArrowUpCircle, ArrowDownCircle, CreditCard, History, CheckCircle2, ChevronRight } from 'lucide-react';

type Method = 'bkash' | 'nagad' | 'binance';

export const WalletSection: React.FC<{ balance: number; user: any; onTransaction: (type: 'deposit' | 'withdraw', amount: number, method: Method) => void; onRedeem: (code: string) => Promise<boolean> }> = ({ balance, user, onTransaction, onRedeem }) => {
  const [tab, setTab] = useState<'deposit' | 'withdraw' | 'history' | 'redeem'>('deposit');
  const [method, setMethod] = useState<Method>('bkash');
  const [amount, setAmount] = useState<string>('');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [step, setStep] = useState<'form' | 'success'>('form');

  const methods = [
    { id: 'bkash', label: 'bKash', color: 'bg-[#D12053]', icon: 'https://i.ibb.co/37XyZzG/bkash.png' },
    { id: 'nagad', label: 'Nagad', color: 'bg-[#F26522]', icon: 'https://i.ibb.co/L5hY8mX/nagad.png' },
    { id: 'binance', label: 'Binance', color: 'bg-[#F3BA2F]', icon: 'https://i.ibb.co/0XyZzG/binance.png' }
  ];

  const handleAction = () => {
    if (tab === 'redeem') {
      handleRedeem();
      return;
    }
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) return;
    if (tab === 'withdraw' && numAmount > balance) return;
    
    onTransaction(tab as any, numAmount, method, accountNumber);
    setStep('success');
    setTimeout(() => {
      setStep('form');
      setAmount('');
    }, 3000);
  };

  const handleRedeem = async () => {
    if (!code) return;
    const success = await onRedeem(code);
    if (success) {
      setStep('success');
      setTimeout(() => {
        setStep('form');
        setCode('');
      }, 3000);
    } else {
      alert('Invalid or already used code!');
    }
  };

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto space-y-8 py-8 px-4">
      <div className="glass rounded-[2.5rem] overflow-hidden border border-white/5">
        <header className="p-10 border-b border-white/5 bg-gradient-to-r from-aviator-accent/10 to-transparent">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-aviator-accent uppercase tracking-widest flex items-center gap-2">
                <Wallet className="w-3 h-3" />
                Available Funds
              </span>
              <div className="text-5xl font-game font-black tracking-tight">৳{balance.toLocaleString()}</div>
            </div>
            <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/5 overflow-x-auto scrollbar-hide">
              {[
                { id: 'deposit', icon: ArrowUpCircle, label: 'Deposit' },
                { id: 'withdraw', icon: ArrowDownCircle, label: 'Withdraw' },
                { id: 'redeem', icon: CreditCard, label: 'Redeem' },
                { id: 'history', icon: History, label: 'History' }
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id as any)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all text-xs font-black uppercase tracking-widest whitespace-nowrap ${
                    tab === t.id ? 'bg-aviator-accent text-black shadow-lg shadow-aviator-accent/20' : 'text-white/40 hover:text-white'
                  }`}
                >
                  <t.icon className="w-4 h-4" />
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </header>

        <div className="p-10">
          <AnimatePresence mode="wait">
            {step === 'form' ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-12"
              >
                <div className="space-y-8">
                  {tab === 'redeem' ? (
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 px-2">Redeem Promo Code</label>
                      <div className="relative group">
                         <input 
                            type="text" 
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            placeholder="ENTER CODE"
                            className="w-full bg-black/40 border-2 border-white/5 rounded-2xl px-6 py-6 text-2xl font-mono font-black focus:border-aviator-accent transition-all outline-none text-center"
                          />
                      </div>
                      <p className="text-[10px] text-white/20 italic text-center">Contact support for codes or watch our Telegram channel.</p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 px-2">Select Payment Method</label>
                        <div className="grid grid-cols-3 gap-3">
                          {methods.map((m) => (
                            <button
                              key={m.id}
                              onClick={() => setMethod(m.id as any)}
                              className={`relative group p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 active:scale-95 ${
                                method === m.id ? 'border-aviator-accent bg-aviator-accent/5' : 'border-white/5 hover:border-white/20 bg-white/5'
                              }`}
                            >
                              <div className={`w-12 h-12 rounded-xl ${m.color} p-2 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                                <img src={m.icon} alt={m.label} className="w-full h-full object-contain" />
                              </div>
                              <span className="text-[10px] font-black uppercase">{m.label}</span>
                              {method === m.id && (
                                <div className="absolute -top-2 -right-2 w-6 h-6 bg-aviator-accent rounded-full flex items-center justify-center border-2 border-black">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-black" />
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 px-2">
                           {method === 'binance' ? 'Wallet Address / ID' : 'Mobile Account Number'}
                        </label>
                        <div className="relative group">
                          <input 
                            type="text" 
                            value={accountNumber}
                            onChange={(e) => setAccountNumber(e.target.value)}
                            placeholder={method === 'binance' ? 'TRC20 Address or Pay ID' : '01XXXXXXXXX'}
                            className="w-full bg-black/40 border-2 border-white/5 rounded-2xl px-6 py-6 text-xl font-mono font-black focus:border-aviator-accent transition-all outline-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 px-2">Transaction Amount (BDT)</label>
                        <div className="relative group">
                          <div className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-game font-black text-aviator-accent">৳</div>
                          <input 
                            type="number" 
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            className="w-full bg-black/40 border-2 border-white/5 rounded-2xl px-12 py-6 text-2xl font-mono font-black focus:border-aviator-accent transition-all outline-none"
                          />
                        </div>
                        <div className="flex gap-2 p-1">
                          {[500, 1000, 5000, 10000].map((val) => (
                            <button 
                              key={val}
                              onClick={() => setAmount(val.toString())}
                              className="px-4 py-2 rounded-lg bg-white/5 border border-white/5 text-[10px] font-black hover:bg-white/10 transition-all"
                            >
                              +৳{val}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="space-y-8 bg-white/5 rounded-3xl p-8 border border-white/5 flex flex-col justify-between">
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-aviator-accent/10 flex items-center justify-center">
                        {tab === 'redeem' ? <CheckCircle2 className="w-6 h-6 text-aviator-accent" /> : <CreditCard className="w-6 h-6 text-aviator-accent" />}
                      </div>
                      <h3 className="text-xl font-black uppercase tracking-tight">Summary</h3>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between text-xs font-bold px-2">
                        <span className="text-white/40">Action</span>
                        <span className="uppercase text-aviator-accent">{tab}</span>
                      </div>
                      {tab !== 'redeem' && (
                        <div className="flex justify-between text-xs font-bold px-2">
                          <span className="text-white/40">Method</span>
                          <span className="uppercase">{method}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-xs font-bold px-2">
                        <span className="text-white/40">Fee</span>
                        <span className="text-green-500">Free</span>
                      </div>
                      <div className="flex justify-between text-xs font-bold px-2">
                        <span className="text-white/40">Account</span>
                        <span className="uppercase text-white/60">{accountNumber || 'Not Set'}</span>
                      </div>
                      <div className="h-px bg-white/5 my-2"></div>
                      <div className="flex justify-between p-2 rounded-xl bg-black/40">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Total</span>
                        <span className="text-lg font-mono font-black text-aviator-accent">৳{tab === 'redeem' ? 'Promo' : parseFloat(amount || '0').toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={handleAction}
                    disabled={tab === 'redeem' ? !code : !amount}
                    className="w-full py-5 bg-white text-black font-black text-sm rounded-2xl hover:bg-aviator-accent transition-all uppercase tracking-[0.2em] shadow-xl disabled:opacity-50 disabled:grayscale"
                  >
                    Confirm {tab === 'deposit' ? 'Payment' : tab === 'redeem' ? 'Redeem' : 'Request'}
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-20 text-center space-y-6"
              >
                <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/20">
                  <CheckCircle2 className="w-12 h-12 text-green-500" />
                </div>
                <h3 className="text-3xl font-black tracking-tight uppercase">Request Submitted</h3>
                <p className="text-white/40 italic max-w-sm">
                  Your {tab} of ৳{parseFloat(amount).toLocaleString()} via {method} is being processed. 
                  Funds will appear in your account within 15-30 minutes.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass p-8 rounded-[2rem] border border-white/5 space-y-4">
          <h4 className="text-xs font-black uppercase tracking-widest text-white/40">Deposit Process</h4>
          <p className="text-xs text-white/60 leading-relaxed italic">
            1. Select bKash/Nagad/Binance<br />
            2. Enter amount and send funds to our official merchant wallet<br />
            3. Enter Transaction ID (TxID) in the form above<br />
            4. Wait for automated verification
          </p>
        </div>
        <div className="glass p-8 rounded-[2rem] border border-white/5 space-y-4">
          <h4 className="text-xs font-black uppercase tracking-widest text-white/40">Withdraw Rules</h4>
          <p className="text-xs text-white/60 leading-relaxed italic">
            - Minimum withdrawal: ৳1,000<br />
            - 24/7 Processing active<br />
            - Verified accounts get priority payouts<br />
            - Binance P2P support available for VIP levels
          </p>
        </div>
      </div>
    </div>
  );
};
