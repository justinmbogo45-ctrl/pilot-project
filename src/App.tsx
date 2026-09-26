import React, { useState, useMemo, useEffect } from 'react';
import { AnnouncementBanner } from './components/AnnouncementBanner';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ExclusiveOffersCarousel } from './components/ExclusiveOffersCarousel';
import { SubTabsBar, SubTabType } from './components/SubTabsBar';
import { FirmTableView } from './components/FirmTableView';
import { FilterBar } from './components/FilterBar';
import { FirmCard } from './components/FirmCard';
import { HomepageFAQ } from './components/HomepageFAQ';
import { WelcomeBonusBanner } from './components/WelcomeBonusBanner';
import { MegaFooter } from './components/MegaFooter';

import { AuthModal } from './components/AuthModal';
import { GiveawayModal } from './components/GiveawayModal';
import { LoyaltyPointsModal } from './components/LoyaltyPointsModal';
import { VerificationMethodologyModal } from './components/VerificationMethodologyModal';
import { WeAreHiringModal } from './components/WeAreHiringModal';
import { TutorialsModal } from './components/TutorialsModal';
import { AppLauncherModal } from './components/AppLauncherModal';
import { FloatingChatWidget } from './components/FloatingChatWidget';
import { GoogleSearchGroundingModal } from './components/GoogleSearchGroundingModal';

import { FirmDetailsModal } from './components/FirmDetailsModal';
import { ComparisonMatrixModal } from './components/ComparisonMatrixModal';
import { SavedWatchlistModal } from './components/SavedWatchlistModal';
import { WriteReviewModal } from './components/WriteReviewModal';
import { DiscountsHub } from './components/DiscountsHub';
import { PayoutProofsModal } from './components/PayoutProofsModal';
import { FeeCalculator } from './components/FeeCalculator';
import { FirmMatchQuiz } from './components/FirmMatchQuiz';
import { PriceAlertModal } from './components/PriceAlertModal';
import { PriceAlertsManagementModal } from './components/PriceAlertsManagementModal';
import { PriceAlertToast } from './components/PriceAlertToast';
import { AffiliatePortal } from './components/AffiliatePortal';

import { mapCatalogFirm } from './lib/catalog';
import { PropFirm, AccountPlan, FilterState, FirmReview, PriceAlert } from './types';
import { auth, syncUserProfile, UserProfileData, subscribeUserPriceAlerts, updateUserFavorites } from './lib/api';
import { onAuthStateChanged } from 'firebase/auth';
import { Scale, LayoutGrid, Table } from 'lucide-react';

const INITIAL_FILTERS: FilterState = {
  search: '',
  market: 'All',
  challengeType: 'All',
  accountSize: 'All',
  platforms: [],
  drawdownType: 'All',
  minProfitSplit: 0,
  maxPrice: 2000,
  weekendHolding: null,
  newsTrading: null,
  eaAllowed: null,
  copyTrading: null,
  noMinDays: null,
  usAccepted: null,
  instantFundingOnly: false,
  sortBy: 'featured',
};

