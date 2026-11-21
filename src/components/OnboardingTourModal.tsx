/**
 * Tutorial Inicial de Uso (Onboarding Tour) — Tutor-IA
 * - Se dispara automáticamente solo la primera vez que el usuario inicia sesión en el espacio de trabajo.
 * - Basado 100% en las funciones reales del proyecto (sin inventar funciones ni librerías externas).
 * - Saltable desde el primer paso y reabrible manualmente cuando el estudiante lo necesite.
 */

import React, { useState, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft, BookOpen, Camera, FileDown, Check } from 'lucide-react';

interface OnboardingTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName?: string;
}

const TOUR_STEPS = [
  {
    step: 1,
    icon: BookOpen,
    accentBg: 'bg-blue-50 border-blue-200 text-blue-600',
    title: '1. Elige tu materia y nivel escolar',
    description:
      'Selecciona cualquiera de las 18 asignaturas en el panel lateral y alterna entre Primaria o Secundaria para que el tutor adapte el lenguaje a tu grado.',
    tip: 'En celular, toca "Cambiar" arriba del formulario para abrir la lista de materias.',
  },
  {
    step: 2,
    icon: Camera,
    accentBg: 'bg-amber-50 border-amber-200 text-amber-600',
    title: '2. Escribe tu duda o sube una foto del cuaderno',
    description:
      'Redacta tu pregunta, pega un texto para corregir ortografía o adjunta una foto/PDF de tu ejercicio manuscrito. Luego elige qué ayuda necesitas y si la prefieres Resumida o Detallada.',
    tip: 'Las fotos y PDFs están optimizados para matemáticas, física, química y diagramas.',
  },
  {
    step: 3,
    icon: FileDown,
    accentBg: 'bg-emerald-50 border-emerald-200 text-emerald-600',
    title: '3. Repasa en Mi Cuaderno o descarga en PDF',
    description:
      'Tu explicación paso a paso se guarda automáticamente en el botón "Mi Cuaderno" (abajo a la derecha) para que puedas repasarla después sin gastar consultas, o descargarla en PDF para imprimir.',
    tip: 'Puedes volver a ver esta guía cuando quieras desde el menú de Ayuda.',
  },
];

export const OnboardingTourModal: React.FC<OnboardingTourModalProps> = ({
  isOpen,
  onClose,
  studentName,
}) => {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    setStepIndex(0);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const current = TOUR_STEPS[stepIndex];
  const Icon = current.icon;
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === TOUR_STEPS.length - 1;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/55 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-tour-title"
    >
      <div className="relative w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-5 text-left">
        {/* Cabecera */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${current.accentBg}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 block">
                {studentName ? `Bienvenido, ${studentName}` : 'Guía rápida de Tutor-IA'}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Paso {current.step} de {TOUR_STEPS.length}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer transition-colors"
            aria-label="Cerrar guía inicial"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Contenido del paso */}
        <div className="space-y-2.5">
          <h3 id="onboarding-tour-title" className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
            {current.title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {current.description}
          </p>
          <p className="text-[11px] text-slate-500 bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 leading-snug">
            💡 {current.tip}
          </p>
        </div>

        {/* Indicadores de progreso */}
        <div className="flex items-center justify-center gap-1.5 pt-1">
          {TOUR_STEPS.map((s, idx) => (
            <span
              key={s.step}
              className={`h-1.5 rounded-full transition-all ${
                idx === stepIndex ? 'w-6 bg-blue-600' : 'w-1.5 bg-slate-200'
              }`}
            />
          ))}
        </div>

        {/* Controles */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
          {isFirst ? (
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer transition-colors"
            >
              Saltar guía
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setStepIndex((prev) => Math.max(0, prev - 1))}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Anterior</span>
            </button>
          )}

          {isLast ? (
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Check className="w-3.5 h-3.5" />
              <span>¡Entendido, empezar!</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setStepIndex((prev) => Math.min(TOUR_STEPS.length - 1, prev + 1))}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <span>Siguiente</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
