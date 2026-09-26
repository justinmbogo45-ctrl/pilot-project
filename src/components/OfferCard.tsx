import React, { useState } from 'react';
import { ArrowUpRight, Check, Copy, Star } from 'lucide-react';
import type { PropFirm } from '../types';

export const OfferCard: React.FC<{ firm: PropFirm; onSelect: () => void }> = ({ firm, onSelect }) => {
  const [copied, setCopied] = useState(false);
  const offer = firm.exclusiveDiscount!;
  const copyCode = async () => {
    if (!offer.code) return;
    try {
      await navigator.clipboard.writeText(offer.code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch { setCopied(false); }
  };
  return <article className="group flex min-h-[300px] flex-col rounded-2xl border border-[#2b2e2c] bg-[#1d1f1e] p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#3a3f3b] hover:bg-[#202321]">
    <div className="flex items-start justify-between gap-4">
      <div className="flex min-w-0 items-center gap-3">
        <img src={firm.logo} alt="" className="h-11 w-11 shrink-0 rounded-lg bg-[#202321] object-contain" />
        <div className="min-w-0">
          <h3 className="truncate text-base font-medium text-[#f1f3f2]">{firm.name}</h3>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-[#9a9e9b]">
            {firm.trustpilotScore == null ? 'Rating unavailable' : <><Star className="h-3.5 w-3.5 fill-[#3ecf8e] text-[#3ecf8e]" /> {firm.trustpilotScore.toFixed(1)} rating</>}
          </p>
        </div>
      </div>
      {offer.discountPercent != null && <div className="shrink-0 text-right text-2xl font-medium tracking-tight text-[#3ecf8e]">{offer.discountPercent}%<span className="ml-1 text-xs font-medium text-[#9a9e9b]">off</span></div>}
    </div>
    <p className="mt-8 line-clamp-3 min-h-[3.7rem] text-sm leading-6 text-[#9a9e9b]">{offer.perkDescription || 'Explore this firm’s current promotion and challenge plans.'}</p>
    <div className="mt-auto flex flex-wrap items-end justify-between gap-4 pt-6">
      <div>
        <p className="mb-2 text-[11px] uppercase tracking-[0.12em] text-[#747976]">Promo code</p>
        {offer.code ? <button onClick={copyCode} title={copied ? 'Copied' : 'Copy promo code'} className="inline-flex items-center gap-2 rounded-md border border-[#2b2e2c] px-3 py-2 font-mono text-xs text-[#f1f3f2] transition-colors hover:border-[#3a3f3b]" aria-label={`Copy ${offer.code} promo code`}>
          {offer.code} {copied ? <Check className="h-3.5 w-3.5 text-[#3ecf8e]" /> : <Copy className="h-3.5 w-3.5 text-[#9a9e9b]" />}
        </button> : <span className="text-sm text-[#9a9e9b]">Applied automatically</span>}
      </div>
      <button onClick={onSelect} className="inline-flex items-center gap-1.5 text-sm font-medium text-[#f1f3f2] transition-colors hover:text-[#3ecf8e]">View offer <ArrowUpRight className="h-4 w-4" /></button>
    </div>
  </article>;
};
