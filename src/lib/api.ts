import type { User } from 'firebase/auth';
import { auth } from './firebase';
import type { PriceAlert, AffiliateProfile, ReferralActivityItem, AffiliatePayout } from '../types';
export { auth, loginWithGoogle, logoutUser, logoutFirebase } from './firebase';

export interface UserProfileData {
  uid: string; displayName: string; email: string; photoURL?: string;
  loyaltyPoints: number; favoriteFirmIds: string[]; claimedGiveaways: string[];
  createdAt: string; lastLoginAt: string; lastDailyClaimDate?: string;
}

export async function apiRequest<T>(path: string, method = 'GET', body?: unknown): Promise<T> {
  const user = auth.currentUser;
  if (path.startsWith('/me') && !user) throw new Error('Sign in to save your changes');
  const token = user ? await user.getIdToken() : null;
  const response = await fetch(`/api${path}`, { method, headers: { 'Content-Type':'application/json', ...(token ? {Authorization:`Bearer ${token}`} : {}) }, body: body===undefined?undefined:JSON.stringify(body) });
  if (!response.ok) {
    const error=await response.json().catch(()=>({error:'Request failed'}));
    throw new Error(error.error || 'Request failed');
  }
  return response.json();
}
export const syncUserProfile = (_user:User) => apiRequest<UserProfileData>('/me/profile','POST');
export const updateUserFavorites = (_uid:string,favoriteFirmIds:string[]) => apiRequest('/me/favorites','PUT',{favoriteFirmIds});
export async function addReview(userId:string,firmId:string,review:any) {
  return (await apiRequest<{id:string}>('/me/reviews','POST',{...review,firmId})).id;
}
export async function enterGiveaway(_uid:string,_email:string,giveawayId:string) { return (await apiRequest<{success:boolean}>('/me/giveaways','POST',{giveawayId})).success; }
export const claimDailyBonus = (_uid:string) => apiRequest<{success:boolean;pointsAdded:number;newTotal:number}>('/me/daily-bonus','POST');
export async function createPriceAlert(alert:Omit<PriceAlert,'id'|'createdAt'>) { return (await apiRequest<{id:string}>('/me/price-alerts','POST',alert)).id; }
export const updatePriceAlert = (id:string,updates:Partial<PriceAlert>) => apiRequest(`/me/price-alerts/${encodeURIComponent(id)}`,'PATCH',updates);
export const deletePriceAlert = (id:string) => apiRequest(`/me/price-alerts/${encodeURIComponent(id)}`,'DELETE');
export const getUserPriceAlerts = (_uid:string) => apiRequest<PriceAlert[]>('/me/price-alerts');

// Poll only while mounted and never deliver a previous user's response after sign-out.
function subscribe<T>(path:string,uid:string,onUpdate:(value:T)=>void,onError?:(error:unknown)=>void) {
  let stopped=false;
  let timer:ReturnType<typeof setTimeout>;
  const refresh=async()=>{
    if(stopped || auth.currentUser?.uid!==uid)return;
    try { const value=await apiRequest<T>(path);if(!stopped && auth.currentUser?.uid===uid)onUpdate(value); }
    catch(error) { if(!stopped)onError?.(error); }
    if(!stopped)timer=setTimeout(refresh,15000);
  };
  void refresh();
  return ()=>{stopped=true;clearTimeout(timer);};
}
export const subscribeUserPriceAlerts = (uid:string,onUpdate:(v:PriceAlert[])=>void,onError?:(e:unknown)=>void) => subscribe('/me/price-alerts',uid,onUpdate,onError);
export const getOrCreateAffiliateProfile = (_uid:string,_email:string,_displayName:string) => apiRequest<AffiliateProfile>('/me/affiliate','POST');
export const updateAffiliateProfile = (_uid:string,updates:Partial<AffiliateProfile>) => apiRequest<AffiliateProfile>('/me/affiliate','PATCH',updates);
export const subscribeAffiliateProfile = (uid:string,onUpdate:(v:AffiliateProfile)=>void,onError?:(e:unknown)=>void) => subscribe('/me/affiliate',uid,onUpdate,onError);
export const subscribeAffiliateActivities = (uid:string,onUpdate:(v:ReferralActivityItem[])=>void,onError?:(e:unknown)=>void) => subscribe('/me/affiliate/activities',uid,onUpdate,onError);
export const subscribeAffiliatePayouts = (uid:string,onUpdate:(v:AffiliatePayout[])=>void,onError?:(e:unknown)=>void) => subscribe('/me/affiliate/payouts',uid,onUpdate,onError);
export async function recordAffiliateActivity(activity:Omit<ReferralActivityItem,'id'>) { return (await apiRequest<{id:string}>('/me/affiliate/activities','POST',activity)).id; }
export async function requestAffiliatePayout(payout:Omit<AffiliatePayout,'id'>) { return (await apiRequest<{id:string}>('/me/affiliate/payouts','POST',payout)).id; }
