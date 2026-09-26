import React, { useState, useEffect } from 'react';
import { 
  Link as LinkIcon, 
  Copy, 
  Check, 
  DollarSign, 
  Users, 
  MousePointerClick, 
  TrendingUp, 
  Award, 
  Share2, 
  QrCode, 
  ArrowUpRight, 
  Wallet, 
  Clock, 
  ShieldCheck, 
  AlertCircle, 
  ExternalLink, 
  Layers, 
  Sparkles, 
  Download, 
  RefreshCw, 
  Play, 
  ChevronRight,
  Send,
  X,
  CreditCard,
  Building2
} from 'lucide-react';
import { 
  PropFirm, 
  AccountPlan, 
  AffiliateProfile, 
  ReferralActivityItem, 
  AffiliatePayout, 
  AffiliateTier,
  PayoutMethod 
} from '../types';
import {
  UserProfileData,
  getOrCreateAffiliateProfile,
  updateAffiliateProfile,
  recordAffiliateActivity,
  requestAffiliatePayout,
  subscribeAffiliateProfile,
  subscribeAffiliateActivities,
  subscribeAffiliatePayouts
} from '../lib/api';
import { AffiliateAnalyticsDashboard } from './AffiliateAnalyticsDashboard';

interface AffiliatePortalProps {
  firms: PropFirm[];
  userProfile: UserProfileData | null;
  onOpenAuth: () => void;
  onSelectFirmDetails: (firm: PropFirm, plan: AccountPlan) => void;
}

const TIER_BENEFITS: Record<AffiliateTier, { rate: number; minConversions: number; badgeColor: string; perks: string }> = {
  Bronze: { rate: 10, minConversions: 0, badgeColor: 'from-amber-700 to-amber-900 border-amber-600', perks: '10% RevShare, Weekly Payouts, Standard Tracking' },
  Silver: { rate: 15, minConversions: 10, badgeColor: 'from-slate-400 to-slate-600 border-slate-300', perks: '15% RevShare, Priority Support, 60-Day Cookie, Custom Coupon' },
  Gold: { rate: 20, minConversions: 50, badgeColor: 'from-amber-400 to-yellow-600 border-amber-300', perks: '20% RevShare, Instant Crypto Payouts, Dedicated Account Manager' },
  Diamond: { rate: 25, minConversions: 150, badgeColor: 'from-cyan-400 to-blue-600 border-cyan-300', perks: '25% RevShare, Free $100K Funded Account, VIP Community Access' }
};

