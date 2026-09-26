import React, { useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import type { PropFirm } from '../types';
import { OfferCard } from './OfferCard';

interface ExclusiveOffersCarouselProps {
  firms: PropFirm[];
  onSelectFirm: (firm: PropFirm) => void;
  onOpenLoyaltyModal: () => void;
}

export const ExclusiveOffersCarousel: React.FC<ExclusiveOffersCarouselProps> = ({ firms, onSelectFirm, onOpenLoyaltyModal }) => {
  const [page, setPage] = useState(0);
  const eligible = firms.filter(firm => firm.exclusiveDiscount && firm.plans.length > 0);
  const pages = Math.max(1, Math.ceil(eligible.length / 6));
  const current = Math.min(page, pages - 1);
  const visible = eligible.slice(current * 6, current * 6 + 6);
  return <section id="current-offers" className="mx-auto max-w-[1240px] px-6 py-24 sm:px-8 lg:py-32">
    <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#3ecf8e]">Fresh from the catalog</p>
        <h2 className="text-3xl font-medium tracking-tight text-[#f1f3f2] sm:text-4xl">Current offers</h2>
        <p className="mt-3 text-base text-[#9a9e9b]">Latest discounts and promotions from prop trading firms.</p>
      </div>
      <button onClick={onOpenLoyaltyModal} className="inline-flex items-center gap-2 self-start text-sm text-[#9a9e9b] transition-colors hover:text-[#f1f3f2]">Explore member rewards <ArrowRight className="h-4 w-4" /></button>
    </div>
    {visible.length ? <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{visible.map(firm => <OfferCard key={firm.id} firm={firm} onSelect={() => onSelectFirm(firm)} />)}</div> : <div className="rounded-2xl border border-[#2b2e2c] bg-[#1d1f1e] px-6 py-12 text-sm text-[#9a9e9b]">Current offers will appear here when the catalog provides them.</div>}
    {pages > 1 && <div className="mt-8 flex items-center justify-between border-t border-[#2b2e2c] pt-5">
      <p className="text-sm text-[#747976]">Page {current + 1} of {pages}</p>
      <div className="flex gap-2">
        <button onClick={() => setPage((current - 1 + pages) % pages)} aria-label="Previous offers" className="rounded-lg border border-[#2b2e2c] p-2.5 text-[#9a9e9b] transition-colors hover:border-[#3a3f3b] hover:text-[#f1f3f2]"><ChevronLeft className="h-4 w-4" /></button>
        <button onClick={() => setPage((current + 1) % pages)} aria-label="Next offers" className="rounded-lg border border-[#2b2e2c] p-2.5 text-[#9a9e9b] transition-colors hover:border-[#3a3f3b] hover:text-[#f1f3f2]"><ChevronRight className="h-4 w-4" /></button>
      </div>
    </div>}
  </section>;
};
