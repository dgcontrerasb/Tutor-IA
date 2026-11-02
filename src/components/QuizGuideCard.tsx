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
    <div className="neo-card bg-white p-5 sm:p-6 rounded-2xl border-[3px] border-[#1A1A1A] shadow-[6px_6px_0px_#1A1A1A] space-y-5">
      {/* Cabecera */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-[#1A1A1A] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#D5AAFF] border-2 border-[#1A1A1A] flex items-center justify-center shadow-[2px_2px_0px_#1A1A1A]">
            <HelpCircle className="w-5 h-5 text-[#1A1A1A]" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-[#1A1A1A] flex items-center gap-2">
              <span>Guía de Taller & Preguntas de Examen</span>
              <span className="text-[10px] font-black bg-[#D5AAFF] px-2 py-0.5 rounded-full border border-[#1A1A1A]">
                Orientación
              </span>
            </h3>
            <p className="text-xs font-bold text-[#1A1A1A]/70">{data.topic}</p>
          </div>
        </div>

        <button
          onClick={handleCopy}
          className="neo-btn flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF7EE] hover:bg-[#FFE66D] text-[#1A1A1A] rounded-xl text-xs font-bold cursor-pointer"
          title="Copiar guía"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? '¡Copiado!' : 'Copiar guía'}</span>
        </button>
      </div>

      {/* Preguntas con pistas y respuestas orientadoras */}
      <div className="space-y-3.5">
        {data.questions.map((item, index) => (
          <div
            key={index}
            className="p-4 bg-[#FAF7EE] rounded-xl border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] space-y-2.5"
          >
            <div className="flex items-start gap-2">
              <span className="w-6 h-6 rounded-md bg-[#1A1A1A] text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                {index + 1}
              </span>
              <h4 className="text-xs sm:text-sm font-black text-[#1A1A1A]">
                {item.questionOrConcept}
              </h4>
            </div>

            {/* Pista orientadora */}
            <div className="ml-8 p-2.5 bg-white rounded-lg border border-[#1A1A1A] text-xs space-y-1">
              <span className="font-bold text-amber-900 block flex items-center gap-1">
                <Lightbulb className="w-3.5 h-3.5" />
                <span>Pista del tutor para pensar tu respuesta:</span>
              </span>
              <p className="text-[#1A1A1A]/85 italic">{item.guideHint}</p>
            </div>

            {/* Respuesta modelo o fundamentada */}
            <div className="ml-8 p-2.5 bg-[#A8E6CF]/30 rounded-lg border border-[#1A1A1A] text-xs space-y-1">
              <span className="font-bold text-emerald-950 block flex items-center gap-1">
                <MessageSquareQuote className="w-3.5 h-3.5" />
                <span>Respuesta modelo sugerida:</span>
              </span>
              <p className="text-[#1A1A1A] font-medium leading-relaxed">
                {item.sampleAnswerOrThought}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Consejo de Estudio */}
      <div className="p-3 bg-[#FFE66D] rounded-xl border-2 border-[#1A1A1A] text-xs space-y-1">
        <span className="font-black text-[#1A1A1A] flex items-center gap-1.5">
          <Lightbulb className="w-3.5 h-3.5" />
          <span>Cómo responder con éxito en tu examen:</span>
        </span>
        <p className="text-[#1A1A1A]/90 font-medium">{data.studyTip}</p>
      </div>
    </div>
  );
};
