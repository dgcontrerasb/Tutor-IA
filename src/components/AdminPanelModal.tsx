/**
 * Panel de Control de Administrador (Punto 5) & Gestor de Códigos de Activación
 * Rediseñado al sistema Bento Grid Moderno.
 * Permite al administrador generar códigos de 30 días, monitorear usuarios y validar suscripciones.
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
  KeyRound,
  Copy,
  Check,
  ExternalLink,
  Trash2,
  Filter,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { UserProfile } from '../services/firebase';
import {
  fetchAllUsers,
  activateUserSubscription,
  deactivateUserSubscription,
  resetUserTrial,
  addDaysToSubscription,
  createActivationCode,
  fetchActivationCodes,
  deleteActivationCode,
  clearRedeemedCodes,
  ActivationCode,
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
  const [activeTab, setActiveTab] = useState<'users' | 'codes'>('codes');
  const [codeFilter, setCodeFilter] = useState<'available' | 'redeemed' | 'all'>('all');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [codes, setCodes] = useState<ActivationCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingCode, setGeneratingCode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'trial' | 'active'>('all');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [processingUid, setProcessingUid] = useState<string | null>(null);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [userList, codeList] = await Promise.all([
        fetchAllUsers(100),
        fetchActivationCodes(50),
      ]);
      setUsers(userList);
      setCodes(codeList);
    } catch (err) {
      console.error('Error al cargar datos del panel:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    loadData();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleGenerateCode = async () => {
    setGeneratingCode(true);
    try {
      const newCode = await createActivationCode(adminEmail, 30);
      setCodes((prev) => [newCode, ...prev]);
      setCodeFilter('available');
      setActionSuccessMsg(`Código ${newCode.code} generado con éxito.`);
      setTimeout(() => setActionSuccessMsg(null), 3500);
    } catch (err) {
      console.error('Error al generar código:', err);
    } finally {
      setGeneratingCode(false);
    }
  };

  const handleDeleteCode = async (codeString: string) => {
    try {
      await deleteActivationCode(codeString);
      setCodes((prev) => prev.filter((c) => c.code !== codeString && c.id !== codeString));
      setActionSuccessMsg(`Código ${codeString} eliminado.`);
      setTimeout(() => setActionSuccessMsg(null), 3000);
    } catch (err) {
      console.error('Error al eliminar código:', err);
    }
  };

  const handleClearRedeemed = async () => {
    try {
      const count = await clearRedeemedCodes();
      setCodes((prev) => prev.filter((c) => !c.isRedeemed));
      setActionSuccessMsg(`Se limpiaron ${count} códigos ya canjeados.`);
      setTimeout(() => setActionSuccessMsg(null), 3000);
    } catch (err) {
      console.error('Error al limpiar códigos:', err);
    }
  };

  const handleCopyCode = async (code: ActivationCode) => {
    try {
      await navigator.clipboard.writeText(code.code);
      setCopiedCodeId(code.id);
      setTimeout(() => setCopiedCodeId(null), 2000);
    } catch {
      // Fallback
    }
  };

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

  const activeSubscribers = users.filter((u) => u.isSubscriptionActive).length;
  const trialUsers = users.filter((u) => !u.isSubscriptionActive).length;
  const availableCodes = codes.filter((c) => !c.isRedeemed).length;
  const redeemedCodes = codes.filter((c) => c.isRedeemed).length;

  const displayedCodes = codes.filter((c) => {
    if (codeFilter === 'available') return !c.isRedeemed;
    if (codeFilter === 'redeemed') return c.isRedeemed;
    return true;
  });

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
      setActionSuccessMsg(`Se activaron 30 días para ${user.email}`);
      setTimeout(() => setActionSuccessMsg(null), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingUid(null);
    }
  };

  const handleDeactivate = async (user: UserProfile) => {
    setProcessingUid(user.uid);
    try {
      await deactivateUserSubscription(user.uid);
      setUsers((prev) =>
        prev.map((u) =>
          u.uid === user.uid
            ? { ...u, isSubscriptionActive: false, subscriptionDaysRemaining: 0 }
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
        prev.map((u) => (u.uid === user.uid ? { ...u, usagesUsed: 0, isSubscriptionActive: false } : u))
      );
      setActionSuccessMsg(`Prueba reiniciada para ${user.email} (3 consultas disponibles)`);
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

  const formatDate = (dateString?: string | null) => {
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
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs p-3 sm:p-6 flex items-start justify-center animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-4xl bg-white rounded-3xl border border-slate-200 shadow-2xl p-5 sm:p-7 my-4 sm:my-8 max-h-[92vh] overflow-y-auto text-slate-800">
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 rounded-xl cursor-pointer transition-all active:scale-95 z-20"
          title="Cerrar panel"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Cabecera del panel */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pr-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-700 font-bold text-2xl shadow-xs">
              🛡️
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  Panel de Administración
                </h2>
                <button
                  type="button"
                  onClick={loadData}
                  disabled={loading}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 cursor-pointer transition-all"
                  title="Actualizar datos"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
                  <span>{loading ? 'Cargando...' : 'Actualizar'}</span>
                </button>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Admin: <strong className="text-slate-700">{adminEmail}</strong> · Blindaje perimetral activo
              </p>
            </div>
          </div>
        </div>

        {/* Notificación de éxito */}
        {actionSuccessMsg && (
          <div className="mb-4 p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-2 text-xs font-semibold text-emerald-800 animate-in fade-in">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
        )}

        {/* Pestañas de navegación Bento */}
        <div className="grid grid-cols-2 gap-2 mb-6 p-1.5 bg-slate-100 rounded-2xl border border-slate-200/80">
          <button
            onClick={() => setActiveTab('codes')}
            className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'codes'
                ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/60 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <KeyRound className="w-4 h-4 text-indigo-600" />
            <span>Gestor de Códigos de Activación ({availableCodes} disp.)</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'users'
                ? 'bg-white text-emerald-700 shadow-xs border border-slate-200/60 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Users className="w-4 h-4 text-emerald-600" />
            <span>Usuarios Registrados ({users.length})</span>
          </button>
        </div>

        {/* PESTAÑA 1: GESTOR DE CÓDIGOS DE ACTIVACIÓN */}
        {activeTab === 'codes' && (
          <div className="space-y-5">
            {/* Tarjeta de generación rápida */}
            <div className="p-5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-extrabold text-indigo-950 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>Generar Código Único de 30 Días ($10.000 COP)</span>
                </h4>
                <p className="text-xs text-indigo-800/80 mt-1 max-w-lg">
                  Crea un código criptográfico de un solo uso. Una vez canjeado por el estudiante, se quema automáticamente en el servidor y le activa 30 días.
                </p>
              </div>

              <button
                onClick={handleGenerateCode}
                disabled={generatingCode}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs transition-all flex items-center gap-2 shrink-0 disabled:opacity-50"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{generatingCode ? 'Generando...' : '+ Crear Nuevo Código'}</span>
              </button>
            </div>

            {/* Listado de códigos */}
            <div className="bg-slate-50/70 rounded-2xl border border-slate-200/80 p-4 space-y-3.5">
              {/* Barra de cabecera con filtros rápidos */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 pb-1 border-b border-slate-200/60">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1 flex items-center gap-1">
                    <Filter className="w-3 h-3" />
                    Filtrar:
                  </span>
                  <button
                    type="button"
                    onClick={() => setCodeFilter('available')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      codeFilter === 'available'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Disponibles ({availableCodes})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCodeFilter('redeemed')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      codeFilter === 'redeemed'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Canjeados ({redeemedCodes})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCodeFilter('all')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      codeFilter === 'all'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    <span>Todos ({codes.length})</span>
                  </button>
                </div>

                {redeemedCodes > 0 && (
                  <button
                    type="button"
                    onClick={handleClearRedeemed}
                    className="px-2.5 py-1.5 bg-white hover:bg-rose-50 text-rose-600 hover:text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold cursor-pointer transition-all flex items-center gap-1 active:scale-95 ml-auto shadow-2xs"
                    title="Eliminar códigos ya canjeados para mantener la lista 100% limpia"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Limpiar canjeados ({redeemedCodes})</span>
                  </button>
                )}
              </div>

              {displayedCodes.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 bg-white rounded-xl border border-dashed border-slate-200">
                  {codeFilter === 'available' ? (
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">No tienes códigos disponibles para entrega.</p>
                      <p className="text-slate-500 mt-1">Haz clic en <strong>+ Crear Nuevo Código</strong> arriba para generar uno listo para entregar por WhatsApp.</p>
                    </div>
                  ) : codeFilter === 'redeemed' ? (
                    <p className="text-slate-400">No hay ningún código canjeado todavía en este historial.</p>
                  ) : (
                    <p className="text-slate-400">No hay códigos registrados.</p>
                  )}
                </div>
              ) : (
                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                  {displayedCodes.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                        item.isRedeemed
                          ? 'bg-slate-50/90 border-slate-200 opacity-65'
                          : 'bg-white border-emerald-300 shadow-xs hover:border-emerald-400'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                            item.isRedeemed
                              ? 'bg-rose-50 text-rose-600 border border-rose-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono'
                          }`}
                        >
                          {item.isRedeemed ? <XCircle className="w-4 h-4" /> : <KeyRound className="w-4 h-4" />}
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`font-mono text-sm sm:text-base font-black tracking-wider ${item.isRedeemed ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                              {item.code}
                            </span>
                            {item.isRedeemed ? (
                              <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 text-[10px] font-extrabold border border-rose-200 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block"></span>
                                CANJEADO / QUEMADO
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-extrabold border border-emerald-300 flex items-center gap-1 shadow-2xs">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                                VÁLIDO · DISPONIBLE (30 DÍAS)
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1">
                            Creado: {formatDate(item.createdAt)}
                            {item.isRedeemed && (
                              <span className="text-slate-600 font-medium ml-1">
                                · Usado por: <strong className="text-slate-800">{item.redeemedByEmail || 'Usuario'}</strong> ({formatDate(item.redeemedAt)})
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        {!item.isRedeemed ? (
                          <button
                            type="button"
                            onClick={() => handleCopyCode(item)}
                            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 shrink-0 shadow-2xs"
                            title="Copiar código para enviar por WhatsApp"
                          >
                            {copiedCodeId === item.id ? (
                              <>
                                <Check className="w-4 h-4 text-white" />
                                <span>¡Copiado!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4" />
                                <span>Copiar Código</span>
                              </>
                            )}
                          </button>
                        ) : null}

                        <button
                          type="button"
                          onClick={() => handleDeleteCode(item.code)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl cursor-pointer transition-all border border-transparent hover:border-rose-200 active:scale-95"
                          title="Eliminar este código de la lista"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* PESTAÑA 2: GESTIÓN DE USUARIOS */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            {/* Métricas Bento */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
                <span className="text-[11px] font-medium text-slate-500 uppercase block">Total Usuarios</span>
                <span className="text-xl font-extrabold text-slate-900">{users.length}</span>
              </div>
              <div className="p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-200/70">
                <span className="text-[11px] font-medium text-emerald-700 uppercase block">Suscripciones Activas</span>
                <span className="text-xl font-extrabold text-emerald-900">{activeSubscribers}</span>
              </div>
              <div className="p-3.5 bg-amber-50/70 rounded-2xl border border-amber-200/70">
                <span className="text-[11px] font-medium text-amber-700 uppercase block">En Prueba Gratuita</span>
                <span className="text-xl font-extrabold text-amber-900">{trialUsers}</span>
              </div>
            </div>

            {/* Barra de Búsqueda y Filtros */}
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por nombre o correo..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-indigo-400"
                />
              </div>

              <div className="flex items-center gap-1.5 w-full sm:w-auto">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    filterType === 'all'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setFilterType('active')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    filterType === 'active'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Activos
                </button>
                <button
                  onClick={() => setFilterType('trial')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    filterType === 'trial'
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Prueba
                </button>
              </div>
            </div>

            {/* Lista de Usuarios */}
            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {filteredUsers.map((userItem) => {
                const isThisAdmin =
                  userItem.role === 'admin' || userItem.email.toLowerCase() === adminEmail.toLowerCase();
                const isProcessing = processingUid === userItem.uid;

                return (
                  <div
                    key={userItem.uid}
                    className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3 hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {userItem.photoURL ? (
                        <img
                          src={userItem.photoURL}
                          alt={userItem.displayName}
                          className="w-10 h-10 rounded-xl border border-slate-200 object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center font-bold text-sm text-indigo-700 shrink-0">
                          {userItem.displayName.charAt(0).toUpperCase()}
                        </div>
                      )}

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-slate-900 truncate">
                            {userItem.displayName}
                          </span>
                          {isThisAdmin ? (
                            <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200">
                              Administrador
                            </span>
                          ) : userItem.isSubscriptionActive ? (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200 flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-emerald-600" />
                              <span>Activo</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold border border-slate-200">
                              Prueba
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-500 font-mono truncate">{userItem.email}</p>

                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5 flex-wrap">
                          <span>Registrado: {formatDate(userItem.createdAt)}</span>
                          <span>•</span>
                          <span>
                            {userItem.isSubscriptionActive ? (
                              <span className="text-emerald-700 font-medium">
                                Vence: {formatDate(userItem.subscriptionExpiresAt)}
                              </span>
                            ) : (
                              <span>Usos: {userItem.usagesUsed || 0} / 3</span>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    {!isThisAdmin && (
                      <div className="flex items-center gap-1.5 flex-wrap w-full md:w-auto justify-end">
                        {!userItem.isSubscriptionActive ? (
                          <button
                            onClick={() => handleActivate(userItem)}
                            disabled={isProcessing}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl cursor-pointer transition-all active:scale-95 disabled:opacity-50"
                          >
                            {isProcessing ? 'Activando...' : 'Activar 30 Días'}
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => handleAdd30Days(userItem)}
                              disabled={isProcessing}
                              className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold rounded-xl cursor-pointer transition-all active:scale-95"
                              title="+30 días más"
                            >
                              +30 Días
                            </button>
                            <button
                              onClick={() => handleDeactivate(userItem)}
                              disabled={isProcessing}
                              className="px-2.5 py-1.5 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 text-xs font-semibold rounded-xl cursor-pointer transition-all active:scale-95 border border-slate-200"
                              title="Pausar suscripción"
                            >
                              Pausar
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleResetTrial(userItem)}
                          disabled={isProcessing}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-xl cursor-pointer transition-all active:scale-95 border border-slate-200"
                          title="Reiniciar 3 pruebas"
                        >
                          Reiniciar
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Pie de modal */}
        <div className="mt-5 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-400">
          <span>Modo Servidor Spark • Sin costos por segundo plano</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 rounded-xl cursor-pointer transition-all"
          >
            Cerrar panel
          </button>
        </div>
      </div>
    </div>
  );
};
