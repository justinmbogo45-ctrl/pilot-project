import React, {useEffect,useState} from 'react';
import type {PropFirm,AccountPlan,FirmReview} from '../types';
import {displayValue,planPrice,safeUrl} from '../lib/catalog';
import {apiRequest} from '../lib/api';
interface FirmDetailsModalProps {firm:PropFirm|null;initialPlan?:AccountPlan|null;currency:'USD'|'EUR'|'GBP';onClose:()=>void;onOpenCalculator:(f:PropFirm,p:AccountPlan)=>void;onOpenWriteReview:(f:PropFirm)=>void;onOpenPriceAlert?:(f:PropFirm,p:AccountPlan)=>void;}
function RuleSection({title,rules}:{title:string;rules:Record<string,unknown>|null}) {
  return <section className="space-y-3"><h3 className="text-base font-bold">{title}</h3>{!rules?<p className="text-[#747976]">Not provided</p>:<>
    <dl className="grid sm:grid-cols-2 gap-3">{Object.entries(rules).filter(([key])=>!['source_url','verified_at','not_documented'].includes(key)).map(([key,value])=><div key={key} className="rounded-lg bg-[#1d1f1e] p-3"><dt className="text-xs text-[#9a9e9b] capitalize">{key.replaceAll('_',' ')}</dt><dd className="text-sm mt-1 whitespace-pre-wrap">{displayValue(value)}</dd></div>)}</dl>
    {safeUrl(rules.source_url) && <a className="text-xs text-[#3ecf8e] underline" href={safeUrl(rules.source_url)} target="_blank" rel="noreferrer">Original rule source</a>}
    {typeof rules.verified_at==='string' && <p className="text-xs text-[#9a9e9b]">Provider verified: {new Date(rules.verified_at).toLocaleString()}</p>}
  </>}</section>;
}
export const FirmDetailsModal:React.FC<FirmDetailsModalProps>=({firm,initialPlan,onClose,onOpenCalculator,onOpenWriteReview,onOpenPriceAlert})=>{
  const [selected,setSelected]=useState(initialPlan?.id ?? '');
  const [tab,setTab]=useState('accounts');
  const [reviews,setReviews]=useState<FirmReview[]>([]);
  const [error,setError]=useState('');
  const [intel,setIntel]=useState<{text:string;sources:{title:string;uri:string}[]}|null>(null);
  const [loading,setLoading]=useState(false);
  useEffect(()=>{const close=(e:KeyboardEvent)=>{if(e.key==='Escape')onClose();};window.addEventListener('keydown',close);return()=>window.removeEventListener('keydown',close);},[onClose]);
  useEffect(()=>{let active=true;if(firm)apiRequest<FirmReview[]>(`/firms/${encodeURIComponent(firm.id)}/reviews`).then(r=>{if(active)setReviews(r);}).catch(()=>{if(active)setError('Reviews could not be loaded.');});return()=>{active=false;};},[firm?.id]);
  if(!firm)return null;
  const plan=firm.plans.find(p=>p.id===selected)||firm.plans[0],source=firm.sourceData;
  const research=async()=>{setLoading(true);setError('');try{setIntel(await apiRequest('/ai/firm-intel','POST',{firmName:firm.name}));}catch(e){setError((e as Error).message);}finally{setLoading(false);}};
  return <div role="dialog" aria-modal="true" aria-label={`${firm.name} details`} className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={onClose}><div onClick={e=>e.stopPropagation()} className="bg-[#1a1c1b] border border-[#333633] rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col">
    <header className="p-5 border-b border-[#2b2e2c] flex justify-between gap-4"><div><h2 className="font-bold text-xl">{firm.name}</h2><p className="text-xs text-[#747976] mt-1">{firm.headquarters} · Established {displayValue(source?.established)} · Trustpilot {displayValue(firm.trustpilotScore)}{source?.trustpilot?.suspended?' (suspended)':''}</p></div><button aria-label="Close firm details" onClick={onClose}>✕</button></header>
    <nav className="px-5 py-3 flex gap-2 overflow-auto">{['accounts','rules','payouts','offers','reviews','AI research'].map(t=><button className={`whitespace-nowrap text-sm px-3 py-2 rounded ${tab===t?'bg-emerald-700':'bg-[#222522]'}`} key={t} onClick={()=>{setError('');setTab(t);}}>{t}</button>)}</nav>
    <div className="p-5 space-y-5 overflow-auto text-[#9a9e9b]">{error && <p role="alert" className="text-amber-300">{error}</p>}
    {tab==='accounts' && <><p className="text-sm text-[#747976]">{source?.about}</p>{plan?<>
      <select aria-label="Account plan" value={plan.id} onChange={e=>setSelected(e.target.value)} className="w-full rounded bg-[#1d1f1e] p-3 border border-[#333633]">{firm.plans.map(p=><option key={p.id} value={p.id}>{p.label} — {planPrice(p)}</option>)}</select>
      <h3 className="font-bold text-2xl text-[#3ecf8e]">{planPrice(plan)}</h3>
      <dl className="grid grid-cols-2 gap-3">{[['Account size',plan.sourcePlan?.account_size],['Challenge type',plan.sourcePlan?.step],['Profit split',plan.sourcePlan?.profit_split],['Profit target',plan.sourcePlan?.profit_target],['Daily loss',plan.sourcePlan?.max_daily_loss],['Maximum loss',plan.sourcePlan?.max_total_drawdown],['Drawdown model',plan.sourcePlan?.drawdown_model],['Activation fee',plan.sourcePlan?.activation_fee],['Minimum trading days',plan.minTradingDays],['Plan notes',plan.sourcePlan?.rewards]].map(([label,value])=><div key={label} className="bg-[#1d1f1e] rounded-lg p-3"><dt className="text-xs text-[#9a9e9b]">{label}</dt><dd className="mt-1 text-sm">{displayValue(value)}</dd></div>)}</dl>
      <p className="text-xs text-[#747976]">Drawdown source: {displayValue(plan.sourcePlan?.drawdown_model_source)}</p>
      <div className="flex gap-3"><button className="rounded bg-[#222522] p-2 text-sm" onClick={()=>onOpenCalculator(firm,plan)}>Open calculator</button>{onOpenPriceAlert && plan.discountedPrice!=null && <button className="rounded bg-[#222522] p-2 text-sm" onClick={()=>onOpenPriceAlert(firm,plan)}>Set price alert</button>}</div>
    </>:<p>No account plans provided.</p>}</>}
    {tab==='rules' && <RuleSection title="Trading rules" rules={source?.rules?.trading_rules ?? null}/>}
    {tab==='payouts' && <><p className="text-sm">Payout methods: {displayValue(firm.payoutMethods)}</p><RuleSection title="Payout rules" rules={source?.rules?.payout_rules ?? null}/></>}
    {tab==='offers' && <>{!source?.offers?.length && <p>No active offers provided.</p>}{source?.offers?.map((o:any)=><div key={o.id} className="rounded bg-[#1d1f1e] p-4 space-y-2"><p>{o.description}</p><p className="text-[#3ecf8e]">{o.promo_code?`Code: ${o.promo_code}`:'No code required'}</p><p className="text-xs text-[#747976]">Expires: {o.expires_at?new Date(o.expires_at).toLocaleString():'Not provided'}</p></div>)}</>}
    {tab==='reviews' && <><button className="bg-emerald-700 rounded p-2 text-sm" onClick={()=>onOpenWriteReview(firm)}>Write a review</button><p className="text-xs text-[#747976]">Community reviews are separate from the provider’s Trustpilot rating.</p>{!reviews.length && <p>No community reviews yet.</p>}{reviews.map(r=><article key={r.id} className="bg-[#1d1f1e] p-4 rounded"><h3 className="font-bold">{r.title} · {r.rating}/5</h3><p className="text-sm mt-2">{r.comment}</p><p className="text-xs text-[#747976] mt-2">{r.author}</p></article>)}</>}
    {tab==='AI research' && <><button disabled={loading} onClick={research} className="rounded bg-emerald-700 p-2">{loading?'Researching…':'Research this firm'}</button>{intel && <><p className="text-sm whitespace-pre-wrap">{intel.text}</p>{intel.sources.map((s,i)=><a className="block text-xs text-[#3ecf8e] underline" key={i} href={safeUrl(s.uri)} target="_blank" rel="noreferrer">{s.title}</a>)}</>}</>}
    </div><footer className="p-4 border-t border-[#2b2e2c] flex justify-between text-xs text-[#747976]"><a className="underline" href={`https://propfirmmap.com/firms/${firm.slug}`} target="_blank" rel="noreferrer">Source: PropFirmMap</a>{firm.website && <a className="text-[#3ecf8e] underline" href={firm.website} target="_blank" rel="noreferrer">Visit firm</a>}</footer>
  </div></div>;
};
