/**
 * Cabecera y Barra de Navegación Profesional de Tutor-IA
 * - Barra superior fija compacta (Sticky Navbar): Ocupa mínimo espacio vertical en móviles y escritorios.
 * - Menú desplegable móvil organizado para acceso rápido a perfil, suscripción, panel y legal.
 * - Selector de nivel escolar integrado y accesible.
 * - Sin desbordamientos ni elementos innecesarios en pantallas pequeñas.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  GraduationCap,
  Shield,
  HelpCircle,
  Menu,
  X,
  CheckCircle2,
  Calendar,
  ChevronRight,
} from 'lucide-react';
import { GradeLevel, SchoolSubjectId, UserUsage } from '../types';
import { UserProfile, logout } from '../services/firebase';
import { AuthBar, splitUserName } from './AuthBar';
import { GradeLevelSwitch, SchoolMascot } from './SchoolMascot';
import { getSubjectById } from '../data/schoolSubjects';

export interface HeaderProps {
  gradeLevel: GradeLevel;
  onGradeLevelChange: (level: GradeLevel) => void;
  usage: UserUsage;
  user: UserProfile | null;
  authLoading: boolean;
  onOpenPayment?: () => void;
  onOpenAdmin?: () => void;
  onOpenLegal?: (tab?: 'terms' | 'privacy' | 'support') => void;
  onRefreshProfile?: () => void;
  isSyncing?: boolean;
  onGoHome?: () => void;
  onLogout?: () => void;
  onOpenTour?: () => void;
}

/**
 * Barra de Navegación Fija y Compacta
 * En móvil se organiza en una sola fila con interruptor deslizante animado y menú desplegable limpio.
 */
