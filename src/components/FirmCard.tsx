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
  const {firm,onOpenDetails,onToggleSave,onToggleCompare,onOpenPriceAlert}=props;
  const [selected,setSelected]=useState('');
  const plan=firm.plans.find(p=>p.id===selected) || firm.plans.find(p=>p.size===props.preferredSize) || firm.plans[0];
  return <article className="rounded-xl bg-[#0e1626] border border-slate-800 p-5 space-y-4" id={`firm-card-${firm.slug}`}>
    <div className="flex items-center gap-3">
      {firm.logo && <img src={firm.logo} alt="" className="w-11 h-11 rounded-lg object-contain bg-slate-900"/>}
      <div className="flex-1"><h3 className="font-bold text-white">{firm.name}</h3><p className="text-xs text-slate-400">{firm.headquarters} · {firm.sourceData?.asset_type}</p></div>
      <button aria-label={props.isSaved?'Remove favorite':'Save firm'} onClick={()=>onToggleSave(firm.id)}><Bookmark className={`w-4 h-4 ${props.isSaved?'fill-amber-400 text-amber-400':'text-slate-400'}`}/></button>
    </div>
    <p className="text-xs text-slate-400">Trustpilot: {displayValue(firm.trustpilotScore)} · {displayValue(firm.trustpilotReviewsCount)} reviews{firm.sourceData?.trustpilot?.suspended?' · Profile suspended':''}</p>
    {plan ? <>
      <label className="block text-xs text-slate-400">Account plan<select aria-label={`Account plan for ${firm.name}`} value={plan.id} onChange={e=>setSelected(e.target.value)} className="mt-1 w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-200">{firm.plans.map(p=><option key={p.id} value={p.id}>{p.label}</option>)}</select></label>
      <div className="text-xl text-emerald-400 font-bold">{planPrice(plan)}</div>
      <dl className="grid grid-cols-2 gap-3 text-xs">{[
        ['Profit split',plan.sourcePlan?.profit_split],['Profit target',plan.sourcePlan?.profit_target],
        ['Maximum loss',plan.sourcePlan?.max_total_drawdown],['Daily loss',plan.sourcePlan?.max_daily_loss],
      ].map(([label,value])=><div key={label}><dt className="text-slate-500">{label}</dt><dd className="mt-1 text-slate-200">{displayValue(value)}</dd></div>)}</dl>
      <div className="flex flex-wrap gap-2 text-xs">
        <button className="rounded bg-slate-800 p-2" onClick={()=>onToggleCompare(firm,plan)}><Scale className="inline w-3 h-3 mr-1"/>{props.isCompared?'Remove comparison':'Compare'}</button>
        <button className="rounded bg-slate-800 p-2" onClick={()=>props.onOpenCalculatorWithPlan(firm,plan)}>Calculator</button>
        {onOpenPriceAlert && plan.discountedPrice!=null && <button className="rounded bg-slate-800 p-2" onClick={()=>onOpenPriceAlert(firm,plan)}><Bell className="inline w-3 h-3 mr-1"/>Price alert</button>}
      </div>
    </> : <p className="text-sm text-slate-400">No account plans provided.</p>}
    {firm.exclusiveDiscount && <p className="text-xs text-emerald-300">{firm.exclusiveDiscount.perkDescription} · Code {firm.exclusiveDiscount.code}</p>}
    <div className="flex gap-2 text-xs"><button className="flex-1 rounded bg-emerald-600 px-3 py-2 font-bold text-white" onClick={()=>onOpenDetails(firm,plan)}>View firm details</button>{firm.website && <a className="rounded border border-slate-700 p-2" href={firm.website} target="_blank" rel="noreferrer" aria-label={`Visit ${firm.name}`}><ExternalLink className="w-4 h-4"/></a>}</div>
  </article>;
};