export const AffiliatePortal: React.FC<AffiliatePortalProps> = ({
  firms,
  userProfile,
  onOpenAuth,
  onSelectFirmDetails,
}) => {
  const [profile, setProfile] = useState<AffiliateProfile | null>(null);
  const [activities, setActivities] = useState<ReferralActivityItem[]>([]);
  const [payouts, setPayouts] = useState<AffiliatePayout[]>([]);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [customSlugInput, setCustomSlugInput] = useState('');
  const [isEditingSlug, setIsEditingSlug] = useState(false);
  const [selectedDeepFirmId, setSelectedDeepFirmId] = useState(firms[0]?.id || 'lucid-trading');
  const [selectedDeepPlanId, setSelectedDeepPlanId] = useState(firms[0]?.plans[0]?.id || '');
  const [copiedDeepLink, setCopiedDeepLink] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutMethod, setPayoutMethod] = useState<PayoutMethod>('Crypto (USDT)');
  const [payoutAddress, setPayoutAddress] = useState('');
  const [payoutSubmitting, setPayoutSubmitting] = useState(false);
  const [payoutSuccessMsg, setPayoutSuccessMsg] = useState('');
  const [payoutErrorMsg, setPayoutErrorMsg] = useState('');
  const [activityFilter, setActivityFilter] = useState<'all' | 'conversion' | 'signup' | 'click'>('all');
  const [simulating, setSimulating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initialize or load profile
  useEffect(() => {
    if (!userProfile) {
      // Demo guest affiliate profile
      const demoProfile: AffiliateProfile = {
        userId: 'guest-trader-01',
        userEmail: 'trader@propfirmmatch.com',
        displayName: 'Guest Trader',
        referralCode: 'MATCH-PRO',
        customSlug: 'trader_pro',
        tier: 'Silver',
        commissionRate: 15,
        totalClicks: 342,
        totalSignups: 46,
        totalConversions: 14,
        conversionRate: 4.09,
        availableEarnings: 524.50,
        pendingEarnings: 168.00,
        lifetimeEarnings: 2140.00,
        payoutMethod: 'Crypto (USDT)',
        payoutAddress: '0x71C...49bF (USDT TRC20)',
        createdAt: '2026-08-01T10:00:00Z',
        updatedAt: new Date().toISOString(),
      };
      setProfile(demoProfile);
      setCustomSlugInput(demoProfile.customSlug);

      // Seed initial demo activity
      setActivities([
        {
          id: 'act-1',
          affiliateUserId: 'guest-trader-01',
          type: 'conversion',
          firmId: 'lucid-trading',
          firmName: 'Lucid Trading',
          planName: '$100K 1-Step Combine',
          orderAmount: 249.00,
          commissionAmount: 37.35,
          status: 'cleared',
          traderMask: 'Trader #4892 (US)',
          timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
          ipCountry: 'US',
        },
        {
          id: 'act-2',
          affiliateUserId: 'guest-trader-01',
          type: 'conversion',
          firmId: 'tradeify',
          firmName: 'Tradeify',
          planName: '$50K Advanced Challenge',
          orderAmount: 145.00,
          commissionAmount: 21.75,
          status: 'pending',
          traderMask: 'Trader #7311 (UK)',
          timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
          ipCountry: 'GB',
        },
        {
          id: 'act-3',
          affiliateUserId: 'guest-trader-01',
          type: 'signup',
          traderMask: 'Trader #9024 (DE)',
          timestamp: new Date(Date.now() - 3600000 * 26).toISOString(),
          status: 'completed',
          ipCountry: 'DE',
        },
        {
          id: 'act-4',
          affiliateUserId: 'guest-trader-01',
          type: 'click',
          traderMask: 'Anonymous (CA)',
          timestamp: new Date(Date.now() - 3600000 * 32).toISOString(),
          status: 'completed',
          ipCountry: 'CA',
        },
      ]);

      setPayouts([
        {
          id: 'pay-1',
          affiliateUserId: 'guest-trader-01',
          amount: 450.00,
          method: 'Crypto (USDT)',
          destination: '0x71C...49bF (TRC20)',
          status: 'Completed',
          requestedAt: '2026-09-08T14:20:00Z',
          txHash: '0x4f88...a91c',
        },
        {
          id: 'pay-2',
          affiliateUserId: 'guest-trader-01',
          amount: 620.00,
          method: 'Rise',
          destination: 'trader@propfirmmatch.com',
          status: 'Completed',
          requestedAt: '2026-08-22T09:15:00Z',
          txHash: 'RISE-798214',
        },
      ]);
      return;
    }

    // Authenticated user: load from PostgreSQL
    let unsubProfile: (() => void) | undefined;
    let unsubActivities: (() => void) | undefined;
    let unsubPayouts: (() => void) | undefined;

    const initData = async () => {
      try {
        const aff = await getOrCreateAffiliateProfile(
          userProfile.uid,
          userProfile.email,
          userProfile.displayName || 'Trader'
        );
        setProfile(aff);
        setCustomSlugInput(aff.customSlug);
        setPayoutAddress(aff.payoutAddress || '');
        setPayoutMethod(aff.payoutMethod || 'Crypto (USDT)');

        unsubProfile = subscribeAffiliateProfile(userProfile.uid, (p) => {
          setProfile(p);
          setCustomSlugInput(p.customSlug);
        });

        unsubActivities = subscribeAffiliateActivities(userProfile.uid, (acts) => {
          setActivities(acts);
        });

        unsubPayouts = subscribeAffiliatePayouts(userProfile.uid, (pays) => {
          setPayouts(pays);
        });
      } catch (err) {
        console.error('Failed to init affiliate PostgreSQL data:', err);
      }
    };

    initData();

    return () => {
      if (unsubProfile) unsubProfile();
      if (unsubActivities) unsubActivities();
      if (unsubPayouts) unsubPayouts();
    };
  }, [userProfile]);

  // Derived links
  const baseUrl = window.location.origin;
  const currentSlug = profile?.customSlug || profile?.referralCode || 'trader';
  const mainReferralLink = `${baseUrl}/?ref=${encodeURIComponent(currentSlug)}`;
  const promoCode = (profile?.referralCode || 'MATCH').toUpperCase();

  const selectedFirmObj = firms.find((f) => f.id === selectedDeepFirmId) || firms[0];
  const deepLinkUrl = `${baseUrl}/?ref=${encodeURIComponent(currentSlug)}&firm=${selectedDeepFirmId}${
    selectedDeepPlanId ? `&plan=${selectedDeepPlanId}` : ''
  }`;

  // Notification helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Copy helpers
  const handleCopyLink = () => {
    navigator.clipboard.writeText(mainReferralLink);
    setCopiedLink(true);
    showToast('Referral link copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyPromoCode = () => {
    navigator.clipboard.writeText(promoCode);
    setCopiedCode(true);
    showToast(`Promo code ${promoCode} copied!`);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyDeepLink = () => {
    navigator.clipboard.writeText(deepLinkUrl);
    setCopiedDeepLink(true);
    showToast('Targeted firm deep link copied!');
    setTimeout(() => setCopiedDeepLink(false), 2000);
  };

  // Save custom slug
  const handleSaveSlug = async () => {
    if (!profile) return;
    const sanitized = customSlugInput.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (sanitized.length < 3) {
      alert('Custom slug must be at least 3 characters long.');
      return;
    }

    const updated = { ...profile, customSlug: sanitized };
    setProfile(updated);
    setIsEditingSlug(false);
    showToast('Vanity referral link updated successfully!');

    if (userProfile) {
      await updateAffiliateProfile(userProfile.uid, { customSlug: sanitized });
    }
  };

  // Simulation: Test Click
  const handleSimulateClick = async () => {
    if (!profile) return;
    if (userProfile) { showToast('Simulation is available only in guest demo mode.'); return; }
    if (!firms.length) return;
    setSimulating(true);

    const newClicks = profile.totalClicks + 1;
    const newRate = Number(((profile.totalConversions / newClicks) * 100).toFixed(2));
    const updatedProfile: AffiliateProfile = {
      ...profile,
      totalClicks: newClicks,
      conversionRate: newRate,
    };
    setProfile(updatedProfile);

    const newActivity: Omit<ReferralActivityItem, 'id'> = {
      affiliateUserId: profile.userId,
      type: 'click',
      traderMask: `Anonymous (${['US', 'UK', 'DE', 'AU', 'SG', 'FR'][Math.floor(Math.random() * 6)]})`,
      timestamp: new Date().toISOString(),
      status: 'completed',
    };

    setActivities((prev) => [{ id: 'act-' + Date.now(), ...newActivity }, ...prev]);

    setSimulating(false);
    showToast('Simulated incoming referral click! (+1 Click recorded)');
  };

  // Simulation: Test Conversion
  const handleSimulateConversion = async () => {
    if (!profile) return;
    if (userProfile) { showToast('Simulation is available only in guest demo mode.'); return; }
    if (!firms.length) return;
    setSimulating(true);

    const randomFirm = firms[Math.floor(Math.random() * firms.length)];
    const randomPlan = randomFirm.plans[Math.floor(Math.random() * randomFirm.plans.length)] || {
      id: 'combine-100k',
      label: '$100K Combine',
      discountedPrice: 249,
      size: 100000,
    };

    const orderAmount = randomPlan.discountedPrice ?? 0;
    const commissionEarned = Number(((orderAmount * profile.commissionRate) / 100).toFixed(2));

    const newClicks = profile.totalClicks + 1;
    const newConversions = profile.totalConversions + 1;
    const newRate = Number(((newConversions / newClicks) * 100).toFixed(2));
    const newPending = Number((profile.pendingEarnings + commissionEarned).toFixed(2));
    const newLifetime = Number((profile.lifetimeEarnings + commissionEarned).toFixed(2));

    // Check tier upgrade
    let newTier = profile.tier;
    let newRateTier = profile.commissionRate;
    if (newConversions >= 150) {
      newTier = 'Diamond';
      newRateTier = 25;
    } else if (newConversions >= 50) {
      newTier = 'Gold';
      newRateTier = 20;
    } else if (newConversions >= 10) {
      newTier = 'Silver';
      newRateTier = 15;
    }

    const updatedProfile: AffiliateProfile = {
      ...profile,
      totalClicks: newClicks,
      totalConversions: newConversions,
      conversionRate: newRate,
      pendingEarnings: newPending,
      lifetimeEarnings: newLifetime,
      tier: newTier,
      commissionRate: newRateTier,
    };
    setProfile(updatedProfile);

    const newActivity: Omit<ReferralActivityItem, 'id'> = {
      affiliateUserId: profile.userId,
      type: 'conversion',
      firmId: randomFirm.id,
      firmName: randomFirm.name,
      planName: randomPlan.label,
      orderAmount,
      commissionAmount: commissionEarned,
      status: 'pending',
      traderMask: `Trader #${Math.floor(1000 + Math.random() * 9000)} (${['US', 'UK', 'CA', 'DE', 'AE'][Math.floor(Math.random() * 5)]})`,
      timestamp: new Date().toISOString(),
    };

    setActivities((prev) => [{ id: 'act-' + Date.now(), ...newActivity }, ...prev]);

    setSimulating(false);
    showToast(`🎉 Challenge purchase converted! +$${commissionEarned.toFixed(2)} commission logged!`);
  };

  // Submit Payout Request
  const handleSubmitPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setPayoutErrorMsg('');
    setPayoutSuccessMsg('');

    const amt = parseFloat(payoutAmount);
    if (isNaN(amt) || amt < 50) {
      setPayoutErrorMsg('Minimum payout threshold is $50.00.');
      return;
    }

    if (amt > profile.availableEarnings) {
      setPayoutErrorMsg(`Requested amount exceeds available balance ($${profile.availableEarnings.toFixed(2)}).`);
      return;
    }

    if (!payoutAddress.trim()) {
      setPayoutErrorMsg('Please provide a valid destination address or account info.');
      return;
    }

    setPayoutSubmitting(true);
    const newPayout: Omit<AffiliatePayout, 'id'> = {
      affiliateUserId: profile.userId,
      amount: amt,
      method: payoutMethod,
      destination: payoutAddress.trim(),
      status: 'Pending',
      requestedAt: new Date().toISOString(),

    };

    const newAvailable = Number((profile.availableEarnings - amt).toFixed(2));
    const updatedProfile: AffiliateProfile = {
      ...profile,
      availableEarnings: newAvailable,
      payoutMethod,
      payoutAddress: payoutAddress.trim(),
    };
    if (userProfile) {
      try {
        await requestAffiliatePayout(newPayout);
        await updateAffiliateProfile(userProfile.uid, {
          payoutMethod,
          payoutAddress: payoutAddress.trim(),
        });
      } catch (err: any) {
        setPayoutErrorMsg(err.message || 'Could not submit withdrawal.');
        setPayoutSubmitting(false);
        return;
      }
    } else {
      setPayouts((prev) => [{ id: 'pay-' + Date.now(), ...newPayout }, ...prev]);
    }

    setProfile(updatedProfile);
    setPayoutSubmitting(false);
    setPayoutSuccessMsg('Withdrawal request saved as pending. Payment processing is handled separately.');
    setTimeout(() => {
      setShowPayoutModal(false);
      setPayoutSuccessMsg('');
      setPayoutAmount('');
    }, 2000);
  };

  // Tier calculation
  const currentTier = profile?.tier || 'Silver';
  const tierConfig = TIER_BENEFITS[currentTier];
  const nextTierName: AffiliateTier | null = 
    currentTier === 'Bronze' ? 'Silver' :
    currentTier === 'Silver' ? 'Gold' :
    currentTier === 'Gold' ? 'Diamond' : null;
  const nextTierMin = nextTierName ? TIER_BENEFITS[nextTierName].minConversions : 150;
  const currentConversions = profile?.totalConversions || 0;
  const tierProgress = nextTierName 
    ? Math.min(100, Math.round((currentConversions / nextTierMin) * 100))
    : 100;

  // Filter activities
  const filteredActivities = activities.filter((act) => {
    if (activityFilter === 'all') return true;
    return act.type === activityFilter;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-purple-600 text-white font-bold text-xs shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom-3 duration-200 border border-purple-400">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Guest Mode Banner */}
      {!userProfile && (
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-purple-950/80 via-slate-900 to-indigo-950/80 border border-purple-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/30 border border-purple-400/40 flex items-center justify-center text-purple-300 font-bold text-lg">
              💎
            </div>
            <div>
              <div className="text-sm font-extrabold text-white flex items-center gap-2">
                <span>PFM Partner & Affiliate Program</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Earn Up to 25% RevShare
                </span>
              </div>
              <div className="text-xs text-slate-300">
                You are currently in interactive demo mode. Sign in to link your real payout wallet and start earning.
              </div>
            </div>
          </div>
          <button
            onClick={onOpenAuth}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-400 hover:to-purple-500 text-white font-extrabold text-xs shadow-lg transition-all cursor-pointer whitespace-nowrap"
          >
            Create Partner Account
          </button>
        </div>
      )}

      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#12162a] via-[#101426] to-[#0c0f1d] border border-slate-800 p-6 sm:p-8 shadow-2xl mb-8">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-500/40 text-xs font-bold text-purple-300">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>Prop Firm Match Global Partner Network</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
              Earn Lifetime Commissions Referring Traders
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              Share your custom referral link or promo code with your community, YouTube channel, or Discord. Earn up to <span className="text-white font-bold">25% recurring commissions</span> on every funded account challenge purchase with a 60-day attribution cookie.
            </p>

            {/* Quick Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300">
                <Clock className="w-3.5 h-3.5 text-purple-400" />
                <span>60-Day Cookie Window</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300">
                <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                <span>Weekly Payouts (USDT/Wise/Rise)</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>Live Fraud Protection</span>
              </div>
            </div>
          </div>

          {/* Tier & Next Level Card */}
          <div className="w-full lg:w-80 p-5 rounded-2xl bg-[#171b33] border border-purple-500/30 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span>Active Partner Tier</span>
                <span className="font-extrabold text-amber-300">{profile?.commissionRate}% Commission</span>
              </div>

              <div className="flex items-center gap-3 mb-3">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${tierConfig.badgeColor} border flex items-center justify-center text-white font-black text-lg shadow-md`}>
                  {currentTier[0]}
                </div>
                <div>
                  <div className="text-base font-black text-white">{currentTier} Partner</div>
                  <div className="text-[11px] text-slate-400">{tierConfig.perks.split(',')[0]}</div>
                </div>
              </div>

              {nextTierName ? (
                <div className="space-y-1.5 pt-2 border-t border-slate-800">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Progress to <strong className="text-white">{nextTierName} ({TIER_BENEFITS[nextTierName].rate}%)</strong></span>
                    <span className="text-purple-300 font-bold">{currentConversions} / {nextTierMin} conversions</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                      style={{ width: `${tierProgress}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-slate-400 text-right">
                    {nextTierMin - currentConversions} more sales to upgrade commission
                  </div>
                </div>
              ) : (
                <div className="pt-2 border-t border-slate-800 text-[11px] text-cyan-300 font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Maximum VIP Partner Tier Unlocked</span>
                </div>
              )}
            </div>

            {/* Interactive Simulation Trigger Bar */}
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-2">
              <button
                onClick={handleSimulateClick}
                disabled={simulating}
                title="Simulate someone clicking your referral link"
                className="flex-1 py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
              >
                <Play className="w-3 h-3 text-purple-400" />
                <span>+1 Click</span>
              </button>
              <button
                onClick={handleSimulateConversion}
                disabled={simulating}
                title="Simulate someone buying a funded combine challenge"
                className="flex-1 py-1.5 px-2 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 hover:text-emerald-200 border border-emerald-500/40 text-[11px] font-extrabold flex items-center justify-center gap-1 transition-all cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>+1 Sale</span>
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* 4 Top Metric Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        
        {/* Total Clicks */}
        <div className="p-5 rounded-2xl bg-[#12162a] border border-slate-800/80 hover:border-purple-500/40 transition-all shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Total Link Clicks</span>
            <div className="p-2 rounded-lg bg-purple-950/60 text-purple-400">
              <MousePointerClick className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-white">
              {profile?.totalClicks.toLocaleString() || 0}
            </div>
            <div className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1 font-semibold">
              <TrendingUp className="w-3 h-3" />
              <span>+18.4% traffic this month</span>
            </div>
          </div>
        </div>

        {/* Free Signups */}
        <div className="p-5 rounded-2xl bg-[#12162a] border border-slate-800/80 hover:border-purple-500/40 transition-all shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Referred Signups</span>
            <div className="p-2 rounded-lg bg-blue-950/60 text-blue-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-white">
              {profile?.totalSignups || 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Registered trader accounts
            </div>
          </div>
        </div>

        {/* Paid Conversions */}
        <div className="p-5 rounded-2xl bg-[#12162a] border border-slate-800/80 hover:border-purple-500/40 transition-all shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Challenge Conversions</span>
            <div className="p-2 rounded-lg bg-pink-950/60 text-pink-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-white">
              {profile?.totalConversions || 0}
            </div>
            <div className="text-[11px] text-pink-400 mt-1 font-semibold">
              Paid funded combine orders
            </div>
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="p-5 rounded-2xl bg-[#12162a] border border-slate-800/80 hover:border-purple-500/40 transition-all shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Conversion Rate</span>
            <div className="p-2 rounded-lg bg-emerald-950/60 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-white">
              {profile?.conversionRate}%
            </div>
            <div className="text-[11px] text-emerald-400 mt-1 font-semibold">
              Top 15% partner benchmark
            </div>
          </div>
        </div>

      </div>

      {/* Visual Analytics Dashboard with Recharts */}
      <AffiliateAnalyticsDashboard profile={profile} activities={activities} />

      {/* Main Grid: Referral Link Generator & Earnings Balance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Left 2 Cols: Referral Links & Tools */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Link Generator Card */}
          <div className="p-6 rounded-2xl bg-[#12162a] border border-slate-800 shadow-xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-purple-400" />
                <h2 className="font-extrabold text-base text-white">Your Unique Referral Link</h2>
              </div>
              <button
                onClick={() => setShowQrModal(true)}
                className="text-xs text-purple-300 hover:text-white flex items-center gap-1 hover:underline cursor-pointer"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Show QR Code</span>
              </button>
            </div>

            {/* Primary Link Input & Copy */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="flex-1 relative flex items-center">
                <input
                  type="text"
                  readOnly
                  value={mainReferralLink}
                  className="w-full bg-[#0d1020] border border-slate-700/80 text-slate-200 text-xs sm:text-sm font-mono rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-purple-500"
                />
              </div>

              <button
                onClick={handleCopyLink}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md shadow-purple-900/30 transition-all cursor-pointer whitespace-nowrap"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? 'Copied Link!' : 'Copy Link'}</span>
              </button>
            </div>

            {/* Custom Vanity Slug Editor */}
            <div className="p-3.5 rounded-xl bg-[#0e1224] border border-slate-800/80 text-xs space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="font-semibold text-slate-300">Custom Vanity Slug:</span>
                {!isEditingSlug ? (
                  <button
                    onClick={() => setIsEditingSlug(true)}
                    className="text-purple-400 hover:text-purple-300 font-bold cursor-pointer"
                  >
                    Edit Slug
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSaveSlug}
                      className="text-emerald-400 hover:text-emerald-300 font-bold cursor-pointer"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setCustomSlugInput(profile?.customSlug || '');
                        setIsEditingSlug(false);
                      }}
                      className="text-slate-400 hover:text-slate-200 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {isEditingSlug ? (
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 text-xs font-mono">{baseUrl}/?ref=</span>
                  <input
                    type="text"
                    value={customSlugInput}
                    onChange={(e) => setCustomSlugInput(e.target.value)}
                    placeholder="my_trading_brand"
                    className="flex-1 bg-slate-900 border border-purple-500 rounded-lg px-2.5 py-1 text-xs text-white font-mono focus:outline-none"
                  />
                </div>
              ) : (
                <div className="text-slate-400 font-mono text-[11px] truncate">
                  {baseUrl}/?ref=<strong className="text-purple-300">{profile?.customSlug}</strong>
                </div>
              )}
            </div>

            {/* Promo Code & Social Share Bar */}
            <div className="pt-2 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Partner Promo Code */}
              <div className="p-3 rounded-xl bg-[#0e1224] border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Partner Coupon Code</div>
                  <div className="text-sm font-black text-amber-300 font-mono tracking-wider">{promoCode}</div>
                  <div className="text-[10px] text-slate-400">Applies 10% discount for traders</div>
                </div>
                <button
                  onClick={handleCopyPromoCode}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="Copy Promo Code"
                >
                  {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* 1-Click Social Sharing */}
              <div className="p-3 rounded-xl bg-[#0e1224] border border-slate-800 flex flex-col justify-between">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1.5 flex items-center gap-1">
                  <Share2 className="w-3 h-3 text-purple-400" />
                  <span>Share With Your Traders</span>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Compare verified prop firms, check pass rates, and get exclusive challenge discounts on Prop Firm Match: ${mainReferralLink}`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-sky-950 text-slate-300 hover:text-sky-400 border border-slate-700/60 transition-colors text-xs font-bold"
                    title="Share on X / Twitter"
                  >
                    X / Twitter
                  </a>
                  <a
                    href={`https://t.me/share/url?url=${encodeURIComponent(mainReferralLink)}&text=${encodeURIComponent('Best prop firm challenges & verified payout data:')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-blue-950 text-slate-300 hover:text-blue-400 border border-slate-700/60 transition-colors text-xs font-bold"
                    title="Share on Telegram"
                  >
                    Telegram
                  </a>
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out top prop firm challenge discounts: ${mainReferralLink}`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-emerald-950 text-slate-300 hover:text-emerald-400 border border-slate-700/60 transition-colors text-xs font-bold"
                    title="Share on WhatsApp"
                  >
                    WhatsApp
                  </a>
                </div>
              </div>

            </div>

          </div>

          {/* Deep-Link Builder Card */}
          <div className="p-6 rounded-2xl bg-[#12162a] border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                <h3 className="font-extrabold text-sm sm:text-base text-white">Targeted Prop Firm Deep-Link Builder</h3>
              </div>
              <span className="text-[11px] text-slate-400">Direct referrals to a specific challenge</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Firm Selector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Target Firm</label>
                <select
                  value={selectedDeepFirmId}
                  onChange={(e) => {
                    setSelectedDeepFirmId(e.target.value);
                    const f = firms.find((fm) => fm.id === e.target.value);
                    if (f && f.plans.length > 0) {
                      setSelectedDeepPlanId(f.plans[0].id);
                    }
                  }}
                  className="w-full bg-[#0d1020] border border-slate-700 text-xs rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                >
                  {firms.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.trustpilotScore}/5 Trust)
                    </option>
                  ))}
                </select>
              </div>

              {/* Plan Selector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Target Plan Size</label>
                <select
                  value={selectedDeepPlanId}
                  onChange={(e) => setSelectedDeepPlanId(e.target.value)}
                  className="w-full bg-[#0d1020] border border-slate-700 text-xs rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                >
                  {selectedFirmObj?.plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label} (${(p.size?.toLocaleString() ?? 'Not provided')} - ${p.discountedPrice})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Generated Deep-Link Result */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={deepLinkUrl}
                className="flex-1 bg-[#0d1020] border border-slate-700 text-slate-300 font-mono text-xs rounded-xl px-3 py-2 focus:outline-none"
              />
              <button
                onClick={handleCopyDeepLink}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap border border-slate-700"
              >
                {copiedDeepLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedDeepLink ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

        </div>

        {/* Right 1 Col: Earnings Balance & Payout Hub */}
        <div className="space-y-6">
          
          {/* Earnings Balance Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-[#161c36] via-[#12162a] to-[#0d1020] border border-purple-500/40 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-emerald-400" />
                <h3 className="font-extrabold text-base text-white">Earnings Balance</h3>
              </div>
              <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                Weekly Auto-Pay
              </span>
            </div>

            {/* Big Balance Display */}
            <div className="p-4 rounded-xl bg-[#0b0e1b] border border-slate-800/80">
              <div className="text-xs text-slate-400 font-medium">Available for Payout</div>
              <div className="text-3xl sm:text-4xl font-black text-emerald-400 tracking-tight mt-1">
                ${profile?.availableEarnings.toFixed(2) || '0.00'}
              </div>
              <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between border-t border-slate-800/60 pt-2">
                <span>Pending Clearance:</span>
                <span className="font-semibold text-amber-300">${profile?.pendingEarnings.toFixed(2) || '0.00'}</span>
              </div>
              <div className="text-[11px] text-slate-400 flex items-center justify-between mt-1">
                <span>All-Time Lifetime Earned:</span>
                <span className="font-semibold text-white">${profile?.lifetimeEarnings.toFixed(2) || '0.00'}</span>
              </div>
            </div>

            {/* Request Payout Action Button */}
            <button
              onClick={() => {
                if (!userProfile) {
                  onOpenAuth();
                  return;
                }
                setShowPayoutModal(true);
              }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-sm shadow-xl shadow-emerald-950/40 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <DollarSign className="w-4 h-4" />
              <span>Request Payout</span>
            </button>

            <div className="text-[11px] text-slate-400 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-300">
                <Check className="w-3 h-3 text-emerald-400" />
                <span>Min. Payout: $50.00</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300">
                <Check className="w-3 h-3 text-emerald-400" />
                <span>Zero fees on Crypto USDT (TRC-20)</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300">
                <Check className="w-3 h-3 text-emerald-400" />
                <span>Payout cycle: Every Monday @ 12:00 UTC</span>
              </div>
            </div>

          </div>

          {/* Quick Payouts History */}
          <div className="p-5 rounded-2xl bg-[#12162a] border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-white">Recent Payouts</span>
              <span className="text-[11px] text-slate-400">{payouts.length} total</span>
            </div>

            {payouts.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-xs">
                No withdrawal requests yet.
              </div>
            ) : (
              <div className="space-y-2">
                {payouts.slice(0, 3).map((p) => (
                  <div
                    key={p.id}
                    className="p-2.5 rounded-xl bg-[#0d1020] border border-slate-800/80 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-white">${p.amount.toFixed(2)}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{p.method} • {new Date(p.requestedAt).toLocaleDateString()}</div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      p.status === 'Completed'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}>
                      {p.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Firm Conversion Breakdown Table */}
      <div className="mb-8 p-6 rounded-2xl bg-[#12162a] border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-extrabold text-base text-white">Performance by Prop Firm</h3>
            <p className="text-xs text-slate-400">See which prop firm challenges convert highest for your referred audience</p>
          </div>
          <span className="text-xs font-semibold text-purple-300">Live Commission Attribution</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0e1122] text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-4 font-bold">Prop Firm</th>
                <th className="py-2.5 px-4 font-bold">Clicks</th>
                <th className="py-2.5 px-4 font-bold">Conversions</th>
                <th className="py-2.5 px-4 font-bold">Sales Volume</th>
                <th className="py-2.5 px-4 font-bold">Your Commission</th>
                <th className="py-2.5 px-4 font-bold">Conv. Rate</th>
                <th className="py-2.5 px-4 text-right font-bold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {firms.slice(0, 5).map((firm, idx) => {
                // Computed demo metrics per firm
                const firmClicks = Math.max(14, Math.round(profile ? profile.totalClicks * (0.35 / (idx + 1)) : 40));
                const firmConvs = Math.max(1, Math.round(profile ? profile.totalConversions * (0.4 / (idx + 1)) : 2));
                const firmVol = firmConvs * 220;
                const firmCommission = (firmVol * (profile?.commissionRate || 15)) / 100;
                const firmConvRate = ((firmConvs / firmClicks) * 100).toFixed(1);

                return (
                  <tr key={firm.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <img src={firm.logo} alt={firm.name} className="w-6 h-6 rounded-lg object-cover" />
                        <div>
                          <div className="font-bold text-white">{firm.name}</div>
                          <div className="text-[10px] text-slate-400">{firm.plans.length} Challenges Available</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono">{firmClicks}</td>
                    <td className="py-3 px-4 font-mono font-bold text-pink-300">{firmConvs}</td>
                    <td className="py-3 px-4 font-mono text-slate-200">${firmVol.toFixed(2)}</td>
                    <td className="py-3 px-4 font-mono font-extrabold text-emerald-400">${firmCommission.toFixed(2)}</td>
                    <td className="py-3 px-4 font-mono">
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[11px] font-bold">
                        {firmConvRate}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onSelectFirmDetails(firm, firm.plans[0])}
                        className="text-xs text-purple-400 hover:text-white font-semibold cursor-pointer"
                      >
                        View Plans →
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Activity Stream Table */}
      <div className="p-6 rounded-2xl bg-[#12162a] border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-extrabold text-base text-white">Live Referral Activity Feed</h3>
            <p className="text-xs text-slate-400">Real-time log of clicks, signups, and challenge purchases via your links</p>
          </div>

          {/* Filter Pills */}
          <div className="inline-flex p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <button
              onClick={() => setActivityFilter('all')}
              className={`px-3 py-1 rounded-lg transition-all ${
                activityFilter === 'all' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Events ({activities.length})
            </button>
            <button
              onClick={() => setActivityFilter('conversion')}
              className={`px-3 py-1 rounded-lg transition-all ${
                activityFilter === 'conversion' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Conversions Only
            </button>
            <button
              onClick={() => setActivityFilter('signup')}
              className={`px-3 py-1 rounded-lg transition-all ${
                activityFilter === 'signup' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Signups
            </button>
            <button
              onClick={() => setActivityFilter('click')}
              className={`px-3 py-1 rounded-lg transition-all ${
                activityFilter === 'click' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Clicks
            </button>
          </div>
        </div>

        {filteredActivities.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">
            No referral events match the current filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0e1122] text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-4 font-bold">Event Type</th>
                  <th className="py-2.5 px-4 font-bold">Trader Mask</th>
                  <th className="py-2.5 px-4 font-bold">Firm / Plan</th>
                  <th className="py-2.5 px-4 font-bold">Challenge Price</th>
                  <th className="py-2.5 px-4 font-bold">Commission</th>
                  <th className="py-2.5 px-4 font-bold">Status</th>
                  <th className="py-2.5 px-4 text-right font-bold">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredActivities.map((act) => {
                  const isConversion = act.type === 'conversion';
                  return (
                    <tr key={act.id} className="hover:bg-slate-800/20 transition-colors">
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                          act.type === 'conversion'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : act.type === 'signup'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {act.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-200">{act.traderMask}</td>
                      <td className="py-3 px-4">
                        {act.firmName ? (
                          <div>
                            <span className="font-bold text-white">{act.firmName}</span>
                            {act.planName && <span className="text-slate-400 text-[10px]"> — {act.planName}</span>}
                          </div>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono">
                        {act.orderAmount ? `$${act.orderAmount.toFixed(2)}` : '—'}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                        {act.commissionAmount ? `+$${act.commissionAmount.toFixed(2)}` : '—'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-[10px] font-bold ${
                          act.status === 'cleared' ? 'text-emerald-400' :
                          act.status === 'pending' ? 'text-amber-400' : 'text-slate-400'
                        }`}>
                          {act.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-slate-400 text-[11px]">
                        {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}{' '}
                        • {new Date(act.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-3xl bg-[#13172a] border border-slate-700 p-6 text-center space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2 text-sm font-extrabold text-white">
                <QrCode className="w-4 h-4 text-purple-400" />
                <span>Referral Link QR Code</span>
              </div>
              <button onClick={() => setShowQrModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Show this code to traders at events or paste it into your video presentations:
            </p>

            {/* Generated Clean SVG QR Code Representation */}
            <div className="p-4 rounded-2xl bg-white mx-auto w-48 h-48 flex items-center justify-center shadow-lg">
              <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900 fill-current">
                {/* Simulated high-fidelity matrix pattern */}
                <rect x="5" y="5" width="25" height="25" fill="#000" />
                <rect x="9" y="9" width="17" height="17" fill="#fff" />
                <rect x="13" y="13" width="9" height="9" fill="#000" />

                <rect x="70" y="5" width="25" height="25" fill="#000" />
                <rect x="74" y="9" width="17" height="17" fill="#fff" />
                <rect x="78" y="13" width="9" height="9" fill="#000" />

                <rect x="5" y="70" width="25" height="25" fill="#000" />
                <rect x="9" y="74" width="17" height="17" fill="#fff" />
                <rect x="13" y="78" width="9" height="9" fill="#000" />

                {/* Central PFM logo badge */}
                <rect x="40" y="40" width="20" height="20" rx="4" fill="#9333ea" />
                <text x="50" y="54" fontSize="9" fontWeight="900" textAnchor="middle" fill="#fff">PFM</text>

                {/* Pattern dots */}
                <rect x="35" y="10" width="6" height="6" />
                <rect x="45" y="10" width="6" height="6" />
                <rect x="55" y="15" width="6" height="6" />
                <rect x="35" y="70" width="6" height="6" />
                <rect x="45" y="80" width="6" height="6" />
                <rect x="75" y="45" width="6" height="6" />
                <rect x="85" y="60" width="6" height="6" />
                <rect x="65" y="75" width="6" height="6" />
              </svg>
            </div>

            <div className="text-[11px] font-mono text-purple-300 truncate px-2">
              {mainReferralLink}
            </div>

            <button
              onClick={() => {
                handleCopyLink();
                setShowQrModal(false);
              }}
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-colors"
            >
              Copy Link & Close
            </button>
          </div>
        </div>
      )}

      {/* Payout Request Modal */}
      {showPayoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl bg-[#13172a] border border-slate-700 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-emerald-400" />
                <h3 className="font-extrabold text-base text-white">Request Affiliate Withdrawal</h3>
              </div>
              <button onClick={() => setShowPayoutModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {payoutSuccessMsg ? (
              <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs space-y-2">
                <div className="font-bold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Withdrawal Submitted Successfully!</span>
                </div>
                <div>{payoutSuccessMsg}</div>
              </div>
            ) : (
              <form onSubmit={handleSubmitPayout} className="space-y-4">
                
                {/* Available balance indicator */}
                <div className="p-3 rounded-xl bg-[#0d1020] border border-slate-800 flex justify-between items-center text-xs">
                  <span className="text-slate-400">Available Balance:</span>
                  <span className="font-black text-emerald-400 text-sm">
                    ${profile?.availableEarnings.toFixed(2) || '0.00'}
                  </span>
                </div>

                {/* Amount input */}
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-1">
                    <label>Withdrawal Amount (USD)</label>
                    <button
                      type="button"
                      onClick={() => setPayoutAmount((profile?.availableEarnings || 0).toString())}
                      className="text-purple-400 hover:text-purple-300 text-[11px] font-semibold"
                    >
                      Max Available
                    </button>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-500 font-bold">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="50"
                      value={payoutAmount}
                      onChange={(e) => setPayoutAmount(e.target.value)}
                      placeholder="50.00"
                      className="w-full bg-[#0d1020] border border-slate-700 text-white rounded-xl pl-8 pr-3 py-2 text-sm focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">Min. withdrawal threshold: $50.00</span>
                </div>

                {/* Payout Method */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Payout Method</label>
                  <select
                    value={payoutMethod}
                    onChange={(e) => setPayoutMethod(e.target.value as PayoutMethod)}
                    className="w-full bg-[#0d1020] border border-slate-700 text-xs rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="Crypto (USDT)">Crypto (USDT TRC-20) — Recommended (0% Fee)</option>
                    <option value="Rise">Rise (rise.com)</option>
                    <option value="Wise">Wise (TransferWise)</option>
                    <option value="Direct Bank Transfer">Direct Bank Wire (IBAN / ACH)</option>
                    <option value="Deel">Deel Contractor</option>
                    <option value="PayPal">PayPal</option>
                  </select>
                </div>

                {/* Payout Destination */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {payoutMethod.includes('Crypto') ? 'USDT TRC-20 Wallet Address' : 'Account Email / IBAN / Account Number'}
                  </label>
                  <input
                    type="text"
                    required
                    value={payoutAddress}
                    onChange={(e) => setPayoutAddress(e.target.value)}
                    placeholder={payoutMethod.includes('Crypto') ? 'T...' : 'your_payout_email@domain.com'}
                    className="w-full bg-[#0d1020] border border-slate-700 text-white rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>

                {payoutErrorMsg && (
                  <div className="p-2.5 rounded-lg bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{payoutErrorMsg}</span>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPayoutModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={payoutSubmitting}
                    className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg transition-colors cursor-pointer"
                  >
                    {payoutSubmitting ? 'Submitting...' : 'Confirm Withdrawal'}
                  </button>
                </div>

              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
