import React from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { UserProfileData } from '../lib/api';

interface WelcomeBonusBannerProps {
  userProfile: UserProfileData | null;
  onOpenAuth: () => void;
  onOpenLoyaltyModal: () => void;
}

export const WelcomeBonusBanner: React.FC<WelcomeBonusBannerProps> = ({
  userProfile, onOpenAuth, onOpenLoyaltyModal,
}) => {
  return (
    <section className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 mt-16 mb-8">
      <div className="rounded-2xl border border-[#3ecf8e]/20 bg-[#1d1f1e] p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">

        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-[#3ecf8e]/5 blur-3xl pointer-events-none" />

        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-[#3ecf8e]/30 bg-[#3ecf8e]/10 text-2xl">
            💎
          </div>
          <div>
            <h3 className="flex items-center gap-2 text-lg sm:text-xl font-bold text-[#f1f3f2] tracking-tight">
              <span>200 Loyalty Points Welcome Bonus</span>
              {userProfile && (
                <span className="flex items-center gap-1 rounded-md bg-[#3ecf8e]/15 px-2 py-0.5 text-xs font-semibold text-[#3ecf8e]">
                  <CheckCircle2 className="h-3 w-3" />
                  Claimed
                </span>
              )}
            </h3>
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-[#9a9e9b]">
              Sign up free to claim points, unlock rewards, save favorite firms, and start earning more through reviews and platform activity.
            </p>
          </div>
        </div>

        <div className="flex-shrink-0">
          {userProfile ? (
            <button
              onClick={onOpenLoyaltyModal}
              className="flex items-center gap-2 rounded-lg bg-[#3ecf8e] px-6 py-3 text-sm font-semibold text-[#171918] hover:bg-[#4eda9a] transition-colors duration-150 cursor-pointer"
            >
              <span>View Your {userProfile.loyaltyPoints} LP</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              id="welcome-create-account-btn"
              className="group flex items-center gap-2 rounded-lg bg-[#3ecf8e] px-6 py-3 text-sm font-semibold text-[#171918] hover:bg-[#4eda9a] transition-colors duration-150 cursor-pointer"
            >
              <span>Create Free Account</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
          )}
        </div>

      </div>
    </section>
  );
};
