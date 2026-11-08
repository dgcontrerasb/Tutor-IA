/**
 * Tarjeta de Resumen Escolar
 * Idea principal en 1-2 frases + 3 a 5 puntos clave indispensables + botón copiar
 */

import React, { useState } from 'react';
import { Copy, Check, Bookmark, ListOrdered, Sparkles } from 'lucide-react';
import { SummaryResult } from '../types';

interface SummaryCardProps {
  data: SummaryResult;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ data }) => {
  const [copied, setCopied] = useState(false);

  const fullSummaryText = `IDEA PRINCIPAL:\n${data.mainIdea}\n\nPUNTOS CLAVE:\n${data.keyPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullSummaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="relative bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 overflow-hidden space-y-5">
      {/* Cabecera */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center font-bold text-xl">
            📌
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-800">
              Resumen del Texto
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Ideas fundamentales condensadas para estudiar
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 cursor-pointer transition-colors"
          title="Copiar resumen al portapapeles"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>¡Copiado!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copiar resumen</span>
            </>
          )}
        </button>
      </div>

      {/* 1. Idea principal en 1-2 frases destacadas */}
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <Bookmark className="w-4 h-4 text-emerald-600" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Idea Principal (en pocas palabras):
          </h4>
        </div>

        <div className="bg-emerald-50/50 rounded-xl border border-emerald-200 p-4 text-sm sm:text-base font-semibold text-slate-800 leading-relaxed">
          «{data.mainIdea}»
        </div>
      </div>

      {/* 2. De 3 a 5 puntos clave */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <ListOrdered className="w-4 h-4 text-indigo-600" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Puntos Clave para Repasar ({data.keyPoints.length}):
            </h4>
          </div>

          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            Ideales para examen
          </span>
        </div>

        <div className="space-y-2">
          {data.keyPoints.map((point, index) => (
            <div
              key={index}
              className="bg-slate-50/70 rounded-xl border border-slate-200 p-3 flex items-start gap-3"
            >
              <div className="w-5 h-5 rounded-md bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                {index + 1}
              </div>
              <p className="text-xs sm:text-sm text-slate-700 font-normal leading-relaxed flex-1">
                {point}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
