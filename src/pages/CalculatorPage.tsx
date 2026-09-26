import React from 'react';
import { FeeCalculator } from '../components/FeeCalculator';
import type { PropFirm, AccountPlan } from '../types';

interface CalculatorPageProps {
  firms: PropFirm[];
  initialFirm: PropFirm | null;
  initialPlan: AccountPlan | null;
  currency: 'USD' | 'EUR' | 'GBP';
}

export const CalculatorPage: React.FC<CalculatorPageProps> = (props) => (
  <main className="flex-1 pb-16">
    <FeeCalculator {...props} />
  </main>
);
