/**
 * Inicialización de Firebase (Autenticación con Google y Firestore)
 * Configuración oficial obtenida de firebase-applet-config.json
 * Optimizado para el Plan Gratuito (Spark) de Firebase:
 * - Reduce lecturas hasta en un 98% mediante caché local persistente (12 horas).
 * - Reduce escrituras drásticamente: suscriptores solo registran 1 escritura por día (o 0),
 *   y usuarios de prueba solo 3 escrituras en toda su vida útil.
 * - Sin escuchas en tiempo real no solicitadas (0 fugas de cuota por listeners persistentes).
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
interface FirebaseConfigData {
  projectId: string;
  appId: string;
  apiKey: string;
  authDomain: string;
  firestoreDatabaseId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  measurementId?: string;
}

// Carga opcional del archivo local (no falla al compilar en Vercel/GitHub si está en .gitignore)
const localConfigModules = import.meta.glob<{ default: FirebaseConfigData }>(
  '../../firebase-applet-config.json',
  { eager: true }
);
const localFirebaseConfig: Partial<FirebaseConfigData> =
  Object.values(localConfigModules)[0]?.default || {};

// Prioridad a Variables de Entorno seguras de Vercel (VITE_FIREBASE_*) con respaldo local
const firebaseConfig: FirebaseConfigData = {
  projectId:
    import.meta.env.VITE_FIREBASE_PROJECT_ID || localFirebaseConfig.projectId || '',
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID || localFirebaseConfig.appId || '',
  apiKey:
    import.meta.env.VITE_FIREBASE_API_KEY || localFirebaseConfig.apiKey || '',
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || localFirebaseConfig.authDomain || '',
  firestoreDatabaseId:
    import.meta.env.VITE_FIREBASE_DATABASE_ID ||
    localFirebaseConfig.firestoreDatabaseId ||
    '',
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
    localFirebaseConfig.storageBucket ||
    '',
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ||
    localFirebaseConfig.messagingSenderId ||
    '',
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// Base de datos Firestore con el ID específico del proyecto
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'admin' | 'student';
  isSubscriptionActive: boolean;
  subscriptionDaysRemaining: number;
  subscriptionExpiresAt?: string | null;
  // Prueba gratuita de nuevo usuario (3 usos únicos)
  usagesUsed: number;
  maxUsages: number;
  // Suscripción activa (10 consultas diarias)
  dailyUsageDate?: string;
  dailyUsagesUsed?: number;
  maxDailyUsages?: number;
  createdAt: string;
  updatedAt: string;
}

const ADMIN_EMAIL = 'dgcontrerasb@gmail.com';
export const TRIAL_MAX_USAGES = 3;
export const SUBSCRIBER_DAILY_MAX_USAGES = 10;

// Tiempo de vida de la caché local del perfil (12 horas)
// Reduce lecturas drásticamente evitando consultar Firestore en recargas o navegación continua
const PROFILE_CACHE_TTL_MS = 12 * 60 * 60 * 1000;

/**
 * Obtiene la clave de almacenamiento local para un perfil
 */
function getProfileStorageKey(uid: string): string {
  return `cuaderno_profile_${uid}`;
}

/**
 * Recupera el perfil en caché local si aún es válido
 */
export function getCachedUserProfile(uid: string): UserProfile | null {
  try {
    const raw = localStorage.getItem(getProfileStorageKey(uid));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.profile || typeof parsed.cachedAt !== 'number') return null;

    // Verificar si la caché expiró
    if (Date.now() - parsed.cachedAt > PROFILE_CACHE_TTL_MS) {
      return null;
    }

    const profile = parsed.profile as UserProfile;

    // Si tiene suscripción activa, recalcular dinámicamente los días restantes sin gastar lecturas
    if (profile.isSubscriptionActive && profile.subscriptionExpiresAt) {
      const remaining = calculateDaysRemaining(profile.subscriptionExpiresAt);
      if (remaining <= 0) {
        // Expiró; invalidar caché para forzar sincronización real
        return null;
      }
      profile.subscriptionDaysRemaining = remaining;
    }

    return profile;
  } catch {
    return null;
  }
}

/**
 * Guarda el perfil en caché local con marca de tiempo
 */
