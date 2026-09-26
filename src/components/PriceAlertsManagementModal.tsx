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
 <div className="bg-[#1a1c1b] border border-emerald-500/40 rounded-2xl w-full max-w-2xl overflow-hidden text-[#f1f3f2] flex flex-col max-h-[90vh]">
 
 {saveError && <p role="alert" className="text-red-300 p-3">{saveError}</p>}
 {/* Header */}
 <div className="px-6 py-4 bg-gradient-to-r from-emerald-950/60 via-emerald-950/40 to-emerald-950/60 border-b border-emerald-500/30 flex items-center justify-between">
 <div className="flex items-center gap-3">
 <div className="w-9 h-9 rounded-xl bg-emerald-600/30 border border-emerald-500/50 flex items-center justify-center text-[#3ecf8e]">
 <Bell className="w-5 h-5" />
 </div>
 <div>
 <div className="flex items-center gap-2">
 <h3 className="font-bold text-white text-base">Subscribed Price & Promo Alerts</h3>
 <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-[#3ecf8e] text-[10px] font-bold border border-emerald-500/40">
 {alerts.filter((a) => a.active).length} Active
 </span>
 </div>
 <p className="text-xs text-[#747976]">
 Manage your saved price and discount alert preferences.
 </p>
 </div>
 </div>
 <div className="flex items-center gap-2">
 <button
 onClick={onOpenCreateModal}
 className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-[#3ecf8e] text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
 >
 <Plus className="w-3.5 h-3.5" />
 <span>Track New Plan</span>
 </button>
 <button
 onClick={onClose}
 className="p-1.5 rounded-lg text-[#747976] hover:text-white hover:bg-[#222522] transition-colors duration-150"
 >
 <X className="w-5 h-5" />
 </button>
 </div>
 </div>

 {/* Filter Pills */}
 <div className="px-6 py-2.5 bg-[#1d1f1e]/60 border-b border-[#2b2e2c]/80 flex items-center justify-between">
 <div className="flex items-center gap-2">
 <button
 onClick={() => setActiveFilter('all')}
 className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
 activeFilter === 'all'
 ? 'bg-emerald-600/30 text-emerald-200 border border-emerald-500/40'
 : 'text-[#747976] hover:text-white'
 }`}
 >
 All Alerts ({alerts.length})
 </button>
 <button
 onClick={() => setActiveFilter('active')}
 className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
 activeFilter === 'active'
 ? 'bg-emerald-500/20 text-[#3ecf8e] border border-emerald-500/40'
 : 'text-[#747976] hover:text-white'
 }`}
 >
 Active ({alerts.filter((a) => a.active).length})
 </button>
 <button
 onClick={() => setActiveFilter('paused')}
 className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
 activeFilter === 'paused'
 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
 : 'text-[#747976] hover:text-white'
 }`}
 >
 Paused ({alerts.filter((a) => !a.active).length})
 </button>
 </div>

 <div className="text-[11px] text-[#747976] hidden sm:flex items-center gap-1.5">
 <ShieldCheck className="w-3.5 h-3.5 text-[#3ecf8e]" />
 <span>Saved to your account</span>
 </div>
 </div>

 {/* Alert List */}
 <div className="p-6 overflow-y-auto space-y-3.5 flex-1">
 {filteredAlerts.length === 0 ? (
 <div className="py-12 text-center space-y-3">
 <div className="w-14 h-14 rounded-2xl bg-emerald-900/20 border border-emerald-700/30 flex items-center justify-center mx-auto text-[#3ecf8e]">
 <Bell className="w-7 h-7 opacity-60" />
 </div>
 <h4 className="font-bold text-white text-sm">No Price Alerts Found</h4>
 <p className="text-xs text-[#747976] max-w-sm mx-auto">
 {activeFilter === 'all'
 ? "You haven't subscribed to any price change notifications yet. Choose any prop firm plan to monitor price drops and exclusive flash promos."
 : `No ${activeFilter} price alerts.`}
 </p>
 <button
 onClick={onOpenCreateModal}
 className="mt-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-600 hover:from-emerald-500 hover:to-emerald-500 text-white font-bold text-xs inline-flex items-center gap-1.5"
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
 ? 'bg-[#1d1f1e]/80 border-emerald-500/30 hover:border-emerald-500/60'
 : 'bg-[#1d1f1e]/30 border-[#2b2e2c]/80 opacity-70'
 }`}
 >
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
 
 {/* Firm info & Plan info */}
 <div className="flex items-start gap-3">
 {alert.firmLogo ? (
 <img
 src={alert.firmLogo}
 alt={alert.firmName}
 className="w-10 h-10 rounded-xl object-cover border border-[#333633] mt-0.5"
 />
 ) : (
 <div className="w-10 h-10 rounded-xl bg-emerald-900/50 border border-emerald-600 flex items-center justify-center text-[#3ecf8e] font-bold">
 {alert.firmName.charAt(0)}
 </div>
 )}

 <div className="space-y-1">
 <div className="flex items-center gap-2">
 <span className="font-bold text-white text-sm hover:text-[#3ecf8e] cursor-pointer"
 onClick={() => matchedFirm && matchedPlan && onSelectFirmDetails(matchedFirm, matchedPlan)}
 >
 {alert.firmName}
 </span>
 <span className="px-2 py-0.5 rounded bg-[#222522] text-[#3ecf8e] font-semibold text-[10px] border border-[#333633]">
 {alert.planName}
 </span>
 <span
 className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
 alert.active
 ? 'bg-emerald-500/20 text-[#3ecf8e] border border-emerald-500/30'
 : 'bg-slate-700 text-[#747976]'
 }`}
 >
 {alert.active ? 'ACTIVE' : 'PAUSED'}
 </span>
 </div>

 <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#747976]">
 <div>
 Current Price: <span className="font-bold text-white">{alert.currentPrice ?? 'Not provided'} {alert.currency || ''}</span>
 </div>

 {alert.targetPrice && (
 <div className="flex items-center gap-1 text-[#3ecf8e]">
 <TrendingDown className="w-3.5 h-3.5" />
 <span>Target: <strong className="text-white">{alert.targetPrice} {alert.currency || ''}</strong></span>
 </div>
 )}

 <div className="text-[11px] text-[#747976]">
 Destination: <span className="text-[#9a9e9b]">{alert.userEmail}</span>
 </div>
 </div>

 {/* Badges row */}
 <div className="flex flex-wrap items-center gap-2 pt-1 text-[10px]">
 <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/40 text-[#3ecf8e] font-medium flex items-center gap-1">
 <Tag className="w-3 h-3" />
 {alert.alertType === 'price_drop'
 ? `Alert on drop below $${alert.targetPrice || alert.currentPrice}`
 : alert.alertType === 'discount_increase'
 ? 'Alert on new promo codes'
 : 'Alert on any price change'}
 </span>

 <span className="px-2 py-0.5 rounded bg-[#222522]/80 text-[#9a9e9b]">
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
 className="px-2.5 py-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-[#3ecf8e] hover:text-white text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
 >
 {testingId === alert.id ? (
 <>
 <Check className="w-3 h-3 text-[#3ecf8e] animate-bounce" />
 <span>Simulated!</span>
 </>
 ) : (
 <>
 <Play className="w-3 h-3 text-[#3ecf8e]" />
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
 ? 'bg-emerald-500/10 border-emerald-500/30 text-[#3ecf8e] hover:bg-emerald-500/20'
 : 'bg-[#222522] border-[#333633] text-[#747976] hover:text-white'
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
 <div className="px-6 py-3 bg-[#1d1f1e]/80 border-t border-[#2b2e2c] flex items-center justify-between text-xs text-[#747976]">
 <div className="flex items-center gap-1.5">
 <Sparkles className="w-3.5 h-3.5 text-amber-400" />
 <span>Earn 25 Loyalty Points each time you subscribe to a new plan alert.</span>
 </div>
 <button
 onClick={onClose}
 className="px-3 py-1 rounded-lg bg-[#222522] hover:bg-slate-700 text-[#9a9e9b] text-xs font-semibold"
 >
 Close
 </button>
 </div>

 </div>
 </div>
 );
};
