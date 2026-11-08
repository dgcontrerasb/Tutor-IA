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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-17 flex items-center justify-between gap-3">
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

        {/* Lado Derecho - Escritorio (md y superior): Botones directos */}
        <div className="hidden md:flex items-center justify-end gap-2.5 shrink-0">
          {/* Un solo botón inteligente de Plan Escolar / Días Restantes */}
          {isSubscriptionActive ? (
            <button
              onClick={onOpenPayment}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/90 rounded-xl text-xs font-bold shadow-2xs cursor-pointer transition-all active:scale-95 group"
              title="Clic para ver detalles de tu suscripción, renovar o canjear código"
            >
              <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0 group-hover:scale-110 transition-transform" />
              <span>{isAdmin ? '365 días (Admin)' : `${remainingDays} ${remainingDays === 1 ? 'día restante' : 'días restantes'}`}</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-900 px-1.5 py-0.5 rounded-md font-semibold ml-0.5 group-hover:bg-emerald-200">
                Renovar
              </span>
            </button>
          ) : usage.isTrialActive ? (
            <button
              onClick={onOpenPayment}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200/90 rounded-xl text-xs font-bold shadow-2xs cursor-pointer transition-all active:scale-95"
              title="Día de prueba gratuito activo (24 horas)"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Prueba gratis: {usage.trialHoursRemaining ?? 24}h restantes</span>
            </button>
          ) : (
            <button
              onClick={onOpenPayment}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 text-slate-900 rounded-xl text-xs font-bold cursor-pointer shadow-xs transition-all active:scale-95 border border-amber-300/80"
              title="Activar plan escolar mensual por $10.000 COP o canjear código"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-950" />
              <span>Activar Plan ($10.000 COP)</span>
            </button>
          )}

          {/* Botón Legal & Soporte */}
          {onOpenLegal && (
            <button
              onClick={() => onOpenLegal('terms')}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer border border-slate-200 transition-all"
              title="Términos escolares, privacidad y soporte"
            >
              <HelpCircle className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span>Ayuda</span>
            </button>
          )}

          {/* Barra de Perfil / Iniciar Sesión con Google */}
          <AuthBar user={user} loading={authLoading} onRefresh={onRefreshProfile} isSyncing={isSyncing} onLogout={onLogout} />
        </div>

        {/* Lado Derecho - Móvil (< md): Perfil compacto + Menú Desplegable Hamburguesa */}
        <div className="flex md:hidden items-center gap-1.5 shrink-0" ref={menuRef}>
          {/* Botón Menú Hamburguesa */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 cursor-pointer transition-colors"
            aria-label="Abrir menú de navegación"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Menú Desplegable Flotante Móvil */}
          {mobileMenuOpen && (
            <div className="absolute top-16 right-3 w-[calc(100vw-24px)] max-w-sm bg-white rounded-2xl border border-slate-200 shadow-xl p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150 z-50">
              {/* Tarjeta de Usuario / Perfil en el menú */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <AuthBar user={user} loading={authLoading} onRefresh={onRefreshProfile} isSyncing={isSyncing} onLogout={onLogout} />
              </div>

              <div className="space-y-2">
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

                {showActivatePaymentBtn && (
                  <button
                    onClick={handleOpenPaymentClick}
                    className="w-full flex items-center justify-between p-2.5 bg-amber-50 hover:bg-amber-100 rounded-xl border border-amber-200 text-left text-xs font-bold text-amber-950 cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-700" />
                      <div>
                        <span>Activar Plan Escolar</span>
                        <span className="block text-[10px] font-normal text-slate-500">
                          $10.000 COP / Mes (30 días de acceso)
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-amber-700" />
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
  return (
    <div className="relative rounded-2xl bg-white border border-slate-200/90 shadow-xs p-4 sm:p-5 overflow-hidden transition-all">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 max-w-5xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-lg shrink-0">
            📚
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wide">
                Tutor Escolar Inteligente
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-500 font-medium">
                Materia activa: <strong className="text-slate-800">{getSubjectById(selectedSubjectId).name}</strong>
              </span>
            </div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-tight mt-0.5">
              Escribe o sube tu tarea escolar para analizarla paso a paso
            </h2>
          </div>
        </div>
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
