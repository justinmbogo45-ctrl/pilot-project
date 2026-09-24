import React, { useState } from 'react';
import { 
  Search, 
  X, 
  Grid, 
  Sparkles, 
  Briefcase, 
  BookOpen, 
  User, 
  LogOut, 
  Heart, 
  Scale, 
  Menu,
  ChevronDown,
  Bell
} from 'lucide-react';
import { UserProfileData, logoutFirebase } from '../lib/firebase';

interface NavbarProps {
  activeTab: 'firms' | 'compare' | 'quiz' | 'calculator' | 'discounts' | 'payouts' | 'affiliates';
  setActiveTab: (tab: 'firms' | 'compare' | 'quiz' | 'calculator' | 'discounts' | 'payouts' | 'affiliates') => void;
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
  activeTab,
  setActiveTab,
  selectedMarket,
  setSelectedMarket,
  searchQuery,
  setSearchQuery,
  savedFirmsCount,
  openSavedModal,
  userProfile,
  onOpenAuth,
  onOpenGiveaway,
  onOpenHiring,
  onOpenTutorials,
  onOpenAppLauncher,
  onOpenLoyaltyModal,
  onOpenCompareModal,
  onSelectRulesModal,
  priceAlertsCount = 0,
  onOpenPriceAlertsModal,
  onOpenGoogleGrounding,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleLogout = async () => {
    setUserDropdownOpen(false);
    await logoutFirebase();
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0c0e1a]/95 backdrop-blur-md border-b border-slate-800">
      
