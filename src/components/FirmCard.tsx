import React, { useState } from 'react';
import { Bookmark, Scale, Bell, ExternalLink } from 'lucide-react';
import type { PropFirm, AccountPlan } from '../types';
import { displayValue, planPrice } from '../lib/catalog';

interface FirmCardProps {
  firm: PropFirm; preferredSize?: number | 'All'; currency: 'USD' | 'EUR' | 'GBP';
  isCompared: boolean; onToggleCompare: (firm: PropFirm, plan: AccountPlan) => void;
  isSaved: boolean; onToggleSave: (id: string) => void;
  onOpenDetails: (firm: PropFirm, plan: AccountPlan) => void;
  onOpenCalculatorWithPlan: (firm: PropFirm, plan: AccountPlan) => void;
  onOpenPriceAlert?: (firm: PropFirm, plan: AccountPlan) => void;
}

export const FirmCard: React.FC<FirmCardProps> = (props) => {
  const { firm, onOpenDetails, onToggleSave, onToggleCompare, onOpenPriceAlert } = props;
  const [selected, setSelected] = useState('');
  const plan = firm.plans.find(p => p.id === selected) || firm.plans.find(p => p.size === props.preferredSize) || firm.plans[0];

  return (
    <article
      className="rounded-2xl border border-[#2b2e2c] bg-[#1d1f1e] p-5 space-y-4 transition-all duration-200 hover:border-[#3ecf8e]/30 hover:bg-[#222522]"
      id={`firm-card-${firm.slug}`}
    >
      <div className="flex items-center gap-3">
        {firm.logo && <img src={firm.logo} alt="" className="h-11 w-11 rounded-lg object-contain bg-[#222522]" />}
        <div className="flex-1">
          <h3 className="font-semibold text-[#f1f3f2]">{firm.name}</h3>
          <p className="text-xs text-[#747976]">{firm.headquarters} · {firm.sourceData?.asset_type}</p>
        </div>
        <button aria-label={props.isSaved ? 'Remove favorite' : 'Save firm'} onClick={() => onToggleSave(firm.id)}>
          <Bookmark className={`h-4 w-4 ${props.isSaved ? 'fill-amber-400 text-amber-400' : 'text-[#747976] hover:text-[#9a9e9b]'}`} />
        </button>
      </div>

      <p className="text-xs text-[#9a9e9b]">
        Trustpilot: {displayValue(firm.trustpilotScore)} · {displayValue(firm.trustpilotReviewsCount)} reviews
        {firm.sourceData?.trustpilot?.suspended ? ' · Profile suspended' : ''}
      </p>

      {plan ? (
        <>
          <label className="block text-xs text-[#9a9e9b]">
            Account plan
            <select
              aria-label={`Account plan for ${firm.name}`}
              value={plan.id}
              onChange={e => setSelected(e.target.value)}
              className="mt-1 w-full rounded-md border border-[#2b2e2c] bg-[#222522] p-2 text-sm text-[#f1f3f2] focus:outline-none focus:border-[#3ecf8e]/50"
            >
              {firm.plans.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
            </select>
          </label>

          <div className="text-xl font-bold text-[#3ecf8e]">{planPrice(plan)}</div>

          <dl className="grid grid-cols-2 gap-3 text-xs">
            {[
              ['Profit split', plan.sourcePlan?.profit_split],
              ['Profit target', plan.sourcePlan?.profit_target],
              ['Maximum loss', plan.sourcePlan?.max_total_drawdown],
              ['Daily loss', plan.sourcePlan?.max_daily_loss],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-[#747976]">{label}</dt>
                <dd className="mt-1 text-[#f1f3f2]">{displayValue(value)}</dd>
              </div>
            ))}
          </dl>

          <div className="flex flex-wrap gap-2 text-xs">
            <button
              className="rounded-md border border-[#2b2e2c] bg-[#222522] px-3 py-1.5 text-[#9a9e9b] hover:text-[#f1f3f2] hover:border-[#3ecf8e]/30 transition-colors duration-150"
              onClick={() => onToggleCompare(firm, plan)}
            >
              <Scale className="inline h-3 w-3 mr-1" />
              {props.isCompared ? 'Remove' : 'Compare'}
            </button>
            <button
              className="rounded-md border border-[#2b2e2c] bg-[#222522] px-3 py-1.5 text-[#9a9e9b] hover:text-[#f1f3f2] hover:border-[#3ecf8e]/30 transition-colors duration-150"
              onClick={() => props.onOpenCalculatorWithPlan(firm, plan)}
            >
              Calculator
            </button>
            {onOpenPriceAlert && plan.discountedPrice != null && (
              <button
                className="rounded-md border border-[#2b2e2c] bg-[#222522] px-3 py-1.5 text-[#9a9e9b] hover:text-[#f1f3f2] hover:border-[#3ecf8e]/30 transition-colors duration-150"
                onClick={() => onOpenPriceAlert(firm, plan)}
              >
                <Bell className="inline h-3 w-3 mr-1" />
                Price alert
              </button>
            )}
          </div>
        </>
      ) : (
        <p className="text-sm text-[#9a9e9b]">No account plans provided.</p>
      )}

      {firm.exclusiveDiscount && (
        <p className="text-xs text-[#3ecf8e]">
          {firm.exclusiveDiscount.perkDescription} · Code {firm.exclusiveDiscount.code}
        </p>
      )}

      <div className="flex gap-2 text-xs">
        <button
          className="flex-1 rounded-lg bg-[#3ecf8e] px-3 py-2.5 font-semibold text-[#171918] hover:bg-[#4eda9a] transition-colors duration-150"
          onClick={() => onOpenDetails(firm, plan)}
        >
          View firm details
        </button>
        {firm.website && (
          <a
            className="flex items-center justify-center rounded-lg border border-[#2b2e2c] px-3 text-[#9a9e9b] hover:text-[#f1f3f2] hover:border-[#3ecf8e]/30 transition-colors duration-150"
            href={firm.website}
            target="_blank"
            rel="noreferrer"
            aria-label={`Visit ${firm.name}`}
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        )}
      </div>
    </article>
  );
};
