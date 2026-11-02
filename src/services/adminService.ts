/**
 * Servicio de Administración (Punto 5)
 * Funciones para listar usuarios, consultar estado de prueba/pago y activar mensualidades.
 * Optimizado para el plan gratuito Spark de Firebase:
 * - Emplea consultas puntuales con límite (getDocs + limit) en lugar de listeners en tiempo real continuos (onSnapshot),
 *   evitando lecturas masivas cada vez que un estudiante consulta una tarea.
 */

import { collection, getDocs, doc, updateDoc, query, orderBy, limit } from 'firebase/firestore';
import { db, UserProfile, clearCachedUserProfile } from './firebase';

/**
 * Obtiene la lista de usuarios registrados bajo demanda con límite controlado
 */
export async function fetchAllUsers(limitCount: number = 100): Promise<UserProfile[]> {
  const usersRef = collection(db, 'users');
  try {
    const q = query(usersRef, orderBy('createdAt', 'desc'), limit(limitCount));
    const snap = await getDocs(q);
    const users: UserProfile[] = [];
    snap.forEach((docSnap) => {
      users.push(docSnap.data() as UserProfile);
    });
    return users;
  } catch (err) {
    console.warn('Fallback sin índice en admin:', err);
    try {
      const fallbackQuery = query(usersRef, limit(limitCount));
      const snap = await getDocs(fallbackQuery);
      const fallbackUsers: UserProfile[] = [];
      snap.forEach((d) => fallbackUsers.push(d.data() as UserProfile));
      return fallbackUsers;
    } catch (e) {
      console.error('Error al obtener lista de usuarios en admin:', e);
      return [];
    }
  }
}

/**
 * Función de compatibilidad para cargar la lista de usuarios una sola vez sin listener persistente
 */
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

/**
 * Activa la suscripción mensual de 30 días para un usuario tras confirmar su pago
 */
export async function activateUserSubscription(userId: string, days: number = 30): Promise<void> {
  const userRef = doc(db, 'users', userId);
  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
  const d = new Date();
  const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  await updateDoc(userRef, {
    isSubscriptionActive: true,
    subscriptionDaysRemaining: days,
    subscriptionExpiresAt: expiresAt,
    maxDailyUsages: 9999, // Suscripción con consultas ilimitadas
    maxUsages: 9999,
    dailyUsageDate: today,
    dailyUsagesUsed: 0,
    usagesUsed: 0,
    updatedAt: new Date().toISOString(),
  });
  clearCachedUserProfile(userId);
}

/**
 * Desactiva o pausa la suscripción de un usuario
 */
export async function deactivateUserSubscription(userId: string): Promise<void> {
  const userRef = doc(db, 'users', userId);

  await updateDoc(userRef, {
    isSubscriptionActive: false,
    subscriptionDaysRemaining: 0,
    subscriptionExpiresAt: null,
    maxDailyUsages: 0,
    maxUsages: 3,
    updatedAt: new Date().toISOString(),
  });
  clearCachedUserProfile(userId);
}

/**
 * Reinicia los 3 usos de prueba gratuitos para un usuario
 */
export async function resetUserTrial(userId: string): Promise<void> {
  const userRef = doc(db, 'users', userId);

  await updateDoc(userRef, {
    isSubscriptionActive: false,
    usagesUsed: 0,
    maxUsages: 3,
    dailyUsagesUsed: 0,
    updatedAt: new Date().toISOString(),
  });
  clearCachedUserProfile(userId);
}

/**
 * Añade días adicionales a una suscripción existente
 */
export async function addDaysToSubscription(
  userId: string,
  currentExpiresAt: string | null | undefined,
  additionalDays: number
): Promise<void> {
  const userRef = doc(db, 'users', userId);
  const baseTime = currentExpiresAt ? new Date(currentExpiresAt).getTime() : Date.now();
  const newExpiresAt = new Date(baseTime + additionalDays * 24 * 60 * 60 * 1000).toISOString();
  const daysDiff = Math.max(0, Math.ceil((new Date(newExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

  await updateDoc(userRef, {
    isSubscriptionActive: true,
    subscriptionDaysRemaining: daysDiff,
    subscriptionExpiresAt: newExpiresAt,
    updatedAt: new Date().toISOString(),
  });
  clearCachedUserProfile(userId);
}
