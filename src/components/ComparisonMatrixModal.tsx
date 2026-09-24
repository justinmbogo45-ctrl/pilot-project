import React, { useState, useEffect } from 'react';
import { 
  X, 
  Scale, 
  Trash2, 
  ExternalLink, 
  Star, 
  CheckCircle2, 
  XCircle, 
  Sparkles,
  Award
} from 'lucide-react';
import { PropFirm, AccountPlan } from '../types';

interface ComparisonItem {
  firm: PropFirm;
  plan: AccountPlan;
}

interface ComparisonMatrixModalProps {
  items: ComparisonItem[];
  onRemoveItem: (firmId: string) => void;
  onClearAll: () => void;
  onChangePlan: (firmId: string, plan: AccountPlan) => void;
  onClose: () => void;
  currency: 'USD' | 'EUR' | 'GBP';
}

export const ComparisonMatrixModal: React.FC<ComparisonMatrixModalProps> = ({
  items,
  onRemoveItem,
  onClearAll,
  onChangePlan,
  onClose,
  currency,
}) => {
  const [highlightBest, setHighlightBest] = useState(true);

  // Close on Escape key
  useEffect(() => {
    if (items.length === 0) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [items.length, onClose]);

  if (items.length === 0) return null;

  const currencySymbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '£';
  const currencyRate = currency === 'USD' ? 1 : currency === 'EUR' ? 0.92 : 0.79;

  // Compute best metrics across selected items
  const lowestPrice = Math.min(...items.map((it) => it.plan.discountedPrice));
  const highestSplit = Math.max(...items.map((it) => it.plan.profitSplit));
  const highestDrawdown = Math.max(...items.map((it) => it.plan.maxDrawdownPercent));
  const lowestP1Target = Math.min(...items.map((it) => it.plan.step1TargetPercent));
  const fastestPayout = Math.min(...items.map((it) => it.plan.firstPayoutDays));
  const bestTrustScore = Math.max(...items.map((it) => it.firm.trustpilotScore));

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-sm overflow-y-auto"
    >
      <div 
        className="bg-[#0e1626] border border-slate-800 rounded-2xl w-full max-w-6xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                Side-by-Side Prop Firm Comparison
                <span className="text-xs bg-slate-800 text-slate-300 font-semibold px-2 py-0.5 rounded">
                  {items.length} of 4 firms selected
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Direct head-to-head comparison of challenge parameters, loss limits, and fees.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Highlight Best Toggle */}
            <button
              onClick={() => setHighlightBest(!highlightBest)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                highlightBest
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Highlight Best Metrics</span>
            </button>

            <button
              onClick={onClearAll}
              className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Matrix Table */}
        <div className="overflow-x-auto flex-1 p-6">
          <table className="w-full text-xs text-left border-collapse">
            
            {/* Column Headers (Firms) */}
            <thead>
              <tr className="border-b border-slate-800">
                <th className="py-4 px-4 w-48 text-slate-400 font-bold uppercase tracking-wider text-[11px] bg-slate-900/40 rounded-tl-xl">
                  Firm & Selected Account
                </th>
                {items.map((item) => (
                  <th key={item.firm.id} className="py-4 px-4 min-w-[210px] align-top">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <img
                            src={item.firm.logo}
                            alt={item.firm.name}
                            className="w-8 h-8 rounded-lg object-cover bg-slate-900 border border-slate-700"
                          />
                          <div>
                            <h4 className="font-extrabold text-white text-sm">{item.firm.name}</h4>
                            <div className="flex items-center text-[10px] text-amber-400 font-bold">
                              <Star className="w-3 h-3 fill-amber-400 mr-0.5" />
                              {item.firm.trustpilotScore}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => onRemoveItem(item.firm.id)}
                          className="text-slate-500 hover:text-rose-400 p-1"
                          title="Remove from comparison"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Account size dropdown */}
                      <div>
                        <select
                          value={item.plan.id}
                          onChange={(e) => {
                            const found = item.firm.plans.find((p) => p.id === e.target.value);
                            if (found) onChangePlan(item.firm.id, found);
                          }}
                          className="w-full bg-slate-900 border border-slate-800 rounded-md px-2 py-1 text-xs font-bold text-slate-200 focus:outline-none cursor-pointer"
                        >
                          {item.firm.plans.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.label} Account ({currencySymbol}{Math.round(p.discountedPrice * currencyRate)})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Matrix Rows */}
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              
              {/* Row 1: Challenge Price */}
              <tr className="hover:bg-slate-850/20">
                <td className="py-3 px-4 font-bold text-slate-400 bg-slate-900/30">Challenge Price</td>
                {items.map((it) => {
                  const isBest = highlightBest && it.plan.discountedPrice === lowestPrice;
                  const price = Math.round(it.plan.discountedPrice * currencyRate);
                  return (
                    <td key={it.firm.id} className={`py-3 px-4 font-bold ${isBest ? 'text-emerald-400 bg-emerald-500/5' : 'text-white'}`}>
                      <div className="flex items-center gap-1.5">
                        <span className="text-base">{currencySymbol}{price}</span>
                        {isBest && (
                          <span title="Cheapest Price">
                            <Award className="w-3.5 h-3.5 text-emerald-400" />
                          </span>
                        )}
                      </div>
                      {it.firm.exclusiveDiscount && (
                        <span className="text-[10px] text-amber-400 font-semibold block">
                          Code: {it.firm.exclusiveDiscount.code} (-{it.firm.exclusiveDiscount.discountPercent}%)
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>

              {/* Row 2: Profit Split */}
              <tr className="hover:bg-slate-850/20">
                <td className="py-3 px-4 font-bold text-slate-400 bg-slate-900/30">Starting Profit Split</td>
                {items.map((it) => {
                  const isBest = highlightBest && it.plan.profitSplit === highestSplit;
                  return (
                    <td key={it.firm.id} className={`py-3 px-4 font-bold ${isBest ? 'text-emerald-400 bg-emerald-500/5' : 'text-slate-200'}`}>
                      {it.plan.profitSplit}% (Up to {it.firm.maxProfitSplit}%)
                    </td>
                  );
                })}
              </tr>

              {/* Row 3: Max Drawdown */}
              <tr className="hover:bg-slate-850/20">
                <td className="py-3 px-4 font-bold text-slate-400 bg-slate-900/30">Maximum Drawdown</td>
                {items.map((it) => {
                  const isBest = highlightBest && it.plan.maxDrawdownPercent === highestDrawdown;
                  return (
                    <td key={it.firm.id} className={`py-3 px-4 font-bold ${isBest ? 'text-emerald-400 bg-emerald-500/5' : 'text-slate-200'}`}>
                      {it.plan.maxDrawdownPercent}% ({currencySymbol}{it.plan.maxDrawdownAmount.toLocaleString()})
                    </td>
                  );
                })}
              </tr>

              {/* Row 4: Drawdown Calculation */}
              <tr className="hover:bg-slate-850/20">
                <td className="py-3 px-4 font-bold text-slate-400 bg-slate-900/30">Drawdown Method</td>
                {items.map((it) => (
                  <td key={it.firm.id} className="py-3 px-4 font-medium text-slate-300">
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px]">
                      {it.firm.drawdownType}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Row 5: Daily Loss */}
              <tr className="hover:bg-slate-850/20">
                <td className="py-3 px-4 font-bold text-slate-400 bg-slate-900/30">Daily Loss Limit</td>
                {items.map((it) => (
                  <td key={it.firm.id} className="py-3 px-4 font-medium text-slate-300">
                    {it.plan.dailyDrawdownPercent > 0 
                      ? `${it.plan.dailyDrawdownPercent}% (${currencySymbol}${it.plan.dailyDrawdownAmount.toLocaleString()})`
                      : 'No Daily Limit'}
                  </td>
                ))}
              </tr>

              {/* Row 6: Profit Targets */}
              <tr className="hover:bg-slate-850/20">
                <td className="py-3 px-4 font-bold text-slate-400 bg-slate-900/30">Evaluation Targets</td>
                {items.map((it) => {
                  const isBest = highlightBest && it.plan.step1TargetPercent === lowestP1Target;
                  return (
                    <td key={it.firm.id} className={`py-3 px-4 font-medium ${isBest ? 'text-emerald-400 bg-emerald-500/5' : ''}`}>
                      {it.plan.step1TargetPercent === 0 
                        ? 'Instant (0% Target)' 
                        : `Phase 1: ${it.plan.step1TargetPercent}% | Phase 2: ${it.plan.step2TargetPercent || 0}%`}
                    </td>
                  );
                })}
              </tr>

              {/* Row 7: Min Trading Days */}
              <tr className="hover:bg-slate-850/20">
                <td className="py-3 px-4 font-bold text-slate-400 bg-slate-900/30">Minimum Trading Days</td>
                {items.map((it) => {
                  const isBest = highlightBest && it.plan.minTradingDays === 0;
                  return (
                    <td key={it.firm.id} className={`py-3 px-4 ${isBest ? 'text-emerald-400 font-bold bg-emerald-500/5' : ''}`}>
                      {it.plan.minTradingDays === 0 ? '0 Days (Pass Instantly)' : `${it.plan.minTradingDays} days`}
                    </td>
                  );
                })}
              </tr>

              {/* Row 8: Payout Speed */}
              <tr className="hover:bg-slate-850/20">
                <td className="py-3 px-4 font-bold text-slate-400 bg-slate-900/30">First Payout Eligibility</td>
                {items.map((it) => {
                  const isBest = highlightBest && it.plan.firstPayoutDays === fastestPayout;
                  return (
                    <td key={it.firm.id} className={`py-3 px-4 font-bold ${isBest ? 'text-emerald-400 bg-emerald-500/5' : ''}`}>
                      {it.plan.firstPayoutDays === 0 
                        ? 'On-Demand' 
                        : it.plan.firstPayoutDays === 1 
                        ? 'Day 1 Eligible' 
                        : `${it.plan.firstPayoutDays} days`}
                    </td>
                  );
                })}
              </tr>

              {/* Row 9: Weekend Holding */}
              <tr className="hover:bg-slate-850/20">
                <td className="py-3 px-4 font-bold text-slate-400 bg-slate-900/30">Weekend Holding</td>
                {items.map((it) => (
                  <td key={it.firm.id} className="py-3 px-4">
                    {it.firm.rules.weekendHolding ? (
                      <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                        <CheckCircle2 className="w-4 h-4" /> Allowed
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-rose-400">
                        <XCircle className="w-4 h-4" /> Prohibited
                      </span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Row 10: News Trading */}
              <tr className="hover:bg-slate-850/20">
                <td className="py-3 px-4 font-bold text-slate-400 bg-slate-900/30">News Trading</td>
                {items.map((it) => (
                  <td key={it.firm.id} className="py-3 px-4">
                    {it.firm.rules.newsTrading ? (
                      <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                        <CheckCircle2 className="w-4 h-4" /> Allowed
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-rose-400">
                        <XCircle className="w-4 h-4" /> Prohibited
                      </span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Row 11: EA & Algo Trading */}
              <tr className="hover:bg-slate-850/20">
                <td className="py-3 px-4 font-bold text-slate-400 bg-slate-900/30">EA / Algo Bots</td>
                {items.map((it) => (
                  <td key={it.firm.id} className="py-3 px-4">
                    {it.firm.rules.eaAlgoTrading ? (
                      <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                        <CheckCircle2 className="w-4 h-4" /> Allowed
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-rose-400">
                        <XCircle className="w-4 h-4" /> Prohibited
                      </span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Row 12: US Traders */}
              <tr className="hover:bg-slate-850/20">
                <td className="py-3 px-4 font-bold text-slate-400 bg-slate-900/30">US Traders Accepted</td>
                {items.map((it) => (
                  <td key={it.firm.id} className="py-3 px-4">
                    {it.firm.usTradersAccepted ? (
                      <span className="text-cyan-400 font-bold">Yes (US Allowed)</span>
                    ) : (
                      <span className="text-slate-500">Non-US Only</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Row 13: Platforms */}
              <tr className="hover:bg-slate-850/20">
                <td className="py-3 px-4 font-bold text-slate-400 bg-slate-900/30">Trading Platforms</td>
                {items.map((it) => (
                  <td key={it.firm.id} className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {it.firm.availablePlatforms.map((plat) => (
                        <span key={plat} className="text-[10px] bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 text-slate-300">
                          {plat}
                        </span>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Buy Link Row */}
              <tr>
                <td className="py-4 px-4 bg-slate-900/30 rounded-bl-xl font-bold text-slate-400">
                  Direct Registration
                </td>
                {items.map((it) => (
                  <td key={it.firm.id} className="py-4 px-4">
                    <a
                      href={it.firm.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1 transition-all shadow-md shadow-emerald-500/20"
                    >
                      <span>Get {it.firm.name}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </td>
                ))}
              </tr>

            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};
