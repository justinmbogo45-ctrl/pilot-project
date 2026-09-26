import React from 'react';
import { ComparisonMatrixModal } from '../components/ComparisonMatrixModal';
import type { PropFirm, AccountPlan } from '../types';

interface ComparePageProps {
  items: { firm: PropFirm; plan: AccountPlan }[];
  onRemoveItem: (firmId: string) => void;
  onClearAll: () => void;
  onChangePlan: (firmId: string, plan: AccountPlan) => void;
  onClose: () => void;
  currency: 'USD' | 'EUR' | 'GBP';
}

export const ComparePage: React.FC<ComparePageProps> = (props) => (
  <main className="mx-auto w-full max-w-[1240px] flex-1 px-6 py-20 sm:px-8">
    <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#3ecf8e]">Make a confident choice</p>
    <h1 className="text-3xl font-medium tracking-tight text-[#f1f3f2] sm:text-4xl">Compare challenge plans</h1>
    <p className="mt-4 max-w-2xl text-base leading-7 text-[#9a9e9b]">Select up to four firms from the catalog. Compare the plan price, targets, drawdown limits, profit split, payout timing, rating, and platforms side by side.</p>
    {props.items.length ? <div className="mt-12"><ComparisonMatrixModal {...props} embedded /></div> : <div className="mt-12 rounded-2xl border border-[#2b2e2c] bg-[#1d1f1e] px-7 py-12 text-center">
      <p className="text-lg font-medium text-[#f1f3f2]">Your comparison is empty</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#9a9e9b]">Open the firm catalog and use Compare on any firm row or card. Choose the account plan you want to examine.</p>
      <button onClick={props.onClose} className="mt-6 rounded-lg bg-[#3ecf8e] px-4 py-2.5 text-sm font-medium text-[#171918] hover:bg-[#4ade9b]">Browse firms</button>
    </div>}
  </main>
);
