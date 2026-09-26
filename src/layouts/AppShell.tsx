import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCatalog } from '../contexts/CatalogContext';

import { Navbar } from '../components/Navbar';
import { FloatingChatWidget } from '../components/FloatingChatWidget';
import { MegaFooter } from '../components/MegaFooter';
import { Scale } from 'lucide-react';

import { AuthModal } from '../components/AuthModal';
import { GiveawayModal } from '../components/GiveawayModal';
import { LoyaltyPointsModal } from '../components/LoyaltyPointsModal';
import { VerificationMethodologyModal } from '../components/VerificationMethodologyModal';
import { WeAreHiringModal } from '../components/WeAreHiringModal';
import { TutorialsModal } from '../components/TutorialsModal';
import { AppLauncherModal } from '../components/AppLauncherModal';
import { GoogleSearchGroundingModal } from '../components/GoogleSearchGroundingModal';
import { FirmDetailsModal } from '../components/FirmDetailsModal';
import { ComparisonMatrixModal } from '../components/ComparisonMatrixModal';
import { SavedWatchlistModal } from '../components/SavedWatchlistModal';
import { WriteReviewModal } from '../components/WriteReviewModal';
import { PriceAlertModal } from '../components/PriceAlertModal';
import { PriceAlertsManagementModal } from '../components/PriceAlertsManagementModal';
import { PriceAlertToast } from '../components/PriceAlertToast';

import { FirmsPage } from '../pages/FirmsPage';
import { ComparePage } from '../pages/ComparePage';
import { DiscountsPage } from '../pages/DiscountsPage';
import { PayoutsPage } from '../pages/PayoutsPage';
import { CalculatorPage } from '../pages/CalculatorPage';
import { QuizPage } from '../pages/QuizPage';
import { AffiliatePage } from '../pages/AffiliatePage';

import { updateUserFavorites, subscribeUserPriceAlerts } from '../lib/api';
import type { SubTabType } from '../components/SubTabsBar';
import type { PropFirm, AccountPlan, FilterState, FirmReview, PriceAlert } from '../types';

type TabType = 'firms' | 'compare' | 'quiz' | 'calculator' | 'discounts' | 'payouts' | 'affiliates';

const INITIAL_FILTERS: FilterState = {
  search: '', market: 'All', challengeType: 'All', accountSize: 'All',
  platforms: [], drawdownType: 'All', minProfitSplit: 0, maxPrice: 2000,
  weekendHolding: null, newsTrading: null, eaAllowed: null, copyTrading: null,
  noMinDays: null, usAccepted: null, instantFundingOnly: false, sortBy: 'featured',
};

