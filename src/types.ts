export type MarketType = 'Forex' | 'Futures' | 'Crypto' | 'Indices' | 'Metals';

export type ChallengeType = '1-Step' | '2-Step' | '3-Step' | 'Instant Funding';

export type DrawdownType = 'Balance-Based (Static)' | 'Equity-Based' | 'Trailing' | 'End of Day (EOD)';

export type TradingPlatform = 
  | 'cTrader' 
  | 'Match-Trader' 
  | 'DXtrade' 
  | 'TradeLocker' 
  | 'NinjaTrader' 
  | 'Tradovate' 
  | 'TradingView' 
  | 'MetaTrader 4' 
  | 'MetaTrader 5';

export interface AccountPlan {
  id: string;
  size: number; // e.g. 10000, 25000, 50000, 100000, 200000
  label: string; // "$100K"
  originalPrice: number;
  discountedPrice: number;
  promoCode?: string;
  step1TargetPercent: number; // e.g. 8 for 8% (0 for instant)
  step2TargetPercent?: number; // e.g. 5 for 5%
  step3TargetPercent?: number;
  maxDrawdownPercent: number; // e.g. 10 for 10%
  dailyDrawdownPercent: number; // e.g. 5 for 5%
  maxDrawdownAmount: number;
  dailyDrawdownAmount: number;
  minTradingDays: number; // e.g. 0 or 3
  profitSplit: number; // e.g. 85 for 85%
  leverage: string; // e.g. "1:100"
  refundable: boolean;
  firstPayoutDays: number; // e.g. 14, 7, 0 (on demand)
  subsequentPayoutDays: number; // e.g. 14, 7
}

export interface FirmRules {
  weekendHolding: boolean;
  newsTrading: boolean;
  eaAlgoTrading: boolean;
  copyTrading: boolean;
  hedgingAllowed: boolean;
  martingaleAllowed: boolean;
  overnightHolding: boolean;
  drawdownCalculation: 'Balance' | 'Equity' | 'Relative Trailing' | 'Higher Balance Peak';
  consistencyRule: boolean;
  consistencyRuleDetails?: string;
  inactivityLimitDays: number;
  prohibitedStrategies: string[];
  scalingPlan: {
    available: boolean;
    scalingTargetPercent: number;
    accountGrowthPercent: number;
    maxCapital: string;
  };
}

export interface FirmReview {
  id: string;
  author: string;
  avatar?: string;
  country: string;
  rating: number; // 1-5
  date: string;
  accountType: string;
  payoutReceived: boolean;
  payoutAmount?: number;
  title: string;
  comment: string;
  pros: string[];
  cons: string[];
}

export interface PropFirm {
  id: string;
  name: string;
  slug: string;
  logo: string;
  accentColor: string;
  website: string;
  establishedYear: number;
  headquarters: string;
  brokerOrLiquidity: string;
  trustpilotScore: number;
  trustpilotReviewsCount: number;
  matchScore?: number; // Calculated dynamic match score
  verifiedPayoutsCount: number;
  totalPayoutsTracked: string; // e.g. "$18.4M+"
  featuredBadge?: string; // e.g. "Top Rated", "Editor's Choice", "Best Futures", "Fastest Payouts"
  rankPosition?: number;
  popularityLikes?: number;
  hasGoldBadge?: boolean;
  countryFlag?: string;
  yearsInOperation?: number;
  assetTags?: string[];
  maxAllocation?: string;
  usTradersAccepted: boolean;
  supportedMarkets: MarketType[];
  availableTypes: ChallengeType[];
  availablePlatforms: TradingPlatform[];
  drawdownType: DrawdownType;
  baseProfitSplit: number; // e.g. 80
  maxProfitSplit: number; // e.g. 95
  plans: AccountPlan[];
  rules: FirmRules;
  payoutMethods: string[];
  exclusiveDiscount?: {
    code: string;
    discountPercent: number;
    perkDescription: string;
    validUntil: string;
  };
  reviews: FirmReview[];
}

