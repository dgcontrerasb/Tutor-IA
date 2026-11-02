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
    <div className="relative overflow-hidden rounded-2xl border-[2.5px] border-[#1A1A1A] shadow-[4px_4px_0px_#1A1A1A] bg-gradient-to-r from-[#FFE66D] via-[#FAF7EE] to-[#A8E6CF] p-3.5 sm:p-4 animate-in fade-in zoom-in-95 duration-200">
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
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] flex items-center justify-center shrink-0">
            <Award className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-sm sm:text-base font-black text-[#1A1A1A]">
                {isPrimaria
                  ? '¡Súper trabajo! Tu tarea está lista 🌟'
                  : '¡Excelente! Tu guía de estudio está lista 🎯'}
              </span>
            </div>
            <p className="text-xs font-bold text-[#1A1A1A]/80">
              {isPrimaria
                ? `Ganaste una estrella de estudio en ${subjectName} y se guardó en Mi Cuaderno.`
                : `Revisión de ${subjectName} completada y guardada automáticamente en Mi Cuaderno.`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] text-xs font-black text-[#1A1A1A]">
          <Star className="w-4 h-4 fill-[#FFE66D] text-[#1A1A1A]" />
          <Star className="w-4 h-4 fill-[#FFE66D] text-[#1A1A1A]" />
          <Star className="w-4 h-4 fill-[#FFE66D] text-[#1A1A1A]" />
          <span className="ml-1">{isPrimaria ? '¡Genial!' : 'Completado'}</span>
        </div>
      </div>
    </div>
  );
};
