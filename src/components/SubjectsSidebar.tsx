/**
 * Panel Lateral Izquierdo de Materias Escolares - Tutor-IA
 * Diseño Neo-Pop Moderno:
 * - En PC: Barra lateral organizada con buscador, categorías y lista visual de las 18 asignaturas.
 * - Colapsable con 1 clic para tener pantalla 100% libre cuando se requiera.
 * - En Móvil: Drawer flotante suave con backdrop blur accesible desde cualquier punto.
 */

import React, { useState, useMemo } from 'react';
import {
  Search,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  X,
  Layers,
} from 'lucide-react';
import { SchoolSubjectId, GradeLevel, SchoolSubjectCategory } from '../types';
import {
  SCHOOL_SUBJECTS,
  SUBJECT_CATEGORIES,
  getSubjectById,
} from '../data/schoolSubjects';

interface SubjectsSidebarProps {
  selectedSubjectId: SchoolSubjectId;
  onSelectSubject: (id: SchoolSubjectId) => void;
  gradeLevel?: GradeLevel;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  isCollapsedDesktop: boolean;
  onToggleCollapseDesktop: () => void;
  disabled?: boolean;
}

export const SubjectsSidebar: React.FC<SubjectsSidebarProps> = ({
  selectedSubjectId,
  onSelectSubject,
  gradeLevel = 'primaria',
  isOpenMobile,
  onCloseMobile,
  isCollapsedDesktop,
  onToggleCollapseDesktop,
  disabled = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | SchoolSubjectCategory>('all');

  const currentSubject = getSubjectById(selectedSubjectId);

  // Filtrado reactivo por término y categoría
  const filteredSubjects = useMemo(() => {
    return SCHOOL_SUBJECTS.filter((subj) => {
      const matchesCategory = activeCategory === 'all' || subj.category === activeCategory;
      if (!matchesCategory) return false;
      if (!searchTerm.trim()) return true;
      const q = searchTerm.toLowerCase().trim();
      return (
        subj.name.toLowerCase().includes(q) ||
        subj.shortName.toLowerCase().includes(q) ||
        subj.description.toLowerCase().includes(q)
      );
    });
  }, [activeCategory, searchTerm]);

  const handleSelect = (id: SchoolSubjectId) => {
    if (disabled) return;
    onSelectSubject(id);
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden select-none">
      {/* Cabecera del Panel */}
      <div className="p-3.5 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100">
            <BookOpen className="w-4 h-4 text-[#181829]" />
          </span>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-800 tracking-tight">
              Materias Escolares
            </h3>
            <span className="text-[10px] text-slate-400 block leading-none">
              18 asignaturas disponibles
            </span>
          </div>
        </div>

        {/* Botón de cierre en móvil o colapso en desktop */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onToggleCollapseDesktop}
            className="hidden lg:flex p-1.5 bg-white hover:bg-gray-100 rounded-lg border-2 border-[#181829] shadow-[1.5px_1.5px_0px_#181829] cursor-pointer"
            title={isCollapsedDesktop ? 'Expandir panel' : 'Colapsar panel'}
          >
            {isCollapsedDesktop ? (
              <ChevronRight className="w-3.5 h-3.5 text-[#181829]" />
            ) : (
              <ChevronLeft className="w-3.5 h-3.5 text-[#181829]" />
            )}
          </button>

          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 bg-white hover:bg-red-50 text-red-600 rounded-lg border-2 border-[#181829] shadow-[1.5px_1.5px_0px_#181829] cursor-pointer"
            title="Cerrar panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Buscador Rápido */}
      <div className="p-3 border-b border-slate-100 bg-slate-50/50">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar materia..."
            className="w-full pl-8 pr-7 py-2 bg-white rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Lista de Materias con Scroll Táctil */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5 divide-y divide-transparent">
        {filteredSubjects.length === 0 ? (
          <div className="p-4 text-center text-xs font-medium text-slate-400">
            No se encontró ninguna materia con "{searchTerm}".
          </div>
        ) : (
          filteredSubjects.map((subj) => {
            const isSelected = subj.id === selectedSubjectId;
            return (
              <button
                key={subj.id}
                type="button"
                onClick={() => handleSelect(subj.id)}
                disabled={disabled}
                className={`w-full text-left p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-2.5 border ${
                  isSelected
                    ? 'bg-indigo-50/80 border-indigo-200 text-indigo-950 font-bold shadow-xs'
                    : 'bg-white hover:bg-slate-50 border-transparent hover:border-slate-200 text-slate-700 font-medium'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="w-8 h-8 rounded-lg border border-slate-200/80 flex items-center justify-center text-sm shrink-0 shadow-xs"
                    style={{ backgroundColor: subj.color }}
                  >
                    {subj.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-bold block truncate leading-tight">
                      {subj.shortName}
                    </span>
                    <span className="text-[10px] text-slate-400 block truncate leading-tight">
                      {subj.name}
                    </span>
                  </div>
                </div>

                {isSelected && (
                  <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0"></span>
                )}
              </button>
            );
          })
        )}
      </div>

      {/* Pie del Panel: Materia Activa en Detalle */}
      <div className="p-3 bg-slate-50/70 border-t border-slate-100 flex items-center gap-2.5">
        <span
          className="w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center text-base shrink-0 shadow-xs"
          style={{ backgroundColor: currentSubject.color }}
        >
          {currentSubject.icon}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-800 truncate">
              {currentSubject.shortName}
            </span>
            <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 bg-white rounded border border-slate-200 text-slate-600">
              Activa
            </span>
          </div>
          <p className="text-[10px] text-slate-400 truncate">
            {currentSubject.description}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. MODO ESCRITORIO (Desktop >= lg) */}
      <aside
        className={`hidden lg:block shrink-0 sticky top-20 self-start transition-all duration-300 ${
          isCollapsedDesktop ? 'w-16' : 'w-72 xl:w-80'
        }`}
      >
        {isCollapsedDesktop ? (
          /* Versión Colapsada Minimalista en Desktop: Fija en pantalla mientras el lado derecho hace scroll */
          <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-2 flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={onToggleCollapseDesktop}
              className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 cursor-pointer transition-colors"
              title="Expandir materias escolares"
            >
              <ChevronRight className="w-4 h-4 text-slate-700" />
            </button>

            <div className="w-8 h-px bg-slate-200 my-1"></div>

            <div
              className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-lg shadow-xs"
              style={{ backgroundColor: currentSubject.color }}
              title={`Materia activa: ${currentSubject.shortName}`}
            >
              {currentSubject.icon}
            </div>

            <div className="flex flex-col gap-1.5 max-h-[calc(100vh-220px)] overflow-y-auto no-scrollbar pt-2">
              {SCHOOL_SUBJECTS.map((subj) => (
                <button
                  key={subj.id}
                  type="button"
                  onClick={() => handleSelect(subj.id)}
                  disabled={disabled}
                  className={`w-9 h-9 rounded-lg border flex items-center justify-center text-sm transition-all cursor-pointer ${
                    subj.id === selectedSubjectId
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-950 font-bold shadow-xs'
                      : 'border-transparent hover:border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                  title={subj.name}
                >
                  {subj.icon}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Versión Expandida Completa en Desktop: Fija en pantalla con su propio scroll interno independiente */
          <div className="h-[calc(100vh-100px)]">
            {sidebarContent}
          </div>
        )}
      </aside>

      {/* 2. MODO MÓVIL (Drawer deslizante con Backdrop Blur) */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Fondo oscuro con desenfoque */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={onCloseMobile}
          />

          {/* Drawer Lateral */}
          <div className="relative w-[85vw] max-w-xs h-full p-3 z-10 animate-in slide-in-from-left duration-200 flex flex-col">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
