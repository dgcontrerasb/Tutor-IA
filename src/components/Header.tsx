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
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b-[2.5px] border-[#181829] shadow-[0_3px_0px_rgba(24,24,41,0.08)]">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2">
        {/* Lado Izquierdo: Logotipo limpio y completo */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="neo-btn flex items-center gap-2 px-3 py-1.5 bg-[#FFE66D] hover:bg-[#fedd48] text-[#1A1A1A] rounded-xl text-xs sm:text-sm font-black cursor-pointer shadow-[2px_2px_0px_#1A1A1A] shrink-0 transition-transform active:scale-95"
            title="Tutor-IA - Inicio"
          >
            <span className="text-sm sm:text-base">✏️</span>
            <span className="tracking-tight font-extrabold whitespace-nowrap">
              Tutor-IA
            </span>
          </button>
        </div>

        {/* Lado Derecho - Escritorio (md y superior): Botones directos */}
        <div className="hidden md:flex items-center justify-end gap-2 shrink-0">
          {/* Panel de Administrador si aplica */}
          {isAdmin && onOpenAdmin && (
            <button
              onClick={onOpenAdmin}
              className="neo-btn flex items-center gap-1.5 px-3 py-1.5 bg-[#FFE66D] hover:bg-[#fedd48] text-[#1A1A1A] rounded-xl text-xs font-black cursor-pointer shadow-[2px_2px_0px_#1A1A1A] whitespace-nowrap shrink-0"
              title="Panel de Control del Administrador"
            >
              <Shield className="w-3.5 h-3.5 text-amber-900 shrink-0" />
              <span>Panel Admin</span>
            </button>
          )}

          {/* Badge de suscripción activa */}
          {!isAdmin && isSubscriptionActive && (
            <div
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-[#A8E6CF] rounded-xl border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] text-xs font-black text-[#1A1A1A] whitespace-nowrap shrink-0"
              title={`Tu plan escolar tiene ${remainingDays} días activos`}
            >
              <span className="text-[11px] font-black">📅 {remainingDays} días activos</span>
            </div>
          )}

          {/* Botón Activar Suscripción */}
          {showActivatePaymentBtn && (
            <button
              onClick={onOpenPayment}
              className="neo-btn flex items-center gap-1 px-3 py-1.5 bg-[#FFE66D] hover:bg-[#fedd48] text-[#1A1A1A] rounded-xl text-xs font-black cursor-pointer shadow-[2px_2px_0px_#1A1A1A] whitespace-nowrap shrink-0"
              title="Activar suscripción escolar"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-900 shrink-0" />
              <span>Activar Plan</span>
            </button>
          )}

          {/* Botón Legal & Soporte */}
          {onOpenLegal && (
            <button
              onClick={() => onOpenLegal('terms')}
              className="neo-btn flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-gray-50 text-[#1A1A1A] rounded-xl text-xs font-black cursor-pointer shadow-[2px_2px_0px_#1A1A1A] whitespace-nowrap shrink-0"
              title="Términos escolares, privacidad y soporte"
            >
              <HelpCircle className="w-3.5 h-3.5 text-blue-700 shrink-0" />
              <span>Ayuda & Legal</span>
            </button>
          )}

          {/* Barra de Usuario Google */}
          <AuthBar user={user} loading={authLoading} onRefresh={onRefreshProfile} isSyncing={isSyncing} />
        </div>

        {/* Lado Derecho - Móvil (< md): Perfil compacto + Menú Desplegable Hamburguesa */}
        <div className="flex md:hidden items-center gap-1.5 shrink-0" ref={menuRef}>
          {/* Botón rápido de Activar en móvil si no tiene plan activo */}
          {showActivatePaymentBtn && (
            <button
              onClick={onOpenPayment}
              className="neo-btn flex items-center gap-1 px-2 py-1 bg-[#FFE66D] text-[#1A1A1A] rounded-lg text-xs font-black border border-[#1A1A1A] shadow-[1.5px_1.5px_0px_#1A1A1A] whitespace-nowrap shrink-0"
              title="Activar plan escolar"
            >
              <Sparkles className="w-3 h-3 text-amber-900 shrink-0" />
              <span className="text-[11px]">Activar</span>
            </button>
          )}

          {/* Indicador de suscripción activa en móvil */}
          {!isAdmin && isSubscriptionActive && (
            <div
              className="px-2 py-1 bg-[#A8E6CF] rounded-lg border border-[#1A1A1A] shadow-[1.5px_1.5px_0px_#1A1A1A] text-[11px] font-black text-[#1A1A1A] flex items-center gap-1 whitespace-nowrap shrink-0"
              title={`${remainingDays} días de suscripción`}
            >
              <span>{remainingDays}d</span>
            </div>
          )}

          {/* Botón Menú Hamburguesa / Desplegable */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-9 h-9 rounded-xl bg-white hover:bg-[#FAF7EE] text-[#1A1A1A] border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] flex items-center justify-center cursor-pointer transition-transform active:scale-95"
            aria-label="Abrir menú de navegación"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Menú Desplegable Flotante Móvil */}
          {mobileMenuOpen && (
            <div className="absolute top-14 right-3 w-[calc(100vw-24px)] max-w-sm bg-[#FAF7EE] rounded-2xl border-[3px] border-[#1A1A1A] shadow-[6px_6px_0px_#1A1A1A] p-3.5 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150 z-50">
              {/* Tarjeta de Usuario / Perfil en el menú */}
              <div className="p-2.5 bg-white rounded-xl border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A]">
                <AuthBar user={user} loading={authLoading} onRefresh={onRefreshProfile} isSyncing={isSyncing} />
              </div>

              {/* Acciones principales del menú */}
              <div className="space-y-2">
                {/* Selector de nivel escolar dentro del menú con el interruptor deslizante */}
                <div className="p-2.5 bg-white rounded-xl border border-[#1A1A1A] flex flex-col gap-2">
                  <span className="text-xs font-black text-[#1A1A1A] flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-[#1A1A1A]" />
                    <span>Nivel Educativo Activo:</span>
                  </span>
                  <div className="flex justify-center">
                    <GradeLevelSwitch
                      gradeLevel={gradeLevel}
                      onChange={handleLevelSelect}
                      size="compact"
                    />
                  </div>
                </div>

                {/* Si es Administrador */}
                {isAdmin && onOpenAdmin && (
                  <button
                    onClick={handleOpenAdminClick}
                    className="w-full flex items-center justify-between p-2.5 bg-[#FFE66D] hover:bg-[#fedd48] rounded-xl border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] text-left text-xs font-black cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-amber-900" />
                      <span>Panel de Administrador</span>
                    </div>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}

                {/* Si no tiene suscripción activa */}
                {showActivatePaymentBtn && (
                  <button
                    onClick={handleOpenPaymentClick}
                    className="w-full flex items-center justify-between p-2.5 bg-[#FFE66D] hover:bg-[#fedd48] rounded-xl border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] text-left text-xs font-black cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-900" />
                      <div>
                        <span>Activar Plan Escolar</span>
                        <span className="block text-[10px] font-bold text-[#1A1A1A]/70 leading-none">
                          $5.000 COP / 30 días ilimitados
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}

                {/* Si ya tiene suscripción activa */}
                {!isAdmin && isSubscriptionActive && (
                  <div className="p-2.5 bg-[#A8E6CF] rounded-xl border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] flex items-center justify-between text-xs font-black">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-800" />
                      <div>
                        <span className="text-emerald-950">Plan Escolar Activo</span>
                        <span className="block text-[10px] font-bold text-emerald-900/80">
                          {remainingDays} días de acceso ilimitado
                        </span>
                      </div>
                    </div>
                    <Calendar className="w-4 h-4 text-emerald-800" />
                  </div>
                )}

                {/* Acceso a Términos, Privacidad y Soporte */}
                {onOpenLegal && (
                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    <button
                      onClick={() => handleOpenLegalTab('terms')}
                      className="p-2 bg-white hover:bg-gray-50 rounded-xl border border-[#1A1A1A] text-left text-[11px] font-black text-[#1A1A1A] flex items-center gap-1.5 shadow-[1px_1px_0px_#1A1A1A] cursor-pointer"
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                      <span>Ayuda y Soporte</span>
                    </button>
                    <button
                      onClick={() => handleOpenLegalTab('privacy')}
                      className="p-2 bg-white hover:bg-gray-50 rounded-xl border border-[#1A1A1A] text-left text-[11px] font-black text-[#1A1A1A] flex items-center gap-1.5 shadow-[1px_1px_0px_#1A1A1A] cursor-pointer"
                    >
                      <Shield className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                      <span>Privacidad Escolar</span>
                    </button>
                  </div>
                )}

                {user && (
                  <button
                    type="button"
                    onClick={handleLogoutClick}
                    className="w-full p-2 text-center text-xs font-black text-red-700 hover:bg-red-50 rounded-xl border border-red-300 cursor-pointer transition-colors"
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
  gradeLevel = 'primaria',
  onGradeLevelChange,
  selectedSubjectId = 'lengua',
  isLoading = false,
}) => {
  const isPrimaria = gradeLevel === 'primaria';

  return (
    <div
      className={`relative rounded-2xl border-[2.5px] border-[#181829] shadow-[4px_4px_0px_#181829] p-4 sm:p-5 overflow-hidden transition-all duration-300 ${
        isPrimaria ? 'bg-white' : 'bg-gradient-to-br from-white to-[#F0FDFA]'
      }`}
    >
      <div className="flex flex-col items-center justify-center max-w-xl mx-auto space-y-2.5">
        {/* Insignia dinámica según Primaria vs Bachillerato */}
        <div
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border-2 border-[#181829] shadow-[2px_2px_0px_#181829] text-[11px] font-black uppercase tracking-wider transition-colors duration-200 ${
            isPrimaria ? 'bg-[#FFE66D] text-[#181829]' : 'bg-[#38BDF8] text-[#181829]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-[#181829]" />
          <span>
            {isPrimaria
              ? '🌟 Modo Explorador · Primaria'
              : '🚀 Modo Reto · Bachillerato'}
          </span>
        </div>

        {/* Único Interruptor Deslizante Protagonista (Primaria <-> Bachillerato) */}
        {onGradeLevelChange && (
          <div className="pt-0.5 flex flex-col items-center gap-1 w-full">
            <GradeLevelSwitch
              gradeLevel={gradeLevel}
              onChange={onGradeLevelChange}
              size="large"
            />
            <span className="text-[11px] font-bold text-[#181829]/65 text-center">
              {isPrimaria
                ? 'Explicaciones con cuentos y ejemplos fáciles'
                : 'Desarrollo de fórmulas, talleres y preparación de exámenes'}
            </span>
          </div>
        )}

        {/* Compañero / Mascota Escolar Interactiva */}
        <div className="w-full pt-1">
          <SchoolMascot
            gradeLevel={gradeLevel}
            subjectId={selectedSubjectId}
            isLoading={isLoading}
          />
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
