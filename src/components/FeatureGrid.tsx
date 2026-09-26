import React from 'react';
import { ArrowRight, Bell, GitCompareArrows, MessageSquareText, Percent, Search, ShieldCheck, Wallet } from 'lucide-react';
import { FeatureCard } from './FeatureCard';

interface FeatureGridProps {
  onCompare: () => void;
  onReviews: () => void;
  onRules: () => void;
  onPayouts: () => void;
  onOffers: () => void;
  onSearch: () => void;
  onAlerts: () => void;
}

export const FeatureGrid: React.FC<FeatureGridProps> = ({ onCompare, onReviews, onRules, onPayouts, onOffers, onSearch, onAlerts }) => (
  <section className="mx-auto max-w-[1240px] px-6 py-24 sm:px-8 lg:py-32">
    <div className="mb-11 max-w-2xl">
      <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#3ecf8e]">Built for better decisions</p>
      <h2 className="text-3xl font-medium tracking-tight text-[#f1f3f2] sm:text-4xl">Every detail, in one clear view.</h2>
      <p className="mt-4 text-base leading-7 text-[#9a9e9b]">Explore the terms behind each challenge, then compare the firms that fit the way you trade.</p>
    </div>
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      <FeatureCard icon={GitCompareArrows} title="Compare side by side" description="Put firm plans next to each other and inspect pricing, targets, drawdowns, and profit splits." className="lg:col-span-2" action="Open comparison" onAction={onCompare}>
        <div className="mt-8 grid grid-cols-3 overflow-hidden rounded-lg border border-[#2b2e2c] text-xs">
          <div className="bg-[#202321] p-3 text-[#747976]">Compare</div><div className="border-l border-[#2b2e2c] bg-[#202321] p-3 text-[#9a9e9b]">Firm A</div><div className="border-l border-[#2b2e2c] bg-[#202321] p-3 text-[#9a9e9b]">Firm B</div>
          <div className="border-t border-[#2b2e2c] p-3 text-[#747976]">Profit split</div><div className="border-l border-t border-[#2b2e2c] p-3 text-[#3ecf8e]">View terms</div><div className="border-l border-t border-[#2b2e2c] p-3 text-[#3ecf8e]">View terms</div>
        </div>
      </FeatureCard>
      <FeatureCard icon={MessageSquareText} title="Trader reviews" description="Read community feedback alongside published firm ratings and details." action="Browse reviews" onAction={onReviews} />
      <FeatureCard icon={ShieldCheck} title="Challenge rules" description="Understand trading conditions before choosing a plan." action="See methodology" onAction={onRules} />
      <FeatureCard icon={Wallet} title="Payout information" description="Review payout terms and available proof records in one place." action="View payouts" onAction={onPayouts} />
      <FeatureCard icon={Percent} title="Current discounts" description="Explore available promotions and copy offer codes when provided." action="Browse offers" onAction={onOffers} />
      <FeatureCard icon={Search} title="Live research" description="Search the web for current information about a firm using the existing research tool." action="Open live search" onAction={onSearch} className="lg:col-span-2">
        <div className="mt-7 flex items-center gap-3 rounded-lg border border-[#2b2e2c] bg-[#171918] px-4 py-3 text-xs text-[#747976]"><Search className="h-4 w-4 text-[#3ecf8e]" /> Search current rules, offers, and reputation <ArrowRight className="ml-auto h-3.5 w-3.5" /></div>
      </FeatureCard>
      <FeatureCard icon={Bell} title="Price alerts" description="Save a target price for a challenge and manage alerts from your account." action="Manage alerts" onAction={onAlerts} />
    </div>
  </section>
);
