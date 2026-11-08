/**
 * Modal amigable de aviso para iniciar sesión con Google
 * Adaptado al sistema visual Bento Grid Moderno.
 */

import React, { useState } from 'react';
import { X, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { loginWithGoogle } from '../services/firebase';

interface LoginPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginPromptModal: React.FC<LoginPromptModalProps> = ({ isOpen, onClose }) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async () => {
    setErrorMessage(null);
    setLoading(true);
    try {
      await loginWithGoogle();
      onClose();
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : 'Error al conectar';
      if (msg.includes('operation-not-allowed')) {
        setErrorMessage('⚠️ Falta habilitar el proveedor "Google" en Firebase Console > Authentication > Sign-in method.');
      } else if (msg.includes('unauthorized-domain')) {
        setErrorMessage('⚠️ Dominio no autorizado. Asegúrate de ingresar por http://localhost:3000');
      } else if (msg.includes('popup-blocked')) {
        setErrorMessage('⚠️ El navegador bloqueó la ventana emergente de inicio de sesión.');
      } else {
        setErrorMessage(msg.replace(/Firebase:\s*/i, ''));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-7 text-center">
        {/* Botón Cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 rounded-xl cursor-pointer transition-all active:scale-95"
          title="Cerrar"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Emblema */}
        <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 border border-indigo-200/80 flex items-center justify-center mb-4 text-indigo-600 shadow-xs">
          <Lock className="w-7 h-7" />
        </div>

        <h3 className="text-xl font-extrabold text-slate-900 tracking-tight mb-2">
          ¡Guarda tus tareas y consultas!
        </h3>

        <p className="text-xs sm:text-sm text-slate-500 mb-5 leading-relaxed">
          Inicia sesión con tu cuenta de Google para guardar tus tareas escolares, continuar tus revisiones y disfrutar de tus consultas de bienvenida.
        </p>

        {/* Beneficios */}
        <div className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-4 text-left text-xs font-medium text-slate-700 space-y-2 mb-6">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Día de prueba gratis (24 horas ilimitadas)</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Historial guardado en "Mi Cuaderno"</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Soporte en las 18 materias escolares</span>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2 text-left">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Botón de acceso de Google */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-3.5 px-4 bg-white hover:bg-slate-50 active:scale-98 border border-slate-300 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 shadow-xs cursor-pointer flex items-center justify-center gap-3 transition-all disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>{loading ? 'Conectando con Google...' : 'Continuar con Google'}</span>
        </button>

        <p className="text-[11px] text-slate-400 mt-4">
          Sin contraseñas adicionales. Tu cuenta es 100% personal y segura.
        </p>
      </div>
    </div>
  );
};
