import React, { useState, useEffect } from 'react';
import { X, Sparkles, Gift, CheckCircle2, ShieldCheck, Trophy } from 'lucide-react';
import { enterGiveawayInFirestore, UserProfileData } from '../lib/firebase';

interface GiveawayModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfileData | null;
  onOpenAuth: () => void;
  onEnteredGiveaway: (pointsAdded: number) => void;
}

export const GiveawayModal: React.FC<GiveawayModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onOpenAuth,
  onEnteredGiveaway,
}) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const giveawayId = 'giveaway-sept-2026-5x100k';
  const isAlreadyClaimed = userProfile?.claimedGiveaways?.includes(giveawayId) || hasEntered;

  const handleEnter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) {
      onOpenAuth();
      return;
    }

    const entryEmail = email.trim() || userProfile.email || 'trader@propfirmmatch.com';
    setIsSubmitting(true);
    try {
      await enterGiveawayInFirestore(userProfile.uid, entryEmail, giveawayId);
      setHasEntered(true);
      onEnteredGiveaway(25);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto"
    >
      <div 
        className="relative w-full max-w-lg my-auto bg-[#141226] border border-purple-500/50 rounded-2xl p-6 sm:p-8 shadow-2xl text-slate-100 max-h-[88vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 text-slate-300 hover:text-white p-1.5 rounded-xl bg-slate-800/80 hover:bg-purple-600/80 border border-slate-700/60 transition-all cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-600 via-purple-600 to-amber-500 flex items-center justify-center mx-auto mb-3 shadow-xl shadow-purple-900/50">
            <Trophy className="w-7 h-7 text-white" />
          </div>
          <span className="px-3 py-1 rounded-full bg-pink-950/80 border border-pink-500/40 text-pink-300 text-xs font-bold uppercase tracking-wider">
            September 2026 Live Giveaway
          </span>
          <h3 className="text-2xl font-extrabold text-white mt-2 tracking-tight">
            Win 1 of 5 $100K Futures Accounts
          </h3>
          <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto">
            Sponsored by <span className="font-bold text-white">Lucid Trading</span> & <span className="font-bold text-white">Apex Trader Funding</span>. Live drawing on October 1st.
          </p>
        </div>

        {/* Prize cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-[#1c1836] border border-purple-800/50 rounded-xl p-3 text-center">
            <div className="text-xs text-slate-400">Grand Prize (3 Winners)</div>
            <div className="text-lg font-black text-amber-400 mt-0.5">$100K Account</div>
            <div className="text-[11px] text-slate-300">Lucid Trading (EOD Drawdown)</div>
          </div>
          <div className="bg-[#1c1836] border border-purple-800/50 rounded-xl p-3 text-center">
            <div className="text-xs text-slate-400">Runner Up (2 Winners)</div>
            <div className="text-lg font-black text-pink-400 mt-0.5">$100K Combine</div>
            <div className="text-[11px] text-slate-300">Apex Trader Funding (Tradovate)</div>
          </div>
        </div>

        {isAlreadyClaimed ? (
          <div className="bg-emerald-950/60 border border-emerald-500/50 rounded-xl p-5 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <div className="font-bold text-white text-base">You are officially registered!</div>
            <p className="text-xs text-emerald-200">
              Your entry is confirmed in our database. Winners will receive an email notification with account credentials. +25 LP added to your balance!
            </p>
          </div>
        ) : (
          <form onSubmit={handleEnter} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Notification Email
              </label>
              <input
                type="email"
                required
                value={email || userProfile?.email || ''}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your trading email..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-sm shadow-lg shadow-purple-900/50 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Gift className="w-4 h-4" />
              <span>{isSubmitting ? 'Entering...' : 'Claim Free Giveaway Entry (+25 LP)'}</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
