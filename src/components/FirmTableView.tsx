import React, { useState } from 'react';
import {
  SlidersHorizontal,
  Heart,
  Star,
  ShieldCheck,
  Copy,
  Check,
  ArrowUpDown,
  Award,
  Info,
  ExternalLink,
  ChevronRight,
  Bell
} from 'lucide-react';
import { PropFirm, AccountPlan } from '../types';

interface FirmTableViewProps {
  firms: PropFirm[];
  preferredSize: number | 'All';
  currency: 'USD' | 'EUR' | 'GBP';
  savedFirmIds: string[];
  onToggleSave: (firmId: string) => void;
  onOpenDetails: (firm: PropFirm, plan: AccountPlan) => void;
  onOpenFilterDrawer: () => void;
  onOpenMethodologyModal: () => void;
  activeFilterPill: 'popular' | 'favorite' | 'new' | 'all';
  setActiveFilterPill: (pill: 'popular' | 'favorite' | 'new' | 'all') => void;
  onOpenPriceAlert?: (firm: PropFirm, plan: AccountPlan) => void;
}

export const FirmTableView: React.FC<FirmTableViewProps> = ({
  firms, preferredSize, currency, savedFirmIds, onToggleSave,
  onOpenDetails, onOpenFilterDrawer, onOpenMethodologyModal,
  activeFilterPill, setActiveFilterPill, onOpenPriceAlert,
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  const handleCopyCode = (e: React.MouseEvent, code: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const displayedFirms = firms.filter((firm) => {
    if (activeFilterPill === 'favorite') return savedFirmIds.includes(firm.id);
    if (activeFilterPill === 'new') return firm.yearsInOperation != null && firm.yearsInOperation <= 1;
    if (activeFilterPill === 'popular') return firm.trustpilotReviewsCount != null && firm.trustpilotReviewsCount >= 1000;
    return true;
  });

  return (
    <div className="w-full mt-6 space-y-4">

      {/* Filter Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#1d1f1e] border border-[#2b2e2c] rounded-xl p-2.5 sm:p-3">

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onOpenFilterDrawer}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#222522] hover:bg-[#252825] text-xs font-bold text-[#f1f3f2] border border-[#333633] transition-all cursor-pointer shadow-sm"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#9a9e9b]" />
            <span>Filter</span>
          </button>

          <button
            onClick={() => setActiveFilterPill('popular')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeFilterPill === 'popular'
                ? 'bg-[#3ecf8e]/20 text-[#3ecf8e] border border-emerald-500/40'
                : 'text-[#9a9e9b] hover:bg-[#252825]/60'
            }`}
          >
            🔥 Popular
          </button>

          <button
            onClick={() => setActiveFilterPill('favorite')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeFilterPill === 'favorite'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-[#9a9e9b] hover:bg-[#252825]/60'
            }`}
          >
            <Heart className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>Favorite {savedFirmIds.length}/3</span>
          </button>

          <button
            onClick={() => setActiveFilterPill('new')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeFilterPill === 'new'
                ? 'bg-[#3ecf8e]/20 text-[#3ecf8e] border border-emerald-500/40'
                : 'text-[#9a9e9b] hover:bg-[#252825]/60'
            }`}
          >
            ✨ New
          </button>

          <button
            onClick={() => setActiveFilterPill('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeFilterPill === 'all'
                ? 'bg-[#3ecf8e] text-[#171918]'
                : 'text-[#9a9e9b] hover:bg-[#252825]/60'
            }`}
          >
            All
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMethodologyModal}
            className="flex items-center gap-1.5 text-xs text-[#9a9e9b] hover:text-[#f1f3f2] transition-colors duration-150 cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#3ecf8e]" />
            <span className="hidden sm:inline">How We Verify and Rank Firms</span>
            <span className="sm:hidden">Verify Rules</span>
          </button>

          <div className="flex items-center gap-1.5 text-[11px] text-[#9a9e9b] bg-[#1d1f1e]/80 px-2.5 py-1 rounded-full border border-[#2b2e2c]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Latest imported catalog</span>
          </div>
        </div>

      </div>

      {/* Main Table View */}
      <div className="bg-[#1d1f1e] border border-[#2b2e2c] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#171918] text-[#9a9e9b] border-b border-[#2b2e2c] text-[11px] font-bold tracking-wider uppercase">
                <th className="py-3.5 px-4 cursor-pointer select-none" onClick={() => setSortAsc(!sortAsc)}>
                  <div className="flex items-center gap-1.5 hover:text-[#f1f3f2] transition-colors duration-150">
                    <span>POPULARITY / FIRM</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-[#747976]" />
                  </div>
                </th>
                <th className="py-3.5 px-3">RANK / REVIEWS</th>
                <th className="py-3.5 px-3">COUNTRY</th>
                <th className="py-3.5 px-3 text-center">YEARS IN OPERATION</th>
                <th className="py-3.5 px-3">ASSETS</th>
                <th className="py-3.5 px-3">PLATFORMS</th>
                <th className="py-3.5 px-3">MAX ALLOCATIONS</th>
                <th className="py-3.5 px-3">PROMO</th>
                <th className="py-3.5 px-4 text-center">ACTIONS</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#2b2e2c]/60">
              {displayedFirms.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[#9a9e9b]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Info className="w-6 h-6 text-[#747976]" />
                      <span>No prop firms match this filter.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                displayedFirms.map((firm, index) => {
                  const defaultPlan = firm.plans[0];
                  const isSaved = savedFirmIds.includes(firm.id);
                  const promo = firm.exclusiveDiscount;
                  const isCopied = copiedCode === (promo?.code || '');
                  const rankNum = firm.rankPosition || index + 1;
                  const medalEmoji = rankNum === 1 ? '🥇' : rankNum === 2 ? '🥈' : rankNum === 3 ? '🥉' : null;

                  return (
                    <tr
                      key={firm.id}
                      onClick={() => onOpenDetails(firm, defaultPlan)}
                      className="hover:bg-[#151515] transition-colors duration-150 cursor-pointer group"
                    >
                      {/* POPULARITY / FIRM */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-6 flex items-center justify-center font-bold text-sm">
                            {medalEmoji ? (
                              <span className="text-base">{medalEmoji}</span>
                            ) : (
                              <span className="text-[#747976] text-xs font-mono">#{rankNum}</span>
                            )}
                          </div>
                          <div className="relative flex-shrink-0">
                            <img
                              src={firm.logo}
                              alt={firm.name}
                              className="w-9 h-9 rounded-xl object-cover bg-[#222522] border border-[#333633]"
                            />
                            {firm.hasGoldBadge && (
                              <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center">
                                <Award className="w-2.5 h-2.5" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-[#f1f3f2] text-sm group-hover:text-[#3ecf8e] transition-colors duration-150 flex items-center gap-1.5">
                              <span>{firm.name}</span>
                            </div>
                            <div
                              onClick={(e) => { e.stopPropagation(); onToggleSave(firm.id); }}
                              className="flex items-center gap-1 text-[11px] text-[#9a9e9b] hover:text-rose-400 transition-colors duration-150 mt-0.5 select-none"
                            >
                              <Heart className={`w-3 h-3 transition-colors duration-150 ${isSaved ? 'fill-rose-500 text-rose-500' : 'text-[#747976] hover:text-rose-400'}`} />
                              <span className="font-medium">{isSaved ? 'Saved' : 'Save'}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* RANK / REVIEWS */}
                      <td className="py-3.5 px-3">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5">
                            <span className="px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 font-bold text-xs">
                              {firm.trustpilotScore ?? '—'}
                            </span>
                            <div className="flex items-center text-[#3ecf8e]">
                              <Star className="w-3 h-3 fill-emerald-400" />
                              <Star className="w-3 h-3 fill-emerald-400" />
                              <Star className="w-3 h-3 fill-emerald-400" />
                              <Star className="w-3 h-3 fill-emerald-400" />
                              <Star className="w-3 h-3 fill-emerald-400/50" />
                            </div>
                          </div>
                          <span className="text-[11px] text-[#9a9e9b]">
                            {firm.trustpilotReviewsCount ?? '—'} reviews
                          </span>
                        </div>
                      </td>

                      {/* COUNTRY */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-1.5 text-xs text-[#9a9e9b] font-medium">
                          <span>{firm.countryFlag || '🌐'}</span>
                          <span>{firm.headquarters}</span>
                        </div>
                      </td>

                      {/* YEARS IN OPERATION */}
                      <td className="py-3.5 px-3 text-center">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#252825] text-[#9a9e9b] font-bold text-xs border border-[#333633]">
                          {firm.yearsInOperation ?? '—'}
                        </span>
                      </td>

                      {/* ASSETS */}
                      <td className="py-3.5 px-3">
                        <div className="flex flex-wrap items-center gap-1 max-w-[210px]">
                          {(firm.assetTags || []).slice(0, 4).map((tag, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded-full bg-[#222522] text-[#9a9e9b] text-[10px] font-medium border border-[#333633]/60 whitespace-nowrap">
                              {tag}
                            </span>
                          ))}
                          {(firm.assetTags || []).length > 4 && (
                            <span className="px-1.5 py-0.5 rounded-full bg-[#222522] text-[#9a9e9b] text-[10px] font-bold border border-[#333633]/60">
                              +{(firm.assetTags || []).length - 4}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* PLATFORMS */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-1">
                          {firm.availablePlatforms.slice(0, 2).map((p, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded bg-[#252825] text-[#f1f3f2] text-[10px] font-medium border border-[#333633] whitespace-nowrap">
                              {p}
                            </span>
                          ))}
                          {firm.availablePlatforms.length > 2 && (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-[#3ecf8e] text-[10px] font-bold">
                              +{firm.availablePlatforms.length - 2}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* MAX ALLOCATIONS */}
                      <td className="py-3.5 px-3">
                        <div className="flex flex-col">
                          <span className="font-bold text-[#f1f3f2] text-xs tracking-tight">
                            {firm.maxAllocation || 'Not provided'}
                          </span>
                          <div className="w-12 h-1 bg-gradient-to-r from-emerald-500 to-transparent rounded-full mt-1"></div>
                        </div>
                      </td>

                      {/* PROMO */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-[#3ecf8e] whitespace-nowrap">
                            {promo ? `${promo.discountPercent}% OFF` : 'No code provided'}
                          </span>
                          <button
                            disabled={!promo}
                            onClick={(e) => handleCopyCode(e, promo?.code || '')}
                            className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold flex items-center gap-1 transition-all ${
                              isCopied
                                ? 'bg-[#3ecf8e]/20 text-[#3ecf8e] border border-emerald-500/40'
                                : 'bg-[#222522] hover:bg-emerald-900/50 text-[#f1f3f2] border border-emerald-800/40'
                            }`}
                          >
                            <span>{promo?.code || ''}</span>
                            {isCopied ? <Check className="w-3 h-3 text-[#3ecf8e]" /> : <Copy className="w-3 h-3 text-[#9a9e9b]" />}
                          </button>
                        </div>
                      </td>

                      {/* ACTIONS */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {onOpenPriceAlert && defaultPlan?.discountedPrice != null && (
                            <button
                              onClick={(e) => { e.stopPropagation(); onOpenPriceAlert(firm, defaultPlan); }}
                              title="Set price & discount alert"
                              className="p-1.5 rounded-full bg-[#222522] hover:bg-emerald-600/30 text-[#9a9e9b] hover:text-[#3ecf8e] border border-[#333633]/60 hover:border-emerald-500/50 transition-all cursor-pointer"
                            >
                              <Bell className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={(e) => { e.stopPropagation(); onOpenDetails(firm, defaultPlan); }}
                            className="px-3 py-1.5 rounded-full bg-[#252825] hover:bg-[#3ecf8e] text-[#f1f3f2] hover:text-[#171918] font-bold text-xs transition-all border border-[#333633] hover:border-emerald-500 shadow-sm cursor-pointer"
                          >
                            Firm
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
