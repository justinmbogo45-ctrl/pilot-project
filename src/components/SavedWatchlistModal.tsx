import React, { useEffect } from 'react';
import { X, Bookmark, ExternalLink, Trash2, Scale } from 'lucide-react';
import { PropFirm, AccountPlan } from '../types';

interface SavedWatchlistModalProps {
  savedFirmIds: string[];
  firms: PropFirm[];
  onToggleSave: (firmId: string) => void;
  onOpenDetails: (firm: PropFirm, plan: AccountPlan) => void;
  onToggleCompare: (firm: PropFirm, plan: AccountPlan) => void;
  comparedFirmIds: string[];
  onClose: () => void;
  currency: 'USD' | 'EUR' | 'GBP';
}

export const SavedWatchlistModal: React.FC<SavedWatchlistModalProps> = ({
  savedFirmIds,
  firms,
  onToggleSave,
  onOpenDetails,
  onToggleCompare,
  comparedFirmIds,
  onClose,
  currency,
}) => {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const savedFirms = firms.filter((f) => savedFirmIds.includes(f.id));

  const currencySymbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '£';
  const currencyRate = currency === 'USD' ? 1 : currency === 'EUR' ? 0.92 : 0.79;

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
    >
      <div 
        className="bg-[#0e1626] border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-amber-400 fill-amber-400" />
            <h3 className="font-extrabold text-white text-base">Your Saved Watchlist ({savedFirms.length})</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {savedFirms.length === 0 ? (
          <div className="py-8 text-center space-y-2">
            <Bookmark className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-sm font-semibold text-slate-300">No saved prop firms yet</p>
            <p className="text-xs text-slate-500">Click the bookmark icon on any firm card to save it for later.</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            {savedFirms.map((firm) => {
              const defaultPlan = firm.plans[0];
              const isCompared = comparedFirmIds.includes(firm.id);

              return (
                <div
                  key={firm.id}
                  className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={firm.logo}
                      alt={firm.name}
                      className="w-10 h-10 rounded-lg object-cover bg-slate-950 border border-slate-700"
                    />
                    <div>
                      <h4 className="font-bold text-white text-xs">{firm.name}</h4>
                      <div className="text-[11px] text-slate-400">
                        {defaultPlan.label} from{' '}
                        <strong className="text-emerald-400">
                          {currencySymbol}{Math.round(defaultPlan.discountedPrice * currencyRate)}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onToggleCompare(firm, defaultPlan)}
                      title={isCompared ? 'In comparison' : 'Add to compare'}
                      className={`p-1.5 rounded text-xs ${
                        isCompared ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      <Scale className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        onOpenDetails(firm, defaultPlan);
                        onClose();
                      }}
                      className="text-xs px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-semibold"
                    >
                      Rules
                    </button>

                    <button
                      onClick={() => onToggleSave(firm.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
