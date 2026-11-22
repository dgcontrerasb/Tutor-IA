/**
 * Tour Guiado Interactivo con Spotlight Fluido (5 pasos) — Tutor-IA
 * - Recorte SVG con esquinas redondeadas exactas (cero esquinas rectas detrás del borde).
 * - Fondo suavemente difuminado + transiciones fluidas cubic-bezier(0.22, 1, 0.36, 1).
 * - Se dispara solo al iniciar sesión la primera vez; reabrible desde la cabecera.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  X,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  GraduationCap,
  Camera,
  SlidersHorizontal,
  BookmarkCheck,
  Check,
} from 'lucide-react';

interface OnboardingTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName?: string;
}

interface TourStep {
  step: number;
  target: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  accentBg: string;
  title: string;
  description: string;
  preferredSide: 'right' | 'bottom' | 'top' | 'left';
}

const TOUR_STEPS: TourStep[] = [
  {
    step: 1,
    target: 'subjects',
    badge: 'Materias Escolares',
    icon: BookOpen,
    accentBg: 'bg-blue-50 border-blue-200 text-blue-600',
    title: 'Elige cualquiera de las 18 materias',
    description:
      'Empieza seleccionando la asignatura de tu tarea. El tutor ajustará automáticamente el enfoque pedagógico y las opciones de ayuda para esa materia.',
    preferredSide: 'right',
  },
  {
    step: 2,
    target: 'grade-level',
    badge: 'Nivel Escolar',
    icon: GraduationCap,
    accentBg: 'bg-amber-50 border-amber-200 text-amber-600',
    title: 'Alterna entre Primaria y Secundaria',
    description:
      'Cambia el nivel en un clic: Primaria explica con ejemplos sencillos y cotidianos; Secundaria profundiza en fórmulas, argumentación y análisis.',
    preferredSide: 'bottom',
  },
  {
    step: 3,
    target: 'input-zone',
    badge: 'Texto o Foto',
    icon: Camera,
    accentBg: 'bg-blue-50 border-blue-200 text-blue-600',
    title: 'Escribe tu duda o adjunta una foto',
    description:
      'Redacta tu pregunta, pega un texto para revisar ortografía o sube una foto/PDF de tu cuaderno manuscrito (ideal para matemáticas, física y química).',
    preferredSide: 'right',
  },
  {
    step: 4,
    target: 'options-submit',
    badge: 'Opciones y Revisión',
    icon: SlidersHorizontal,
    accentBg: 'bg-indigo-50 border-indigo-200 text-indigo-600',
    title: 'Personaliza la ayuda y revisa tu tarea',
    description:
      'Marca qué necesitas (corrección, pasos, resumen), elige si la prefieres Resumida o Detallada y pulsa el botón azul para generar tu ficha en segundos.',
    preferredSide: 'right',
  },
  {
    step: 5,
    target: 'notebook',
    badge: 'Mi Cuaderno',
    icon: BookmarkCheck,
    accentBg: 'bg-emerald-50 border-emerald-200 text-emerald-600',
    title: 'Repasa tus fichas y descarga en PDF',
    description:
      'Cada tarea revisada se guarda aquí automáticamente. Puedes abrirla cuando quieras para estudiar sin gastar consultas o descargarla lista para imprimir.',
    preferredSide: 'top',
  },
];

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const SPOTLIGHT_RADIUS = 16;
const SMOOTH_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

function findVisibleTarget(targetName: string): HTMLElement | null {
  const nodes = document.querySelectorAll<HTMLElement>(`[data-tour="${targetName}"]`);
  for (const el of Array.from(nodes)) {
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) {
      return el;
    }
  }
  return null;
}

export const OnboardingTourModal: React.FC<OnboardingTourModalProps> = ({
  isOpen,
  onClose,
  studentName,
}) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [rect, setRect] = useState<TargetRect | null>(null);
  const [viewport, setViewport] = useState({ w: window.innerWidth, h: window.innerHeight });
  const rafRef = useRef<number | null>(null);

  const current = TOUR_STEPS[stepIndex];

  const measureTarget = useCallback(() => {
    setViewport({ w: window.innerWidth, h: window.innerHeight });
    const el = findVisibleTarget(current.target);
    if (!el) {
      setRect(null);
      return;
    }
    const r = el.getBoundingClientRect();
    const pad = 6;
    const clampedTop = Math.max(6, r.top - pad);
    const clampedLeft = Math.max(6, r.left - pad);
    const clampedRight = Math.min(window.innerWidth - 6, r.right + pad);
    const clampedBottom = Math.min(window.innerHeight - 6, r.bottom + pad);

    setRect({
      top: clampedTop,
      left: clampedLeft,
      width: Math.max(0, clampedRight - clampedLeft),
      height: Math.max(0, clampedBottom - clampedTop),
    });
  }, [current.target]);

  // Reiniciar al abrir y escuchar Escape
  useEffect(() => {
    if (!isOpen) return;
    setStepIndex(0);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Scroll suave + seguimiento fluido con requestAnimationFrame (sin saltos toscos)
  useEffect(() => {
    if (!isOpen) return;
    const el = findVisibleTarget(current.target);
    if (el) {
      const r = el.getBoundingClientRect();
      const isFullyVisible = r.top >= 64 && r.bottom <= window.innerHeight - 24;
      if (!isFullyVisible) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
      }
    }

    const scheduleMeasure = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(measureTarget);
    };

    scheduleMeasure();
    const settleTimer = window.setTimeout(scheduleMeasure, 320);

    window.addEventListener('resize', scheduleMeasure);
    window.addEventListener('scroll', scheduleMeasure, true);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.clearTimeout(settleTimer);
      window.removeEventListener('resize', scheduleMeasure);
      window.removeEventListener('scroll', scheduleMeasure, true);
    };
  }, [isOpen, current.target, measureTarget]);

  if (!isOpen) return null;

  const Icon = current.icon;
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === TOUR_STEPS.length - 1;

  const cardWidth = Math.min(360, viewport.w - 24);
  const estimatedCardHeight = 235;
  const gap = 16;

  const getPopoverStyle = (): React.CSSProperties => {
    const baseTransition = `transform 420ms ${SMOOTH_EASE}, opacity 300ms ease`;

    if (!rect) {
      return {
        top: 0,
        left: 0,
        transform: `translate3d(${Math.round((viewport.w - cardWidth) / 2)}px, ${Math.round(
          (viewport.h - estimatedCardHeight) / 2
        )}px, 0)`,
        width: `${cardWidth}px`,
        transition: baseTransition,
      };
    }

    const spaceRight = viewport.w - (rect.left + rect.width);
    const spaceLeft = rect.left;
    const spaceBottom = viewport.h - (rect.top + rect.height);
    const spaceTop = rect.top;

    let top = 16;
    let left = 12;

    if (current.preferredSide === 'right' && spaceRight >= cardWidth + gap + 12) {
      left = rect.left + rect.width + gap;
      top = rect.top + rect.height / 2 - estimatedCardHeight / 2;
    } else if (current.preferredSide === 'top' && spaceTop >= estimatedCardHeight + gap + 12) {
      top = rect.top - estimatedCardHeight - gap;
      left = rect.left + rect.width - cardWidth;
    } else if (spaceBottom >= estimatedCardHeight + gap + 12) {
      top = rect.top + rect.height + gap;
      left = rect.left + rect.width / 2 - cardWidth / 2;
    } else if (spaceTop >= estimatedCardHeight + gap + 12) {
      top = rect.top - estimatedCardHeight - gap;
      left = rect.left + rect.width / 2 - cardWidth / 2;
    } else if (spaceRight >= cardWidth + gap + 12) {
      left = rect.left + rect.width + gap;
      top = 16;
    } else if (spaceLeft >= cardWidth + gap + 12) {
      left = rect.left - cardWidth - gap;
      top = rect.top;
    } else {
      left = (viewport.w - cardWidth) / 2;
      top = rect.top > viewport.h / 2 ? 16 : viewport.h - estimatedCardHeight - 16;
    }

    const safeLeft = Math.round(Math.max(12, Math.min(viewport.w - cardWidth - 12, left)));
    const safeTop = Math.round(Math.max(12, Math.min(viewport.h - estimatedCardHeight - 12, top)));

    return {
      top: 0,
      left: 0,
      transform: `translate3d(${safeLeft}px, ${safeTop}px, 0)`,
      width: `${cardWidth}px`,
      transition: baseTransition,
    };
  };

  return (
    <div
      className="fixed inset-0 z-50 animate-in fade-in duration-300"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-tour-title"
    >
      {/* 1. Capa de difuminado suave con máscara SVG redondeada exacta (cero esquinas rectas detrás) */}
      <svg
        className="fixed inset-0 w-0 h-0 pointer-events-none"
        aria-hidden="true"
      >
        <defs>
          <mask id="tutor-spotlight-cutout">
            <rect x="0" y="0" width={viewport.w} height={viewport.h} fill="white" />
            {rect && (
              <rect
                x={rect.left}
                y={rect.top}
                width={rect.width}
                height={rect.height}
                rx={SPOTLIGHT_RADIUS}
                ry={SPOTLIGHT_RADIUS}
                fill="black"
                style={{
                  transition: `x 420ms ${SMOOTH_EASE}, y 420ms ${SMOOTH_EASE}, width 420ms ${SMOOTH_EASE}, height 420ms ${SMOOTH_EASE}`,
                }}
              />
            )}
          </mask>
        </defs>
      </svg>

      {/* Fondo suavemente oscurecido y difuminado recortado con el borde redondeado exacto */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2.5px] transition-opacity duration-300"
        style={{
          mask: 'url(#tutor-spotlight-cutout)',
          WebkitMask: 'url(#tutor-spotlight-cutout)',
        }}
      />

      {/* 2. Aro luminoso de enfoque que se desliza suavemente con la misma curvatura */}
      {rect && (
        <div
          className="fixed pointer-events-none rounded-2xl ring-2 ring-blue-500 shadow-[0_0_0_5px_rgba(37,99,235,0.20)]"
          style={{
            top: `${rect.top}px`,
            left: `${rect.left}px`,
            width: `${rect.width}px`,
            height: `${rect.height}px`,
            borderRadius: `${SPOTLIGHT_RADIUS}px`,
            transition: `top 420ms ${SMOOTH_EASE}, left 420ms ${SMOOTH_EASE}, width 420ms ${SMOOTH_EASE}, height 420ms ${SMOOTH_EASE}`,
          }}
        >
          <span className="absolute -top-3 left-3.5 px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold shadow-sm tracking-wide">
            Paso {current.step} · {current.badge}
          </span>
        </div>
      )}

      {/* 3. Tarjeta explicativa flotante con desplazamiento GPU-acelerado (translate3d) */}
      <div
        style={getPopoverStyle()}
        className="fixed z-10 bg-white rounded-2xl border border-slate-200/90 shadow-2xl p-5 space-y-4 text-left"
      >
        <div key={current.step} className="space-y-3 motion-panel-swap">
          <div className="flex items-start justify-between gap-2.5">
            <div className="flex items-center gap-2.5">
              <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${current.accentBg}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block">
                  {studentName && isFirst ? `¡Hola, ${studentName}!` : `Paso ${current.step} de ${TOUR_STEPS.length}`}
                </span>
                <h3 id="onboarding-tour-title" className="text-sm font-bold text-slate-900 leading-snug">
                  {current.title}
                </h3>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 cursor-pointer transition-colors shrink-0"
              aria-label="Cerrar guía"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            {current.description}
          </p>
        </div>

        {/* Barra de progreso y botones */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-2">
          <div className="flex items-center gap-1">
            {TOUR_STEPS.map((s, idx) => (
              <span
                key={s.step}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === stepIndex ? 'w-5 bg-blue-600' : idx < stepIndex ? 'w-1.5 bg-blue-300' : 'w-1.5 bg-slate-200'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            {isFirst ? (
              <button
                type="button"
                onClick={onClose}
                className="px-2.5 py-1.5 text-[11px] font-semibold text-slate-500 hover:text-slate-800 cursor-pointer transition-colors"
              >
                Saltar
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setStepIndex((prev) => Math.max(0, prev - 1))}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Atrás</span>
              </button>
            )}

            {isLast ? (
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg text-[11px] font-bold shadow-xs flex items-center gap-1 cursor-pointer transition-all"
              >
                <Check className="w-3 h-3" />
                <span>¡Listo!</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setStepIndex((prev) => Math.min(TOUR_STEPS.length - 1, prev + 1))}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-bold shadow-xs flex items-center gap-1 cursor-pointer transition-all"
              >
                <span>Siguiente</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
