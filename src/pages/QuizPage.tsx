import React from 'react';
import { FirmMatchQuiz } from '../components/FirmMatchQuiz';
import type { PropFirm, AccountPlan } from '../types';

interface QuizPageProps {
  firms: PropFirm[];
  onSelectFirm: (firm: PropFirm, plan: AccountPlan) => void;
  currency: 'USD' | 'EUR' | 'GBP';
}

export const QuizPage: React.FC<QuizPageProps> = (props) => (
  <main className="flex-1 pb-16">
    <FirmMatchQuiz {...props} />
  </main>
);