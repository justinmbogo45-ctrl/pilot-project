import React, { useEffect } from 'react';
import { X, BookOpen, PlayCircle, Video, FileText, ArrowRight } from 'lucide-react';

interface TutorialsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TutorialsModal: React.FC<TutorialsModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const tutorials = [
    {
      title: 'How to Choose Your First Futures Prop Firm in 2026',
      duration: '8 min read',
      tag: 'Beginner Guide',
      desc: 'Understand evaluation rules, daily vs trailing drawdown, and payout frequencies before purchasing.',
    },
    {
      title: 'Passing the 1-Step Combine with Tradovate & NinjaTrader',
      duration: '14 min video',
      tag: 'Execution Strategy',
      desc: 'Risk management protocols, position sizing on /ES & /NQ, and avoiding bracket order liquidations.',
    },
    {
      title: 'Understanding End of Day (EOD) vs Live Trailing Drawdown',
      duration: '6 min read',
      tag: 'Risk Rules',
      desc: 'Why Lucid Trading and Tradeify EOD drawdown provides higher pass rates than intraday high-water marks.',
    },
  ];

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto"
    >
      <div
        className="relative w-full max-w-xl my-auto bg-[#1d1f1e] border border-[#333633]/80 rounded-2xl p-6 sm:p-8 text-slate-100 max-h-[88vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 text-[#9a9e9b] hover:text-[#f1f3f2] p-1.5 rounded-xl bg-[#222522]/80 hover:bg-emerald-600/80 border border-[#333633]/60 transition-all cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center text-white">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#f1f3f2] tracking-tight">Signal Props Academy</h3>
            <p className="text-xs text-[#747976]">Master prop firm evaluations, contract margins, and withdrawal strategies.</p>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          {tutorials.map((tut, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-[#222522] border border-[#2b2e2c] hover:border-cyan-500/40 transition-colors duration-150">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-[10px] font-semibold">
                  {tut.tag}
                </span>
                <span className="text-[11px] text-[#747976]">{tut.duration}</span>
              </div>
              <div className="font-bold text-[#f1f3f2] text-sm mt-1">{tut.title}</div>
              <p className="text-xs text-[#747976] mt-1 leading-relaxed">{tut.desc}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-colors duration-150"
          >
            Close Tutorials
          </button>
        </div>
      </div>
    </div>
  );
};
