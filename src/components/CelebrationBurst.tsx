/**
 * Efecto de Celebración Escolar con Estrellas y Mensaje de Felicitación
 * Se activa cuando el niño/estudiante completa la revisión de una tarea.
 */

import React, { useEffect, useState } from 'react';
import { Star, Sparkles, Award } from 'lucide-react';
import { GradeLevel } from '../types';

interface CelebrationBurstProps {
  triggerKey: string | number | null;
  gradeLevel: GradeLevel;
  subjectName: string;
}

const CONFETTI_PIECES = [
  { id: 1, emoji: '⭐', left: '8%', delay: '0ms', duration: '1100ms' },
  { id: 2, emoji: '✨', left: '18%', delay: '80ms', duration: '1250ms' },
  { id: 3, emoji: '🌟', left: '30%', delay: '40ms', duration: '1150ms' },
  { id: 4, emoji: '🎉', left: '44%', delay: '120ms', duration: '1300ms' },
  { id: 5, emoji: '🏆', left: '56%', delay: '30ms', duration: '1200ms' },
  { id: 6, emoji: '⭐', left: '70%', delay: '90ms', duration: '1150ms' },
  { id: 7, emoji: '✨', left: '82%', delay: '50ms', duration: '1250ms' },
  { id: 8, emoji: '🌟', left: '92%', delay: '110ms', duration: '1100ms' },
];

export const CelebrationBurst: React.FC<CelebrationBurstProps> = ({
  triggerKey,
  gradeLevel,
  subjectName,
}) => {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (!triggerKey) return;
    setShowConfetti(true);
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 2200);
    return () => clearTimeout(timer);
  }, [triggerKey]);

  const isPrimaria = gradeLevel === 'primaria';

  return (
    <div className="relative overflow-hidden rounded-2xl border border-emerald-200/90 shadow-xs bg-gradient-to-r from-emerald-50/90 via-white to-blue-50/80 p-3.5 sm:p-4 animate-in fade-in zoom-in-95 duration-200">
      {/* Lluvia ligera de estrellas animadas */}
      {showConfetti && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden z-20" aria-hidden="true">
          {CONFETTI_PIECES.map((piece) => (
            <span
              key={piece.id}
              style={{
                left: piece.left,
                animationDelay: piece.delay,
                animationDuration: piece.duration,
              }}
              className="absolute top-0 text-lg sm:text-xl star-burst-particle"
            >
              {piece.emoji}
            </span>
          ))}
        </div>
      )}

      <div className="relative z-10 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-amber-50 border border-amber-200/90 flex items-center justify-center shrink-0 shadow-2xs">
            <Award className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-sm sm:text-base font-bold text-slate-900">
                {isPrimaria
                  ? '¡Súper trabajo! Tu tarea está lista 🌟'
                  : '¡Excelente! Tu guía de estudio está lista 🎯'}
              </span>
            </div>
            <p className="text-xs font-medium text-slate-600">
              {isPrimaria
                ? `Ganaste una estrella de estudio en ${subjectName} y se guardó en Mi Cuaderno.`
                : `Revisión de ${subjectName} completada y guardada automáticamente en Mi Cuaderno.`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-2xs text-xs font-bold text-slate-800">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
          <span className="ml-1">{isPrimaria ? '¡Genial!' : 'Completado'}</span>
        </div>
      </div>
    </div>
  );
};
