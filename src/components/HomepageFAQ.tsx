import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    question: 'What are futures prop firms?',
    answer:
      'Futures prop firms are proprietary trading companies that provide traders with capital to trade standardized futures contracts (such as E-mini S&P 500, Nasdaq 100, Crude Oil, and Gold) traded on regulated exchanges like the CME, CBOT, and NYMEX. Unlike traditional brokers where you risk your personal savings, futures prop firms evaluate your skills in a simulated environment and fund qualifying traders, sharing up to 90% to 100% of generated profits with minimal risk to your personal funds.',
  },
  {
    question: 'How do futures prop firms work?',
    answer:
      'The process typically involves three straightforward stages: 1) Purchase an Evaluation/Combine (e.g. $50,000 or $100,000 account plan). 2) Reach the profit target (usually 6%) while respecting risk rules like maximum daily loss limit and trailing or end-of-day drawdown limits. 3) Upon successfully completing the combine, you transition to a Funded/Live-sim account where you can request profit withdrawals directly to your bank account or crypto wallet.',
  },
  {
    question: 'What is the difference between static and trailing drawdown?',
    answer:
      'A static drawdown remains permanently fixed at your initial balance minus the maximum drawdown amount, regardless of how much profit you accumulate. A trailing drawdown adjusts upwards in real-time or at the End of Day (EOD) as your balance reaches new peaks, locking in previous gains and giving you a dynamic loss buffer.',
  },
  {
    question: 'Are US citizens allowed to trade futures prop firms?',
    answer:
      'Yes! Unlike CFD and Forex prop firms which face strict regulatory bans in the United States, futures prop firms (such as Lucid Trading, Tradeify, Topstep, Apex Trader Funding, and TradeDay) operate on regulated US exchanges like the CME Group. US citizens are completely welcomed and accepted with full tax reporting compliance.',
  },
  {
    question: 'How fast do futures prop firms pay out profits?',
    answer:
      'Top futures prop firms pay out rapidly. Industry leaders like TradeDay offer same-day ACH withdrawals upon request. Lucid Trading and Tradeify process payouts within 24 to 48 hours via Rise and direct bank transfer. Many firms have payout cycles as frequent as every 5 to 7 days once funded.',
  },
  {
    question: 'Can I use automated trading software or EAs with futures prop firms?',
    answer:
      'Yes, leading futures platforms like NinjaTrader, Tradovate, and TradingView allow the use of automated strategies, algorithmic bots, and custom indicators, provided they do not exploit latency arbitrage or violate CME exchange trading policies.',
  },
];

export const HomepageFAQ: React.FC = () => {
  const [openIndexes, setOpenIndexes] = useState<number[]>([0, 1]);

  const toggleAccordion = (index: number) => {
    setOpenIndexes((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <section className="mx-auto max-w-[800px] px-4 sm:px-6 lg:px-8 mt-20 pb-12">
      <h2 className="text-2xl sm:text-3xl font-bold text-[#f1f3f2] text-center mb-10 tracking-tight">
        Frequently Asked Questions
      </h2>

      <div className="space-y-3">
        {FAQ_ITEMS.map((item, index) => {
          const isOpen = openIndexes.includes(index);
          return (
            <div
              key={index}
              className="rounded-xl border border-[#2b2e2c] bg-[#1d1f1e] overflow-hidden transition-colors duration-200"
            >
              <button
                onClick={() => toggleAccordion(index)}
                className="w-full text-left py-4 px-5 flex items-center justify-between gap-4 font-medium text-[#f1f3f2] hover:text-[#3ecf8e] transition-colors duration-150 cursor-pointer"
              >
                <span className="text-sm sm:text-base">{item.question}</span>
                <ChevronDown
                  className={`h-5 w-5 text-[#747976] transition-transform duration-200 flex-shrink-0 ${
                    isOpen ? 'rotate-180 text-[#3ecf8e]' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-sm leading-relaxed text-[#9a9e9b] border-t border-[#2b2e2c]">
                  {item.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
