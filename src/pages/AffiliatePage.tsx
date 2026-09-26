import React from 'react';
import { AffiliatePortal } from '../components/AffiliatePortal';
import type { PropFirm, AccountPlan } from '../types';
import type { UserProfileData } from '../lib/api';

interface AffiliatePageProps {
  firms: PropFirm[];
  userProfile: UserProfileData | null;
  onOpenAuth: () => void;
  onSelectFirmDetails: (firm: PropFirm, plan: AccountPlan) => void;
}

export const AffiliatePage: React.FC<AffiliatePageProps> = (props) => (
  <main className="flex-1 pb-16">
    <AffiliatePortal {...props} />
  </main>
);