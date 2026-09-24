import React, { useState } from 'react';
import { Tag, Check, Copy, ExternalLink, ShieldCheck, Flame, Zap } from 'lucide-react';
import { EXCLUSIVE_COUPONS } from '../data/coupons';
import { PropFirm, AccountPlan } from '../types';

interface DiscountsHubProps {
  firms: PropFirm[];
  onSelectFirm: (firm: PropFirm, plan: AccountPlan) => void;
}

export const DiscountsHub: React.FC<DiscountsHubProps> = ({
  firms,
  onSelectFirm,
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [selectedFirmFilter, setSelectedFirmFilter] = useState<string>('All');

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const filteredCoupons = selectedFirmFilter === 'All'
    ? EXCLUSIVE_COUPONS
    : EXCLUSIVE_COUPONS.filter((c) => c.firmId === selectedFirmFilter);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      
      {/* Header */}
      <div className="text-center space-y-2 mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider">
          <Flame className="w-3.5 h-3.5 fill-amber-400" />
          Verified Active Discount Codes
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Exclusive Prop Firm Discounts & Flash Sales
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto">
          Save hundreds of dollars on your evaluation fees with verified coupon codes and free reset perks tested today.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-4 mb-4">
        <button
          onClick={() => setSelectedFirmFilter('All')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            selectedFirmFilter === 'All'
              ? 'bg-emerald-500 text-slate-950 shadow-sm'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          All Deals ({EXCLUSIVE_COUPONS.length})
        </button>
        {EXCLUSIVE_COUPONS.map((coupon) => (
          <button
            key={coupon.id}
            onClick={() => setSelectedFirmFilter(coupon.firmId)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              selectedFirmFilter === coupon.firmId
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {coupon.firmName} (-{coupon.discountPercent}%)
          </button>
        ))}
      </div>

      {/* Coupons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCoupons.map((coupon) => {
          const firm = firms.find((f) => f.id === coupon.firmId);
          const isCopied = copiedCode === coupon.code;

          return (
            <div
              key={coupon.id}
              className="bg-[#0e1626] border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between hover:border-slate-700 transition-all group"
            >
              <div className="space-y-3">
                {/* Firm Header & Discount % */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={coupon.firmLogo}
                      alt={coupon.firmName}
                      className="w-9 h-9 rounded-xl object-cover bg-slate-950 border border-slate-700"
                    />
                    <div>
                      <h3 className="font-bold text-white text-sm group-hover:text-emerald-400 transition-colors">
                        {coupon.firmName}
                      </h3>
                      <div className="flex items-center gap-1 text-[11px] text-emerald-400">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Verified Active</span>
                      </div>
                    </div>
                  </div>

                  <div className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-black text-sm">
                    {coupon.discountPercent}% OFF
                  </div>
                </div>

                {/* Perks description */}
                <p className="text-xs text-slate-300 leading-relaxed min-h-[36px]">
                  {coupon.perks}
                </p>

                {/* Expiry & Usage */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>{coupon.expiryDate}</span>
                  <span>{coupon.usageCount.toLocaleString()} used this week</span>
                </div>
              </div>

              {/* Promo Code Copy Box */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-900 border border-dashed border-emerald-500/40 rounded-xl px-3 py-2 text-center font-mono font-bold text-emerald-300 tracking-wider text-sm select-all">
                    {coupon.code}
                  </div>

                  <button
                    onClick={() => handleCopy(coupon.code)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                      isCopied
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700'
                    }`}
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-4 h-4 text-slate-950" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                {firm && (
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <button
                      onClick={() => onSelectFirm(firm, firm.plans[0])}
                      className="text-slate-400 hover:text-white underline"
                    >
                      View Accounts
                    </button>

                    <a
                      href={firm.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
                    >
                      <span>Apply at checkout</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
