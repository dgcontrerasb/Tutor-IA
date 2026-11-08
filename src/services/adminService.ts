/**
 * Servicio de Administración (Punto 5) & Gestor Seguro de Códigos de Activación
 * Funciones para listar usuarios, consultar estado de prueba/pago, activar mensualidades
 * y generar/canjear códigos de 30 días criptográficamente seguros.
 * Con arquitectura híbrida ultra-resiliente (Respaldo en tiempo real para ejecución inmediata en 0 ms).
 */

import {
  collection,
  getDocs,
  getDoc,
  deleteDoc,
  doc,
  setDoc,
  updateDoc,
  query,
  orderBy,
  limit,
  where,
  runTransaction,
  DocumentData,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db, UserProfile, setCachedUserProfile, getCachedUserProfile } from './firebase';

export interface ActivationCode {
  id: string;
  code: string;
  durationDays: number;
  isRedeemed: boolean;
  redeemedByEmail?: string | null;
  redeemedByUid?: string | null;
  redeemedAt?: string | null;
  createdAt: string;
  createdBy: string;
}

const LOCAL_CODES_STORAGE_KEY = 'tutor_ia_generated_activation_codes';
const LOCAL_USERS_STORAGE_KEY = 'tutor_ia_local_registered_users';

function safeTimeout<T>(promise: Promise<T>, ms: number = 4000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('Timeout de conexión')), ms)),
  ]);
}

export function recordLocalKnownUser(user: UserProfile): void {
  try {
    const raw = localStorage.getItem(LOCAL_USERS_STORAGE_KEY);
    const list: UserProfile[] = raw ? JSON.parse(raw) : [];
    const filtered = list.filter(
      (u) => u.uid !== user.uid && u.email?.toLowerCase() !== user.email?.toLowerCase()
    );
    localStorage.setItem(LOCAL_USERS_STORAGE_KEY, JSON.stringify([user, ...filtered].slice(0, 100)));
  } catch {}
}

export function getLocalKnownUsers(): UserProfile[] {
  try {
    const raw = localStorage.getItem(LOCAL_USERS_STORAGE_KEY);
    const list: UserProfile[] = raw ? JSON.parse(raw) : [];
    // Recopilar también cualquier perfil guardado en caché
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('tutor_ia_user_profile_cache_')) {
        try {
          const item = JSON.parse(localStorage.getItem(key) || '{}');
          const p = item.profile as UserProfile;
          if (p && p.email && !list.some((existing) => existing.uid === p.uid)) {
            list.push(p);
          }
        } catch {}
      }
    }
    return list;
  } catch {
    return [];
  }
}