export function AppShell() {
  const { userProfile, setUserProfile, rewardPoints } = useAuth();
  const { firms, loading: catalogLoading, error: catalogError } = useCatalog();

  // --- Navigation ---
  const [activeTab, setActiveTab] = useState<TabType>('firms');
  const [selectedMarket, setSelectedMarket] = useState<'Forex' | 'Futures' | 'Crypto'>('Futures');
  const [currency] = useState<'USD' | 'EUR' | 'GBP'>('USD');

  // --- Filters ---
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [activeSubTab, setActiveSubTab] = useState<SubTabType>('Firms');
  const [activeFilterPill, setActiveFilterPill] = useState<'popular' | 'favorite' | 'new' | 'all'>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('grid');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // --- Compare ---
  const [comparedItems, setComparedItems] = useState<{ firm: PropFirm; plan: AccountPlan }[]>([]);

  // --- Favorites ---
  const [savedFirmIds, setSavedFirmIds] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('pfm_saved_firms') || '[]'); } catch { return []; }
  });

  // --- Price alerts ---
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>([]);

  // --- Calculator ---
  const [calculatorFirm, setCalculatorFirm] = useState<PropFirm | null>(null);
  const [calculatorPlan, setCalculatorPlan] = useState<AccountPlan | null>(null);

  // --- Error ---
  const [actionError, setActionError] = useState('');

  // --- Modal state ---
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [giveawayModalOpen, setGiveawayModalOpen] = useState(false);
  const [loyaltyModalOpen, setLoyaltyModalOpen] = useState(false);
  const [methodologyModalOpen, setMethodologyModalOpen] = useState(false);
  const [hiringModalOpen, setHiringModalOpen] = useState(false);
  const [tutorialsModalOpen, setTutorialsModalOpen] = useState(false);
  const [appLauncherOpen, setAppLauncherOpen] = useState(false);
  const [isGoogleGroundingOpen, setIsGoogleGroundingOpen] = useState(false);
  const [googleGroundingInitialQuery, setGoogleGroundingInitialQuery] = useState('');
  const [detailsFirm, setDetailsFirm] = useState<{ firm: PropFirm; plan: AccountPlan } | null>(null);
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [savedModalOpen, setSavedModalOpen] = useState(false);
  const [writeReviewFirm, setWriteReviewFirm] = useState<PropFirm | null>(null);
  const [priceAlertModalOpen, setPriceAlertModalOpen] = useState(false);
  const [priceAlertContext, setPriceAlertContext] = useState<{ firm?: PropFirm; plan?: AccountPlan } | null>(null);
  const [priceAlertsManagementModalOpen, setPriceAlertsManagementModalOpen] = useState(false);
  const [simulatedPriceDropToast, setSimulatedPriceDropToast] = useState<{
    alert: PriceAlert; simulatedNewPrice: number; discountPercent: number; couponCode: string;
  } | null>(null);

  // --- Effects ---

  useEffect(() => {
    if (userProfile?.favoriteFirmIds) {
      setSavedFirmIds(userProfile.favoriteFirmIds);
    } else if (!userProfile) {
      setSavedFirmIds([]);
      setPriceAlerts([]);
    }
  }, [userProfile?.uid]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('tab') === 'affiliates' || params.get('tab') === 'affiliate') setActiveTab('affiliates');
    if (params.get('ref')) localStorage.setItem('pfm_referral_attribution', params.get('ref')!);

    const handleHash = () => {
      const hash = window.location.hash;
      if (hash === '#rules') setMethodologyModalOpen(true);
      else if (hash === '#payouts') setActiveTab('payouts');
      else if (hash === '#offers') setActiveTab('discounts');
      else if (hash === '#challenges' || hash === '#compare') setActiveTab('compare');
      else if (hash === '#firms') setActiveTab('firms');
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  useEffect(() => {
    if (!userProfile?.uid) return;
    return subscribeUserPriceAlerts(userProfile.uid, (alerts) => { if (alerts) setPriceAlerts(alerts); }, () => {});
  }, [userProfile?.uid]);

  // --- Handlers ---

  const handleToggleSave = async (firmId: string) => {
    let nextIds: string[];
    if (savedFirmIds.includes(firmId)) {
      nextIds = savedFirmIds.filter(id => id !== firmId);
    } else {
      nextIds = savedFirmIds.length >= 3 ? [...savedFirmIds.slice(1), firmId] : [...savedFirmIds, firmId];
    }
    setSavedFirmIds(nextIds);
    localStorage.setItem('pfm_saved_firms', JSON.stringify(nextIds));
    if (userProfile?.uid) {
      try {
        await updateUserFavorites(userProfile.uid, nextIds);
        setUserProfile(prev => prev ? { ...prev, favoriteFirmIds: nextIds } : null);
      } catch {
        setSavedFirmIds(savedFirmIds);
        localStorage.setItem('pfm_saved_firms', JSON.stringify(savedFirmIds));
        setActionError('Could not save your favorites. Please try again.');
      }
    }
  };

  const handleToggleCompare = (firm: PropFirm, plan: AccountPlan) => {
    if (!plan) return;
    setComparedItems(prev => {
      if (prev.some(it => it.firm.id === firm.id)) return prev.filter(it => it.firm.id !== firm.id);
      return prev.length >= 4 ? [...prev.slice(1), { firm, plan }] : [...prev, { firm, plan }];
    });
  };

  const handleOpenDetails = (firm: PropFirm, plan: AccountPlan) => setDetailsFirm({ firm, plan });

  const browseFirmsFromComparison = () => {
    setActiveTab('firms');
    window.setTimeout(() => document.getElementById('firm-directory')?.scrollIntoView({ behavior: 'smooth' }), 0);
  };

  const handleOpenCalculator = (firm: PropFirm, plan: AccountPlan) => {
    setCalculatorFirm(firm);
    setCalculatorPlan(plan);
    setActiveTab('calculator');
    setDetailsFirm(null);
  };

  const handleAddReview = (firmId: string, newReview: FirmReview) => {
    // Reviews are appended locally; catalog context could be extended to support this
  };

  const handleOpenPriceAlert = (firm?: PropFirm, plan?: AccountPlan) => {
    setPriceAlertContext({ firm, plan });
    setPriceAlertModalOpen(true);
  };

  const handleAlertCreated = (newAlert: PriceAlert) => {
    setPriceAlerts(prev => [newAlert, ...prev.filter(a => a.id !== newAlert.id)]);
    rewardPoints(25);
  };

  const openGoogleGrounding = () => { setGoogleGroundingInitialQuery(''); setIsGoogleGroundingOpen(true); };

  // --- Filtered firms ---

  const filteredFirms = useMemo(() => {
    return firms
      .filter(firm => {
        if (selectedMarket === 'Futures' && !firm.supportedMarkets.includes('Futures')) return false;
        if (selectedMarket === 'Forex' && !firm.supportedMarkets.includes('Forex')) return false;
        if (selectedMarket === 'Crypto' && !firm.supportedMarkets.includes('Crypto')) return false;
        if (filters.search.trim()) {
          const q = filters.search.toLowerCase();
          if (![firm.name, ...firm.availablePlatforms, ...firm.supportedMarkets, firm.headquarters, firm.featuredBadge || '']
            .some(v => v.toLowerCase().includes(q))) return false;
        }
        if (activeSubTab === 'Offers' && !firm.exclusiveDiscount) return false;
        if (filters.weekendHolding === true && !firm.rules.weekendHolding) return false;
        if (filters.newsTrading === true && !firm.rules.newsTrading) return false;
        if (filters.eaAllowed === true && !firm.rules.eaAlgoTrading) return false;
        if (filters.usAccepted === true && !firm.usTradersAccepted) return false;
        return true;
      })
      .sort((a, b) => {
        if (activeFilterPill === 'popular') return (b.popularityLikes || 0) - (a.popularityLikes || 0);
        if (activeFilterPill === 'new') return (a.yearsInOperation || 1) - (b.yearsInOperation || 1);
        return (a.rankPosition || 99) - (b.rankPosition || 99);
      });
  }, [firms, filters, selectedMarket, activeSubTab, activeFilterPill]);

  const comparedFirmIds = useMemo(() => comparedItems.map(it => it.firm.id), [comparedItems]);

  // --- Render ---

  return (
    <div className="min-h-screen bg-[#171918] text-[#f1f3f2] flex flex-col font-sans selection:bg-emerald-600 selection:text-white">

      {(catalogLoading || catalogError || !firms.length) && <div role="status" className="border-b border-[#2b2e2c] bg-[#1d1f1e] px-6 py-2 text-center text-xs text-[#9a9e9b]">
        {catalogLoading ? 'Loading firm catalog…' : catalogError || 'The first catalog import is not ready yet. Refresh shortly.'}
      </div>}

      {actionError && (
        <div role="alert" className="bg-red-950/60 border-b border-red-900/30 p-3 text-center text-sm text-red-200">
          {actionError}
          <button className="ml-4 underline" onClick={() => setActionError('')}>Dismiss</button>
        </div>
      )}

      <Navbar
        activeTab={activeTab} setActiveTab={setActiveTab}
        activeSubTab={activeSubTab} setActiveSubTab={setActiveSubTab}
        selectedMarket={selectedMarket} setSelectedMarket={setSelectedMarket}
        searchQuery={filters.search} setSearchQuery={q => setFilters(prev => ({ ...prev, search: q }))}
        savedFirmsCount={savedFirmIds.length} openSavedModal={() => setSavedModalOpen(true)}
        userProfile={userProfile} onOpenAuth={() => setAuthModalOpen(true)}
        onOpenGiveaway={() => setGiveawayModalOpen(true)} onOpenHiring={() => setHiringModalOpen(true)}
        onOpenTutorials={() => setTutorialsModalOpen(true)} onOpenAppLauncher={() => setAppLauncherOpen(true)}
        onOpenLoyaltyModal={() => setLoyaltyModalOpen(true)} onOpenCompareModal={() => setCompareModalOpen(true)}
        onSelectRulesModal={() => setMethodologyModalOpen(true)}
        priceAlertsCount={priceAlerts.filter(a => a.active).length}
        onOpenPriceAlertsModal={() => setPriceAlertsManagementModalOpen(true)}
        onOpenGoogleGrounding={openGoogleGrounding}
      />

      {/* Page router */}
      {activeTab === 'firms' && (
        <FirmsPage
          firms={firms} filteredFirms={filteredFirms}
          filters={filters} setFilters={setFilters} resetFilters={() => setFilters(INITIAL_FILTERS)}
          activeSubTab={activeSubTab} setActiveSubTab={setActiveSubTab}
          activeFilterPill={activeFilterPill} setActiveFilterPill={setActiveFilterPill}
          viewMode={viewMode} setViewMode={setViewMode}
          filterDrawerOpen={filterDrawerOpen} setFilterDrawerOpen={setFilterDrawerOpen}
          currency={currency} savedFirmIds={savedFirmIds} comparedFirmIds={comparedFirmIds}
          onToggleSave={handleToggleSave} onToggleCompare={handleToggleCompare}
          onOpenDetails={handleOpenDetails} onOpenCalculator={handleOpenCalculator}
          onOpenPriceAlert={handleOpenPriceAlert} onOpenMethodology={() => setMethodologyModalOpen(true)}
          onOpenLoyalty={() => setLoyaltyModalOpen(true)} onOpenGoogleGrounding={openGoogleGrounding}
          onOpenAuth={() => setAuthModalOpen(true)} userProfile={userProfile}
          onNavigate={setActiveTab} onOpenAlerts={() => setPriceAlertsManagementModalOpen(true)}
        />
      )}

      {activeTab === 'compare' && (
        <ComparePage
          items={comparedItems}
          onRemoveItem={id => setComparedItems(prev => prev.filter(it => it.firm.id !== id))}
          onClearAll={() => setComparedItems([])}
          onChangePlan={(id, plan) => setComparedItems(prev => prev.map(it => it.firm.id === id ? { ...it, plan } : it))}
          onClose={browseFirmsFromComparison}
          currency={currency}
        />
      )}

      {activeTab === 'discounts' && (
        <DiscountsPage firms={firms} onSelectFirm={(firm, plan) => handleOpenDetails(firm, plan)} />
      )}

      {activeTab === 'payouts' && <PayoutsPage currency={currency} />}

      {activeTab === 'calculator' && (
        <CalculatorPage firms={firms} initialFirm={calculatorFirm} initialPlan={calculatorPlan} currency={currency} />
      )}

      {activeTab === 'quiz' && (
        <QuizPage firms={firms} onSelectFirm={(firm, plan) => handleOpenDetails(firm, plan)} currency={currency} />
      )}

      {activeTab === 'affiliates' && (
        <AffiliatePage
          firms={firms} userProfile={userProfile}
          onOpenAuth={() => setAuthModalOpen(true)}
          onSelectFirmDetails={(firm, plan) => handleOpenDetails(firm, plan)}
        />
      )}

      {/* Floating comparison bar */}
      {comparedItems.length > 0 && !compareModalOpen && (
        <div className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#1d1f1e]/95 border border-[#3ecf8e]/30 rounded-xl p-3 sm:p-3.5 shadow-xl flex items-center gap-3 backdrop-blur-md">
          <div className="flex -space-x-2 overflow-hidden items-center">
            {comparedItems.map(it => (
              <img key={it.firm.id} src={it.firm.logo} alt={it.firm.name} className="w-8 h-8 rounded-full border-2 border-[#1d1f1e] object-cover" />
            ))}
          </div>
          <div>
            <div className="text-xs font-semibold text-[#f1f3f2]">{comparedItems.length} of 4 Firms in Comparison</div>
            <div className="text-[10px] text-[#747976]">Head-to-head metrics ready</div>
          </div>
          <button
            onClick={() => setCompareModalOpen(true)}
            className="px-3.5 py-1.5 rounded-lg bg-[#3ecf8e] hover:bg-[#4eda9a] text-[#171918] font-semibold text-xs flex items-center gap-1 cursor-pointer transition-colors duration-150"
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Open Matrix</span>
          </button>
        </div>
      )}

      <FloatingChatWidget firms={firms} onSelectFirm={f => handleOpenDetails(f, f.plans[0])} />

      <MegaFooter
        onOpenMethodology={() => setMethodologyModalOpen(true)}
        onOpenHiring={() => setHiringModalOpen(true)}
        onOpenTutorials={() => setTutorialsModalOpen(true)}
        onOpenLoyaltyModal={() => setLoyaltyModalOpen(true)}
        onSelectTab={tab => setActiveTab(tab as TabType)}
        onSelectMarket={m => {
          if (m === 'Futures' || m === 'Forex' || m === 'Crypto') { setSelectedMarket(m); setActiveTab('firms'); }
        }}
      />

      {/* === Modals === */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} onSuccess={() => {}} />
      <GiveawayModal isOpen={giveawayModalOpen} onClose={() => setGiveawayModalOpen(false)} userProfile={userProfile} onOpenAuth={() => setAuthModalOpen(true)} onEnteredGiveaway={pts => rewardPoints(pts)} />
      <LoyaltyPointsModal isOpen={loyaltyModalOpen} onClose={() => setLoyaltyModalOpen(false)} userProfile={userProfile} onOpenAuth={() => setAuthModalOpen(true)} onPointsUpdated={newTotal => setUserProfile(prev => prev ? { ...prev, loyaltyPoints: newTotal } : null)} />
      <VerificationMethodologyModal isOpen={methodologyModalOpen} onClose={() => setMethodologyModalOpen(false)} />
      <WeAreHiringModal isOpen={hiringModalOpen} onClose={() => setHiringModalOpen(false)} />
      <TutorialsModal isOpen={tutorialsModalOpen} onClose={() => setTutorialsModalOpen(false)} />
      <AppLauncherModal isOpen={appLauncherOpen} onClose={() => setAppLauncherOpen(false)} onSelectApp={appName => {
        if (appName === 'Google Search Intel') openGoogleGrounding();
        if (appName === 'Futures Explorer') setSelectedMarket('Futures');
        if (appName === 'Forex Matcher') setSelectedMarket('Forex');
        if (appName === 'Drawdown Calculator') setActiveTab('calculator');
        if (appName === 'Trader Academy') setTutorialsModalOpen(true);
      }} />
      <GoogleSearchGroundingModal isOpen={isGoogleGroundingOpen} onClose={() => setIsGoogleGroundingOpen(false)} firms={firms} onSelectFirm={firm => { setIsGoogleGroundingOpen(false); handleOpenDetails(firm, firm.plans[0]); }} initialQuery={googleGroundingInitialQuery} />

      {detailsFirm && (
        <FirmDetailsModal firm={detailsFirm.firm} initialPlan={detailsFirm.plan} currency={currency}
          onClose={() => setDetailsFirm(null)} onOpenCalculator={handleOpenCalculator}
          onOpenWriteReview={f => setWriteReviewFirm(f)} onOpenPriceAlert={(f, p) => handleOpenPriceAlert(f, p)} />
      )}
      {compareModalOpen && (
        <ComparisonMatrixModal items={comparedItems}
          onRemoveItem={id => setComparedItems(prev => prev.filter(it => it.firm.id !== id))}
          onClearAll={() => setComparedItems([])}
          onChangePlan={(id, plan) => setComparedItems(prev => prev.map(it => it.firm.id === id ? { ...it, plan } : it))}
          onClose={() => setCompareModalOpen(false)} currency={currency} />
      )}
      {savedModalOpen && (
        <SavedWatchlistModal savedFirmIds={savedFirmIds} firms={firms} onToggleSave={handleToggleSave}
          onOpenDetails={handleOpenDetails} onToggleCompare={handleToggleCompare} comparedFirmIds={comparedFirmIds}
          onClose={() => setSavedModalOpen(false)} currency={currency} />
      )}
      {writeReviewFirm && (
        <WriteReviewModal firm={writeReviewFirm} userProfile={userProfile} onClose={() => setWriteReviewFirm(null)}
          onSubmitReview={handleAddReview} onRewardPoints={rewardPoints} />
      )}
      <PriceAlertModal isOpen={priceAlertModalOpen} onClose={() => { setPriceAlertModalOpen(false); setPriceAlertContext(null); }}
        initialFirm={priceAlertContext?.firm} initialPlan={priceAlertContext?.plan} allFirms={firms}
        userProfile={userProfile} onOpenAuth={() => setAuthModalOpen(true)} onAlertCreated={handleAlertCreated} />
      <PriceAlertsManagementModal isOpen={priceAlertsManagementModalOpen} onClose={() => setPriceAlertsManagementModalOpen(false)}
        alerts={priceAlerts} allFirms={firms} userProfile={userProfile} onOpenAuth={() => setAuthModalOpen(true)}
        onOpenCreateModal={() => { setPriceAlertsManagementModalOpen(false); handleOpenPriceAlert(); }}
        onSimulatePriceDrop={alert => { setSimulatedPriceDropToast({ alert, simulatedNewPrice: Math.max(10, Math.round(alert.currentPrice * 0.6)), discountPercent: 40, couponCode: 'PFMFLASH40' }); }}
        onSelectFirmDetails={(firm, plan) => { setPriceAlertsManagementModalOpen(false); handleOpenDetails(firm, plan); }}
        onAlertUpdated={(updated: PriceAlert) => setPriceAlerts(prev => prev.map(a => a.id === updated.id ? updated : a))}
        onAlertDeleted={(id: string) => setPriceAlerts(prev => prev.filter(a => a.id !== id))} />
      {simulatedPriceDropToast && (
        <PriceAlertToast alert={simulatedPriceDropToast.alert} simulatedNewPrice={simulatedPriceDropToast.simulatedNewPrice}
          discountPercent={simulatedPriceDropToast.discountPercent} couponCode={simulatedPriceDropToast.couponCode}
          onClose={() => setSimulatedPriceDropToast(null)}
          onViewDeal={(firmId, planId) => { const firm = firms.find(f => f.id === firmId); if (firm) handleOpenDetails(firm, firm.plans.find(p => p.id === planId) || firm.plans[0]); }} />
      )}
    </div>
  );
}
