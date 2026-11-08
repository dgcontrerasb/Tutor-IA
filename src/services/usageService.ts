/**
 * Servicio de control de usos para Tutor-IA
 * 1 Día de prueba gratuita completa (24 horas) para nuevos estudiantes.
 */

import { UserUsage } from '../types';

export const DEFAULT_TRIAL_USAGES = 999;
const USAGE_STORAGE_KEY = 'tutor_ia_usages_count';
const LEGACY_USAGE_STORAGE_KEY = 'cuaderno_pop_usages_count';

/**
 * Obtiene el estado de usos (3 consultas de prueba por defecto para visitantes no registrados)
 */
export function getUsage(): UserUsage {
  try {
    const raw = localStorage.getItem(USAGE_STORAGE_KEY) || localStorage.getItem(LEGACY_USAGE_STORAGE_KEY);
    const used = raw ? Math.max(0, parseInt(raw, 10) || 0) : 0;
    const remaining = Math.max(0, DEFAULT_TRIAL_USAGES - used);
    return {
      usagesUsed: used,
      maxUsages: DEFAULT_TRIAL_USAGES,
      remainingUsages: remaining,
      isSubscriptionActive: false,
      subscriptionDaysRemaining: 0,
    };
  } catch {
    return {
      usagesUsed: 0,
      maxUsages: DEFAULT_TRIAL_USAGES,
      remainingUsages: DEFAULT_TRIAL_USAGES,
      isSubscriptionActive: false,
      subscriptionDaysRemaining: 0,
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
    const remaining = Math.max(0, DEFAULT_TRIAL_USAGES - nextUsed);
    return {
      usagesUsed: nextUsed,
      maxUsages: DEFAULT_TRIAL_USAGES,
      remainingUsages: remaining,
      isSubscriptionActive: false,
      subscriptionDaysRemaining: 0,
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
