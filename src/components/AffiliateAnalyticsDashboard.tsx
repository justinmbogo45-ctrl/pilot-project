import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  ComposedChart, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  Cell 
} from 'recharts';
import { 
  TrendingUp, 
  BarChart3, 
  MousePointerClick, 
  Target, 
  DollarSign, 
  Calendar, 
  Layers, 
  Link as LinkIcon, 
  ArrowUpRight, 
  Filter, 
  Percent, 
  Activity,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { AffiliateProfile, ReferralActivityItem } from '../types';

interface AffiliateAnalyticsDashboardProps {
  profile: AffiliateProfile | null;
  activities: ReferralActivityItem[];
}

type Timeframe = '3M' | '6M' | '1Y';
type ActiveChartView = 'overview' | 'growth' | 'conversions' | 'links';

interface MonthlyDataPoint {
  month: string;
  fullName: string;
  clicks: number;
  signups: number;
  conversions: number;
  earnings: number;
  ctr: number;
  convRate: number;
}

interface CustomLinkMetric {
  id: string;
  name: string;
  url: string;
  type: 'vanity' | 'deeplink' | 'campaign' | 'promo';
  impressions: number;
  clicks: number;
  ctr: number;
  conversions: number;
  convRate: number;
  earnings: number;
  trend: string;
}

export const AffiliateAnalyticsDashboard: React.FC<AffiliateAnalyticsDashboardProps> = ({
  profile,
  activities
}) => {
  const [timeframe, setTimeframe] = useState<Timeframe>('6M');
  const [chartView, setChartView] = useState<ActiveChartView>('overview');
  const [selectedLinkFilter, setSelectedLinkFilter] = useState<string>('all');

  // Compute dynamic monthly referral growth and conversion trend data
  const monthlyData: MonthlyDataPoint[] = useMemo(() => {
    // Current dynamic values from profile (updated via simulations or real events)
    const currentClicks = profile?.totalClicks || 342;
    const currentConversions = profile?.totalConversions || 14;
    const currentSignups = profile?.totalSignups || 46;
    const currentEarnings = Number(((profile?.availableEarnings || 0) + (profile?.pendingEarnings || 0) + 120).toFixed(2));
    const currentConvRate = Number(((currentConversions / Math.max(1, currentClicks)) * 100).toFixed(1));
    const currentCtr = 8.6;

    const allMonths: MonthlyDataPoint[] = [
      { month: 'Oct 25', fullName: 'October 2025', clicks: 85, signups: 12, conversions: 3, earnings: 112.50, ctr: 5.4, convRate: 3.5 },
      { month: 'Nov 25', fullName: 'November 2025', clicks: 110, signups: 16, conversions: 4, earnings: 154.00, ctr: 5.9, convRate: 3.6 },
      { month: 'Dec 25', fullName: 'December 2025', clicks: 135, signups: 20, conversions: 5, earnings: 198.00, ctr: 6.2, convRate: 3.7 },
      { month: 'Jan 26', fullName: 'January 2026', clicks: 165, signups: 24, conversions: 6, earnings: 245.50, ctr: 6.8, convRate: 3.6 },
      { month: 'Feb 26', fullName: 'February 2026', clicks: 195, signups: 28, conversions: 7, earnings: 285.00, ctr: 7.1, convRate: 3.6 },
      { month: 'Mar 26', fullName: 'March 2026', clicks: 230, signups: 32, conversions: 9, earnings: 360.00, ctr: 7.4, convRate: 3.9 },
      { month: 'Apr 26', fullName: 'April 2026', clicks: 260, signups: 36, conversions: 10, earnings: 410.00, ctr: 7.7, convRate: 3.8 },
      { month: 'May 26', fullName: 'May 2026', clicks: 285, signups: 39, conversions: 11, earnings: 465.00, ctr: 8.0, convRate: 3.9 },
      { month: 'Jun 26', fullName: 'June 2026', clicks: 305, signups: 42, conversions: 12, earnings: 512.00, ctr: 8.2, convRate: 3.9 },
      { month: 'Jul 26', fullName: 'July 2026', clicks: 320, signups: 44, conversions: 13, earnings: 565.00, ctr: 8.4, convRate: 4.1 },
      { month: 'Aug 26', fullName: 'August 2026', clicks: 335, signups: 45, conversions: 13, earnings: 620.00, ctr: 8.5, convRate: 3.9 },
      { 
        month: 'Sep 26', 
        fullName: 'September 2026 (Current)', 
        clicks: currentClicks, 
        signups: currentSignups, 
        conversions: currentConversions, 
        earnings: currentEarnings, 
        ctr: currentCtr, 
        convRate: currentConvRate 
      },
    ];

    if (timeframe === '3M') return allMonths.slice(-3);
    if (timeframe === '6M') return allMonths.slice(-6);
    return allMonths;
  }, [profile, timeframe]);

  // Custom links performance tracking
  const customLinksData: CustomLinkMetric[] = useMemo(() => {
    const slug = profile?.customSlug || 'trader_pro';
    const totalClicks = profile?.totalClicks || 342;
    const totalConvs = profile?.totalConversions || 14;

    return [
      {
        id: 'link-1',
        name: 'Vanity Primary Link',
        url: `propfirmmatch.com/?ref=${slug}`,
        type: 'vanity',
        impressions: 2150,
        clicks: Math.round(totalClicks * 0.52),
        ctr: 8.28,
        conversions: Math.max(1, Math.round(totalConvs * 0.50)),
        convRate: 4.49,
        earnings: 382.50,
        trend: '+14.2%',
      },
      {
        id: 'link-2',
        name: 'Lucid Trading 1-Step Deep Link',
        url: `propfirmmatch.com/?ref=${slug}&firm=lucid-trading`,
        type: 'deeplink',
        impressions: 840,
        clicks: Math.round(totalClicks * 0.27),
        ctr: 10.95,
        conversions: Math.max(1, Math.round(totalConvs * 0.29)),
        convRate: 5.43,
        earnings: 186.75,
        trend: '+22.5%',
      },
      {
        id: 'link-3',
        name: 'Tradeify $50K Combine Deep Link',
        url: `propfirmmatch.com/?ref=${slug}&firm=tradeify`,
        type: 'deeplink',
        impressions: 520,
        clicks: Math.round(totalClicks * 0.14),
        ctr: 9.23,
        conversions: Math.max(1, Math.round(totalConvs * 0.14)),
        convRate: 4.17,
        earnings: 64.50,
        trend: '+8.1%',
      },
      {
        id: 'link-4',
        name: 'Partner Promo Code (MATCH-PRO)',
        url: `Checkout Coupon: ${profile?.referralCode || 'MATCH-PRO'}`,
        type: 'promo',
        impressions: 190,
        clicks: Math.max(12, Math.round(totalClicks * 0.07)),
        ctr: 12.63,
        conversions: Math.max(1, Math.round(totalConvs * 0.07)),
        convRate: 4.17,
        earnings: 37.35,
        trend: '+5.4%',
      },
    ];
  }, [profile]);

  // Filter links if dropdown selected
  const filteredLinks = useMemo(() => {
    if (selectedLinkFilter === 'all') return customLinksData;
    return customLinksData.filter((l) => l.type === selectedLinkFilter);
  }, [customLinksData, selectedLinkFilter]);

  // Aggregate KPI summary metrics
  const kpiStats = useMemo(() => {
    const current = monthlyData[monthlyData.length - 1];
    const prev = monthlyData.length > 1 ? monthlyData[monthlyData.length - 2] : current;

    const clicksGrowth = prev.clicks > 0 ? (((current.clicks - prev.clicks) / prev.clicks) * 100).toFixed(1) : '0';
    const convGrowth = prev.conversions > 0 ? (((current.conversions - prev.conversions) / prev.conversions) * 100).toFixed(1) : '0';
    const earningsGrowth = prev.earnings > 0 ? (((current.earnings - prev.earnings) / prev.earnings) * 100).toFixed(1) : '0';

    const avgCtr = (customLinksData.reduce((acc, curr) => acc + curr.ctr, 0) / customLinksData.length).toFixed(1);
    const avgConvRate = (monthlyData.reduce((acc, curr) => acc + curr.convRate, 0) / monthlyData.length).toFixed(1);

    return {
      clicksGrowth: Number(clicksGrowth) >= 0 ? `+${clicksGrowth}%` : `${clicksGrowth}%`,
      convGrowth: Number(convGrowth) >= 0 ? `+${convGrowth}%` : `${convGrowth}%`,
      earningsGrowth: Number(earningsGrowth) >= 0 ? `+${earningsGrowth}%` : `${earningsGrowth}%`,
      avgCtr: `${avgCtr}%`,
      avgConvRate: `${avgConvRate}%`,
      totalClicksCount: current.clicks,
      totalConversionsCount: current.conversions,
      monthlyRunRate: `$${(current.earnings * 1.15).toFixed(0)}`
    };
  }, [monthlyData, customLinksData]);

  // Custom tooltips with high contrast styling
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#101426] border border-purple-500/40 rounded-xl p-3 shadow-2xl text-xs space-y-1.5 backdrop-blur-md">
          <div className="font-extrabold text-white pb-1 border-b border-slate-800 flex items-center justify-between gap-4">
            <span>{label}</span>
            <span className="text-[10px] text-purple-300 font-mono">Monthly Audit</span>
          </div>
          {payload.map((entry: any, index: number) => {
            const isCurrency = entry.name.toLowerCase().includes('earnings') || entry.name.toLowerCase().includes('revenue');
            const isPercent = entry.name.toLowerCase().includes('rate') || entry.name.toLowerCase().includes('ctr');
            let formattedValue = entry.value;
            if (isCurrency) formattedValue = `$${Number(entry.value).toFixed(2)}`;
            else if (isPercent) formattedValue = `${entry.value}%`;
            else formattedValue = Number(entry.value).toLocaleString();

            return (
              <div key={`item-${index}`} className="flex items-center justify-between gap-4 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-slate-300 font-medium">{entry.name}:</span>
                </div>
                <span className="font-bold text-white font-mono">{formattedValue}</span>
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 mb-8">
      
      {/* Dashboard Top Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-[#12162a] border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-950/80 border border-purple-500/40 text-purple-300">
              <BarChart3 className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
                <span>Affiliate Growth & Performance Analytics</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[10px] font-extrabold text-emerald-300">
                  Live Attribution
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Track referral traffic growth, funded combine conversion rates, and CTR dynamics across all custom links.
              </p>
            </div>
          </div>
        </div>

        {/* Filters: Timeframe & Chart View */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Timeframe selector */}
          <div className="flex items-center bg-[#0d1020] border border-slate-700/80 rounded-xl p-1 text-xs font-bold text-slate-400">
            {(['3M', '6M', '1Y'] as Timeframe[]).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  timeframe === tf
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'hover:text-slate-200'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* View Toggles */}
          <div className="flex items-center bg-[#0d1020] border border-slate-700/80 rounded-xl p-1 text-xs font-semibold text-slate-400">
            <button
              onClick={() => setChartView('overview')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                chartView === 'overview'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'hover:text-slate-200'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setChartView('growth')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                chartView === 'growth'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'hover:text-slate-200'
              }`}
            >
              Traffic Growth
            </button>
            <button
              onClick={() => setChartView('conversions')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                chartView === 'conversions'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'hover:text-slate-200'
              }`}
            >
              Conversions
            </button>
            <button
              onClick={() => setChartView('links')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                chartView === 'links'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'hover:text-slate-200'
              }`}
            >
              Custom Links CTR
            </button>
          </div>

        </div>
      </div>

      {/* 4 Mini KPI Analytical Highlights */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        
        <div className="p-4 rounded-xl bg-[#12162a] border border-slate-800/80 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Monthly Traffic Growth</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white">
            {kpiStats.clicksGrowth}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {kpiStats.totalClicksCount} clicks recorded
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#12162a] border border-slate-800/80 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Avg. Custom Link CTR</span>
            <MousePointerClick className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-300">
            {kpiStats.avgCtr}
          </div>
          <div className="text-[11px] text-emerald-400 mt-0.5 font-medium">
            +1.8% above industry average
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#12162a] border border-slate-800/80 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Challenge Conv. Rate</span>
            <Target className="w-3.5 h-3.5 text-pink-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-pink-300">
            {kpiStats.avgConvRate}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {kpiStats.totalConversionsCount} paid challenge buyers
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#12162a] border border-slate-800/80 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Projected Monthly Revenue</span>
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-400">
            {kpiStats.monthlyRunRate}
          </div>
          <div className="text-[11px] text-purple-300 mt-0.5 font-medium">
            Based on current {profile?.commissionRate || 15}% tier
          </div>
        </div>

      </div>

      {/* Main Charts Canvas Container */}
      <div className="p-6 rounded-2xl bg-[#12162a] border border-slate-800 shadow-xl space-y-4">
        
        {/* Dynamic Header based on active view */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
          <div>
            <h3 className="font-extrabold text-white text-base flex items-center gap-2">
              {chartView === 'overview' && 'Referral Volume & RevShare Trend'}
              {chartView === 'growth' && 'Monthly Referral Link Traffic & Signup Velocity'}
              {chartView === 'conversions' && 'Funded Account Challenge Sales vs Commission Payouts'}
              {chartView === 'links' && 'Click-Through Rate (CTR) & Conversion Rate by Custom Link'}
            </h3>
            <p className="text-xs text-slate-400">
              {chartView === 'overview' && 'Aggregated view comparing monthly trader link clicks with resulting challenge purchase revenue.'}
              {chartView === 'growth' && 'Trajectory of monthly clicks, registered signups, and community engagement over time.'}
              {chartView === 'conversions' && 'Conversion volume breakdown and corresponding RevShare commissions cleared into your wallet.'}
              {chartView === 'links' && 'Granular performance breakdown across each of your specific promotional vanity URLs and deep links.'}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Monthly Horizon ({timeframe})</span>
          </div>
        </div>

        {/* View 1: Overview (ComposedChart: Clicks as Area + Earnings as Bar) */}
        {chartView === 'overview' && (
          <div className="h-72 sm:h-80 w-full min-h-[300px] pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={monthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="overviewClicksGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" vertical={false} />
                <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="left" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" stroke="#10b981" tick={{ fontSize: 11 }} tickFormatter={(val) => `$${val}`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area yAxisId="left" type="monotone" dataKey="clicks" name="Link Clicks" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#overviewClicksGrad)" />
                <Bar yAxisId="right" dataKey="earnings" name="Commissions ($)" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={36} />
                <Line yAxisId="left" type="monotone" dataKey="conversions" name="Challenge Sales" stroke="#ec4899" strokeWidth={2} dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* View 2: Traffic Growth (AreaChart: Clicks and Signups) */}
        {chartView === 'growth' && (
          <div className="h-72 sm:h-80 w-full min-h-[300px] pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="growthClicksGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="growthSignupsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" vertical={false} />
                <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="clicks" name="Unique Link Clicks" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#growthClicksGrad)" />
                <Area type="monotone" dataKey="signups" name="Registered Accounts" stroke="#3b82f6" strokeWidth={2} fill="url(#growthSignupsGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* View 3: Conversions (BarChart: Paid Conversions & RevShare) */}
        {chartView === 'conversions' && (
          <div className="h-72 sm:h-80 w-full min-h-[300px] pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" vertical={false} />
                <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="left" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" stroke="#10b981" tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar yAxisId="left" dataKey="conversions" name="Paid Challenge Sales" fill="#ec4899" radius={[6, 6, 0, 0]} maxBarSize={32} />
                <Bar yAxisId="right" dataKey="earnings" name="Commission Revenue ($)" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* View 4: Custom Links CTR Comparison */}
        {chartView === 'links' && (
          <div className="h-72 sm:h-80 w-full min-h-[300px] pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredLinks} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" horizontal={false} />
                <XAxis type="number" stroke="#64748b" tick={{ fontSize: 11 }} tickFormatter={(val) => `${val}%`} />
                <YAxis type="category" dataKey="name" stroke="#cbd5e1" tick={{ fontSize: 11 }} width={140} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="ctr" name="Click-Through Rate (CTR %)" fill="#f59e0b" radius={[0, 6, 6, 0]} maxBarSize={22} />
                <Bar dataKey="convRate" name="Purchase Conversion Rate (%)" fill="#ec4899" radius={[0, 6, 6, 0]} maxBarSize={22} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

      </div>

      {/* Custom Link CTR & Performance Detailed Table */}
      <div className="p-6 rounded-2xl bg-[#12162a] border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-extrabold text-white text-base flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-purple-400" />
              <span>Custom Referral Links CTR & Conversion Breakdown</span>
            </h3>
            <p className="text-xs text-slate-400">
              Detailed audit of impressions, clicks, click-through rates, and attributed commissions by promotional link.
            </p>
          </div>

          {/* Filter Link Types */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedLinkFilter}
              onChange={(e) => setSelectedLinkFilter(e.target.value)}
              className="bg-[#0d1020] border border-slate-700 text-xs rounded-xl px-3 py-1.5 text-slate-200 focus:outline-none focus:border-purple-500 font-medium"
            >
              <option value="all">All Promotional Links ({customLinksData.length})</option>
              <option value="vanity">Vanity URLs</option>
              <option value="deeplink">Prop Firm Deep Links</option>
              <option value="promo">Promo Codes</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0e1122] text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-4 font-bold">Custom Promotional Asset</th>
                <th className="py-2.5 px-4 font-bold">Asset Type</th>
                <th className="py-2.5 px-4 font-bold font-mono">Impressions</th>
                <th className="py-2.5 px-4 font-bold font-mono">Clicks</th>
                <th className="py-2.5 px-4 font-bold font-mono text-amber-400">CTR %</th>
                <th className="py-2.5 px-4 font-bold font-mono text-pink-400">Sales</th>
                <th className="py-2.5 px-4 font-bold font-mono">Conv. Rate</th>
                <th className="py-2.5 px-4 font-bold font-mono text-emerald-400">Earned RevShare</th>
                <th className="py-2.5 px-4 text-right font-bold">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredLinks.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4">
                    <div>
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span>{item.name}</span>
                        {item.type === 'deeplink' && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold">Targeted</span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate max-w-xs sm:max-w-sm">
                        {item.url}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700/60">
                      {item.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono">{item.impressions.toLocaleString()}</td>
                  <td className="py-3 px-4 font-mono font-bold text-purple-300">{item.clicks}</td>
                  <td className="py-3 px-4 font-mono font-black text-amber-400">
                    <div className="flex items-center gap-1">
                      <span>{item.ctr}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-pink-300">{item.conversions}</td>
                  <td className="py-3 px-4 font-mono">
                    <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-200 font-bold text-[10px]">
                      {item.convRate}%
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-black text-emerald-400">
                    ${item.earnings.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-[11px] font-extrabold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      {item.trend}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};