export const StickyNavbar: React.FC<HeaderProps> = ({
  gradeLevel,
  onGradeLevelChange,
  usage,
  user,
  authLoading,
  onOpenPayment,
  onOpenAdmin,
  onOpenLegal,
  onRefreshProfile,
  isSyncing,
  onGoHome,
  onLogout,
  onOpenTour,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isSubscriptionActive = Boolean(usage.isSubscriptionActive);
  const isAdmin = user?.role === 'admin';
  const showActivatePaymentBtn = onOpenPayment && !isAdmin && !isSubscriptionActive;
  const remainingDays = usage.subscriptionDaysRemaining ?? 30;

  // Cerrar el menú desplegable al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
    };
    if (mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mobileMenuOpen]);

  // Cerrar menú al cambiar tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLevelSelect = (level: GradeLevel) => {
    onGradeLevelChange(level);
  };

  const handleOpenLegalTab = (tab: 'terms' | 'privacy' | 'support') => {
    setMobileMenuOpen(false);
    if (onOpenLegal) {
      onOpenLegal(tab);
    }
  };

  const handleOpenPaymentClick = () => {
    setMobileMenuOpen(false);
    if (onOpenPayment) {
      onOpenPayment();
    }
  };

  const handleOpenAdminClick = () => {
    setMobileMenuOpen(false);
    if (onOpenAdmin) {
      onOpenAdmin();
    }
  };

  const handleLogoutClick = async () => {
    setMobileMenuOpen(false);
    if (onLogout) {
      onLogout();
      return;
    }
    try {
      await logout();
    } catch (e) {
      console.error('Error al cerrar sesión:', e);
    }
  };

  useEffect(() => {
    splitUserName(user);
  }, [user]);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs transition-all">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Lado Izquierdo: Logotipo Oficial Editorial (Estático, solo visual, no interactivo) */}
        <div className="flex items-center shrink-0 select-none">
          <img
            src="/logo_full.jpg"
            alt="Tutor-IA"
            className="h-11 sm:h-12 w-auto object-contain pointer-events-none select-none"
            draggable={false}
          />
        </div>

        {/* Centro - Botón de Administrador (si aplica) centrado para no interferir */}
        {isAdmin && onOpenAdmin && (
          <div className="hidden md:flex items-center justify-center flex-1">
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/90 rounded-xl text-xs font-bold cursor-pointer transition-all shadow-2xs hover:scale-105"
              title="Panel de Control del Administrador"
            >
              <Shield className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Panel Admin</span>
            </button>
          </div>
        )}

        {/* Lado Derecho - Escritorio (md y superior): Controles limpios sin marcos genéricos */}
        <div className="hidden md:flex items-center justify-end gap-4 shrink-0">
          {/* Visor discreto de Plan Escolar / Días Restantes (sin marco) */}
          {isSubscriptionActive ? (
            <button
              type="button"
              onClick={onOpenPayment}
              className="flex items-center gap-1.5 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer transition-colors group"
              title="Clic para ver detalles de tu suscripción, renovar o canjear código"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              <span>{isAdmin ? '365 días' : `${remainingDays} ${remainingDays === 1 ? 'día' : 'días'}`}</span>
              <span className="text-blue-600 group-hover:underline font-bold ml-0.5">
                Renovar
              </span>
            </button>
          ) : usage.isTrialActive ? (
            <button
              type="button"
              onClick={onOpenPayment}
              className="flex items-center gap-1.5 py-1 text-xs font-semibold text-slate-600 hover:text-blue-600 cursor-pointer transition-colors"
              title="Día de prueba gratuito activo (24 horas)"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
              <span>{usage.trialHoursRemaining ?? 24}h gratis</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenPayment}
              className="py-1 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer transition-colors"
              title="Activar plan escolar mensual por $10.000 COP o canjear código"
            >
              Activar plan ($10.000)
            </button>
          )}

          <span className="h-4 w-px bg-slate-200" aria-hidden="true" />

          {/* Botón Ver Guía Rápida (discreto, sin marco) */}
          {onOpenTour && user && (
            <button
              type="button"
              onClick={onOpenTour}
              className="text-xs font-semibold text-slate-600 hover:text-blue-600 cursor-pointer transition-colors"
              title="Ver guía rápida de uso"
            >
              Guía
            </button>
          )}

          {/* Botón Legal & Soporte (discreto, sin marco) */}
          {onOpenLegal && (
            <button
              type="button"
              onClick={() => onOpenLegal('terms')}
              className="text-xs font-semibold text-slate-600 hover:text-blue-600 cursor-pointer transition-colors"
              title="Términos escolares, privacidad y soporte"
            >
              Ayuda
            </button>
          )}

          {/* Barra de Perfil / Iniciar Sesión con Google */}
          <AuthBar user={user} loading={authLoading} onRefresh={onRefreshProfile} isSyncing={isSyncing} onLogout={onLogout} />
        </div>

        {/* Lado Derecho - Móvil (< md): Visor discreto sin marco + Menú Desplegable Hamburguesa */}
        <div className="flex md:hidden items-center gap-3 shrink-0" ref={menuRef}>
          {/* Visor discreto sin marco de días/horas restantes */}
          {onOpenPayment && (
            isSubscriptionActive ? (
              <button
                type="button"
                onClick={onOpenPayment}
                className="flex items-center gap-1.5 py-1 text-xs font-semibold text-slate-700 hover:text-slate-950 cursor-pointer transition-colors"
                title="Ver detalles de tu suscripción o renovar"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span>{isAdmin ? '365d' : `${remainingDays}d`}</span>
              </button>
            ) : usage.isTrialActive ? (
              <button
                type="button"
                onClick={onOpenPayment}
                className="flex items-center gap-1.5 py-1 text-xs font-semibold text-slate-700 hover:text-blue-600 cursor-pointer transition-colors"
                title="Horas restantes de tu día de prueba gratis"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                <span>{usage.trialHoursRemaining ?? 24}h</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenPayment}
                className="py-1 text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer transition-colors"
                title="Activar plan escolar"
              >
                Activar
              </button>
            )
          )}

          {/* Botón Menú Hamburguesa */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-700 hover:text-slate-950 cursor-pointer transition-colors"
            aria-label="Abrir menú de navegación"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Menú Desplegable Flotante Móvil */}
          {mobileMenuOpen && (
            <div className="absolute top-16 right-3 w-[calc(100vw-24px)] max-w-sm bg-white rounded-2xl border border-slate-200 shadow-xl p-4 space-y-3 motion-panel-swap z-50">
              {/* Tarjeta de Usuario / Perfil en el menú */}
              <div className="pb-3 border-b border-slate-100">
                <AuthBar user={user} loading={authLoading} onRefresh={onRefreshProfile} isSyncing={isSyncing} onLogout={onLogout} />
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                {/* Estado discreto del Plan / Días o Horas restantes sin marco */}
                {onOpenPayment && (
                  isSubscriptionActive ? (
                    <button
                      type="button"
                      onClick={handleOpenPaymentClick}
                      className="w-full flex items-center justify-between py-2.5 text-left text-slate-800 hover:text-blue-600 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                        <div>
                          <span className="font-bold">
                            {isAdmin
                              ? '365 días activos'
                              : `${remainingDays} ${remainingDays === 1 ? 'día restante' : 'días restantes'}`}
                          </span>
                          <span className="block text-[11px] text-slate-400">
                            Verificar estado o renovar
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                    </button>
                  ) : usage.isTrialActive ? (
                    <button
                      type="button"
                      onClick={handleOpenPaymentClick}
                      className="w-full flex items-center justify-between py-2.5 text-left text-slate-800 hover:text-blue-600 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                        <div>
                          <span className="font-bold">Prueba gratis: {usage.trialHoursRemaining ?? 24}h restantes</span>
                          <span className="block text-[11px] text-slate-400">
                            Activar mes completo ($10.000 COP)
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                    </button>
                  ) : showActivatePaymentBtn ? (
                    <button
                      type="button"
                      onClick={handleOpenPaymentClick}
                      className="w-full flex items-center justify-between py-2.5 text-left text-blue-600 font-bold cursor-pointer transition-colors"
                    >
                      <div>
                        <span>Activar Plan Escolar</span>
                        <span className="block text-[11px] font-normal text-slate-400">
                          $10.000 COP / Mes (30 días)
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-blue-500 shrink-0" />
                    </button>
                  ) : null
                )}

                {isAdmin && onOpenAdmin && (
                  <button
                    onClick={handleOpenAdminClick}
                    className="w-full flex items-center justify-between p-2.5 bg-amber-50 hover:bg-amber-100 rounded-xl border border-amber-200 text-left text-xs font-bold text-amber-950 cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-amber-700" />
                      <span>Panel de Administrador</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-amber-700" />
                  </button>
                )}

                {onOpenTour && user && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenTour();
                    }}
                    className="w-full p-2.5 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200 text-left text-xs font-bold text-blue-900 flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      <span>Ver guía rápida de uso</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-blue-600" />
                  </button>
                )}

                {onOpenLegal && (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => handleOpenLegalTab('terms')}
                      className="p-2 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-left text-xs font-semibold text-slate-700 flex items-center gap-1.5 cursor-pointer"
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>Ayuda</span>
                    </button>
                    <button
                      onClick={() => handleOpenLegalTab('privacy')}
                      className="p-2 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-left text-xs font-semibold text-slate-700 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Shield className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Privacidad</span>
                    </button>
                  </div>
                )}

                {user && (
                  <button
                    type="button"
                    onClick={handleLogoutClick}
                    className="w-full p-2 text-center text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl border border-red-200 cursor-pointer transition-colors"
                  >
                    Cerrar sesión
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export interface HeroBannerProps {
  gradeLevel?: GradeLevel;
  onGradeLevelChange?: (level: GradeLevel) => void;
  selectedSubjectId?: SchoolSubjectId;
  isLoading?: boolean;
}

/**
 * Banner Hero Dinámico estilo Tutor-IA Escolar
 * Cambia de color, ambiente y mensaje entre Modo Primaria y Modo Bachillerato,
 * integrando la mascota escolar interactiva.
 */
export const HeroBanner: React.FC<HeroBannerProps> = ({
  selectedSubjectId = 'lengua',
}) => {
  const subject = getSubjectById(selectedSubjectId);
  return (
    <div className="rounded-2xl bg-white border border-slate-200/90 shadow-xs p-3.5 sm:px-5 sm:py-3.5 transition-all">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-lg shrink-0 shadow-2xs"
            style={{ backgroundColor: subject.color }}
          >
            {subject.icon}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wide">
                Tutor Escolar Inteligente
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-500 font-medium">
                Materia activa: <strong className="text-slate-800">{subject.name}</strong>
              </span>
            </div>
            <h2 className="text-xs sm:text-sm font-bold text-slate-800 truncate">
              Escribe o sube tu tarea escolar para analizarla paso a paso
            </h2>
          </div>
        </div>
        <span className="text-[11px] font-bold px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl shrink-0 hidden md:inline-flex items-center gap-1">
          <span>⚡</span> Dual-Pane Studio
        </span>
      </div>
    </div>
  );
};

/**
 * Componente Header que combina StickyNavbar y HeroBanner
 */
export const Header: React.FC<HeaderProps> = (props) => {
  return (
    <>
      <StickyNavbar {...props} />
      <HeroBanner gradeLevel={props.gradeLevel} onGradeLevelChange={props.onGradeLevelChange} />
    </>
  );
};
