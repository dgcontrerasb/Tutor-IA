/**
 * Selector de Profundidad de Respuesta Escolar (Pill Switch Neubrutalista)
 * Permite a los estudiantes elegir entre:
 * - ⚡ Resumido (Rápido y al grano)
 * - 📚 Detallado y Extenso (Explicación a fondo, múltiples ejemplos, glosario y pasos exhaustivos)
 */

import React from 'react';
import { Zap, BookOpen, Check, Sparkles } from 'lucide-react';
import { ResponseDepth, GradeLevel } from '../types';

interface ResponseDepthSelectorProps {
  responseDepth: ResponseDepth;
  onChange: (depth: ResponseDepth) => void;
  disabled?: boolean;
  gradeLevel?: GradeLevel;
}

export const ResponseDepthSelector: React.FC<ResponseDepthSelectorProps> = ({
  responseDepth,
  onChange,
  disabled = false,
  gradeLevel = 'primaria',
}) => {
  const isConcise = responseDepth === 'concise';
  const isDetailed = responseDepth === 'detailed';

  return (
    <div className="w-full space-y-2.5">
      {/* Encabezado descriptivo */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-base sm:text-lg">📖</span>
          <span className="text-xs sm:text-sm font-black text-[#1A1A1A] uppercase tracking-wider">
            ¿Cómo prefieres la explicación?
          </span>
        </div>
        <span className="text-[11px] font-bold text-[#1A1A1A]/70 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Elige la profundidad para tu tarea</span>
        </span>
      </div>

      {/* Grid táctil de dos opciones */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {/* Opción 1: Resumido Rápido */}
        <button
          type="button"
          onClick={() => onChange('concise')}
          disabled={disabled}
          className={`neo-tag-btn relative p-3 sm:p-3.5 rounded-xl border-2 border-[#1A1A1A] text-left transition-all cursor-pointer flex items-start gap-3 ${
            isConcise
              ? 'bg-[#FFE66D] shadow-[3px_3px_0px_#1A1A1A] scale-[1.01]'
              : 'bg-white hover:bg-[#FAF7EE] shadow-[2px_2px_0px_#1A1A1A] opacity-80'
          }`}
          aria-pressed={isConcise}
        >
          <div
            className={`w-7 h-7 rounded-lg border-2 border-[#1A1A1A] flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
              isConcise ? 'bg-[#1A1A1A] text-[#FFE66D]' : 'bg-[#FAF7EE] text-[#1A1A1A]'
            }`}
          >
            {isConcise ? <Check className="w-4 h-4 stroke-[3]" /> : <Zap className="w-4 h-4" />}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 justify-between">
              <span className="text-xs sm:text-sm font-black text-[#1A1A1A] flex items-center gap-1.5">
                <span>⚡ Resumido y Rápido</span>
              </span>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-white/80 border border-[#1A1A1A] text-[#1A1A1A]">
                Al grano
              </span>
            </div>
            <p className="text-[11px] sm:text-xs font-semibold text-[#1A1A1A]/85 mt-1 leading-snug">
              {gradeLevel === 'primaria'
                ? 'Respuesta cortita y directa de 2 a 3 líneas con lo más importante para repasar rápido.'
                : 'Definición esencial, síntesis conceptual y puntos clave sin rodeos para repaso veloz.'}
            </p>
          </div>
        </button>

        {/* Opción 2: Detallado y Extenso */}
        <button
          type="button"
          onClick={() => onChange('detailed')}
          disabled={disabled}
          className={`neo-tag-btn relative p-3 sm:p-3.5 rounded-xl border-2 border-[#1A1A1A] text-left transition-all cursor-pointer flex items-start gap-3 ${
            isDetailed
              ? 'bg-[#A8E6CF] shadow-[3px_3px_0px_#1A1A1A] scale-[1.01]'
              : 'bg-white hover:bg-[#FAF7EE] shadow-[2px_2px_0px_#1A1A1A] opacity-80'
          }`}
          aria-pressed={isDetailed}
        >
          <div
            className={`w-7 h-7 rounded-lg border-2 border-[#1A1A1A] flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
              isDetailed ? 'bg-[#1A1A1A] text-[#A8E6CF]' : 'bg-[#FAF7EE] text-[#1A1A1A]'
            }`}
          >
            {isDetailed ? <Check className="w-4 h-4 stroke-[3]" /> : <BookOpen className="w-4 h-4" />}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 justify-between">
              <span className="text-xs sm:text-sm font-black text-[#1A1A1A] flex items-center gap-1.5">
                <span>📚 Detallado y Extenso</span>
              </span>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#FFE66D] border border-[#1A1A1A] text-[#1A1A1A] shadow-[1px_1px_0px_#1A1A1A]">
                ⭐ Recomendado
              </span>
            </div>
            <p className="text-[11px] sm:text-xs font-semibold text-[#1A1A1A]/85 mt-1 leading-snug">
              {gradeLevel === 'primaria'
                ? 'Explicación completa con muchos ejemplos de la vida real, glosario de palabras clave y pasos detallados.'
                : 'Desarrollo conceptual a fondo, múltiples ejemplos reales, contexto de origen, glosario y comprobación matemática paso a paso.'}
            </p>
          </div>
        </button>
      </div>
    </div>
  );
};
