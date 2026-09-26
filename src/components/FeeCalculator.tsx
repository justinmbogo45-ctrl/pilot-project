import React, {useState} from 'react';
import type {PropFirm,AccountPlan} from '../types';
import {planPrice} from '../lib/catalog';
interface FeeCalculatorProps {firms:PropFirm[];initialFirm?:PropFirm|null;initialPlan?:AccountPlan|null;currency:'USD'|'EUR'|'GBP';}
export const FeeCalculator:React.FC<FeeCalculatorProps>=({firms,initialFirm,initialPlan})=>{
  const [firmId,setFirmId]=useState(initialFirm?.id ?? '');
  const firm=firms.find(f=>f.id===firmId)||firms.find(f=>f.plans.length>0);
  const [planId,setPlanId]=useState(initialPlan?.id ?? '');
  const plan=firm?.plans.find(p=>p.id===planId)||firm?.plans[0];
  const [overrides,setOverrides]=useState<Record<string,string>>({});
  const [profit,setProfit]=useState('6');
  const [refund,setRefund]=useState(false);
  const defaults={size:plan?.size,fee:plan?.discountedPrice,drawdown:plan?.maxDrawdownAmount,split:plan?.profitSplit};
  const values=Object.fromEntries(Object.entries(defaults).map(([key,v])=>[key,overrides[key] ?? (v==null?'':String(v))]));
  const parse=(s:string)=>s.trim()===''?null:Number.isFinite(Number(s)) && Number(s)>=0?Number(s):null;
  const size=parse(values.size),fee=parse(values.fee),split=parse(values.split),drawdown=parse(values.drawdown),monthly=parse(profit);
  const valid=size!=null&&size>0&&fee!=null&&split!=null&&split>0&&split<=100&&monthly!=null;
  const gross=valid?size!*monthly!/100:null;
  const net=gross==null?null:gross*split!/100+(refund?fee!:0);
  const money=(value:number|null)=>value==null?'Enter the missing values':`${value.toLocaleString(undefined,{maximumFractionDigits:2})} ${plan?.currency ?? '(currency not provided)'}`;
  const selectPlan=(id:string)=>{setPlanId(id);setOverrides({});setRefund(false);};
  return <div className="max-w-5xl mx-auto p-6 space-y-6"><h1 className="text-2xl font-bold">Challenge fee & payout calculator</h1><p className="text-sm text-slate-400">Uses the selected plan’s source currency. Enter missing values to calculate an estimate. Your assumptions do not change the catalog.</p>
    {!plan?<p>No account plans available yet.</p>:<>
      <div className="grid md:grid-cols-2 gap-4"><label className="text-sm">Firm<select aria-label="Calculator firm" className="block mt-2 w-full bg-slate-900 rounded p-3" value={firm!.id} onChange={e=>{setFirmId(e.target.value);selectPlan('');}}>{firms.filter(f=>f.plans.length).map(f=><option value={f.id} key={f.id}>{f.name}</option>)}</select></label><label className="text-sm">Account plan<select aria-label="Calculator plan" className="block mt-2 w-full bg-slate-900 rounded p-3" value={plan.id} onChange={e=>selectPlan(e.target.value)}>{firm!.plans.map(p=><option key={p.id} value={p.id}>{p.label} — {planPrice(p)}</option>)}</select></label></div>
      <div className="grid sm:grid-cols-2 gap-4">{[['size','Account size'],['fee','Challenge fee'],['drawdown','Maximum drawdown amount'],['split','Profit split (%)']].map(([key,label])=><label className="text-sm text-slate-300" key={key}>{label}<input className="block mt-2 bg-slate-900 border border-slate-700 rounded p-3 w-full" type="number" min="0" step="any" placeholder="Not provided — enter an assumption" value={values[key]} onChange={e=>setOverrides({...overrides,[key]:e.target.value})}/></label>)}</div>
      <label className="block text-sm">Expected profit (%)<input className="ml-3 p-2 rounded bg-slate-900 w-24" type="number" min="0" step="any" value={profit} onChange={e=>setProfit(e.target.value)}/></label>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={refund} onChange={e=>setRefund(e.target.checked)}/>Assume challenge fee is refunded on first payout</label>
      <div className="grid sm:grid-cols-3 gap-4">{[['Estimated trader payout',money(net)],['Net after challenge fee',money(net!=null?net-fee!:null)],['Fee per 1,000 of drawdown',money(fee!=null&&drawdown!=null&&drawdown>0?fee/drawdown*1000:null)]].map(([label,value])=><div className="bg-[#0e1626] rounded-xl border border-slate-800 p-5" key={label}><p className="text-xs text-slate-400">{label}</p><p className="mt-2 text-emerald-400 font-bold">{value}</p></div>)}</div>
    </>}
  </div>;
};
