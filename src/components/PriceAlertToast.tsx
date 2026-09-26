import React from 'react';
import { Bell, Tag, ArrowRight, X, Sparkles } from 'lucide-react';
import { PriceAlert, PropFirm, AccountPlan } from '../types';

interface PriceAlertToastProps {
 notification?: {
 alert: PriceAlert;
 simulatedNewPrice: number;
 discountPercent: number;
 couponCode: string;
 } | null;
 alert?: PriceAlert;
 simulatedNewPrice?: number;
 discountPercent?: number;
 couponCode?: string;
 onDismiss?: () => void;
 onClose?: () => void;
 onViewDeal: (firmId: string, planId: string) => void;
}

export const PriceAlertToast: React.FC<PriceAlertToastProps> = ({
 notification,
 alert: propAlert,
 simulatedNewPrice: propSimulatedNewPrice,
 discountPercent: propDiscountPercent,
 couponCode: propCouponCode,
 onDismiss,
 onClose,
 onViewDeal,
}) => {
 const alert = notification?.alert || propAlert;
 const simulatedNewPrice = notification?.simulatedNewPrice ?? propSimulatedNewPrice ?? 0;
 const discountPercent = notification?.discountPercent ?? propDiscountPercent ?? 0;
 const couponCode = notification?.couponCode ?? propCouponCode ?? 'MATCH';
 const handleClose = onDismiss || onClose || (() => {});

 if (!alert) return null;

 return (
 <div className="fixed top-20 right-4 sm:right-6 z-50 max-w-md w-full animate-in slide-in-from-top-4 duration-300">
 <div className="bg-[#1d1f1e] border-2 border-emerald-500/80 rounded-2xl p-4 shadow-emerald-950/50 text-white relative overflow-hidden backdrop-blur-md">
 
 {/* Top glow accent */}
 <div className="absolute -top-10 -right-10 w-28 h-28 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />

 <div className="flex items-start justify-between gap-3">
 <div className="flex items-start gap-3">
 <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-[#3ecf8e] shrink-0">
 <Bell className="w-5 h-5 animate-bounce" />
 </div>

 <div className="space-y-1">
 <div className="flex items-center gap-1.5">
 <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-[#3ecf8e] text-[10px] font-bold border border-emerald-500/40 flex items-center gap-1">
 <Sparkles className="w-3 h-3" />
 PRICE DROP ALERT
 </span>
 <span className="text-[10px] text-[#747976]">Just now</span>
 </div>

 <h4 className="text-sm font-bold text-white">
 {alert.firmName} {alert.planName}
 </h4>

 <p className="text-xs text-[#9a9e9b]">
 Price dropped from{' '}
 <span className="line-through text-[#747976]">{alert.currentPrice} {alert.currency || ''}</span> to{' '}
 <span className="font-bold text-[#3ecf8e] text-sm">
 {simulatedNewPrice} {alert.currency || ''}
 </span>{' '}
 <span className="text-[#3ecf8e] font-bold">(-{discountPercent}%)</span>!
 </p>

 <div className="pt-1.5 flex items-center gap-2">
 <span className="px-2 py-1 rounded-lg bg-emerald-950/80 border border-emerald-600/50 text-[#3ecf8e] font-mono text-[11px] font-bold flex items-center gap-1">
 <Tag className="w-3 h-3 text-[#3ecf8e]" />
 {couponCode}
 </span>

 <button
 onClick={() => {
 onViewDeal(alert.firmId, alert.planId);
 handleClose();
 }}
 className="px-3 py-1 rounded-lg bg-[#3ecf8e] hover:bg-[#4eda9a] text-[#171918] font-bold text-xs flex items-center gap-1 transition-all cursor-pointer"
 >
 <span>View Deal</span>
 <ArrowRight className="w-3.5 h-3.5" />
 </button>
 </div>
 </div>
 </div>

 <button
 onClick={handleClose}
 className="text-[#747976] hover:text-white p-1 rounded-lg hover:bg-[#222522] transition-colors duration-150"
 >
 <X className="w-4 h-4" />
 </button>
 </div>

 </div>
 </div>
 );
};
