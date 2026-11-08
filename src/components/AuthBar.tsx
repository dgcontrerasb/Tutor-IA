/**
 * Barra de autenticación con Google (Punto 2)
 * Permite a los usuarios registrarse o ingresar con su cuenta de Google.
 * Rediseñado al estilo Bento Grid Moderno.
 */

import React, { useState } from 'react';
import { LogIn, LogOut, User as UserIcon, Shield, Sparkles, RefreshCw } from 'lucide-react';
import { UserProfile, loginWithGoogle, logout, isFirebaseConfigured } from '../services/firebase';

interface AuthBarProps {
  user: UserProfile | null;
  loading: boolean;
  onRefresh?: () => void;
  isSyncing?: boolean;
  onLogout?: () => void;
}

export interface ParsedUserName {
  firstName: string;
  lastName: string;
}

export function splitUserName(user: UserProfile | null): ParsedUserName {
  if (!user) {
    return { firstName: 'Estudiante', lastName: 'Activo' };
  }

  let rawName = user.displayName?.trim() || '';
  if (!rawName || rawName.includes('@')) {
    rawName = (user.displayName || user.email || '').split('@')[0].trim();
    rawName = rawName.replace(/[._-]+/g, ' ');
  }

  const parts = rawName.split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return { firstName: 'Estudiante', lastName: user.role === 'admin' ? '🛡️ Admin' : '🎒 Activo' };
  }

  if (parts.length === 1) {
    const single = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
    return {
      firstName: single,
      lastName: user.role === 'admin' ? '🛡️ Admin' : '🎒 Estudiante',
    };
  }

  const firstName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
  const lastName = parts.slice(1).map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');

  return { firstName, lastName };
}

export function getCleanDisplayName(user: UserProfile | null): string {
  const { firstName, lastName } = splitUserName(user);
  if (!lastName || lastName.includes('Admin') || lastName.includes('Estudiante') || lastName.includes('Activo')) {
    return firstName;
  }
  return `${firstName} ${lastName}`;
}

export const AuthBar: React.FC<AuthBarProps> = ({ user, loading, onRefresh, isSyncing, onLogout }) => {
  const [loggingIn, setLoggingIn] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { firstName, lastName } = splitUserName(user);

  const handleLogin = async () => {
    setErrorMsg(null);
    setLoggingIn(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      console.error('Error al iniciar sesión con Google:', err);
      const msg = err instanceof Error ? err.message : 'No se pudo completar el inicio de sesión';
      if (!msg.includes('popup-closed-by-user')) {
        if (msg.includes('operation-not-allowed')) {
          setErrorMsg('Debes habilitar "Google" en Firebase Console > Authentication > Sign-in method.');
        } else if (msg.includes('unauthorized-domain')) {
          setErrorMsg('Dominio no autorizado. Entra por http://localhost:3000 (no por IP).');
        } else if (msg.includes('popup-blocked')) {
          setErrorMsg('Tu navegador bloqueó la ventana emergente de Google.');
        } else if (msg.includes('invalid-api-key') || msg.includes('api-key-not-valid')) {
          setErrorMsg('La VITE_FIREBASE_API_KEY en tu .env es incorrecta.');
        } else {
          setErrorMsg(
            !isFirebaseConfigured
              ? 'Configura tus variables de Firebase en el archivo .env.'
              : `Error Google (${msg.replace(/Firebase:\s*/i, '').slice(0, 60)}). Habilita Google en Firebase Console.`
          );
        }
      }
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    if (onLogout) {
      onLogout();
      return;
    }
    try {
      await logout();
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-xl text-xs text-slate-500 font-medium animate-pulse border border-slate-200">
        <span>Cargando perfil...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      {errorMsg && (
        <span className="text-[11px] font-semibold text-red-600 bg-red-50 px-2.5 py-1 rounded-lg border border-red-200">
          {errorMsg}
        </span>
      )}

      {!user ? (
        <button
          onClick={() => handleLogin()}
          disabled={loggingIn}
          className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-slate-50 active:scale-95 text-slate-800 rounded-xl text-xs font-semibold cursor-pointer border border-slate-200 shadow-xs transition-all hover:border-slate-300"
          title="Iniciar sesión con Google"
        >
          {/* Icono de Google */}
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
          <span className="font-semibold">{loggingIn ? 'Conectando...' : 'Acceder con Google'}</span>
        </button>
      ) : (
        <div className="flex items-center gap-2 p-1 bg-white rounded-xl border border-slate-200 shadow-xs shrink-0">
          {/* Foto o avatar con indicador de rol */}
          <div className="relative shrink-0">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={getCleanDisplayName(user)}
                className="w-7 h-7 rounded-lg border border-slate-200 object-cover"
              />
            ) : (
              <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center">
                <UserIcon className="w-4 h-4 text-indigo-700" />
              </div>
            )}
            {user.role === 'admin' && (
              <div
                className="absolute -top-1.5 -right-1.5 bg-amber-400 text-slate-900 border border-white rounded-full p-0.5 shadow-xs"
                title="Administrador de Tutor-IA"
              >
                <Shield className="w-2.5 h-2.5" />
              </div>
            )}
          </div>

          {/* Nombre de usuario */}
          <div className="flex flex-col justify-center text-left pr-0.5 max-w-[85px] xs:max-w-[120px] sm:max-w-[155px] md:max-w-[185px] leading-tight select-none">
            <span className="block text-xs font-bold text-slate-800 truncate leading-none" title={firstName}>
              {firstName}
            </span>
            <span className="block text-[10px] font-medium text-slate-500 truncate leading-tight mt-0.5" title={lastName}>
              {lastName}
            </span>
          </div>

          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isSyncing}
              className={`p-1 text-slate-400 hover:text-indigo-600 rounded-lg cursor-pointer transition-colors shrink-0 ${
                isSyncing ? 'animate-spin text-indigo-600' : ''
              }`}
              title="Sincronizar datos con el servidor"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={handleLogout}
            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors shrink-0"
            title="Cerrar sesión"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
