import React from 'react';
import { ArrowUpRight, Star } from 'lucide-react';
import type { PropFirm } from '../types';

interface ComparisonPreviewProps {
  firms: PropFirm[];
  onCompare: () => void;
}

const display = (value: number | null | undefined, suffix = '') => value == null ? '—' : `${value}${suffix}`;

export const ComparisonPreview: React.FC<ComparisonPreviewProps> = ({ firms, onCompare }) => {
  const preview = firms.filter(f => f.plans.length > 0).slice(0, 3);
  return (
    <div className="overflow-hidden rounded-2xl border border-[#2b2e2c] bg-[#1d1f1e]" aria-label="Firm comparison preview">
      <div className="flex items-center justify-between border-b border-[#2b2e2c] px-5 py-5 sm:px-7">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#747976]">A clearer view</p>
          <h2 className="mt-1 text-lg font-medium tracking-tight text-[#f1f3f2]">Compare at a glance</h2>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[#9a9e9b]"><span className="h-1.5 w-1.5 rounded-full bg-[#3ecf8e]" /> Live catalog</div>
      </div>
      <div className="overflow-x-auto px-5 py-2 sm:px-7">
        <table className="w-full min-w-[430px] text-left">
          <thead><tr className="border-b border-[#2b2e2c] text-[11px] font-medium uppercase tracking-[0.12em] text-[#747976]">
            <th className="py-4 font-medium">Firm</th><th className="py-4 font-medium">Price</th><th className="py-4 font-medium">Target</th><th className="py-4 font-medium">Split</th><th className="py-4 text-right font-medium">Rating</th>
          </tr></thead>
          <tbody>
            {preview.map(firm => {
              const plan = firm.plans[0];
              const price = plan.discountedPrice ?? plan.originalPrice;
              return <tr key={firm.id} className="border-b border-[#2b2e2c] last:border-0">
                <td className="py-5 pr-3"><div className="flex items-center gap-2.5"><img src={firm.logo} alt="" className="h-8 w-8 rounded-md bg-[#202321] object-contain" /><span className="max-w-[130px] truncate text-sm font-medium text-[#f1f3f2]">{firm.name}</span></div></td>
                <td className="py-5 pr-3 text-sm text-[#f1f3f2]">{price == null ? '—' : new Intl.NumberFormat('en-US', { style: 'currency', currency: plan.currency || 'USD', maximumFractionDigits: 0 }).format(price)}</td>
                <td className="py-5 pr-3 text-sm text-[#9a9e9b]">{display(plan.step1TargetPercent, '%')}</td>
                <td className="py-5 pr-3 text-sm text-[#3ecf8e]">{display(plan.profitSplit, '%')}</td>
                <td className="py-5 text-right text-sm text-[#f1f3f2]">{firm.trustpilotScore == null ? '—' : <span className="inline-flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-[#3ecf8e] text-[#3ecf8e]" />{firm.trustpilotScore.toFixed(1)}</span>}</td>
              </tr>;
            })}
            {!preview.length && <tr><td colSpan={5} className="py-10 text-center text-sm text-[#747976]">Catalog preview will appear after the first sync.</td></tr>}
          </tbody>
        </table>
      </div>
      <button onClick={onCompare} className="flex w-full items-center justify-between border-t border-[#2b2e2c] px-5 py-4 text-left text-sm font-medium text-[#f1f3f2] transition-colors hover:bg-[#202321] sm:px-7">
        Explore comparisons <ArrowUpRight className="h-4 w-4 text-[#3ecf8e]" />
      </button>
    </div>
  );
};
