/**
 * Tarjeta de Corrección Ortográfica
 * Texto corregido completo + lista breve y sencilla explicando faltas comunes + botón copiar
 */

import React, { useState } from 'react';
import { Check, Copy, AlertTriangle, Lightbulb, CheckCircle2, Award } from 'lucide-react';
import { CorrectionResult } from '../types';

interface CorrectionCardProps {
  data: CorrectionResult;
}

export const CorrectionCard: React.FC<CorrectionCardProps> = ({ data }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(data.correctedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'tilde':
        return 'bg-[#FFE66D] text-[#1A1A1A] border-[#1A1A1A]';
      case 'ortografia':
        return 'bg-[#FF8B94] text-[#1A1A1A] border-[#1A1A1A]';
      case 'puntuacion':
        return 'bg-[#A0E7E5] text-[#1A1A1A] border-[#1A1A1A]';
      default:
        return 'bg-[#A8E6CF] text-[#1A1A1A] border-[#1A1A1A]';
    }
  };

  return (
    <div className="relative bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 overflow-hidden space-y-5">
      {/* Cabecera */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center font-bold text-xl">
            📝
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
              Corrección Ortográfica
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              {data.mistakesCount === 0
                ? '¡No se encontraron faltas de ortografía!'
                : `${data.mistakesCount} ${data.mistakesCount === 1 ? 'corrección realizada' : 'correcciones realizadas'}`}
            </p>
          </div>
        </div>

        {/* Nota / Medalla formativa */}
        {data.scoreText && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50/80 border border-amber-200 text-xs font-bold text-amber-900">
            <Award className="w-4 h-4 text-amber-600" />
            <span>{data.scoreText}</span>
          </div>
        )}
      </div>

      {/* Texto corregido completo */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Texto corregido listo para entregar:
          </span>

          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 cursor-pointer transition-colors"
            title="Copiar texto corregido al portapapeles"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>¡Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar texto</span>
              </>
            )}
          </button>
        </div>

        <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 text-sm sm:text-base leading-relaxed text-slate-800 font-normal whitespace-pre-wrap select-all">
          {data.correctedText}
        </div>
      </div>

      {/* Lista breve y sencilla explicando las faltas comunes */}
      {data.explanations && data.explanations.length > 0 && (
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Explicación pedagógica de los errores encontrados:
          </h4>

          <div className="space-y-2">
            {data.explanations.map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl border border-slate-200/90 p-3 shadow-xs flex flex-col sm:flex-row sm:items-start gap-2.5"
              >
                {/* Comparación visual original vs corregido */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 line-through font-mono text-xs font-semibold border border-rose-200">
                    {item.original}
                  </span>
                  <span className="text-slate-400 font-bold">➜</span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-mono text-xs font-bold border border-emerald-200">
                    {item.correction}
                  </span>
                  <span className="text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded border border-slate-200 bg-slate-50 text-slate-600">
                    {item.type}
                  </span>
                </div>

                {/* Explicación de la regla */}
                <p className="text-xs sm:text-sm text-slate-700 font-normal leading-snug flex-1">
                  {item.explanation}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Consejo o truco de la maestra */}
      {data.teacherTip && (
        <div className="bg-amber-50 rounded-xl border border-amber-200 p-3.5 flex items-start gap-2.5">
          <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-slate-800">
            <span className="font-bold text-amber-950">💡 Consejo de la maestra: </span>
            <span className="font-medium text-slate-700">{data.teacherTip}</span>
          </div>
        </div>
      )}
    </div>
  );
};
