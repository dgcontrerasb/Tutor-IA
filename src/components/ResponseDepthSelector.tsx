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
      {/* Encabezado compacto sin truncado */}
      <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <span>📖</span>
          <span>Profundidad</span>
        </label>
        <span className="text-[11px] font-medium text-slate-500 leading-snug">
          {isConcise
            ? gradeLevel === 'primaria'
              ? 'Respuesta corta de 2-3 líneas'
              : 'Conceptos clave sin rodeos'
            : gradeLevel === 'primaria'
              ? 'Explicación completa con ejemplos'
              : 'Desarrollo a fondo paso a paso'}
        </span>
      </div>

      {/* Control segmentado moderno (cero solapamientos ni cortes) */}
      <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100/90 rounded-xl border border-slate-200/80">
        <button
          type="button"
          onClick={() => onChange('concise')}
          disabled={disabled}
          className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            isConcise
              ? 'bg-white text-amber-800 border border-amber-200 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 border border-transparent'
          }`}
          aria-pressed={isConcise}
        >
          <Zap className={`w-3.5 h-3.5 shrink-0 ${isConcise ? 'text-amber-500' : 'text-slate-400'}`} />
          <span>Resumido</span>
        </button>

        <button
          type="button"
          onClick={() => onChange('detailed')}
          disabled={disabled}
          className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            isDetailed
              ? 'bg-white text-blue-700 border border-blue-200 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 border border-transparent'
          }`}
          aria-pressed={isDetailed}
        >
          <BookOpen className={`w-3.5 h-3.5 shrink-0 ${isDetailed ? 'text-blue-600' : 'text-slate-400'}`} />
          <span>Detallado</span>
        </button>
      </div>
    </div>
  );
};
