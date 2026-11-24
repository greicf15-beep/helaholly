import { useState, useEffect, useCallback } from 'react';
import { auth, db } from '../firebase';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { CustomerProfile, LoyaltyTierType, RewardItem } from '../types';
import { LOYALTY_TIERS } from '../loyaltyConstants';

const GUEST_STORAGE_KEY = 'hollywood_loyalty_profile';

function calculateTier(points: number): LoyaltyTierType {
  if (points >= 5000) return 'VIP';
  if (points >= 2500) return 'Oro';
  if (points >= 1000) return 'Plata';
  return 'Bronce';
}

function generatePin(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export function useLoyalty(enabled: boolean = true) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync with Firestore or local guest session
  useEffect(() => {
    if (!enabled) {
      setCurrentUser(null);
      setProfile(null);
      setLoading(false);
      return;
    }

    let unsubscribeFirestore: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setLoading(true);

      if (user) {
        // Authenticated user: Listen to Firestore /customers/{uid}
        const userDocRef = doc(db, 'customers', user.uid);
        
        unsubscribeFirestore = onSnapshot(userDocRef, async (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            const points = data.points || 0;
            const updatedProfile: CustomerProfile = {
              uid: user.uid,
              name: data.name || user.displayName || 'Socio Hollywood',
              email: data.email || user.email || '',
              phone: data.phone || '',
              birthDate: data.birthDate || '',
              points,
              tier: data.tier || calculateTier(points),
              pinCode: data.pinCode || generatePin(),
              createdAt: data.createdAt || new Date().toISOString(),
              updatedAt: data.updatedAt || new Date().toISOString()
            };
            setProfile(updatedProfile);
            // Backup locally
            localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(updatedProfile));
          } else {
            // Check if there was guest data to migrate
            const cached = localStorage.getItem(GUEST_STORAGE_KEY);
            const guestData = cached ? JSON.parse(cached) : null;

            const initialPoints = guestData?.points || 0;
            const newProfile: CustomerProfile = {
              uid: user.uid,
              name: user.displayName || guestData?.name || 'Socio Hollywood',
              email: user.email || guestData?.email || '',
              phone: guestData?.phone || '',
              birthDate: guestData?.birthDate || '',
              points: initialPoints,
              tier: calculateTier(initialPoints),
              pinCode: guestData?.pinCode || generatePin(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };

            try {
              await setDoc(userDocRef, {
                name: newProfile.name,
                email: newProfile.email,
                phone: newProfile.phone,
                birthDate: newProfile.birthDate,
                points: newProfile.points,
                tier: newProfile.tier,
                pinCode: newProfile.pinCode,
                createdAt: newProfile.createdAt,
                updatedAt: newProfile.updatedAt
              });
              setProfile(newProfile);
            } catch (err) {
              console.warn('Could not initialize customer profile in Firestore, using memory state:', err);
              setProfile(newProfile);
            }
          }
          setLoading(false);
        }, (err) => {
          console.warn('Firestore snapshot error for customer, falling back to local:', err);
          setLoading(false);
        });

      } else {
        // Not authenticated: Load from local storage
        if (unsubscribeFirestore) {
          unsubscribeFirestore();
          unsubscribeFirestore = null;
        }

        const cached = localStorage.getItem(GUEST_STORAGE_KEY);
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            setProfile(parsed);
          } catch {
            setProfile(null);
          }
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeFirestore) unsubscribeFirestore();
    };
  }, [enabled]);

  // Save profile info (Registration flow from McDonald's style screens)
  const saveProfile = useCallback(async (data: {
    name: string;
    phone: string;
    birthDate: string;
    email?: string;
  }) => {
    if (!enabled) return null;
    const currentPoints = profile?.points || 0;
    const tier = calculateTier(currentPoints);
    const pinCode = profile?.pinCode || generatePin();
    const now = new Date().toISOString();

    const newProfile: CustomerProfile = {
      uid: currentUser?.uid || profile?.uid || `guest_${Date.now()}`,
      name: data.name,
      email: data.email || currentUser?.email || profile?.email || '',
      phone: data.phone,
      birthDate: data.birthDate,
      points: currentPoints,
      tier,
      pinCode,
      createdAt: profile?.createdAt || now,
      updatedAt: now
    };

    setProfile(newProfile);
    localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(newProfile));

    if (currentUser) {
      try {
        const userDocRef = doc(db, 'customers', currentUser.uid);
        await setDoc(userDocRef, {
          name: newProfile.name,
          email: newProfile.email,
          phone: newProfile.phone,
          birthDate: newProfile.birthDate,
          points: newProfile.points,
          tier: newProfile.tier,
          pinCode: newProfile.pinCode,
          createdAt: newProfile.createdAt,
          updatedAt: newProfile.updatedAt
        }, { merge: true });
      } catch (err) {
        console.error('Error saving customer profile in Firestore:', err);
      }
    }

    return newProfile;
  }, [currentUser, profile]);

  // Add Points (e.g. when order is submitted or physical receipt scanned)
  const addPoints = useCallback(async (amount: number) => {
    if (!enabled || amount <= 0) return;
    const currentPoints = profile?.points || 0;
    const newPoints = currentPoints + amount;
    const newTier = calculateTier(newPoints);
    const now = new Date().toISOString();

    if (profile) {
      const updated: CustomerProfile = {
        ...profile,
        points: newPoints,
        tier: newTier,
        updatedAt: now
      };
      setProfile(updated);
      localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(updated));
    }

    if (currentUser) {
      try {
        const userDocRef = doc(db, 'customers', currentUser.uid);
        await updateDoc(userDocRef, {
          points: newPoints,
          tier: newTier,
          updatedAt: now
        });
      } catch (err) {
        console.error('Error updating points in Firestore:', err);
      }
    }
  }, [currentUser, profile]);

  // Deduct points (e.g. reward redemption)
  const deductPoints = useCallback(async (amount: number) => {
    if (!enabled || amount <= 0) return false;
    const currentPoints = profile?.points || 0;
    if (currentPoints < amount) return false;

    const newPoints = currentPoints - amount;
    const newTier = calculateTier(newPoints);
    const now = new Date().toISOString();

    if (profile) {
      const updated: CustomerProfile = {
        ...profile,
        points: newPoints,
        tier: newTier,
        updatedAt: now
      };
      setProfile(updated);
      localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(updated));
    }

    if (currentUser) {
      try {
        const userDocRef = doc(db, 'customers', currentUser.uid);
        await updateDoc(userDocRef, {
          points: newPoints,
          tier: newTier,
          updatedAt: now
        });
      } catch (err) {
        console.error('Error deducting points in Firestore:', err);
      }
    }
    return true;
  }, [currentUser, profile]);

  const signInWithGoogle = useCallback(async () => {
    if (!enabled) return;
    setIsSigningIn(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      if (err.code === 'auth/cancelled-popup-request' || err.code === 'auth/popup-closed-by-user') {
        console.log('Login popup closed by user.');
      } else {
        console.error('Login error:', err);
        setError('No se pudo iniciar sesión con Google. Intenta nuevamente.');
      }
    } finally {
      setIsSigningIn(false);
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    try {
      await signOut(auth);
      setProfile(null);
      localStorage.removeItem(GUEST_STORAGE_KEY);
    } catch (err) {
      console.error('Sign out error:', err);
    }
  }, []);

  return {
    currentUser,
    profile,
    loading,
    isSigningIn,
    error,
    saveProfile,
    addPoints,
    deductPoints,
    signInWithGoogle,
    signOut: handleSignOut
  };
}
