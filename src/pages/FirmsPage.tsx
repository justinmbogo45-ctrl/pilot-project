import React from 'react';
import { HeroSection } from '../components/HeroSection';
import { FeatureGrid } from '../components/FeatureGrid';
import { TrustStats } from '../components/TrustStats';
import { ExclusiveOffersCarousel } from '../components/ExclusiveOffersCarousel';
import { SubTabsBar, type SubTabType } from '../components/SubTabsBar';
import { FirmTableView } from '../components/FirmTableView';
import { FilterBar } from '../components/FilterBar';
import { FirmCard } from '../components/FirmCard';
import { WelcomeBonusBanner } from '../components/WelcomeBonusBanner';
import { HomepageFAQ } from '../components/HomepageFAQ';
import { Table, LayoutGrid } from 'lucide-react';
import type { PropFirm, AccountPlan, FilterState } from '../types';
import type { UserProfileData } from '../lib/api';

interface FirmsPageProps {
  firms: PropFirm[];
  filteredFirms: PropFirm[];
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  resetFilters: () => void;
  activeSubTab: SubTabType;
  setActiveSubTab: (tab: SubTabType) => void;
  activeFilterPill: 'popular' | 'favorite' | 'new' | 'all';
  setActiveFilterPill: (pill: 'popular' | 'favorite' | 'new' | 'all') => void;
  viewMode: 'table' | 'grid';
  setViewMode: (mode: 'table' | 'grid') => void;
  filterDrawerOpen: boolean;
  setFilterDrawerOpen: (open: boolean) => void;
  currency: 'USD' | 'EUR' | 'GBP';
  savedFirmIds: string[];
  comparedFirmIds: string[];
  onToggleSave: (firmId: string) => void;
  onToggleCompare: (firm: PropFirm, plan: AccountPlan) => void;
  onOpenDetails: (firm: PropFirm, plan: AccountPlan) => void;
  onOpenCalculator: (firm: PropFirm, plan: AccountPlan) => void;
  onOpenPriceAlert: (firm?: PropFirm, plan?: AccountPlan) => void;
  onOpenMethodology: () => void;
  onOpenLoyalty: () => void;
  onOpenGoogleGrounding: () => void;
  onNavigate: (tab: 'compare' | 'discounts' | 'payouts') => void;
  onOpenAlerts: () => void;
  onOpenAuth: () => void;
  userProfile: UserProfileData | null;
}

export const FirmsPage: React.FC<FirmsPageProps> = ({
  firms, filteredFirms, filters, setFilters, resetFilters,
  activeSubTab, setActiveSubTab, activeFilterPill, setActiveFilterPill,
  viewMode, setViewMode, filterDrawerOpen, setFilterDrawerOpen,
  currency, savedFirmIds, comparedFirmIds,
  onToggleSave, onToggleCompare, onOpenDetails, onOpenCalculator,
  onOpenPriceAlert, onOpenMethodology, onOpenLoyalty, onOpenGoogleGrounding,
  onOpenAuth, userProfile, onNavigate, onOpenAlerts,
}) => {
  return (
    <main className="flex-1 pb-16">
      <HeroSection firms={firms} onCompare={() => onNavigate('compare')} onBrowseOffers={() => document.getElementById('current-offers')?.scrollIntoView({ behavior: 'smooth' })} onOpenGoogleGrounding={onOpenGoogleGrounding} />

      <TrustStats firms={firms} />

      <ExclusiveOffersCarousel
        firms={firms}
        onSelectFirm={(f) => onOpenDetails(f, f.plans[0])}
        onOpenLoyaltyModal={onOpenLoyalty}
      />

      <FeatureGrid onCompare={() => onNavigate('compare')} onReviews={() => { setActiveSubTab('Reviews'); document.getElementById('firm-directory')?.scrollIntoView({ behavior: 'smooth' }); }} onRules={onOpenMethodology} onPayouts={() => onNavigate('payouts')} onOffers={() => onNavigate('discounts')} onSearch={onOpenGoogleGrounding} onAlerts={onOpenAlerts} />

      <section id="firm-directory" className="scroll-mt-28 mx-auto max-w-[1240px] px-6 pt-20 sm:px-8 lg:pt-28">
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#3ecf8e]">Explore the catalog</p>
        <h2 className="text-3xl font-medium tracking-tight text-[#f1f3f2] sm:text-4xl">Find your next firm.</h2>
        <p className="mt-3 text-base text-[#9a9e9b]">Filter plans, inspect the details, and build your comparison.</p>
      </section>
      <SubTabsBar activeSubTab={activeSubTab} setActiveSubTab={setActiveSubTab} />

      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="flex justify-end pt-4 pb-1">
          <div className="inline-flex rounded-md border border-[#2b2e2c] bg-[#1d1f1e] p-0.5 text-xs">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 rounded px-3 py-1.5 transition-colors duration-150 ${
                viewMode === 'table' ? 'bg-[#3ecf8e] text-[#171918] font-semibold' : 'text-[#9a9e9b] hover:text-[#f1f3f2]'
              }`}
            >
              <Table className="h-3.5 w-3.5" />
              <span>Table View</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 rounded px-3 py-1.5 transition-colors duration-150 ${
                viewMode === 'grid' ? 'bg-[#3ecf8e] text-[#171918] font-semibold' : 'text-[#9a9e9b] hover:text-[#f1f3f2]'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Cards Grid</span>
            </button>
          </div>
        </div>

        {filterDrawerOpen && (
          <div className="mb-4">
            <FilterBar
              filters={filters}
              setFilters={setFilters}
              viewMode={viewMode}
              setViewMode={setViewMode}
              totalFilteredCount={filteredFirms.length}
              onResetFilters={resetFilters}
            />
          </div>
        )}

        {viewMode === 'table' ? (
          <FirmTableView
            firms={filteredFirms}
            preferredSize={filters.accountSize}
            currency={currency}
            savedFirmIds={savedFirmIds}
            onToggleSave={onToggleSave}
            onOpenDetails={onOpenDetails}
            onOpenFilterDrawer={() => setFilterDrawerOpen(!filterDrawerOpen)}
            onOpenMethodologyModal={onOpenMethodology}
            activeFilterPill={activeFilterPill}
            setActiveFilterPill={setActiveFilterPill}
            onOpenPriceAlert={onOpenPriceAlert}
            onToggleCompare={onToggleCompare}
            comparedFirmIds={comparedFirmIds}
          />
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filteredFirms.map((firm) => (
              <FirmCard
                key={firm.id}
                firm={firm}
                preferredSize={filters.accountSize}
                currency={currency}
                isCompared={comparedFirmIds.includes(firm.id)}
                onToggleCompare={onToggleCompare}
                isSaved={savedFirmIds.includes(firm.id)}
                onToggleSave={onToggleSave}
                onOpenDetails={onOpenDetails}
                onOpenCalculatorWithPlan={onOpenCalculator}
                onOpenPriceAlert={onOpenPriceAlert}
              />
            ))}
          </div>
        )}
      </div>

      <WelcomeBonusBanner
        userProfile={userProfile}
        onOpenAuth={onOpenAuth}
        onOpenLoyaltyModal={onOpenLoyalty}
      />

      <HomepageFAQ />
    </main>
  );
};
