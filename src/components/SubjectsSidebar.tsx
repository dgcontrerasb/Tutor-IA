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
    <div className="flex flex-col h-full bg-white border-[2.5px] border-[#181829] shadow-[4px_4px_0px_#181829] rounded-2xl overflow-hidden select-none">
      {/* Cabecera del Panel */}
      <div className="p-3.5 border-b-2 border-[#181829] bg-[#FDE047] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-white rounded-lg border-2 border-[#181829] shadow-[1.5px_1.5px_0px_#181829]">
            <BookOpen className="w-4 h-4 text-[#181829]" />
          </span>
          <div>
            <h3 className="text-xs sm:text-sm font-black text-[#181829] tracking-tight">
              Materias Escolares
            </h3>
            <span className="text-[10px] font-bold text-[#181829]/75 block leading-none">
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
      <div className="p-2.5 border-b border-[#181829]/15 bg-[#F8FAFC]">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#181829]/50" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar materia..."
            className="w-full pl-8 pr-7 py-1.5 bg-white rounded-xl border-2 border-[#181829] text-xs font-bold text-[#181829] placeholder-[#181829]/40 focus:outline-hidden focus:ring-2 focus:ring-[#6366F1]"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Categorías en chips miniatura */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-2">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={`px-2 py-0.5 rounded-lg text-[10px] font-black shrink-0 border transition-all cursor-pointer ${
              activeCategory === 'all'
                ? 'bg-[#181829] text-white border-[#181829]'
                : 'bg-white text-[#181829] border-[#181829]/30 hover:border-[#181829]'
            }`}
          >
            Todas (18)
          </button>
          {SUBJECT_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-black shrink-0 border transition-all cursor-pointer flex items-center gap-1 ${
                activeCategory === cat.id
                  ? 'bg-[#181829] text-white border-[#181829]'
                  : 'bg-white text-[#181829] border-[#181829]/30 hover:border-[#181829]'
              }`}
            >
              <span>{cat.emoji}</span>
              <span>{cat.name.split('&')[0].trim()}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Materias con Scroll Táctil */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5 divide-y divide-transparent">
        {filteredSubjects.length === 0 ? (
          <div className="p-4 text-center text-xs font-bold text-[#181829]/60">
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
                className={`w-full text-left p-2 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-2 border-[2px] ${
                  isSelected
                    ? 'bg-[#FFE66D] border-[#181829] shadow-[2.5px_2.5px_0px_#181829] font-black scale-[1.01]'
                    : 'bg-white hover:bg-[#F3F5FA] border-transparent hover:border-[#181829]/40 text-[#181829] font-bold'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-7 h-7 rounded-lg border border-[#181829] flex items-center justify-center text-sm shrink-0 shadow-[1px_1px_0px_#181829]"
                    style={{ backgroundColor: subj.color }}
                  >
                    {subj.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-black block truncate leading-tight">
                      {subj.shortName}
                    </span>
                    <span className="text-[10px] font-semibold text-[#181829]/60 block truncate leading-tight">
                      {subj.name}
                    </span>
                  </div>
                </div>

                {isSelected && (
                  <span className="w-2 h-2 rounded-full bg-[#181829] shrink-0 animate-ping"></span>
                )}
              </button>
            );
          })
        )}
      </div>

      {/* Pie del Panel: Materia Activa en Detalle */}
      <div className="p-2.5 bg-[#F3F5FA] border-t-2 border-[#181829] flex items-center gap-2">
        <span
          className="w-8 h-8 rounded-xl border-2 border-[#181829] flex items-center justify-center text-base shrink-0 shadow-[1.5px_1.5px_0px_#181829]"
          style={{ backgroundColor: currentSubject.color }}
        >
          {currentSubject.icon}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-black text-[#181829] truncate">
              {currentSubject.shortName}
            </span>
            <span className="text-[9px] font-black uppercase px-1.5 py-0.2 bg-white rounded border border-[#181829]">
              Activa
            </span>
          </div>
          <p className="text-[10px] font-semibold text-[#181829]/70 truncate">
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
        className={`hidden lg:block shrink-0 transition-all duration-300 ${
          isCollapsedDesktop ? 'w-16' : 'w-72 xl:w-80'
        }`}
      >
        {isCollapsedDesktop ? (
          /* Versión Colapsada Minimalista en Desktop */
          <div className="bg-white border-[2.5px] border-[#181829] shadow-[4px_4px_0px_#181829] rounded-2xl p-2 flex flex-col items-center gap-3 sticky top-20">
            <button
              type="button"
              onClick={onToggleCollapseDesktop}
              className="p-2 bg-[#FDE047] hover:bg-[#fedd48] rounded-xl border-2 border-[#181829] shadow-[2px_2px_0px_#181829] cursor-pointer"
              title="Expandir materias escolares"
            >
              <ChevronRight className="w-4 h-4 text-[#181829]" />
            </button>

            <div className="w-8 h-0.5 bg-[#181829]/15 my-1"></div>

            <div
              className="w-10 h-10 rounded-xl border-2 border-[#181829] flex items-center justify-center text-lg shadow-[2px_2px_0px_#181829]"
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
                  className={`w-9 h-9 rounded-lg border-2 flex items-center justify-center text-sm transition-all cursor-pointer ${
                    subj.id === selectedSubjectId
                      ? 'border-[#181829] bg-[#FFE66D] shadow-[2px_2px_0px_#181829] scale-105'
                      : 'border-transparent hover:border-[#181829]/50 hover:bg-gray-100'
                  }`}
                  title={subj.name}
                >
                  {subj.icon}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Versión Expandida Completa en Desktop */
          <div className="sticky top-20 h-[calc(100vh-95px)]">
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
