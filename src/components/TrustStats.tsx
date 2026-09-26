import React from 'react';
import type { PropFirm } from '../types';

export const TrustStats: React.FC<{ firms: PropFirm[] }> = ({ firms }) => {
  const challengeCount = firms.reduce((sum, firm) => sum + firm.plans.length, 0);
  const ratedCount = firms.filter(firm => firm.trustpilotScore != null).length;
  const offerCount = firms.reduce((sum, firm) => sum + (Array.isArray(firm.sourceData?.offers) ? firm.sourceData.offers.length : 0), 0);
  const stats = [
    { value: firms.length.toLocaleString(), label: 'Firms to explore' },
    { value: challengeCount.toLocaleString(), label: 'Challenges to compare' },
    { value: ratedCount.toLocaleString(), label: 'Rated firms' },
    { value: offerCount.toLocaleString(), label: 'Active deals' },
  ];
  return <section className="mx-auto max-w-[1240px] px-6 sm:px-8" aria-label="Catalog statistics">
    <div className="grid grid-cols-2 border-y border-[#2b2e2c] py-8 md:grid-cols-4 md:py-10">
      {stats.map((stat, index) => <div key={stat.label} className={`px-5 py-3 first:pl-0 md:py-1 ${index % 2 ? 'border-l border-[#2b2e2c]' : ''} ${index > 1 ? 'md:border-l md:border-[#2b2e2c]' : ''}`}>
        <div className="text-2xl font-medium tracking-tight text-[#f1f3f2] sm:text-3xl">{stat.value}</div>
        <div className="mt-1 text-sm text-[#747976]">{stat.label}</div>
      </div>)}
    </div>
  </section>;
};