      {/* Top Navbar Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3 sm:gap-4">
          
          {/* Brand Logo & App Launcher */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <div 
              onClick={() => setActiveTab('firms')}
              className="flex items-center gap-2 cursor-pointer select-none group"
              id="brand-logo"
            >
              {/* Distinctive geometric glyph logo matching screenshots */}
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 via-purple-600 to-indigo-600 p-[1.5px] shadow-lg shadow-purple-950/50 group-hover:scale-105 transition-all">
                <div className="w-full h-full bg-[#0c0e1a] rounded-[10px] flex items-center justify-center font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 text-sm">
                  PFM
                </div>
              </div>
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-white">
                Prop Firm Match
              </span>
            </div>

            {/* 9-dots Matrix App Launcher button */}
            <button
              onClick={onOpenAppLauncher}
              title="Open Apps Ecosystem"
              id="app-launcher-btn"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>

          {/* Global Search Bar */}
          <div className="hidden md:flex flex-1 max-w-xs lg:max-w-sm relative items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              id="global-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search firm, platform, or rule..."
              className="w-full bg-[#131728] border border-slate-800 text-xs rounded-full pl-9 pr-8 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 text-slate-500 hover:text-slate-300"
                id="clear-search-btn"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Market Pill Selector: Forex | Futures | Crypto (with NEW badge) */}
          <div className="hidden sm:flex items-center p-1 rounded-full bg-[#131627] border border-slate-800 text-xs font-bold">
            <button
              onClick={() => setSelectedMarket('Forex')}
              className={`px-3 py-1 rounded-full transition-all ${
                selectedMarket === 'Forex'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Forex
            </button>
            <button
              onClick={() => setSelectedMarket('Futures')}
              className={`px-3 py-1 rounded-full transition-all ${
                selectedMarket === 'Futures'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Futures
            </button>
            <button
              onClick={() => setSelectedMarket('Crypto')}
              className={`px-3 py-1 rounded-full transition-all flex items-center gap-1 ${
                selectedMarket === 'Crypto'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Crypto</span>
              <span className="text-[9px] font-black uppercase px-1 rounded bg-emerald-500 text-slate-950">
                NEW
              </span>
            </button>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Live Web Intel with Google Search Grounding */}
            {onOpenGoogleGrounding && (
              <button
                onClick={onOpenGoogleGrounding}
                title="Google Search Grounded Intelligence (gemini-3.5-flash)"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-950/70 hover:bg-blue-900/70 border border-blue-500/50 hover:border-blue-400 text-blue-300 hover:text-white text-xs font-bold transition-all shadow-sm cursor-pointer group"
              >
                <svg className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span className="hidden sm:inline">Live Intel</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              </button>
            )}

            {/* We're Hiring */}
            <button
              onClick={onOpenHiring}
              className="hidden xl:flex items-center gap-1 text-xs font-semibold text-slate-300 hover:text-pink-400 transition-colors cursor-pointer"
            >
              <span>📢</span>
              <span>We're Hiring</span>
            </button>

            {/* Tutorials */}
            <button
              onClick={onOpenTutorials}
              className="hidden lg:flex items-center gap-1 text-xs font-semibold text-slate-300 hover:text-purple-300 transition-colors cursor-pointer"
            >
              <span>📕</span>
              <span>Tutorials</span>
            </button>

            {/* Price Alerts Button */}
            {onOpenPriceAlertsModal && (
              <button
                onClick={onOpenPriceAlertsModal}
                title="Manage price drop & promo alert subscriptions"
                className="relative p-2 rounded-xl bg-slate-800/80 hover:bg-purple-900/40 text-slate-300 hover:text-purple-300 border border-slate-700/80 hover:border-purple-500/50 transition-all cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                {priceAlertsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-purple-600 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center shadow-md animate-pulse">
                    {priceAlertsCount}
                  </span>
                )}
              </button>
            )}

            {/* User Auth / Loyalty Points */}
            {userProfile ? (
              <div className="relative">
                <div className="flex items-center gap-2">
                  {/* Loyalty Points Pill */}
                  <button
                    onClick={onOpenLoyaltyModal}
                    title="Click to view rewards & claim daily bonus"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-950/80 border border-purple-500/50 text-xs font-bold text-amber-300 hover:text-white hover:border-purple-400 transition-all cursor-pointer shadow-sm"
                  >
                    <span>💎</span>
                    <span>{userProfile.loyaltyPoints} LP</span>
                  </button>

                  {/* Avatar Button */}
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-1 p-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  >
                    {userProfile.photoURL ? (
                      <img src={userProfile.photoURL} alt="avatar" className="w-7 h-7 rounded-full object-cover" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center text-xs font-bold text-white">
                        {userProfile.displayName ? userProfile.displayName[0].toUpperCase() : 'T'}
                      </div>
                    )}
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>
                </div>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-[#131627] border border-slate-700 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-2 border-b border-slate-800 text-xs">
                      <div className="font-bold text-white truncate">{userProfile.displayName || 'Trader'}</div>
                      <div className="text-[11px] text-slate-400 truncate">{userProfile.email}</div>
                      <div className="text-[10px] text-amber-400 mt-1 font-semibold">Tier: Level 1 Pro</div>
                    </div>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onOpenLoyaltyModal();
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 rounded-lg flex items-center gap-2 mt-1"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                      <span>Loyalty Points ({userProfile.loyaltyPoints} LP)</span>
                    </button>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        openSavedModal();
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 rounded-lg flex items-center gap-2"
                    >
                      <Heart className="w-3.5 h-3.5 text-rose-400" />
                      <span>Saved Firms ({savedFirmsCount}/3)</span>
                    </button>

                    {onOpenPriceAlertsModal && (
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onOpenPriceAlertsModal();
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 rounded-lg flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <Bell className="w-3.5 h-3.5 text-purple-400" />
                          <span>Price Alerts</span>
                        </div>
                        {priceAlertsCount > 0 && (
                          <span className="px-1.5 py-0.2 rounded-full bg-purple-600 text-white text-[10px] font-bold">
                            {priceAlertsCount}
                          </span>
                        )}
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        setActiveTab('affiliates');
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 rounded-lg flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400 font-extrabold text-sm">$</span>
                        <span>Affiliate Portal</span>
                      </div>
                      <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                        RevShare
                      </span>
                    </button>

                    <div className="border-t border-slate-800 my-1"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-xs text-rose-400 hover:bg-rose-950/40 rounded-lg flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenAuth}
                  className="px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  Log in
                </button>
                <button
                  onClick={onOpenAuth}
                  className="px-3.5 py-1.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-900/30 transition-all cursor-pointer"
                >
                  Sign Up
                </button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>

          </div>

        </div>
      </div>

      {/* Row 2: Sub-Nav Tabs matching Screenshot 1 & 5 */}
      <div className="border-t border-slate-800/80 bg-[#090b14]/90 overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 sm:gap-4 py-1 text-xs whitespace-nowrap">
          
          <button
            onClick={() => setActiveTab('firms')}
            className={`py-2 px-3 font-bold transition-all relative ${
              activeTab === 'firms'
                ? 'text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Home</span>
            {activeTab === 'firms' && (
              <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-rose-500 rounded-full"></div>
            )}
          </button>

          <button
            onClick={() => setActiveTab('discounts')}
            className={`py-2 px-3 font-semibold transition-all relative ${
              activeTab === 'discounts'
                ? 'text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Offers</span>
            {activeTab === 'discounts' && (
              <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-rose-500 rounded-full"></div>
            )}
          </button>

          <button
            onClick={() => setActiveTab('firms')}
            className="py-2 px-3 font-semibold text-slate-400 hover:text-slate-200 transition-colors"
          >
            Challenges
          </button>

          <button
            onClick={() => setActiveTab('firms')}
            className="py-2 px-3 font-semibold text-slate-400 hover:text-slate-200 transition-colors"
          >
            Best Sellers
          </button>

          <button
            onClick={() => setActiveTab('firms')}
            className="py-2 px-3 font-semibold text-slate-400 hover:text-slate-200 transition-colors"
          >
            Reviews
          </button>

          <button
            onClick={openSavedModal}
            className="py-2 px-3 font-semibold text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1.5"
          >
            <Heart className="w-3.5 h-3.5 text-rose-500" />
            <span>Favorite Firms ({savedFirmsCount}/3)</span>
          </button>

          <button
            onClick={onSelectRulesModal}
            className="py-2 px-3 font-semibold text-slate-400 hover:text-slate-200 transition-colors"
          >
            Prop Firm Rules
          </button>

          <button
            onClick={onOpenCompareModal}
            className="py-2 px-3 font-bold text-purple-300 hover:text-white transition-colors flex items-center gap-1"
          >
            <span>Compare Firms</span>
            <span className="text-[9px] px-1 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40">
              New
            </span>
          </button>

          <button
            onClick={() => setActiveTab('payouts')}
            className={`py-2 px-3 font-semibold transition-all relative ${
              activeTab === 'payouts'
                ? 'text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Payouts</span>
            {activeTab === 'payouts' && (
              <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-rose-500 rounded-full"></div>
            )}
          </button>

          <button
            onClick={() => setActiveTab('affiliates')}
            className={`py-2 px-3 font-semibold transition-all relative flex items-center gap-1.5 ${
              activeTab === 'affiliates'
                ? 'text-white font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Affiliates</span>
            <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              Earn 25%
            </span>
            {activeTab === 'affiliates' && (
              <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-rose-500 rounded-full"></div>
            )}
          </button>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#101324] border-b border-slate-800 p-4 space-y-3 text-xs">
          <div className="flex items-center justify-between gap-2 p-1 rounded-lg bg-slate-900 border border-slate-800">
            <button
              onClick={() => setSelectedMarket('Forex')}
              className={`flex-1 py-1.5 rounded text-center font-bold ${
                selectedMarket === 'Forex' ? 'bg-rose-600 text-white' : 'text-slate-400'
              }`}
            >
              Forex
            </button>
            <button
              onClick={() => setSelectedMarket('Futures')}
              className={`flex-1 py-1.5 rounded text-center font-bold ${
                selectedMarket === 'Futures' ? 'bg-rose-600 text-white' : 'text-slate-400'
              }`}
            >
              Futures
            </button>
            <button
              onClick={() => setSelectedMarket('Crypto')}
              className={`flex-1 py-1.5 rounded text-center font-bold ${
                selectedMarket === 'Crypto' ? 'bg-rose-600 text-white' : 'text-slate-400'
              }`}
            >
              Crypto NEW
            </button>
          </div>

          <div className="space-y-1 pt-2">
            <button
              onClick={() => {
                setActiveTab('firms');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left py-2 px-3 rounded-lg hover:bg-slate-800 text-slate-200 font-semibold"
            >
              Home & All Prop Firms
            </button>
            <button
              onClick={() => {
                setActiveTab('discounts');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left py-2 px-3 rounded-lg hover:bg-slate-800 text-slate-200 font-semibold"
            >
              Exclusive Offers & Deals
            </button>
            <button
              onClick={() => {
                onOpenCompareModal();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left py-2 px-3 rounded-lg hover:bg-slate-800 text-purple-300 font-semibold flex items-center justify-between"
            >
              <span>Compare Firms</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40">NEW</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('payouts');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left py-2 px-3 rounded-lg hover:bg-slate-800 text-slate-200 font-semibold"
            >
              Live Payout Records
            </button>
            <button
              onClick={() => {
                setActiveTab('affiliates');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left py-2 px-3 rounded-lg hover:bg-slate-800 text-emerald-300 font-semibold flex items-center justify-between"
            >
              <span>Affiliate Portal</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                EARN 25%
              </span>
            </button>
            {onOpenPriceAlertsModal && (
              <button
                onClick={() => {
                  onOpenPriceAlertsModal();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left py-2 px-3 rounded-lg hover:bg-slate-800 text-purple-300 font-semibold flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-purple-400" />
                  <span>Price & Promo Alerts</span>
                </div>
                {priceAlertsCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-purple-600 text-white text-[10px] font-bold">
                    {priceAlertsCount}
                  </span>
                )}
              </button>
            )}
            {onOpenGoogleGrounding && (
              <button
                onClick={() => {
                  onOpenGoogleGrounding();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left py-2 px-3 rounded-lg hover:bg-blue-950/50 text-blue-300 font-semibold flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                  <span>Google Search Live Intel</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40">
                  gemini-3.5-flash
                </span>
              </button>
            )}
            <button
              onClick={() => {
                onOpenGiveaway();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left py-2 px-3 rounded-lg hover:bg-purple-950/50 text-pink-300 font-semibold"
            >
              ✨ Active Giveaway (5x $100K)
            </button>
            <button
              onClick={() => {
                onOpenTutorials();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left py-2 px-3 rounded-lg hover:bg-slate-800 text-slate-300"
            >
              Tutorials & Guides
            </button>
            <button
              onClick={() => {
                onOpenHiring();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left py-2 px-3 rounded-lg hover:bg-slate-800 text-pink-400"
            >
              We're Hiring
            </button>
          </div>
        </div>
      )}

    </header>
  );
};