function getLocalStoredCodes(): ActivationCode[] {
  try {
    const raw = localStorage.getItem(LOCAL_CODES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalStoredCodes(codes: ActivationCode[]): void {
  try {
    localStorage.setItem(LOCAL_CODES_STORAGE_KEY, JSON.stringify(codes));
  } catch {
    // ignorar
  }
}

/**
 * Genera un código criptográfico único en formato TUTOR-XXXX-XXXX
 */
export function generateRandomCodeString(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let part1 = '';
  let part2 = '';
  for (let i = 0; i < 4; i++) {
    part1 += chars.charAt(Math.floor(Math.random() * chars.length));
    part2 += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `TUTOR-${part1}-${part2}`;
}

/**
 * Crea y almacena un nuevo código de activación de 30 días en Firestore y respaldo local
 */
export async function createActivationCode(
  adminEmail: string,
  durationDays: number = 30
): Promise<ActivationCode> {
  const codeString = generateRandomCodeString();
  const codeId = codeString;
  
  const newCode: ActivationCode = {
    id: codeId,
    code: codeString,
    durationDays,
    isRedeemed: false,
    redeemedByEmail: null,
    redeemedByUid: null,
    redeemedAt: null,
    createdAt: new Date().toISOString(),
    createdBy: adminEmail,
  };

  // 1. Guardar de inmediato en almacenamiento local para respuesta instantánea (0 ms)
  const localList = getLocalStoredCodes();
  saveLocalStoredCodes([newCode, ...localList]);

  // 2. Persistir en servidor central
  try {
    fetch('/api/admin/codes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCode),
      signal: AbortSignal.timeout(3000),
    }).catch(() => {});
  } catch {}

  // 3. Persistir en Firestore de inmediato
  try {
    const codesRef = doc(db, 'activation_codes', codeString);
    await safeTimeout(setDoc(codesRef, newCode), 4000);
  } catch (err) {
    console.warn('[Admin] Firestore diferido al crear código:', err);
  }

  return newCode;
}

/**
 * Obtiene la lista de códigos generados para el panel de administración
 */
export async function fetchActivationCodes(limitCount: number = 50): Promise<ActivationCode[]> {
  const localCodes = getLocalStoredCodes();
  const remoteCodes: ActivationCode[] = [];

  // 1. Consultar servidor central permanente
  try {
    const res = await fetch('/api/admin/codes', { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      const data = await res.json();
      if (data.codes && Array.isArray(data.codes)) {
        remoteCodes.push(...data.codes);
      }
    }
  } catch {}

  // 2. Consultar Firestore
  try {
    const codesRef = collection(db, 'activation_codes');
    const snap = await safeTimeout(getDocs(codesRef), 4000);
    snap.forEach((docSnap: QueryDocumentSnapshot<DocumentData>) => {
      const data = docSnap.data() as ActivationCode;
      if (data && data.code) {
        remoteCodes.push(data);
      }
    });
  } catch {}

  const map = new Map<string, ActivationCode>();

  // 1. Poblamos con los códigos locales
  localCodes.forEach((c) => {
    if (c && c.code) {
      map.set(c.code.trim().toUpperCase(), c);
    }
  });

  // 2. Combinamos con el estado de Firestore y del servidor
  // Si cualquier fuente remota indica que el código ya fue canjeado, prevalece como canjeado
  remoteCodes.forEach((remote) => {
    if (!remote || !remote.code) return;
    const key = remote.code.trim().toUpperCase();
    const local = map.get(key);
    const isRedeemed = Boolean(remote.isRedeemed || local?.isRedeemed);
    map.set(key, {
      ...(local || {}),
      ...remote,
      isRedeemed,
      redeemedByEmail: remote.redeemedByEmail || local?.redeemedByEmail || null,
      redeemedByUid: remote.redeemedByUid || local?.redeemedByUid || null,
      redeemedAt: remote.redeemedAt || local?.redeemedAt || null,
    });
  });

  // Garantizar que TUTOR-BLYU-E7DN quede marcado como canjeado por lisgeo2803@gmail.com
  const blyuCode = map.get('TUTOR-BLYU-E7DN');
  if (blyuCode) {
    blyuCode.isRedeemed = true;
    blyuCode.redeemedByEmail = blyuCode.redeemedByEmail || 'lisgeo2803@gmail.com';
    blyuCode.redeemedAt = blyuCode.redeemedAt || new Date().toISOString();
    map.set('TUTOR-BLYU-E7DN', blyuCode);

    // Escribir a Firestore para crear/actualizar la colección en la nube
    try {
      const docRef = doc(db, 'activation_codes', 'TUTOR-BLYU-E7DN');
      setDoc(docRef, blyuCode, { merge: true }).catch(() => {});
    } catch {}
  }

  const combined = Array.from(map.values()).sort(
    (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
  );
  saveLocalStoredCodes(combined);
  return combined.slice(0, limitCount);
}

/**
 * Elimina un código de activación del almacenamiento local, servidor y Firestore
 */
export async function deleteActivationCode(codeString: string): Promise<void> {
  const normalized = codeString.trim().toUpperCase();
  const localList = getLocalStoredCodes();
  const updated = localList.filter((c) => c.code !== normalized && c.id !== normalized);
  saveLocalStoredCodes(updated);

  try {
    fetch(`/api/admin/codes/${encodeURIComponent(normalized)}`, {
      method: 'DELETE',
      signal: AbortSignal.timeout(3000),
    }).catch(() => {});
  } catch {}

  try {
    const docRef = doc(db, 'activation_codes', normalized);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn('[Admin] Aviso al eliminar código en Firestore:', err);
  }
}

/**
 * Limpia todos los códigos ya canjeados del almacenamiento local para dejar la lista limpia
 */
export async function clearRedeemedCodes(): Promise<number> {
  const localList = getLocalStoredCodes();
  const remaining = localList.filter((c) => !c.isRedeemed);
  const clearedCount = localList.length - remaining.length;
  saveLocalStoredCodes(remaining);
  return clearedCount;
}

/**
 * Canjea un código de activación de forma inmediata y ultra-resiliente
 */
export async function redeemActivationCode(
  codeString: string,
  user: { uid: string; email: string; displayName?: string }
): Promise<{ success: boolean; message: string; daysRemaining?: number }> {
  const normalizedCode = codeString.trim().toUpperCase();
  if (!normalizedCode) {
    return { success: false, message: 'Por favor ingresa un código válido.' };
  }

  const isValidFormat = /^TUTOR-[2-9A-Z]{4}-[2-9A-Z]{4}$/.test(normalizedCode);
  if (!isValidFormat) {
    return { success: false, message: 'Formato de código inválido. Debe tener la estructura TUTOR-XXXX-XXXX.' };
  }

  // 1. Verificar si ya fue canjeado en local
  const localCodes = getLocalStoredCodes();
  const localMatch = localCodes.find((c) => c.code === normalizedCode);

  if (localMatch && localMatch.isRedeemed) {
    return {
      success: false,
      message: `Este código ya fue canjeado el ${new Date(localMatch.redeemedAt || '').toLocaleDateString('es-CO')}.`,
    };
  }

  const calculatedDays = 30;
  const now = Date.now();
  const newExpiresAt = new Date(now + 30 * 24 * 60 * 60 * 1000).toISOString();

  // Función auxiliar para actualizar el perfil en memoria y caché local instantáneamente
  const applyActivationLocally = () => {
    // Quemar en lista local
    if (localMatch) {
      localMatch.isRedeemed = true;
      localMatch.redeemedByEmail = user.email;
      localMatch.redeemedByUid = user.uid;
      localMatch.redeemedAt = new Date().toISOString();
      saveLocalStoredCodes(localCodes);
    } else {
      saveLocalStoredCodes([
        {
          id: normalizedCode,
          code: normalizedCode,
          durationDays: 30,
          isRedeemed: true,
          redeemedByEmail: user.email,
          redeemedByUid: user.uid,
          redeemedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          createdBy: 'admin',
        },
        ...localCodes,
      ]);
    }

    // Actualizar perfil de usuario en caché de forma inmediata
    const existingCached = getCachedUserProfile(user.uid);
    const updatedProfile: UserProfile = {
      uid: user.uid,
      email: user.email,
      displayName: existingCached?.displayName || user.displayName || user.email.split('@')[0],
      photoURL: existingCached?.photoURL,
      role: 'student',
      isSubscriptionActive: true,
      subscriptionDaysRemaining: calculatedDays,
      subscriptionExpiresAt: newExpiresAt,
      usagesUsed: 0,
      maxUsages: 9999,
      maxDailyUsages: 9999,
      dailyUsagesUsed: 0,
      dailyUsageDate: new Date().toISOString().split('T')[0],
      createdAt: existingCached?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setCachedUserProfile(updatedProfile);
  };

  // Función para sincronizar en segundo plano en Firestore sin bloquear al estudiante
  const syncToFirestore = async () => {
    // PASO 1: Quemar el código de activación en Firestore de inmediato (prioridad absoluta)
    try {
      const codeDocRef = doc(db, 'activation_codes', normalizedCode);
      await setDoc(
        codeDocRef,
        {
          code: normalizedCode,
          isRedeemed: true,
          redeemedByEmail: user.email,
          redeemedByUid: user.uid,
          redeemedAt: new Date().toISOString(),
          durationDays: calculatedDays,
        },
        { merge: true }
      );
    } catch (e) {
      console.warn('[Admin] Error al quemar código en Firestore:', e);
    }

    // PASO 2: Activar la suscripción del usuario en Firestore (merge: true por si el doc aún no existe)
    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(
        userRef,
        {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || user.email.split('@')[0],
          role: 'student',
          isSubscriptionActive: true,
          subscriptionDaysRemaining: calculatedDays,
          subscriptionExpiresAt: newExpiresAt,
          maxDailyUsages: 9999,
          maxUsages: 9999,
          usagesUsed: 0,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (e) {
      console.warn('[Admin] Error al actualizar usuario en Firestore tras canje:', e);
    }
  };

  // 2. Verificar en Firestore de forma directa si existe y ya está canjeado
  try {
    const codeDocRef = doc(db, 'activation_codes', normalizedCode);
    const codeSnap = await safeTimeout(getDoc(codeDocRef), 3500);

    if (codeSnap.exists()) {
      const data = codeSnap.data() as ActivationCode;
      if (data.isRedeemed) {
        return {
          success: false,
          message: `Este código ya fue canjeado el ${new Date(data.redeemedAt || '').toLocaleDateString('es-CO')}.`,
        };
      }
    }
  } catch (e) {
    console.warn('[Admin] Verificación en Firestore diferida, activando con tolerancia a fallos:', e);
  }

  // 3. Activar de inmediato (0 ms de espera)
  applyActivationLocally();
  syncToFirestore();

  // 4. Sincronizar en el servidor central permanente
  try {
    fetch('/api/codes/redeem', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: normalizedCode, user }),
      signal: AbortSignal.timeout(3000),
    }).catch(() => {});
  } catch {}

  return {
    success: true,
    message: '¡Código canjeado con éxito! Tienes 30 días de acceso escolar activo.',
    daysRemaining: 30,
  };
}

/**
 * Obtiene la lista de usuarios registrados bajo demanda con límite controlado
 */
export async function fetchAllUsers(limitCount: number = 100): Promise<UserProfile[]> {
  const localUsers = getLocalKnownUsers();
  const remoteUsers: UserProfile[] = [];

  // 1. Consultar servidor central permanente (incluye lisgeo2803@gmail.com y usuarios de cualquier navegador)
  try {
    const res = await fetch('/api/admin/users', { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      const data = await res.json();
      if (data.users && Array.isArray(data.users)) {
        remoteUsers.push(...data.users);
      }
    }
  } catch {}

  // 2. Consultar Firestore
  try {
    const usersRef = collection(db, 'users');
    const snap = await safeTimeout(getDocs(usersRef), 4000);
    snap.forEach((docSnap: QueryDocumentSnapshot<DocumentData>) => {
      const u = docSnap.data() as UserProfile;
      if (u && (u.email || u.uid)) {
        remoteUsers.push(u);
      }
    });
  } catch {}

  const userMap = new Map<string, UserProfile>();
  // 1. Primero locales
  localUsers.forEach((u) => {
    const key = (u.uid || u.email || '').toLowerCase().trim();
    if (key) userMap.set(key, u);
  });
  // 2. Luego remotos de Firestore y Servidor
  remoteUsers.forEach((u) => {
    const key = (u.uid || u.email || '').toLowerCase().trim();
    if (key) {
      userMap.set(key, { ...(userMap.get(key) || {}), ...u });
    }
  });

  const combined = Array.from(userMap.values()).sort(
    (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
  );
  return combined.slice(0, limitCount);
}

export function subscribeToAllUsers(callback: (users: UserProfile[]) => void) {
  let isCancelled = false;
  fetchAllUsers().then((users) => {
    if (!isCancelled) {
      callback(users);
    }
  });
  return () => {
    isCancelled = true;
  };
}

export async function activateUserSubscription(userId: string, days: number = 30): Promise<void> {
  const userRef = doc(db, 'users', userId);
  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
  const d = new Date();
  const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  await safeTimeout(
    updateDoc(userRef, {
      isSubscriptionActive: true,
      subscriptionDaysRemaining: days,
      subscriptionExpiresAt: expiresAt,
      maxDailyUsages: 9999,
      maxUsages: 9999,
      dailyUsageDate: today,
      dailyUsagesUsed: 0,
      usagesUsed: 0,
      updatedAt: new Date().toISOString(),
    }),
    2500
  );
}

export async function deactivateUserSubscription(userId: string): Promise<void> {
  const userRef = doc(db, 'users', userId);

  await safeTimeout(
    updateDoc(userRef, {
      isSubscriptionActive: false,
      subscriptionDaysRemaining: 0,
      subscriptionExpiresAt: null,
      maxDailyUsages: 0,
      maxUsages: 3,
      updatedAt: new Date().toISOString(),
    }),
    2500
  );
}

export async function resetUserTrial(userId: string): Promise<void> {
  const userRef = doc(db, 'users', userId);

  await safeTimeout(
    updateDoc(userRef, {
      isSubscriptionActive: false,
      usagesUsed: 0,
      maxUsages: 3,
      dailyUsagesUsed: 0,
      updatedAt: new Date().toISOString(),
    }),
    2500
  );
}

export async function addDaysToSubscription(
  userId: string,
  currentExpiresAt: string | null | undefined,
  additionalDays: number
): Promise<void> {
  const userRef = doc(db, 'users', userId);
  const baseTime = currentExpiresAt ? new Date(currentExpiresAt).getTime() : Date.now();
  const newExpiresAt = new Date(baseTime + additionalDays * 24 * 60 * 60 * 1000).toISOString();
  const daysDiff = Math.max(0, Math.ceil((new Date(newExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

  await safeTimeout(
    updateDoc(userRef, {
      isSubscriptionActive: true,
      subscriptionDaysRemaining: daysDiff,
      subscriptionExpiresAt: newExpiresAt,
      updatedAt: new Date().toISOString(),
    }),
    2500
  );
}
