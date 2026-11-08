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
    <div className="w-full my-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 text-center relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
      {/* Animación central lúdica */}
      <div className="relative inline-flex items-center justify-center mb-3">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center animate-bounce text-indigo-600">
          <Edit3 className="w-6 h-6" />
        </div>
        <div className="absolute -top-1 -right-1 text-base animate-spin text-amber-400" style={{ animationDuration: '3s' }}>
          ✨
        </div>
      </div>

      {/* Mensaje rotativo */}
      <h3 className="text-sm sm:text-base font-bold text-slate-800 mb-1 min-h-[24px] transition-all duration-300">
        {SCHOOL_LOADING_MESSAGES[messageIndex]}
      </h3>

      <p className="text-xs text-slate-500 max-w-md mx-auto">
        Tutor-IA está preparando una explicación pedagógica clara, fundamentada y motivadora.
      </p>

      {/* Barra de progreso animada Bento */}
      <div className="mt-4 max-w-xs mx-auto h-2 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
        <div className="h-full bg-gradient-to-r from-indigo-500 via-sky-400 to-emerald-400 rounded-full animate-pulse w-full"></div>
      </div>

      <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
        <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
        <span>Resolviendo con pedagogía inteligente</span>
      </div>
    </div>
  );
};
