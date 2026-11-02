/**
 * Modal Elegante de Bienvenida y Despedida Escolar - Tutor-IA
 * - Fondo opacado y desenfocado (backdrop-blur) para máxima presencia y foco visual.
 * - Saludo personalizado amplio con nombre limpio del estudiante.
 * - Consejo pedagógico o frase motivacional de estudio del día.
 * - Cierre automático en temporizador progresivo o mediante botón interactivo.
 */

import React, { useEffect, useState, useMemo } from 'react';
import { Sparkles, Lightbulb, CheckCircle2, ArrowRight, X, BookOpen, GraduationCap } from 'lucide-react';

export interface AuthToastData {
  type: 'login' | 'logout';
  userName?: string;
  role?: 'admin' | 'student';
}

interface AuthToastProps {
  toast: AuthToastData | null;
  onClose: () => void;
}

// Consejos pedagógicos y hábitos de estudio para los alumnos
const STUDENT_STUDY_TIPS = [
  {
    icon: '💡',
    title: 'Consejo de Lectura Atenta',
    tip: 'Lee siempre el enunciado de una pregunta dos veces antes de empezar a responder. ¡El 50% del éxito es entender lo que te piden!',
  },
  {
    icon: '📝',
    title: 'Consejo de Ortografía',
    tip: 'Las palabras esdrújulas siempre llevan tilde (como "número", "brújula" o "música"). Revisa tus tildes antes de entregar.',
  },
  {
    icon: '🧠',
    title: 'Técnica de Aprendizaje',
    tip: 'Cuando termines de repasar un tema, explícaselo a alguien más con tus propias palabras. Así fijarás el 90% del conocimiento.',
  },
  {
    icon: '⏱️',
    title: 'Hábito de Estudio',
    tip: 'Estudia 25 minutos seguidos y descansa 5 minutos. Tu cerebro retiene mejor la información cuando hace pausas activas.',
  },
  {
    icon: '📐',
    title: 'Paso a Paso en Matemáticas',
    tip: 'Anota primero los datos y las fórmulas antes de sustituir números. Evitarás confusiones de signos y operaciones.',
  },
  {
    icon: '📚',
    title: 'Técnica de Resumen',
    tip: 'Identifica la idea principal de cada párrafo y subráyala. Con 3 a 5 puntos clave puedes dominar cualquier tema escolar.',
  },
];

