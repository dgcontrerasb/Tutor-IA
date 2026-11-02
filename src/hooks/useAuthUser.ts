import { useState, useEffect, useRef } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import {
  auth,
  UserProfile,
  syncUserProfile,
  getUserUsageFromProfile,
} from '../services/firebase';
import { getUsage } from '../services/usageService';
import { UserUsage } from '../types';
import { AuthToastData } from '../components/AuthToast';
import { getCleanDisplayName } from '../components/AuthBar';

export function useAuthUser() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authToast, setAuthToast] = useState<AuthToastData | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [usage, setUsage] = useState<UserUsage>(() => getUsage());
  const prevAuthUserUidRef = useRef<string | null | undefined>(undefined);

  const handleRefreshProfile = async () => {
    if (!auth.currentUser) return null;
    setIsSyncing(true);
    try {
      const fresh = await syncUserProfile(auth.currentUser, true);
      setCurrentUser(fresh);
      setUsage(getUserUsageFromProfile(fresh));
      return fresh;
    } catch (err) {
      console.error('[Auth Hook] Error al sincronizar perfil:', err);
      return null;
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    // Safety timeout: si Firebase tarda más de 2 segundos en responder, desbloquear la interfaz
    const safetyTimer = setTimeout(() => {
      if (isMounted) {
        setAuthLoading(false);
      }
    }, 2000);

    // Escuchar el estado de autenticación real de Firebase
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      clearTimeout(safetyTimer);
      if (firebaseUser) {
        setAuthLoading(true);
        try {
          const profile = await syncUserProfile(firebaseUser);
          if (isMounted) {
            setCurrentUser(profile);
            setUsage(getUserUsageFromProfile(profile));

            if (
              prevAuthUserUidRef.current !== undefined &&
              prevAuthUserUidRef.current !== firebaseUser.uid
            ) {
              setAuthToast({
                type: 'login',
                userName: getCleanDisplayName(profile),
                role: profile.role,
              });
            }
          }
        } catch (err) {
          console.error('[Auth Hook] Error sincronizando perfil:', err);
        } finally {
          if (isMounted) {
            setAuthLoading(false);
            prevAuthUserUidRef.current = firebaseUser.uid;
          }
        }
      } else {
        if (isMounted) {
          if (
            prevAuthUserUidRef.current !== undefined &&
            prevAuthUserUidRef.current !== null
          ) {
            setAuthToast({
              type: 'logout',
            });
          }
          prevAuthUserUidRef.current = null;
          setCurrentUser(null);
          setAuthLoading(false);
          setUsage(getUsage());
        }
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(safetyTimer);
      unsubscribeAuth();
    };
  }, []);

  return {
    currentUser,
    setCurrentUser,
    authLoading,
    authToast,
    setAuthToast,
    isSyncing,
    usage,
    setUsage,
    handleRefreshProfile,
  };
}
