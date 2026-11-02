/**
 * Modal de Bloqueo por Fin de Prueba Gratuita (Punto 3)
 * Aparece cuando el usuario consume sus 3 consultas de prueba.
 */

import React from 'react';
import { X, Sparkles, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

interface TrialBlockedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPayment?: () => void;
}

export const TrialBlockedModal: React.FC<TrialBlockedModalProps> = ({
  isOpen,
  onClose,
  onOpenPayment,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-[#FAF7EE] rounded-2xl border-[3px] border-[#1A1A1A] shadow-[8px_8px_0px_#1A1A1A] p-6 sm:p-7 text-center overflow-hidden">
        {/* Washi tape decorativo */}
        <div className="washi-tape top-3 left-10 w-28"></div>
        <div className="washi-tape washi-tape-coral top-3 right-10 w-24"></div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 bg-[#FF8B94] rounded-lg border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] cursor-pointer"
          title="Cerrar"
        >
          <X className="w-4 h-4 text-[#1A1A1A]" />
        </button>

        {/* Icono central */}
        <div className="w-16 h-16 mx-auto rounded-2xl bg-[#FFE66D] border-2 border-[#1A1A1A] shadow-[3px_3px_0px_#1A1A1A] flex items-center justify-center mb-4 mt-2 text-2xl">
          🎓
        </div>

        <h3 className="text-xl sm:text-2xl font-black text-[#1A1A1A] mb-1.5">
          ¡Has completado tus 3 usos de prueba!
        </h3>

        <p className="text-xs sm:text-sm font-semibold text-[#1A1A1A]/80 mb-5 leading-relaxed max-w-sm mx-auto">
          Esperamos que te haya gustado cómo Tutor-IA revisa tus tareas. Para continuar disfrutando del tutor escolar, activa tu suscripción.
        </p>

        {/* Beneficios de la suscripción */}
        <div className="bg-white rounded-xl border-2 border-[#1A1A1A] shadow-[3px_3px_0px_#1A1A1A] p-4 text-xs sm:text-sm text-left mb-6 space-y-2.5 font-bold text-[#1A1A1A]">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>Consultas ilimitadas para todas tus materias durante todo el mes</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>Resúmenes rápidos con puntos clave para estudiar</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>Lectura de fotos de cuaderno con letra manuscrita</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>Activación rápida y soporte directo del tutor</span>
          </div>
        </div>

        {/* Botón de pago / activación */}
        <div className="space-y-2">
          <button
            onClick={() => {
              onClose();
              if (onOpenPayment) onOpenPayment();
            }}
            className="neo-btn w-full py-3.5 bg-[#FFE66D] hover:bg-[#fedd48] text-[#1A1A1A] text-sm sm:text-base font-black rounded-xl cursor-pointer flex items-center justify-center gap-2 shadow-[4px_4px_0px_#1A1A1A]"
          >
            <span>Quiero activar mi suscripción</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <p className="text-[11px] font-medium text-[#1A1A1A]/70">
            Tu cuenta sigue guardada. En cuanto actives tu plan, podrás seguir revisando al instante.
          </p>
        </div>
      </div>
    </div>
  );
};
