/**
 * Tarjeta Neubrutalista: Guía de Taller Escolar & Cuestionarios
 * Ayuda al alumno a responder preguntas abiertas y reflexivas con pistas pedagógicas.
 */

import React, { useState } from 'react';
import { HelpCircle, Copy, Check, Lightbulb, MessageSquareQuote } from 'lucide-react';
import { QuizGuideResult } from '../types';

interface QuizGuideCardProps {
  data: QuizGuideResult;
}

export const QuizGuideCard: React.FC<QuizGuideCardProps> = ({ data }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const textContent = `
${data.topic} - Guía de Taller

${data.questions
  .map(
    (q, i) => `Pregunta ${i + 1}: ${q.questionOrConcept}
Pista pedagógica: ${q.guideHint}
Respuesta modelo: ${q.sampleAnswerOrThought}`
  )
  .join('\n\n')}

Consejo para responder: ${data.studyTip}
    `.trim();

    navigator.clipboard.writeText(textContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
      {/* Cabecera */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-700">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
              <span>Guía de Taller & Preguntas de Examen</span>
              <span className="text-[10px] font-semibold bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full border border-purple-200">
                Orientación
              </span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">{data.topic}</p>
          </div>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 cursor-pointer transition-colors"
          title="Copiar guía"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? '¡Copiado!' : 'Copiar guía'}</span>
        </button>
      </div>

      {/* Preguntas con pistas y respuestas orientadoras */}
      <div className="space-y-3">
        {data.questions.map((item, index) => (
          <div
            key={index}
            className="p-4 bg-slate-50/70 rounded-xl border border-slate-200 space-y-2.5"
          >
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-md bg-purple-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                {index + 1}
              </span>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                {item.questionOrConcept}
              </h4>
            </div>

            {/* Pista orientadora */}
            <div className="ml-7 p-3 bg-white rounded-lg border border-slate-200 text-xs space-y-1">
              <span className="font-bold text-amber-900 block flex items-center gap-1">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                <span>Pista del tutor para pensar tu respuesta:</span>
              </span>
              <p className="text-slate-600 italic leading-relaxed">{item.guideHint}</p>
            </div>

            {/* Respuesta modelo o fundamentada */}
            <div className="ml-7 p-3 bg-emerald-50/50 rounded-lg border border-emerald-200 text-xs space-y-1">
              <span className="font-bold text-emerald-900 block flex items-center gap-1">
                <MessageSquareQuote className="w-3.5 h-3.5 text-emerald-600" />
                <span>Respuesta modelo sugerida:</span>
              </span>
              <p className="text-slate-800 font-normal leading-relaxed">
                {item.sampleAnswerOrThought}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Consejo de Estudio */}
      <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs space-y-1">
        <span className="font-bold text-amber-900 flex items-center gap-1.5">
          <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
          <span>Cómo responder con éxito en tu examen:</span>
        </span>
        <p className="text-slate-800 font-medium">{data.studyTip}</p>
      </div>
    </div>
  );
};
