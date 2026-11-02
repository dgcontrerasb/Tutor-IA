/**
 * Componente de estado de carga con mensajes escolares rotativos
 */

import React, { useState, useEffect } from 'react';
import { Sparkles, Edit3 } from 'lucide-react';

const SCHOOL_LOADING_MESSAGES = [
  '⚡ Conectando con los motores de IA escolar...',
  '📐 Despejando incógnitas y revisando signos...',
  '🔍 Cazando tildes y puliendo la redacción...',
  '📖 Leyendo tu cuaderno con atención pedagógica...',
  '🔬 Consultando principios científicos y fórmulas...',
  '💡 Formulando la explicación paso a paso...',
  '⭐ Preparando los mejores consejos del profesor...',
  '🚀 Casi listo: organizando tus apuntes Bento...',
];

export const LoadingState: React.FC = () => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % SCHOOL_LOADING_MESSAGES.length);
    }, 1600);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full my-6 bg-white rounded-2xl border-[2.5px] border-[#181829] shadow-[4px_4px_0px_#181829] p-6 sm:p-8 text-center relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
      {/* Animación central lúdica */}
      <div className="relative inline-flex items-center justify-center mb-4">
        <div className="w-14 h-14 rounded-2xl bg-[#FDE047] border-[2.5px] border-[#181829] shadow-[3px_3px_0px_#181829] flex items-center justify-center animate-bounce">
          <Edit3 className="w-7 h-7 text-[#181829]" />
        </div>
        <div className="absolute -top-1 -right-2 text-xl animate-spin" style={{ animationDuration: '3s' }}>
          ✨
        </div>
      </div>

      {/* Mensaje rotativo */}
      <h3 className="text-base sm:text-lg font-black text-[#181829] mb-1.5 min-h-[28px] transition-all duration-300">
        {SCHOOL_LOADING_MESSAGES[messageIndex]}
      </h3>

      <p className="text-xs font-semibold text-[#181829]/70 max-w-md mx-auto">
        Tutor-IA está preparando una explicación pedagógica clara, fundamentada y motivadora.
      </p>

      {/* Barra de progreso animada Neo-Pop */}
      <div className="mt-4 max-w-xs mx-auto h-3 bg-[#F3F5FA] rounded-full border-2 border-[#181829] overflow-hidden p-0.5">
        <div className="h-full bg-gradient-to-r from-[#FDE047] via-[#38BDF8] to-[#34D399] rounded-full animate-pulse w-full"></div>
      </div>

      <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] font-bold text-[#181829]/60">
        <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
        <span>Respuestas paso a paso sin costo por Groq Cloud</span>
      </div>
    </div>
  );
};
