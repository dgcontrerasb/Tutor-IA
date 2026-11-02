/**
 * Modal de Pago y Suscripción (Punto 4)
 * Genera el enlace directo a WhatsApp y código QR dinámico de $5.000 COP al mes.
 * Optimizado para visualización en cualquier pantalla con múltiples formas de cierre.
 */

import React, { useState, useEffect } from 'react';
import { X, MessageCircle, QrCode, Copy, Check, Sparkles, ExternalLink, ArrowLeft, RefreshCw } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
  userName?: string;
  onCheckActivation?: () => Promise<any>;
}

const WHATSAPP_NUMBER = '573213902708';
const SUBSCRIPTION_PRICE = '$5.000 COP';

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  userEmail = '',
  onCheckActivation,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [checkStatusMessage, setCheckStatusMessage] = useState<string | null>(null);

  const handleVerify = async () => {
    if (!onCheckActivation) return;
    setCheckingStatus(true);
    setCheckStatusMessage(null);
    try {
      const profile = await onCheckActivation();
      if (profile?.isSubscriptionActive) {
        setCheckStatusMessage('¡Suscripción confirmada y activa! Disfruta tus 10 consultas diarias.');
        setTimeout(() => {
          onClose();
        }, 1800);
      } else {
        setCheckStatusMessage('Aún no figura activa. Si acabas de transferir, por favor dale un momento al administrador.');
      }
    } catch {
      setCheckStatusMessage('No se pudo verificar el estado en este momento.');
    } finally {
      setCheckingStatus(false);
    }
  };

  // Cerrar con tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Mensaje predeterminado respetuoso y claro para WhatsApp
  const defaultMessage = `Hola, quiero activar mi suscripción mensual en Tutor-IA por ${SUBSCRIPTION_PRICE}. Mi correo registrado es: ${userEmail || '[indica tu correo]'}.`;
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(defaultMessage)}`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(whatsappUrl)}&margin=8`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(whatsappUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div
      onClick={(e) => {
        // Cierre al hacer clic en el fondo oscuro
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 overflow-y-auto bg-black/65 backdrop-blur-xs p-3 sm:p-6 flex items-start justify-center animate-in fade-in duration-150"
    >
      <div className="relative w-full max-w-lg bg-[#FAF7EE] rounded-2xl border-[3px] border-[#1A1A1A] shadow-[8px_8px_0px_#1A1A1A] p-5 sm:p-7 text-center my-4 sm:my-8 max-h-[92vh] overflow-y-auto">
        {/* Washi tape decorativo */}
        <div className="washi-tape top-2.5 left-10 w-24 sm:w-28"></div>
        <div className="washi-tape washi-tape-coral top-2.5 right-12 w-20 sm:w-24"></div>

        {/* Botón Cerrar en esquina superior derecha siempre accesible */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 p-2 bg-[#FF8B94] hover:bg-[#ff7580] rounded-xl border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] cursor-pointer z-20 active:translate-x-0.5 active:translate-y-0.5 transition-all"
          title="Cerrar ventana"
        >
          <X className="w-5 h-5 text-[#1A1A1A]" />
        </button>

        {/* Encabezado */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFE66D] border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] text-xs font-black uppercase tracking-wider mb-2.5 mt-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-900" />
          Plan Escolar Mensual
        </div>

        <h3 className="text-2xl sm:text-3xl font-black text-[#1A1A1A] mb-1">
          Activa tu Suscripción
        </h3>

        {/* Tarjeta de precio */}
        <div className="my-3 p-3 bg-white rounded-xl border-2 border-[#1A1A1A] shadow-[3px_3px_0px_#1A1A1A] inline-block">
          <div className="text-3xl sm:text-4xl font-black text-[#1A1A1A] tracking-tight">
            {SUBSCRIPTION_PRICE}
            <span className="text-xs sm:text-sm font-bold text-[#1A1A1A]/70 uppercase ml-1.5">
              / Mes (30 días)
            </span>
          </div>
          <p className="text-[11px] font-bold text-emerald-800 mt-0.5">
            ✓ Consultas ilimitadas para todas las materias escolares (30 días)
          </p>
        </div>

        {/* Instrucciones paso a paso amigables y claras */}
        <div className="bg-white rounded-xl border-2 border-[#1A1A1A] p-3.5 sm:p-4 text-left text-xs font-bold text-[#1A1A1A] space-y-2.5 mb-4 shadow-[2px_2px_0px_#1A1A1A]">
          <div className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-md bg-[#FFE66D] border border-[#1A1A1A] flex items-center justify-center shrink-0 font-black text-[11px]">
              1
            </span>
            <span className="leading-snug">
              Envía un mensaje por WhatsApp usando el código QR o el botón directo para coordinar el pago y la activación de tu suscripción.
            </span>
          </div>

          <div className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-md bg-[#A8E6CF] border border-[#1A1A1A] flex items-center justify-center shrink-0 font-black text-[11px]">
              2
            </span>
            <span className="leading-snug">
              Adjunta tu comprobante de <strong>{SUBSCRIPTION_PRICE}</strong> indicando tu correo registrado:{' '}
              <code className="bg-[#FAF7EE] px-1 py-0.2 rounded border border-[#1A1A1A] font-mono text-[11px] break-all">
                {userEmail || 'tu correo de Google'}
              </code>.
            </span>
          </div>

          <div className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-md bg-[#A0E7E5] border border-[#1A1A1A] flex items-center justify-center shrink-0 font-black text-[11px]">
              3
            </span>
            <span className="leading-snug">
              Una vez confirmado el pago, el administrador activará tu suscripción para que continúes revisando tus tareas escolares sin interrupciones.
            </span>
          </div>
        </div>

        {/* Código QR interactivo */}
        <div className="bg-white rounded-xl border-2 border-[#1A1A1A] p-3.5 mb-4 shadow-[3px_3px_0px_#1A1A1A] flex flex-col items-center">
          <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#1A1A1A] mb-2">
            <QrCode className="w-4 h-4 text-[#1A1A1A]" />
            <span>Escanea con tu celular para abrir WhatsApp:</span>
          </div>

          <div className="p-2 bg-white rounded-lg border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A]">
            <img
              src={qrImageUrl}
              alt="Código QR de WhatsApp"
              className="w-36 h-36 sm:w-40 sm:h-40 object-contain"
              loading="lazy"
            />
          </div>

          <p className="text-[11px] font-semibold text-[#1A1A1A]/70 mt-1.5">
            Apunta con la cámara de tu teléfono móvil
          </p>
        </div>

        {/* Botones de acción directos */}
        <div className="space-y-2.5">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="neo-btn w-full py-3 sm:py-3.5 bg-[#25D366] hover:bg-[#20ba5a] text-white text-sm sm:text-base font-black rounded-xl cursor-pointer flex items-center justify-center gap-2 shadow-[4px_4px_0px_#1A1A1A]"
          >
            <MessageCircle className="w-5 h-5 fill-white stroke-none" />
            <span>Abrir Chat de WhatsApp</span>
            <ExternalLink className="w-4 h-4" />
          </a>

          {/* Botón para comprobar activación bajo demanda sin sockets continuos */}
          {onCheckActivation && (
            <button
              onClick={handleVerify}
              disabled={checkingStatus}
              className="neo-btn w-full py-2.5 bg-white hover:bg-[#FAF7EE] text-xs font-black text-[#1A1A1A] rounded-xl cursor-pointer flex items-center justify-center gap-2 border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A]"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${checkingStatus ? 'animate-spin' : ''}`} />
              <span>{checkingStatus ? 'Verificando con el servidor...' : '¿Ya pagaste? Comprobar activación'}</span>
            </button>
          )}

          {checkStatusMessage && (
            <div className="p-2 rounded-lg bg-[#FFE66D]/40 border border-[#1A1A1A] text-xs font-bold text-[#1A1A1A]">
              {checkStatusMessage}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <button
              onClick={handleCopyLink}
              className="neo-btn px-3 py-1.5 bg-white text-xs font-bold text-[#1A1A1A] rounded-lg cursor-pointer flex items-center gap-1.5"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Enlace copiado</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar enlace de WhatsApp</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="neo-btn px-3.5 py-1.5 bg-[#FAF7EE] text-xs font-black text-[#1A1A1A] rounded-lg cursor-pointer flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Cerrar y volver a mis tareas</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
