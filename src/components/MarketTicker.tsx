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
 <div className="bg-[#090d16] border-b border-[#2b2e2c]/80">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
 
 {/* Top Live Stats Bar */}
 <div className="flex flex-wrap items-center justify-between gap-3 text-xs border-b border-[#2b2e2c]/50 pb-2.5 mb-2.5">
 <div className="flex flex-wrap items-center gap-4 text-[#747976]">
 <div className="flex items-center gap-1.5">
 <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
 <span className="text-[#9a9e9b] font-semibold">{totalFirmsCount} Active Prop Firms</span>
 <span className="text-[#9a9e9b]">In latest import</span>
 </div>

 <div className="hidden sm:flex items-center gap-1.5">
 <ShieldCheck className="w-3.5 h-3.5 text-[#3ecf8e]" />
 <span className="text-[#9a9e9b] font-medium">Source: PropFirmMap</span>
 </div>

 <div className="hidden md:flex items-center gap-1.5">
 <Award className="w-3.5 h-3.5 text-amber-400" />
 <span className="text-[#9a9e9b]">Ratings from source data</span>
 </div>
 </div>

 <div className="flex items-center gap-3">
 <button
 onClick={onOpenDiscounts}
 className="group flex items-center gap-1 text-[#3ecf8e] hover:text-[#3ecf8e] font-medium transition-colors duration-150"
 >
 <Zap className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
 <span>Browse current offers</span>
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
 ? 'bg-[#3ecf8e] text-[#171918] shadow-sm shadow-emerald-500/20'
 : 'bg-[#1d1f1e]/80 text-[#747976] hover:text-[#9a9e9b] hover:bg-[#222522] border border-[#2b2e2c]/60'
 }`}
 >
 {tab.label}
 </button>
 ))}
 </div>

 <div className="hidden lg:flex items-center gap-2 text-xs text-[#747976]">
 <span className="flex items-center gap-1">
 <Percent className="w-3.5 h-3.5 text-[#3ecf8e]" />
 Zero Commission & Raw Spreads verified
 </span>
 </div>
 </div>

 </div>
 </div>
 );
};
