import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Star, Copy, Check, Info, Award } from 'lucide-react';
import { PropFirm } from '../types';

interface ExclusiveOffersCarouselProps {
  firms: PropFirm[];
  onSelectFirm: (firm: PropFirm) => void;
  onOpenLoyaltyModal: () => void;
}

export const ExclusiveOffersCarousel: React.FC<ExclusiveOffersCarouselProps> = ({
  firms,
  onSelectFirm,
  onOpenLoyaltyModal,
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const eligibleFirms = firms.filter(f=>f.exclusiveDiscount);
  const totalPages = Math.max(1, Math.ceil(eligibleFirms.length / 8));
  const carouselFirms = eligibleFirms.slice((currentPage % totalPages) * 8, (currentPage % totalPages) * 8 + 8);

  const handleCopyCode = (e: React.MouseEvent, code: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
      <div className="relative rounded-2xl bg-gradient-to-b from-[#19152b] via-[#141224] to-[#0f101d] border border-purple-500/30 p-4 sm:p-6 shadow-2xl shadow-purple-950/40">
        
        {/* Top Header of Exclusive Box */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-4 border-b border-purple-900/30">
          
          {/* Left: 200 LP Welcome Bonus */}
          <button
            onClick={onOpenLoyaltyModal}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-500/40 text-xs font-semibold text-purple-200 hover:text-white hover:border-purple-400 transition-all cursor-pointer shadow-sm group"
          >
            <span className="text-amber-400 text-sm">💎</span>
            <span>200 LP Welcome Bonus</span>
            <Info className="w-3.5 h-3.5 text-purple-400 group-hover:text-purple-200" />
          </button>

          {/* Center Title */}
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-1.5">
              <span>Current Firm Offers</span>
              <span>🔥</span>
            </h2>
          </div>

          {/* Right: Carousel Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => (prev > 0 ? prev - 1 : totalPages - 1))}
              className="w-7 h-7 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors border border-slate-700/60"
              aria-label="Previous offers"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Pagination dots */}
            <div className="flex items-center gap-1.5 px-1">
              {Array.from({length:totalPages},(_,i)=>i).map((dot) => (
                <span
                  key={dot}
                  onClick={() => setCurrentPage(dot)}
                  className={`w-2 h-2 rounded-full cursor-pointer transition-all ${
                    currentPage === dot
                      ? 'bg-purple-400 w-4'
                      : 'bg-slate-700 hover:bg-slate-500'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={() => setCurrentPage((prev) => (prev < totalPages - 1 ? prev + 1 : 0))}
              className="w-7 h-7 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors border border-slate-700/60"
              aria-label="Next offers"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2 Rows x 4 Columns = 8 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-4">
          {carouselFirms.map((firm) => {
            const promo = firm.exclusiveDiscount;
            const isCopied = copiedCode === (promo?.code || '');

            return (
              <div
                key={firm.id}
                onClick={() => onSelectFirm(firm)}
                className="bg-[#181a2e]/90 hover:bg-[#1d2038] border border-purple-900/40 hover:border-purple-500/60 rounded-xl p-3.5 transition-all duration-200 cursor-pointer flex flex-col justify-between shadow-lg group relative overflow-hidden"
              >
                {/* Firm Logo & Star Ratings */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="relative">
                      <img
                        src={firm.logo}
                        alt={firm.name}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-700/80 bg-slate-900"
                      />
                      {firm.hasGoldBadge && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-md">
                          <Award className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-1">
                        {firm.name}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                        <span className="font-semibold text-white">{firm.trustpilotScore}</span>
                        <div className="flex items-center text-purple-400">
                          <Star className="w-3 h-3 fill-purple-400" />
                          <Star className="w-3 h-3 fill-purple-400" />
                          <Star className="w-3 h-3 fill-purple-400" />
                          <Star className="w-3 h-3 fill-purple-400" />
                          <Star className="w-3 h-3 fill-purple-400/50" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Offer & Coupon Copy Bar */}
                <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <div className="text-xs font-bold text-pink-400">
                    {promo?.discountPercent}% OFF
                  </div>

                  <button
                    onClick={(e) => handleCopyCode(e, promo?.code || '')}
                    className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
                      isCopied
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-[#22253f] hover:bg-purple-900/50 text-slate-200 border border-purple-800/40'
                    }`}
                  >
                    <span>{promo?.code || ''}</span>
                    {isCopied ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3 text-slate-400 group-hover:text-slate-200" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
