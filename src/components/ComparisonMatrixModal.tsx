import React, { useEffect } from 'react';
import type { PropFirm, AccountPlan } from '../types';
import { displayValue, planPrice } from '../lib/catalog';

interface ComparisonMatrixModalProps {
  items: { firm: PropFirm; plan: AccountPlan }[];
  onRemoveItem: (id: string) => void;
  onClearAll: () => void;
  onChangePlan: (id: string, plan: AccountPlan) => void;
  onClose: () => void;
  currency: 'USD' | 'EUR' | 'GBP';
  embedded?: boolean;
}

export const ComparisonMatrixModal: React.FC<ComparisonMatrixModalProps> = ({ items, onRemoveItem, onClearAll, onChangePlan, onClose, embedded = false }) => {
  useEffect(() => {
    if (embedded) return;
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [embedded, onClose]);
  if (!items.length) return null;

  const metrics: [string, (item: typeof items[number]) => unknown][] = [
    ['Price', item => planPrice(item.plan)],
    ['Account size', item => item.plan.sourcePlan?.account_size ?? item.plan.size],
    ['Challenge type', item => item.plan.sourcePlan?.step],
    ['Profit target', item => item.plan.sourcePlan?.profit_target ?? item.plan.step1TargetPercent],
    ['Profit split', item => item.plan.sourcePlan?.profit_split ?? item.plan.profitSplit],
    ['Daily loss limit', item => item.plan.sourcePlan?.max_daily_loss ?? item.plan.dailyDrawdownPercent],
    ['Total drawdown', item => item.plan.sourcePlan?.max_total_drawdown ?? item.plan.maxDrawdownPercent],
    ['Drawdown model', item => item.plan.sourcePlan?.drawdown_model],
    ['Minimum trading days', item => item.plan.minTradingDays],
    ['First payout (days)', item => item.plan.firstPayoutDays],
    ['Trustpilot rating', item => item.firm.trustpilotScore],
    ['Platforms', item => item.firm.availablePlatforms],
  ];
  const content = <div className="w-full overflow-hidden rounded-2xl border border-[#2b2e2c] bg-[#1d1f1e]">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2b2e2c] px-5 py-5 sm:px-7">
      <div><h2 className="text-lg font-medium text-[#f1f3f2]">Your comparison</h2><p className="mt-1 text-sm text-[#747976]">{items.length} of 4 firms selected</p></div>
      <div className="flex gap-4"><button onClick={onClearAll} className="text-sm text-[#9a9e9b] hover:text-[#f1f3f2]">Clear all</button><button onClick={onClose} className="text-sm text-[#9a9e9b] hover:text-[#f1f3f2]" aria-label={embedded ? 'Back to firms' : 'Close comparison'}>{embedded ? 'Back to firms' : 'Close'}</button></div>
    </div>
    <p className="px-5 pt-5 text-xs leading-5 text-[#747976] sm:px-7">Prices remain in their source currency. Rules can vary by plan and phase; open firm details for full notes.</p>
    <div className="overflow-x-auto px-5 pb-6 pt-4 sm:px-7">
      <table className="w-full min-w-[620px] border-collapse text-left text-sm">
        <thead><tr><th className="w-44 p-3 font-medium text-[#747976]">Metric</th>{items.map(item => <th className="min-w-48 p-3 font-medium" key={item.firm.id}>
          <div className="flex items-center justify-between gap-2"><span className="truncate text-[#f1f3f2]">{item.firm.name}</span><button onClick={() => onRemoveItem(item.firm.id)} aria-label={`Remove ${item.firm.name}`} className="text-[#747976] hover:text-[#f1f3f2]">×</button></div>
          <select aria-label={`Plan for ${item.firm.name}`} className="mt-3 w-full rounded-lg border border-[#2b2e2c] bg-[#202321] p-2 text-xs text-[#f1f3f2]" value={item.plan.id} onChange={event => { const plan = item.firm.plans.find(plan => plan.id === event.target.value); if (plan) onChangePlan(item.firm.id, plan); }}>{item.firm.plans.map(plan => <option key={plan.id} value={plan.id}>{plan.label}</option>)}</select>
        </th>)}</tr></thead>
        <tbody>{metrics.map(([label, get]) => <tr className="border-t border-[#2b2e2c]" key={label}><th className="p-3 font-normal text-[#9a9e9b]">{label}</th>{items.map(item => <td className="p-3 text-[#f1f3f2]" key={item.firm.id}>{displayValue(get(item))}</td>)}</tr>)}</tbody>
      </table>
    </div>
  </div>;
  return embedded ? content : <div role="dialog" aria-modal="true" aria-label="Firm comparison" className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={onClose}><div className="max-h-[92vh] w-full max-w-6xl overflow-y-auto" onClick={event => event.stopPropagation()}>{content}</div></div>;
};
