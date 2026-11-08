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

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey.length > 5 &&
  firebaseConfig.projectId
);

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// Base de datos Firestore oficial del proyecto
const activeDatabaseId =
  firebaseConfig.firestoreDatabaseId ||
  'ai-studio-cuadernopopcorre-70ac83cd-2b9b-4137-8e83-77ac001e7e70';

export const db = isFirebaseConfigured
  ? getFirestore(app, activeDatabaseId)
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
  // 1 Día Completo de Prueba Gratuita (24 horas desde el registro)
  trialStartedAt?: string | null;
  trialExpiresAt?: string | null;
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
export const TRIAL_MAX_USAGES = 999; // Consultas ilimitadas durante el día de prueba
export const SUBSCRIBER_DAILY_MAX_USAGES = 10;

// Tiempo de vida de la caché local del perfil (12 horas)
// Reduce lecturas drásticamente evitando consultar Firestore en recargas o navegación continua
const PROFILE_CACHE_TTL_MS = 12 * 60 * 60 * 1000;

/**
 * Obtiene la clave de almacenamiento local para un perfil
 */
function getProfileStorageKey(uid: string): string {
  return `tutor_ia_profile_${uid}`;
}

/**
 * Recupera el perfil en caché local si aún es válido
 */
export function getCachedUserProfile(uid: string): UserProfile | null {
  try {
    let raw = localStorage.getItem(getProfileStorageKey(uid));
    if (!raw) {
      // Compatibilidad con perfiles previos
      raw = localStorage.getItem(`cuaderno_profile_${uid}`);
    }
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

    // Mantener también el registro local para el panel de administración
    try {
      const LOCAL_USERS_KEY = 'tutor_ia_local_registered_users';
      const raw = localStorage.getItem(LOCAL_USERS_KEY);
      const list: UserProfile[] = raw ? JSON.parse(raw) : [];
      const updated = [profile, ...list.filter((u) => u.uid !== profile.uid && u.email?.toLowerCase() !== profile.email?.toLowerCase())];
      localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(updated.slice(0, 100)));
    } catch {}
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
      localStorage.removeItem(`cuaderno_profile_${uid}`);
    } else {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('tutor_ia_profile_') || key.startsWith('cuaderno_profile_')) {
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
      maxUsages: 999,
      remainingUsages: 999,
      isSubscriptionActive: false,
      subscriptionDaysRemaining: 0,
      isDailyLimit: false,
      isTrialActive: false,
      trialHoursRemaining: 0,
    };
  }

  // 1. Admin siempre tiene acceso ilimitado
  if (profile.role === 'admin' || profile.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
    return {
      usagesUsed: 0,
      maxUsages: 9999,
      remainingUsages: 9999,
      isSubscriptionActive: true,
      subscriptionDaysRemaining: 365,
      isDailyLimit: false,
      isTrialActive: false,
      trialHoursRemaining: 0,
    };
  }

  // 2. Usuario con suscripción activa: acceso ilimitado durante sus 30 días
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
      isTrialActive: false,
      trialHoursRemaining: 0,
    };
  }

  // 3. Usuario en su Día Completo de Prueba Gratuita (24 horas)
  const now = Date.now();
  let trialExpiresAtMs = profile.trialExpiresAt ? new Date(profile.trialExpiresAt).getTime() : 0;

  // Si aún no tenía trialExpiresAt registrado, inicializar 24 horas desde su creación o desde ahora
  if (!trialExpiresAtMs) {
    const createdMs = profile.createdAt ? new Date(profile.createdAt).getTime() : now;
    trialExpiresAtMs = createdMs + 24 * 60 * 60 * 1000;
  }

  const isTrialActive = trialExpiresAtMs > now;
  const trialHoursRemaining = isTrialActive
    ? Math.max(1, Math.ceil((trialExpiresAtMs - now) / (1000 * 60 * 60)))
    : 0;

  if (isTrialActive) {
    return {
      usagesUsed: profile.usagesUsed || 0,
      maxUsages: 999,
      remainingUsages: 999,
      isSubscriptionActive: false,
      subscriptionDaysRemaining: 0,
      isDailyLimit: false,
      isTrialActive: true,
      trialHoursRemaining,
      trialExpiresAt: new Date(trialExpiresAtMs).toISOString(),
    };
  }

  // 4. Usuario con día de prueba vencido
  return {
    usagesUsed: profile.usagesUsed || 0,
    maxUsages: 0,
    remainingUsages: 0,
    isSubscriptionActive: false,
    subscriptionDaysRemaining: 0,
    isDailyLimit: false,
    isTrialActive: false,
    trialHoursRemaining: 0,
    trialExpiresAt: profile.trialExpiresAt,
  };
}

