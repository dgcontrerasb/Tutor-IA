/**
 * Mascota Escolar Interactiva ("Lápiz Pop") e Interruptor Deslizante Animado (Primaria <-> Bachillerato)
 * - Interruptor con píldora deslizante elástica, textos siempre visibles y retroalimentación instantánea.
 * - Personaje escolar ilustrado en SVG que cambia de accesorios (gorra de explorador en Primaria vs. gafas de laboratorio en Bachillerato)
 *   y reacciona dinámicamente a la materia activa y al estado de revisión.
 */

import React, { useState, useEffect } from 'react';
import { Sparkles, MessageCircleHeart } from 'lucide-react';
import { GradeLevel, SchoolSubjectId } from '../types';
import { getSubjectById } from '../data/schoolSubjects';

interface GradeLevelSwitchProps {
  gradeLevel: GradeLevel;
  onChange: (level: GradeLevel) => void;
  size?: 'compact' | 'large';
}

/**
 * Interruptor deslizante animado entre Primaria y Bachillerato
 */
export const GradeLevelSwitch: React.FC<GradeLevelSwitchProps> = ({
  gradeLevel,
  onChange,
  size = 'compact',
}) => {
  const isPrimaria = gradeLevel === 'primaria';

  return (
    <div
      className={`relative inline-grid grid-cols-2 items-center bg-white rounded-xl border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] p-0.5 select-none overflow-hidden ${
        size === 'large' ? 'h-11 sm:h-12 min-w-[250px] sm:min-w-[290px]' : 'h-9 sm:h-10 min-w-[186px] sm:min-w-[216px]'
      }`}
      role="group"
      aria-label="Selector de nivel escolar"
    >
      {/* Pastilla deslizante animada de fondo */}
      <div
        className={`absolute top-0.5 bottom-0.5 w-[calc(50%-2px)] rounded-lg border border-[#1A1A1A] shadow-[1px_1px_0px_#1A1A1A] transition-all duration-200 ease-out pointer-events-none ${
          isPrimaria
            ? 'left-0.5 translate-x-0 bg-[#FFE66D]'
            : 'left-0.5 translate-x-full bg-[#A0E7E5]'
        }`}
      />

      {/* Opción Primaria */}
      <button
        type="button"
        onClick={() => onChange('primaria')}
        aria-pressed={isPrimaria}
        className={`relative z-10 flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3 h-full rounded-lg font-black transition-transform duration-150 cursor-pointer whitespace-nowrap ${
          size === 'large' ? 'text-xs sm:text-sm' : 'text-[11px] sm:text-xs'
        } ${isPrimaria ? 'text-[#1A1A1A] scale-[1.02]' : 'text-[#1A1A1A]/65 hover:text-[#1A1A1A]'}`}
        title="Modo Primaria: Explicaciones paso a paso con ejemplos divertidos para niños"
      >
        <span className={size === 'large' ? 'text-base sm:text-lg' : 'text-xs sm:text-sm'}>🎒</span>
        <span>Primaria</span>
      </button>

      {/* Opción Bachillerato */}
      <button
        type="button"
        onClick={() => onChange('secundaria')}
        aria-pressed={!isPrimaria}
        className={`relative z-10 flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3 h-full rounded-lg font-black transition-transform duration-150 cursor-pointer whitespace-nowrap ${
          size === 'large' ? 'text-xs sm:text-sm' : 'text-[11px] sm:text-xs'
        } ${!isPrimaria ? 'text-[#1A1A1A] scale-[1.02]' : 'text-[#1A1A1A]/65 hover:text-[#1A1A1A]'}`}
        title="Modo Bachillerato: Resolución completa, fórmulas, análisis y preparación de exámenes"
      >
        <span className={size === 'large' ? 'text-base sm:text-lg' : 'text-xs sm:text-sm'}>📐</span>
        <span>Bachillerato</span>
      </button>
    </div>
  );
};

interface SchoolMascotProps {
  gradeLevel: GradeLevel;
  subjectId: SchoolSubjectId;
  isLoading?: boolean;
}

