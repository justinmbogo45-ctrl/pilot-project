import React, { useState, useEffect } from 'react';
import { 
  X, 
  Bell, 
  Trash2, 
  Power, 
  Sparkles, 
  TrendingDown, 
  Plus, 
  Play, 
  Check, 
  ExternalLink,
  ShieldCheck,
  Tag
} from 'lucide-react';
import { PriceAlert, PropFirm, AccountPlan } from '../types';
import { UserProfileData, updatePriceAlert, deletePriceAlert } from '../lib/api';

interface PriceAlertsManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: PriceAlert[];
  allFirms: PropFirm[];
  userProfile?: UserProfileData | null;
  onOpenCreateModal: () => void;
  onSimulatePriceDrop: (alert: PriceAlert) => void;
  onSelectFirmDetails: (firm: PropFirm, plan: AccountPlan) => void;
  onOpenAuth?: () => void;
  onAlertUpdated?: (updated: PriceAlert) => void;
  onAlertDeleted?: (alertId: string) => void;
}

export const PriceAlertsManagementModal: React.FC<PriceAlertsManagementModalProps> = ({
  isOpen,
  onClose,
  alerts,
  allFirms,
  userProfile,
  onOpenCreateModal,
  onSimulatePriceDrop,
  onSelectFirmDetails,
  onOpenAuth,
  onAlertUpdated,
  onAlertDeleted,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'paused'>('all');
  const [saveError, setSaveError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredAlerts = alerts.filter((a) => {
    if (activeFilter === 'active') return a.active;
    if (activeFilter === 'paused') return !a.active;
    return true;
  });

  const handleToggleActive = async (alert: PriceAlert) => {
    const updated = { ...alert, active: !alert.active };
    try {
      await updatePriceAlert(alert.id, { active: !alert.active });
      onAlertUpdated?.(updated);
    } catch (err) {
      setSaveError((err as Error).message);
    }
  };

  const handleDelete = async (alertId: string) => {
    setDeletingId(alertId);
    try {
      await deletePriceAlert(alertId);
      onAlertDeleted?.(alertId);
    } catch (err) {
      setSaveError((err as Error).message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleTestSimulate = (alert: PriceAlert) => {
    setTestingId(alert.id);
    onSimulatePriceDrop(alert);
    setTimeout(() => {
      setTestingId(null);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0f1222] border border-purple-500/40 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
        
        {saveError && <p role="alert" className="text-red-300 p-3">{saveError}</p>}
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-purple-950/60 via-indigo-950/40 to-purple-950/60 border-b border-purple-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-600/30 border border-purple-500/50 flex items-center justify-center text-purple-300">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-white text-base">Subscribed Price & Promo Alerts</h3>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold border border-purple-500/40">
                  {alerts.filter((a) => a.active).length} Active
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Manage your saved price and discount alert preferences.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenCreateModal}
              className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Track New Plan</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="px-6 py-2.5 bg-slate-900/60 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeFilter === 'all'
                  ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Alerts ({alerts.length})
            </button>
            <button
              onClick={() => setActiveFilter('active')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeFilter === 'active'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Active ({alerts.filter((a) => a.active).length})
            </button>
            <button
              onClick={() => setActiveFilter('paused')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeFilter === 'paused'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Paused ({alerts.filter((a) => !a.active).length})
            </button>
          </div>

          <div className="text-[11px] text-slate-400 hidden sm:flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Saved to your account</span>
          </div>
        </div>

        {/* Alert List */}
        <div className="p-6 overflow-y-auto space-y-3.5 flex-1">
          {filteredAlerts.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-purple-900/20 border border-purple-700/30 flex items-center justify-center mx-auto text-purple-400">
                <Bell className="w-7 h-7 opacity-60" />
              </div>
              <h4 className="font-bold text-white text-sm">No Price Alerts Found</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {activeFilter === 'all'
                  ? "You haven't subscribed to any price change notifications yet. Choose any prop firm plan to monitor price drops and exclusive flash promos."
                  : `No ${activeFilter} price alerts.`}
              </p>
              <button
                onClick={onOpenCreateModal}
                className="mt-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Your First Price Alert (+25 LP)</span>
              </button>
            </div>
          ) : (
            filteredAlerts.map((alert) => {
              const matchedFirm = allFirms.find((f) => f.id === alert.firmId);
              const matchedPlan = matchedFirm?.plans?.find((p) => p.id === alert.planId) || matchedFirm?.plans?.[0];

              return (
                <div
                  key={alert.id}
                  className={`p-4 rounded-xl border transition-all ${
                    alert.active
                      ? 'bg-slate-900/80 border-purple-500/30 hover:border-purple-500/60 shadow-md'
                      : 'bg-slate-900/30 border-slate-800/80 opacity-70'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    
                    {/* Firm info & Plan info */}
                    <div className="flex items-start gap-3">
                      {alert.firmLogo ? (
                        <img
                          src={alert.firmLogo}
                          alt={alert.firmName}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-700 mt-0.5"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-purple-900/50 border border-purple-600 flex items-center justify-center text-purple-300 font-bold">
                          {alert.firmName.charAt(0)}
                        </div>
                      )}

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-white text-sm hover:text-purple-300 cursor-pointer"
                            onClick={() => matchedFirm && matchedPlan && onSelectFirmDetails(matchedFirm, matchedPlan)}
                          >
                            {alert.firmName}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-purple-300 font-semibold text-[10px] border border-slate-700">
                            {alert.planName}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                              alert.active
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-slate-700 text-slate-400'
                            }`}
                          >
                            {alert.active ? 'ACTIVE' : 'PAUSED'}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                          <div>
                            Current Price: <span className="font-bold text-white">{alert.currentPrice ?? 'Not provided'} {alert.currency || ''}</span>
                          </div>

                          {alert.targetPrice && (
                            <div className="flex items-center gap-1 text-emerald-400">
                              <TrendingDown className="w-3.5 h-3.5" />
                              <span>Target: <strong className="text-white">{alert.targetPrice} {alert.currency || ''}</strong></span>
                            </div>
                          )}

                          <div className="text-[11px] text-slate-400">
                            Destination: <span className="text-slate-300">{alert.userEmail}</span>
                          </div>
                        </div>

                        {/* Badges row */}
                        <div className="flex flex-wrap items-center gap-2 pt-1 text-[10px]">
                          <span className="px-2 py-0.5 rounded bg-purple-950/60 border border-purple-800/40 text-purple-300 font-medium flex items-center gap-1">
                            <Tag className="w-3 h-3" />
                            {alert.alertType === 'price_drop'
                              ? `Alert on drop below $${alert.targetPrice || alert.currentPrice}`
                              : alert.alertType === 'discount_increase'
                              ? 'Alert on new promo codes'
                              : 'Alert on any price change'}
                          </span>

                          <span className="px-2 py-0.5 rounded bg-slate-800/80 text-slate-300">
                            Channel: {alert.channel === 'both' ? 'Email + In-App' : alert.channel.toUpperCase()}
                          </span>

                          {alert.notifyOnDiscount && (
                            <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300 font-medium">
                              + Promo Codes
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {/* Simulate Price Drop Button */}
                      <button
                        type="button"
                        title="Simulate a price drop alert to test notifications"
                        disabled={testingId === alert.id}
                        onClick={() => handleTestSimulate(alert)}
                        className="px-2.5 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-300 hover:text-white text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                      >
                        {testingId === alert.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400 animate-bounce" />
                            <span>Simulated!</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3 h-3 text-indigo-400" />
                            <span>Test Alert</span>
                          </>
                        )}
                      </button>

                      {/* Toggle Active / Pause */}
                      <button
                        type="button"
                        onClick={() => handleToggleActive(alert)}
                        title={alert.active ? 'Pause this alert' : 'Activate this alert'}
                        className={`p-1.5 rounded-lg border transition-all ${
                          alert.active
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                        }`}
                      >
                        <Power className="w-4 h-4" />
                      </button>

                      {/* Delete alert */}
                      <button
                        type="button"
                        onClick={() => handleDelete(alert.id)}
                        disabled={deletingId === alert.id}
                        title="Delete this alert"
                        className="p-1.5 rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all cursor-pointer disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 bg-slate-900/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Earn 25 Loyalty Points each time you subscribe to a new plan alert.</span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