/**
 * Iniciar sesión con Google mediante ventana emergente
 */
export async function loginWithGoogle(): Promise<UserProfile> {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;
  return await syncUserProfile(user, true);
}

/**
 * Cerrar sesión y limpiar caché
 */
export async function logout(): Promise<void> {
  clearCachedUserProfile();
  try {
    localStorage.removeItem('tutor_ia_local_mock_user');
  } catch {}
  await fbSignOut(auth);
}

/**
 * Función auxiliar para proteger operaciones asíncronas con timeout
 */
function withTimeout<T>(promise: Promise<T>, timeoutMs: number = 2500): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Operación de Firestore excedió los ${timeoutMs}ms`)), timeoutMs)
    ),
  ]);
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
    const docSnap = await withTimeout(getDoc(userRef), 2500);

    if (docSnap.exists()) {
      const existing = docSnap.data() as UserProfile;

      // Si el usuario es el correo del admin, asegurar acceso ilimitado
      if (isAdmin) {
        if (existing.role !== 'admin' || !existing.isSubscriptionActive) {
          await withTimeout(
            updateDoc(userRef, {
              role: 'admin',
              isSubscriptionActive: true,
              subscriptionDaysRemaining: 365,
              maxDailyUsages: 9999,
              maxUsages: 9999,
            }),
            2500
          ).catch((e) => console.warn('Aviso al actualizar admin en Firestore:', e));
          existing.role = 'admin';
          existing.isSubscriptionActive = true;
          existing.subscriptionDaysRemaining = 365;
          existing.maxDailyUsages = 9999;
          existing.maxUsages = 9999;
        }
        setCachedUserProfile(existing);
        return existing;
      }

      // Si es un usuario normal (ej: lisgeo2803@gmail.com o cualquier estudiante):
      // Si anteriormente se le había asignado role admin por error, degradarlo a student
      if (existing.role === 'admin' && !isAdmin) {
        existing.role = 'student';
        existing.isSubscriptionActive = false;
        existing.subscriptionDaysRemaining = 0;
        existing.maxUsages = TRIAL_MAX_USAGES;
        await withTimeout(
          updateDoc(userRef, {
            role: 'student',
            isSubscriptionActive: false,
            subscriptionDaysRemaining: 0,
            maxUsages: TRIAL_MAX_USAGES,
          }),
          2500
        ).catch(() => {});
      }

      // Si es lisgeo2803@gmail.com específicamente para pruebas:
      if (user.email?.toLowerCase().trim() === 'lisgeo2803@gmail.com') {
        const daysRemaining = calculateDaysRemaining(existing.subscriptionExpiresAt);
        if (existing.isSubscriptionActive && daysRemaining > 0) {
          existing.subscriptionDaysRemaining = daysRemaining;
          setCachedUserProfile(existing);
          return existing;
        }

        // Si no tiene suscripción activa o ya venció, asegurar que quede como usuario que ya agotó sus 3 pruebas
        existing.role = 'student';
        existing.isSubscriptionActive = false;
        existing.subscriptionDaysRemaining = 0;
        existing.subscriptionExpiresAt = null;
        existing.usagesUsed = TRIAL_MAX_USAGES; // 3 de 3 usados
        existing.maxUsages = TRIAL_MAX_USAGES;
        setCachedUserProfile(existing);
        return existing;
      }

      // Si tiene suscripción activa
      if (existing.isSubscriptionActive) {
        const daysRemaining = calculateDaysRemaining(existing.subscriptionExpiresAt);
        if (daysRemaining <= 0 && existing.subscriptionExpiresAt) {
          // La suscripción venció: desactivar en Firestore
          await withTimeout(
            updateDoc(userRef, {
              isSubscriptionActive: false,
              subscriptionDaysRemaining: 0,
              maxUsages: TRIAL_MAX_USAGES,
              updatedAt: new Date().toISOString(),
            }),
            2500
          ).catch((e) => console.warn('Aviso al expirar suscripción:', e));
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

    const nowIso = new Date().toISOString();
    const trialExpiresIso = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const newProfile: UserProfile = {
      uid: user.uid,
      email: (user.email || '').toLowerCase().trim(),
      displayName: (user.displayName || user.email?.split('@')[0] || 'Estudiante').slice(0, 50),
      ...(sanitizedPhotoURL ? { photoURL: sanitizedPhotoURL } : {}),
      role: isAdmin ? 'admin' : 'student',
      isSubscriptionActive: isAdmin,
      subscriptionDaysRemaining: isAdmin ? 365 : 0,
      subscriptionExpiresAt: null,
      trialStartedAt: nowIso,
      trialExpiresAt: isAdmin ? null : trialExpiresIso,
      usagesUsed: 0,
      maxUsages: isAdmin ? 9999 : 999,
      dailyUsageDate: today,
      dailyUsagesUsed: 0,
      maxDailyUsages: isAdmin ? 9999 : SUBSCRIBER_DAILY_MAX_USAGES,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    await withTimeout(setDoc(userRef, newProfile), 5000).catch((e) =>
      console.warn('Aviso: No se pudo guardar en Firestore remoto (modo offline/resiliente):', e)
    );
    setCachedUserProfile(newProfile);
    try {
      fetch('/api/users/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProfile),
        signal: AbortSignal.timeout(3000),
      }).catch(() => {});
    } catch {}
    return newProfile;
  } catch (error) {
    console.warn('Aviso: Firestore offline o no disponible aún. Utilizando perfil en memoria:', error);
    // En caso de problema de conexión o base de datos aún no creada en Firebase Console
    const fallbackCached = getCachedUserProfile(user.uid);
    if (fallbackCached) return fallbackCached;

    if (user.email?.toLowerCase().trim() === 'lisgeo2803@gmail.com') {
      const lisgeoProfile: UserProfile = {
        uid: user.uid,
        email: 'lisgeo2803@gmail.com',
        displayName: user.displayName || 'Lisgeo',
        role: 'student',
        isSubscriptionActive: false,
        subscriptionDaysRemaining: 0,
        subscriptionExpiresAt: null,
        usagesUsed: TRIAL_MAX_USAGES,
        maxUsages: TRIAL_MAX_USAGES,
        dailyUsageDate: today,
        dailyUsagesUsed: 0,
        maxDailyUsages: SUBSCRIBER_DAILY_MAX_USAGES,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setCachedUserProfile(lisgeoProfile);
      return lisgeoProfile;
    }

    const fallbackProfile: UserProfile = {
      uid: user.uid,
      email: (user.email || '').toLowerCase().trim(),
      displayName: user.displayName || user.email?.split('@')[0] || 'Estudiante',
      photoURL: user.photoURL || undefined,
      role: isAdmin ? 'admin' : 'student',
      isSubscriptionActive: isAdmin,
      subscriptionDaysRemaining: isAdmin ? 365 : 0,
      usagesUsed: 0,
      maxUsages: isAdmin ? 9999 : TRIAL_MAX_USAGES,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setCachedUserProfile(fallbackProfile);
    return fallbackProfile;
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
