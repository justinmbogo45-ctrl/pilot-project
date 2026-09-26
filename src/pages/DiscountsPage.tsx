import React from 'react';
import { DiscountsHub } from '../components/DiscountsHub';
import type { PropFirm, AccountPlan } from '../types';

interface DiscountsPageProps {
  firms: PropFirm[];
  onSelectFirm: (firm: PropFirm, plan: AccountPlan) => void;
}

export const DiscountsPage: React.FC<DiscountsPageProps> = ({ firms, onSelectFirm }) => (
  <main className="flex-1 pb-16">
    <DiscountsHub firms={firms} onSelectFirm={onSelectFirm} />
  </main>
);