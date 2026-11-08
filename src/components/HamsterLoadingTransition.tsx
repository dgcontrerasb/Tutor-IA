/**
 * Pantalla de Transición de Autenticación de Google (Tutor-IA)
 * Fondo totalmente blanco con animación del hámster corriendo en la rueda.
 */

import React from 'react';

interface HamsterLoadingTransitionProps {
  message?: string;
}

export const HamsterLoadingTransition: React.FC<HamsterLoadingTransitionProps> = ({
  message = 'Iniciando sesión con Google...',
}) => {
  return (
    <div
      className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center p-4 animate-in fade-in duration-150 selection:bg-indigo-100"
      aria-live="polite"
    >
      {/* Animación del Hámster corriendo en la rueda */}
      <div
        aria-label="Orange and tan hamster running in a metal wheel"
        role="img"
        className="wheel-and-hamster"
      >
        <div className="wheel"></div>
        <div className="hamster">
          <div className="hamster__body">
            <div className="hamster__head">
              <div className="hamster__ear"></div>
              <div className="hamster__eye"></div>
              <div className="hamster__nose"></div>
            </div>
            <div className="hamster__limb hamster__limb--fr"></div>
            <div className="hamster__limb hamster__limb--fl"></div>
            <div className="hamster__limb hamster__limb--br"></div>
            <div className="hamster__limb hamster__limb--bl"></div>
            <div className="hamster__tail"></div>
          </div>
        </div>
        <div className="spoke"></div>
      </div>

      {/* Texto pedagógico sutil */}
      <div className="mt-8 text-center space-y-1">
        <p className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
          {message}
        </p>
        <p className="text-xs text-slate-400 font-medium">
          Preparando tu cuaderno escolar...
        </p>
      </div>
    </div>
  );
};
