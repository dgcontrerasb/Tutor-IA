import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import {
  auth,
  UserProfile,
  syncUserProfile,
  getUserUsageFromProfile,
} from '../services/firebase';
import { getUsage } from '../services/usageService';
import { UserUsage } from '../types';

export function useAuthUser() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [usage, setUsage] = useState<UserUsage>(() => getUsage());

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
          }
        } catch (err) {
          console.error('[Auth Hook] Error sincronizando perfil:', err);
        } finally {
          if (isMounted) {
            setAuthLoading(false);
          }
        }
      } else {
        if (isMounted) {
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
    isSyncing,
    usage,
    setUsage,
    handleRefreshProfile,
  };
}
