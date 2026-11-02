/**
 * Tarjeta Amigable de Tarea No Escolar / Guardrail Pedagógico
 * Se muestra cuando la IA detecta con cariño y respeto que la consulta
 * no corresponde a una tarea o actividad escolar (redacciones, cuentos, ortografía, etc.).
 * Aclara al estudiante que su cupo NO fue descontado y lo orienta de forma amigable.
 */

import React from 'react';
import { BookOpen, Sparkles, CheckCircle2, RotateCcw, HelpCircle } from 'lucide-react';

interface SchoolGuardrailCardProps {
  rejectionReason?: string;
  onReset?: () => void;
}

export const SchoolGuardrailCard: React.FC<SchoolGuardrailCardProps> = ({
  rejectionReason,
  onReset,
}) => {
  return (
    <div className="relative bg-[#FFF9E6] rounded-2xl border-[3px] border-[#1A1A1A] shadow-[6px_6px_0px_#1A1A1A] p-5 sm:p-6 overflow-hidden animate-in fade-in duration-200">
      {/* Cinta adhesiva decorativa pop */}
      <div className="washi-tape top-2.5 left-8 w-24"></div>
      <div className="washi-tape washi-tape-coral top-2.5 right-8 w-20"></div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 mt-2">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#FFE66D] border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] flex items-center justify-center shrink-0 text-2xl">
            🎒
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="inline-block text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#A8E6CF] border border-[#1A1A1A]">
                Tutor Escolar Tutor-IA
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-[#1A1A1A]">
              Esta tarea no se pudo generar
            </h3>
          </div>
        </div>

        {/* Insignia destacada de que NO se cobró el uso */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#A8E6CF] border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] text-xs font-black text-[#1A1A1A]">
          <CheckCircle2 className="w-4 h-4 text-emerald-800 shrink-0" />
          <span>¡Tu uso diario NO fue descontado!</span>
        </div>
      </div>

      {/* Explicación amigable y detallada de por qué no se pudo generar */}
      <div className="bg-white rounded-xl border-2 border-[#1A1A1A] p-4 sm:p-5 shadow-[3px_3px_0px_#1A1A1A] mb-4 space-y-2">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-800">
          <HelpCircle className="w-4 h-4" />
          <span>¿Por qué no se procesó esta consulta?</span>
        </div>
        <p className="text-xs sm:text-sm font-bold text-[#1A1A1A] leading-relaxed">
          {rejectionReason ||
            'Tutor-IA es un tutor escolar creado exclusivamente para acompañar a estudiantes en sus deberes escolares, cuentos, ortografía, redacciones y resúmenes de lectura.'}
        </p>
      </div>

      {/* Qué tareas sí se admiten y cómo continuar */}
      <div className="bg-[#FAF7EE] rounded-xl border-2 border-[#1A1A1A] p-4 text-xs font-bold text-[#1A1A1A] mb-4 space-y-2.5">
        <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#1A1A1A]">
          <BookOpen className="w-4 h-4 text-amber-700" />
          <span>¿Qué puedes revisar aquí con tu tutor escolar?</span>
        </div>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] sm:text-xs">
          <li className="flex items-start gap-2 bg-white/70 p-2 rounded-lg border border-[#1A1A1A]/20">
            <span className="text-emerald-700 font-black">✓</span>
            <span>Cuentos, fábulas y redacciones escolares</span>
          </li>
          <li className="flex items-start gap-2 bg-white/70 p-2 rounded-lg border border-[#1A1A1A]/20">
            <span className="text-emerald-700 font-black">✓</span>
            <span>Fotos de tu cuaderno con letra manuscrita</span>
          </li>
          <li className="flex items-start gap-2 bg-white/70 p-2 rounded-lg border border-[#1A1A1A]/20">
            <span className="text-emerald-700 font-black">✓</span>
            <span>Corrección de ortografía, tildes y puntuación</span>
          </li>
          <li className="flex items-start gap-2 bg-white/70 p-2 rounded-lg border border-[#1A1A1A]/20">
            <span className="text-emerald-700 font-black">✓</span>
            <span>Resúmenes y análisis de lecturas de clase</span>
          </li>
        </ul>
      </div>

      {/* Botón de acción para cambiar el texto o foto */}
      {onReset && (
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={onReset}
            className="neo-btn w-full sm:w-auto px-5 py-2.5 bg-[#FFE66D] hover:bg-[#fedd48] text-[#1A1A1A] text-xs sm:text-sm font-black rounded-xl cursor-pointer flex items-center justify-center gap-2 shadow-[3px_3px_0px_#1A1A1A]"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Ingresar un deber escolar o subir otra foto</span>
          </button>
          <span className="text-[11px] font-bold text-[#1A1A1A]/70 text-center sm:text-left">
            ¡Inténtalo con cualquier tarea del colegio!
          </span>
        </div>
      )}
    </div>
  );
};
