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
    <div className="relative bg-white rounded-2xl border-[3px] border-[#1A1A1A] shadow-[6px_6px_0px_#1A1A1A] p-5 sm:p-7 overflow-hidden">
      {/* Cinta adhesiva decorativa */}
      <div className="washi-tape top-2.5 left-8 w-28"></div>

      {/* Cabecera */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 mt-1">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-[#FFE66D] border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] flex items-center justify-center font-bold text-xl">
            📝
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-[#1A1A1A] flex items-center gap-2">
              Corrección Ortográfica
            </h3>
            <p className="text-xs font-semibold text-[#1A1A1A]/70">
              {data.mistakesCount === 0
                ? '¡No se encontraron faltas de ortografía!'
                : `${data.mistakesCount} ${data.mistakesCount === 1 ? 'corrección realizada' : 'correcciones realizadas'}`}
            </p>
          </div>
        </div>

        {/* Nota / Medalla formativa */}
        {data.scoreText && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF7EE] border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] text-xs font-black text-[#1A1A1A]">
            <Award className="w-4 h-4 text-amber-600" />
            <span>{data.scoreText}</span>
          </div>
        )}
      </div>

      {/* Texto corregido completo */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-black uppercase tracking-wider text-[#1A1A1A] flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            Texto corregido listo para entregar:
          </span>

          <button
            type="button"
            onClick={handleCopy}
            className="neo-btn flex items-center gap-1.5 px-3 py-1 bg-[#FFE66D] hover:bg-[#fedd48] text-[#1A1A1A] rounded-lg text-xs font-bold cursor-pointer"
            title="Copiar texto corregido al portapapeles"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-800 stroke-[3]" />
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

        <div className="bg-[#FAF7EE] rounded-xl border-2 border-[#1A1A1A] p-4 text-sm sm:text-base leading-relaxed text-[#1A1A1A] font-medium whitespace-pre-wrap select-all">
          {data.correctedText}
        </div>
      </div>

      {/* Lista breve y sencilla explicando las faltas comunes */}
      {data.explanations && data.explanations.length > 0 && (
        <div className="mb-6">
          <h4 className="text-xs font-black uppercase tracking-wider text-[#1A1A1A] mb-3 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            Explicación pedagógica de los errores encontrados:
          </h4>

          <div className="space-y-2.5">
            {data.explanations.map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl border-2 border-[#1A1A1A] p-3 shadow-[2px_2px_0px_#1A1A1A] flex flex-col sm:flex-row sm:items-start gap-2.5"
              >
                {/* Comparación visual original vs corregido */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-2 py-0.5 rounded-md bg-red-100 text-red-700 line-through font-mono text-xs font-bold border border-red-300">
                    {item.original}
                  </span>
                  <span className="text-[#1A1A1A] font-bold">➜</span>
                  <span className="px-2 py-0.5 rounded-md bg-[#A8E6CF] text-emerald-950 font-mono text-xs font-black border border-[#1A1A1A]">
                    {item.correction}
                  </span>
                  <span className={`text-[10px] font-black uppercase px-1.5 py-0.2 rounded border ${getBadgeColor(item.type)}`}>
                    {item.type}
                  </span>
                </div>

                {/* Explicación de la regla */}
                <p className="text-xs sm:text-sm text-[#1A1A1A] font-medium leading-snug flex-1">
                  {item.explanation}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Consejo o truco de la maestra */}
      {data.teacherTip && (
        <div className="bg-[#FFE66D]/30 rounded-xl border-2 border-dashed border-[#1A1A1A] p-3.5 flex items-start gap-2.5">
          <Lightbulb className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-[#1A1A1A]">
            <span className="font-black">💡 Consejo de la maestra: </span>
            <span className="font-medium">{data.teacherTip}</span>
          </div>
        </div>
      )}
    </div>
  );
};
