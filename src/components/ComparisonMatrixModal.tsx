import React, { useEffect } from 'react';
import type { PropFirm, AccountPlan } from '../types';
import { displayValue, planPrice } from '../lib/catalog';
interface ComparisonMatrixModalProps {
  items: {firm:PropFirm;plan:AccountPlan}[];
  onRemoveItem:(id:string)=>void;onClearAll:()=>void;
  onChangePlan:(id:string,plan:AccountPlan)=>void;onClose:()=>void;currency:'USD'|'EUR'|'GBP';
}
export const ComparisonMatrixModal:React.FC<ComparisonMatrixModalProps> = ({items,onRemoveItem,onClearAll,onChangePlan,onClose})=>{
  useEffect(()=>{const close=(e:KeyboardEvent)=>{if(e.key==='Escape')onClose();};window.addEventListener('keydown',close);return()=>window.removeEventListener('keydown',close);},[onClose]);
  if(!items.length)return null;
  const metrics:[string,(item:typeof items[number])=>unknown][]=[
    ['Price',i=>planPrice(i.plan)],['Account size',i=>i.plan.sourcePlan?.account_size],['Challenge',i=>i.plan.sourcePlan?.step],
    ['Profit split',i=>i.plan.sourcePlan?.profit_split],['Profit target',i=>i.plan.sourcePlan?.profit_target],['Daily loss',i=>i.plan.sourcePlan?.max_daily_loss],
    ['Maximum drawdown',i=>i.plan.sourcePlan?.max_total_drawdown],['Drawdown model',i=>i.plan.sourcePlan?.drawdown_model],
    ['Minimum trading days',i=>i.plan.minTradingDays],['First payout (days)',i=>i.plan.firstPayoutDays],
    ['Trustpilot rating',i=>i.firm.trustpilotScore],['Platforms',i=>i.firm.availablePlatforms],
  ];
  return <div role="dialog" aria-modal="true" aria-label="Firm comparison" className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={onClose}><div className="bg-[#1a1c1b] border border-[#333633] rounded-2xl p-5 max-w-6xl w-full max-h-[92vh] overflow-auto" onClick={e=>e.stopPropagation()}>
    <div className="flex justify-between gap-3 mb-3"><h2 className="text-lg font-bold">Compare firms</h2><div><button className="mr-4 text-sm underline" onClick={onClearAll}>Clear all</button><button onClick={onClose} aria-label="Close comparison">✕</button></div></div>
    <p className="text-xs text-[#747976] mb-4">Source prices retain their original currencies. Rules can vary by account and phase; open firm details for the full notes.</p>
    <table className="w-full text-sm text-left"><thead><tr><th className="p-3">Metric</th>{items.map(i=><th className="p-3 min-w-48" key={i.firm.id}><div className="flex justify-between gap-2">{i.firm.name}<button aria-label={`Remove ${i.firm.name}`} onClick={()=>onRemoveItem(i.firm.id)}>✕</button></div><select className="mt-2 w-full max-w-64 bg-[#1d1f1e] rounded text-xs p-2" value={i.plan.id} onChange={e=>{const p=i.firm.plans.find(p=>p.id===e.target.value);if(p)onChangePlan(i.firm.id,p);}}>{i.firm.plans.map(p=><option key={p.id} value={p.id}>{p.label}</option>)}</select></th>)}</tr></thead>
    <tbody>{metrics.map(([label,get])=><tr className="border-t border-[#2b2e2c]" key={label}><th className="p-3 text-[#747976] font-normal">{label}</th>{items.map(i=><td className="p-3" key={i.firm.id}>{displayValue(get(i))}</td>)}</tr>)}</tbody></table>
  </div></div>;
};
