import { createContext, useContext, useState, useEffect, type ReactNode, type Dispatch, type SetStateAction } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, syncUserProfile, type UserProfileData } from '../lib/api';

interface AuthContextValue {
  userProfile: UserProfileData | null;
  setUserProfile: Dispatch<SetStateAction<UserProfileData | null>>;
  rewardPoints: (points: number) => void;
}

const AuthContext = createContext<AuthContextValue>(null!);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);

  useEffect(() => {
    return onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          setUserProfile(await syncUserProfile(user));
        } catch {
          console.error('Profile sync failed');
        }
      } else {
        setUserProfile(null);
      }
    });
  }, []);

  const rewardPoints = (points: number) => {
    setUserProfile(prev => prev ? { ...prev, loyaltyPoints: prev.loyaltyPoints + points } : null);
  };

  return (
    <AuthContext.Provider value={{ userProfile, setUserProfile, rewardPoints }}>
      {children}
    </AuthContext.Provider>
  );
}