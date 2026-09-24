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
      <div className="bg-[#14182e] border-2 border-emerald-500/80 rounded-2xl p-4 shadow-2xl shadow-emerald-950/50 text-white relative overflow-hidden backdrop-blur-md">
        
        {/* Top glow accent */}
        <div className="absolute -top-10 -right-10 w-28 h-28 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-300 shrink-0">
              <Bell className="w-5 h-5 animate-bounce" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold border border-emerald-500/40 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  PRICE DROP ALERT
                </span>
                <span className="text-[10px] text-slate-400">Just now</span>
              </div>

              <h4 className="text-sm font-extrabold text-white">
                {alert.firmName} {alert.planName}
              </h4>

              <p className="text-xs text-slate-300">
                Price dropped from{' '}
                <span className="line-through text-slate-400">${alert.currentPrice}</span> to{' '}
                <span className="font-extrabold text-emerald-400 text-sm">
                  ${simulatedNewPrice}
                </span>{' '}
                <span className="text-emerald-300 font-bold">(-{discountPercent}%)</span>!
              </p>

              <div className="pt-1.5 flex items-center gap-2">
                <span className="px-2 py-1 rounded-lg bg-purple-950/80 border border-purple-600/50 text-purple-300 font-mono text-[11px] font-bold flex items-center gap-1">
                  <Tag className="w-3 h-3 text-purple-400" />
                  {couponCode}
                </span>

                <button
                  onClick={() => {
                    onViewDeal(alert.firmId, alert.planId);
                    handleClose();
                  }}
                  className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center gap-1 transition-all cursor-pointer shadow-md"
                >
                  <span>View Deal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