export interface FilterState {
  search: string;
  market: string; // 'All' | MarketType
  challengeType: string; // 'All' | ChallengeType
  accountSize: number | 'All'; // e.g. 100000 or 'All'
  platforms: TradingPlatform[];
  drawdownType: string; // 'All' | DrawdownType
  minProfitSplit: number;
  maxPrice: number;
  weekendHolding: boolean | null;
  newsTrading: boolean | null;
  eaAllowed: boolean | null;
  copyTrading: boolean | null;
  noMinDays: boolean | null;
  usAccepted: boolean | null;
  instantFundingOnly: boolean;
  sortBy: 'featured' | 'trustScore' | 'priceLow' | 'priceHigh' | 'maxDrawdown' | 'profitSplit' | 'payoutSpeed';
}

export interface CouponItem {
  id: string;
  firmId: string;
  firmName: string;
  firmLogo: string;
  code: string;
  discountPercent: number;
  perks: string;
  expiryDate: string;
  verified: boolean;
  usageCount: number;
}

export interface PayoutProof {
  id: string;
  firmId: string;
  firmName: string;
  traderName: string;
  traderCountry: string;
  amount: number;
  date: string;
  method: 'Crypto (USDT)' | 'Rise' | 'Wise' | 'Direct Bank Transfer' | 'Deel';
  verified: boolean;
  proofType: 'Certificate' | 'Transaction Hash' | 'Bank Receipt';
  accountSize: string;
}

export interface QuizAnswers {
  market: 'Forex/CFD' | 'Futures' | 'Crypto' | 'Any';
  challengeStyle: '1-Step' | '2-Step' | 'Instant' | 'Flexible';
  holdWeekend: boolean;
  tradeNews: boolean;
  useAlgo: boolean;
  accountSizeTarget: number;
  budget: number;
  priority: 'High Leverage' | 'Cheapest Price' | 'Highest Drawdown' | 'Fastest Payouts' | 'Reputation & Longevity';
}

export type AlertType = 'any_change' | 'price_drop' | 'discount_increase';
export type AlertChannel = 'email' | 'in_app' | 'both';

export interface PriceAlert {
  id: string;
  userId: string;
  userEmail: string;
  firmId: string;
  firmName: string;
  firmLogo?: string;
  planId: string;
  planName: string;
  planSize: number;
  currentPrice: number;
  targetPrice?: number;
  alertType: AlertType;
  channel: AlertChannel;
  notifyOnDiscount: boolean;
  active: boolean;
  createdAt: string;
  lastNotifiedAt?: string;
}

export type AffiliateTier = 'Bronze' | 'Silver' | 'Gold' | 'Diamond';
export type PayoutMethod = 'Crypto (USDT)' | 'Rise' | 'Wise' | 'Direct Bank Transfer' | 'Deel' | 'PayPal';

export interface AffiliateProfile {
  userId: string;
  userEmail: string;
  displayName: string;
  referralCode: string;
  customSlug: string;
  tier: AffiliateTier;
  commissionRate: number; // e.g. 15 for 15%
  totalClicks: number;
  totalSignups: number;
  totalConversions: number;
  conversionRate: number; // e.g. 2.8%
  availableEarnings: number; // in USD
  pendingEarnings: number; // in USD
  lifetimeEarnings: number; // in USD
  payoutMethod: PayoutMethod;
  payoutAddress: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReferralActivityItem {
  id: string;
  affiliateUserId: string;
  type: 'click' | 'signup' | 'conversion';
  firmId?: string;
  firmName?: string;
  planName?: string;
  orderAmount?: number;
  commissionAmount?: number;
  status: 'completed' | 'pending' | 'cleared';
  traderMask: string;
  timestamp: string;
  ipCountry?: string;
}

export interface AffiliatePayout {
  id: string;
  affiliateUserId: string;
  amount: number;
  method: PayoutMethod;
  destination: string;
  status: 'Completed' | 'Processing' | 'Pending';
  requestedAt: string;
  txHash?: string;
}

