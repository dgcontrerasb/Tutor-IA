/**
 * Tarjeta de Análisis del Texto
 * Tema principal, tipo de texto y 1 pregunta reflexiva para el estudiante + botón copiar
 */

import React, { useState } from 'react';
import { Copy, Check, Compass, HelpCircle, BookMarked, MessageSquare } from 'lucide-react';
import { AnalysisResult } from '../types';

interface AnalysisCardProps {
  data: AnalysisResult;
}

export const AnalysisCard: React.FC<AnalysisCardProps> = ({ data }) => {
  const [copied, setCopied] = useState(false);

  const fullAnalysisText = `ANÁLISIS DEL TEXTO:\n- Tema principal: ${data.mainTopic}\n- Tipo de texto: ${data.textType}\n\nPREGUNTA REFLEXIVA:\n${data.reflectiveQuestion}\n\nPISTA ORIENTADORA:\n${data.reflectiveHint}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullAnalysisText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="relative bg-white rounded-2xl border-[3px] border-[#1A1A1A] shadow-[6px_6px_0px_#1A1A1A] p-5 sm:p-7 overflow-hidden">
      {/* Cinta decorativa */}
      <div className="washi-tape washi-tape-coral top-2.5 left-8 w-28"></div>

      {/* Cabecera */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 mt-1">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-[#A0E7E5] border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] flex items-center justify-center font-bold text-xl">
            🔍
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-[#1A1A1A]">
              Análisis del Texto
            </h3>
            <p className="text-xs font-semibold text-[#1A1A1A]/70">
              Estructura, género y comprensión profunda
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="neo-btn flex items-center gap-1.5 px-3 py-1 bg-[#A0E7E5] hover:bg-[#8ee1df] text-[#1A1A1A] rounded-lg text-xs font-bold cursor-pointer"
          title="Copiar análisis al portapapeles"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-800 stroke-[3]" />
              <span>¡Copiado!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copiar análisis</span>
            </>
          )}
        </button>
      </div>

      {/* Cuadrícula de Tema Principal y Tipo de Texto */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-6">
        {/* Tema Principal */}
        <div className="bg-[#FAF7EE] rounded-xl border-2 border-[#1A1A1A] p-3.5 shadow-[2px_2px_0px_#1A1A1A]">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Compass className="w-4 h-4 text-cyan-800" />
            <span className="text-[11px] font-black uppercase tracking-wider text-[#1A1A1A]/70">
              Tema Principal
            </span>
          </div>
          <p className="text-sm font-black text-[#1A1A1A]">
            {data.mainTopic}
          </p>
        </div>

        {/* Tipo de Texto */}
        <div className="bg-[#FAF7EE] rounded-xl border-2 border-[#1A1A1A] p-3.5 shadow-[2px_2px_0px_#1A1A1A]">
          <div className="flex items-center gap-1.5 mb-1.5">
            <BookMarked className="w-4 h-4 text-emerald-800" />
            <span className="text-[11px] font-black uppercase tracking-wider text-[#1A1A1A]/70">
              Tipo / Género Textual
            </span>
          </div>
          <p className="text-sm font-black text-[#1A1A1A]">
            {data.textType}
          </p>
        </div>
      </div>

      {/* Pregunta Reflexiva para el estudiante */}
      <div className="mb-4 bg-[#A0E7E5]/30 rounded-xl border-2 border-[#1A1A1A] p-4 shadow-[2px_2px_0px_#1A1A1A]">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-lg bg-[#A0E7E5] border-2 border-[#1A1A1A] flex items-center justify-center">
            <HelpCircle className="w-4 h-4 text-[#1A1A1A]" />
          </div>
          <h4 className="text-xs sm:text-sm font-black text-[#1A1A1A] uppercase tracking-wider">
            1 Pregunta Reflexiva para ti:
          </h4>
        </div>

        <p className="text-sm sm:text-base font-black text-[#1A1A1A] leading-relaxed mb-3">
          ❓ {data.reflectiveQuestion}
        </p>

        {/* Pista pedagógica */}
        {data.reflectiveHint && (
          <div className="bg-white rounded-lg border border-[#1A1A1A] p-2.5 text-xs text-[#1A1A1A] flex items-start gap-2">
            <MessageSquare className="w-3.5 h-3.5 text-cyan-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Pista para tu respuesta: </span>
              <span className="font-medium text-[#1A1A1A]/80">{data.reflectiveHint}</span>
            </div>
          </div>
        )}
      </div>

      {/* Moraleja o propósito si existe */}
      {data.moralOrPurpose && (
        <div className="text-xs font-semibold text-[#1A1A1A]/80 bg-[#FAF7EE] p-3 rounded-xl border border-[#1A1A1A]">
          <span className="font-black text-[#1A1A1A]">🎯 Intención del autor o valor transmitido: </span>
          {data.moralOrPurpose}
        </div>
      )}
    </div>
  );
};
