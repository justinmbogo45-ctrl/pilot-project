import React, { useState } from 'react';
import { 
  Star, 
  ShieldCheck, 
  Check, 
  Copy, 
  ExternalLink, 
  Info, 
  Bookmark, 
  Scale, 
  Sparkles,
  Zap,
  Globe,
  Bell
} from 'lucide-react';
import { PropFirm, AccountPlan } from '../types';

interface FirmCardProps {
  firm: PropFirm;
  preferredSize?: number | 'All';
  currency: 'USD' | 'EUR' | 'GBP';
  isCompared: boolean;
  onToggleCompare: (firm: PropFirm, plan: AccountPlan) => void;
  isSaved: boolean;
  onToggleSave: (firmId: string) => void;
  onOpenDetails: (firm: PropFirm, plan: AccountPlan) => void;
  onOpenCalculatorWithPlan: (firm: PropFirm, plan: AccountPlan) => void;
  onOpenPriceAlert?: (firm: PropFirm, plan: AccountPlan) => void;
}

export const FirmCard: React.FC<FirmCardProps> = ({
  firm,
  preferredSize,
  currency,
  isCompared,
  onToggleCompare,
  isSaved,
  onToggleSave,
  onOpenDetails,
  onOpenCalculatorWithPlan,
  onOpenPriceAlert,
}) => {
  // Determine initially selected plan matching preferred size or closest
  const defaultPlanIndex = Math.max(
    0,
    firm.plans.findIndex((p) => preferredSize !== 'All' && p.size === preferredSize)
  );

  const [selectedPlanIndex, setSelectedPlanIndex] = useState(
    defaultPlanIndex !== -1 ? defaultPlanIndex : 0
  );

  const [copiedCode, setCopiedCode] = useState(false);

  // Sync if preferredSize changes
  React.useEffect(() => {
    if (preferredSize !== 'All') {
      const idx = firm.plans.findIndex((p) => p.size === preferredSize);
      if (idx !== -1) setSelectedPlanIndex(idx);
    }
  }, [preferredSize, firm.plans]);

  const activePlan = firm.plans[selectedPlanIndex] || firm.plans[0];

  // Currency multiplier
  const currencySymbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '£';
  const currencyRate = currency === 'USD' ? 1 : currency === 'EUR' ? 0.92 : 0.79;

  const displayOriginalPrice = Math.round(activePlan.originalPrice * currencyRate);
  const displayDiscountedPrice = Math.round(activePlan.discountedPrice * currencyRate);

  // Cost per $1000 of drawdown
  const costPerDrawdownThousand = activePlan.maxDrawdownAmount > 0
    ? ((activePlan.discountedPrice / activePlan.maxDrawdownAmount) * 1000).toFixed(1)
    : '0';

  const handleCopyCode = (e: React.MouseEvent, code: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div 
      className={`group relative bg-[#0e1626] rounded-xl border transition-all duration-200 hover:border-slate-700 hover:shadow-xl hover:shadow-emerald-950/20 ${
        isCompared ? 'border-emerald-500/80 ring-1 ring-emerald-500/50' : 'border-slate-800/90'
      }`}
      id={`firm-card-${firm.slug}`}
    >
      
      {/* Top Banner / Badges */}
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <div className="flex items-center gap-2">
          {firm.featuredBadge && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              {firm.featuredBadge}
            </span>
          )}
          {firm.usTradersAccepted && (
            <span className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              US Accepted
            </span>
          )}
        </div>

        {/* Bookmark & Compare actions */}
        <div className="flex items-center gap-1.5">
          {onOpenPriceAlert && (
            <button
              onClick={() => onOpenPriceAlert(firm, activePlan)}
              title="Subscribe to price drop & promo alerts"
              className="p-1.5 rounded-lg text-slate-400 hover:text-purple-300 hover:bg-purple-950/40 transition-colors"
            >
              <Bell className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => onToggleSave(firm.id)}
            title={isSaved ? 'Remove from watchlist' : 'Add to watchlist'}
            className={`p-1.5 rounded-lg transition-colors ${
              isSaved ? 'text-amber-400 bg-amber-400/10' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Bookmark className="w-4 h-4" fill={isSaved ? 'currentColor' : 'none'} />
          </button>

          <button
            onClick={() => onToggleCompare(firm, activePlan)}
            title={isCompared ? 'Remove from side-by-side comparison' : 'Compare side-by-side'}
            className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
              isCompared
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span className="hidden sm:inline">{isCompared ? 'Compared' : 'Compare'}</span>
          </button>
        </div>
      </div>

      {/* Main Firm Info Header */}
      <div className="px-5 py-2 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <img
            src={firm.logo}
            alt={firm.name}
            className="w-12 h-12 rounded-xl object-cover bg-slate-900 border border-slate-700/60 shadow-sm"
          />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                {firm.name}
              </h3>
              <span title="Verified Prop Firm">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </span>
            </div>

            {/* Trustpilot & Stats */}
            <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs text-slate-400">
              <span className="flex items-center gap-1 text-amber-400 font-semibold">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {firm.trustpilotScore}
              </span>
              <span className="text-slate-600">•</span>
              <span>{firm.trustpilotReviewsCount.toLocaleString()} reviews</span>
              <span className="text-slate-600 hidden sm:inline">•</span>
              <span className="text-slate-400 hidden sm:inline">{firm.headquarters}</span>
            </div>
          </div>
        </div>

        {/* Pricing Box */}
        <div className="text-right flex-shrink-0">
          <div className="flex items-baseline justify-end gap-1.5">
            {activePlan.discountedPrice < activePlan.originalPrice && (
              <span className="text-xs text-slate-500 line-through">
                {currencySymbol}{displayOriginalPrice}
              </span>
            )}
            <span className="text-2xl font-extrabold text-white tracking-tight">
              {currencySymbol}{displayDiscountedPrice}
            </span>
          </div>

          <div className="text-[11px] text-emerald-400 font-medium mt-0.5">
            ${costPerDrawdownThousand} / $1k drawdown
          </div>
        </div>
      </div>

      {/* Account Size Selector Tabs */}
      <div className="px-5 py-3">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar bg-slate-900/90 p-1 rounded-lg border border-slate-800">
          {firm.plans.map((plan, idx) => (
            <button
              key={plan.id}
              onClick={() => setSelectedPlanIndex(idx)}
              className={`flex-1 min-w-[54px] py-1 text-xs font-semibold rounded-md transition-all text-center ${
                selectedPlanIndex === idx
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
              }`}
            >
              {plan.label}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metric 4-Column Grid */}
      <div className="px-5 py-3 grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-slate-950/40 border-y border-slate-800/80 text-xs">
        
        {/* Profit Split */}
        <div className="space-y-0.5">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Profit Split</span>
          <div className="text-slate-100 font-bold text-sm">
            {activePlan.profitSplit}% {firm.maxProfitSplit > activePlan.profitSplit && (
              <span className="text-slate-400 text-xs font-normal">→ {firm.maxProfitSplit}%</span>
            )}
          </div>
          <span className="text-[10px] text-emerald-400 font-medium">
            {activePlan.firstPayoutDays === 0 ? 'On-Demand' : `${activePlan.firstPayoutDays}-day first payout`}
          </span>
        </div>

        {/* Max Drawdown */}
        <div className="space-y-0.5">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Max Drawdown</span>
          <div className="text-slate-100 font-bold text-sm">
            {activePlan.maxDrawdownPercent}% ({currencySymbol}{activePlan.maxDrawdownAmount.toLocaleString()})
          </div>
          <span className="text-[10px] text-slate-400 font-medium">{firm.drawdownType}</span>
        </div>

        {/* Daily Loss */}
        <div className="space-y-0.5">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Daily Loss</span>
          <div className="text-slate-100 font-bold text-sm">
            {activePlan.dailyDrawdownPercent > 0 ? (
              <>{activePlan.dailyDrawdownPercent}% ({currencySymbol}{activePlan.dailyDrawdownAmount.toLocaleString()})</>
            ) : (
              <span className="text-emerald-400">None (0%)</span>
            )}
          </div>
          <span className="text-[10px] text-slate-400 font-medium">
            {firm.rules.drawdownCalculation} Based
          </span>
        </div>

        {/* Target */}
        <div className="space-y-0.5">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Profit Target</span>
          <div className="text-slate-100 font-bold text-sm">
            {activePlan.step1TargetPercent === 0 ? (
              <span className="text-emerald-400 font-extrabold">Instant (0%)</span>
            ) : (
              <>
                P1: {activePlan.step1TargetPercent}%
                {activePlan.step2TargetPercent ? ` | P2: ${activePlan.step2TargetPercent}%` : ''}
              </>
            )}
          </div>
          <span className="text-[10px] text-slate-400 font-medium">
            Min {activePlan.minTradingDays} days
          </span>
        </div>

      </div>

      {/* Rules & Platforms Badges */}
      <div className="px-5 py-3 space-y-2">
        {/* Rules Badges */}
        <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
          {firm.rules.weekendHolding && (
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
              Weekend Holding
            </span>
          )}
          {firm.rules.newsTrading && (
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
              News Trading
            </span>
          )}
          {firm.rules.eaAlgoTrading && (
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
              EA / Algo Allowed
            </span>
          )}
          {activePlan.refundable && (
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-medium">
              100% Fee Refund
            </span>
          )}
          <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
            {activePlan.leverage} Leverage
          </span>
        </div>

        {/* Platforms Badges */}
        <div className="flex items-center justify-between text-xs pt-1">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
            <span className="text-slate-500 font-medium">Platforms:</span>
            {firm.availablePlatforms.map((plat) => (
              <span key={plat} className="text-slate-300 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800/80">
                {plat}
              </span>
            ))}
          </div>

          {/* Active Promo Code Copy */}
          {firm.exclusiveDiscount && (
            <button
              onClick={(e) => handleCopyCode(e, firm.exclusiveDiscount!.code)}
              title="Click to copy promo code"
              className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition-colors"
            >
              {copiedCode ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Zap className="w-3 h-3" />
                  <span>{firm.exclusiveDiscount.code} (-{firm.exclusiveDiscount.discountPercent}%)</span>
                  <Copy className="w-2.5 h-2.5 opacity-60" />
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="px-5 py-3 border-t border-slate-800/80 flex items-center justify-between gap-3 bg-slate-900/30 rounded-b-xl">
        <button
          onClick={() => onOpenDetails(firm, activePlan)}
          className="text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1 py-1.5 transition-colors"
        >
          <Info className="w-3.5 h-3.5 text-emerald-400" />
          <span>Full Rules & Reviews</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenCalculatorWithPlan(firm, activePlan)}
            title="Calculate fee ROI and break-even"
            className="text-xs text-slate-400 hover:text-emerald-300 px-2 py-1.5 rounded hover:bg-slate-800 transition-colors hidden sm:block"
          >
            ROI Calc
          </button>

          <a
            href={firm.website}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-sm transition-all"
          >
            <span>Get Funded</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

    </div>
  );
};
