/**
 * Historial Escolar y Libreta de Repaso - Mi Cuaderno
 * - Panel inferior deslizable moderno para celulares y modal centrado en computadores.
 * - Sin explicaciones técnicas innecesarias: interfaz limpia, directa y enfocada en el estudio.
 * - Búsqueda rápida por tema o ejercicio y filtros por asignatura.
 * - Recarga inmediata del resultado completo con un toque y opción de eliminar apuntes.
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  Trash2,
  Clock,
  X,
  RotateCcw,
  Search,
  BookMarked,
} from 'lucide-react';
import { HomeworkReviewResult, SchoolSubjectId, GradeLevel } from '../types';
import { getSubjectById } from '../data/schoolSubjects';

export const HISTORY_STORAGE_KEY = 'tutor_ia_recent_homeworks_v1';
const LEGACY_HISTORY_STORAGE_KEY = 'cuaderno_pop_recent_homeworks_v1';
export const CUADERNO_HISTORY_EVENT = 'tutor-ia-history-updated';

export interface SavedHomeworkItem {
  id: string;
  subjectId: SchoolSubjectId;
  previewText: string;
  timestamp: string;
  dateStr?: string;
  gradeLevel?: GradeLevel;
  result: HomeworkReviewResult;
}

interface RecentHomeworksHistoryProps {
  onSelectSavedHomework: (item: SavedHomeworkItem) => void;
  gradeLevel?: GradeLevel;
}

/**
 * Obtener las consultas guardadas del almacenamiento
 */
export function getSavedHomeworks(): SavedHomeworkItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY) || localStorage.getItem(LEGACY_HISTORY_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Guardar una consulta en el cuaderno
 * Conserva hasta 20 consultas escolares recientes sin duplicar
 */
export function saveHomeworkToHistory(
  subjectId: SchoolSubjectId,
  text: string,
  result: HomeworkReviewResult,
  gradeLevel?: GradeLevel
) {
  try {
    if (!result || result.isSchoolRelated === false) return;

    const current = getSavedHomeworks();
    const now = new Date();
    const newItem: SavedHomeworkItem = {
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      subjectId,
      previewText: text.trim().slice(0, 100) || 'Consulta escolar / Ficha de estudio',
      timestamp: now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      dateStr: now.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
      gradeLevel: gradeLevel || 'primaria',
      result,
    };

    // Evitar duplicados por contenido idéntico
    const filtered = current.filter(
      (item) => item.previewText.trim().toLowerCase() !== newItem.previewText.trim().toLowerCase()
    );

    const updated = [newItem, ...filtered].slice(0, 20);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(CUADERNO_HISTORY_EVENT));
    }
  } catch {
    // Si almacenamiento no está disponible
  }
}

/**
 * Eliminar una consulta individual por su ID
 */
export function deleteHomeworkFromHistory(id: string): SavedHomeworkItem[] {
  try {
    const current = getSavedHomeworks();
    const updated = current.filter((item) => item.id !== id);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(CUADERNO_HISTORY_EVENT));
    }
    return updated;
  } catch {
    return [];
  }
}

/**
 * Vaciar todo el cuaderno de consultas
 */
export function clearHomeworkHistory(): void {
  try {
    localStorage.removeItem(HISTORY_STORAGE_KEY);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(CUADERNO_HISTORY_EVENT));
    }
  } catch {
    // Ignorar
  }
}

