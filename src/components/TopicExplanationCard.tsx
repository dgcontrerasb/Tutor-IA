/**
 * Tarjeta Neubrutalista Modular: Explicación Didáctica para Bachillerato y Primaria
 * Estructurada en fichas modulares compactas con iconos temáticos y párrafos cortos (sin rollos densos).
 * Incluye Causa-Efecto, Mecanismo Central, Aplicación en la Vida Real y Clave de Examen / Trampas típicas.
 */

import React, { useState } from 'react';
import {
  BookOpen,
  Copy,
  Check,
  Lightbulb,
  Compass,
  Globe,
  Bookmark,
  FileDown,
  Zap,
  Target,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { TopicExplanationResult } from '../types';

interface TopicExplanationCardProps {
  data: TopicExplanationResult;
}

export const TopicExplanationCard: React.FC<TopicExplanationCardProps> = ({ data }) => {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleCopy = () => {
    let textContent = `📘 EXPLICACIÓN DIDÁCTICA: ${data.topic}\n\n`;
    textContent += `💡 Definición Clave:\n${data.simpleDefinition}\n\n`;

    if (data.detailedExplanation) {
      textContent += `📖 Desarrollo Pedagógico a Fondo:\n${data.detailedExplanation}\n\n`;
    }

    if (data.causeAndEffect) {
      textContent += `⚡ Causa & Efecto:\n${data.causeAndEffect}\n\n`;
    }

    textContent += `🧭 ¿Cómo funciona?:\n${data.howItWorksOrWhy}\n\n`;
    textContent += `🌍 Aplicación en la Vida Real:\n${data.realWorldExample}\n\n`;

    if (data.realWorldExamples && data.realWorldExamples.length > 0) {
      textContent += `🌐 Múltiples Ejemplos Prácticos:\n${data.realWorldExamples.map((ex, i) => `${i + 1}. ${ex}`).join('\n')}\n\n`;
    }

    if (data.contextAndOrigins) {
      textContent += `📜 Contexto e Historia del Concepto:\n${data.contextAndOrigins}\n\n`;
    }

    if (data.glossary && data.glossary.length > 0) {
      textContent += `📚 Glosario de Términos Clave:\n${data.glossary.map((g) => `• ${g.term}: ${g.definition}`).join('\n')}\n\n`;
    }

    if (data.examTipOrTrap) {
      textContent += `🎯 Clave de Examen:\n${data.examTipOrTrap}\n\n`;
    }

    if (data.keyConcepts && data.keyConcepts.length > 0) {
      textContent += `📌 Conceptos Clave:\n${data.keyConcepts.map((c, i) => `${i + 1}. ${c}`).join('\n')}\n\n`;
    }

    textContent += `⭐ Consejo del Profesor:\n${data.teacherTip}`;

    navigator.clipboard.writeText(textContent.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveNote = () => {
    setSaved(true);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('tutor-ia-history-updated'));
    }
    setTimeout(() => setSaved(false), 2500);
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('tutor-ia-request-print'));
    }
  };

  return (
    <div className="neo-card bg-white p-4 sm:p-6 rounded-2xl border-[3px] border-[#1A1A1A] shadow-[6px_6px_0px_#1A1A1A] space-y-4 sm:space-y-5">
      {/* Cabecera de la Tarjeta */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-[#1A1A1A] pb-3.5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#B5EAD7] border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5 text-[#1A1A1A]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-black text-[#1A1A1A] leading-tight">
                Explicación Modular Didáctica
              </h3>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#B5EAD7] border border-[#1A1A1A] text-[#1A1A1A]">
                Fichas Clave
              </span>
            </div>
            <p className="text-xs font-bold text-[#1A1A1A]/70 truncate mt-0.5">{data.topic}</p>
          </div>
        </div>

        {/* Acciones del apunte escolar */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={handleCopy}
            className="neo-btn flex items-center gap-1 px-2.5 py-1.5 bg-[#FAF7EE] hover:bg-[#FFE66D] text-[#1A1A1A] rounded-xl text-xs font-bold cursor-pointer"
            title="Copiar explicación al portapapeles"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-900" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? '¡Copiado!' : 'Copiar'}</span>
          </button>

          <button
            onClick={handleSaveNote}
            className={`neo-btn flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
              saved
                ? 'bg-[#A8E6CF] text-emerald-950 border-[#1A1A1A]'
                : 'bg-[#FAF7EE] hover:bg-[#FFE66D] text-[#1A1A1A]'
            }`}
            title="Guardar como apunte escolar"
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>{saved ? '✓ Guardado en tu libreta' : 'Guardar apunte'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="neo-btn flex items-center gap-1 px-2.5 py-1.5 bg-[#FAF7EE] hover:bg-[#A0E7E5] text-[#1A1A1A] rounded-xl text-xs font-bold cursor-pointer"
            title="Descargar ficha en PDF"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Descargar PDF</span>
          </button>
        </div>
      </div>

      {/* 1. Definición concisa o central */}
      <div className="p-3.5 sm:p-4 bg-[#FAF7EE] rounded-xl border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A]">
        <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-[#1A1A1A] flex items-center gap-1.5 mb-1">
          <Lightbulb className="w-4 h-4 text-amber-900" />
          <span>Definición Central:</span>
        </span>
        <p className="text-xs sm:text-sm text-[#1A1A1A] leading-relaxed font-bold">
          {data.simpleDefinition}
        </p>
      </div>

      {/* 1.1 Desarrollo Pedagógico a Fondo (Modo Extenso) */}
      {data.detailedExplanation && (
        <div className="p-4 bg-white rounded-xl border-2 border-[#1A1A1A] shadow-[3px_3px_0px_#1A1A1A] space-y-2">
          <div className="flex items-center justify-between border-b border-[#1A1A1A]/15 pb-2">
            <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#1A1A1A] flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-700" />
              <span>Desarrollo Pedagógico a Fondo:</span>
            </span>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#A8E6CF] border border-[#1A1A1A] text-[#1A1A1A]">
              Modo Detallado
            </span>
          </div>
          <div className="text-xs sm:text-sm text-[#1A1A1A] leading-relaxed font-medium space-y-2 whitespace-pre-line pt-1">
            {data.detailedExplanation}
          </div>
        </div>
      )}

      {/* 2. Cuadrícula de Fichas Modulares */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Ficha 1: Causa & Efecto / Origen y Consecuencias */}
        {data.causeAndEffect && (
          <div className="p-3.5 bg-[#FFF0F2] rounded-xl border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-rose-950 flex items-center gap-1.5 mb-1.5">
                <Zap className="w-3.5 h-3.5 text-rose-800 shrink-0" />
                <span>Causa & Efecto (¿Por qué ocurre?):</span>
              </span>
              <p className="text-xs sm:text-[13px] text-[#1A1A1A] font-medium leading-snug">
                {data.causeAndEffect}
              </p>
            </div>
          </div>
        )}

        {/* Ficha 2: Cómo Funciona / Mecanismo Esencial */}
        <div className="p-3.5 bg-white rounded-xl border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-[#1A1A1A] flex items-center gap-1.5 mb-1.5">
              <Compass className="w-3.5 h-3.5 text-[#1A1A1A] shrink-0" />
              <span>Mecanismo / ¿Cómo funciona?:</span>
            </span>
            <p className="text-xs sm:text-[13px] text-[#1A1A1A]/90 font-medium leading-snug">
              {data.howItWorksOrWhy}
            </p>
          </div>
        </div>

        {/* Ficha 3: Aplicación en la Vida Real y la Ciencia */}
        <div className="p-3.5 bg-[#FFF8D6] rounded-xl border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-950 flex items-center gap-1.5 mb-1.5">
              <Globe className="w-3.5 h-3.5 text-amber-800 shrink-0" />
              <span>Aplicación Real & Ciencia:</span>
            </span>
            <p className="text-xs sm:text-[13px] text-[#1A1A1A] font-medium leading-snug">
              {data.realWorldExample}
            </p>
          </div>
        </div>

        {/* Ficha 4: Clave de Examen / Trampa Típica */}
        {data.examTipOrTrap && (
          <div className="p-3.5 bg-[#E8F8F5] rounded-xl border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-950 flex items-center gap-1.5 mb-1.5">
                <Target className="w-3.5 h-3.5 text-emerald-800 shrink-0" />
                <span>Clave de Examen / Trampa Típica:</span>
              </span>
              <p className="text-xs sm:text-[13px] text-[#1A1A1A] font-medium leading-snug">
                {data.examTipOrTrap}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 2.1 Múltiples Ejemplos de la Vida Real (Modo Detallado) */}
      {data.realWorldExamples && data.realWorldExamples.length > 0 && (
        <div className="p-3.5 bg-[#FAF7EE] rounded-xl border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] space-y-2">
          <span className="text-xs font-black uppercase tracking-wider text-[#1A1A1A] flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-blue-700" />
            <span>Múltiples Ejemplos Prácticos en el Mundo Real:</span>
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-1">
            {data.realWorldExamples.map((ex, i) => (
              <div key={i} className="p-2.5 bg-white rounded-lg border border-[#1A1A1A] text-xs font-medium text-[#1A1A1A] shadow-[1px_1px_0px_#1A1A1A]">
                <strong className="text-amber-900 block mb-0.5">Ejemplo #{i + 1}:</strong>
                <span>{ex}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2.2 Contexto Histórico, Científico y Orígenes (Modo Detallado) */}
      {data.contextAndOrigins && (
        <div className="p-3.5 bg-white rounded-xl border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] space-y-1">
          <span className="text-xs font-black uppercase tracking-wider text-[#1A1A1A] flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-purple-700" />
            <span>Contexto, Historia y Origen del Concepto:</span>
          </span>
          <p className="text-xs sm:text-[13px] text-[#1A1A1A]/90 font-medium leading-relaxed pt-0.5">
            {data.contextAndOrigins}
          </p>
        </div>
      )}

      {/* 2.3 Glosario de Términos Indispensables (Modo Detallado) */}
      {data.glossary && data.glossary.length > 0 && (
        <div className="p-3.5 bg-[#F4F9F9] rounded-xl border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] space-y-2">
          <span className="text-xs font-black uppercase tracking-wider text-[#1A1A1A] flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-cyan-800" />
            <span>Glosario de Términos Clave:</span>
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {data.glossary.map((item, idx) => (
              <div key={idx} className="p-2.5 bg-white rounded-lg border border-[#1A1A1A] shadow-[1px_1px_0px_#1A1A1A]">
                <strong className="text-xs font-black text-[#1A1A1A] block">{item.term}</strong>
                <p className="text-[11px] text-[#1A1A1A]/80 font-medium mt-0.5">{item.definition}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Ficha de Conceptos Clave en Píldoras Sintetizadas */}
      {data.keyConcepts && data.keyConcepts.length > 0 && (
        <div className="space-y-2 pt-1">
          <span className="text-xs font-black uppercase tracking-wider text-[#1A1A1A] flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
            <span>Términos y Puntos Clave para el Cuaderno:</span>
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {data.keyConcepts.map((concept, index) => (
              <div
                key={index}
                className="p-2.5 bg-[#FAF7EE] rounded-lg border border-[#1A1A1A] text-xs font-medium text-[#1A1A1A] flex items-start gap-2 shadow-[1px_1px_0px_#1A1A1A]"
              >
                <span className="font-black text-amber-900 shrink-0">#{index + 1}</span>
                <span className="leading-snug">{concept}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Consejo Mnemotécnico del Profesor */}
      <div className="p-3 sm:p-3.5 bg-[#FFE66D] rounded-xl border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] text-xs space-y-1">
        <span className="font-black text-[#1A1A1A] flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
          <Sparkles className="w-3.5 h-3.5 text-amber-900" />
          <span>Truco Mnemotécnico / Consejo del Tutor:</span>
        </span>
        <p className="text-[#1A1A1A] font-bold leading-snug text-xs sm:text-sm">
          {data.teacherTip}
        </p>
      </div>
    </div>
  );
};
