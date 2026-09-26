import React from 'react';
import { Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { UserProfileData } from '../lib/api';

interface WelcomeBonusBannerProps {
  userProfile: UserProfileData | null;
  onOpenAuth: () => void;
  onOpenLoyaltyModal: () => void;
}

export const WelcomeBonusBanner: React.FC<WelcomeBonusBannerProps> = ({
  userProfile,
  onOpenAuth,
  onOpenLoyaltyModal,
}) => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 mb-8">
      <div className="rounded-2xl bg-gradient-to-r from-[#1f1538] via-[#24133b] to-[#1a0e2e] border border-purple-500/40 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
        
        {/* Glowing background accent */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Text Content */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-900/60 border border-purple-500/50 flex items-center justify-center flex-shrink-0 text-2xl shadow-inner">
            💎
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>200 Loyalty Points Welcome Bonus</span>
              {userProfile && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/40 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Claimed
                </span>
              )}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1.5 max-w-2xl leading-relaxed">
              Sign up free to claim points, unlock rewards, save favorite firms, and start earning more through reviews and platform activity.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex-shrink-0">
          {userProfile ? (
            <button
              onClick={onOpenLoyaltyModal}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-sm shadow-lg shadow-purple-900/50 hover:shadow-purple-700/50 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>View Your {userProfile.loyaltyPoints} LP</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              id="welcome-create-account-btn"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-sm shadow-lg shadow-purple-900/50 hover:shadow-purple-700/50 transition-all flex items-center gap-2 cursor-pointer group"
            >
              <span>Create Free Account</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          )}
        </div>

      </div>
    </section>
  );
};
