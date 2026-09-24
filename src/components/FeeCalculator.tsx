import React, { useState } from 'react';
import { Calculator, DollarSign, TrendingUp, Sparkles, Check, ArrowRight } from 'lucide-react';
import { PropFirm, AccountPlan } from '../types';

interface FeeCalculatorProps {
  firms: PropFirm[];
  initialFirm?: PropFirm | null;
  initialPlan?: AccountPlan | null;
  currency: 'USD' | 'EUR' | 'GBP';
}

export const FeeCalculator: React.FC<FeeCalculatorProps> = ({
  firms,
  initialFirm,
  initialPlan,
  currency,
}) => {
  // Selected firm & plan or custom values
  const [selectedFirmId, setSelectedFirmId] = useState<string>(
    initialFirm?.id || firms[0]?.id || ''
  );

  const currentFirm = firms.find((f) => f.id === selectedFirmId) || firms[0];

  const [selectedPlanId, setSelectedPlanId] = useState<string>(
    initialPlan?.id || currentFirm?.plans[3]?.id || currentFirm?.plans[0]?.id || ''
  );

  const currentPlan = currentFirm.plans.find((p) => p.id === selectedPlanId) || currentFirm.plans[0];

  // Customizable inputs
  const [customAccountSize, setCustomAccountSize] = useState<number>(currentPlan.size);
  const [customFee, setCustomFee] = useState<number>(currentPlan.discountedPrice);
  const [customMaxDrawdown, setCustomMaxDrawdown] = useState<number>(currentPlan.maxDrawdownAmount);
  const [customProfitSplit, setCustomProfitSplit] = useState<number>(currentPlan.profitSplit);
  const [expectedMonthlyProfitPercent, setExpectedMonthlyProfitPercent] = useState<number>(6); // 6% monthly gain
  const [includeFeeRefund, setIncludeFeeRefund] = useState<boolean>(currentPlan.refundable);

  // Sync when plan changes
  const handleSelectPlan = (plan: AccountPlan) => {
    setSelectedPlanId(plan.id);
    setCustomAccountSize(plan.size);
    setCustomFee(plan.discountedPrice);
    setCustomMaxDrawdown(plan.maxDrawdownAmount);
    setCustomProfitSplit(plan.profitSplit);
    setIncludeFeeRefund(plan.refundable);
  };

  const handleSelectFirm = (firmId: string) => {
    setSelectedFirmId(firmId);
    const firm = firms.find((f) => f.id === firmId);
    if (firm && firm.plans.length > 0) {
      handleSelectPlan(firm.plans[0]);
    }
  };

  // Calculations
  const costPerThousandDrawdown = customMaxDrawdown > 0 
    ? (customFee / customMaxDrawdown) * 1000 
    : 0;

  const totalGrossProfit = (customAccountSize * expectedMonthlyProfitPercent) / 100;
  const traderProfitCut = (totalGrossProfit * customProfitSplit) / 100;
  const totalFirstPayout = traderProfitCut + (includeFeeRefund ? customFee : 0);
  const netRoiOnFee = customFee > 0 ? ((totalFirstPayout - customFee) / customFee) * 100 : 0;
  const breakEvenGrossProfit = (customProfitSplit > 0 && !includeFeeRefund) 
    ? (customFee / (customProfitSplit / 100)) 
    : 0;

  const riskLeverageRatio = customFee > 0 ? (customMaxDrawdown / customFee).toFixed(1) : '0';

  const currencySymbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '£';
  const currencyRate = currency === 'USD' ? 1 : currency === 'EUR' ? 0.92 : 0.79;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      
      {/* Header */}
      <div className="text-center space-y-2 mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
          <Calculator className="w-3.5 h-3.5" />
          True Cost & Drawdown ROI Engine
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Challenge Fee & Payout ROI Calculator
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto">
          Analyze what you actually pay per dollar of maximum loss allowance, and project your take-home payouts after profit split and fee refund.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Preset Loader & Controls (5 cols) */}
        <div className="lg:col-span-5 bg-[#0e1626] border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
          <div className="border-b border-slate-800/80 pb-3">
            <h3 className="font-bold text-white text-sm">Preset Prop Firm & Plan</h3>
            <p className="text-xs text-slate-400">Load verified challenge parameters automatically:</p>
          </div>

          {/* Firm Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Select Prop Firm</label>
            <select
              value={selectedFirmId}
              onChange={(e) => handleSelectFirm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-medium text-slate-200 focus:outline-none"
            >
              {firms.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.trustpilotScore}★)
                </option>
              ))}
            </select>
          </div>

          {/* Plan Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Select Account Size</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
              {currentFirm.plans.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleSelectPlan(p)}
                  className={`py-1.5 rounded-lg text-xs font-bold border transition-all ${
                    selectedPlanId === p.id
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-850'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-800/80 pt-4 space-y-4">
            <h4 className="font-bold text-slate-300 text-xs uppercase tracking-wider">Custom Adjustment</h4>

            {/* Expected monthly performance slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-semibold">Expected Monthly Gain:</span>
                <span className="text-emerald-400 font-extrabold text-sm">{expectedMonthlyProfitPercent}%</span>
              </div>
              <input
                type="range"
                min={2}
                max={20}
                step={0.5}
                value={expectedMonthlyProfitPercent}
                onChange={(e) => setExpectedMonthlyProfitPercent(parseFloat(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Conservative (2%)</span>
                <span>Target (6%)</span>
                <span>Aggressive (20%)</span>
              </div>
            </div>

            {/* Fee refund toggle */}
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={includeFeeRefund}
                onChange={(e) => setIncludeFeeRefund(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-emerald-500"
              />
              <span>Include 100% Challenge Fee Refund on 1st payout</span>
            </label>
          </div>
        </div>

        {/* Right Column: Calculated Metrics & ROI Projection (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Main Key Metric Hero Card */}
          <div className="bg-gradient-to-br from-[#0e1626] to-[#09101d] border border-emerald-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs uppercase tracking-wider font-bold text-emerald-400">
                  True Capital Efficiency
                </span>
                <div className="text-3xl sm:text-4xl font-black text-white mt-1">
                  ${costPerThousandDrawdown.toFixed(2)}
                  <span className="text-sm font-normal text-slate-400 ml-1.5">/ $1k Max Loss</span>
                </div>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                  You are paying {currencySymbol}{Math.round(customFee * currencyRate)} for{' '}
                  {currencySymbol}{(customMaxDrawdown * currencyRate).toLocaleString()} of allowed loss buffer.
                </p>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 px-4 py-3 rounded-xl text-center">
                <span className="text-[11px] text-slate-400 uppercase font-semibold block">Risk Leverage</span>
                <span className="text-2xl font-black text-cyan-400">{riskLeverageRatio}x</span>
                <span className="text-[10px] text-slate-500 block">Buffer vs Fee</span>
              </div>
            </div>
          </div>

          {/* First Payout Projection Breakdown */}
          <div className="bg-[#0e1626] border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div>
                <h3 className="font-bold text-white text-sm">Projected 1st Payout on {expectedMonthlyProfitPercent}% Month</h3>
                <p className="text-xs text-slate-400">On a {currencySymbol}{customAccountSize.toLocaleString()} funded account:</p>
              </div>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                +{netRoiOnFee.toFixed(0)}% ROI on Challenge Fee
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-800/50">
                <span className="text-slate-400">Total Account Profit ({expectedMonthlyProfitPercent}%):</span>
                <span className="font-bold text-white">
                  {currencySymbol}{Math.round(totalGrossProfit * currencyRate).toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-800/50">
                <span className="text-slate-400">Trader Profit Split ({customProfitSplit}%):</span>
                <span className="font-bold text-emerald-400">
                  {currencySymbol}{Math.round(traderProfitCut * currencyRate).toLocaleString()}
                </span>
              </div>

              {includeFeeRefund && (
                <div className="flex justify-between py-1.5 border-b border-slate-800/50">
                  <span className="text-slate-400">Challenge Fee Refund (100%):</span>
                  <span className="font-bold text-cyan-400">
                    +{currencySymbol}{Math.round(customFee * currencyRate)}
                  </span>
                </div>
              )}

              <div className="flex justify-between py-2 bg-slate-900/60 px-3 rounded-xl">
                <span className="font-bold text-slate-200 text-sm">Estimated First Payout Check:</span>
                <span className="font-black text-emerald-400 text-base">
                  {currencySymbol}{Math.round(totalFirstPayout * currencyRate).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
              <span>
                Break-even target:{' '}
                <strong className="text-white">
                  {includeFeeRefund ? '0% (Refunded)' : `${currencySymbol}${Math.round(breakEvenGrossProfit * currencyRate)}`}
                </strong>
              </span>
              <a
                href={currentFirm.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
              >
                <span>Claim this account</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
