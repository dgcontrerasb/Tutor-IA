/**
 * Home Page Oficial de Tutor-IA — Foco Central + Selector de Nivel (Zero-Scroll)
 * - Logotipo oficial (/logo_full.jpg) y nombre Tutor-IA estrictamente preservados.
 * - Mismo ADN visual interno (#F8FAFC + trama de puntos, #0F172A, Azul Cobalto #2563EB).
 * - Sin cajas innecesarias, sin píldoras de relleno y sin scroll vertical en escritorio.
 * - Pie de página compacto y equilibrado tanto en PC como en móvil.
 */

import React, { useState } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

interface HomePageProps {
  onLoginWithGoogle: () => void;
  onEnterWorkspace?: () => void;
  isLoggedIn?: boolean;
  userName?: string;
  isTrialActive?: boolean;
  trialHoursRemaining?: number;
  isSubscriptionActive?: boolean;
  isAdmin?: boolean;
}

export const HomePage: React.FC<HomePageProps> = ({
  onLoginWithGoogle,
  onEnterWorkspace,
  isLoggedIn = false,
  userName = '',
  isTrialActive = false,
  trialHoursRemaining = 24,
  isSubscriptionActive = false,
  isAdmin = false,
}) => {
  const [selectedLevel, setSelectedLevel] = useState<'primaria' | 'secundaria'>('primaria');

  const isPrimaria = selectedLevel === 'primaria';

  return (
    <div className="min-h-dvh flex flex-col justify-between text-slate-900 selection:bg-blue-100">
      {/* 1. Cabecera Limpia con el Logotipo Oficial Exacto (Intacto) */}
      <header className="w-full bg-white/90 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center shrink-0 select-none">
            <a
              href="/"
              className="flex items-center cursor-pointer transition-opacity hover:opacity-90"
            >
              <img
                src="/logo_full.jpg"
                alt="Tutor-IA"
                className="h-11 sm:h-12 w-auto object-contain"
                draggable={false}
              />
            </a>
          </div>

          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <button
                type="button"
                onClick={onEnterWorkspace}
                className="text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700 cursor-pointer flex items-center gap-1.5 transition-colors"
              >
                <span>Ir a mi cuaderno</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onLoginWithGoogle}
                className="text-xs sm:text-sm font-bold text-slate-700 hover:text-blue-600 cursor-pointer flex items-center gap-1.5 transition-colors"
              >
                <span>Acceder con Google</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 2. Cuerpo Principal: Foco Central + Selector de Nivel en Línea (Zero-Scroll) */}
      <main className="flex-1 flex flex-col items-center justify-center px-5 sm:px-6 py-8">
        <div className="max-w-2xl w-full mx-auto text-center space-y-6 motion-fade-up">
          {/* Selector de Nivel en línea (sin cajas ni píldoras) */}
          <div className="flex items-center justify-center gap-6 sm:gap-8 text-xs sm:text-sm font-bold">
            <button
              type="button"
              onClick={() => setSelectedLevel('primaria')}
              className={`pb-1.5 cursor-pointer transition-colors duration-200 border-b-2 ${
                isPrimaria
                  ? 'text-blue-600 border-blue-600'
                  : 'text-slate-400 hover:text-slate-700 border-transparent'
              }`}
            >
              Primaria
            </button>
            <button
              type="button"
              onClick={() => setSelectedLevel('secundaria')}
              className={`pb-1.5 cursor-pointer transition-colors duration-200 border-b-2 ${
                !isPrimaria
                  ? 'text-blue-600 border-blue-600'
                  : 'text-slate-400 hover:text-slate-700 border-transparent'
              }`}
            >
              Secundaria / Bachillerato
            </button>
          </div>

          {/* Titular y Subtítulo con transición suave al alternar nivel */}
          <div key={selectedLevel} className="space-y-4 motion-panel-swap">
            <h1 className="text-3xl sm:text-5xl lg:text-[52px] font-black text-slate-900 tracking-tight leading-[1.08]">
              {isPrimaria
                ? 'Tareas de Primaria explicadas con paciencia y ejemplos fáciles.'
                : 'Rigor paso a paso para dominar Bachillerato y exámenes.'}
            </h1>

            <p className="text-sm sm:text-base text-slate-600 max-w-lg mx-auto leading-relaxed">
              {isPrimaria
                ? 'Corrige dictados, repasa matemáticas y entiende ciencias naturales con lenguaje cercano para niños. No hacemos la tarea por ti: enseñamos a comprender.'
                : 'Despeja fórmulas de álgebra, física y química, corrige ensayos y descarga fichas ordenadas en PDF desde texto o fotos del cuaderno.'}
            </p>
          </div>

          {/* Llamado a la Acción Principal */}
          <div className="pt-2 space-y-3.5">
            {isLoggedIn ? (
              <div className="space-y-3">
                <p className="text-xs font-semibold text-slate-600 inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Sesión iniciada como <strong className="text-slate-900">{userName}</strong>{' '}
                    ({isAdmin
                      ? 'Administrador'
                      : isSubscriptionActive
                      ? 'Suscripción activa'
                      : isTrialActive
                      ? `Prueba gratis: ${trialHoursRemaining}h restantes`
                      : 'Prueba completada'})
                  </span>
                </p>
                <div>
                  <button
                    type="button"
                    onClick={onEnterWorkspace}
                    className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm sm:text-base font-bold rounded-xl shadow-md shadow-blue-200/70 transition-all inline-flex items-center justify-center gap-2.5 cursor-pointer active:scale-[0.99]"
                  >
                    <span>Abrir mi Cuaderno Escolar</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={onLoginWithGoogle}
                  className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm sm:text-base font-bold rounded-xl shadow-md shadow-blue-200/70 transition-all inline-flex items-center justify-center gap-3 cursor-pointer active:scale-[0.99]"
                >
                  <span className="w-5 h-5 rounded-full bg-white flex items-center justify-center shrink-0">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" />
                      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.27 21.37 7.36 24 12 24z" />
                      <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.95 0 12s.45 3.83 1.25 5.42l4.03-3.15z" />
                      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.27 2.63 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
                    </svg>
                  </span>
                  <span>Iniciar con Google · 24 Horas Gratis</span>
                </button>

                <p className="text-xs text-slate-500 font-medium">
                  18 asignaturas · Fotos de cuaderno · Fichas PDF · <strong className="text-slate-700">$10.000 COP / mes</strong>
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* 3. Pie de Página Compacto y Limpio (PC y Móvil) */}
      <footer className="w-full bg-white/85 backdrop-blur-xs border-t border-slate-200/80">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left text-[11px] sm:text-xs text-slate-500">
          <div className="flex items-center gap-2.5">
            <img
              src="/logo_full.jpg"
              alt="Tutor-IA"
              className="h-6 sm:h-7 w-auto object-contain select-none"
              draggable={false}
            />
            <span className="text-slate-300 hidden sm:inline">•</span>
            <span className="hidden sm:inline">Acompañamiento escolar para Primaria y Secundaria</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-[11px] text-slate-500">
            <span>Sin tarjetas</span>
            <span className="text-slate-300">·</span>
            <span>Nequi, Daviplata o Bre-B</span>
            <span className="text-slate-300">·</span>
            <span className="font-semibold text-slate-700">$10.000 COP/mes</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
