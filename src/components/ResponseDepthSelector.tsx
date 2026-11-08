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
    <div className="w-full space-y-2">
      {/* Encabezado descriptivo */}
      <div className="flex items-center justify-between gap-2">
        <label className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
          <span>📖</span>
          <span>Profundidad de la respuesta</span>
        </label>
        <span className="text-[11px] font-medium text-slate-400">
          Elige el nivel de detalle
        </span>
      </div>

      {/* Grid táctil de dos opciones */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {/* Opción 1: Resumido Rápido */}
        <button
          type="button"
          onClick={() => onChange('concise')}
          disabled={disabled}
          className={`relative p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
            isConcise
              ? 'bg-amber-50/80 border-amber-300 text-amber-950 shadow-xs'
              : 'bg-white border-slate-200/80 hover:border-slate-300 text-slate-600 hover:bg-slate-50/50'
          }`}
          aria-pressed={isConcise}
        >
          <div
            className={`w-6 h-6 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
              isConcise ? 'bg-amber-500 border-amber-500 text-white' : 'border-slate-300 bg-white text-slate-400'
            }`}
          >
            {isConcise ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Zap className="w-3.5 h-3.5" />}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 justify-between">
              <span className="text-xs sm:text-sm font-bold leading-tight">
                ⚡ Resumido
              </span>
              <span className="text-[10px] font-semibold uppercase px-1.5 py-0.2 bg-white/80 border border-slate-200 rounded text-slate-600">
                Rápido
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
              {gradeLevel === 'primaria'
                ? 'Respuesta cortita de 2-3 líneas para repasar veloz.'
                : 'Definición esencial y conceptos clave sin rodeos.'}
            </p>
          </div>
        </button>

        {/* Opción 2: Detallado y Extenso */}
        <button
          type="button"
          onClick={() => onChange('detailed')}
          disabled={disabled}
          className={`relative p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
            isDetailed
              ? 'bg-indigo-50/80 border-indigo-300 text-indigo-950 shadow-xs'
              : 'bg-white border-slate-200/80 hover:border-slate-300 text-slate-600 hover:bg-slate-50/50'
          }`}
          aria-pressed={isDetailed}
        >
          <div
            className={`w-6 h-6 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
              isDetailed ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 bg-white text-slate-400'
            }`}
          >
            {isDetailed ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <BookOpen className="w-3.5 h-3.5" />}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 justify-between">
              <span className="text-xs sm:text-sm font-bold leading-tight">
                📚 Detallado
              </span>
              <span className="text-[10px] font-semibold uppercase px-1.5 py-0.2 bg-indigo-100/80 border border-indigo-200 rounded text-indigo-800">
                ⭐ Completo
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
              {gradeLevel === 'primaria'
                ? 'Explicación completa con muchos ejemplos reales y paso a paso.'
                : 'Desarrollo conceptual a fondo con fórmulas y comprobación.'}
            </p>
          </div>
        </button>
      </div>
    </div>
  );
};
