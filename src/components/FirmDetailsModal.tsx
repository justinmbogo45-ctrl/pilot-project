import React, { useState, useEffect } from 'react';
import { 
  X, 
  Star, 
  ShieldCheck, 
  ExternalLink, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Calendar, 
  Globe, 
  Zap, 
  DollarSign, 
  Scale, 
  TrendingUp,
  MessageSquarePlus,
  Bell,
  RefreshCw,
  Sparkles,
  Search
} from 'lucide-react';
import { PropFirm, AccountPlan } from '../types';

interface FirmDetailsModalProps {
  firm: PropFirm | null;
  initialPlan?: AccountPlan | null;
  currency: 'USD' | 'EUR' | 'GBP';
  onClose: () => void;
  onOpenCalculator: (firm: PropFirm, plan: AccountPlan) => void;
  onOpenWriteReview: (firm: PropFirm) => void;
  onOpenPriceAlert?: (firm: PropFirm, plan: AccountPlan) => void;
}

export const FirmDetailsModal: React.FC<FirmDetailsModalProps> = ({
  firm,
  initialPlan,
  currency,
  onClose,
  onOpenCalculator,
  onOpenWriteReview,
  onOpenPriceAlert,
}) => {
  const [activeTab, setActiveTab] = useState<'rules' | 'accounts' | 'scaling' | 'payouts' | 'reviews' | 'google-intel'>('rules');
  const [selectedPlanId, setSelectedPlanId] = useState<string>(
    initialPlan?.id || (firm?.plans[0]?.id ?? '')
  );

  // Google Search Grounding state for live intelligence
  const [intelLoading, setIntelLoading] = useState(false);
  const [intelData, setIntelData] = useState<{
    text: string;
    sources: Array<{ title: string; uri: string }>;
    webSearchQueries: string[];
    model: string;
    lastUpdated?: string;
  } | null>(null);
  const [intelError, setIntelError] = useState<string | null>(null);

  const fetchFirmIntel = async (force = false) => {
    if (!firm) return;
    if (intelData && !force) return;

    setIntelLoading(true);
    setIntelError(null);

    try {
      const response = await fetch('/api/ai/firm-intel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firmName: firm.name }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to fetch live web intelligence');
      }

      setIntelData({
        text: data.text,
        sources: data.sources || [],
        webSearchQueries: data.webSearchQueries || [],
        model: data.model || 'gemini-3.5-flash',
        lastUpdated: data.lastUpdated,
      });
    } catch (err: any) {
      console.error('Firm intel error:', err);
      setIntelError(err.message || 'Failed to connect to Google Search Grounding service.');
    } finally {
      setIntelLoading(false);
    }
  };

  // Auto-fetch if user selects google-intel tab
  useEffect(() => {
    if (activeTab === 'google-intel' && !intelData && !intelLoading) {
      fetchFirmIntel();
    }
  }, [activeTab, firm?.name]);

  // Close on Escape key
  useEffect(() => {
    if (!firm) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [firm, onClose]);

  if (!firm) return null;

  const currentPlan = firm.plans.find((p) => p.id === selectedPlanId) || firm.plans[0];

  const currencySymbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '£';
  const currencyRate = currency === 'USD' ? 1 : currency === 'EUR' ? 0.92 : 0.79;

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm overflow-y-auto"
    >
      <div 
        className="bg-[#0e1626] border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-3.5">
            <img
              src={firm.logo}
              alt={firm.name}
              className="w-12 h-12 rounded-xl object-cover bg-slate-950 border border-slate-700"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-white">{firm.name}</h2>
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                {firm.featuredBadge && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    {firm.featuredBadge}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                <span className="flex items-center text-amber-400 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 mr-1" />
                  {firm.trustpilotScore}
                </span>
                <span>({firm.trustpilotReviewsCount.toLocaleString()} reviews)</span>
                <span>•</span>
                <span>Est. {firm.establishedYear}</span>
                <span>•</span>
                <span>{firm.headquarters}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenPriceAlert && (
              <button
                onClick={() => onOpenPriceAlert(firm, currentPlan)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 hover:text-white font-bold text-xs transition-all cursor-pointer"
                title="Subscribe to price drop alerts"
              >
                <Bell className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Price Alert</span>
              </button>
            )}
            <a
              href={firm.website}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-sm transition-all"
            >
              <span>Visit Official Site</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 border-b border-slate-800 bg-[#0b111e] overflow-x-auto no-scrollbar text-xs font-semibold">
          {[
            { id: 'rules', label: 'Trading Rules & Permitted Strategies' },
            { id: 'accounts', label: 'Challenge Accounts & Pricing' },
            { id: 'scaling', label: 'Scaling Plan' },
            { id: 'payouts', label: 'Payout Proofs & Policy' },
            { id: 'reviews', label: `Reviews (${firm.reviews.length})` },
            { id: 'google-intel', label: 'Google Search Intel (Live 2026)', isGoogle: true },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-3 border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? (tab as any).isGoogle 
                    ? 'border-blue-400 text-blue-400 font-bold'
                    : 'border-emerald-400 text-emerald-400 font-bold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {(tab as any).isGoogle && (
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
              )}
              <span>{tab.label}</span>
              {(tab as any).isGoogle && (
                <span className="text-[9px] px-1 py-0.2 rounded bg-blue-500/20 text-blue-300 font-black">
                  LIVE
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-300 text-sm">
          
          {/* TAB 1: TRADING RULES */}
          {activeTab === 'rules' && (
            <div className="space-y-6">
              
              {/* Drawdown Math Highlight */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <TrendingUp className="w-4 h-4" />
                  <span>Drawdown Model: {firm.drawdownType}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {firm.drawdownType === 'Balance-Based (Static)' && (
                    <>Maximum drawdown is permanently pegged to your starting account balance or highest closed equity. Unrealized floating intraday profits do NOT drag your maximum loss threshold upward, making it much safer for swing traders.</>
                  )}
                  {firm.drawdownType === 'Trailing' && (
                    <>Trailing drawdown tracks your maximum profit peak in real time (including floating unrealized intraday profit). Once your profit reaches the maximum trailing lock-in point, it remains at the initial starting balance.</>
                  )}
                  {firm.drawdownType === 'End of Day (EOD)' && (
                    <>Trailing threshold updates strictly at the market close based on end-of-day balance, ignoring intraday high spikes that retraced before session end.</>
                  )}
                </p>
              </div>

              {/* Rules Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-start gap-3">
                  {firm.rules.weekendHolding ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h4 className="font-bold text-white text-xs">Weekend Holding</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {firm.rules.weekendHolding 
                        ? 'Permitted to hold open positions across Friday market close.' 
                        : 'Must close all open positions before weekend market closure.'}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-start gap-3">
                  {firm.rules.newsTrading ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h4 className="font-bold text-white text-xs">News Trading</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {firm.rules.newsTrading 
                        ? 'Trading during high-impact news events (CPI, NFP, FOMC) is allowed without restriction.' 
                        : 'Trading prohibited within 2-5 minutes of high-impact releases.'}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-start gap-3">
                  {firm.rules.eaAlgoTrading ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h4 className="font-bold text-white text-xs">Expert Advisors & Algorithmic Trading</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {firm.rules.eaAlgoTrading 
                        ? 'Custom indicators, trade copiers, and automated algorithmic bots permitted.' 
                        : 'Manual execution strictly required. Automated bots prohibited.'}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-start gap-3">
                  {firm.rules.copyTrading ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h4 className="font-bold text-white text-xs">Copy Trading</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {firm.rules.copyTrading 
                        ? 'Copy trading between your own personal accounts is supported.' 
                        : 'Third-party signal copying or community trade mirroring not allowed.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Prohibited Strategies */}
              <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-900/40 space-y-2">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Prohibited Trading Practices & Disqualification Criteria</span>
                </div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                  {firm.rules.prohibitedStrategies.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                    <span>Inactivity limit: Must place at least one trade every {firm.rules.inactivityLimitDays} days</span>
                  </li>
                  {firm.rules.consistencyRule && (
                    <li className="flex items-center gap-2 text-amber-300 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                      <span>{firm.rules.consistencyRuleDetails || 'Consistency rule applies on payout requests.'}</span>
                    </li>
                  )}
                </ul>
              </div>

            </div>
          )}

          {/* TAB 2: ACCOUNTS & PRICING TABLE */}
          {activeTab === 'accounts' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white text-sm">Available Challenge Sizes</h3>
                <span className="text-xs text-emerald-400 font-semibold">
                  {firm.exclusiveDiscount ? `Coupon ${firm.exclusiveDiscount.code} applied` : ''}
                </span>
              </div>

              <div className="overflow-x-auto border border-slate-800 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-3">Size</th>
                      <th className="py-3 px-3">Price</th>
                      <th className="py-3 px-3">Target P1 / P2</th>
                      <th className="py-3 px-3">Max Loss</th>
                      <th className="py-3 px-3">Daily Loss</th>
                      <th className="py-3 px-3">Min Days</th>
                      <th className="py-3 px-3">Split</th>
                      <th className="py-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {firm.plans.map((p) => {
                      const displayPrice = Math.round(p.discountedPrice * currencyRate);
                      return (
                        <tr 
                          key={p.id}
                          className={`hover:bg-slate-800/40 transition-colors ${
                            selectedPlanId === p.id ? 'bg-emerald-500/10' : ''
                          }`}
                          onClick={() => setSelectedPlanId(p.id)}
                        >
                          <td className="py-3 px-3 font-bold text-white">{p.label}</td>
                          <td className="py-3 px-3 font-semibold text-emerald-400">
                            {currencySymbol}{displayPrice}
                          </td>
                          <td className="py-3 px-3">
                            {p.step1TargetPercent === 0 
                              ? 'Instant (0%)' 
                              : `${p.step1TargetPercent}% / ${p.step2TargetPercent || 0}%`}
                          </td>
                          <td className="py-3 px-3 font-medium">
                            {currencySymbol}{p.maxDrawdownAmount.toLocaleString()} ({p.maxDrawdownPercent}%)
                          </td>
                          <td className="py-3 px-3">
                            {p.dailyDrawdownPercent > 0 
                              ? `${currencySymbol}${p.dailyDrawdownAmount.toLocaleString()} (${p.dailyDrawdownPercent}%)` 
                              : 'None'}
                          </td>
                          <td className="py-3 px-3">{p.minTradingDays} days</td>
                          <td className="py-3 px-3 font-bold text-slate-200">{p.profitSplit}%</td>
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {onOpenPriceAlert && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onOpenPriceAlert(firm, p);
                                  }}
                                  title="Subscribe to Price Alerts for this plan"
                                  className="text-xs text-purple-400 hover:text-purple-300 font-semibold p-1 hover:bg-purple-950/40 rounded flex items-center gap-1"
                                >
                                  <Bell className="w-3.5 h-3.5" />
                                  <span className="hidden md:inline">Alert</span>
                                </button>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onOpenCalculator(firm, p);
                                }}
                                className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold underline"
                              >
                                ROI
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: SCALING PLAN */}
          {activeTab === 'scaling' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <Zap className="w-5 h-5" />
                  <span>Scaling Roadmap up to {firm.rules.scalingPlan.maxCapital}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Traders who consistently generate profit are rewarded with capital upgrades:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Requirement</span>
                    <span className="text-white font-bold text-sm">
                      +{firm.rules.scalingPlan.scalingTargetPercent}% Net Profit
                    </span>
                    <span className="text-slate-500 block text-[10px] mt-0.5">Over 4 consecutive months</span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Account Upgrade</span>
                    <span className="text-emerald-400 font-bold text-sm">
                      +{firm.rules.scalingPlan.accountGrowthPercent}% Capital Bump
                    </span>
                    <span className="text-slate-500 block text-[10px] mt-0.5">Automatic balance increase</span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Maximum Allocation</span>
                    <span className="text-cyan-400 font-bold text-sm">
                      {firm.rules.scalingPlan.maxCapital}
                    </span>
                    <span className="text-slate-500 block text-[10px] mt-0.5">Top-tier limit</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PAYOUTS & TRUST */}
          {activeTab === 'payouts' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Payout Methods & Currencies
                  </h4>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {firm.payoutMethods.map((m) => (
                      <span key={m} className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-xs font-medium text-slate-200">
                        {m}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-slate-400 pt-2">
                    Withdrawal processing time: typically 4 to 24 hours upon request submission.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Tracked Payout Proof Statistics
                  </h4>
                  <div className="text-2xl font-black text-emerald-400">
                    {firm.totalPayoutsTracked}
                  </div>
                  <div className="text-xs text-slate-300">
                    Over <strong>{firm.verifiedPayoutsCount.toLocaleString()}</strong> verified payout certificates confirmed by our automated tracker.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: TRADER REVIEWS */}
          {activeTab === 'reviews' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white text-sm">Community Trader Reviews</h3>
                  <p className="text-xs text-slate-400">
                    Verified traders who have taken challenges and received payouts.
                  </p>
                </div>
                <button
                  onClick={() => onOpenWriteReview(firm)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-all"
                >
                  <MessageSquarePlus className="w-3.5 h-3.5" />
                  <span>Write a Review</span>
                </button>
              </div>

              <div className="space-y-3">
                {firm.reviews.map((rev) => (
                  <div key={rev.id} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs">{rev.author}</span>
                        <span className="text-[11px] text-slate-500">• {rev.country}</span>
                        <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                          {rev.accountType}
                        </span>
                        {rev.payoutReceived && (
                          <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-bold">
                            Verified Payout (${rev.payoutAmount?.toLocaleString()})
                          </span>
                        )}
                      </div>
                      <div className="flex items-center text-amber-400">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-400" />
                        ))}
                      </div>
                    </div>

                    <h5 className="font-bold text-slate-100 text-xs">{rev.title}</h5>
                    <p className="text-xs text-slate-300 leading-relaxed">{rev.comment}</p>

                    {/* Pros & Cons */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
                      {rev.pros.length > 0 && (
                        <div className="text-emerald-400">
                          <strong>Pros:</strong> {rev.pros.join(', ')}
                        </div>
                      )}
                      {rev.cons.length > 0 && (
                        <div className="text-slate-400">
                          <strong>Cons:</strong> {rev.cons.join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: GOOGLE SEARCH GROUNDED INTELLIGENCE */}
          {activeTab === 'google-intel' && (
            <div className="space-y-6">
              
              {/* Intel Header Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/60 via-[#101830] to-indigo-950/60 border border-blue-500/40 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">Real-Time Google Search Grounding</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          gemini-3.5-flash
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Live web search verifying recent active coupons, Trustpilot reviews, payout turnaround, and 2026 rule changes
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => fetchFirmIntel(true)}
                    disabled={intelLoading}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${intelLoading ? 'animate-spin' : ''}`} />
                    <span>{intelLoading ? 'Searching...' : 'Refresh Live Intel'}</span>
                  </button>
                </div>
              </div>

              {/* Loading State */}
              {intelLoading && (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                  <div className="w-12 h-12 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin"></div>
                  <div className="text-xs font-bold text-slate-200">
                    Querying Google Search & Grounding Intelligence with gemini-3.5-flash...
                  </div>
                  <div className="text-[11px] text-slate-400 max-w-sm">
                    Checking active coupon promotions, Trustpilot payout logs, and community rules
                  </div>
                </div>
              )}

              {/* Error Notice */}
              {intelError && !intelLoading && (
                <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs space-y-1">
                  <div className="font-bold text-rose-300">Live Search Grounding Notice</div>
                  <div className="text-rose-200/80">{intelError}</div>
                  <div className="pt-2">
                    <button
                      onClick={() => fetchFirmIntel(true)}
                      className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
                    >
                      Retry Google Search
                    </button>
                  </div>
                </div>
              )}

              {/* Success Result */}
              {intelData && !intelLoading && (
                <div className="space-y-5">
                  
                  {/* Search Queries badge */}
                  {intelData.webSearchQueries && intelData.webSearchQueries.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Search className="w-3 h-3 text-blue-400" />
                        <span>Google Search Queries Executed</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {intelData.webSearchQueries.map((q, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded bg-[#161d36] border border-blue-500/30 text-blue-300 text-xs font-mono"
                          >
                            "{q}"
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Grounded Text Analysis */}
                  <div className="p-5 rounded-2xl bg-[#0e1322] border border-slate-800 text-slate-200 text-xs leading-relaxed space-y-3 whitespace-pre-line shadow-inner">
                    {intelData.text}
                  </div>

                  {/* Sources Grid */}
                  {intelData.sources && intelData.sources.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Grounded Web Sources ({intelData.sources.length})</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {intelData.sources.map((src, idx) => (
                          <a
                            key={idx}
                            href={src.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/40 transition-all flex items-center justify-between gap-2 group text-xs"
                          >
                            <span className="truncate font-semibold text-slate-200 group-hover:text-blue-300">
                              {src.title || src.uri}
                            </span>
                            <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-blue-400 flex-shrink-0" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              )}

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Selected: <strong className="text-white">{currentPlan.label}</strong> for{' '}
            <strong className="text-emerald-400">
              {currencySymbol}{Math.round(currentPlan.discountedPrice * currencyRate)}
            </strong>
          </div>

          <div className="flex items-center gap-2">
            {onOpenPriceAlert && (
              <button
                onClick={() => onOpenPriceAlert(firm, currentPlan)}
                className="px-3 py-2 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Track Price</span>
              </button>
            )}
            <button
              onClick={() => onOpenCalculator(firm, currentPlan)}
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
            >
              Fee Calculator
            </button>
            <a
              href={firm.website}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all"
            >
              <span>Get Challenge Account</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};