export const AuthToast: React.FC<AuthToastProps> = ({ toast, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  // Seleccionar un consejo al azar cuando se abre el modal
  const randomTip = useMemo(() => {
    const idx = Math.floor(Math.random() * STUDENT_STUDY_TIPS.length);
    return STUDENT_STUDY_TIPS[idx];
  }, [toast]);

  useEffect(() => {
    if (toast) {
      setIsVisible(true);
      // Auto-cierre progresivo en 4.5 segundos
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 250);
      }, 4800);

      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  if (!toast) return null;

  const isLogin = toast.type === 'login';
  const isAdmin = toast.role === 'admin';

  return (
    <div
      onClick={(e) => {
        // Cierre al pulsar el fondo opaco
        if (e.target === e.currentTarget) {
          setIsVisible(false);
          setTimeout(onClose, 200);
        }
      }}
      role="dialog"
      aria-modal="true"
      className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-xs p-4 flex items-center justify-center transition-opacity duration-200 ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div
        className={`relative w-full max-w-lg bg-[#FAF7EE] rounded-3xl border-[3.5px] border-[#1A1A1A] shadow-[8px_8px_0px_#1A1A1A] p-6 sm:p-8 text-center transition-all duration-300 transform ${
          isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        }`}
      >
        {/* Botón de cierre en la esquina superior derecha */}
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 200);
          }}
          className="absolute top-4 right-4 p-2 bg-white hover:bg-[#FF8B94] text-[#1A1A1A] rounded-xl border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] cursor-pointer transition-colors active:translate-x-0.5 active:translate-y-0.5 z-10"
          title="Cerrar ventana"
        >
          <X className="w-4 h-4 stroke-[2.5]" />
        </button>

        {/* Emblema central llamativo animado */}
        <div className="relative inline-flex items-center justify-center mb-3">
          <div
            style={{
              backgroundColor: isLogin ? '#FFE66D' : '#A0E7E5',
              animationDuration: '1.8s',
            }}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-[3px] border-[#1A1A1A] shadow-[4px_4px_0px_#1A1A1A] flex items-center justify-center text-3xl sm:text-4xl animate-bounce"
          >
            {isLogin ? (isAdmin ? '🛡️' : '🎒') : '👋'}
          </div>
          {isLogin && (
            <div className="absolute -top-1 -right-2 text-xl animate-spin" style={{ animationDuration: '6s' }}>
              ✨
            </div>
          )}
        </div>

        {/* Insignia de estado */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full border-2 border-[#1A1A1A] bg-white shadow-[1.5px_1.5px_0px_#1A1A1A]">
            {isLogin ? '¡Bienvenido a tu Cuaderno!' : 'Sesión Finalizada'}
          </span>
          {isLogin && (
            <span
              style={{
                backgroundColor: isAdmin ? '#FFE66D' : '#A8E6CF',
              }}
              className="text-[11px] font-black uppercase px-2.5 py-1 rounded-full border-2 border-[#1A1A1A] text-[#1A1A1A] shadow-[1.5px_1.5px_0px_#1A1A1A]"
            >
              {isAdmin ? '🛡️ Modo Admin' : '🎒 Estudiante'}
            </span>
          )}
        </div>

        {/* Titular principal con nombre completo del estudiante */}
        <h2 className="text-xl sm:text-2xl font-black text-[#1A1A1A] leading-tight mb-2">
          {isLogin
            ? `¡Hola, ${toast.userName || 'Estudiante'}!`
            : '¡Hasta pronto, estudiante!'}
        </h2>

        <p className="text-xs sm:text-sm font-semibold text-[#1A1A1A]/80 max-w-md mx-auto mb-4 leading-relaxed">
          {isLogin
            ? 'Tu cuenta escolar está activa. Ya puedes revisar tus tareas, resolver problemas paso a paso y guardar tus apuntes.'
            : 'Has cerrado sesión con seguridad. Tus notas y progresos guardados en este navegador siguen disponibles.'}
        </p>

        {/* Tarjeta destacada con Consejo Escolar del Día (o frase motivacional en logout) */}
        {isLogin ? (
          <div className="p-4 bg-white rounded-2xl border-2 border-[#1A1A1A] shadow-[3px_3px_0px_#1A1A1A] text-left mb-5">
            <div className="flex items-center gap-2 text-xs font-black text-[#1A1A1A] uppercase tracking-wider mb-1">
              <span className="text-base">{randomTip.icon}</span>
              <span>{randomTip.title}</span>
            </div>
            <p className="text-xs sm:text-sm font-medium text-[#1A1A1A]/90 leading-relaxed">
              "{randomTip.tip}"
            </p>
          </div>
        ) : (
          <div className="p-4 bg-white rounded-2xl border-2 border-[#1A1A1A] shadow-[3px_3px_0px_#1A1A1A] text-left mb-5">
            <div className="flex items-center gap-2 text-xs font-black text-[#1A1A1A] uppercase tracking-wider mb-1">
              <span className="text-base">🌟</span>
              <span>Constancia y Esfuerzo Escolar</span>
            </div>
            <p className="text-xs sm:text-sm font-medium text-[#1A1A1A]/90 leading-relaxed">
              "El éxito en tus estudios es la suma de pequeños esfuerzos diarios. ¡Sigue dando lo mejor de ti cada día!"
            </p>
          </div>
        )}

        {/* Botón de acción principal centrado */}
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 200);
          }}
          className="neo-btn w-full py-3.5 px-6 bg-[#FFE66D] hover:bg-[#fedd48] text-[#1A1A1A] text-sm sm:text-base font-black rounded-2xl border-[2.5px] border-[#1A1A1A] shadow-[4px_4px_0px_#1A1A1A] cursor-pointer flex items-center justify-center gap-2 transition-transform active:translate-x-1 active:translate-y-1"
        >
          <span>{isLogin ? '¡Empezar a repasar tareas!' : 'Entendido, volver a inicio'}</span>
          <ArrowRight className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* Barra de progreso de auto-cierre */}
        <div className="mt-4 flex items-center justify-center gap-2 text-[10px] font-bold text-[#1A1A1A]/60">
          <span>Se cierra automáticamente en unos segundos</span>
        </div>
      </div>
    </div>
  );
};