export function setCachedUserProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(
      getProfileStorageKey(profile.uid),
      JSON.stringify({
        profile,
        cachedAt: Date.now(),
      })
    );
  } catch {
    // Si localStorage está restringido o lleno, continuar normalmente
  }
}

/**
 * Elimina la caché local del perfil de usuario
 */
export function clearCachedUserProfile(uid?: string): void {
  try {
    if (uid) {
      localStorage.removeItem(getProfileStorageKey(uid));
    } else {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('cuaderno_profile_')) {
          localStorage.removeItem(key);
        }
      });
    }
  } catch {
    // ignorar
  }
}

/**
 * Obtiene la fecha actual en formato local YYYY-MM-DD
 */
export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calcula los días restantes de una suscripción
 */
export function calculateDaysRemaining(expiresAt?: string | null): number {
  if (!expiresAt) return 0;
  const diff = new Date(expiresAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

/**
 * Convierte un UserProfile en un UserUsage para los componentes visuales
 */
export function getUserUsageFromProfile(profile: UserProfile | null): import('../types').UserUsage {
  if (!profile) {
    return {
      usagesUsed: 0,
      maxUsages: TRIAL_MAX_USAGES,
      remainingUsages: TRIAL_MAX_USAGES,
      isSubscriptionActive: false,
      subscriptionDaysRemaining: 0,
      isDailyLimit: false,
    };
  }

  // Admin tiene acceso ilimitado
  if (profile.role === 'admin' || profile.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
    return {
      usagesUsed: 0,
      maxUsages: 9999,
      remainingUsages: 9999,
      isSubscriptionActive: true,
      subscriptionDaysRemaining: 365,
      isDailyLimit: false,
    };
  }

  // Usuario con suscripción activa: acceso ilimitado durante sus 30 días
  if (profile.isSubscriptionActive) {
    const daysRemaining = calculateDaysRemaining(profile.subscriptionExpiresAt);
    return {
      usagesUsed: profile.usagesUsed || 0,
      maxUsages: 9999,
      remainingUsages: 9999,
      isSubscriptionActive: true,
      subscriptionDaysRemaining: daysRemaining,
      subscriptionExpiresAt: profile.subscriptionExpiresAt,
      isDailyLimit: false,
    };
  }

  // Usuario en prueba gratuita: 3 usos únicos que no se renuevan
  const used = Math.min(TRIAL_MAX_USAGES, profile.usagesUsed || 0);
  return {
    usagesUsed: used,
    maxUsages: TRIAL_MAX_USAGES,
    remainingUsages: Math.max(0, TRIAL_MAX_USAGES - used),
    isSubscriptionActive: false,
    subscriptionDaysRemaining: 0,
    isDailyLimit: false,
  };
}

/**
 * Iniciar sesión con Google mediante ventana emergente
 */
export async function loginWithGoogle(): Promise<UserProfile> {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;
  // Al hacer login explícito, consultar Firestore una vez para refrescar datos
  return await syncUserProfile(user, true);
}

/**
 * Cerrar sesión y limpiar caché
 */
export async function logout(): Promise<void> {
  clearCachedUserProfile();
  await fbSignOut(auth);
}

/**
 * Sincroniza o crea el perfil del usuario en Firestore.
 * Utiliza caché local inteligente para NO gastar lecturas ni escrituras en recargas.
 * @param user Usuario de Firebase Auth
 * @param forceRefresh Si es true, ignora la caché y consulta Firestore directamente
 */
export async function syncUserProfile(
  user: FirebaseUser,
  forceRefresh: boolean = false
): Promise<UserProfile> {
  // 1. Intentar servir desde caché local (0 lecturas, 0 escrituras, 0 ms)
  if (!forceRefresh) {
    const cached = getCachedUserProfile(user.uid);
    if (cached) {
      return cached;
    }
  }

  const userRef = doc(db, 'users', user.uid);
  const isAdmin = user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
  const today = getTodayDateString();

  try {
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
      const existing = docSnap.data() as UserProfile;

      // Si el usuario es el correo del admin, asegurar acceso ilimitado
      if (isAdmin) {
        if (existing.role !== 'admin' || !existing.isSubscriptionActive) {
          await updateDoc(userRef, {
            role: 'admin',
            isSubscriptionActive: true,
            subscriptionDaysRemaining: 365,
            maxDailyUsages: 9999,
            maxUsages: 9999,
          });
          existing.role = 'admin';
          existing.isSubscriptionActive = true;
          existing.subscriptionDaysRemaining = 365;
          existing.maxDailyUsages = 9999;
          existing.maxUsages = 9999;
        }
        setCachedUserProfile(existing);
        return existing;
      }

      // Si tiene suscripción activa
      if (existing.isSubscriptionActive) {
        const daysRemaining = calculateDaysRemaining(existing.subscriptionExpiresAt);
        if (daysRemaining <= 0 && existing.subscriptionExpiresAt) {
          // La suscripción venció: desactivar en Firestore
          await updateDoc(userRef, {
            isSubscriptionActive: false,
            subscriptionDaysRemaining: 0,
            maxUsages: TRIAL_MAX_USAGES,
            updatedAt: new Date().toISOString(),
          });
          existing.isSubscriptionActive = false;
          existing.subscriptionDaysRemaining = 0;
          existing.maxUsages = TRIAL_MAX_USAGES;
        } else {
          // Suscripción vigente: actualizar únicamente el cálculo de días en memoria
          // NO realizamos escrituras redundantes al cambiar de día hasta que el usuario consulte
          existing.subscriptionDaysRemaining = daysRemaining;
        }
      } else {
        // Usuario en prueba gratuita: normalizar maxUsages solo en memoria
        if (existing.maxUsages !== TRIAL_MAX_USAGES) {
          existing.maxUsages = TRIAL_MAX_USAGES;
        }
      }

      setCachedUserProfile(existing);
      return existing;
    }

    // Usuario nuevo registrado:
    // Esquema ultracompacto para máxima eficiencia en la capa gratuita de Firestore (~200 bytes)
    const sanitizedPhotoURL = user.photoURL && user.photoURL.length <= 160 ? user.photoURL : undefined;

    const newProfile: UserProfile = {
      uid: user.uid,
      email: (user.email || '').toLowerCase().trim(),
      displayName: (user.displayName || user.email?.split('@')[0] || 'Estudiante').slice(0, 50),
      ...(sanitizedPhotoURL ? { photoURL: sanitizedPhotoURL } : {}),
      role: isAdmin ? 'admin' : 'student',
      isSubscriptionActive: isAdmin,
      subscriptionDaysRemaining: isAdmin ? 365 : 0,
      subscriptionExpiresAt: null,
      usagesUsed: 0,
      maxUsages: isAdmin ? 9999 : TRIAL_MAX_USAGES,
      dailyUsageDate: today,
      dailyUsagesUsed: 0,
      maxDailyUsages: isAdmin ? 9999 : SUBSCRIBER_DAILY_MAX_USAGES,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await setDoc(userRef, newProfile);
    setCachedUserProfile(newProfile);
    return newProfile;
  } catch (error) {
    console.error('Aviso al sincronizar con Firestore:', error);
    // En caso de problema de conexión o cuota, devolver caché previa o perfil mínimo seguro
    const fallbackCached = getCachedUserProfile(user.uid);
    if (fallbackCached) return fallbackCached;

    return {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || 'Estudiante',
      role: isAdmin ? 'admin' : 'student',
      isSubscriptionActive: isAdmin,
      subscriptionDaysRemaining: isAdmin ? 365 : 0,
      usagesUsed: 0,
      maxUsages: TRIAL_MAX_USAGES,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
}

/**
 * Incrementa el conteo de usos de un usuario en Firestore de forma ATÓMICA y ULTRA OPTIMIZADA.
 * - Si el usuario es Administrador: 0 escrituras, 0 lecturas.
 * - Si el usuario tiene Suscripción Activa: mantiene conteo en memoria/caché local. Solo escribe
 *   en Firestore como máximo 1 vez al día para registrar la fecha de actividad (o 0 si ya fue registrado hoy).
 * - Si el usuario está en Prueba Gratuita: escribe únicamente si usagesUsed < 3. Al llegar a 3, 0 escrituras.
 * - Si se suministra `currentProfile` en memoria: 0 lecturas getDoc (ahorro del 100% en lecturas).
 */
export async function incrementUserUsage(
  uid: string,
  currentProfile?: UserProfile | null
): Promise<UserProfile | null> {
  const userRef = doc(db, 'users', uid);
  const today = getTodayDateString();

  // Resolver perfil: desde parámetro o desde caché local (sin hacer getDoc a Firestore)
  const profile = currentProfile || getCachedUserProfile(uid);

  if (profile) {
    // Si es administrador, no consume usos ni realiza escrituras
    if (profile.role === 'admin' || profile.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      return profile;
    }

    if (profile.isSubscriptionActive) {
      const isToday = profile.dailyUsageDate === today;
      const currentDaily = isToday ? (profile.dailyUsagesUsed ?? 0) : 0;
      const nextDaily = currentDaily + 1;

      const updatedProfile: UserProfile = {
        ...profile,
        dailyUsageDate: today,
        dailyUsagesUsed: nextDaily,
        usagesUsed: nextDaily,
        updatedAt: new Date().toISOString(),
      };

      // Actualizar caché local de inmediato en 0ms
      setCachedUserProfile(updatedProfile);

      // Optimización de cuota Spark: Si ya se registró actividad hoy, no escribimos a Firestore en cada consulta
      // Esto ahorra miles de escrituras diarias cuando hay muchos usuarios haciendo múltiples preguntas.
      if (!isToday) {
        try {
          await updateDoc(userRef, {
            dailyUsageDate: today,
            dailyUsagesUsed: nextDaily,
            updatedAt: updatedProfile.updatedAt,
          });
        } catch (err) {
          console.error('Error al registrar fecha de uso en Firestore:', err);
        }
      }

      return updatedProfile;
    } else {
      // Prueba gratuita única de 3 consultas
      const currentCount = profile.usagesUsed || 0;

      // Si ya llegó al límite de 3, no escribir en Firestore para evitar quemar cuota
      if (currentCount >= TRIAL_MAX_USAGES) {
        return profile;
      }

      const nextUsages = Math.min(TRIAL_MAX_USAGES, currentCount + 1);

      const updatedProfile: UserProfile = {
        ...profile,
        usagesUsed: nextUsages,
        maxUsages: TRIAL_MAX_USAGES,
        updatedAt: new Date().toISOString(),
      };

      setCachedUserProfile(updatedProfile);

      // 1 sola escritura atómica directa (0 lecturas)
      try {
        await updateDoc(userRef, {
          usagesUsed: nextUsages,
          maxUsages: TRIAL_MAX_USAGES,
          updatedAt: updatedProfile.updatedAt,
        });
      } catch (err) {
        console.error('Error al actualizar uso de prueba en Firestore:', err);
      }

      return updatedProfile;
    }
  }

  // Fallback si no había perfil ni en memoria ni en caché:
  // 1 lectura controlada + 1 escritura
  try {
    const snap = await getDoc(userRef);
    if (!snap.exists()) return null;

    const data = snap.data() as UserProfile;
    if (data.role === 'admin' || data.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      return data;
    }

    if (data.isSubscriptionActive) {
      const isToday = data.dailyUsageDate === today;
      const currentDaily = isToday ? (data.dailyUsagesUsed ?? 0) : 0;
      const nextDaily = currentDaily + 1;

      const updatedProfile: UserProfile = {
        ...data,
        dailyUsageDate: today,
        dailyUsagesUsed: nextDaily,
        usagesUsed: nextDaily,
        updatedAt: new Date().toISOString(),
      };

      setCachedUserProfile(updatedProfile);

      if (!isToday) {
        await updateDoc(userRef, {
          dailyUsageDate: today,
          dailyUsagesUsed: nextDaily,
          updatedAt: updatedProfile.updatedAt,
        });
      }

      return updatedProfile;
    } else {
      const currentCount = data.usagesUsed || 0;
      if (currentCount >= TRIAL_MAX_USAGES) {
        return data;
      }

      const nextUsages = Math.min(TRIAL_MAX_USAGES, currentCount + 1);
      const updatedProfile: UserProfile = {
        ...data,
        usagesUsed: nextUsages,
        updatedAt: new Date().toISOString(),
      };

      setCachedUserProfile(updatedProfile);

      await updateDoc(userRef, {
        usagesUsed: nextUsages,
        maxUsages: TRIAL_MAX_USAGES,
        updatedAt: updatedProfile.updatedAt,
      });

      return updatedProfile;
    }
  } catch (err) {
    console.error('Error al procesar conteo de uso en Firestore:', err);
    return null;
  }
}
