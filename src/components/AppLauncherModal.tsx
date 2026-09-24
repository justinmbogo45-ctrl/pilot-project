import React, { useEffect } from 'react';
import { X, Grid, TrendingUp, Calendar, Chrome, ShieldAlert, BookOpen, Sparkles } from 'lucide-react';

interface AppLauncherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectApp: (app: string) => void;
}

export const AppLauncherModal: React.FC<AppLauncherModalProps> = ({ isOpen, onClose, onSelectApp }) => {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const apps = [
    { name: 'Google Search Intel', icon: Sparkles, color: 'from-blue-600 to-indigo-600', desc: 'gemini-3.5-flash live web intelligence' },
    { name: 'Futures Explorer', icon: TrendingUp, color: 'from-purple-600 to-indigo-600', desc: 'Futures combines and EOD firms' },
    { name: 'Forex Matcher', icon: TrendingUp, color: 'from-emerald-600 to-teal-600', desc: 'Two-phase & instant funding' },
    { name: 'News Calendar', icon: Calendar, color: 'from-amber-500 to-rose-600', desc: 'High impact FOMC/CPI release warnings' },
    { name: 'Chrome Extension', icon: Chrome, color: 'from-cyan-500 to-blue-600', desc: 'Auto-apply MATCH coupon codes' },
    { name: 'Drawdown Calculator', icon: ShieldAlert, color: 'from-pink-600 to-purple-600', desc: 'Trailing vs static safety calculator' },
    { name: 'Trader Academy', icon: BookOpen, color: 'from-blue-600 to-cyan-500', desc: 'Guides, templates, and rules' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end sm:justify-start pt-16 sm:pl-28 px-4 bg-black/60 backdrop-blur-xs" onClick={onClose}>
      <div 
        className="w-full max-w-sm bg-[#131728] border border-slate-700/80 rounded-2xl p-5 shadow-2xl text-slate-100 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 font-bold text-white text-sm">
            <Grid className="w-4 h-4 text-purple-400" />
            <span>PFM Ecosystem</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2.5 pt-3">
          {apps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                onClick={() => {
                  onSelectApp(item.name);
                  onClose();
                }}
                className="p-3 rounded-xl bg-[#191e36] hover:bg-[#202747] border border-slate-800 hover:border-purple-500/50 cursor-pointer transition-all flex flex-col items-start text-left group"
              >
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${item.color} flex items-center justify-center text-white mb-2 shadow-sm group-hover:scale-105 transition-transform`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="font-bold text-xs text-white group-hover:text-purple-300 transition-colors">{item.name}</div>
                <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{item.desc}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
