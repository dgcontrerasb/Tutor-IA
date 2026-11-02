/**
 * Componente de estado de carga con mensajes escolares rotativos
 */

import React, { useState, useEffect } from 'react';
import { Sparkles, Edit3 } from 'lucide-react';

const SCHOOL_LOADING_MESSAGES = [
  '🎒 Revisando cuadernos y tareas...',
  '🔍 Buscando tildes y acentos perdidos...',
  '📖 Leyendo la letra con paciencia...',
  '✏️ Sacando punta al lápiz corrector...',
  '🟡 Subrayando con marcador amarillo...',
  '📌 Extrayendo las ideas principales...',
  '📚 Consultando las reglas de la RAE...',
  '⭐ Preparando los consejos de la maestra...',
];

export const LoadingState: React.FC = () => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % SCHOOL_LOADING_MESSAGES.length);
    }, 1800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full my-8 bg-white rounded-2xl border-[3px] border-[#1A1A1A] shadow-[6px_6px_0px_#1A1A1A] p-7 text-center relative overflow-hidden">
      {/* Cintas decorativas */}
      <div className="washi-tape top-2 left-8 w-24"></div>
      <div className="washi-tape washi-tape-mint top-3 right-8 w-20"></div>

      {/* Animación central lúdica */}
      <div className="relative inline-flex items-center justify-center mb-5">
        <div className="w-16 h-16 rounded-2xl bg-[#FFE66D] border-[2.5px] border-[#1A1A1A] shadow-[4px_4px_0px_#1A1A1A] flex items-center justify-center animate-bounce">
          <Edit3 className="w-8 h-8 text-[#1A1A1A]" />
        </div>
        <div className="absolute -top-1 -right-2 text-2xl animate-spin" style={{ animationDuration: '4s' }}>
          ✨
        </div>
      </div>

      {/* Mensaje rotativo */}
      <h3 className="text-lg sm:text-xl font-black text-[#1A1A1A] mb-2 min-h-[32px] transition-all duration-300">
        {SCHOOL_LOADING_MESSAGES[messageIndex]}
      </h3>

      <p className="text-xs sm:text-sm font-medium text-[#1A1A1A]/70 max-w-md mx-auto">
        El tutor pedagógico está analizando tu tarea con atención y cuidado escolar.
      </p>

      {/* Barra de progreso lúdica animada */}
      <div className="mt-5 max-w-xs mx-auto h-3 bg-[#FAF7EE] rounded-full border-2 border-[#1A1A1A] overflow-hidden p-0.5">
        <div className="h-full bg-[#FFE66D] rounded-full border border-[#1A1A1A] animate-pulse w-full"></div>
      </div>

      <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] font-bold text-[#1A1A1A]/60">
        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
        <span>Revisión minuciosa de ortografía, tildes y comprensión</span>
      </div>
    </div>
  );
};
