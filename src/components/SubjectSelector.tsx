/**
 * Selector Maestro Visual de Materias Escolares - Tutor-IA
 * - En PC (sm y superior): Muestra los 6 botones de acceso rápido con íconos grandes + la tarjeta interactiva que abre el selector visual elaborado.
 * - En Celular (< sm): Oculta la cuadrícula de botones rápidos para ahorrar espacio vertical y muestra una única Tarjeta Interactiva que despliega el selector visual.
 * - Desplegable Visual Elaborado: Reemplaza el <select> nativo por un panel con pestañas por categorías, buscador rápido, colores pastel e íconos grandes.
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  ChevronDown,
  Image as ImageIcon,
  FileText,
  Check,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import { SchoolSubjectId, GradeLevel, SchoolSubjectCategory } from '../types';
import {
  SCHOOL_SUBJECTS,
  SUBJECT_CATEGORIES,
  getSubjectById,
  isSubjectVisualOrFormula,
} from '../data/schoolSubjects';

interface SubjectSelectorProps {
  selectedSubjectId: SchoolSubjectId;
  onSelectSubject: (id: SchoolSubjectId) => void;
  gradeLevel?: GradeLevel;
  disabled?: boolean;
}

const QUICK_KIDS_SUBJECTS: SchoolSubjectId[] = [
  'matematicas',
  'lengua',
  'ciencias_naturales',
  'ingles',
  'sociales',
  'artes',
];

const QUICK_HIGH_SUBJECTS: SchoolSubjectId[] = [
  'matematicas',
  'lengua',
  'fisica',
  'quimica',
  'ingles',
  'biologia',
];

export const SubjectSelector: React.FC<SubjectSelectorProps> = ({
  selectedSubjectId,
  onSelectSubject,
  gradeLevel = 'primaria',
  disabled = false,
}) => {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'all' | SchoolSubjectCategory>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const currentSubject = getSubjectById(selectedSubjectId);
  const allowsVisualMedia = isSubjectVisualOrFormula(selectedSubjectId);
  const currentCategory = SUBJECT_CATEGORIES.find((c) => c.id === currentSubject.category);

  const quickSubjectIds = gradeLevel === 'primaria' ? QUICK_KIDS_SUBJECTS : QUICK_HIGH_SUBJECTS;

  // Cerrar el desplegable al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsPickerOpen(false);
      }
    };
    if (isPickerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPickerOpen]);

  // Materias filtradas por categoría activa y término de búsqueda
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

  const handleChooseSubject = (id: SchoolSubjectId) => {
    onSelectSubject(id);
    setIsPickerOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="w-full space-y-3" ref={containerRef}>
      {/* Cabecera Numerada PASO 1 */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-xl bg-[#FFE66D] border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] text-xs font-black text-[#1A1A1A] shrink-0">
            PASO 1
          </span>
          <span className="text-sm sm:text-base font-black text-[#1A1A1A]">
            ¿De qué materia es tu tarea?
          </span>
        </div>
        <span className="text-[11px] font-bold text-[#1A1A1A]/65 hidden sm:inline">
          Accesos directos o catálogo de {SCHOOL_SUBJECTS.length} asignaturas
        </span>
      </div>

      {/* Botones grandes de acceso rápido: SOLO VISIBLES EN PC (hidden sm:grid) para ahorrar espacio en celular */}
      <div className="hidden sm:grid sm:grid-cols-6 gap-2">
        {quickSubjectIds.map((subId) => {
          const sub = getSubjectById(subId);
          const isSelected = selectedSubjectId === subId;
          return (
            <button
              key={subId}
              type="button"
              disabled={disabled}
              onClick={() => handleChooseSubject(subId)}
              style={{
                backgroundColor: isSelected ? sub.color : '#FAF7EE',
              }}
              className={`neo-tag-btn flex flex-col items-center justify-center gap-1 py-2.5 px-2 rounded-xl cursor-pointer text-center transition-transform ${
                isSelected
                  ? 'scale-[1.02] ring-2 ring-[#1A1A1A]'
                  : 'hover:bg-white opacity-90 hover:opacity-100'
              }`}
            >
              <span className="text-2xl leading-none">{sub.icon}</span>
              <span className="text-xs font-black text-[#1A1A1A] whitespace-nowrap truncate max-w-full">
                {sub.shortName}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tarjeta Activa Interactiva: En Celular y PC abre el Desplegable Visual Elaborado */}
      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsPickerOpen((prev) => !prev)}
          aria-expanded={isPickerOpen}
          className={`w-full text-left p-3 sm:p-3.5 rounded-2xl border-2 border-[#1A1A1A] shadow-[3px_3px_0px_#1A1A1A] transition-all cursor-pointer disabled:opacity-50 ${
            isPickerOpen ? 'bg-white ring-2 ring-[#FFE66D]' : 'bg-[#FAF7EE] hover:bg-white'
          }`}
        >
          <div className="flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-3 min-w-0">
              {/* Ícono grande con el color de la materia */}
              <div
                style={{ backgroundColor: currentSubject.color }}
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl border-2 border-[#1A1A1A] flex items-center justify-center text-2xl shrink-0 shadow-[2px_2px_0px_#1A1A1A]"
              >
                <span>{currentSubject.icon}</span>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-black text-sm sm:text-base text-[#1A1A1A] leading-tight">
                    {currentSubject.name}
                  </span>
                  <span className="text-[11px] font-bold text-[#1A1A1A]/65 hidden xs:inline">
                    · {currentCategory ? `${currentCategory.emoji} ${currentCategory.name}` : 'General'}
                  </span>
                </div>
                <p className="text-xs text-[#1A1A1A]/75 font-medium leading-snug mt-0.5 line-clamp-1 sm:line-clamp-none">
                  {currentSubject.description}
                </p>
              </div>
            </div>

            {/* Botón indicador para abrir el catálogo de 18 materias */}
            <div className="shrink-0 flex items-center gap-2">
              <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-bold text-[#1A1A1A]/70">
                {allowsVisualMedia ? (
                  <>
                    <ImageIcon className="w-3.5 h-3.5 text-[#1A1A1A]" />
                    <span>Texto/Foto/PDF</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-3.5 h-3.5 text-[#1A1A1A]" />
                    <span>Texto</span>
                  </>
                )}
              </span>

              <div
                className={`px-2.5 py-1.5 rounded-xl border-2 border-[#1A1A1A] shadow-[1.5px_1.5px_0px_#1A1A1A] flex items-center gap-1 text-xs font-black text-[#1A1A1A] transition-colors ${
                  isPickerOpen ? 'bg-[#1A1A1A] text-white' : 'bg-[#FFE66D] hover:bg-[#fedd48]'
                }`}
              >
                <span>{isPickerOpen ? 'Cerrar' : 'Cambiar'}</span>
                <ChevronDown
                  className={`w-4 h-4 stroke-[2.5] transition-transform duration-200 ${
                    isPickerOpen ? 'rotate-180' : ''
                  }`}
                />
              </div>
            </div>
          </div>
        </button>

        {/* =========================================================================
            DESPLEGABLE VISUAL ELABORADO CON PESTAÑAS POR CATEGORÍAS Y TARJETAS
            ========================================================================= */}
        {isPickerOpen && (
          <div className="mt-2.5 bg-white rounded-2xl border-[2.5px] border-[#1A1A1A] shadow-[6px_6px_0px_#1A1A1A] p-3 sm:p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150 z-30">
            {/* Barra superior del desplegable: Buscador + Pestañas de Categoría */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b-2 border-[#1A1A1A]/10">
              {/* Buscador rápido */}
              <div className="relative w-full sm:w-56 shrink-0">
                <Search className="w-3.5 h-3.5 text-[#1A1A1A]/50 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar asignatura..."
                  className="w-full pl-8 pr-7 py-1.5 h-8 text-xs font-bold text-[#1A1A1A] bg-[#FAF7EE] border border-[#1A1A1A] rounded-xl focus:bg-white focus:outline-none placeholder:text-[#1A1A1A]/45"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Pestañas de Categorías deslizable horizontalmente */}
              <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 scrollbar-none">
                <button
                  type="button"
                  onClick={() => setActiveCategory('all')}
                  className={`px-2.5 py-1 h-7 rounded-lg text-[11px] font-black border border-[#1A1A1A] cursor-pointer whitespace-nowrap transition-all flex items-center gap-1 shrink-0 ${
                    activeCategory === 'all'
                      ? 'bg-[#1A1A1A] text-white shadow-[1px_1px_0px_#1A1A1A]'
                      : 'bg-[#FAF7EE] text-[#1A1A1A] hover:bg-[#FFE66D]/50'
                  }`}
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Todas ({SCHOOL_SUBJECTS.length})</span>
                </button>

                {SUBJECT_CATEGORIES.map((cat) => {
                  const isCatActive = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setActiveCategory(cat.id)}
                      className={`px-2.5 py-1 h-7 rounded-lg text-[11px] font-black border border-[#1A1A1A] cursor-pointer whitespace-nowrap transition-all flex items-center gap-1 shrink-0 ${
                        isCatActive
                          ? 'bg-[#FFE66D] text-[#1A1A1A] shadow-[1px_1px_0px_#1A1A1A]'
                          : 'bg-[#FAF7EE] text-[#1A1A1A] hover:bg-gray-100'
                      }`}
                    >
                      <span>{cat.emoji}</span>
                      <span>{cat.name.split('&')[0].trim()}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Cuadrícula de Tarjetas Visuales de Asignaturas */}
            {filteredSubjects.length === 0 ? (
              <div className="py-6 text-center text-xs font-bold text-[#1A1A1A]/65">
                No encontramos una materia llamada "{searchTerm}". Prueba con otra palabra.
              </div>
            ) : (
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-2 max-h-[310px] sm:max-h-[340px] overflow-y-auto pr-0.5">
                {filteredSubjects.map((subj) => {
                  const isSelected = subj.id === selectedSubjectId;
                  return (
                    <button
                      key={subj.id}
                      type="button"
                      onClick={() => handleChooseSubject(subj.id)}
                      style={{
                        backgroundColor: isSelected ? subj.color : '#FAF7EE',
                      }}
                      className={`flex items-start gap-2.5 p-2.5 rounded-xl border-2 border-[#1A1A1A] text-left cursor-pointer transition-all ${
                        isSelected
                          ? 'shadow-[2.5px_2.5px_0px_#1A1A1A] scale-[1.01]'
                          : 'hover:bg-white shadow-[1.5px_1.5px_0px_#1A1A1A]'
                      }`}
                    >
                      <div
                        style={{ backgroundColor: isSelected ? '#FFFFFF' : subj.color }}
                        className="w-9 h-9 rounded-lg border-[1.5px] border-[#1A1A1A] flex items-center justify-center text-lg shrink-0 shadow-[1px_1px_0px_#1A1A1A]"
                      >
                        <span>{subj.icon}</span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-black text-[#1A1A1A] truncate">
                            {subj.name}
                          </span>
                          {isSelected && (
                            <span className="w-4 h-4 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center shrink-0">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] font-semibold text-[#1A1A1A]/75 line-clamp-2 leading-tight mt-0.5">
                          {subj.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
