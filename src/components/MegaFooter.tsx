import React from 'react';
import { ArrowUpRight } from 'lucide-react';

interface MegaFooterProps {
  onOpenMethodology: () => void;
  onOpenHiring: () => void;
  onOpenTutorials: () => void;
  onOpenLoyaltyModal: () => void;
  onSelectMarket: (market: string) => void;
  onSelectTab?: (tab: string) => void;
}

export const MegaFooter: React.FC<MegaFooterProps> = ({ onOpenMethodology, onOpenHiring, onOpenTutorials, onOpenLoyaltyModal, onSelectMarket, onSelectTab }) => {
  const columns = [
    { title: 'Explore', links: [
      { label: 'All firms', action: () => onSelectTab?.('firms') },
      { label: 'Compare firms', action: () => onSelectTab?.('compare') },
      { label: 'Futures firms', action: () => onSelectMarket('Futures') },
      { label: 'Forex firms', action: () => onSelectMarket('Forex') },
    ] },
    { title: 'Discover', links: [
      { label: 'Current offers', action: () => onSelectTab?.('discounts') },
      { label: 'Payouts', action: () => onSelectTab?.('payouts') },
      { label: 'Methodology & rules', action: onOpenMethodology },
      { label: 'Tutorials & guides', action: onOpenTutorials },
    ] },
    { title: 'Community', links: [
      { label: 'Affiliate portal', action: () => onSelectTab?.('affiliates') },
      { label: 'Loyalty rewards', action: onOpenLoyaltyModal },
      { label: 'Careers', action: onOpenHiring },
    ] },
  ];
  const choose = (action: () => void) => { action(); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  return <footer className="mt-24 border-t border-[#2b2e2c] bg-[#171918]">
    <div className="mx-auto max-w-[1240px] px-6 py-16 sm:px-8 lg:py-20">
      <div className="grid gap-12 border-b border-[#2b2e2c] pb-16 lg:grid-cols-[1.4fr_2fr]">
        <div className="max-w-sm">
          <div className="flex items-center gap-2.5"><span className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#3ecf8e]/30 bg-[#3ecf8e]/10 text-xs font-semibold text-[#3ecf8e]">SP</span><span className="font-semibold tracking-tight text-[#f1f3f2]">Signal Props</span></div>
          <p className="mt-6 text-sm leading-7 text-[#9a9e9b]">Clearer data for comparing prop trading firms, account plans, rules, and offers.</p>
          <a href="mailto:contact@propfirmmatch.com" className="mt-6 inline-flex items-center gap-1.5 text-sm text-[#f1f3f2] hover:text-[#3ecf8e]">Contact us <ArrowUpRight className="h-4 w-4" /></a>
        </div>
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
          {columns.map(column => <div key={column.title}>
            <h2 className="text-sm font-medium text-[#f1f3f2]">{column.title}</h2>
            <ul className="mt-5 space-y-3.5">{column.links.map(link => <li key={link.label}><button onClick={() => choose(link.action)} className="text-left text-sm text-[#747976] transition-colors hover:text-[#f1f3f2]">{link.label}</button></li>)}</ul>
          </div>)}
        </div>
      </div>
      <div className="flex flex-col gap-2 pt-7 text-xs text-[#747976] sm:flex-row sm:items-center sm:justify-between"><span>© {new Date().getFullYear()} Signal Props</span><span>Catalog information is provided for comparison; confirm terms with each firm.</span></div>
    </div>
  </footer>;
};
