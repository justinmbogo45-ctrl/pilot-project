import React from 'react';
import { PayoutProofsModal } from '../components/PayoutProofsModal';

interface PayoutsPageProps {
  currency: 'USD' | 'EUR' | 'GBP';
}

export const PayoutsPage: React.FC<PayoutsPageProps> = ({ currency }) => (
  <main className="flex-1 pb-16">
    <PayoutProofsModal currency={currency} />
  </main>
);