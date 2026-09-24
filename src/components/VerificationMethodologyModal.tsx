import React, { useEffect } from 'react';
import { X, ShieldCheck, CheckCircle2, TrendingUp, Scale, AlertCircle } from 'lucide-react';

interface VerificationMethodologyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VerificationMethodologyModal: React.FC<VerificationMethodologyModalProps> = ({
  isOpen,
  onClose,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto"
    >
      <div 
        className="relative w-full max-w-2xl my-auto bg-[#131627] border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl text-slate-100 max-h-[88vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 text-slate-300 hover:text-white p-1.5 rounded-xl bg-slate-800/80 hover:bg-purple-600/80 border border-slate-700/60 transition-all cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              How We Verify and Rank Prop Firms
            </h3>
            <p className="text-xs text-slate-400">
              Our 5-pillar mathematical evaluation methodology ensuring 100% objective transparency.
            </p>
          </div>
        </div>

        <div className="space-y-4 text-xs sm:text-sm text-slate-300">
          
          <div className="p-4 rounded-xl bg-[#191d33] border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 font-bold text-white text-sm">
              <span className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs">1</span>
              <span>Direct Payout Proof Verification (30% Weight)</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Every month, our data team verifies on-chain cryptocurrency transaction hashes, Rise payment batches, and direct bank receipts to ensure firms actively honor trader withdrawals without arbitrary delays or account closures.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#191d33] border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 font-bold text-white text-sm">
              <span className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs">2</span>
              <span>Drawdown & Rule Fairness (25% Weight)</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Firms with End of Day (EOD) or static balance drawdowns receive higher ratings than those with intraday trailing drawdowns. We penalize hidden consistency rules, mandatory stop loss mandates, and restrictive news holding windows.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#191d33] border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 font-bold text-white text-sm">
              <span className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs">3</span>
              <span>Platform & Execution Quality (20% Weight)</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              We monitor live CME Group data feeds, latency on Tradovate and NinjaTrader gateways, slippage during market opens, and uptime stability during FOMC and NFP news releases.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#191d33] border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 font-bold text-white text-sm">
              <span className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs">4</span>
              <span>Years in Operation & Capital Longevity (15% Weight)</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Firms with sustained operational track records (e.g. Topstep at 12 years, FTMO at 9 years) demonstrate capital stability and robust liquidity partner relationships.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#191d33] border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 font-bold text-white text-sm">
              <span className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs">5</span>
              <span>Community Sentiment & Trustpilot Scores (10% Weight)</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Aggregated from over 12,000 verified trader reviews across Trustpilot, Discord, and our own PFM verified review system.
            </p>
          </div>

        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors"
          >
            Got It
          </button>
        </div>

      </div>
    </div>
  );
};
