import React, { useState, useEffect } from 'react';
import { X, Sparkles, Check, Gift, ArrowRight, Clock, Star, Trophy } from 'lucide-react';
import { UserProfileData, claimDailyBonus } from '../lib/firebase';

interface LoyaltyPointsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfileData | null;
  onOpenAuth: () => void;
  onPointsUpdated: (newTotal: number) => void;
}

export const LoyaltyPointsModal: React.FC<LoyaltyPointsModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onOpenAuth,
  onPointsUpdated,
}) => {
  const [claiming, setClaiming] = useState(false);
  const [claimMsg, setClaimMsg] = useState<string | null>(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleClaimDaily = async () => {
    if (!userProfile) {
      onOpenAuth();
      return;
    }
    setClaiming(true);
    try {
      const res = await claimDailyBonus(userProfile.uid);
      if (res.success) {
        setClaimMsg('Success! +10 LP added to your account.');
        onPointsUpdated(res.newTotal);
      } else {
        setClaimMsg('You already claimed your daily bonus today! Check back tomorrow.');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setClaiming(false);
    }
  };

  const points = userProfile?.loyaltyPoints || 200;

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto"
    >
      <div 
        className="relative w-full max-w-lg my-auto bg-[#141226] border border-purple-500/50 rounded-2xl p-5 sm:p-7 shadow-2xl text-slate-100 max-h-[88vh] overflow-y-auto custom-scrollbar"
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
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-purple-600 flex items-center justify-center mx-auto mb-3 shadow-xl shadow-amber-500/20 text-2xl">
            💎
          </div>
          <h3 className="text-2xl font-extrabold text-white tracking-tight">
            PFM Loyalty Program
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Earn Loyalty Points (LP) by reviewing prop firms, daily check-ins, and participating in the trading community.
          </p>

          <div className="mt-4 p-4 rounded-xl bg-[#1b1736] border border-purple-800/60 inline-flex flex-col items-center">
            <span className="text-xs text-slate-400 uppercase font-semibold">Your Balance</span>
            <span className="text-3xl font-black text-amber-400 tracking-tight mt-0.5">
              {points} LP
            </span>
            <span className="text-[11px] text-purple-300 mt-1">Tier: Pro Trader (Level 1)</span>
          </div>
        </div>

        {/* Daily Claim Box */}
        <div className="bg-[#1a1c33] border border-purple-900/50 rounded-xl p-4 mb-5 flex items-center justify-between gap-4">
          <div>
            <div className="font-bold text-white text-xs flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Daily Check-In Reward (+10 LP)</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Log in once every 24 hours to earn free LP</div>
          </div>
          <button
            onClick={handleClaimDaily}
            disabled={claiming}
            className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50 flex-shrink-0"
          >
            {claiming ? 'Claiming...' : 'Claim +10 LP'}
          </button>
        </div>

        {claimMsg && (
          <div className="mb-4 p-2.5 rounded-lg bg-purple-950/80 border border-purple-500/40 text-purple-200 text-xs text-center">
            {claimMsg}
          </div>
        )}

        {/* Ways to earn */}
        <div className="space-y-2 mb-6 text-xs">
          <div className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">Ways to Earn LP</div>
          
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Account Sign Up Welcome Bonus</span>
            </div>
            <span className="font-bold text-emerald-400">+200 LP (Claimed)</span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400" />
              <span>Submit a Verified Prop Firm Review</span>
            </div>
            <span className="font-bold text-amber-400">+50 LP</span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-2">
              <Gift className="w-4 h-4 text-pink-400" />
              <span>Enter Monthly Funded Account Giveaway</span>
            </div>
            <span className="font-bold text-pink-400">+25 LP</span>
          </div>
        </div>

        {/* Redeem perks teaser */}
        <div className="border-t border-slate-800 pt-4 text-center">
          <p className="text-[11px] text-slate-400 mb-3">
            Redeem points for exclusive prop firm coupon boosts, free combines, and merch in the Rewards Marketplace.
          </p>
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-medium text-xs transition-colors cursor-pointer"
          >
            Close Window
          </button>
        </div>

      </div>
    </div>
  );
};
