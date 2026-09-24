import React from 'react';
import { ShieldCheck, Award, Zap, Percent, ArrowUpRight } from 'lucide-react';

interface MarketTickerProps {
  totalFirmsCount: number;
  selectedMarket: string;
  setSelectedMarket: (market: string) => void;
  onOpenDiscounts: () => void;
}

export const MarketTicker: React.FC<MarketTickerProps> = ({
  totalFirmsCount,
  selectedMarket,
  setSelectedMarket,
  onOpenDiscounts,
}) => {
  const marketTabs = [
    { id: 'All', label: 'All Markets' },
    { id: 'Forex', label: 'Forex & CFDs' },
    { id: 'Futures', label: 'Futures Trading' },
    { id: 'Crypto', label: 'Crypto & Digital' },
    { id: 'Instant', label: 'Instant Funding' },
  ];

  return (
    <div className="bg-[#090d16] border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        
        {/* Top Live Stats Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs border-b border-slate-800/50 pb-2.5 mb-2.5">
          <div className="flex flex-wrap items-center gap-4 text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-slate-200 font-semibold">{totalFirmsCount} Active Prop Firms</span>
              <span className="text-slate-500">Tracked Live</span>
            </div>

            <div className="hidden sm:flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-300 font-medium">$540M+ Verified Payouts</span>
            </div>

            <div className="hidden md:flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-300">4.72 / 5.0 Avg TrustScore</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenDiscounts}
              className="group flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
              <span>Up to 80% OFF flash discounts active</span>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* Market Tabs */}
        <div className="flex items-center justify-between gap-3 overflow-x-auto no-scrollbar py-1">
          <div className="flex items-center gap-1.5 min-w-max">
            {marketTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedMarket(tab.id)}
                id={`market-tab-${tab.id.toLowerCase()}`}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedMarket === tab.id
                    ? 'bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/20'
                    : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Percent className="w-3.5 h-3.5 text-emerald-400" />
              Zero Commission & Raw Spreads verified
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
