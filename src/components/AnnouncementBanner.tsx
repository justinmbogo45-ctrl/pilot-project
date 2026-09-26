import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

interface AnnouncementBannerProps {
  onOpenGiveaway: () => void;
}

export const AnnouncementBanner: React.FC<AnnouncementBannerProps> = ({ onOpenGiveaway }) => {
  return (
    <div className="w-full border-b border-[#2b2e2c] bg-[#1d1f1e] py-2 px-4 text-xs">
      <div className="mx-auto max-w-[1200px] flex items-center justify-center gap-2 text-center flex-wrap">
        <span className="flex items-center gap-1.5 font-medium text-[#9a9e9b]">
          <Sparkles className="h-3.5 w-3.5 text-[#3ecf8e] animate-pulse" />
          <span>New Giveaway Available</span>
        </span>
        <button
          onClick={onOpenGiveaway}
          id="top-banner-check-now"
          className="inline-flex items-center gap-1 font-semibold text-[#3ecf8e] hover:text-[#4eda9a] underline underline-offset-2 transition-colors duration-150 cursor-pointer group"
        >
          <span>Check Now</span>
          <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
};
