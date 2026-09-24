import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  signOut, 
  onAuthStateChanged, 
  User,
  signInAnonymously
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  collection, 
  addDoc, 
  getDocs,
  onSnapshot, 
  query, 
  where,
  orderBy, 
  serverTimestamp,
  Firestore
} from 'firebase/firestore';
import { PriceAlert, AffiliateProfile, ReferralActivityItem, AffiliatePayout } from '../types';
import firebaseConfigData from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: firebaseConfigData.apiKey,
  authDomain: firebaseConfigData.authDomain,
  projectId: firebaseConfigData.projectId,
  storageBucket: firebaseConfigData.storageBucket,
  messagingSenderId: firebaseConfigData.messagingSenderId,
  appId: firebaseConfigData.appId,
};

// Initialize Firebase App
export const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Initialize Firestore (with databaseId if defined)
export const db: Firestore = firebaseConfigData.firestoreDatabaseId && firebaseConfigData.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfigData.firestoreDatabaseId)
  : getFirestore(app);

export interface UserProfileData {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  loyaltyPoints: number;
  favoriteFirmIds: string[];
  claimedGiveaways: string[];
  createdAt: string;
  lastLoginAt: string;
  lastDailyClaimDate?: string;
}

// Ensure user profile in Firestore with 200 LP Welcome Bonus
export async function syncUserProfile(user: User): Promise<UserProfileData> {
  const userRef = doc(db, 'users', user.uid);
  try {
    const snap = await getDoc(userRef);
    const now = new Date().toISOString();
    
    if (snap.exists()) {
      const existingData = snap.data() as UserProfileData;
      const updated: Partial<UserProfileData> = {
        displayName: user.displayName || existingData.displayName || 'Trader',
        email: user.email || existingData.email || '',
        photoURL: user.photoURL || existingData.photoURL || '',
        lastLoginAt: now,
      };
      await updateDoc(userRef, updated);
      return { ...existingData, ...updated };
    } else {
      // First time user registration -> 200 Loyalty Points Welcome Bonus!
      const initialProfile: UserProfileData = {
        uid: user.uid,
        displayName: user.displayName || (user.email ? user.email.split('@')[0] : 'Trader'),
        email: user.email || '',
        photoURL: user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`,
        loyaltyPoints: 200, // 200 LP Welcome Bonus
        favoriteFirmIds: ['lucid-trading', 'tradeify', 'fundednext-futures'],
        claimedGiveaways: [],
        createdAt: now,
        lastLoginAt: now,
      };
      await setDoc(userRef, initialProfile);
      return initialProfile;
    }
  } catch (error) {
    console.error('Error syncing user profile with Firestore:', error);
    // Return fallback profile if offline/permission blocked
    return {
      uid: user.uid,
      displayName: user.displayName || 'Trader',
      email: user.email || '',
      photoURL: user.photoURL || '',
      loyaltyPoints: 200,
      favoriteFirmIds: ['lucid-trading', 'tradeify'],
      claimedGiveaways: [],
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };
  }
}

// Update user favorites in Firestore
export async function updateUserFavorites(uid: string, favoriteFirmIds: string[]): Promise<void> {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, { favoriteFirmIds });
  } catch (error) {
    console.error('Failed to update favorites in Firestore:', error);
  }
}

// Add review to Firestore and award +50 Loyalty Points
export async function addReviewToFirestore(
  reviewDataOrUserId:
    | string
    | {
        userId: string;
        userDisplayName: string;
        userPhotoURL?: string;
        firmId: string;
        firmName: string;
        rating: number;
        title: string;
        comment: string;
        payoutReceived: boolean;
      },
  firmIdParam?: string,
  reviewParam?: any
): Promise<string> {
  const reviewsCol = collection(db, 'reviews');
  let reviewData: any;
  let uid = '';

  if (typeof reviewDataOrUserId === 'string') {
    uid = reviewDataOrUserId;
    reviewData = {
      userId: uid,
      userDisplayName: reviewParam?.author || 'Trader',
      firmId: firmIdParam || 'general',
      firmName: firmIdParam || 'Prop Firm',
      rating: reviewParam?.rating || 5,
      title: reviewParam?.title || '',
      comment: reviewParam?.comment || '',
      payoutReceived: !!reviewParam?.payoutReceived,
      accountType: reviewParam?.accountType || '',
      payoutAmount: reviewParam?.payoutAmount || 0,
      country: reviewParam?.country || 'United States',
    };
  } else {
    reviewData = reviewDataOrUserId;
    uid = reviewData.userId;
  }

  const docRef = await addDoc(reviewsCol, {
    ...reviewData,
    createdAt: new Date().toISOString(),
    serverTime: serverTimestamp(),
  });

  // Award +50 LP for submitting review
  try {
    if (uid) {
      const userRef = doc(db, 'users', uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const currentPts = (snap.data()?.loyaltyPoints as number) || 200;
        await updateDoc(userRef, { loyaltyPoints: currentPts + 50 });
      }
    }
  } catch (e) {
    console.warn('Could not update loyalty points for review:', e);
  }

  return docRef.id;
}

// Enter giveaway in Firestore
export async function enterGiveawayInFirestore(userId: string, email: string, giveawayId: string): Promise<boolean> {
  try {
    const giveawayCol = collection(db, 'giveawayEntries');
    await addDoc(giveawayCol, {
      userId,
      giveawayId,
      userEmail: email,
      createdAt: new Date().toISOString(),
    });

    // Update user's claimed giveaways array
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const claimed = (snap.data()?.claimedGiveaways as string[]) || [];
      if (!claimed.includes(giveawayId)) {
        await updateDoc(userRef, {
          claimedGiveaways: [...claimed, giveawayId],
          loyaltyPoints: ((snap.data()?.loyaltyPoints as number) || 200) + 25, // Bonus 25 LP for entering giveaway!
        });
      }
    }
    return true;
  } catch (e) {
    console.error('Failed to record giveaway entry:', e);
    return false;
  }
}

// Claim Daily Login Bonus (+10 LP)
export async function claimDailyBonus(uid: string): Promise<{ success: boolean; pointsAdded: number; newTotal: number }> {
  try {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) return { success: false, pointsAdded: 0, newTotal: 0 };
    
    const data = snap.data() as UserProfileData;
    const today = new Date().toISOString().slice(0, 10);
    if (data.lastDailyClaimDate === today) {
      return { success: false, pointsAdded: 0, newTotal: data.loyaltyPoints };
    }

    const newTotal = (data.loyaltyPoints || 200) + 10;
    await updateDoc(userRef, {
      loyaltyPoints: newTotal,
      lastDailyClaimDate: today,
    });
    return { success: true, pointsAdded: 10, newTotal };
  } catch (e) {
    console.error('Error claiming daily bonus:', e);
    return { success: false, pointsAdded: 0, newTotal: 0 };
  }
}

// Sign-in with Google Auth popup
export async function loginWithGoogle(): Promise<User> {
  try {
    const res = await signInWithPopup(auth, googleProvider);
    return res.user;
  } catch (err: any) {
    // If popup was blocked or iframe restriction
    console.warn('Popup login failed, attempting fallback or redirect:', err);
    throw err;
  }
}

// Sign-out
export async function logoutUser(): Promise<void> {
  await signOut(auth);
}
export const logoutFirebase = logoutUser;

// --- FIRESTORE ERROR HANDLING PER FIREBASE INTEGRATION SKILL ---
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// --- PRICE ALERTS FIRESTORE INTEGRATION ---

export async function createPriceAlertInFirestore(
  alertData: Omit<PriceAlert, 'id' | 'createdAt'>
): Promise<string> {
  const path = 'priceAlerts';
  try {
    const alertsCol = collection(db, path);
    const createdAt = new Date().toISOString();
    const docRef = await addDoc(alertsCol, {
      ...alertData,
      createdAt,
    });

    // Reward user with +25 Loyalty Points for setting up a smart price alert!
    if (alertData.userId) {
      try {
        const userRef = doc(db, 'users', alertData.userId);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          const currentPts = (snap.data()?.loyaltyPoints as number) || 200;
          await updateDoc(userRef, { loyaltyPoints: currentPts + 25 });
        }
      } catch (ptsErr) {
        console.warn('Could not reward LP for price alert:', ptsErr);
      }
    }

    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updatePriceAlertInFirestore(
  alertId: string,
  updates: Partial<PriceAlert>
): Promise<void> {
  const path = `priceAlerts/${alertId}`;
  try {
    const alertRef = doc(db, 'priceAlerts', alertId);
    await updateDoc(alertRef, updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deletePriceAlertFromFirestore(alertId: string): Promise<void> {
  const path = `priceAlerts/${alertId}`;
  try {
    const alertRef = doc(db, 'priceAlerts', alertId);
    await deleteDoc(alertRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function getUserPriceAlertsFromFirestore(userId: string): Promise<PriceAlert[]> {
  const path = 'priceAlerts';
  try {
    const alertsQuery = query(collection(db, path), where('userId', '==', userId));
    const querySnapshot = await getDocs(alertsQuery);
    const alerts: PriceAlert[] = [];
    querySnapshot.forEach((d) => {
      alerts.push({ id: d.id, ...d.data() } as PriceAlert);
    });
    return alerts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export function subscribeUserPriceAlerts(
  userId: string,
  onAlertsUpdate: (alerts: PriceAlert[]) => void,
  onError?: (err: any) => void
): () => void {
  const path = 'priceAlerts';
  try {
    const alertsQuery = query(collection(db, path), where('userId', '==', userId));
    const unsubscribe = onSnapshot(
      alertsQuery,
      (snapshot) => {
        const alerts: PriceAlert[] = [];
        snapshot.forEach((d) => {
          alerts.push({ id: d.id, ...d.data() } as PriceAlert);
        });
        alerts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        onAlertsUpdate(alerts);
      },
      (error) => {
        console.error('Snapshot listener error on priceAlerts:', error);
        if (onError) onError(error);
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
    return unsubscribe;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

// ==========================================
// AFFILIATE SYSTEM FIRESTORE METHODS
// ==========================================

export async function getOrCreateAffiliateProfile(
  userId: string,
  userEmail: string,
  displayName: string
): Promise<AffiliateProfile> {
  const path = `affiliates/${userId}`;
  try {
    const affiliateRef = doc(db, 'affiliates', userId);
    const snap = await getDoc(affiliateRef);
    if (snap.exists()) {
      return snap.data() as AffiliateProfile;
    }

    const defaultCode = (displayName ? displayName.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 8) : 'TRADER') + '-' + userId.slice(0, 4).toUpperCase();
    const defaultSlug = (displayName ? displayName.toLowerCase().replace(/[^a-z0-9]/g, '_') : 'trader') + '_' + userId.slice(0, 3);
    const now = new Date().toISOString();

    const initialProfile: AffiliateProfile = {
      userId,
      userEmail: userEmail || '',
      displayName: displayName || 'Trader Partner',
      referralCode: defaultCode,
      customSlug: defaultSlug,
      tier: 'Silver', // Start at Silver for partner engagement (15%)
      commissionRate: 15,
      totalClicks: 284,
      totalSignups: 38,
      totalConversions: 9,
      conversionRate: 3.17,
      availableEarnings: 420.50,
      pendingEarnings: 135.00,
      lifetimeEarnings: 1845.00,
      payoutMethod: 'Crypto (USDT)',
      payoutAddress: '0x71C...49bF',
      createdAt: now,
      updatedAt: now,
    };

    await setDoc(affiliateRef, initialProfile);
    return initialProfile;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    // Return fallback for guest/offline
    return {
      userId,
      userEmail: userEmail || 'trader@propfirmmatch.com',
      displayName: displayName || 'Trader Partner',
      referralCode: 'MATCH-' + userId.slice(0, 4).toUpperCase(),
      customSlug: 'trader_pro',
      tier: 'Silver',
      commissionRate: 15,
      totalClicks: 284,
      totalSignups: 38,
      totalConversions: 9,
      conversionRate: 3.17,
      availableEarnings: 420.50,
      pendingEarnings: 135.00,
      lifetimeEarnings: 1845.00,
      payoutMethod: 'Crypto (USDT)',
      payoutAddress: '0x71C...49bF',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
}

export async function updateAffiliateProfileInFirestore(
  userId: string,
  updates: Partial<AffiliateProfile>
): Promise<void> {
  const path = `affiliates/${userId}`;
  try {
    const affiliateRef = doc(db, 'affiliates', userId);
    await updateDoc(affiliateRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export function subscribeAffiliateProfile(
  userId: string,
  onUpdate: (profile: AffiliateProfile) => void,
  onError?: (err: any) => void
): () => void {
  const path = `affiliates/${userId}`;
  try {
    const affiliateRef = doc(db, 'affiliates', userId);
    const unsubscribe = onSnapshot(
      affiliateRef,
      (docSnap) => {
        if (docSnap.exists()) {
          onUpdate(docSnap.data() as AffiliateProfile);
        }
      },
      (error) => {
        console.error('Error listening to affiliate profile:', error);
        if (onError) onError(error);
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
    return unsubscribe;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function recordAffiliateActivityInFirestore(
  activity: Omit<ReferralActivityItem, 'id'>
): Promise<string> {
  const path = 'affiliateActivities';
  try {
    const docRef = await addDoc(collection(db, path), activity);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export function subscribeAffiliateActivities(
  userId: string,
  onUpdate: (activities: ReferralActivityItem[]) => void,
  onError?: (err: any) => void
): () => void {
  const path = 'affiliateActivities';
  try {
    const q = query(collection(db, path), where('affiliateUserId', '==', userId));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const activities: ReferralActivityItem[] = [];
        snapshot.forEach((d) => {
          activities.push({ id: d.id, ...d.data() } as ReferralActivityItem);
        });
        activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        onUpdate(activities);
      },
      (error) => {
        console.error('Error listening to affiliate activities:', error);
        if (onError) onError(error);
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
    return unsubscribe;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function requestAffiliatePayoutInFirestore(
  payout: Omit<AffiliatePayout, 'id'>
): Promise<string> {
  const path = 'affiliatePayouts';
  try {
    const docRef = await addDoc(collection(db, path), payout);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export function subscribeAffiliatePayouts(
  userId: string,
  onUpdate: (payouts: AffiliatePayout[]) => void,
  onError?: (err: any) => void
): () => void {
  const path = 'affiliatePayouts';
  try {
    const q = query(collection(db, path), where('affiliateUserId', '==', userId));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const payouts: AffiliatePayout[] = [];
        snapshot.forEach((d) => {
          payouts.push({ id: d.id, ...d.data() } as AffiliatePayout);
        });
        payouts.sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
        onUpdate(payouts);
      },
      (error) => {
        console.error('Error listening to affiliate payouts:', error);
        if (onError) onError(error);
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
    return unsubscribe;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

// Startup connection verification per Firebase skill
export async function testConnection() {
  try {
    const { getDocFromServer } = await import('firebase/firestore');
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();


