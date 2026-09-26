import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  RotateCcw, 
  Award, 
  ShieldCheck, 
  Star, 
  ExternalLink,
  Zap,
  TrendingUp
} from 'lucide-react';
import { PropFirm, AccountPlan } from '../types';
import { planPrice } from '../lib/catalog';

interface FirmMatchQuizProps {
  firms: PropFirm[];
  onSelectFirm: (firm: PropFirm, plan: AccountPlan) => void;
  currency: 'USD' | 'EUR' | 'GBP';
}

export const FirmMatchQuiz: React.FC<FirmMatchQuizProps> = ({
  firms,
  onSelectFirm,
  currency,
}) => {
  const [step, setStep] = useState(1);

  // Quiz State
  const [market, setMarket] = useState<'Forex' | 'Futures' | 'Crypto' | 'All'>('Forex');
  const [platform, setPlatform] = useState<string>('Any');
  const [weekendHolding, setWeekendHolding] = useState<boolean>(true);
  const [newsTrading, setNewsTrading] = useState<boolean>(true);
  const [algoTrading, setAlgoTrading] = useState<boolean>(false);
  const [challengeType, setChallengeType] = useState<'1-Step' | '2-Step' | 'Instant Funding' | 'Any'>('2-Step');
  const [preferredSize, setPreferredSize] = useState<number>(100000);
  const [priority, setPriority] = useState<'price' | 'split' | 'payout' | 'reputation'>('reputation');
  const [isUSResident, setIsUSResident] = useState<boolean>(false);

  const [quizFinished, setQuizFinished] = useState(false);

  // Match Scoring Algorithm
  const calculateMatches = () => {
    return firms.filter(f=>f.plans.length>0).map((firm) => {
      let score = 50; // base score
      const reasons: string[] = [];

      // Market match
      if (market === 'All' || firm.supportedMarkets.includes(market as any)) {
        score += 15;
        reasons.push(`Full support for ${market === 'All' ? 'diverse markets' : market}`);
      } else {
        score -= 40;
      }

      // US resident check
      if (isUSResident) {
        if (firm.usTradersAccepted) {
          score += 20;
          reasons.push('Fully accepts US residents');
        } else {
          score -= 50;
        }
      }

      // Platform check
      if (platform === 'Any' || firm.availablePlatforms.includes(platform as any)) {
        score += 10;
        if (platform !== 'Any') reasons.push(`Supports ${platform}`);
      }

      // Weekend holding
      if (weekendHolding) {
        if (firm.rules.weekendHolding) {
          score += 10;
          reasons.push('Allows swing trading across weekends');
        } else {
          score -= 15;
        }
      }

      // News trading
      if (newsTrading) {
        if (firm.rules.newsTrading) {
          score += 10;
          reasons.push('News trading allowed; check the rule notes');
        } else {
          score -= 10;
        }
      }

      // Algo / EA
      if (algoTrading) {
        if (firm.rules.eaAlgoTrading) {
          score += 10;
          reasons.push('Automated trading allowed; check the rule notes');
        } else {
          score -= 20;
        }
      }

      // Challenge type
      if (challengeType !== 'Any') {
        if (firm.availableTypes.includes(challengeType as any)) {
          score += 15;
          reasons.push(`Offers ${challengeType} evaluations`);
        } else {
          score -= 20;
        }
      }

      // Priority bonus
      if (priority === 'reputation') {
        if (firm.trustpilotScore != null && firm.trustpilotScore >= 4.7) {
          score += 15;
          reasons.push(`Top-tier ${firm.trustpilotScore} Trustpilot rating`);
        }
      } else if (priority === 'split') {
        if (firm.maxProfitSplit != null && firm.maxProfitSplit >= 90) {
          score += 15;
          reasons.push(`High profit split up to ${firm.maxProfitSplit}%`);
        }
      } else if (priority === 'payout') {
        const minPayout = Math.min(...firm.plans.map((p) => p.firstPayoutDays).filter((v):v is number=>v!=null));
        if (minPayout <= 7) {
          score += 15;
          reasons.push('Fast payout cycle (under 7 days)');
        }
      }

      // Cap between 40% and 99%
      const matchPercentage = Math.min(99, Math.max(40, score));

      // Pick matching plan
      const plan = firm.plans.find((p) => p.size === preferredSize) || firm.plans[0];

      return {
        firm,
        plan,
        matchPercentage,
        reasons: reasons.slice(0, 3),
      };
    }).sort((a, b) => b.matchPercentage - a.matchPercentage);
  };

  const results = calculateMatches();

  const restartQuiz = () => {
    setStep(1);
    setQuizFinished(false);
  };

  const currencySymbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '£';
  const currencyRate = currency === 'USD' ? 1 : currency === 'EUR' ? 0.92 : 0.79;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      
      {/* Quiz Header */}
      <div className="text-center space-y-3 mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          AI-Powered Firm Matcher
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Find Your Perfect Prop Firm in 60 Seconds
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto">
          Answer 4 quick questions about your trading strategy, risk appetite, and budget to find the challenge accounts built for your style.
        </p>

        {/* Step Indicator */}
        {!quizFinished && (
          <div className="flex items-center justify-center gap-2 pt-2">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all ${
                  step === s
                    ? 'w-10 bg-emerald-400'
                    : step > s
                    ? 'w-6 bg-emerald-600'
                    : 'w-6 bg-slate-800'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* QUESTION SCREENS */}
      {!quizFinished ? (
        <div className="bg-[#0e1626] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
          
          {/* STEP 1: MARKETS & RESIDENCY */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Step 1 of 4</span>
                <h3 className="text-lg font-bold text-white mt-1">What markets do you trade?</h3>
                <p className="text-xs text-slate-400">Select your primary asset class.</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: 'Forex', label: 'Forex & Currencies', desc: 'EUR/USD, GBP/USD' },
                  { id: 'Futures', label: 'CME Futures', desc: 'NQ, ES, Gold, Crude' },
                  { id: 'Crypto', label: 'Crypto Assets', desc: 'BTC, ETH 24/7' },
                  { id: 'All', label: 'Multi-Asset / Any', desc: 'Forex + Indices + Metals' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setMarket(item.id as any)}
                    className={`p-4 rounded-xl text-left border transition-all ${
                      market === item.id
                        ? 'bg-emerald-500/15 border-emerald-500/60 text-emerald-300 ring-1 ring-emerald-500/40'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold text-sm text-white">{item.label}</div>
                    <div className="text-[11px] text-slate-400 mt-1">{item.desc}</div>
                  </button>
                ))}
              </div>

              {/* US Resident Toggle */}
              <div className="pt-2">
                <label className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={isUSResident}
                    onChange={(e) => setIsUSResident(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-500 bg-slate-800 border-slate-700"
                  />
                  <div>
                    <span className="font-bold text-white block">I am a United States resident</span>
                    <span className="text-slate-400">
                      We will filter for CFTC-compliant prop firms (e.g. Topstep, Apex, TradeDay) that explicitly accept US citizens.
                    </span>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* STEP 2: TRADING STYLE & RULES */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Step 2 of 4</span>
                <h3 className="text-lg font-bold text-white mt-1">Trading Strategy & Rule Tolerances</h3>
                <p className="text-xs text-slate-400">Choose which rules you need freedom in.</p>
              </div>

              <div className="space-y-3">
                <label className="flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
                  <div>
                    <span className="font-bold text-white text-xs block">Weekend Holding</span>
                    <span className="text-[11px] text-slate-400">
                      Do you hold trades overnight across Friday market close?
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={weekendHolding}
                    onChange={(e) => setWeekendHolding(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-500 bg-slate-800 border-slate-700"
                  />
                </label>

                <label className="flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
                  <div>
                    <span className="font-bold text-white text-xs block">High-Impact News Trading</span>
                    <span className="text-[11px] text-slate-400">
                      Do you trade during NFP, CPI, and Fed interest rate announcements?
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={newsTrading}
                    onChange={(e) => setNewsTrading(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-500 bg-slate-800 border-slate-700"
                  />
                </label>

                <label className="flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
                  <div>
                    <span className="font-bold text-white text-xs block">Algorithmic EAs & Trade Copiers</span>
                    <span className="text-[11px] text-slate-400">
                      Do you use automated trading software or copy trades between accounts?
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={algoTrading}
                    onChange={(e) => setAlgoTrading(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-500 bg-slate-800 border-slate-700"
                  />
                </label>
              </div>
            </div>
          )}

          {/* STEP 3: EVALUATION MODEL */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Step 3 of 4</span>
                <h3 className="text-lg font-bold text-white mt-1">Evaluation & Funding Model</h3>
                <p className="text-xs text-slate-400">How quickly do you want to start receiving payouts?</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    id: '2-Step',
                    title: '2-Step Evaluation',
                    desc: 'Traditional 8-10% Phase 1 & 5% Phase 2 targets. Best leverage and highest profit splits.',
                  },
                  {
                    id: '1-Step',
                    title: '1-Step Fast Pass',
                    desc: 'Single 6-9% target. Pass once and immediately receive funded account credentials.',
                  },
                  {
                    id: 'Instant Funding',
                    title: 'Direct Instant Funding',
                    desc: 'Zero evaluation hurdles. Pay once and receive live profit split capital on Day 1.',
                  },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setChallengeType(item.id as any)}
                    className={`p-4 rounded-xl text-left border transition-all ${
                      challengeType === item.id
                        ? 'bg-emerald-500/15 border-emerald-500/60 text-emerald-300 ring-1 ring-emerald-500/40'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold text-sm text-white">{item.title}</div>
                    <div className="text-[11px] text-slate-400 mt-2 leading-relaxed">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: CAPITAL SIZE & PRIORITY */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Step 4 of 4</span>
                <h3 className="text-lg font-bold text-white mt-1">Account Size & Primary Goal</h3>
                <p className="text-xs text-slate-400">Select your capital target and primary decision factor.</p>
              </div>

              {/* Capital size buttons */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-300">Target Capital Size:</span>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {[10000, 25000, 50000, 100000, 200000].map((size) => (
                    <button
                      key={size}
                      onClick={() => setPreferredSize(size)}
                      className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                        preferredSize === size
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm'
                          : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      ${size / 1000}K
                    </button>
                  ))}
                </div>
              </div>

              {/* Priority */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-semibold text-slate-300">What matters most to you?</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'reputation', label: 'Highest Trust & Track Record' },
                    { id: 'price', label: 'Cheapest Challenge Fee' },
                    { id: 'split', label: 'Highest Profit Split (90%+)' },
                    { id: 'payout', label: 'Fastest Payout Turnaround' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setPriority(p.id as any)}
                      className={`p-3 rounded-xl text-left border text-xs font-semibold transition-all ${
                        priority === p.id
                          ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            {step > 1 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-white px-3 py-2 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="flex items-center gap-1.5 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-5 py-2.5 rounded-lg shadow-md shadow-emerald-500/20 transition-all"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setQuizFinished(true)}
                className="flex items-center gap-1.5 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-6 py-2.5 rounded-lg shadow-lg shadow-emerald-500/30 transition-all"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>Show Top Firm Matches</span>
              </button>
            )}
          </div>

        </div>
      ) : (
        /* QUIZ RESULTS VIEW */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              Your Top Recommended Prop Firms
            </h2>
            <button
              onClick={restartQuiz}
              className="flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-emerald-400 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retake Quiz</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {results.slice(0, 3).map((item, rank) => {
              const displayPrice = planPrice(item.plan);
              return (
                <div
                  key={item.firm.id}
                  className="bg-[#0e1626] border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-xl hover:border-slate-700 transition-all"
                >
                  {/* Match Score Badge */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
                    <div className="flex items-center gap-3">
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs ${
                        rank === 0 ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-300'
                      }`}>
                        #{rank + 1}
                      </span>
                      <img
                        src={item.firm.logo}
                        alt={item.firm.name}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                      />
                      <div>
                        <div className="flex items-center gap-1.5 font-extrabold text-white text-base">
                          <span>{item.firm.name}</span>
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-1">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>{item.firm.trustpilotScore}</span>
                          <span>•</span>
                          <span>{item.firm.headquarters}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-extrabold text-sm">
                        <Zap className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{item.matchPercentage}% Match</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        {item.plan.label} Account: <strong className="text-white">{displayPrice}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Why it matches */}
                  <div className="py-4 space-y-2">
                    <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
                      Why this fits your trading profile:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {item.reasons.map((r, i) => (
                        <span key={i} className="inline-flex items-center gap-1.5 text-xs bg-slate-900 border border-slate-800 text-slate-200 px-2.5 py-1 rounded-lg">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{r}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action row */}
                  <div className="pt-2 flex items-center justify-between">
                    <button
                      onClick={() => onSelectFirm(item.firm, item.plan)}
                      className="text-xs font-semibold text-slate-300 hover:text-white underline"
                    >
                      View Challenge Breakdown
                    </button>

                    <a
                      href={item.firm.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all"
                    >
                      <span>Claim Challenge with Code</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
