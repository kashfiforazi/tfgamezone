import React, { useState } from 'react';
import { Minus, Plus, RefreshCw, Zap } from 'lucide-react';

interface BetSectionProps {
  label: string;
  onBet: (amount: number) => void;
  isFlying: boolean;
  onCashOut: () => void;
  isActive: boolean;
  isQueued: boolean;
  multiplier: number;
  betAmount: number;
  autoBet: boolean;
  setAutoBet: (v: boolean) => void;
  autoCashout: boolean;
  setAutoCashout: (v: boolean) => void;
  autoCashoutVal: number;
  setAutoCashoutVal: (v: number) => void;
}

const BetSection: React.FC<BetSectionProps> = ({ 
  label, onBet, isFlying, onCashOut, isActive, isQueued, multiplier, betAmount,
  autoBet, setAutoBet, autoCashout, setAutoCashout, autoCashoutVal, setAutoCashoutVal
}) => {
  const [amount, setAmount] = useState(100);

  const isPlaying = isActive || isQueued;

  return (
    <div className="flex-1 glass p-4 rounded-3xl flex flex-col gap-4 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
        <TrendingUpIcon className="w-24 h-24 rotate-12" />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {['BET', 'AUTO'].map((tab) => (
            <button
              key={tab}
              className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest ${
                tab === 'BET' ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white/60 transition-colors'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest leading-none">
          {label}
        </span>
      </div>

      <div className="flex gap-3 h-14">
        <div className="flex-1 bg-black/40 rounded-2xl border border-white/5 flex items-center p-1.5 gap-2">
          <button 
            onClick={() => setAmount(Math.max(10, amount - 10))}
            disabled={isPlaying}
            className="w-10 h-full flex items-center justify-center hover:bg-white/5 rounded-xl transition-colors disabled:opacity-30"
          >
            <Minus className="w-4 h-4 text-white/50" />
          </button>
          <div className={`flex-1 text-center font-mono font-bold text-lg ${isPlaying ? 'text-white/40' : 'text-white'}`}>
             ৳{amount}
          </div>
          <button 
            onClick={() => setAmount(amount + 10)}
            disabled={isPlaying}
            className="w-10 h-full flex items-center justify-center hover:bg-white/5 rounded-xl transition-colors disabled:opacity-30"
          >
            <Plus className="w-4 h-4 text-white/50" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-1.5 w-32">
          {[100, 200, 500, 1000].map((val) => (
            <button
              key={val}
              disabled={isPlaying}
              onClick={() => setAmount(val)}
              className="bg-white/5 hover:bg-white/10 text-[10px] font-bold rounded-lg transition-all active:scale-95 border border-white/5 disabled:opacity-30"
            >
              ৳{val}
            </button>
          ))}
        </div>
      </div>

      <div className="h-20">
        {!isPlaying ? (
          <button
            onClick={() => onBet(amount)}
            className="w-full h-full bg-green-500 hover:bg-green-400 border-b-4 border-green-700 rounded-2xl flex flex-col items-center justify-center gap-0 transition-all active:scale-95 shadow-lg shadow-green-500/20"
          >
            <span className="text-xl font-display font-black leading-none text-black">BET</span>
            {isFlying && <span className="text-[10px] font-bold text-black/60 uppercase">FOR NEXT ROUND</span>}
          </button>
        ) : isQueued ? (
          <button
            onClick={onCashOut}
            className="w-full h-full bg-aviator-red hover:bg-red-500 border-b-4 border-red-800 rounded-2xl flex flex-col items-center justify-center gap-0 transition-all active:scale-95 shadow-lg shadow-red-500/20"
          >
            <span className="text-xs font-bold text-white/80 uppercase leading-none text-center">WAITING...</span>
            <span className="text-xl font-display font-black text-white leading-none">CANCEL</span>
          </button>
        ) : isFlying ? (
          <button
            onClick={onCashOut}
            className="w-full h-full bg-aviator-accent hover:brightness-110 border-b-4 border-cyan-700 rounded-2xl flex flex-col items-center justify-center gap-0 transition-all active:scale-95 shadow-lg shadow-aviator-accent/20"
          >
            <span className="text-xs font-bold text-black/60 uppercase leading-none">CASH OUT</span>
            <span className="text-2xl font-display font-black text-black leading-none">৳{(multiplier * betAmount).toFixed(2)}</span>
          </button>
        ) : (
          <button
            disabled
            className="w-full h-full bg-white/5 border-b-4 border-white/10 rounded-2xl flex flex-col items-center justify-center gap-0 opacity-50 grayscale"
          >
            <span className="text-xs font-bold text-white/40 uppercase leading-none tracking-widest">PLACED</span>
            <span className="text-lg font-display font-black text-white/20 leading-none">Wait...</span>
          </button>
        )}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-white/5">
        <label className="flex items-center gap-2 cursor-pointer group/label">
          <div className={`w-10 h-5 rounded-full relative transition-colors ${autoBet ? 'bg-aviator-accent' : 'bg-white/10'}`} onClick={() => setAutoBet(!autoBet)}>
            <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${autoBet ? 'left-6' : 'left-1'}`}></div>
          </div>
          <span className="text-[10px] font-bold text-white/40 uppercase group-hover/label:text-white/60 transition-colors">Auto Bet</span>
        </label>

        <div className="flex items-center gap-2">
           <label className="flex items-center gap-2 cursor-pointer group/label">
             <div className={`w-10 h-5 rounded-full relative transition-colors ${autoCashout ? 'bg-orange-500' : 'bg-white/10'}`} onClick={() => setAutoCashout(!autoCashout)}>
               <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${autoCashout ? 'left-6' : 'left-1'}`}></div>
             </div>
             <span className="text-[10px] font-bold text-white/40 uppercase group-hover/label:text-white/60 transition-colors">Auto Cashout</span>
           </label>
           <div className="flex items-center bg-black/40 border border-white/5 rounded-lg">
             <button 
               onClick={() => setAutoCashoutVal(Math.max(1.01, autoCashoutVal - 0.1))}
               className="px-2 py-1 hover:bg-white/5 text-white/30"
             >-</button>
             <div className="w-14 py-1 text-center text-xs font-mono font-bold text-aviator-accent">
               {autoCashoutVal.toFixed(2)}x
             </div>
             <button 
               onClick={() => setAutoCashoutVal(autoCashoutVal + 0.1)}
               className="px-2 py-1 hover:bg-white/5 text-white/30"
             >+</button>
           </div>
        </div>
      </div>
    </div>
  );
};

const TrendingUpIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
    <polyline points="17 6 23 6 23 12"></polyline>
  </svg>
);

export const BetControls: React.FC<{ 
  isFlying: boolean; 
  bet1: { isActive: boolean; isQueued: boolean; amount: number };
  bet2: { isActive: boolean; isQueued: boolean; amount: number };
  onBet: (slot: 1 | 2, amount: number) => void; 
  onCashOut: (slot: 1 | 2) => void;
  multiplier: number;
  auto1: { bet: boolean; cashout: boolean; val: number };
  setAuto1: (v: any) => void;
  auto2: { bet: boolean; cashout: boolean; val: number };
  setAuto2: (v: any) => void;
}> = ({ isFlying, bet1, bet2, onBet, onCashOut, multiplier, auto1, setAuto1, auto2, setAuto2 }) => {
  return (
    <div className="flex flex-col md:flex-row gap-4">
      <BetSection 
        label="BET 1" 
        isFlying={isFlying} 
        isActive={bet1.isActive} 
        isQueued={bet1.isQueued} 
        onBet={(amt) => onBet(1, amt)} 
        onCashOut={() => onCashOut(1)} 
        multiplier={multiplier} 
        betAmount={bet1.amount} 
        autoBet={auto1.bet}
        setAutoBet={(v) => setAuto1({ ...auto1, bet: v })}
        autoCashout={auto1.cashout}
        setAutoCashout={(v) => setAuto1({ ...auto1, cashout: v })}
        autoCashoutVal={auto1.val}
        setAutoCashoutVal={(v) => setAuto1({ ...auto1, val: v })}
      />
      <BetSection 
        label="BET 2" 
        isFlying={isFlying} 
        isActive={bet2.isActive} 
        isQueued={bet2.isQueued} 
        onBet={(amt) => onBet(2, amt)} 
        onCashOut={() => onCashOut(2)} 
        multiplier={multiplier} 
        betAmount={bet2.amount} 
        autoBet={auto2.bet}
        setAutoBet={(v) => setAuto2({ ...auto2, bet: v })}
        autoCashout={auto2.cashout}
        setAutoCashout={(v) => setAuto2({ ...auto2, cashout: v })}
        autoCashoutVal={auto2.val}
        setAutoCashoutVal={(v) => setAuto2({ ...auto2, val: v })}
      />
    </div>
  );
};
