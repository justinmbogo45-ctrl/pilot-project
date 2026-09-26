import React from 'react';
import {
  Mail,
  Twitter,
  Instagram,
  Youtube,
  Linkedin
} from 'lucide-react';

interface MegaFooterProps {
  onOpenMethodology: () => void;
  onOpenHiring: () => void;
  onOpenTutorials: () => void;
  onOpenLoyaltyModal: () => void;
  onSelectMarket: (m: string) => void;
  onSelectTab?: (tab: string) => void;
}

export const MegaFooter: React.FC<MegaFooterProps> = ({
  onOpenMethodology,
  onOpenHiring,
  onOpenTutorials,
  onOpenLoyaltyModal,
  onSelectMarket,
  onSelectTab,
}) => {
  return (
    <footer className="w-full border-t border-[#2b2e2c] bg-[#171918] text-xs mt-20">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 py-14">

        {/* Brand & Mission */}
        <div className="mb-10 pb-8 border-b border-[#2b2e2c] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#3ecf8e]">
              <span className="font-bold text-[#171918] text-sm">PFM</span>
            </div>
            <div>
              <div className="text-lg font-bold text-[#f1f3f2] tracking-tight">Prop Firm Match</div>
              <div className="text-xs text-[#747976]">The Global Authority in Prop Firm Data & Transparency</div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="rounded-md border border-[#2b2e2c] bg-[#1d1f1e] px-3 py-1.5 text-[#9a9e9b]">
              Live CME & Forex Sync Active
            </span>
            <button
              onClick={onOpenMethodology}
              className="rounded-md border border-[#3ecf8e]/30 bg-[#3ecf8e]/10 px-3.5 py-1.5 text-[#3ecf8e] hover:bg-[#3ecf8e]/15 transition-colors duration-150"
            >
              Methodology & Scoring
            </button>
          </div>
        </div>

        {/* Directory Columns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-6 pb-12 border-b border-[#2b2e2c]">

          <div className="space-y-3">
            <div className="text-[11px] font-semibold text-[#f1f3f2] tracking-wider uppercase">Find & Compare</div>
            <ul className="space-y-2 text-[#747976]">
              <li><button onClick={() => { onSelectTab?.('firms'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-[#f1f3f2] transition-colors duration-150 text-left">All Prop Firms</button></li>
              <li><button onClick={() => { onSelectTab?.('compare'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-[#f1f3f2] transition-colors duration-150 text-left">Compare Challenges</button></li>
              <li><button onClick={() => onSelectMarket('Futures')} className="hover:text-[#f1f3f2] transition-colors duration-150 text-left">Futures Prop Firms</button></li>
              <li><button onClick={() => onSelectMarket('Forex')} className="hover:text-[#f1f3f2] transition-colors duration-150 text-left">Forex Prop Firms</button></li>
              <li><button onClick={onOpenMethodology} className="hover:text-[#f1f3f2] transition-colors duration-150 text-left">Rules & Verification</button></li>
              <li><button onClick={() => { onSelectTab?.('compare'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-[#3ecf8e] font-medium cursor-pointer text-left">Compare Firms</button></li>
            </ul>
          </div>

          <div className="space-y-3">
            <div className="text-[11px] font-semibold text-[#f1f3f2] tracking-wider uppercase">Payouts</div>
            <ul className="space-y-2 text-[#747976]">
              <li><button onClick={() => { onSelectTab?.('payouts'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-[#f1f3f2] transition-colors duration-150 text-left">Prop Firm Payouts</button></li>
              <li><button onClick={() => { onSelectTab?.('payouts'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-[#f1f3f2] transition-colors duration-150 text-left">Top Trader Payouts</button></li>
              <li><button onClick={() => { onSelectTab?.('payouts'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-[#f1f3f2] transition-colors duration-150 text-left">Fast Payout Firms</button></li>
              <li><button onClick={() => { onSelectTab?.('payouts'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-[#f1f3f2] transition-colors duration-150 text-left">Proof Certificates</button></li>
            </ul>
          </div>

          <div className="space-y-3">
            <div className="text-[11px] font-semibold text-[#f1f3f2] tracking-wider uppercase">Offers</div>
            <ul className="space-y-2 text-[#747976]">
              <li><button onClick={() => { onSelectTab?.('discounts'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-[#f1f3f2] transition-colors duration-150 text-left">All Offers</button></li>
              <li><button onClick={() => { onSelectTab?.('discounts'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-[#f1f3f2] transition-colors duration-150 text-left">Exclusive Offers</button></li>
              <li><button onClick={() => { onSelectTab?.('discounts'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-[#f1f3f2] transition-colors duration-150 text-left">Extra Account Deals</button></li>
              <li><button onClick={() => { onSelectTab?.('discounts'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-[#f1f3f2] transition-colors duration-150 text-left">Promo Code MATCH</button></li>
            </ul>
          </div>

          <div className="space-y-3">
            <div className="text-[11px] font-semibold text-[#f1f3f2] tracking-wider uppercase">News & Insights</div>
            <ul className="space-y-2 text-[#747976]">
              <li><button onClick={onOpenTutorials} className="hover:text-[#f1f3f2] transition-colors duration-150 text-left">Announcements</button></li>
              <li><button onClick={onOpenTutorials} className="hover:text-[#f1f3f2] transition-colors duration-150 text-left">Industry News</button></li>
              <li><button onClick={onOpenTutorials} className="hover:text-[#f1f3f2] transition-colors duration-150 text-left">Prop Trading Blog</button></li>
              <li><button onClick={onOpenTutorials} className="hover:text-[#f1f3f2] transition-colors duration-150 text-left">Weekly Digest</button></li>
            </ul>
          </div>

          <div className="space-y-3">
            <div className="text-[11px] font-semibold text-[#f1f3f2] tracking-wider uppercase">Tools & Resources</div>
            <ul className="space-y-2 text-[#747976]">
              <li><button onClick={onOpenTutorials} className="hover:text-[#f1f3f2] transition-colors duration-150 text-left">High-Impact News</button></li>
              <li><button onClick={onOpenTutorials} className="hover:text-[#f1f3f2] transition-colors duration-150 text-left">Chrome Extension</button></li>
              <li><button onClick={onOpenTutorials} className="hover:text-[#f1f3f2] transition-colors duration-150 text-left">Guides & Templates</button></li>
              <li><button onClick={onOpenTutorials} className="hover:text-[#f1f3f2] transition-colors duration-150 text-left">Evaluation Simulator</button></li>
            </ul>
          </div>

          <div className="space-y-3">
            <div className="text-[11px] font-semibold text-[#f1f3f2] tracking-wider uppercase">Programs & Rewards</div>
            <ul className="space-y-2 text-[#747976]">
              <li><button onClick={onOpenLoyaltyModal} className="text-[#3ecf8e] hover:text-[#4eda9a] transition-colors duration-150 text-left">Loyalty Program</button></li>
              <li>
                <button
                  onClick={() => onSelectTab?.('affiliates')}
                  className="text-[#3ecf8e] hover:text-[#4eda9a] transition-colors duration-150 text-left flex items-center gap-1"
                >
                  <span>Affiliate Portal</span>
                  <span className="rounded bg-[#3ecf8e]/15 px-1 py-0.5 text-[9px] font-semibold text-[#3ecf8e]">25%</span>
                </button>
              </li>
              <li><a href="#" className="hover:text-[#f1f3f2] transition-colors duration-150">Bug Bounty Program</a></li>
              <li><a href="#" className="hover:text-[#f1f3f2] transition-colors duration-150">Review Bounty Program</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <div className="text-[11px] font-semibold text-[#f1f3f2] tracking-wider uppercase">About PFM</div>
            <ul className="space-y-2 text-[#747976]">
              <li><a href="#" className="hover:text-[#f1f3f2] transition-colors duration-150">About Us</a></li>
              <li><button onClick={onOpenMethodology} className="hover:text-[#f1f3f2] transition-colors duration-150 text-left">Transparency Model</button></li>
              <li><button onClick={onOpenHiring} className="hover:text-[#f1f3f2] transition-colors duration-150 text-left text-[#3ecf8e]">Careers [Hiring]</button></li>
              <li><a href="#" className="hover:text-[#f1f3f2] transition-colors duration-150">Press</a></li>
              <li><a href="#" className="hover:text-[#f1f3f2] transition-colors duration-150">Sitemap</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <div className="text-[11px] font-semibold text-[#f1f3f2] tracking-wider uppercase">Help & Support</div>
            <ul className="space-y-2 text-[#747976]">
              <li><a href="#" className="hover:text-[#f1f3f2] transition-colors duration-150">Contact Us</a></li>
              <li><button onClick={onOpenTutorials} className="hover:text-[#f1f3f2] transition-colors duration-150 text-left">How It Works</button></li>
              <li><a href="#" className="hover:text-[#f1f3f2] transition-colors duration-150">Help Center</a></li>
              <li><a href="#" className="hover:text-[#f1f3f2] transition-colors duration-150">FAQ</a></li>
            </ul>
          </div>
        </div>

        {/* B2B Section */}
        <div className="pt-10 pb-4">
          <div className="flex items-center gap-2 text-base font-bold text-[#f1f3f2] mb-6">
            <span>Prop Firm Business</span>
            <span className="rounded-md border border-[#2b2e2c] bg-[#1d1f1e] px-2 py-0.5 text-[10px] font-medium text-[#9a9e9b]">B2B Directory</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 items-start">
            <div className="space-y-3">
              <div className="text-[11px] font-semibold text-[#9a9e9b] uppercase">Prop Firms & Brokers</div>
              <ul className="space-y-2 text-[#747976]">
                <li><a href="#" className="hover:text-[#f1f3f2] transition-colors duration-150">PFM Business Platform</a></li>
                <li><a href="#" className="hover:text-[#f1f3f2] transition-colors duration-150">List Your Prop Firm</a></li>
                <li><a href="#" className="hover:text-[#f1f3f2] transition-colors duration-150">Find Vetted Providers</a></li>
              </ul>
            </div>

            <div className="space-y-3">
              <div className="text-[11px] font-semibold text-[#9a9e9b] uppercase">Service Providers</div>
              <ul className="space-y-2 text-[#747976]">
                <li><a href="#" className="hover:text-[#f1f3f2] transition-colors duration-150">Get Listed</a></li>
                <li><a href="#" className="hover:text-[#f1f3f2] transition-colors duration-150">Explore the Marketplace</a></li>
              </ul>
            </div>

            <div className="space-y-3">
              <div className="text-[11px] font-semibold text-[#9a9e9b] uppercase">Support</div>
              <ul className="space-y-2 text-[#747976]">
                <li><a href="#" className="hover:text-[#f1f3f2] transition-colors duration-150">Contact PFM Business</a></li>
              </ul>
            </div>

            <div className="rounded-xl border border-[#2b2e2c] bg-[#1d1f1e] p-4 flex flex-col justify-between space-y-3">
              <div>
                <div className="text-xs font-semibold text-[#f1f3f2] uppercase tracking-wide">Have Questions?</div>
                <div className="mt-1 text-xs text-[#9a9e9b]">Contact our business development team for partnerships and verification.</div>
              </div>
              <a
                href="mailto:contact@propfirmmatch.com"
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#3ecf8e] px-4 py-2 text-xs font-semibold text-[#171918] hover:bg-[#4eda9a] transition-colors duration-150"
              >
                <Mail className="h-3.5 w-3.5" />
                <span>Contact Us</span>
              </a>
            </div>
          </div>
        </div>

        {/* Copyright & Socials */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#2b2e2c] pt-6 text-xs text-[#747976]">
          <div className="flex items-center gap-4">
            <span>&copy; 2026 Prop Firm Match. All rights reserved.</span>
            <span className="text-[#2b2e2c]">&middot;</span>
            <a href="#" className="hover:text-[#f1f3f2] transition-colors duration-150">Privacy Policy</a>
            <span className="text-[#2b2e2c]">&middot;</span>
            <a href="#" className="hover:text-[#f1f3f2] transition-colors duration-150">Terms & Conditions</a>
            <span className="text-[#2b2e2c]">&middot;</span>
            <a href="#" className="hover:text-[#f1f3f2] transition-colors duration-150">Marketplace Terms</a>
          </div>

          <div className="flex items-center gap-2">
            {[Twitter, Instagram, Youtube, Linkedin].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="flex h-8 w-8 items-center justify-center rounded-md border border-[#2b2e2c] bg-[#1d1f1e] text-[#747976] hover:text-[#f1f3f2] hover:border-[#333633] transition-colors duration-150"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
};