const SUBJECT_TIPS_PRIMARIA: Record<string, string[]> = {
  lengua: [
    '¡Hola explorador! Escribe tu cuento o tarea y cazaremos juntos todas las tildes perdidas.',
    '¡Las palabras son mágicas! Te ayudaré a que tu redacción quede de 10.',
  ],
  matematicas: [
    '¡Los números son súper divertidos! Te explicaré cada suma, fracción o problema paso a paso.',
    '¡No temas a las matemáticas! Vamos a resolverlo como detectives.',
  ],
  ciencias_naturales: [
    '¡A explorar la naturaleza! Descubre cómo funcionan las plantas, los animales y el planeta.',
    '¡La ciencia es increíble! Pregúntame lo que quieras de tu tarea.',
  ],
  biologia: [
    '¡Las células y los seres vivos guardan grandes secretos! Vamos a descubrirlos fácil.',
    '¡Te explico la biología con ejemplos súper fáciles de recordar!',
  ],
  ingles: [
    'Hello friend! Aprendamos vocabulario y oraciones en inglés de forma súper fácil.',
    '¡Practiquemos inglés juntos! Te explico qué significa cada palabra.',
  ],
  historia: [
    '¡Viajemos en el tiempo! Te contaré la historia como si fuera una gran aventura.',
    '¡Descubre qué pasó en cada época con resúmenes cortos y claros!',
  ],
  default: [
    '¡Hola! Soy Lápiz Pop. Tócame para darte un súper consejo escolar.',
    '¡Elige tu materia abajo y hagamos tu tarea paso a paso y sin enredos!',
  ],
};

const SUBJECT_TIPS_SECUNDARIA: Record<string, string[]> = {
  lengua: [
    'Modo Academia activo: revisemos estructura argumentativa, ortografía RAE y síntesis crítica.',
    'Analicemos figuras literarias, tesis y coherencia textual para tu entrega.',
  ],
  matematicas: [
    'Listo para ecuaciones, álgebra, funciones o cálculo. Desglosemos cada despeje con rigor.',
    'Sube foto del ejercicio o escribe el problema para ver el desarrollo matemático completo.',
  ],
  fisica: [
    'Fuerzas, cinemática y energía listos: identificaremos datos, fórmulas y conversión de unidades.',
    'Resolvamos tu taller de física paso a paso con explicación conceptual.',
  ],
  quimica: [
    'Estequiometría, enlaces y tabla periódica: desglosemos cada reacción con claridad.',
    'Revisemos balanceo de ecuaciones y nomenclatura química al instante.',
  ],
  ingles: [
    'Let’s master grammar, reading comprehension and essay writing step by step.',
    'Revisión gramatical detallada y explicación de tiempos verbales en inglés.',
  ],
  default: [
    'Modo Reto Bachillerato activo: explicaciones analíticas, fórmulas y claves de examen.',
    'Tócame para cambiar de consejo o selecciona tu asignatura abajo.',
  ],
};

