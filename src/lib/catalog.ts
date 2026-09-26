import type { AccountPlan, PropFirm, MarketType, ChallengeType, TradingPlatform, DrawdownType } from '../types';

// Preserve the provider's raw text, nulls, and notes alongside the display model.
export type SourceRecord = Record<string, any>;
const number = (v: unknown): number | null => typeof v==='number' && Number.isFinite(v) ? v : typeof v==='string' && /^\d+(\.\d+)?$/.test(v.trim()) ? Number(v) : null;
const boolean = (v: unknown): boolean | null => typeof v==='boolean'?v:null;
export const displayValue = (v: unknown): string => v==null || v==='' ? 'Not provided' : typeof v==='boolean' ? (v?'Yes':'No') : Array.isArray(v) ? v.join(', ') || 'Not provided' : String(v);
export function planPrice(plan?: AccountPlan) {
  if(!plan || plan.discountedPrice==null) return 'Price not provided';
  const currency=plan.currency;
  if(!currency) return `${plan.discountedPrice} (currency not provided)`;
  try { return new Intl.NumberFormat('en',{style:'currency',currency}).format(plan.discountedPrice); }
  catch { return `${plan.discountedPrice} ${currency}`; }
}
export function safeUrl(value: unknown): string | undefined {
  if(typeof value!=='string')return undefined;
  try { const url=new URL(value);return ['http:','https:'].includes(url.protocol)?url.href:undefined; } catch { return undefined; }
}
const draws:Record<string,DrawdownType>={static:'Balance-Based (Static)',eod:'End of Day (EOD)',intraday_trailing:'Trailing'};
const steps:Record<string,ChallengeType>={'1 Step':'1-Step','2 Steps':'2-Step','3 Steps':'3-Step','Instant':'Instant Funding','Instant Funding':'Instant Funding'};

export function mapCatalogFirm(f:SourceRecord):PropFirm {
  const trading=f.rules?.trading_rules,payout=f.rules?.payout_rules;
  const plans:AccountPlan[]=(f.challenges ?? []).map((c:SourceRecord)=>{
    const size=number(c.account_size_numeric),dd=number(c.max_total_drawdown_pct),daily=number(c.max_daily_loss_pct);
    return {
      id:`${f.slug}:${c.id}`,size,label:[c.name,c.account_size,c.step].filter(Boolean).join(' · ') || 'Account',
      originalPrice:number(c.before_price) ?? number(c.price_numeric),discountedPrice:number(c.price_numeric),currency:c.currency ?? null,
      step1TargetPercent:number(c.profit_target_pct),step2TargetPercent:null,maxDrawdownPercent:dd,dailyDrawdownPercent:daily,
      maxDrawdownAmount:size!=null && dd!=null?size*dd/100:null,dailyDrawdownAmount:size!=null && daily!=null?size*daily/100:null,
      minTradingDays:number(c.min_trade_days),profitSplit:number(c.profit_split_pct),leverage:trading?.max_leverage ?? 'Not provided',
      refundable:boolean(payout?.fee_refunded_on_first_payout),firstPayoutDays:number(payout?.first_payout_days),subsequentPayoutDays:null,sourcePlan:c,
    };
  });
  const markets:MarketType[]= f.asset_type==='Futures'?['Futures']:f.asset_type==='CFD'||f.asset_type==='Forex'?['Forex']:f.asset_type==='Crypto'?['Crypto']:[];
  const year=typeof f.established==='string'?f.established.match(/\b(19|20)\d{2}\b/)?.[0]:null;
  const platformMap:Record<string,string>={MT4:'MetaTrader 4',MT5:'MetaTrader 5','Match Trader':'Match-Trader'};
  const offer=(f.offers ?? []).find((o:SourceRecord)=>o.promo_code && number(o.discount_percent)!=null);
  return {
    id:f.slug,slug:f.slug,name:f.name,logo:safeUrl(f.logo_url) || '',website:safeUrl(f.url) || '',accentColor:'#10b981',
    establishedYear:year?Number(year):null,yearsInOperation:year?new Date().getFullYear()-Number(year):null,
    headquarters:f.country ?? 'Not provided',brokerOrLiquidity:'Not provided',trustpilotScore:number(f.trustpilot?.rating),trustpilotReviewsCount:number(f.trustpilot?.review_count),
    verifiedPayoutsCount:null,totalPayoutsTracked:'Not provided',usTradersAccepted:null,supportedMarkets:markets,assetTags:f.asset_type?[f.asset_type]:[],
    availableTypes:[...new Set<ChallengeType>((f.challenges ?? []).map((c:SourceRecord)=>steps[c.step]).filter(Boolean))],
    availablePlatforms:(f.platforms ?? []).map((p:string)=>platformMap[p]||p) as TradingPlatform[],drawdownType:draws[trading?.drawdown_model_challenge] ?? null,
    baseProfitSplit:null,maxProfitSplit:null,plans,
    rules:{weekendHolding:boolean(trading?.weekend_holding_allowed),newsTrading:boolean(trading?.news_trading_allowed),eaAlgoTrading:boolean(trading?.ea_automation_allowed),copyTrading:boolean(trading?.copy_trading_allowed),hedgingAllowed:boolean(trading?.hedging_allowed),martingaleAllowed:boolean(trading?.martingale_allowed),overnightHolding:boolean(trading?.overnight_holding_allowed),drawdownCalculation:null,consistencyRule:null,consistencyRuleDetails:trading?.consistency_rule_challenge ?? undefined,inactivityLimitDays:null,prohibitedStrategies:trading?.prohibited_strategies?[trading.prohibited_strategies]:[],scalingPlan:{available:null,scalingTargetPercent:null,accountGrowthPercent:null,maxCapital:'Not provided'}},
    payoutMethods:f.payout_methods ?? [],reviews:[],sourceData:f,
    exclusiveDiscount:offer?{code:offer.promo_code,discountPercent:number(offer.discount_percent)!,perkDescription:offer.description ?? '',validUntil:offer.expires_at ?? 'Expiry not provided'}:undefined,
  };
}
