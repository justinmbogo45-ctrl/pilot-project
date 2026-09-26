import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import config from '../../firebase-applet-config.json';

// Firebase is used only for authentication. Persistence goes through our PostgreSQL API.
export const app = getApps().length ? getApp() : initializeApp(config);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });
export async function loginWithGoogle() { return (await signInWithPopup(auth, googleProvider)).user; }
export async function logoutUser() { await signOut(auth); }
export const logoutFirebase = logoutUser;
