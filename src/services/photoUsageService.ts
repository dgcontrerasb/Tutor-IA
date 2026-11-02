/**
 * Servicio de control de cuota diaria de fotos para Tutor-IA
 * Límite estricto de 5 fotos por día por estudiante.
 */

const PHOTO_USAGE_STORAGE_KEY = 'tutor_ia_photo_usage';
const LEGACY_PHOTO_USAGE_STORAGE_KEY = 'cuaderno_pop_photo_usage';
export const MAX_DAILY_PHOTOS = 5;

export interface PhotoUsageState {
  date: string;
  used: number;
  max: number;
  remaining: number;
}

function getTodayString(): string {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

export function getPhotoUsageToday(): PhotoUsageState {
  try {
    const todayStr = getTodayString();
    const raw = localStorage.getItem(PHOTO_USAGE_STORAGE_KEY) || localStorage.getItem(LEGACY_PHOTO_USAGE_STORAGE_KEY);

    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.date === todayStr && typeof parsed.used === 'number') {
        const used = Math.max(0, parsed.used);
        return {
          date: todayStr,
          used: used,
          max: MAX_DAILY_PHOTOS,
          remaining: Math.max(0, MAX_DAILY_PHOTOS - used),
        };
      }
    }

    // Nuevo día o primer uso
    const initialState = {
      date: todayStr,
      used: 0,
      max: MAX_DAILY_PHOTOS,
      remaining: MAX_DAILY_PHOTOS,
    };
    localStorage.setItem(PHOTO_USAGE_STORAGE_KEY, JSON.stringify({ date: todayStr, used: 0 }));
    return initialState;
  } catch {
    return {
      date: getTodayString(),
      used: 0,
      max: MAX_DAILY_PHOTOS,
      remaining: MAX_DAILY_PHOTOS,
    };
  }
}

export function canUploadPhoto(): boolean {
  const usage = getPhotoUsageToday();
  return usage.remaining > 0;
}

export function recordPhotoUpload(): PhotoUsageState {
  try {
    const todayStr = getTodayString();
    const current = getPhotoUsageToday();
    const nextUsed = Math.min(MAX_DAILY_PHOTOS, current.used + 1);

    localStorage.setItem(
      PHOTO_USAGE_STORAGE_KEY,
      JSON.stringify({ date: todayStr, used: nextUsed })
    );

    return {
      date: todayStr,
      used: nextUsed,
      max: MAX_DAILY_PHOTOS,
      remaining: Math.max(0, MAX_DAILY_PHOTOS - nextUsed),
    };
  } catch {
    return getPhotoUsageToday();
  }
}
