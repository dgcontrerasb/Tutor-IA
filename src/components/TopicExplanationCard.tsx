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
    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
      {/* Cabecera de la Tarjeta */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center shrink-0 text-teal-700">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-bold text-slate-800 leading-tight">
                Explicación Modular Didáctica
              </h3>
              <span className="text-[10px] font-semibold bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full border border-teal-200">
                Fichas Clave
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium truncate mt-0.5">{data.topic}</p>
          </div>
        </div>

        {/* Acciones del apunte escolar */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 cursor-pointer transition-colors"
            title="Copiar explicación al portapapeles"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? '¡Copiado!' : 'Copiar'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
            title="Descargar ficha en PDF"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Descargar PDF</span>
          </button>
        </div>
      </div>

      {/* 1. Definición concisa o central */}
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5 mb-1">
          <Lightbulb className="w-4 h-4 text-amber-500" />
          <span>Definición Central:</span>
        </span>
        <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-semibold">
          {data.simpleDefinition}
        </p>
      </div>

      {/* 1.1 Desarrollo Pedagógico a Fondo (Modo Extenso) */}
      {data.detailedExplanation && (
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span>Desarrollo Pedagógico a Fondo:</span>
            </span>
            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700">
              Modo Detallado
            </span>
          </div>
          <div className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal space-y-2 whitespace-pre-line pt-1">
            {data.detailedExplanation}
          </div>
        </div>
      )}

      {/* 2. Cuadrícula de Fichas Modulares */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Ficha 1: Causa & Efecto */}
        {data.causeAndEffect && (
          <div className="p-3.5 bg-rose-50/60 rounded-xl border border-rose-200 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-900 flex items-center gap-1.5 mb-1.5">
                <Zap className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span>Causa & Efecto:</span>
              </span>
              <p className="text-xs sm:text-[13px] text-slate-800 font-medium leading-snug">
                {data.causeAndEffect}
              </p>
            </div>
          </div>
        )}

        {/* Ficha 2: Cómo Funciona */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 mb-1.5">
              <Compass className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span>Mecanismo / ¿Cómo funciona?:</span>
            </span>
            <p className="text-xs sm:text-[13px] text-slate-800 font-medium leading-snug">
              {data.howItWorksOrWhy}
            </p>
          </div>
        </div>

        {/* Ficha 3: Aplicación en la Vida Real */}
        <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-200 flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5 mb-1.5">
              <Globe className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Aplicación Real & Ciencia:</span>
            </span>
            <p className="text-xs sm:text-[13px] text-slate-800 font-medium leading-snug">
              {data.realWorldExample}
            </p>
          </div>
        </div>

        {/* Ficha 4: Clave de Examen */}
        {data.examTipOrTrap && (
          <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-200 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5 mb-1.5">
                <Target className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Clave de Examen / Trampa Típica:</span>
              </span>
              <p className="text-xs sm:text-[13px] text-slate-800 font-medium leading-snug">
                {data.examTipOrTrap}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 2.1 Múltiples Ejemplos de la Vida Real (Modo Detallado) */}
      {data.realWorldExamples && data.realWorldExamples.length > 0 && (
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-indigo-600" />
            <span>Múltiples Ejemplos Prácticos en el Mundo Real:</span>
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-1">
            {data.realWorldExamples.map((ex, i) => (
              <div key={i} className="p-2.5 bg-white rounded-lg border border-slate-200 text-xs font-medium text-slate-800 shadow-xs">
                <strong className="text-indigo-600 block mb-0.5">Ejemplo #{i + 1}:</strong>
                <span>{ex}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2.2 Contexto Histórico y Orígenes */}
      {data.contextAndOrigins && (
        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-purple-600" />
            <span>Contexto, Historia y Origen del Concepto:</span>
          </span>
          <p className="text-xs sm:text-[13px] text-slate-700 font-normal leading-relaxed pt-0.5">
            {data.contextAndOrigins}
          </p>
        </div>
      )}

      {/* 2.3 Glosario de Términos Indispensables */}
      {data.glossary && data.glossary.length > 0 && (
        <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-cyan-700" />
            <span>Glosario de Términos Clave:</span>
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {data.glossary.map((item, idx) => (
              <div key={idx} className="p-2.5 bg-white rounded-lg border border-slate-200 shadow-xs">
                <strong className="text-xs font-bold text-slate-900 block">{item.term}</strong>
                <p className="text-[11px] text-slate-600 mt-0.5">{item.definition}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Conceptos Clave */}
      {data.keyConcepts && data.keyConcepts.length > 0 && (
        <div className="space-y-2 pt-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Términos y Puntos Clave para el Cuaderno:</span>
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {data.keyConcepts.map((concept, index) => (
              <div
                key={index}
                className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs font-medium text-slate-800 flex items-start gap-2"
              >
                <span className="font-bold text-indigo-600 shrink-0">#{index + 1}</span>
                <span className="leading-snug">{concept}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Consejo Mnemotécnico del Profesor */}
      <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs space-y-1">
        <span className="font-bold text-amber-900 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Truco Mnemotécnico / Consejo del Tutor:</span>
        </span>
        <p className="text-slate-800 font-medium leading-snug text-xs sm:text-sm">
          {data.teacherTip}
        </p>
      </div>
    </div>
  );
};
