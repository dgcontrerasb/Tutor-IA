/**
 * Pantalla de Transición de Cierre de Sesión (Tutor-IA)
 * Animación de círculos rebotando con sombras en fondo blanco.
 * Incluye mensaje cálido de despedida pedagógica e incitación a volver pronto.
 */

import React from 'react';

interface LogoutLoadingTransitionProps {
  message?: string;
  subMessage?: string;
}

export const LogoutLoadingTransition: React.FC<LogoutLoadingTransitionProps> = ({
  message = '¡Gran trabajo escolar hoy! 🌟',
  subMessage = 'Cerrando sesión con seguridad...',
}) => {
  return (
    <div
      className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center p-6 animate-in fade-in duration-150 select-none text-center"
      role="status"
      aria-live="polite"
    >
      {/* Animación de círculos rebotando */}
      <div className="logout-anim-container mb-9">
        <div className="wrapper">
          <div className="circle"></div>
          <div className="circle2"></div>
          <div className="circle"></div>
          <div className="shadow"></div>
          <div className="shadow"></div>
          <div className="shadow"></div>
        </div>
      </div>

      {/* Mensaje de despedida e incitación a volver */}
      <div className="space-y-2.5 max-w-md mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs">
          <span>📚 Fin de la jornada escolar</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          {message}
        </h2>

        <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
          {subMessage} Tus apuntes, notas y consultas quedaron guardados con total seguridad en este navegador.
        </p>

        <div className="pt-1">
          <p className="text-xs sm:text-sm font-bold text-indigo-700 bg-indigo-50/70 border border-indigo-100/90 px-4 py-2 rounded-xl inline-block">
            ¡Te esperamos pronto para resolver tu próxima tarea del colegio! ✏️🎒
          </p>
        </div>
      </div>
    </div>
  );
};