export const RecentHomeworksHistory: React.FC<RecentHomeworksHistoryProps> = ({
  onSelectSavedHomework,
}) => {
  const [items, setItems] = useState<SavedHomeworkItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [justDeletedId, setJustDeletedId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmClearAll, setConfirmClearAll] = useState(false);

  const loadHistory = () => {
    setItems(getSavedHomeworks());
  };

  useEffect(() => {
    loadHistory();
    const handleStorageChange = () => {
      loadHistory();
    };

    window.addEventListener(CUADERNO_HISTORY_EVENT, handleStorageChange);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener(CUADERNO_HISTORY_EVENT, handleStorageChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Bloquear scroll de fondo cuando el panel/modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setConfirmDeleteId(null);
      setConfirmClearAll(false);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Materias únicas presentes en las consultas guardadas para filtrar
  const availableSubjectIds = useMemo(() => {
    const set = new Set<string>();
    items.forEach((it) => set.add(it.subjectId));
    return Array.from(set);
  }, [items]);

  // Consultas filtradas por búsqueda y materia
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchSubject =
        selectedSubjectFilter === 'all' || item.subjectId === selectedSubjectFilter;

      if (!matchSubject) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      const subject = getSubjectById(item.subjectId);
      const inText = item.previewText.toLowerCase().includes(q);
      const inSubject =
        subject.name.toLowerCase().includes(q) || subject.shortName.toLowerCase().includes(q);
      const inTopic =
        item.result.stepByStep?.topic?.toLowerCase().includes(q) ||
        item.result.topicExplanation?.topic?.toLowerCase().includes(q);

      return inText || inSubject || inTopic;
    });
  }, [items, searchQuery, selectedSubjectFilter]);

  const handleDeleteItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setJustDeletedId(id);
    setTimeout(() => {
      const updated = deleteHomeworkFromHistory(id);
      setItems(updated);
      setJustDeletedId(null);
      setConfirmDeleteId(null);
    }, 200);
  };

  const handleClearAll = () => {
    clearHomeworkHistory();
    setItems([]);
    setConfirmClearAll(false);
  };

  return (
    <>
      {/* ========================================================
          BOTÓN FLOTANTE "MI CUADERNO"
          Diseño Bento Moderno: limpio, sutil y elegante
          ======================================================== */}
      <div className="fixed bottom-4 right-3 sm:bottom-6 sm:right-6 z-40">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2.5 px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-800 rounded-2xl border border-slate-200 shadow-md hover:shadow-lg cursor-pointer transition-all hover:-translate-y-0.5 active:translate-y-0"
          title="Abrir Mi Cuaderno de Apuntes"
          aria-label="Abrir Mi Cuaderno"
        >
          {/* Icono de Libreta Escolar */}
          <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
            <BookOpen className="w-4 h-4 text-indigo-600 group-hover:scale-105 transition-transform" />
          </div>

          {/* Texto descriptivo */}
          <div className="text-left hidden xs:block pr-1">
            <span className="text-xs sm:text-sm font-bold text-slate-800 block leading-tight">
              Mi Cuaderno
            </span>
            <span className="text-[10px] text-slate-400 block leading-tight">
              {items.length === 1 ? '1 apunte' : `${items.length} apuntes`}
            </span>
          </div>

          {/* Insignia con el conteo de fichas guardadas */}
          <div className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
            {items.length}
          </div>
        </button>
      </div>

      {/* ========================================================
          PANEL MODAL "MI CUADERNO" - DISEÑO BENTO LIMPIO
          ======================================================== */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-full sm:max-w-2xl max-h-[85vh] sm:max-h-[85vh] bg-white rounded-t-3xl sm:rounded-3xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Manija táctil sutil para móvil */}
            <div className="sm:hidden pt-2 pb-1 bg-slate-50 flex justify-center">
              <div className="w-10 h-1 bg-slate-300 rounded-full" />
            </div>

            {/* Cabecera Compacta Bento */}
            <div className="px-4 py-3 bg-white border-b border-slate-100 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="flex items-center gap-2 min-w-0">
                  <h2 className="text-sm sm:text-base font-bold text-slate-800 tracking-tight truncate">
                    Mi Cuaderno de Estudio
                  </h2>
                  <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md shrink-0">
                    {items.length} {items.length === 1 ? 'guardado' : 'guardados'}
                  </span>
                </div>
              </div>

              {/* Botón de cierre */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                title="Cerrar cuaderno"
                aria-label="Cerrar cuaderno"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Barra Unificada de Búsqueda y Filtros de Materias (Altura Reducida) */}
            {items.length > 0 && (
              <div className="px-3 py-2 bg-white border-b-2 border-[#1A1A1A]/15 shrink-0">
                <div className="flex items-center gap-2">
                  {/* Buscador ultra-compacto */}
                  <div className="relative w-36 xs:w-44 sm:w-56 shrink-0">
                    <Search className="w-3.5 h-3.5 text-[#1A1A1A]/60 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Buscar apunte..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-7 pr-6 py-1 h-7 sm:h-8 text-xs font-bold text-[#1A1A1A] bg-[#FAF7EE] border border-[#1A1A1A] rounded-lg focus:bg-white focus:outline-none placeholder:text-[#1A1A1A]/40"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-black font-black px-1"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Filtros de Materias en la misma fila con scroll horizontal fluido */}
                  {availableSubjectIds.length > 0 && (
                    <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 scrollbar-none flex-1">
                      <button
                        type="button"
                        onClick={() => setSelectedSubjectFilter('all')}
                        className={`px-2 py-0.5 h-7 rounded-lg text-[11px] font-black border border-[#1A1A1A] cursor-pointer whitespace-nowrap transition-all ${
                          selectedSubjectFilter === 'all'
                            ? 'bg-[#1A1A1A] text-white shadow-[1px_1px_0px_#1A1A1A]'
                            : 'bg-gray-100 text-[#1A1A1A] hover:bg-gray-200'
                        }`}
                      >
                        Todas
                      </button>

                      {availableSubjectIds.map((subId) => {
                        const sub = getSubjectById(subId as SchoolSubjectId);
                        const isSelected = selectedSubjectFilter === subId;
                        return (
                          <button
                            key={subId}
                            type="button"
                            onClick={() => setSelectedSubjectFilter(subId)}
                            className={`px-2 py-0.5 h-7 rounded-lg text-[11px] font-black border border-[#1A1A1A] cursor-pointer flex items-center gap-1 whitespace-nowrap transition-all ${
                              isSelected
                                ? 'bg-[#FFE66D] text-[#1A1A1A] shadow-[1px_1px_0px_#1A1A1A]'
                                : 'bg-gray-100 text-[#1A1A1A] hover:bg-gray-200'
                            }`}
                          >
                            <span>{sub.icon}</span>
                            <span>{sub.shortName}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Contenido desplazable con las consultas guardadas */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-3">
              {items.length === 0 ? (
                /* Estado vacío cuando aún no hay notas */
                <div className="py-10 px-4 text-center max-w-sm mx-auto space-y-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-[#FFE66D] border-2 border-[#1A1A1A] shadow-[3px_3px_0px_#1A1A1A] flex items-center justify-center mx-auto">
                    <BookMarked className="w-7 h-7 text-[#1A1A1A]" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-[#1A1A1A]">
                      No tienes apuntes guardados aún
                    </h3>
                    <p className="text-xs font-medium text-[#1A1A1A]/70 mt-1 leading-relaxed">
                      Cuando revises una tarea o toques <strong>"Guardar apunte"</strong>, se guardará aquí para que la consultes y repases las veces que quieras.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="neo-btn px-4 py-2 bg-[#A8E6CF] hover:bg-[#8ee0c2] text-[#1A1A1A] text-xs font-black rounded-xl border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] cursor-pointer"
                  >
                    ✏️ Realizar una consulta
                  </button>
                </div>
              ) : filteredItems.length === 0 ? (
                /* Sin resultados en la búsqueda */
                <div className="py-8 text-center text-xs font-bold text-[#1A1A1A]/70">
                  No se encontraron consultas que coincidan con "{searchQuery}".
                </div>
              ) : (
                /* Lista de Tarjetas de Consultas Guardadas */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredItems.map((item) => {
                    const subject = getSubjectById(item.subjectId);
                    const isDeleting = justDeletedId === item.id;
                    const isConfirming = confirmDeleteId === item.id;

                    const hasStepByStep = Boolean(item.result.stepByStep);
                    const hasTopicExplanation = Boolean(item.result.topicExplanation);
                    const hasCorrection = Boolean(item.result.correction);
                    const hasSummary = Boolean(item.result.summary);
                    const hasQuizGuide = Boolean(item.result.quizGuide);

                    const titleSnippet =
                      item.result.stepByStep?.topic ||
                      item.result.topicExplanation?.topic ||
                      item.previewText;

                    return (
                      <div
                        key={item.id}
                        className={`bg-white rounded-2xl border-2 border-[#1A1A1A] shadow-[3px_3px_0px_#1A1A1A] p-3 flex flex-col justify-between gap-2.5 transition-all ${
                          isDeleting ? 'opacity-40 scale-95' : 'hover:-translate-y-0.5'
                        }`}
                      >
                        {/* Cabecera de la Ficha: Materia y Fecha */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between gap-1.5">
                            <span
                              style={{ backgroundColor: subject.color }}
                              className="px-2 py-0.5 rounded-lg border border-[#1A1A1A] text-[11px] font-black text-[#1A1A1A] flex items-center gap-1 shadow-[1px_1px_0px_#1A1A1A]"
                            >
                              <span>{subject.icon}</span>
                              <span>{subject.shortName}</span>
                            </span>

                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#1A1A1A]/70 flex-wrap">
                              {item.gradeLevel && (
                                <span className="bg-gray-100 px-1.5 py-0.5 rounded border border-gray-300 capitalize">
                                  {item.gradeLevel}
                                </span>
                              )}
                              {item.result?.responseDepth && (
                                <span
                                  className={`px-1.5 py-0.5 rounded border text-[9px] font-black uppercase ${
                                    item.result.responseDepth === 'detailed'
                                      ? 'bg-[#A8E6CF] text-[#1A1A1A] border-[#1A1A1A]/40'
                                      : 'bg-[#FFE66D] text-[#1A1A1A] border-[#1A1A1A]/40'
                                  }`}
                                >
                                  {item.result.responseDepth === 'detailed' ? 'Detallado' : 'Resumido'}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {item.dateStr || 'Hoy'}
                              </span>
                            </div>
                          </div>

                          {/* Título o tema de la tarea */}
                          <div>
                            <h4 className="text-xs sm:text-sm font-black text-[#1A1A1A] line-clamp-2 leading-snug">
                              {titleSnippet}
                            </h4>
                            {item.previewText !== titleSnippet && (
                              <p className="text-[11px] text-[#1A1A1A]/70 line-clamp-1 mt-0.5 font-medium">
                                "{item.previewText}"
                              </p>
                            )}
                          </div>

                          {/* Badges de módulos disponibles */}
                          <div className="flex items-center gap-1 flex-wrap pt-0.5">
                            {hasStepByStep && (
                              <span className="px-1.5 py-0.5 bg-[#FFB3BA] text-[#1A1A1A] rounded text-[10px] font-black border border-[#1A1A1A]">
                                🔢 Paso a paso
                              </span>
                            )}
                            {hasTopicExplanation && (
                              <span className="px-1.5 py-0.5 bg-[#BAE1FF] text-[#1A1A1A] rounded text-[10px] font-black border border-[#1A1A1A]">
                                💡 Explicación
                              </span>
                            )}
                            {hasQuizGuide && (
                              <span className="px-1.5 py-0.5 bg-[#FFE66D] text-[#1A1A1A] rounded text-[10px] font-black border border-[#1A1A1A]">
                                🎯 Examen
                              </span>
                            )}
                            {hasCorrection && (
                              <span className="px-1.5 py-0.5 bg-[#A8E6CF] text-[#1A1A1A] rounded text-[10px] font-black border border-[#1A1A1A]">
                                📝 Corrección
                              </span>
                            )}
                            {hasSummary && (
                              <span className="px-1.5 py-0.5 bg-[#FFDFBA] text-[#1A1A1A] rounded text-[10px] font-black border border-[#1A1A1A]">
                                📋 Resumen
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Botones de Acción */}
                        <div className="pt-2 border-t border-[#1A1A1A]/10 flex items-center justify-between gap-2">
                          {isConfirming ? (
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] font-bold text-red-600">¿Borrar?</span>
                              <button
                                type="button"
                                onClick={(e) => handleDeleteItem(e, item.id)}
                                className="px-2 py-0.5 bg-red-600 text-white rounded text-[10px] font-black border border-red-800 cursor-pointer"
                              >
                                Sí
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setConfirmDeleteId(null);
                                }}
                                className="px-2 py-0.5 bg-gray-200 text-[#1A1A1A] rounded text-[10px] font-bold cursor-pointer"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setConfirmDeleteId(item.id);
                              }}
                              className="p-1.5 text-xs text-[#1A1A1A]/50 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                              title="Eliminar este apunte"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span className="text-[10px] font-bold hidden xs:inline">Borrar</span>
                            </button>
                          )}

                          {/* Botón Principal: Recargar consulta en pantalla */}
                          <button
                            type="button"
                            onClick={() => {
                              onSelectSavedHomework(item);
                              setIsOpen(false);
                            }}
                            className="neo-btn flex items-center gap-1 px-3 py-1.5 bg-[#FFE66D] hover:bg-[#fedd48] text-[#1A1A1A] rounded-xl text-xs font-black border border-[#1A1A1A] shadow-[1.5px_1.5px_0px_#1A1A1A] cursor-pointer ml-auto"
                            title="Recargar el resultado completo en pantalla"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Recargar apunte</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Pie del Cuaderno: Limpio y sin tecnicismos */}
            <div className="p-3 bg-white border-t-2 border-[#1A1A1A] flex items-center justify-between gap-3 shrink-0">
              <span className="text-xs font-bold text-[#1A1A1A]/70">
                {items.length === 0
                  ? 'Libreta lista'
                  : `${items.length} ${items.length === 1 ? 'consulta guardada' : 'consultas guardadas'}`}
              </span>

              {items.length > 0 && (
                <div>
                  {confirmClearAll ? (
                    <div className="flex items-center gap-1.5 bg-red-50 p-1 rounded-xl border border-red-300">
                      <span className="text-[11px] font-black text-red-700">¿Vaciar libreta?</span>
                      <button
                        type="button"
                        onClick={handleClearAll}
                        className="px-2 py-0.5 bg-red-600 text-white rounded-lg text-xs font-black cursor-pointer"
                      >
                        Sí, vaciar
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmClearAll(false)}
                        className="px-2 py-0.5 bg-gray-200 text-[#1A1A1A] rounded-lg text-xs font-bold cursor-pointer"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmClearAll(true)}
                      className="p-1.5 text-xs text-[#1A1A1A]/60 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer flex items-center gap-1 font-bold"
                      title="Eliminar todos los apuntes guardados"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Vaciar libreta</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
