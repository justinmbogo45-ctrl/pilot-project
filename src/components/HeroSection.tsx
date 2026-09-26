import React from 'react';
import { ArrowRight, ArrowUpRight, Search } from 'lucide-react';
import type { PropFirm } from '../types';
import { PrimaryButton } from './ui/PrimaryButton';
import { SecondaryButton } from './ui/SecondaryButton';
import { ComparisonPreview } from './ComparisonPreview';

interface HeroSectionProps {
  firms: PropFirm[];
  onCompare: () => void;
  onBrowseOffers: () => void;
  onOpenGoogleGrounding: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ firms, onCompare, onBrowseOffers, onOpenGoogleGrounding }) => (
  <section className="mx-auto max-w-[1240px] px-6 pt-20 pb-20 sm:px-8 lg:pt-28 lg:pb-24">
    <div className="grid items-center gap-16 lg:grid-cols-[1fr_0.95fr] lg:gap-20">
      <div className="max-w-[650px]">
        <p className="mb-7 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#3ecf8e]">Prop firm comparison platform</p>
        <h1 className="text-[clamp(2.65rem,5.2vw,4rem)] font-semibold leading-[1.07] tracking-[-0.045em] text-[#f1f3f2]">
          Compare the best <span className="text-[#3ecf8e]">prop trading firms</span> for 2026
        </h1>
        <p className="mt-7 max-w-[540px] text-base leading-7 text-[#9a9e9b] sm:text-lg sm:leading-8">
          Find the right challenge with a clearer view of pricing, trading rules, payouts, reviews, and current offers.
        </p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <PrimaryButton size="lg" onClick={onCompare}>Compare firms <ArrowRight className="h-4 w-4" /></PrimaryButton>
          <SecondaryButton size="lg" onClick={onBrowseOffers}>Browse offers <ArrowUpRight className="h-4 w-4" /></SecondaryButton>
        </div>
        <button onClick={onOpenGoogleGrounding} className="mt-8 inline-flex items-center gap-2 text-sm text-[#9a9e9b] transition-colors hover:text-[#f1f3f2]">
          <Search className="h-4 w-4 text-[#3ecf8e]" /> Research a firm with live search <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
      <ComparisonPreview firms={firms} onCompare={onCompare} />
    </div>
  </section>
);
