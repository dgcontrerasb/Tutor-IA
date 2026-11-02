/**
 * Modal amigable de aviso para iniciar sesión con Google
 */

import React, { useState } from 'react';
import { X, Lock, CheckCircle2 } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-[#FAF7EE] rounded-2xl border-[3px] border-[#1A1A1A] shadow-[8px_8px_0px_#1A1A1A] p-6 text-center">
        {/* Washi tape decorativo */}
        <div className="washi-tape top-3 left-10 w-24"></div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 bg-[#FF8B94] rounded-lg border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] cursor-pointer hover:scale-105 active:scale-95 transition-transform"
          title="Cerrar"
        >
          <X className="w-4 h-4 text-[#1A1A1A]" />
        </button>

        <div className="w-14 h-14 mx-auto rounded-2xl bg-[#FFE66D] border-2 border-[#1A1A1A] shadow-[3px_3px_0px_#1A1A1A] flex items-center justify-center mb-4 mt-2">
          <Lock className="w-7 h-7 text-[#1A1A1A]" />
        </div>

        <h3 className="text-xl font-black text-[#1A1A1A] mb-2 font-display">
          Identifícate con tu cuenta escolar
        </h3>

        <p className="text-xs sm:text-sm font-medium text-[#1A1A1A]/80 mb-5 leading-relaxed">
          Inicia sesión para guardar tus tareas revisadas y desbloquear tus apuntes en tu cuaderno de estudio.
        </p>

        {errorMessage && (
          <div className="mb-4 p-2.5 bg-red-100 border-2 border-red-400 rounded-xl text-xs font-bold text-red-950">
            {errorMessage}
          </div>
        )}

        <div className="bg-white rounded-xl border-2 border-[#1A1A1A] p-3 text-xs text-left mb-5 space-y-1.5 font-bold text-[#1A1A1A]">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>Consultas ilimitadas en las 18 materias escolares</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>Guarda tus revisiones y explicaciones paso a paso</span>
          </div>
        </div>

        <button
          onClick={() => handleLogin()}
          disabled={loading}
          className="neo-btn w-full py-3 bg-white hover:bg-[#FAF7EE] text-[#1A1A1A] text-sm font-black rounded-xl cursor-pointer flex items-center justify-center gap-2.5 shadow-[3px_3px_0px_#1A1A1A]"
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
          <span>{loading ? 'Conectando...' : 'Acceder con Google'}</span>
        </button>

        <p className="text-[11px] font-semibold text-[#1A1A1A]/60 mt-3">
          Uso estrictamente personal y educativo. Tus datos están protegidos bajo la Ley 1581 de Protección de Datos.
        </p>
      </div>
    </div>
  );
};