export default function App() {
  const [firms, setFirms] = useState<PropFirm[]>([]);
  const [activeTab, setActiveTab] = useState<'firms' | 'compare' | 'quiz' | 'calculator' | 'discounts' | 'payouts' | 'affiliates'>('firms');
  const [selectedMarket, setSelectedMarket] = useState<'Forex' | 'Futures' | 'Crypto'>('Futures');
  const [activeSubTab, setActiveSubTab] = useState<SubTabType>('Firms');
  const [activeFilterPill, setActiveFilterPill] = useState<'popular' | 'favorite' | 'new' | 'all'>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table'); // default table view per screenshots
  const [currency, setCurrency] = useState<'USD' | 'EUR' | 'GBP'>('USD');
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // User Profile & Firebase Auth State
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);

  // Modals state
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
  const [calculatorFirm, setCalculatorFirm] = useState<PropFirm | null>(null);
  const [calculatorPlan, setCalculatorPlan] = useState<AccountPlan | null>(null);

  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState('');
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [actionError, setActionError] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/catalog', { signal: controller.signal }).then(async response => {
      if (!response.ok) throw new Error('Unable to load the firm catalog. Please try again.');
      const payload = await response.json();
      setFirms(payload.data.map(mapCatalogFirm));
      setLastSyncedAt(payload.meta.lastSyncedAt);
    }).catch(error => { if (!controller.signal.aborted) setCatalogError(error.message); })
      .finally(() => { if (!controller.signal.aborted) setCatalogLoading(false); });
    return () => controller.abort();
  }, []);
  const [comparedItems, setComparedItems] = useState<{ firm: PropFirm; plan: AccountPlan }[]>([]);

  // Saved / Favorite Firms (max 3 per screenshot: "Favorite Firms 0/3")
  const [savedFirmIds, setSavedFirmIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('pfm_saved_firms');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const profile = await syncUserProfile(currentUser);
          setUserProfile(profile);
          if (profile.favoriteFirmIds) {
            setSavedFirmIds(profile.favoriteFirmIds);
          }
        } catch (e) {
          setActionError('Signed in, but your profile could not be loaded. Please sign in again.');
        }
      } else {
        setUserProfile(null);
        setSavedFirmIds([]);
        setPriceAlerts([]);
      }
    });
    return () => unsubscribe();
  }, []);

  // Check URL params for affiliate tab or referral tracking
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam === 'affiliates' || tabParam === 'affiliate') {
        setActiveTab('affiliates');
      }
      const refParam = params.get('ref');
      if (refParam) {
        localStorage.setItem('pfm_referral_attribution', refParam);
      }
    } catch {
      // Ignore URL parsing errors
    }

    // Handle hash links like #rules, #payouts, #offers
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash === '#rules') {
        setMethodologyModalOpen(true);
      } else if (hash === '#payouts') {
        setActiveTab('payouts');
      } else if (hash === '#offers') {
        setActiveTab('discounts');
      } else if (hash === '#challenges' || hash === '#compare') {
        setActiveTab('compare');
      } else if (hash === '#firms') {
        setActiveTab('firms');
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Save favorites to localStorage and PostgreSQL
  const handleToggleSave = async (firmId: string) => {
    let nextIds: string[];
    if (savedFirmIds.includes(firmId)) {
      nextIds = savedFirmIds.filter((id) => id !== firmId);
    } else {
      if (savedFirmIds.length >= 3) {
        // limit to 3 as displayed in header
        nextIds = [...savedFirmIds.slice(1), firmId];
      } else {
        nextIds = [...savedFirmIds, firmId];
      }
    }
    setSavedFirmIds(nextIds);
    localStorage.setItem('pfm_saved_firms', JSON.stringify(nextIds));

    // Update PostgreSQL if signed in
    if (userProfile?.uid) {
      try {
        await updateUserFavorites(userProfile.uid, nextIds);
        setUserProfile((prev) => (prev ? { ...prev, favoriteFirmIds: nextIds } : null));
      } catch (err) {
        setSavedFirmIds(savedFirmIds);
        localStorage.setItem('pfm_saved_firms', JSON.stringify(savedFirmIds));
        setActionError('Could not save your favorites. Please try again.');
      }
    }
  };

  const handleToggleCompare = (firm: PropFirm, plan: AccountPlan) => {
    if (!plan) return;
    setComparedItems((prev) => {
      const exists = prev.some((it) => it.firm.id === firm.id);
      if (exists) {
        return prev.filter((it) => it.firm.id !== firm.id);
      }
      if (prev.length >= 4) {
        return [...prev.slice(1), { firm, plan }];
      }
      return [...prev, { firm, plan }];
    });
  };

  const handleRemoveCompareItem = (firmId: string) => {
    setComparedItems((prev) => prev.filter((it) => it.firm.id !== firmId));
  };

  const handleClearAllCompare = () => {
    setComparedItems([]);
  };

  const handleChangeComparePlan = (firmId: string, newPlan: AccountPlan) => {
    setComparedItems((prev) =>
      prev.map((it) => (it.firm.id === firmId ? { ...it, plan: newPlan } : it))
    );
  };

  const handleOpenCalculator = (firm: PropFirm, plan: AccountPlan) => {
    setCalculatorFirm(firm);
    setCalculatorPlan(plan);
    setActiveTab('calculator');
    setDetailsFirm(null);
  };

  const handleOpenDetails = (firm: PropFirm, plan: AccountPlan) => {
    setDetailsFirm({ firm, plan });
  };

  const handleAddReview = (firmId: string, newReview: FirmReview) => {
    setFirms((prev) =>
      prev.map((f) => {
        if (f.id === firmId) {
          const updatedReviews = [newReview, ...f.reviews];
          return {
            ...f,
            reviews: updatedReviews,

          };
        }
        return f;
      })
    );
  };

  const handleRewardPoints = (points: number) => {
    setUserProfile((prev) => (prev ? { ...prev, loyaltyPoints: prev.loyaltyPoints + points } : null));
  };

  // Price Alerts State
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>([]);

  const [priceAlertModalOpen, setPriceAlertModalOpen] = useState(false);
  const [priceAlertContext, setPriceAlertContext] = useState<{ firm?: PropFirm; plan?: AccountPlan } | null>(null);
  const [priceAlertsManagementModalOpen, setPriceAlertsManagementModalOpen] = useState(false);
  const [simulatedPriceDropToast, setSimulatedPriceDropToast] = useState<{
    alert: PriceAlert;
    simulatedNewPrice: number;
    discountPercent: number;
    couponCode: string;
  } | null>(null);

  // Sync price alerts in real-time from PostgreSQL when authenticated
  useEffect(() => {
    if (!userProfile?.uid) return;
    const unsub = subscribeUserPriceAlerts(
      userProfile.uid,
      (storedAlerts) => {
        if (storedAlerts) {
          setPriceAlerts(storedAlerts);

        }
      },
      (err) => {
        console.warn('Real-time listener for price alerts encountered an issue:', err);
      }
    );
    return () => {
      if (unsub) unsub();
    };
  }, [userProfile?.uid]);

  const handleOpenPriceAlert = (firm?: PropFirm, plan?: AccountPlan) => {
    setPriceAlertContext({ firm, plan });
    setPriceAlertModalOpen(true);
  };

  const handleAlertCreated = (newAlert: PriceAlert) => {
    setPriceAlerts((prev) => {
      const next = [newAlert, ...prev.filter((a) => a.id !== newAlert.id)];

      return next;
    });
    // Award 25 loyalty points for setting a price tracking alert
    handleRewardPoints(25);
  };

  const handleSimulatePriceDrop = (alert: PriceAlert) => {
    const discount = 40;
    const discountedPrice = Math.max(10, Math.round(alert.currentPrice * 0.6));
    setSimulatedPriceDropToast({
      alert,
      simulatedNewPrice: discountedPrice,
      discountPercent: discount,
      couponCode: 'PFMFLASH40',
    });
  };

  // Filter & Sort Pipeline
  const filteredFirms = useMemo(() => {
    return firms
      .filter((firm) => {
        // Market selection
        if (selectedMarket === 'Futures') {
          if (!firm.supportedMarkets.includes('Futures')) return false;
        } else if (selectedMarket === 'Forex') {
          if (!firm.supportedMarkets.includes('Forex')) return false;
        } else if (selectedMarket === 'Crypto') {
          if (!firm.supportedMarkets.includes('Crypto')) return false;
        }

        // Global Search
        if (filters.search.trim()) {
          const q = filters.search.toLowerCase();
          const matchName = firm.name.toLowerCase().includes(q);
          const matchPlatform = firm.availablePlatforms.some((p) => p.toLowerCase().includes(q));
          const matchMarket = firm.supportedMarkets.some((m) => m.toLowerCase().includes(q));
          const matchHq = firm.headquarters.toLowerCase().includes(q);
          const matchBadge = firm.featuredBadge?.toLowerCase().includes(q);
          if (!matchName && !matchPlatform && !matchMarket && !matchHq && !matchBadge) {
            return false;
          }
        }

        // Sub-Tab selection
        if (activeSubTab === 'Offers') {
          if (!firm.exclusiveDiscount) return false;
        }

        // Rules
        if (filters.weekendHolding === true && !firm.rules.weekendHolding) return false;
        if (filters.newsTrading === true && !firm.rules.newsTrading) return false;
        if (filters.eaAllowed === true && !firm.rules.eaAlgoTrading) return false;
        if (filters.usAccepted === true && !firm.usTradersAccepted) return false;

        return true;
      })
      .sort((a, b) => {
        if (activeFilterPill === 'popular') {
          return (b.popularityLikes || 0) - (a.popularityLikes || 0);
        }
        if (activeFilterPill === 'new') {
          return (a.yearsInOperation || 1) - (b.yearsInOperation || 1);
        }
        return (a.rankPosition || 99) - (b.rankPosition || 99);
      });
  }, [firms, filters, selectedMarket, activeSubTab, activeFilterPill]);

  const comparedFirmIds = useMemo(() => comparedItems.map((it) => it.firm.id), [comparedItems]);

  return (
    <div className="min-h-screen bg-[#0a0d18] text-slate-100 flex flex-col font-sans selection:bg-purple-600 selection:text-white">
      
      <div role="status" className="bg-slate-900 px-4 py-2 text-center text-xs text-slate-400">
        {catalogLoading ? 'Loading firm catalog…' : catalogError || (!firms.length ? 'The first catalog import is not ready yet. Refresh shortly.' : <>Source: <a href="https://propfirmmap.com" target="_blank" rel="noreferrer" className="text-emerald-400 underline">PropFirmMap</a> · {firms.length} firms · Synced {lastSyncedAt ? new Date(lastSyncedAt).toLocaleString() : 'not yet'} · Prices use the source currency.</>)}
      </div>
      {actionError && <div role="alert" className="bg-red-950 p-3 text-center text-sm">{actionError}<button className="ml-4 underline" onClick={() => setActionError('')}>Dismiss</button></div>}
      {/* Top Giveaway Announcement Banner */}
      <AnnouncementBanner onOpenGiveaway={() => setGiveawayModalOpen(true)} />

      {/* Main Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedMarket={selectedMarket}
        setSelectedMarket={setSelectedMarket}
        searchQuery={filters.search}
        setSearchQuery={(q) => setFilters((prev) => ({ ...prev, search: q }))}
        savedFirmsCount={savedFirmIds.length}
        openSavedModal={() => setSavedModalOpen(true)}
        userProfile={userProfile}
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenGiveaway={() => setGiveawayModalOpen(true)}
        onOpenHiring={() => setHiringModalOpen(true)}
        onOpenTutorials={() => setTutorialsModalOpen(true)}
        onOpenAppLauncher={() => setAppLauncherOpen(true)}
        onOpenLoyaltyModal={() => setLoyaltyModalOpen(true)}
        onOpenCompareModal={() => setCompareModalOpen(true)}
        onSelectRulesModal={() => setMethodologyModalOpen(true)}
        priceAlertsCount={priceAlerts.filter((a) => a.active).length}
        onOpenPriceAlertsModal={() => setPriceAlertsManagementModalOpen(true)}
        onOpenGoogleGrounding={() => {
          setGoogleGroundingInitialQuery('');
          setIsGoogleGroundingOpen(true);
        }}
      />

      {/* MAIN CONTENT ROUTER */}
      {activeTab === 'firms' && (
        <main className="flex-1 pb-16">
          
          {/* Hero Section with Trust Badges */}
          <HeroSection 
            onOpenGoogleGrounding={() => {
              setGoogleGroundingInitialQuery('');
              setIsGoogleGroundingOpen(true);
            }} 
          />

          {/* Exclusive September Futures Offers Carousel (8 items grid) */}
          <ExclusiveOffersCarousel
            firms={firms}
            onSelectFirm={(f) => handleOpenDetails(f, f.plans[0])}
            onOpenLoyaltyModal={() => setLoyaltyModalOpen(true)}
          />

          {/* Sub Tabs Pill Selector: Firms | Challenges | Offers | Reviews */}
          <SubTabsBar
            activeSubTab={activeSubTab}
            setActiveSubTab={(tab) => {
              setActiveSubTab(tab);
              if (tab === 'Offers') {
                // filter to firms with discounts
              }
            }}
          />

          {/* Table Container */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* View switcher (Table / Grid) */}
            <div className="flex justify-end pt-4 pb-1">
              <div className="inline-flex p-1 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-1 rounded flex items-center gap-1.5 transition-all ${
                    viewMode === 'table' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Table className="w-3.5 h-3.5" />
                  <span>Table View</span>
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1 rounded flex items-center gap-1.5 transition-all ${
                    viewMode === 'grid' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Cards Grid</span>
                </button>
              </div>
            </div>

            {/* Advanced Filters Drawer (shown when user clicks 'Filter') */}
            {filterDrawerOpen && (
              <div className="mb-4">
                <FilterBar
                  filters={filters}
                  setFilters={setFilters}
                  viewMode={viewMode}
                  setViewMode={setViewMode}
                  totalFilteredCount={filteredFirms.length}
                  onResetFilters={() => setFilters(INITIAL_FILTERS)}
                />
              </div>
            )}

            {/* Primary Table matching Screenshot 4 */}
            {viewMode === 'table' ? (
              <FirmTableView
                firms={filteredFirms}
                preferredSize={filters.accountSize}
                currency={currency}
                savedFirmIds={savedFirmIds}
                onToggleSave={handleToggleSave}
                onOpenDetails={handleOpenDetails}
                onOpenFilterDrawer={() => setFilterDrawerOpen(!filterDrawerOpen)}
                onOpenMethodologyModal={() => setMethodologyModalOpen(true)}
                activeFilterPill={activeFilterPill}
                setActiveFilterPill={setActiveFilterPill}
                onOpenPriceAlert={handleOpenPriceAlert}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-4">
                {filteredFirms.map((firm) => (
                  <FirmCard
                    key={firm.id}
                    firm={firm}
                    preferredSize={filters.accountSize}
                    currency={currency}
                    isCompared={comparedFirmIds.includes(firm.id)}
                    onToggleCompare={handleToggleCompare}
                    isSaved={savedFirmIds.includes(firm.id)}
                    onToggleSave={handleToggleSave}
                    onOpenDetails={handleOpenDetails}
                    onOpenCalculatorWithPlan={handleOpenCalculator}
                    onOpenPriceAlert={handleOpenPriceAlert}
                  />
                ))}
              </div>
            )}

          </div>

          {/* Welcome Bonus 200 LP Banner matching Screenshot 1 & 2 */}
          <WelcomeBonusBanner
            userProfile={userProfile}
            onOpenAuth={() => setAuthModalOpen(true)}
            onOpenLoyaltyModal={() => setLoyaltyModalOpen(true)}
          />

          {/* Homepage FAQ (Futures) matching Screenshot 3 */}
          <HomepageFAQ />

        </main>
      )}

      {/* TAB: COMPARE */}
      {activeTab === 'compare' && (
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <ComparisonMatrixModal
            items={comparedItems}
            onRemoveItem={handleRemoveCompareItem}
            onClearAll={handleClearAllCompare}
            onChangePlan={handleChangeComparePlan}
            onClose={() => setActiveTab('firms')}
            currency={currency}
          />
        </main>
      )}

      {/* TAB: DISCOUNTS */}
      {activeTab === 'discounts' && (
        <main className="flex-1 pb-16">
          <DiscountsHub
            firms={firms}
            onSelectFirm={(firm, plan) => {
              handleOpenDetails(firm, plan);
            }}
          />
        </main>
      )}

      {/* TAB: PAYOUTS */}
      {activeTab === 'payouts' && (
        <main className="flex-1 pb-16">
          <PayoutProofsModal currency={currency} />
        </main>
      )}

      {/* TAB: CALCULATOR */}
      {activeTab === 'calculator' && (
        <main className="flex-1 pb-16">
          <FeeCalculator
            firms={firms}
            initialFirm={calculatorFirm}
            initialPlan={calculatorPlan}
            currency={currency}
          />
        </main>
      )}

      {/* TAB: QUIZ */}
      {activeTab === 'quiz' && (
        <main className="flex-1 pb-16">
          <FirmMatchQuiz
            firms={firms}
            onSelectFirm={(firm, plan) => handleOpenDetails(firm, plan)}
            currency={currency}
          />
        </main>
      )}

      {/* TAB: AFFILIATES */}
      {activeTab === 'affiliates' && (
        <main className="flex-1 pb-16">
          <AffiliatePortal
            firms={firms}
            userProfile={userProfile}
            onOpenAuth={() => setAuthModalOpen(true)}
            onSelectFirmDetails={(firm, plan) => handleOpenDetails(firm, plan)}
          />
        </main>
      )}

      {/* Floating Comparison Bar (when items selected) */}
      {comparedItems.length > 0 && !compareModalOpen && (
        <div className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#131627]/95 border border-purple-500/50 rounded-2xl p-3 sm:p-3.5 shadow-2xl flex items-center gap-3 backdrop-blur-md">
          <div className="flex -space-x-2 overflow-hidden items-center">
            {comparedItems.map((it) => (
              <img
                key={it.firm.id}
                src={it.firm.logo}
                alt={it.firm.name}
                className="w-8 h-8 rounded-full border-2 border-[#131627] object-cover"
              />
            ))}
          </div>
          <div>
            <div className="text-xs font-bold text-white">
              {comparedItems.length} of 4 Firms in Comparison
            </div>
            <div className="text-[10px] text-slate-400">Head-to-head metrics ready</div>
          </div>
          <button
            onClick={() => setCompareModalOpen(true)}
            className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs flex items-center gap-1 shadow-md cursor-pointer"
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Open Matrix</span>
          </button>
        </div>
      )}

      {/* Floating Interactive Match Assistant Widget */}
      <FloatingChatWidget
        firms={firms}
        onSelectFirm={(f) => handleOpenDetails(f, f.plans[0])}
      />

      {/* Mega Footer matching Screenshot 1 & 2 */}
      <MegaFooter
        onOpenMethodology={() => setMethodologyModalOpen(true)}
        onOpenHiring={() => setHiringModalOpen(true)}
        onOpenTutorials={() => setTutorialsModalOpen(true)}
        onOpenLoyaltyModal={() => setLoyaltyModalOpen(true)}
        onSelectTab={(tab) => setActiveTab(tab as any)}
        onSelectMarket={(m) => {
          if (m === 'Futures' || m === 'Forex' || m === 'Crypto') {
            setSelectedMarket(m);
            setActiveTab('firms');
          }
        }}
      />

      {/* MODALS */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => {}}
      />

      <GiveawayModal
        isOpen={giveawayModalOpen}
        onClose={() => setGiveawayModalOpen(false)}
        userProfile={userProfile}
        onOpenAuth={() => setAuthModalOpen(true)}
        onEnteredGiveaway={(pts) => handleRewardPoints(pts)}
      />

      <LoyaltyPointsModal
        isOpen={loyaltyModalOpen}
        onClose={() => setLoyaltyModalOpen(false)}
        userProfile={userProfile}
        onOpenAuth={() => setAuthModalOpen(true)}
        onPointsUpdated={(newTotal) => {
          setUserProfile((prev) => (prev ? { ...prev, loyaltyPoints: newTotal } : null));
        }}
      />

      <VerificationMethodologyModal
        isOpen={methodologyModalOpen}
        onClose={() => setMethodologyModalOpen(false)}
      />

      <WeAreHiringModal
        isOpen={hiringModalOpen}
        onClose={() => setHiringModalOpen(false)}
      />

      <TutorialsModal
        isOpen={tutorialsModalOpen}
        onClose={() => setTutorialsModalOpen(false)}
      />

      <AppLauncherModal
        isOpen={appLauncherOpen}
        onClose={() => setAppLauncherOpen(false)}
        onSelectApp={(appName) => {
          if (appName === 'Google Search Intel') {
            setGoogleGroundingInitialQuery('');
            setIsGoogleGroundingOpen(true);
          }
          if (appName === 'Futures Explorer') setSelectedMarket('Futures');
          if (appName === 'Forex Matcher') setSelectedMarket('Forex');
          if (appName === 'Drawdown Calculator') setActiveTab('calculator');
          if (appName === 'Trader Academy') setTutorialsModalOpen(true);
        }}
      />

      <GoogleSearchGroundingModal
        isOpen={isGoogleGroundingOpen}
        onClose={() => setIsGoogleGroundingOpen(false)}
        firms={firms}
        onSelectFirm={(firm) => {
          setIsGoogleGroundingOpen(false);
          handleOpenDetails(firm, firm.plans[0]);
        }}
        initialQuery={googleGroundingInitialQuery}
      />

      {detailsFirm && (
        <FirmDetailsModal
          firm={detailsFirm.firm}
          initialPlan={detailsFirm.plan}
          currency={currency}
          onClose={() => setDetailsFirm(null)}
          onOpenCalculator={handleOpenCalculator}
          onOpenWriteReview={(f) => setWriteReviewFirm(f)}
          onOpenPriceAlert={(f, p) => handleOpenPriceAlert(f, p)}
        />
      )}

      {compareModalOpen && (
        <ComparisonMatrixModal
          items={comparedItems}
          onRemoveItem={handleRemoveCompareItem}
          onClearAll={handleClearAllCompare}
          onChangePlan={handleChangeComparePlan}
          onClose={() => setCompareModalOpen(false)}
          currency={currency}
        />
      )}

      {savedModalOpen && (
        <SavedWatchlistModal
          savedFirmIds={savedFirmIds}
          firms={firms}
          onToggleSave={handleToggleSave}
          onOpenDetails={handleOpenDetails}
          onToggleCompare={handleToggleCompare}
          comparedFirmIds={comparedFirmIds}
          onClose={() => setSavedModalOpen(false)}
          currency={currency}
        />
      )}

      {writeReviewFirm && (
        <WriteReviewModal
          firm={writeReviewFirm}
          userProfile={userProfile}
          onClose={() => setWriteReviewFirm(null)}
          onSubmitReview={handleAddReview}
          onRewardPoints={handleRewardPoints}
        />
      )}

      {/* PRICE ALERTS MODALS & TOAST */}
      <PriceAlertModal
        isOpen={priceAlertModalOpen}
        onClose={() => {
          setPriceAlertModalOpen(false);
          setPriceAlertContext(null);
        }}
        initialFirm={priceAlertContext?.firm}
        initialPlan={priceAlertContext?.plan}
        allFirms={firms}
        userProfile={userProfile}
        onOpenAuth={() => setAuthModalOpen(true)}
        onAlertCreated={handleAlertCreated}
      />

      <PriceAlertsManagementModal
        isOpen={priceAlertsManagementModalOpen}
        onClose={() => setPriceAlertsManagementModalOpen(false)}
        alerts={priceAlerts}
        allFirms={firms}
        userProfile={userProfile}
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenCreateModal={() => {
          setPriceAlertsManagementModalOpen(false);
          handleOpenPriceAlert();
        }}
        onSimulatePriceDrop={handleSimulatePriceDrop}
        onSelectFirmDetails={(firm, plan) => {
          setPriceAlertsManagementModalOpen(false);
          handleOpenDetails(firm, plan);
        }}
        onAlertUpdated={(updated: PriceAlert) => {
          setPriceAlerts((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
        }}
        onAlertDeleted={(alertId: string) => {
          setPriceAlerts((prev) => prev.filter((a) => a.id !== alertId));
        }}
      />

      {simulatedPriceDropToast && (
        <PriceAlertToast
          alert={simulatedPriceDropToast.alert}
          simulatedNewPrice={simulatedPriceDropToast.simulatedNewPrice}
          discountPercent={simulatedPriceDropToast.discountPercent}
          couponCode={simulatedPriceDropToast.couponCode}
          onClose={() => setSimulatedPriceDropToast(null)}
          onViewDeal={(firmId, planId) => {
            const firm = firms.find((f) => f.id === firmId);
            if (firm) {
              const plan = firm.plans.find((p) => p.id === planId) || firm.plans[0];
              handleOpenDetails(firm, plan);
            }
          }}
        />
      )}

    </div>
  );
}
