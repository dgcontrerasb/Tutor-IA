/**
 * Panel de Control de Administrador (Punto 5)
 * Permite al administrador (dgcontrerasb@gmail.com) ver usuarios registrados,
 * filtrar por estado (prueba / pago) y activar la mensualidad de 30 días tras verificar el pago.
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Shield,
  Users,
  Search,
  CheckCircle,
  Calendar,
  Sparkles,
  RefreshCw,
  Gift,
  Clock,
  UserCheck,
  PauseCircle,
  PlusCircle,
} from 'lucide-react';
import { UserProfile } from '../services/firebase';
import {
  fetchAllUsers,
  subscribeToAllUsers,
  activateUserSubscription,
  deactivateUserSubscription,
  resetUserTrial,
  addDaysToSubscription,
} from '../services/adminService';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminEmail?: string;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  adminEmail = 'dgcontrerasb@gmail.com',
}) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'trial' | 'active'>('all');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [processingUid, setProcessingUid] = useState<string | null>(null);

  // Cargar usuarios bajo demanda al abrir el panel (0 lecturas en segundo plano)
  const handleRefreshUsers = async () => {
    setLoading(true);
    try {
      const userList = await fetchAllUsers(100);
      setUsers(userList);
    } catch (err) {
      console.error('Error al recargar lista:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    handleRefreshUsers();
  }, [isOpen]);

  if (!isOpen) return null;

  // Filtrar lista de usuarios
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.displayName.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterType === 'trial') return !u.isSubscriptionActive;
    if (filterType === 'active') return u.isSubscriptionActive;
    return true;
  });

  // Métricas
  const totalUsers = users.length;
  const activeSubscribers = users.filter((u) => u.isSubscriptionActive).length;
  const trialUsers = users.filter((u) => !u.isSubscriptionActive).length;

  // Acciones
  const handleActivate = async (user: UserProfile) => {
    setProcessingUid(user.uid);
    try {
      await activateUserSubscription(user.uid, 30);
      setUsers((prev) =>
        prev.map((u) =>
          u.uid === user.uid
            ? { ...u, isSubscriptionActive: true, subscriptionDaysRemaining: 30 }
            : u
        )
      );
      setActionSuccessMsg(`¡Suscripción de 30 días activada para ${user.email}!`);
      setTimeout(() => setActionSuccessMsg(null), 3500);
    } catch (err) {
      console.error(err);
      alert('Error al activar suscripción');
    } finally {
      setProcessingUid(null);
    }
  };

  const handleDeactivate = async (user: UserProfile) => {
    if (!confirm(`¿Pausar la suscripción de ${user.email}?`)) return;
    setProcessingUid(user.uid);
    try {
      await deactivateUserSubscription(user.uid);
      setUsers((prev) =>
        prev.map((u) =>
          u.uid === user.uid
            ? { ...u, isSubscriptionActive: false, subscriptionDaysRemaining: 0, subscriptionExpiresAt: null }
            : u
        )
      );
      setActionSuccessMsg(`Suscripción pausada para ${user.email}`);
      setTimeout(() => setActionSuccessMsg(null), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingUid(null);
    }
  };

  const handleResetTrial = async (user: UserProfile) => {
    setProcessingUid(user.uid);
    try {
      await resetUserTrial(user.uid);
      setUsers((prev) =>
        prev.map((u) =>
          u.uid === user.uid
            ? { ...u, isSubscriptionActive: false, usagesUsed: 0, dailyUsagesUsed: 0 }
            : u
        )
      );
      setActionSuccessMsg(`Se reiniciaron los 3 usos de prueba para ${user.email}`);
      setTimeout(() => setActionSuccessMsg(null), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingUid(null);
    }
  };

  const handleAdd30Days = async (user: UserProfile) => {
    setProcessingUid(user.uid);
    try {
      await addDaysToSubscription(user.uid, user.subscriptionExpiresAt, 30);
      setUsers((prev) =>
        prev.map((u) => {
          if (u.uid !== user.uid) return u;
          const currentDays = u.subscriptionDaysRemaining || 0;
          return { ...u, isSubscriptionActive: true, subscriptionDaysRemaining: currentDays + 30 };
        })
      );
      setActionSuccessMsg(`Se añadieron +30 días a ${user.email}`);
      setTimeout(() => setActionSuccessMsg(null), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingUid(null);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('es-CO', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 overflow-y-auto bg-black/65 backdrop-blur-xs p-3 sm:p-6 flex items-start justify-center animate-in fade-in duration-150"
    >
      <div className="relative w-full max-w-4xl bg-[#FAF7EE] rounded-2xl border-[3px] border-[#1A1A1A] shadow-[8px_8px_0px_#1A1A1A] p-5 sm:p-7 my-4 sm:my-8 max-h-[92vh] overflow-y-auto text-[#1A1A1A]">
        {/* Washi tape decorativo */}
        <div className="washi-tape top-2.5 left-10 w-28"></div>
        <div className="washi-tape washi-tape-mint top-2.5 right-12 w-28"></div>

        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-[#FF8B94] hover:bg-[#ff7580] rounded-xl border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] cursor-pointer z-20"
          title="Cerrar panel"
        >
          <X className="w-5 h-5 text-[#1A1A1A]" />
        </button>

        {/* Cabecera del panel */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 mt-1 pr-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FFE66D] border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] flex items-center justify-center font-bold text-2xl">
              👑
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black text-[#1A1A1A]">
                  Panel de Control del Administrador
                </h2>
                <button
                  type="button"
                  onClick={handleRefreshUsers}
                  disabled={loading}
                  className="neo-btn flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-[#FAF7EE] text-[#1A1A1A] rounded-xl text-xs font-bold border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] cursor-pointer"
                  title="Actualizar lista de usuarios desde Firestore"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span>{loading ? 'Cargando...' : 'Actualizar'}</span>
                </button>
              </div>
              <p className="text-xs font-semibold text-[#1A1A1A]/70">
                Administrador activo: <strong>{adminEmail}</strong> · Modo Spark (Ahorro de cuota activo)
              </p>
            </div>
          </div>
        </div>

        {/* Notificación de éxito */}
        {actionSuccessMsg && (
          <div className="mb-4 p-3 bg-[#A8E6CF] rounded-xl border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] flex items-center gap-2 text-xs font-black animate-in fade-in">
            <CheckCircle className="w-4 h-4 text-emerald-900 shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
        )}

        {/* Estado del Motor Multi-IA 100% Gratuito y Publicación Sin Facturación */}
        <div className="mb-5 p-3.5 bg-white rounded-xl border-2 border-[#1A1A1A] shadow-[3px_3px_0px_#1A1A1A] text-xs space-y-1.5">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="font-black text-[#1A1A1A] flex items-center gap-1.5">
              <span>🤖 Motor Multi-IA 100% Gratuito Activo (Modo Híbrido Servidor + Navegador)</span>
            </span>
            <span className="font-bold text-emerald-800">
              Costo $0 · Sin tarjeta requerida
            </span>
          </div>
          <p className="text-[#1A1A1A]/80 font-medium leading-relaxed">
            <strong>Cascada activa:</strong> Pollinations AI (100% gratis sin API Key, texto + visión) · Gemini Free Tier · Groq Cloud Free · Respaldo Escolar Local.
            Para compartir gratis sin el aviso <em>"No billing setup"</em> de Cloud Run, usa el botón <strong>Share App</strong> (enlace de vista compartida) o sube la carpeta compilada (<code>npm run build</code>) a <strong>Firebase Hosting, Vercel o Netlify</strong> (100% gratuitos sin tarjeta).
          </p>
        </div>

        {/* 3 Métricas rápidas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <div className="bg-white p-3.5 rounded-xl border-2 border-[#1A1A1A] shadow-[3px_3px_0px_#1A1A1A]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-[#1A1A1A]/70">
                Total Registrados
              </span>
              <Users className="w-4 h-4 text-[#1A1A1A]" />
            </div>
            <p className="text-2xl sm:text-3xl font-black mt-1 text-[#1A1A1A]">
              {totalUsers}
            </p>
          </div>

          <div className="bg-[#FFE66D]/30 p-3.5 rounded-xl border-2 border-[#1A1A1A] shadow-[3px_3px_0px_#1A1A1A]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-[#1A1A1A]/70">
                En Prueba (3 usos)
              </span>
              <Gift className="w-4 h-4 text-amber-800" />
            </div>
            <p className="text-2xl sm:text-3xl font-black mt-1 text-amber-900">
              {trialUsers}
            </p>
          </div>

          <div className="bg-[#A8E6CF]/30 p-3.5 rounded-xl border-2 border-[#1A1A1A] shadow-[3px_3px_0px_#1A1A1A]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-[#1A1A1A]/70">
                Suscripciones Activas (10/día)
              </span>
              <Sparkles className="w-4 h-4 text-emerald-800" />
            </div>
            <p className="text-2xl sm:text-3xl font-black mt-1 text-emerald-950">
              {activeSubscribers}
            </p>
          </div>
        </div>

        {/* Barra de búsqueda y filtros */}
        <div className="bg-white p-3.5 rounded-xl border-2 border-[#1A1A1A] shadow-[3px_3px_0px_#1A1A1A] mb-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-[#1A1A1A]/60 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por correo o nombre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs font-medium rounded-lg border border-[#1A1A1A] focus:outline-hidden focus:ring-2 focus:ring-[#FFE66D]"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <span className="text-[11px] font-black uppercase text-[#1A1A1A]/70 mr-1">
              Filtrar:
            </span>
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-black border cursor-pointer ${
                filterType === 'all'
                  ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                  : 'bg-[#FAF7EE] text-[#1A1A1A] border-[#1A1A1A]/40'
              }`}
            >
              Todos ({totalUsers})
            </button>
            <button
              onClick={() => setFilterType('trial')}
              className={`px-2.5 py-1 rounded-lg text-xs font-black border cursor-pointer ${
                filterType === 'trial'
                  ? 'bg-[#FFE66D] text-[#1A1A1A] border-[#1A1A1A]'
                  : 'bg-[#FAF7EE] text-[#1A1A1A] border-[#1A1A1A]/40'
              }`}
            >
              Prueba ({trialUsers})
            </button>
            <button
              onClick={() => setFilterType('active')}
              className={`px-2.5 py-1 rounded-lg text-xs font-black border cursor-pointer ${
                filterType === 'active'
                  ? 'bg-[#A8E6CF] text-[#1A1A1A] border-[#1A1A1A]'
                  : 'bg-[#FAF7EE] text-[#1A1A1A] border-[#1A1A1A]/40'
              }`}
            >
              Activos ({activeSubscribers})
            </button>
          </div>
        </div>

        {/* Lista de usuarios */}
        <div className="space-y-3">
          {loading ? (
            <div className="p-8 text-center bg-white rounded-xl border-2 border-[#1A1A1A] animate-pulse">
              <p className="text-xs font-bold text-[#1A1A1A]">Cargando usuarios desde Firestore...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-xl border-2 border-[#1A1A1A]">
              <p className="text-sm font-bold text-[#1A1A1A]/70">
                No se encontraron usuarios con ese criterio de búsqueda.
              </p>
            </div>
          ) : (
            filteredUsers.map((userItem) => {
              const isThisAdmin = userItem.email.toLowerCase() === adminEmail.toLowerCase();
              const isProcessing = processingUid === userItem.uid;

              return (
                <div
                  key={userItem.uid}
                  className="bg-white p-4 rounded-xl border-2 border-[#1A1A1A] shadow-[3px_3px_0px_#1A1A1A] flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  {/* Información del usuario */}
                  <div className="flex items-center gap-3 min-w-0">
                    {userItem.photoURL ? (
                      <img
                        src={userItem.photoURL}
                        alt={userItem.displayName}
                        className="w-10 h-10 rounded-xl border-2 border-[#1A1A1A] object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-[#FFE66D] border-2 border-[#1A1A1A] flex items-center justify-center font-black text-sm shrink-0">
                        {userItem.displayName.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-black text-[#1A1A1A] truncate">
                          {userItem.displayName}
                        </span>
                        {isThisAdmin ? (
                          <span className="px-1.5 py-0.2 rounded bg-[#FFE66D] text-[10px] font-black border border-[#1A1A1A]">
                            Administrador
                          </span>
                        ) : userItem.isSubscriptionActive ? (
                          <span className="px-1.5 py-0.2 rounded bg-[#A8E6CF] text-[10px] font-black border border-[#1A1A1A] text-emerald-950 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            Suscripción Activa
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.2 rounded bg-[#FAF7EE] text-[10px] font-black border border-[#1A1A1A] text-[#1A1A1A]/80">
                            Prueba Gratuita
                          </span>
                        )}
                      </div>

                      <p className="text-xs font-mono font-bold text-[#1A1A1A]/70 truncate">
                        {userItem.email}
                      </p>

                      <div className="flex items-center gap-3 text-[11px] text-[#1A1A1A]/60 font-semibold mt-1 flex-wrap">
                        <span>Registro: {formatDate(userItem.createdAt)}</span>
                        <span>•</span>
                        <span>
                          {userItem.isSubscriptionActive ? (
                            <>
                              Consultas: <strong>{userItem.usagesUsed || 0}</strong> (Ilimitado)
                            </>
                          ) : (
                            <>
                              Prueba: <strong>{userItem.usagesUsed || 0}</strong> de <strong>3</strong> usos
                            </>
                          )}
                        </span>
                        {userItem.isSubscriptionActive && userItem.subscriptionExpiresAt && (
                          <>
                            <span>•</span>
                            <span className="text-emerald-800 font-bold">
                              Vence: {formatDate(userItem.subscriptionExpiresAt)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Botones de acción del administrador */}
                  {!isThisAdmin && (
                    <div className="flex items-center gap-2 flex-wrap w-full md:w-auto justify-end">
                      {!userItem.isSubscriptionActive ? (
                        <button
                          onClick={() => handleActivate(userItem)}
                          disabled={isProcessing}
                          className="neo-btn px-3 py-1.5 bg-[#A8E6CF] hover:bg-[#96deb9] text-emerald-950 text-xs font-black rounded-lg cursor-pointer flex items-center gap-1 shadow-[2px_2px_0px_#1A1A1A] disabled:opacity-50"
                          title="Activar suscripción mensual tras verificar pago de $5.000 COP (10 consultas diarias)"
                        >
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-900" />
                          <span>{isProcessing ? 'Activando...' : 'Activar 30 Días (10 usos/día)'}</span>
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => handleAdd30Days(userItem)}
                            disabled={isProcessing}
                            className="neo-btn px-2.5 py-1.5 bg-[#FFE66D] hover:bg-[#f6dc58] text-[#1A1A1A] text-xs font-black rounded-lg cursor-pointer flex items-center gap-1 shadow-[2px_2px_0px_#1A1A1A]"
                            title="Añadir 30 días más a la suscripción actual"
                          >
                            <PlusCircle className="w-3.5 h-3.5" />
                            <span>+30 Días</span>
                          </button>

                          <button
                            onClick={() => handleDeactivate(userItem)}
                            disabled={isProcessing}
                            className="neo-btn px-2.5 py-1.5 bg-[#FF8B94] hover:bg-[#ff7580] text-[#1A1A1A] text-xs font-black rounded-lg cursor-pointer flex items-center gap-1 shadow-[2px_2px_0px_#1A1A1A]"
                            title="Pausar suscripción"
                          >
                            <PauseCircle className="w-3.5 h-3.5" />
                            <span>Pausar</span>
                          </button>
                        </>
                      )}

                      {/* Botón para reiniciar prueba de 3 usos */}
                      {!userItem.isSubscriptionActive && (userItem.usagesUsed || 0) > 0 && (
                        <button
                          onClick={() => handleResetTrial(userItem)}
                          disabled={isProcessing}
                          className="neo-btn px-2 py-1.5 bg-white text-[#1A1A1A] text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1"
                          title="Restablecer los 3 usos de prueba gratuitos"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Reiniciar prueba</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
