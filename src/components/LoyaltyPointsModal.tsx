import React, { useState, useEffect } from 'react';
import { X, Sparkles, Check, Gift, ArrowRight, Clock, Star, Trophy } from 'lucide-react';
import { UserProfileData, claimDailyBonus } from '../lib/api';

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
      setClaimMsg((e as Error).message || 'Could not save your daily bonus.');
    } finally {
      setClaiming(false);
    }
  };

  const points = userProfile?.loyaltyPoints ?? 200;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto"
    >
      <div
        className="relative w-full max-w-lg my-auto bg-[#1d1f1e] border border-emerald-500/50 rounded-2xl p-5 sm:p-7 text-slate-100 max-h-[88vh] overflow-y-auto custom-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 text-[#9a9e9b] hover:text-[#f1f3f2] p-1.5 rounded-xl bg-[#222522]/80 hover:bg-emerald-600/80 border border-[#333633]/60 transition-all cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-emerald-600 flex items-center justify-center mx-auto mb-3 text-2xl">
            💎
          </div>
          <h3 className="text-2xl font-bold text-[#f1f3f2] tracking-tight">
            PFM Loyalty Program
          </h3>
          <p className="text-xs text-[#747976] mt-1">
            Earn Loyalty Points (LP) by reviewing prop firms, daily check-ins, and participating in the trading community.
          </p>

          <div className="mt-4 p-4 rounded-xl bg-[#222522] border border-emerald-800/60 inline-flex flex-col items-center">
            <span className="text-xs text-[#747976] uppercase font-semibold">Your Balance</span>
            <span className="text-3xl font-black text-amber-400 tracking-tight mt-0.5">
              {points} LP
            </span>
            <span className="text-[11px] text-[#3ecf8e] mt-1">Tier: Pro Trader (Level 1)</span>
          </div>
        </div>

        {/* Daily Claim Box */}
        <div className="bg-[#222522] border border-emerald-900/50 rounded-xl p-4 mb-5 flex items-center justify-between gap-4">
          <div>
            <div className="font-bold text-white text-xs flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Daily Check-In Reward (+10 LP)</span>
            </div>
            <div className="text-[11px] text-[#747976] mt-0.5">Log in once every 24 hours to earn free LP</div>
          </div>
          <button
            onClick={handleClaimDaily}
            disabled={claiming}
            className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition-all cursor-pointer disabled:opacity-50 flex-shrink-0"
          >
            {claiming ? 'Claiming...' : 'Claim +10 LP'}
          </button>
        </div>

        {claimMsg && (
          <div className="mb-4 p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs text-center">
            {claimMsg}
          </div>
        )}

        {/* Ways to earn */}
        <div className="space-y-2 mb-6 text-xs">
          <div className="font-bold text-[#9a9e9b] uppercase tracking-wider text-[11px]">Ways to Earn LP</div>

          <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#1d1f1e]/60 border border-[#2b2e2c]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#3ecf8e]" />
              <span>Account Sign Up Welcome Bonus</span>
            </div>
            <span className="font-bold text-[#3ecf8e]">+200 LP (Claimed)</span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#1d1f1e]/60 border border-[#2b2e2c]">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400" />
              <span>Submit a Verified Prop Firm Review</span>
            </div>
            <span className="font-bold text-amber-400">+50 LP</span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#1d1f1e]/60 border border-[#2b2e2c]">
            <div className="flex items-center gap-2">
              <Gift className="w-4 h-4 text-[#3ecf8e]" />
              <span>Enter Monthly Funded Account Giveaway</span>
            </div>
            <span className="font-bold text-[#3ecf8e]">+25 LP</span>
          </div>
        </div>

        {/* Redeem perks teaser */}
        <div className="border-t border-[#2b2e2c] pt-4 text-center">
          <p className="text-[11px] text-[#747976] mb-3">
            Redeem points for exclusive prop firm coupon boosts, free combines, and merch in the Rewards Marketplace.
          </p>
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-[#222522] hover:bg-slate-700 text-[#9a9e9b] hover:text-[#f1f3f2] font-medium text-xs transition-colors duration-150 cursor-pointer"
          >
            Close Window
          </button>
        </div>

      </div>
    </div>
  );
};
