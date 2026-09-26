import React, { useState } from 'react';
import {
  Filter,
  RotateCcw,
  LayoutGrid,
  List,
  ChevronDown,
  ChevronUp,
  Check,
  ShieldAlert
} from 'lucide-react';
import { FilterState, TradingPlatform, ChallengeType, DrawdownType } from '../types';

interface FilterBarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  viewMode: 'grid' | 'table';
  setViewMode: (mode: 'grid' | 'table') => void;
  totalFilteredCount: number;
  onResetFilters: () => void;
}

const ALL_PLATFORMS: TradingPlatform[] = [
  'cTrader',
  'TradingView',
  'NinjaTrader',
  'Tradovate',
  'Match-Trader',
  'DXtrade'
];

const ACCOUNT_SIZES = [
  { label: 'All Sizes', value: 'All' },
  { label: '$10K', value: 10000 },
  { label: '$25K', value: 25000 },
  { label: '$50K', value: 50000 },
  { label: '$100K', value: 100000 },
  { label: '$200K', value: 200000 },
];

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  setFilters,
  viewMode,
  setViewMode,
  totalFilteredCount,
  onResetFilters,
}) => {
  const [expanded, setExpanded] = useState(false);

  const togglePlatform = (platform: TradingPlatform) => {
    setFilters((prev) => {
      const exists = prev.platforms.includes(platform);
      return {
        ...prev,
        platforms: exists
          ? prev.platforms.filter((p) => p !== platform)
          : [...prev.platforms, platform]
      };
    });
  };

  const hasActiveFilters =
    filters.challengeType !== 'All' ||
    filters.accountSize !== 'All' ||
    filters.platforms.length > 0 ||
    filters.drawdownType !== 'All' ||
    filters.minProfitSplit > 0 ||
    filters.weekendHolding !== null ||
    filters.newsTrading !== null ||
    filters.eaAllowed !== null ||
    filters.copyTrading !== null ||
    filters.noMinDays !== null ||
    filters.usAccepted !== null ||
    filters.sortBy !== 'featured';

  return (
    <div className="bg-[#1a1c1b]/70 border-b border-[#2b2e2c]/80 backdrop-blur-sm sticky top-16 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">

        {/* Row 1: Primary Quick Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3">

          {/* Account Capital Chips */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
            <span className="text-xs font-semibold text-[#9a9e9b] mr-1.5 hidden sm:inline">Size:</span>
            {ACCOUNT_SIZES.map((size) => (
              <button
                key={String(size.value)}
                onClick={() => setFilters((prev) => ({ ...prev, accountSize: size.value as number | 'All' }))}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                  filters.accountSize === size.value
                    ? 'bg-[#3ecf8e]/20 text-[#3ecf8e] border border-emerald-500/40 font-semibold'
                    : 'bg-[#1d1f1e] text-[#9a9e9b] hover:text-[#f1f3f2] border border-[#2b2e2c] hover:border-[#333633]'
                }`}
              >
                {size.label}
              </button>
            ))}
          </div>

          {/* Right Controls: Filter Drawer Toggle, Sort Dropdown & View Mode */}
          <div className="flex items-center gap-2 ml-auto">

            {/* Sort dropdown */}
            <div className="flex items-center gap-1 text-xs bg-[#1d1f1e] border border-[#2b2e2c] rounded-lg px-2.5 py-1.5 text-[#9a9e9b]">
              <span className="text-[#747976] hidden sm:inline">Sort:</span>
              <select
                id="filter-sort-select"
                value={filters.sortBy}
                onChange={(e) => setFilters((prev) => ({ ...prev, sortBy: e.target.value as any }))}
                className="bg-transparent text-xs font-medium text-[#f1f3f2] focus:outline-none cursor-pointer"
              >
                <option value="featured" className="bg-[#1d1f1e] text-[#f1f3f2]">Featured & Best Match</option>
                <option value="trustScore" className="bg-[#1d1f1e] text-[#f1f3f2]">Highest TrustScore</option>
                <option value="priceLow" className="bg-[#1d1f1e] text-[#f1f3f2]">Cheapest Challenge</option>
                <option value="priceHigh" className="bg-[#1d1f1e] text-[#f1f3f2]">Highest Price</option>
                <option value="profitSplit" className="bg-[#1d1f1e] text-[#f1f3f2]">Highest Profit Split</option>
                <option value="maxDrawdown" className="bg-[#1d1f1e] text-[#f1f3f2]">Max Drawdown Allowance</option>
                <option value="payoutSpeed" className="bg-[#1d1f1e] text-[#f1f3f2]">Fastest Payouts</option>
              </select>
            </div>

            {/* Expand Advanced Filters */}
            <button
              onClick={() => setExpanded(!expanded)}
              id="toggle-advanced-filters-btn"
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                expanded || hasActiveFilters
                  ? 'bg-[#3ecf8e]/15 border-emerald-500/40 text-[#3ecf8e]'
                  : 'bg-[#1d1f1e] border-[#2b2e2c] text-[#9a9e9b] hover:text-[#f1f3f2]'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              )}
              {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {/* View Mode Switcher */}
            <div className="flex items-center bg-[#1d1f1e] border border-[#2b2e2c] rounded-lg p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                id="view-mode-grid"
                title="Card Grid View"
                className={`p-1.5 rounded transition-colors duration-150 ${
                  viewMode === 'grid' ? 'bg-[#252825] text-[#3ecf8e]' : 'text-[#9a9e9b] hover:text-[#f1f3f2]'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                id="view-mode-table"
                title="High-Density Table View"
                className={`p-1.5 rounded transition-colors duration-150 ${
                  viewMode === 'table' ? 'bg-[#252825] text-[#3ecf8e]' : 'text-[#9a9e9b] hover:text-[#f1f3f2]'
                }`}
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

        </div>

        {/* Row 2: Secondary Quick Chips (Evaluation Step & US Allowed) */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs">

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[#747976] text-[11px] uppercase tracking-wider font-semibold mr-1">Steps:</span>
            {['All', '1-Step', '2-Step', 'Instant Funding'].map((step) => (
              <button
                key={step}
                onClick={() => setFilters((prev) => ({ ...prev, challengeType: step }))}
                className={`px-2 py-0.5 rounded text-xs transition-colors duration-150 ${
                  filters.challengeType === step
                    ? 'bg-[#252825] text-[#3ecf8e] font-semibold border border-emerald-500/30'
                    : 'text-[#9a9e9b] hover:text-[#f1f3f2] hover:bg-[#1d1f1e]'
                }`}
              >
                {step}
              </button>
            ))}

            <div className="h-3 w-px bg-[#1e1e1e] mx-1 hidden sm:block" />

            {/* US accepted quick toggle */}
            <button
              onClick={() => setFilters((prev) => ({
                ...prev,
                usAccepted: prev.usAccepted ? null : true
              }))}
              className={`px-2 py-0.5 rounded text-xs transition-colors duration-150 flex items-center gap-1 ${
                filters.usAccepted
                  ? 'bg-[#3ecf8e]/20 text-[#3ecf8e] border border-emerald-500/40 font-semibold'
                  : 'text-[#9a9e9b] hover:text-[#f1f3f2] hover:bg-[#1d1f1e]'
              }`}
            >
              <ShieldAlert className="w-3 h-3" />
              <span>US Traders Accepted</span>
            </button>

            {/* Weekend holding quick toggle */}
            <button
              onClick={() => setFilters((prev) => ({
                ...prev,
                weekendHolding: prev.weekendHolding ? null : true
              }))}
              className={`px-2 py-0.5 rounded text-xs transition-colors duration-150 ${
                filters.weekendHolding
                  ? 'bg-[#3ecf8e]/20 text-[#3ecf8e] border border-emerald-500/40 font-semibold'
                  : 'text-[#9a9e9b] hover:text-[#f1f3f2] hover:bg-[#1d1f1e]'
              }`}
            >
              Weekend Holding
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[#9a9e9b] text-xs">
              Showing <strong className="text-[#3ecf8e]">{totalFilteredCount}</strong> challenges
            </span>

            {hasActiveFilters && (
              <button
                onClick={onResetFilters}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors duration-150"
                title="Reset all filters"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

        </div>

        {/* Expanded Drawer: Full Rules, Platforms, Drawdown Type, Profit Split */}
        {expanded && (
          <div className="mt-3 pt-3 border-t border-[#2b2e2c]/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">

            {/* Platforms Multi-select */}
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider font-bold text-[#9a9e9b]">
                Trading Platform
              </label>
              <div className="flex flex-wrap gap-1.5">
                {ALL_PLATFORMS.map((plat) => {
                  const isSelected = filters.platforms.includes(plat);
                  return (
                    <button
                      key={plat}
                      onClick={() => togglePlatform(plat)}
                      className={`px-2 py-1 rounded text-xs transition-all flex items-center gap-1 ${
                        isSelected
                          ? 'bg-[#3ecf8e]/25 text-[#3ecf8e] border border-emerald-500/40 font-semibold'
                          : 'bg-[#1d1f1e] text-[#9a9e9b] hover:text-[#f1f3f2] border border-[#2b2e2c]'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 text-[#3ecf8e]" />}
                      <span>{plat}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Drawdown Calculation Type */}
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider font-bold text-[#9a9e9b]">
                Drawdown Method
              </label>
              <div className="flex flex-col gap-1">
                {['All', 'Balance-Based (Static)', 'Trailing', 'End of Day (EOD)'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilters((prev) => ({ ...prev, drawdownType: type }))}
                    className={`text-left px-2 py-1 rounded transition-colors duration-150 ${
                      filters.drawdownType === type
                        ? 'bg-[#252825] text-[#3ecf8e] font-semibold'
                        : 'text-[#9a9e9b] hover:text-[#f1f3f2] hover:bg-[#1d1f1e]'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Trading Rules Checkboxes */}
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider font-bold text-[#9a9e9b]">
                Trading Rules
              </label>
              <div className="space-y-1">
                {[
                  { key: 'newsTrading', label: 'News Trading Allowed' },
                  { key: 'eaAllowed', label: 'EA / Algo Trading Allowed' },
                  { key: 'copyTrading', label: 'Copy Trading Allowed' },
                  { key: 'noMinDays', label: 'No Minimum Trading Days (0 Days)' },
                ].map((item) => {
                  const isChecked = (filters as any)[item.key] === true;
                  return (
                    <label
                      key={item.key}
                      className="flex items-center gap-2 cursor-pointer text-[#9a9e9b] hover:text-[#f1f3f2] select-none"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => setFilters((prev) => ({
                          ...prev,
                          [item.key]: isChecked ? null : true
                        }))}
                        className="rounded border-[#333633] bg-[#1d1f1e] text-emerald-500 focus:ring-emerald-500/20"
                      />
                      <span>{item.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Minimum Profit Split & Quick Reset */}
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider font-bold text-[#9a9e9b]">
                Minimum Profit Split
              </label>
              <div className="flex items-center gap-1.5">
                {[0, 80, 85, 90].map((split) => (
                  <button
                    key={split}
                    onClick={() => setFilters((prev) => ({ ...prev, minProfitSplit: split }))}
                    className={`flex-1 py-1 rounded text-center transition-all ${
                      filters.minProfitSplit === split
                        ? 'bg-[#3ecf8e]/20 text-[#3ecf8e] border border-emerald-500/40 font-bold'
                        : 'bg-[#1d1f1e] text-[#9a9e9b] hover:text-[#f1f3f2] border border-[#2b2e2c]'
                    }`}
                  >
                    {split === 0 ? 'Any' : `${split}%+`}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-[#747976] pt-1">
                Filter by guaranteed starting profit split on payout cycles.
              </p>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
