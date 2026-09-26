import React, { useEffect } from 'react';
import { X, Briefcase, CheckCircle2, ArrowRight } from 'lucide-react';

interface WeAreHiringModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WeAreHiringModal: React.FC<WeAreHiringModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const positions = [
    { title: 'Senior Quantitative Data Engineer', location: 'Remote (Worldwide)', dept: 'Data & Verification' },
    { title: 'Prop Trading Community Lead', location: 'Remote (US / Europe)', dept: 'Community & Content' },
    { title: 'Full Stack TypeScript / React Developer', location: 'Remote', dept: 'Engineering' },
  ];

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto"
    >
      <div
        className="relative w-full max-w-lg my-auto bg-[#1d1f1e] border border-[#333633]/80 rounded-2xl p-6 sm:p-8 text-slate-100 max-h-[88vh] overflow-y-auto"
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
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-500 to-emerald-600 flex items-center justify-center text-white">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#f1f3f2] tracking-tight">We're Hiring at PFM</h3>
            <p className="text-xs text-[#747976]">Join the team building the financial data layer for proprietary trading.</p>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          {positions.map((pos, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-[#222522] border border-[#2b2e2c] hover:border-[#333633] transition-colors duration-150 flex items-center justify-between">
              <div>
                <div className="font-bold text-[#f1f3f2] text-xs sm:text-sm">{pos.title}</div>
                <div className="text-[11px] text-[#747976] mt-0.5">{pos.dept} • {pos.location}</div>
              </div>
              <a
                href="mailto:careers@propfirmmatch.com"
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1 transition-colors duration-150"
              >
                Apply <ArrowRight className="w-3 h-3" />
              </a>
            </div>
          ))}
        </div>

        <div className="text-center text-[11px] text-[#747976]">
          Interested in working with us? Send your portfolio to <span className="text-white font-bold">careers@propfirmmatch.com</span>
        </div>
      </div>
    </div>
  );
};
