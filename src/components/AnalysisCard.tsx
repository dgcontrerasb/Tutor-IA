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
    <div className="relative bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 overflow-hidden space-y-5">
      {/* Cabecera */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center font-bold text-xl">
            🔍
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-800">
              Análisis del Texto
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Estructura, género y comprensión profunda
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 cursor-pointer transition-colors"
          title="Copiar análisis al portapapeles"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Tema Principal */}
        <div className="bg-slate-50/80 rounded-xl border border-slate-200 p-3.5">
          <div className="flex items-center gap-1.5 mb-1">
            <Compass className="w-4 h-4 text-cyan-600" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Tema Principal
            </span>
          </div>
          <p className="text-sm font-bold text-slate-900">
            {data.mainTopic}
          </p>
        </div>

        {/* Tipo de Texto */}
        <div className="bg-slate-50/80 rounded-xl border border-slate-200 p-3.5">
          <div className="flex items-center gap-1.5 mb-1">
            <BookMarked className="w-4 h-4 text-indigo-600" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Tipo / Género Textual
            </span>
          </div>
          <p className="text-sm font-bold text-slate-900">
            {data.textType}
          </p>
        </div>
      </div>

      {/* Pregunta Reflexiva para el estudiante */}
      <div className="bg-cyan-50/40 rounded-xl border border-cyan-200 p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-lg bg-cyan-100 flex items-center justify-center text-cyan-800">
            <HelpCircle className="w-3.5 h-3.5" />
          </div>
          <h4 className="text-xs sm:text-sm font-bold text-cyan-950 uppercase tracking-wider">
            Pregunta Reflexiva para ti:
          </h4>
        </div>

        <p className="text-sm sm:text-base font-semibold text-slate-900 leading-relaxed mb-3">
          {data.reflectiveQuestion}
        </p>

        {/* Pista pedagógica */}
        {data.reflectiveHint && (
          <div className="bg-white rounded-lg border border-cyan-200 p-3 text-xs text-slate-700 flex items-start gap-2 shadow-xs">
            <MessageSquare className="w-3.5 h-3.5 text-cyan-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-cyan-950">Pista para tu respuesta: </span>
              <span className="text-slate-600">{data.reflectiveHint}</span>
            </div>
          </div>
        )}
      </div>

      {/* Moraleja o propósito si existe */}
      {data.moralOrPurpose && (
        <div className="text-xs text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          <span className="font-bold text-slate-900">🎯 Intención del autor o valor transmitido: </span>
          {data.moralOrPurpose}
        </div>
      )}
    </div>
  );
};
