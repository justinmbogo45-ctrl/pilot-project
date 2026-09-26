import React,{useState} from 'react';
import type {PropFirm,AccountPlan} from '../types';
import {safeUrl} from '../lib/catalog';
interface DiscountsHubProps {firms:PropFirm[];onSelectFirm:(firm:PropFirm,plan:AccountPlan)=>void;}
export const DiscountsHub:React.FC<DiscountsHubProps>=({firms,onSelectFirm})=>{
  const [filter,setFilter]=useState('All'),[copied,setCopied]=useState('');
  const offers=firms.flatMap(f=>(f.sourceData?.offers ?? []).map((offer:any)=>({firm:f,offer})));
  const shown=offers.filter(o=>filter==='All'||o.firm.id===filter);
  const copy=async(code:string)=>{await navigator.clipboard.writeText(code);setCopied(code);};
  return <div className="max-w-6xl mx-auto p-6 space-y-6"><h1 className="text-2xl font-bold">Prop firm offers</h1><p className="text-sm text-slate-400">Active offers in the latest PropFirmMap import. Check eligibility and final pricing on the firm’s website.</p>
    <label className="text-sm">Filter by firm <select className="ml-2 bg-slate-900 rounded p-2" value={filter} onChange={e=>setFilter(e.target.value)}><option>All</option>{firms.filter(f=>f.sourceData?.offers?.length).map(f=><option key={f.id} value={f.id}>{f.name}</option>)}</select></label>
    {!shown.length&&<p>No active offers available.</p>}
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">{shown.map(({firm,offer})=><article className="rounded-xl bg-[#0e1626] border border-slate-800 p-5 space-y-3" key={offer.id}><h2 className="font-bold">{firm.name}</h2>{offer.discount_percent!=null&&<p className="text-xl text-emerald-400">{offer.discount_percent}% off</p>}<p className="text-sm text-slate-300">{offer.description}</p><p className="text-xs text-slate-500">Expiry: {offer.expires_at?new Date(offer.expires_at).toLocaleString():'Not provided'}</p>
      {offer.promo_code?<button className="border border-dashed border-emerald-600 rounded p-2 text-sm" onClick={()=>void copy(offer.promo_code)}>{copied===offer.promo_code?'Copied':`Copy ${offer.promo_code}`}</button>:<p className="text-sm text-emerald-300">No code required</p>}
      <div className="flex justify-between text-xs"><button className="underline" onClick={()=>onSelectFirm(firm,firm.plans[0])}>Firm details</button>{(safeUrl(offer.outbound_url)||firm.website)&&<a className="text-emerald-400 underline" href={safeUrl(offer.outbound_url)||firm.website} target="_blank" rel="noreferrer">View offer</a>}</div>
    </article>)}</div>
  </div>;
};
