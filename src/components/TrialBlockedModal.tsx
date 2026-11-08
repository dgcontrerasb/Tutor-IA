/**
 * Modal de Bloqueo por Fin de Día de Prueba Gratuita (24 horas)
 * Aparece únicamente cuando el estudiante ha completado sus 24 horas gratuitas de prueba.
 * Rediseñado al estilo Bento Grid Moderno con salida limpia hacia la Home Page.
 */

import React from 'react';
import { X, Sparkles, CheckCircle2, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';

interface TrialBlockedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPayment?: () => void;
  onGoHome?: () => void;
}

export const TrialBlockedModal: React.FC<TrialBlockedModalProps> = ({
  isOpen,
  onClose,
  onOpenPayment,
  onGoHome,
}) => {
  if (!isOpen) return null;

  const handleReturnHome = () => {
    onClose();
    if (onGoHome) {
      onGoHome();
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) handleReturnHome();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 text-center overflow-hidden">
        <button
          onClick={handleReturnHome}
          className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 rounded-xl cursor-pointer transition-all active:scale-95"
          title="Cerrar y volver al inicio"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icono central */}
        <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-center mb-4 text-3xl shadow-xs">
          🎓
        </div>

        <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mb-2">
          ¡Tu día de prueba gratuita ha terminado!
        </h3>

        <p className="text-xs sm:text-sm text-slate-600 mb-6 leading-relaxed max-w-sm mx-auto">
          Esperamos que Tutor-IA te haya ayudado a comprender y resolver mejor tus tareas escolares hoy. Para continuar estudiando con tu tutor todo el mes, activa tu pase escolar:
        </p>

        {/* Beneficios de la suscripción */}
        <div className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-4 text-left space-y-2.5 mb-6 text-xs text-slate-700">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/70 font-bold text-slate-900">
            <span>Pase Escolar Mensual</span>
            <span className="text-indigo-600 text-sm">$10.000 COP / mes</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">30 días continuos de acompañamiento en 18 materias escolares</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Explicaciones paso a paso y verificación de ejercicios</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Subida y análisis de fotos de tu cuaderno manuscrito (5 fotos/día)</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>Pagos directos por <strong>Nequi, Daviplata o Bre-B</strong> (Sin cobros automáticos)</span>
          </div>
        </div>

        {/* Botón de acción de pago */}
        {onOpenPayment && (
          <button
            onClick={() => {
              onClose();
              onOpenPayment();
            }}
            className="w-full py-3.5 px-6 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-sm cursor-pointer flex items-center justify-center gap-2 transition-all mb-3"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Activar mes de tutoría ($10.000 COP)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}

        {/* Botón de escape limpio hacia la Home Page */}
        <button
          onClick={handleReturnHome}
          className="w-full py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver a la página de inicio</span>
        </button>

        <p className="text-[11px] text-slate-400 mt-2">
          Solo el administrador otorga códigos de activación tras verificar tu transferencia.
        </p>
      </div>
    </div>
  );
};
