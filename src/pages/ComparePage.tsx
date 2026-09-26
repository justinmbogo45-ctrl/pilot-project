import React from 'react';
import { ComparisonMatrixModal } from '../components/ComparisonMatrixModal';
import type { PropFirm, AccountPlan } from '../types';

interface ComparePageProps {
  items: { firm: PropFirm; plan: AccountPlan }[];
  onRemoveItem: (firmId: string) => void;
  onClearAll: () => void;
  onChangePlan: (firmId: string, plan: AccountPlan) => void;
  onClose: () => void;
  currency: 'USD' | 'EUR' | 'GBP';
}

export const ComparePage: React.FC<ComparePageProps> = (props) => (
  <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    <ComparisonMatrixModal {...props} />
  </main>
);