import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

interface AnnouncementBannerProps {
  onOpenGiveaway: () => void;
}

export const AnnouncementBanner: React.FC<AnnouncementBannerProps> = ({ onOpenGiveaway }) => {
  return (
    <div className="w-full bg-gradient-to-r from-[#1a0e2e] via-[#2d123d] to-[#1e0d29] border-b border-purple-900/40 text-xs py-2 px-4 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-center flex-wrap">
        <span className="flex items-center gap-1.5 font-medium text-pink-200">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>New Giveaway Available</span>
        </span>
        <button
          onClick={onOpenGiveaway}
          id="top-banner-check-now"
          className="inline-flex items-center gap-1 font-bold text-white hover:text-pink-300 underline underline-offset-2 transition-colors cursor-pointer group"
        >
          <span>Check Now</span>
          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
};
