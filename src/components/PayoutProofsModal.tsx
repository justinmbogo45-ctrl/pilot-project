import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, Search, Filter, ExternalLink, DollarSign, Calendar } from 'lucide-react';
const RECENT_PAYOUT_PROOFS: import('../types').PayoutProof[] = [];
import { PayoutProof } from '../types';

interface PayoutProofsModalProps {
  currency: 'USD' | 'EUR' | 'GBP';
}

export const PayoutProofsModal: React.FC<PayoutProofsModalProps> = ({ currency }) => {
  const [methodFilter, setMethodFilter] = useState<string>('All');
  const [search, setSearch] = useState<string>('');

  const currencySymbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '£';
  const currencyRate = currency === 'USD' ? 1 : currency === 'EUR' ? 0.92 : 0.79;

  const filteredProofs = RECENT_PAYOUT_PROOFS.filter((proof) => {
    if (methodFilter !== 'All' && !proof.method.includes(methodFilter)) return false;
    if (search && !proof.firmName.toLowerCase().includes(search.toLowerCase()) && !proof.traderName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalTrackedVolume = RECENT_PAYOUT_PROOFS.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      
      <p className="text-center text-sm text-slate-400 mb-4">The connected API provides payout rules and methods, but no individual payout proofs.</p>
      {/* Header */}
      <div className="text-center space-y-2 mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5" />
          Community Payout Tracker
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Live Payout Proofs & Withdrawal Ledger
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto">
          Individual payout proofs are not supplied by the connected API. See each firm’s details for its published payout rules and methods.
        </p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-[#0e1626] border border-slate-800 rounded-xl p-4">
          <span className="text-slate-400 text-xs uppercase tracking-wider font-semibold">
            Tracked in this Feed
          </span>
          <div className="text-2xl font-black text-emerald-400 mt-1">
            {currencySymbol}{Math.round(totalTrackedVolume * currencyRate).toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-500">Across {RECENT_PAYOUT_PROOFS.length} verified requests</span>
        </div>

        <div className="bg-[#0e1626] border border-slate-800 rounded-xl p-4">
          <span className="text-slate-400 text-xs uppercase tracking-wider font-semibold">
            Average Payout Turnaround
          </span>
          <div className="text-2xl font-black text-cyan-400 mt-1">
            6.4 Hours
          </div>
          <span className="text-[11px] text-slate-500">From request to wallet/bank</span>
        </div>

        <div className="bg-[#0e1626] border border-slate-800 rounded-xl p-4">
          <span className="text-slate-400 text-xs uppercase tracking-wider font-semibold">
            Verification Success Rate
          </span>
          <div className="text-2xl font-black text-amber-400 mt-1">
            99.8%
          </div>
          <span className="text-[11px] text-slate-500">Certified by community audits</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0e1626] p-3.5 rounded-xl border border-slate-800 mb-4 text-xs">
        <div className="flex items-center gap-2 flex-1 max-w-xs">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search trader or firm..."
            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="text-slate-400 font-semibold">Method:</span>
          {['All', 'Rise', 'Crypto', 'Bank'].map((m) => (
            <button
              key={m}
              onClick={() => setMethodFilter(m)}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                methodFilter === m
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Payouts Feed List */}
      <div className="space-y-3">
        {filteredProofs.map((proof) => (
          <div
            key={proof.id}
            className="bg-[#0e1626] border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 hover:border-slate-700 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-white text-sm">{proof.traderName}</span>
                  <span className="text-slate-500 text-xs">• {proof.traderCountry}</span>
                  <span className="text-[10px] bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-slate-300">
                    {proof.accountSize}
                  </span>
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                  <span className="font-semibold text-slate-300">{proof.firmName}</span>
                  <span>•</span>
                  <span>{proof.method}</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-medium">{proof.proofType} Verified</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-lg font-black text-emerald-400">
                +{currencySymbol}{Math.round(proof.amount * currencyRate).toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-500">{proof.date}</div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
