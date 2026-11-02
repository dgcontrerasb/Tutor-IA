/**
 * Servicio de control de usos para Tutor-IA
 * En la versión actual las consultas son ILIMITADAS para todos los estudiantes
 * mediante la combinación de la IA e IA Fallback con la Base de Conocimientos Escolar Abierta.
 */

import { UserUsage } from '../types';

export const DEFAULT_TRIAL_USAGES = 999;
const USAGE_STORAGE_KEY = 'tutor_ia_usages_count';
const LEGACY_USAGE_STORAGE_KEY = 'cuaderno_pop_usages_count';

/**
 * Obtiene el estado de usos (Consultas Ilimitadas por defecto)
 */
export function getUsage(): UserUsage {
  try {
    const raw = localStorage.getItem(USAGE_STORAGE_KEY) || localStorage.getItem(LEGACY_USAGE_STORAGE_KEY);
    const used = raw ? Math.max(0, parseInt(raw, 10) || 0) : 0;
    return {
      usagesUsed: used,
      maxUsages: 999,
      remainingUsages: 999,
      isSubscriptionActive: true,
      subscriptionDaysRemaining: 30,
    };
  } catch {
    return {
      usagesUsed: 0,
      maxUsages: 999,
      remainingUsages: 999,
      isSubscriptionActive: true,
      subscriptionDaysRemaining: 30,
    };
  }
}

/**
 * Registra un uso completado
 */
export function recordUsage(): UserUsage {
  try {
    const current = getUsage();
    const nextUsed = current.usagesUsed + 1;
    localStorage.setItem(USAGE_STORAGE_KEY, nextUsed.toString());
    return {
      usagesUsed: nextUsed,
      maxUsages: 999,
      remainingUsages: 999,
      isSubscriptionActive: true,
      subscriptionDaysRemaining: 30,
    };
  } catch {
    return getUsage();
  }
}

/**
 * Reinicia el contador de usos (solo desarrollo)
 */
export function resetUsages(): UserUsage {
  try {
    localStorage.removeItem(USAGE_STORAGE_KEY);
  } catch {
    // ignorar
  }
  return getUsage();
}

/**
 * Indica si el usuario aún tiene usos disponibles (Siempre true para acceso libre)
 */
export function canUse(): boolean {
  return true;
}
