import React, { useState } from 'react';
import { Bell, ChevronDown, Heart, LogOut, Menu, Search, X } from 'lucide-react';
import { UserProfileData, logoutFirebase } from '../lib/api';
import type { SubTabType } from './SubTabsBar';

type Tab = 'firms' | 'compare' | 'quiz' | 'calculator' | 'discounts' | 'payouts' | 'affiliates';
interface NavbarProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  activeSubTab: SubTabType;
  setActiveSubTab: (tab: SubTabType) => void;
  selectedMarket: 'Forex' | 'Futures' | 'Crypto';
  setSelectedMarket: (market: 'Forex' | 'Futures' | 'Crypto') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  savedFirmsCount: number;
  openSavedModal: () => void;
  userProfile: UserProfileData | null;
  onOpenAuth: () => void;
  onOpenGiveaway: () => void;
  onOpenHiring: () => void;
  onOpenTutorials: () => void;
  onOpenAppLauncher: () => void;
  onOpenLoyaltyModal: () => void;
  onOpenCompareModal: () => void;
  onSelectRulesModal: () => void;
  priceAlertsCount?: number;
  onOpenPriceAlertsModal?: () => void;
  onOpenGoogleGrounding?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab, setActiveTab, activeSubTab, setActiveSubTab, selectedMarket, setSelectedMarket,
  searchQuery, setSearchQuery, savedFirmsCount, openSavedModal, userProfile, onOpenAuth,
  onOpenGiveaway, onOpenHiring, onOpenTutorials, onOpenAppLauncher, onOpenLoyaltyModal,
  onOpenCompareModal, onSelectRulesModal, priceAlertsCount = 0, onOpenPriceAlertsModal,
  onOpenGoogleGrounding,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const navigate = (tab: Tab, subTab?: SubTabType) => {
    setActiveTab(tab);
    if (subTab) {
      setActiveSubTab(subTab);
      window.setTimeout(() => document.getElementById('firm-directory')?.scrollIntoView({ behavior: 'smooth' }), 0);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setMobileOpen(false);
    setMoreOpen(false);
  };
  const nav = [
    { label: 'Firms', action: () => navigate('firms', 'Firms'), active: activeTab === 'firms' && activeSubTab === 'Firms' },
    { label: 'Offers', action: () => navigate('discounts'), active: activeTab === 'discounts' },
    { label: 'Challenges', action: () => navigate('firms', 'Challenges'), active: activeTab === 'firms' && activeSubTab === 'Challenges' },
    { label: 'Reviews', action: () => navigate('firms', 'Reviews'), active: activeTab === 'firms' && activeSubTab === 'Reviews' },
    { label: 'Compare', action: () => navigate('compare'), active: activeTab === 'compare' },
    { label: 'Payouts', action: () => navigate('payouts'), active: activeTab === 'payouts' },
  ];
  const secondary = [
    { label: 'Affiliate portal', action: () => navigate('affiliates') },
    { label: 'Match quiz', action: () => navigate('quiz') },
    { label: 'Fee calculator', action: () => navigate('calculator') },
    { label: 'Tutorials', action: onOpenTutorials },
    { label: 'Hiring', action: onOpenHiring },
    { label: 'Giveaway', action: onOpenGiveaway },
    { label: 'Methodology', action: onSelectRulesModal },
    { label: 'Apps', action: onOpenAppLauncher },
    { label: 'Comparison matrix', action: onOpenCompareModal },
    ...(onOpenGoogleGrounding ? [{ label: 'Live research', action: onOpenGoogleGrounding }] : []),
    { label: `Saved firms (${savedFirmsCount})`, action: openSavedModal },
    ...(onOpenPriceAlertsModal ? [{ label: `Price alerts (${priceAlertsCount})`, action: onOpenPriceAlertsModal }] : []),
  ];
  const chooseSecondary = (action: () => void) => { action(); setMoreOpen(false); setMobileOpen(false); };
  const search = <div className="relative flex items-center">
    <Search className="pointer-events-none absolute left-3 h-4 w-4 text-[#747976]" />
    <input id="global-search-input" autoFocus={searchOpen} aria-label="Search firms" value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setActiveTab('firms'); }} placeholder="Search firms" className="w-full rounded-lg border border-[#2b2e2c] bg-[#202321] py-2 pl-9 pr-9 text-sm text-[#f1f3f2] outline-none placeholder:text-[#747976] focus:border-[#3ecf8e]" />
    {searchQuery && <button onClick={() => setSearchQuery('')} aria-label="Clear search" className="absolute right-3 text-[#747976] hover:text-[#f1f3f2]"><X className="h-4 w-4" /></button>}
  </div>;

  return <header className="sticky top-0 z-40 border-b border-[#2b2e2c] bg-[#171918]/95 backdrop-blur-lg">
    <div className="mx-auto flex h-[68px] max-w-[1240px] items-center gap-6 px-6 sm:px-8">
      <button onClick={() => navigate('firms')} className="flex shrink-0 items-center gap-2.5" aria-label="Prop Firm Match home" id="brand-logo">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#3ecf8e]/30 bg-[#3ecf8e]/10 text-xs font-semibold text-[#3ecf8e]">PF</span>
        <span className="hidden text-[15px] font-semibold tracking-tight text-[#f1f3f2] sm:block">Prop Firm Match</span>
      </button>
      <nav aria-label="Primary" className="ml-auto hidden items-center gap-1 lg:flex">
        {nav.map(item => <button key={item.label} onClick={item.action} className={`rounded-md px-2.5 py-2 text-sm transition-colors ${item.active ? 'text-[#3ecf8e]' : 'text-[#9a9e9b] hover:text-[#f1f3f2]'}`}>{item.label}</button>)}
        <div className="relative">
          <button onClick={() => setMoreOpen(!moreOpen)} aria-expanded={moreOpen} className="flex items-center gap-1 rounded-md px-2.5 py-2 text-sm text-[#9a9e9b] hover:text-[#f1f3f2]">More <ChevronDown className="h-3.5 w-3.5" /></button>
          {moreOpen && <div className="absolute right-0 top-11 grid w-64 grid-cols-1 gap-0.5 rounded-xl border border-[#2b2e2c] bg-[#202321] p-2 shadow-xl">
            <div className="flex gap-1 border-b border-[#2b2e2c] p-2">{(['Forex', 'Futures', 'Crypto'] as const).map(market => <button key={market} onClick={() => { setSelectedMarket(market); navigate('firms'); }} className={`flex-1 rounded-md px-1 py-1.5 text-xs ${selectedMarket === market ? 'bg-[#3ecf8e]/12 text-[#3ecf8e]' : 'text-[#9a9e9b] hover:text-[#f1f3f2]'}`}>{market}</button>)}</div>
            {secondary.map(item => <button key={item.label} onClick={() => chooseSecondary(item.action)} className="rounded-md px-3 py-2 text-left text-sm text-[#9a9e9b] hover:bg-[#2b2e2c] hover:text-[#f1f3f2]">{item.label}</button>)}
          </div>}
        </div>
      </nav>
      <div className="ml-auto flex items-center gap-2 lg:ml-0">
        <button onClick={() => setSearchOpen(!searchOpen)} aria-label="Search firms" aria-expanded={searchOpen} className="rounded-lg p-2 text-[#9a9e9b] hover:bg-[#202321] hover:text-[#f1f3f2]"><Search className="h-4 w-4" /></button>
        {userProfile ? <div className="relative">
          <button onClick={() => setAccountOpen(!accountOpen)} aria-label="Account menu" aria-expanded={accountOpen} className="flex items-center gap-1 rounded-lg p-1 text-[#9a9e9b] hover:bg-[#202321]">
            {userProfile.photoURL ? <img src={userProfile.photoURL} alt="" className="h-8 w-8 rounded-md object-cover" /> : <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[#3ecf8e]/15 text-sm text-[#3ecf8e]">{userProfile.displayName?.[0]?.toUpperCase() || 'T'}</span>}
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
          {accountOpen && <div className="absolute right-0 top-12 w-60 rounded-xl border border-[#2b2e2c] bg-[#202321] p-2 shadow-xl">
            <div className="border-b border-[#2b2e2c] px-3 py-2"><p className="truncate text-sm text-[#f1f3f2]">{userProfile.displayName || 'Trader'}</p><p className="truncate text-xs text-[#747976]">{userProfile.email}</p></div>
            <button onClick={() => { onOpenLoyaltyModal(); setAccountOpen(false); }} className="block w-full rounded-md px-3 py-2 text-left text-sm text-[#9a9e9b] hover:bg-[#2b2e2c]">Rewards · {userProfile.loyaltyPoints} LP</button>
            <button onClick={() => { openSavedModal(); setAccountOpen(false); }} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-[#9a9e9b] hover:bg-[#2b2e2c]"><Heart className="h-4 w-4" /> Saved firms ({savedFirmsCount})</button>
            {onOpenPriceAlertsModal && <button onClick={() => { onOpenPriceAlertsModal(); setAccountOpen(false); }} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-[#9a9e9b] hover:bg-[#2b2e2c]"><Bell className="h-4 w-4" /> Price alerts ({priceAlertsCount})</button>}
            <button onClick={() => { navigate('affiliates'); setAccountOpen(false); }} className="block w-full rounded-md px-3 py-2 text-left text-sm text-[#9a9e9b] hover:bg-[#2b2e2c]">Affiliate portal</button>
            <button onClick={async () => { setAccountOpen(false); await logoutFirebase(); }} className="flex w-full items-center gap-2 border-t border-[#2b2e2c] px-3 py-2 text-left text-sm text-[#9a9e9b] hover:text-[#f1f3f2]"><LogOut className="h-4 w-4" /> Sign out</button>
          </div>}
        </div> : <div className="hidden items-center gap-1 sm:flex"><button onClick={onOpenAuth} className="px-3 py-2 text-sm text-[#9a9e9b] hover:text-[#f1f3f2]">Log in</button><button onClick={onOpenAuth} className="rounded-lg bg-[#3ecf8e] px-3.5 py-2 text-sm font-medium text-[#171918] hover:bg-[#4ade9b]">Sign up</button></div>}
        <button onClick={() => setMobileOpen(!mobileOpen)} aria-label={mobileOpen ? 'Close menu' : 'Open menu'} aria-expanded={mobileOpen} className="rounded-lg p-2 text-[#9a9e9b] hover:bg-[#202321] lg:hidden">{mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
      </div>
    </div>
    {searchOpen && <div className="mx-auto max-w-[1240px] px-6 pb-4 sm:px-8">{search}</div>}
    {mobileOpen && <div className="max-h-[calc(100vh-68px)] overflow-y-auto border-t border-[#2b2e2c] bg-[#1d1f1e] px-6 py-4 lg:hidden">
      <nav aria-label="Mobile" className="mx-auto grid max-w-[1240px] gap-1">
        {nav.map(item => <button key={item.label} onClick={item.action} className={`rounded-lg px-3 py-2.5 text-left text-sm ${item.active ? 'bg-[#202321] text-[#3ecf8e]' : 'text-[#f1f3f2] hover:bg-[#202321]'}`}>{item.label}</button>)}
        <div className="my-2 border-t border-[#2b2e2c]" />
        <div className="flex gap-2 px-3 py-2">{(['Forex', 'Futures', 'Crypto'] as const).map(market => <button key={market} onClick={() => { setSelectedMarket(market); navigate('firms'); }} className={`rounded-md px-3 py-1.5 text-xs ${selectedMarket === market ? 'bg-[#3ecf8e]/12 text-[#3ecf8e]' : 'text-[#9a9e9b]'}`}>{market}</button>)}</div>
        {secondary.map(item => <button key={item.label} onClick={() => chooseSecondary(item.action)} className="rounded-lg px-3 py-2.5 text-left text-sm text-[#9a9e9b] hover:bg-[#202321] hover:text-[#f1f3f2]">{item.label}</button>)}
        {!userProfile && <button onClick={() => { onOpenAuth(); setMobileOpen(false); }} className="mt-2 rounded-lg bg-[#3ecf8e] px-3 py-2.5 text-sm font-medium text-[#171918]">Log in / Sign up</button>}
      </nav>
    </div>}
  </header>;
};
