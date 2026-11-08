/**
 * Modal de Pago y Suscripción (Punto 4) & Canje de Código de Activación
 * Permite al estudiante transferir vía QR/WhatsApp y/o canjear su código único de 30 días.
 * Rediseñado al estilo Bento Grid Moderno.
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  MessageCircle,
  QrCode,
  Copy,
  Check,
  Sparkles,
  ExternalLink,
  ArrowLeft,
  RefreshCw,
  ShieldCheck,
  KeyRound,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { redeemActivationCode } from '../services/adminService';
import { auth } from '../services/firebase';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
  userUid?: string;
  userName?: string;
  onCheckActivation?: () => Promise<any>;
  onGoHome?: () => void;
}

const WHATSAPP_NUMBER = '573213902708';
const SUBSCRIPTION_PRICE = '$10.000 COP';

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  userEmail = '',
  userUid = '',
  onCheckActivation,
  onGoHome,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [checkStatusMessage, setCheckStatusMessage] = useState<string | null>(null);

  // Estados para canje de código
  const [inputCode, setInputCode] = useState('');
  const [redeeming, setRedeeming] = useState(false);
  const [redeemError, setRedeemError] = useState<string | null>(null);
  const [redeemSuccess, setRedeemSuccess] = useState<string | null>(null);

  const handleVerify = async () => {
    if (!onCheckActivation) return;
    setCheckingStatus(true);
    setCheckStatusMessage(null);
    try {
      const profile = await onCheckActivation();
      if (profile?.isSubscriptionActive) {
        setCheckStatusMessage('¡Suscripción confirmada y activa! Disfruta de tu acceso completo de 30 días.');
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

  // Manejar el canje del código criptográfico
  const handleRedeemCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setRedeemError(null);
    setRedeemSuccess(null);

    const codeToTest = inputCode.trim().toUpperCase();
    if (!codeToTest) {
      setRedeemError('Por favor ingresa tu código de activación.');
      return;
    }

    const effectiveUid = userUid || auth.currentUser?.uid;
    const effectiveEmail = userEmail || auth.currentUser?.email;

    if (!effectiveEmail || !effectiveUid) {
      setRedeemError('Debes iniciar sesión con tu cuenta de Google para canjear tu código.');
      return;
    }

    setRedeeming(true);
    try {
      const result = await redeemActivationCode(codeToTest, { uid: effectiveUid, email: effectiveEmail });
      if (result.success) {
        setRedeemSuccess(result.message);
        setInputCode('');
        if (onCheckActivation) {
          await onCheckActivation();
        }
        setTimeout(() => {
          onClose();
        }, 2200);
      } else {
        setRedeemError(result.message);
      }
    } catch (err) {
      console.error('Error al procesar canje:', err);
      setRedeemError('Ocurrió un error inesperado al procesar el código.');
    } finally {
      setRedeeming(false);
    }
  };

  // Cerrar con tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      setRedeemError(null);
      setRedeemSuccess(null);
      setInputCode('');
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
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs p-3 sm:p-6 flex items-start justify-center animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 text-center my-4 sm:my-8 max-h-[92vh] overflow-y-auto">
        {/* Botón Cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 rounded-xl cursor-pointer transition-all active:scale-95 z-20"
          title="Cerrar ventana"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Encabezado */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-xs font-semibold text-indigo-700 mb-2 mt-1">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          Plan Escolar Mensual
        </div>

        <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
          Activa tu Suscripción
        </h3>

        {/* Tarjeta de precio Bento */}
        <div className="my-3 p-4 bg-slate-50/90 rounded-2xl border border-slate-200 inline-block w-full max-w-sm">
          <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {SUBSCRIPTION_PRICE}
            <span className="text-xs sm:text-sm font-medium text-slate-500 uppercase ml-2">
              / 30 días
            </span>
          </div>
          <p className="text-xs font-medium text-emerald-700 mt-1 flex items-center justify-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Acceso completo para las 18 materias escolares</span>
          </p>
        </div>

        {/* ========================================================================= */}
        {/* CASILLA PRINCIPAL: CANJEAR CÓDIGO DE ACTIVACIÓN DE 30 DÍAS */}
        {/* ========================================================================= */}
        <div className="my-4 p-4.5 bg-gradient-to-b from-indigo-50/90 to-slate-50 rounded-2xl border-2 border-indigo-200/90 text-left shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-extrabold text-indigo-950">
                ¿Ya tienes tu código de activación?
              </h4>
              <p className="text-[11px] text-indigo-800/80 font-normal">
                Pega aquí el código que te envió el administrador por WhatsApp:
              </p>
            </div>
          </div>

          <form onSubmit={handleRedeemCode} className="space-y-2.5 mt-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                placeholder="Ej: TUTOR-8F2A-9K4E"
                disabled={redeeming}
                className="flex-1 px-3.5 py-2.5 bg-white border border-indigo-300 rounded-xl text-xs sm:text-sm font-mono font-bold text-slate-900 uppercase tracking-wider placeholder:normal-case placeholder:font-sans placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
              />
              <button
                type="submit"
                disabled={redeeming || !inputCode.trim()}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs transition-all disabled:opacity-50 flex items-center gap-1.5 shrink-0"
              >
                {redeeming ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Validando...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Canjear</span>
                  </>
                )}
              </button>
            </div>

            {/* Mensajes de retroalimentación de canje */}
            {redeemError && (
              <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{redeemError}</span>
              </div>
            )}

            {redeemSuccess && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 font-semibold animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{redeemSuccess}</span>
              </div>
            )}
          </form>
        </div>

        {/* Separador sutil */}
        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            ¿Aún no tienes un código?
          </span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        {/* Instrucciones paso a paso Bento */}
        <div className="bg-slate-50/70 rounded-2xl border border-slate-200/80 p-4 text-left text-xs font-medium text-slate-700 space-y-3 mb-4">
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 font-bold text-xs">
              1
            </span>
            <span className="leading-snug pt-0.5">
              Transfiere <strong>{SUBSCRIPTION_PRICE}</strong> vía <strong>Nequi, Daviplata o Bre-B</strong> y abre WhatsApp.
            </span>
          </div>

          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 font-bold text-xs">
              2
            </span>
            <span className="leading-snug pt-0.5">
              Adjunta tu comprobante indicando tu correo registrado:{' '}
              <code className="bg-white px-1.5 py-0.5 rounded-md border border-slate-200 font-mono text-[11px] text-slate-800 break-all select-all">
                {userEmail || 'tu correo de Google'}
              </code>.
            </span>
          </div>

          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 font-bold text-xs">
              3
            </span>
            <span className="leading-snug pt-0.5">
              Solo el <strong>administrador</strong> genera y te enviará tu código único para que lo pegues en la casilla de arriba.
            </span>
          </div>
        </div>

        {/* Código QR interactivo */}
        <div className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-4 mb-5 flex flex-col items-center">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mb-2.5">
            <QrCode className="w-4 h-4 text-slate-700" />
            <span>Escanea con tu celular para abrir WhatsApp:</span>
          </div>

          <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <img
              src={qrImageUrl}
              alt="Código QR de WhatsApp"
              className="w-36 h-36 sm:w-40 sm:h-40 object-contain rounded-lg"
              loading="lazy"
            />
          </div>

          <p className="text-[11px] text-slate-400 mt-2">
            Apunta con la cámara de tu teléfono móvil
          </p>
        </div>

        {/* Botones de acción directos */}
        <div className="space-y-3">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-sm sm:text-base font-semibold rounded-2xl shadow-sm cursor-pointer flex items-center justify-center gap-2 transition-all"
          >
            <MessageCircle className="w-5 h-5 fill-white stroke-none" />
            <span>Abrir Chat de WhatsApp</span>
            <ExternalLink className="w-4 h-4" />
          </a>

          {/* Botón para comprobar activación */}
          {onCheckActivation && (
            <button
              onClick={handleVerify}
              disabled={checkingStatus}
              className="w-full py-2.5 bg-white hover:bg-slate-50 active:scale-98 text-xs font-semibold text-slate-700 rounded-xl cursor-pointer flex items-center justify-center gap-2 border border-slate-200 shadow-2xs transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-indigo-600 ${checkingStatus ? 'animate-spin' : ''}`} />
              <span>{checkingStatus ? 'Verificando con el servidor...' : 'Comprobar estado de cuenta'}</span>
            </button>
          )}

          {checkStatusMessage && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs font-medium text-amber-900">
              {checkStatusMessage}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <button
              onClick={handleCopyLink}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 rounded-xl cursor-pointer flex items-center gap-1.5 transition-all"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Enlace copiado</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar enlace directo</span>
                </>
              )}
            </button>

            {onGoHome && (
              <button
                onClick={() => {
                  onClose();
                  onGoHome();
                }}
                className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-xs font-semibold text-indigo-700 rounded-xl cursor-pointer flex items-center gap-1 transition-all border border-indigo-200/80"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Volver a la Home Page</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 rounded-xl cursor-pointer flex items-center gap-1 transition-all"
            >
              <X className="w-3.5 h-3.5" />
              <span>Cerrar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