export const SchoolMascot: React.FC<SchoolMascotProps> = ({
  gradeLevel,
  subjectId,
  isLoading = false,
}) => {
  const [tipIndex, setTipIndex] = useState(0);
  const [isBouncing, setIsBouncing] = useState(false);

  const isPrimaria = gradeLevel === 'primaria';
  const currentSubject = getSubjectById(subjectId);

  // Animar cuando cambia el nivel o la materia
  useEffect(() => {
    setTipIndex(0);
    setIsBouncing(true);
    const timer = setTimeout(() => setIsBouncing(false), 450);
    return () => clearTimeout(timer);
  }, [gradeLevel, subjectId]);

  const tipsPool = isPrimaria
    ? SUBJECT_TIPS_PRIMARIA[subjectId] || SUBJECT_TIPS_PRIMARIA.default
    : SUBJECT_TIPS_SECUNDARIA[subjectId] || SUBJECT_TIPS_SECUNDARIA.default;

  const activeMessage = isLoading
    ? isPrimaria
      ? `¡Estoy leyendo tu tarea de ${currentSubject.shortName} con mi lupa mágica! ✨`
      : `Analizando tu consulta de ${currentSubject.name} y estructurando los pasos...`
    : tipsPool[tipIndex % tipsPool.length];

  const handleMascotClick = () => {
    setIsBouncing(true);
    setTipIndex((prev) => prev + 1);
    setTimeout(() => setIsBouncing(false), 400);
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full max-w-2xl mx-auto">
      {/* Avatar de la Mascota Escolar Interactiva */}
      <button
        type="button"
        onClick={handleMascotClick}
        title="¡Tócame para ver otro consejo escolar!"
        className={`group relative shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-[2.5px] border-[#1A1A1A] shadow-[3px_3px_0px_#1A1A1A] flex items-center justify-center cursor-pointer transition-transform duration-200 select-none ${
          isPrimaria ? 'bg-[#FFE66D]' : 'bg-[#A0E7E5]'
        } ${isBouncing ? 'scale-110 -rotate-3' : 'hover:scale-105'}`}
      >
        {/* Insignia de la materia activa en la esquina */}
        <span
          style={{ backgroundColor: currentSubject.color }}
          className="absolute -top-2 -right-2 w-8 h-8 rounded-xl border-2 border-[#1A1A1A] shadow-[1.5px_1.5px_0px_#1A1A1A] flex items-center justify-center text-base z-10 transition-transform group-hover:rotate-12"
        >
          {currentSubject.icon}
        </span>

        {/* Ilustración SVG de Lápiz Pop (Cambia según Primaria vs Bachillerato) */}
        <svg
          viewBox="0 0 100 100"
          className="w-16 h-16 sm:w-20 sm:h-20 mascot-float"
          aria-hidden="true"
        >
          {/* Cuerpo de cuaderno/lápiz amigable */}
          <rect
            x="24"
            y="26"
            width="52"
            height="58"
            rx="14"
            fill={isPrimaria ? '#FFFFFF' : '#FAF7EE'}
            stroke="#1A1A1A"
            strokeWidth="4"
          />
          {/* Franja superior de color según nivel */}
          <path
            d="M24 40 C24 31 30 26 38 26 L62 26 C70 26 76 31 76 40 Z"
            fill={isPrimaria ? '#FF8B94' : '#A8E6CF'}
            stroke="#1A1A1A"
            strokeWidth="4"
          />

          {/* Accesorio superior: Gorra de explorador (Primaria) o Birrete/Antena científica (Bachillerato) */}
          {isPrimaria ? (
            <g>
              {/* Estrella de explorador en la frente */}
              <polygon
                points="50,15 53,22 61,22 55,27 57,34 50,29 43,34 45,27 39,22 47,22"
                fill="#FFE66D"
                stroke="#1A1A1A"
                strokeWidth="2.5"
              />
            </g>
          ) : (
            <g>
              {/* Birrete de academia */}
              <polygon
                points="50,10 76,21 50,31 24,21"
                fill="#1A1A1A"
                stroke="#1A1A1A"
                strokeWidth="2"
              />
              <line x1="72" y1="22" x2="72" y2="34" stroke="#FFE66D" strokeWidth="3" />
              <circle cx="72" cy="35" r="3" fill="#FFE66D" />
            </g>
          )}

          {/* Ojos expresivos */}
          <circle cx="39" cy="54" r="5" fill="#1A1A1A" />
          <circle cx="61" cy="54" r="5" fill="#1A1A1A" />
          <circle cx="41" cy="52" r="2" fill="#FFFFFF" />
          <circle cx="63" cy="52" r="2" fill="#FFFFFF" />

          {/* Si es Bachillerato, añadir gafas de laboratorio/academia */}
          {!isPrimaria && (
            <g stroke="#1A1A1A" strokeWidth="3" fill="none">
              <rect x="30" y="46" width="18" height="14" rx="4" fill="#A0E7E5" fillOpacity="0.25" />
              <rect x="52" y="46" width="18" height="14" rx="4" fill="#A0E7E5" fillOpacity="0.25" />
              <line x1="48" y1="53" x2="52" y2="53" />
            </g>
          )}

          {/* Mejillas sonrojadas */}
          <ellipse cx="31" cy="62" rx="4" ry="2.5" fill="#FF8B94" />
          <ellipse cx="69" cy="62" rx="4" ry="2.5" fill="#FF8B94" />

          {/* Sonrisa alegre */}
          <path
            d="M42 65 Q50 74 58 65"
            fill="none"
            stroke="#1A1A1A"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        </svg>

        <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md bg-white border border-[#1A1A1A] text-[10px] font-black text-[#1A1A1A] whitespace-nowrap shadow-[1px_1px_0px_#1A1A1A]">
          {isPrimaria ? 'Lápiz Pop' : 'Profe Pop'}
        </span>
      </button>

      {/* Globo de diálogo interactivo del personaje */}
      <div
        onClick={handleMascotClick}
        className="relative flex-1 bg-[#FAF7EE] rounded-2xl border-2 border-[#1A1A1A] shadow-[3px_3px_0px_#1A1A1A] p-3 sm:p-3.5 text-left cursor-pointer hover:bg-white transition-colors"
      >
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-[11px] font-black uppercase tracking-wider text-[#1A1A1A] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>
              {isPrimaria
                ? `Guía Explorador · ${currentSubject.shortName}`
                : `Tutor Académico · ${currentSubject.shortName}`}
            </span>
          </span>
          <span className="text-[10px] font-bold text-[#1A1A1A]/60 flex items-center gap-1 shrink-0">
            <MessageCircleHeart className="w-3 h-3" />
            <span>Toca para otro tip</span>
          </span>
        </div>
        <p className="text-xs sm:text-sm font-bold text-[#1A1A1A] leading-snug">
          "{activeMessage}"
        </p>
      </div>
    </div>
  );
};
