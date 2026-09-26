import React, { useState, useEffect } from 'react';
import { 
  X, 
  Bell, 
  Sparkles, 
  CheckCircle2, 
  TrendingDown, 
  Mail, 
  Tag, 
  Sliders, 
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { PropFirm, AccountPlan, PriceAlert, AlertType, AlertChannel } from '../types';
import { UserProfileData, createPriceAlert } from '../lib/api';
import { planPrice, displayValue } from '../lib/catalog';

interface PriceAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  firm?: PropFirm | null;
  initialFirm?: PropFirm | null;
  plan?: AccountPlan | null;
  initialPlan?: AccountPlan | null;
  allFirms: PropFirm[];
  userProfile?: UserProfileData | null;
  onOpenAuth: () => void;
  onAlertCreated?: (newAlert: PriceAlert) => void;
}

export const PriceAlertModal: React.FC<PriceAlertModalProps> = ({
  isOpen,
  onClose,
  firm,
  initialFirm: propInitialFirm,
  plan,
  initialPlan: propInitialPlan,
  allFirms,
  userProfile,
  onOpenAuth,
  onAlertCreated,
}) => {
  const initialFirm = firm || propInitialFirm;
  const initialPlan = plan || propInitialPlan;

  // Selected Firm state
  const [selectedFirmId, setSelectedFirmId] = useState<string>(
    initialFirm?.id || (allFirms.length > 0 ? allFirms[0].id : '')
  );

  const currentFirm = allFirms.find((f) => f.id === selectedFirmId) || initialFirm || allFirms[0];

  // Selected Plan state
  const [selectedPlanId, setSelectedPlanId] = useState<string>(
    initialPlan?.id || (currentFirm?.plans?.[0]?.id || '')
  );

  // Sync selected plan when firm changes
  useEffect(() => {
    if (currentFirm && currentFirm.plans && currentFirm.plans.length > 0) {
      if (!currentFirm.plans.some((p) => p.id === selectedPlanId)) {
        setSelectedPlanId(currentFirm.plans[0].id);
      }
    }
  }, [currentFirm, selectedPlanId]);

  const currentPlan = currentFirm?.plans?.find((p) => p.id === selectedPlanId) || currentFirm?.plans?.[0];

  const currentPrice = currentPlan?.discountedPrice ?? 0;

  // Form Fields
  const [email, setEmail] = useState(userProfile?.email || '');
  const [alertType, setAlertType] = useState<AlertType>('price_drop');
  const [targetPrice, setTargetPrice] = useState<number>(Math.max(10, Math.round(currentPrice * 0.85)));
  const [channel, setChannel] = useState<AlertChannel>('both');
  const [notifyOnDiscount, setNotifyOnDiscount] = useState<boolean>(true);

  // Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Update target price when current plan changes
  useEffect(() => {
    if (currentPrice) {
      setTargetPrice(Math.round(currentPrice * 0.85));
    }
  }, [currentPrice]);

  // Keep email synced with userProfile if available
  useEffect(() => {
    if (userProfile?.email && !email) {
      setEmail(userProfile.email);
    }
  }, [userProfile]);

  // Escape key listener
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSetQuickDiscount = (percent: number) => {
    setTargetPrice(Math.round(currentPrice * (1 - percent / 100)));
    setAlertType('price_drop');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) { onOpenAuth(); return; }
    if (currentPlan?.discountedPrice == null) { setErrorMsg('This plan has no published price.'); return; }
    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!currentFirm || !currentPlan) {
      setErrorMsg('Please select a valid prop firm and account plan.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    const userId = userProfile?.uid || `guest-${Date.now()}`;

    const newAlertData: Omit<PriceAlert, 'id' | 'createdAt'> = {
      userId,
      userEmail: email.trim(),
      firmId: currentFirm.id,
      firmName: currentFirm.name,
      firmLogo: currentFirm.logo,
      planId: currentPlan.id,
      planName: `${currentPlan.label} Plan`,
      planSize: currentPlan.size,
      currency: currentPlan.currency,
      currentPrice,
      targetPrice: alertType === 'price_drop' ? targetPrice : undefined,
      alertType,
      channel,
      notifyOnDiscount,
      active: true,
    };

    try {
      const createdId = await createPriceAlert(newAlertData);
      const fullAlert: PriceAlert = {
        ...newAlertData,
        id: createdId,
        createdAt: new Date().toISOString(),
      };

      if (onAlertCreated) {
        onAlertCreated(fullAlert);
      }
      setIsSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not save the alert. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#111425] border border-purple-500/40 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-purple-900/40 via-indigo-950/30 to-purple-900/40 border-b border-purple-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-600/30 border border-purple-500/50 flex items-center justify-center text-purple-300 shadow-inner">
              <Bell className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-white text-base">Track Price & Discount Alerts</h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/40 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  +25 LP
                </span>
              </div>
              <p className="text-xs text-slate-400">Get notified instantly when this plan drops in price or launches a promo code.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {isSuccess ? (
            <div className="py-6 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-lg font-extrabold text-white">Price Alert Activated!</h4>
                <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto">
                  We are actively tracking <span className="font-bold text-purple-300">{currentFirm?.name} {currentPlan?.label}</span> for you.
                  Alerts will be sent to <span className="font-semibold text-white">{email}</span>.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/30 text-xs text-purple-200 flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span><strong className="text-amber-300">+25 Loyalty Points</strong> credited to your account!</span>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg transition-all"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              {/* Firm & Plan Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1.5 flex items-center gap-1.5">
                    <span>Prop Firm</span>
                  </label>
                  <div className="relative">
                    <select
                      value={selectedFirmId}
                      onChange={(e) => setSelectedFirmId(e.target.value)}
                      className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3 py-2 text-white text-xs appearance-none pr-8 focus:outline-none focus:border-purple-500"
                    >
                      {allFirms.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name} ({f.supportedMarkets[0]})
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1.5">
                    Account Plan
                  </label>
                  <div className="relative">
                    <select
                      value={selectedPlanId}
                      onChange={(e) => setSelectedPlanId(e.target.value)}
                      className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3 py-2 text-white text-xs appearance-none pr-8 focus:outline-none focus:border-purple-500"
                    >
                      {currentFirm?.plans?.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.label} - ${p.discountedPrice} (Reg. ${p.originalPrice})
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Current Price Banner */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {currentFirm?.logo && (
                    <img
                      src={currentFirm.logo}
                      alt={currentFirm.name}
                      className="w-8 h-8 rounded-lg object-cover border border-slate-700"
                    />
                  )}
                  <div>
                    <div className="font-bold text-white text-xs">{currentFirm?.name} - {currentPlan?.label}</div>
                    <div className="text-[11px] text-slate-400">
                      Profit target: {displayValue(currentPlan?.sourcePlan?.profit_target)} | Max drawdown: {displayValue(currentPlan?.sourcePlan?.max_total_drawdown)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-extrabold text-emerald-400">{planPrice(currentPlan)}</div>
                  {currentPlan && currentPlan.originalPrice != null && currentPlan.originalPrice > currentPrice && (
                    <div className="text-[10px] text-slate-500 line-through">${currentPlan.originalPrice}</div>
                  )}
                </div>
              </div>

              {/* Alert Trigger Condition */}
              <div className="space-y-2">
                <label className="text-slate-300 font-semibold block flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-purple-400" />
                  <span>Notify Me When: (target in {currentPlan?.currency || 'source currency'})</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setAlertType('price_drop')}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      alertType === 'price_drop'
                        ? 'bg-purple-600/20 border-purple-500 text-white font-bold shadow-sm'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <TrendingDown className="w-4 h-4 mx-auto mb-1 text-emerald-400" />
                    <span>Price Drops Below</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAlertType('any_change')}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      alertType === 'any_change'
                        ? 'bg-purple-600/20 border-purple-500 text-white font-bold shadow-sm'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Tag className="w-4 h-4 mx-auto mb-1 text-purple-400" />
                    <span>Any Price Change</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAlertType('discount_increase')}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      alertType === 'discount_increase'
                        ? 'bg-purple-600/20 border-purple-500 text-white font-bold shadow-sm'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 mx-auto mb-1 text-amber-400" />
                    <span>New Promo Code</span>
                  </button>
                </div>

                {/* Target Price Threshold Input (if price_drop) */}
                {alertType === 'price_drop' && (
                  <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-800/40 space-y-2 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-medium">Target Price Threshold:</span>
                      <span className="font-extrabold text-emerald-400 text-sm">${targetPrice}</span>
                    </div>

                    <input
                      type="range"
                      min={Math.max(1, Math.round(currentPrice * 0.4))}
                      max={Math.round(currentPrice * 0.98)}
                      value={targetPrice}
                      onChange={(e) => setTargetPrice(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />

                    {/* Quick discount presets */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-slate-400">Quick Presets:</span>
                      <div className="flex gap-1.5">
                        {[10, 20, 30, 50].map((pct) => (
                          <button
                            key={pct}
                            type="button"
                            onClick={() => handleSetQuickDiscount(pct)}
                            className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-purple-700 text-slate-300 hover:text-white text-[10px] font-bold transition-colors"
                          >
                            -{pct}%
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Notification Channel & Email */}
              <div className="space-y-3 pt-1">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-blue-400" />
                    <span>Notification Email</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="trader@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                  {!userProfile && (
                    <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Sign in to sync alerts across all devices.</span>
                      <button
                        type="button"
                        onClick={onOpenAuth}
                        className="text-purple-400 hover:text-purple-300 font-semibold underline cursor-pointer"
                      >
                        Sign in now
                      </button>
                    </div>
                  )}
                </div>

                {/* Channel Selector */}
                <div className="grid grid-cols-3 gap-2">
                  <label
                    className={`flex items-center justify-center p-2 rounded-lg border text-[11px] cursor-pointer transition-all ${
                      channel === 'email'
                        ? 'bg-purple-900/30 border-purple-500 text-white font-bold'
                        : 'bg-slate-900/40 border-slate-800 text-slate-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="channel"
                      value="email"
                      checked={channel === 'email'}
                      onChange={() => setChannel('email')}
                      className="sr-only"
                    />
                    <span>Email Only</span>
                  </label>

                  <label
                    className={`flex items-center justify-center p-2 rounded-lg border text-[11px] cursor-pointer transition-all ${
                      channel === 'in_app'
                        ? 'bg-purple-900/30 border-purple-500 text-white font-bold'
                        : 'bg-slate-900/40 border-slate-800 text-slate-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="channel"
                      value="in_app"
                      checked={channel === 'in_app'}
                      onChange={() => setChannel('in_app')}
                      className="sr-only"
                    />
                    <span>In-App Only</span>
                  </label>

                  <label
                    className={`flex items-center justify-center p-2 rounded-lg border text-[11px] cursor-pointer transition-all ${
                      channel === 'both'
                        ? 'bg-purple-900/30 border-purple-500 text-white font-bold'
                        : 'bg-slate-900/40 border-slate-800 text-slate-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="channel"
                      value="both"
                      checked={channel === 'both'}
                      onChange={() => setChannel('both')}
                      className="sr-only"
                    />
                    <span>Email & In-App</span>
                  </label>
                </div>

                {/* Auto Coupon Notifications Checkbox */}
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={notifyOnDiscount}
                    onChange={(e) => setNotifyOnDiscount(e.target.checked)}
                    className="w-4 h-4 rounded text-purple-600 focus:ring-0 bg-slate-900 border-slate-700"
                  />
                  <span>Also notify me when exclusive promo codes are released for {currentFirm?.name}</span>
                </label>
              </div>

              {errorMsg && (
                <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
                  {errorMsg}
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-900/20 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Bell className="w-4 h-4" />
                  <span>{isSubmitting ? 'Saving alert...' : 'Subscribe to Price Alerts (+25 LP)'}</span>
                </button>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zero spam guarantee. Unsubscribe anytime with one click.</span>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
};
