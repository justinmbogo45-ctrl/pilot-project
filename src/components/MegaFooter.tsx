import React from 'react';
import { 
  TrendingUp, 
  ExternalLink, 
  Mail, 
  Sparkles,
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
    <footer className="w-full bg-[#090b14] border-t border-slate-800 text-slate-400 text-xs mt-16">
      
      {/* Upper Footer: Main PFM Directory */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        
        {/* Brand & Mission statement */}
        <div className="mb-10 pb-8 border-b border-slate-800/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-600 via-purple-600 to-indigo-600 p-[2px] shadow-lg shadow-purple-900/40">
              <div className="w-full h-full bg-[#090b14] rounded-[10px] flex items-center justify-center font-bold text-white text-base">
                PFM
              </div>
            </div>
            <div>
              <div className="font-extrabold text-lg text-white tracking-tight">Prop Firm Match</div>
              <div className="text-xs text-slate-400">The Global Authority in Prop Firm Data & Transparency</div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
              🟢 Live CME & Forex Sync Active
            </span>
            <button
              onClick={onOpenMethodology}
              className="px-3.5 py-1.5 rounded-full bg-purple-950/60 border border-purple-500/40 text-purple-200 hover:text-white transition-colors"
            >
              Methodology & Scoring
            </button>
          </div>
        </div>

        {/* Directory Columns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-6 pb-12 border-b border-slate-800/60">
          
          {/* Col 1: FIND & COMPARE */}
          <div className="space-y-2.5">
            <div className="text-[11px] font-bold text-white tracking-wider uppercase">Find & Compare</div>
            <ul className="space-y-1.5">
              <li><button onClick={() => { onSelectTab?.('firms'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white transition-colors text-left">All Prop Firms</button></li>
              <li><button onClick={() => { onSelectTab?.('compare'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white transition-colors text-left">Compare Challenges</button></li>
              <li><button onClick={() => onSelectMarket('Futures')} className="hover:text-white transition-colors text-left">Futures Prop Firms</button></li>
              <li><button onClick={() => onSelectMarket('Forex')} className="hover:text-white transition-colors text-left">Forex Prop Firms</button></li>
              <li><button onClick={onOpenMethodology} className="hover:text-white transition-colors text-left">Prop Firm Rules & Verification</button></li>
              <li><button onClick={() => { onSelectTab?.('compare'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-purple-400 font-semibold cursor-pointer text-left">Compare Firms [New]</button></li>
            </ul>
          </div>

          {/* Col 2: PAYOUTS */}
          <div className="space-y-2.5">
            <div className="text-[11px] font-bold text-white tracking-wider uppercase">Payouts</div>
            <ul className="space-y-1.5">
              <li><button onClick={() => { onSelectTab?.('payouts'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white transition-colors text-left">Prop Firm Payouts</button></li>
              <li><button onClick={() => { onSelectTab?.('payouts'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white transition-colors text-left">Top Trader Payouts</button></li>
              <li><button onClick={() => { onSelectTab?.('payouts'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white transition-colors text-left">Fast Payout Firms</button></li>
              <li><button onClick={() => { onSelectTab?.('payouts'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white transition-colors text-left">Proof Certificates</button></li>
            </ul>
          </div>

          {/* Col 3: OFFERS */}
          <div className="space-y-2.5">
            <div className="text-[11px] font-bold text-white tracking-wider uppercase">Offers</div>
            <ul className="space-y-1.5">
              <li><button onClick={() => { onSelectTab?.('discounts'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white transition-colors text-left">All Offers</button></li>
              <li><button onClick={() => { onSelectTab?.('discounts'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white transition-colors text-left">Exclusive Offers</button></li>
              <li><button onClick={() => { onSelectTab?.('discounts'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white transition-colors text-left">Extra Account Deals</button></li>
              <li><button onClick={() => { onSelectTab?.('discounts'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white transition-colors text-left">Promo Code MATCH</button></li>
            </ul>
          </div>

          {/* Col 4: NEWS & INSIGHTS */}
          <div className="space-y-2.5">
            <div className="text-[11px] font-bold text-white tracking-wider uppercase">News & Insights</div>
            <ul className="space-y-1.5">
              <li><button onClick={onOpenTutorials} className="hover:text-white transition-colors text-left">Announcements</button></li>
              <li><button onClick={onOpenTutorials} className="hover:text-white transition-colors text-left">Industry News</button></li>
              <li><button onClick={onOpenTutorials} className="hover:text-white transition-colors text-left">Prop Trading Blog</button></li>
              <li><button onClick={onOpenTutorials} className="hover:text-white transition-colors text-left">Weekly Digest</button></li>
            </ul>
          </div>

          {/* Col 5: TOOLS & RESOURCES */}
          <div className="space-y-2.5">
            <div className="text-[11px] font-bold text-white tracking-wider uppercase">Tools & Resources</div>
            <ul className="space-y-1.5">
              <li><button onClick={onOpenTutorials} className="hover:text-white transition-colors text-left">High-Impact News</button></li>
              <li><button onClick={onOpenTutorials} className="hover:text-white transition-colors text-left">Chrome Extension</button></li>
              <li><button onClick={onOpenTutorials} className="hover:text-white transition-colors text-left">Guides & Templates</button></li>
              <li><button onClick={onOpenTutorials} className="hover:text-white transition-colors text-left">Evaluation Simulator</button></li>
            </ul>
          </div>

          {/* Col 6: PROGRAMS & REWARDS */}
          <div className="space-y-2.5">
            <div className="text-[11px] font-bold text-white tracking-wider uppercase">Programs & Rewards</div>
            <ul className="space-y-1.5">
              <li><button onClick={onOpenLoyaltyModal} className="text-purple-300 hover:text-white transition-colors text-left flex items-center gap-1">💎 Loyalty Program</button></li>
              <li>
                <button 
                  onClick={() => onSelectTab?.('affiliates')} 
                  className="text-emerald-400 hover:text-emerald-300 transition-colors text-left flex items-center gap-1"
                >
                  <span>Affiliate Portal</span>
                  <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold">25%</span>
                </button>
              </li>
              <li><a href="#" className="hover:text-white transition-colors">Bug Bounty Program</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Review Bounty Program</a></li>
            </ul>
          </div>

          {/* Col 7: ABOUT PFM */}
          <div className="space-y-2.5">
            <div className="text-[11px] font-bold text-white tracking-wider uppercase">About PFM</div>
            <ul className="space-y-1.5">
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><button onClick={onOpenMethodology} className="hover:text-white transition-colors text-left">Transparency Model</button></li>
              <li><button onClick={onOpenHiring} className="hover:text-white transition-colors text-left text-pink-400 font-medium">Careers [We're Hiring]</button></li>
              <li><a href="#" className="hover:text-white transition-colors">Press</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Sitemap</a></li>
            </ul>
          </div>

          {/* Col 8: HELP & SUPPORT */}
          <div className="space-y-2.5">
            <div className="text-[11px] font-bold text-white tracking-wider uppercase">Help & Support</div>
            <ul className="space-y-1.5">
              <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
              <li><button onClick={onOpenTutorials} className="hover:text-white transition-colors text-left">How It Works</button></li>
              <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
            </ul>
          </div>

        </div>

        {/* Section 2: Prop Firm Business matching Screenshot 2 */}
        <div className="pt-10 pb-4">
          <div className="text-white font-extrabold text-base mb-6 flex items-center gap-2">
            <span>Prop Firm Business</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-normal">B2B Directory</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 items-start">
            
            <div className="space-y-2">
              <div className="text-[11px] font-bold text-slate-300 uppercase">Prop Firms & Brokers</div>
              <ul className="space-y-1.5 text-xs">
                <li><a href="#" className="hover:text-white transition-colors">PFM Business Platform</a></li>
                <li><a href="#" className="hover:text-white transition-colors">List Your Prop Firm</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Find Vetted Providers</a></li>
              </ul>
            </div>

            <div className="space-y-2">
              <div className="text-[11px] font-bold text-slate-300 uppercase">Service Providers</div>
              <ul className="space-y-1.5 text-xs">
                <li><a href="#" className="hover:text-white transition-colors">Get Listed</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Explore the Marketplace</a></li>
              </ul>
            </div>

            <div className="space-y-2">
              <div className="text-[11px] font-bold text-slate-300 uppercase">Support</div>
              <ul className="space-y-1.5 text-xs">
                <li><a href="#" className="hover:text-white transition-colors">Contact PFM Business</a></li>
              </ul>
            </div>

            {/* Questions Card matching Screenshot 2 */}
            <div className="bg-[#121628] border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3">
              <div>
                <div className="text-white font-bold text-xs uppercase tracking-wide">HAVE QUESTIONS?</div>
                <div className="text-slate-400 text-xs mt-1">Contact our business development team for partnerships and verification.</div>
              </div>
              <a
                href="mailto:contact@propfirmmatch.com"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Contact Us</span>
              </a>
            </div>

          </div>
        </div>

        {/* Bottom Bar: Copyright & Socials */}
        <div className="mt-12 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          
          <div className="flex items-center gap-4 text-slate-400">
            <span>© 2026 Prop Firm Match. All rights reserved.</span>
            <span>•</span>
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <span>•</span>
            <a href="#" className="hover:text-white transition-colors">Terms & Conditions</a>
            <span>•</span>
            <a href="#" className="hover:text-white transition-colors">Marketplace Terms</a>
          </div>

          <div className="flex items-center gap-3 text-slate-400">
            <a href="#" className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center hover:text-white hover:border-slate-700 transition-colors">
              <Twitter className="w-4 h-4" />
            </a>
            <a href="#" className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center hover:text-white hover:border-slate-700 transition-colors">
              <Instagram className="w-4 h-4" />
            </a>
            <a href="#" className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center hover:text-white hover:border-slate-700 transition-colors">
              <Youtube className="w-4 h-4" />
            </a>
            <a href="#" className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center hover:text-white hover:border-slate-700 transition-colors">
              <Linkedin className="w-4 h-4" />
            </a>
          </div>

        </div>

      </div>
    </footer>
  );
};
