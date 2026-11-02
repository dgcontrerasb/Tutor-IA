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
    <div className="relative bg-white rounded-2xl border-[3px] border-[#1A1A1A] shadow-[6px_6px_0px_#1A1A1A] p-5 sm:p-7 overflow-hidden">
      {/* Cinta decorativa */}
      <div className="washi-tape washi-tape-mint top-2.5 left-8 w-28"></div>

      {/* Cabecera */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 mt-1">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-[#A8E6CF] border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] flex items-center justify-center font-bold text-xl">
            📌
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-[#1A1A1A]">
              Resumen del Texto
            </h3>
            <p className="text-xs font-semibold text-[#1A1A1A]/70">
              Ideas fundamentales condensadas para estudiar
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="neo-btn flex items-center gap-1.5 px-3 py-1 bg-[#A8E6CF] hover:bg-[#97e0c4] text-[#1A1A1A] rounded-lg text-xs font-bold cursor-pointer"
          title="Copiar resumen al portapapeles"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-800 stroke-[3]" />
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
      <div className="mb-6">
        <div className="flex items-center gap-1.5 mb-2">
          <Bookmark className="w-4 h-4 text-emerald-800" />
          <h4 className="text-xs font-black uppercase tracking-wider text-[#1A1A1A]">
            Idea Principal (en pocas palabras):
          </h4>
        </div>

        <div className="bg-[#A8E6CF]/30 rounded-xl border-2 border-[#1A1A1A] p-4 text-sm sm:text-base font-bold text-[#1A1A1A] leading-relaxed shadow-[2px_2px_0px_#1A1A1A]">
          «{data.mainIdea}»
        </div>
      </div>

      {/* 2. De 3 a 5 puntos clave */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <ListOrdered className="w-4 h-4 text-[#1A1A1A]" />
            <h4 className="text-xs font-black uppercase tracking-wider text-[#1A1A1A]">
              Puntos Clave para Repasar ({data.keyPoints.length}):
            </h4>
          </div>

          <span className="text-[11px] font-bold text-[#1A1A1A]/60 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            Ideales para examen
          </span>
        </div>

        <div className="space-y-2.5">
          {data.keyPoints.map((point, index) => (
            <div
              key={index}
              className="bg-[#FAF7EE] rounded-xl border-2 border-[#1A1A1A] p-3 shadow-[2px_2px_0px_#1A1A1A] flex items-start gap-3"
            >
              <div className="w-6 h-6 rounded-lg bg-[#A8E6CF] border-2 border-[#1A1A1A] flex items-center justify-center font-black text-xs text-[#1A1A1A] shrink-0 mt-0.5 shadow-[1px_1px_0px_#1A1A1A]">
                {index + 1}
              </div>
              <p className="text-xs sm:text-sm text-[#1A1A1A] font-semibold leading-relaxed flex-1">
                {point}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
