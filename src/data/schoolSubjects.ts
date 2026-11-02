/**
 * Catálogo Maestro de Materias Escolares - Tutor-IA
 * Incluye todas las materias del usuario y las complementarias de primaria y secundaria.
 */

import { SchoolSubject, SchoolSubjectCategory, SchoolSubjectId, TaskType } from '../types';

export interface SubjectCategoryInfo {
  id: SchoolSubjectCategory;
  name: string;
  emoji: string;
  description: string;
}

export const SUBJECT_CATEGORIES: SubjectCategoryInfo[] = [
  {
    id: 'exactas',
    name: 'Ciencias Exactas & Números',
    emoji: '📐',
    description: 'Matemáticas, cálculo, problemas y razonamiento lógico',
  },
  {
    id: 'ciencias_vida',
    name: 'Ciencias de la Naturaleza',
    emoji: '🌿',
    description: 'El mundo vivo, la materia, el cuerpo humano y el universo',
  },
  {
    id: 'sociales_humanidades',
    name: 'Sociales & Humanidades',
    emoji: '🏛️',
    description: 'Historia, geografía, sociedad, ciudadanía y valores',
  },
  {
    id: 'lenguas',
    name: 'Lenguas & Comunicación',
    emoji: '📚',
    description: 'Lectura, escritura, ortografía e idiomas',
  },
  {
    id: 'expresion_tecnologia',
    name: 'Expresión & Tecnología',
    emoji: '🎨',
    description: 'Artes, informática, creatividad y salud física',
  },
];

export const SCHOOL_SUBJECTS: SchoolSubject[] = [
  // --- 1. LENGUAS & COMUNICACIÓN ---
  {
    id: 'lengua',
    name: 'Español o Literatura',
    shortName: 'Español',
    icon: '📝',
    color: '#FFE66D',
    category: 'lenguas',
    description: 'Ortografía, tildes, redacción, análisis de cuentos y literatura',
    defaultTasks: ['correction', 'summary', 'analysis'],
    placeholderText: 'Escribe tu cuento, redacción, dictado o pega el texto para revisar ortografía y comprensión...',
  },
  {
    id: 'ingles',
    name: 'Inglés (Lengua Extranjera)',
    shortName: 'Inglés',
    icon: '🗣️',
    color: '#A0E7E5',
    category: 'lenguas',
    description: 'Grammar, vocabulario escolar, traducción explicada y oraciones',
    defaultTasks: ['correction', 'explanation', 'summary'],
    placeholderText: 'Escribe tus oraciones en inglés, preguntas de grammar o sube una foto de tu worksheet...',
  },

  // --- 2. CIENCIAS EXACTAS & NÚMEROS ---
  {
    id: 'matematicas',
    name: 'Matemáticas',
    shortName: 'Matemáticas',
    icon: '➗',
    color: '#FF6B6B',
    category: 'exactas',
    description: 'Operaciones, fracciones, álgebra escolar, ecuaciones y problemas',
    defaultTasks: ['step_by_step', 'explanation', 'quiz_guide'],
    placeholderText: 'Escribe el problema matemático o sube una foto clara del ejercicio en tu cuaderno...',
  },
  {
    id: 'geometria',
    name: 'Geometría',
    shortName: 'Geometría',
    icon: '📐',
    color: '#B4F8C8',
    category: 'exactas',
    description: 'Ángulos, figuras, áreas, perímetros, volúmenes y teoremas',
    defaultTasks: ['step_by_step', 'explanation', 'quiz_guide'],
    placeholderText: 'Describe la figura, datos de lados/ángulos o sube una foto del dibujo geométrico...',
  },
  {
    id: 'estadistica',
    name: 'Estadística (Escolar)',
    shortName: 'Estadística',
    icon: '📊',
    color: '#A8E6CF',
    category: 'exactas',
    description: 'Media, mediana, moda, tablas de frecuencias y gráficos',
    defaultTasks: ['step_by_step', 'explanation', 'quiz_guide'],
    placeholderText: 'Ingresa los datos del ejercicio estadístico o sube la tabla de frecuencias de tu tarea...',
  },
  {
    id: 'fisica',
    name: 'Física',
    shortName: 'Física',
    icon: '⚡',
    color: '#FBE7C6',
    category: 'exactas',
    description: 'Movimiento, velocidad, aceleración, fuerzas, energía y leyes de Newton',
    defaultTasks: ['step_by_step', 'explanation', 'quiz_guide'],
    placeholderText: 'Escribe el enunciado de física (ej: MRU, fuerzas, caída libre) o sube foto del taller...',
  },
  {
    id: 'quimica',
    name: 'Química',
    shortName: 'Química',
    icon: '🧪',
    color: '#FFAAA5',
    category: 'exactas',
    description: 'Tabla periódica, átomos, enlaces, fórmulas, balanceo y mezclas',
    defaultTasks: ['explanation', 'step_by_step', 'summary'],
    placeholderText: 'Escribe la fórmula química, balanceo o pregunta sobre elementos y compuestos...',
  },

  // --- 3. CIENCIAS DE LA NATURALEZA ---
  {
    id: 'biologia',
    name: 'Biología',
    shortName: 'Biología',
    icon: '🧬',
    color: '#A8E6CF',
    category: 'ciencias_vida',
    description: 'Células, genética, reinos de la naturaleza, evolución y ecología',
    defaultTasks: ['explanation', 'summary', 'quiz_guide'],
    placeholderText: 'Pregunta sobre la célula, los seres vivos, ecosistemas o sube el cuestionario de clase...',
  },
  {
    id: 'ciencias_naturales',
    name: 'Ciencias Naturales',
    shortName: 'Ciencias Nat.',
    icon: '🌱',
    color: '#C7CEEA',
    category: 'ciencias_vida',
    description: 'El cuerpo humano, los sentidos, los animales, plantas y el planeta Tierra',
    defaultTasks: ['explanation', 'summary', 'quiz_guide'],
    placeholderText: 'Escribe el tema de ciencias naturales o sube la hoja de tu cuaderno de primaria...',
  },

  // --- 4. SOCIALES & HUMANIDADES ---
  {
    id: 'historia',
    name: 'Historia',
    shortName: 'Historia',
    icon: '📜',
    color: '#FFD3B6',
    category: 'sociales_humanidades',
    description: 'Épocas históricas, personajes, revoluciones, civilizaciones e independencia',
    defaultTasks: ['explanation', 'summary', 'quiz_guide'],
    placeholderText: 'Escribe la época, personaje o evento histórico que necesitas entender o resumir...',
  },
  {
    id: 'geografia',
    name: 'Geografía',
    shortName: 'Geografía',
    icon: '🌍',
    color: '#A0E7E5',
    category: 'sociales_humanidades',
    description: 'Relieve, mapas, continentes, climas, capitales y recursos naturales',
    defaultTasks: ['explanation', 'summary', 'quiz_guide'],
    placeholderText: 'Escribe sobre el país, región, mapa, clima o preguntas del taller de geografía...',
  },
  {
    id: 'sociales',
    name: 'Ciencias Sociales',
    shortName: 'Sociales',
    icon: '🏛️',
    color: '#FFE66D',
    category: 'sociales_humanidades',
    description: 'Comunidades, derechos, diversidad cultural, economía básica y sociedad',
    defaultTasks: ['explanation', 'summary', 'quiz_guide'],
    placeholderText: 'Escribe las preguntas de ciencias sociales o pega el texto del taller escolar...',
  },
  {
    id: 'democracia',
    name: 'Democracia & Cívica',
    shortName: 'Democracia',
    icon: '⚖️',
    color: '#D5AAFF',
    category: 'sociales_humanidades',
    description: 'Constitución, ramas del poder, participación ciudadana, paz y deberes',
    defaultTasks: ['explanation', 'summary', 'quiz_guide'],
    placeholderText: 'Pregunta sobre derechos fundamentales, la constitución o temas de gobierno escolar...',
  },
  {
    id: 'filosofia',
    name: 'Filosofía',
    shortName: 'Filosofía',
    icon: '💭',
    color: '#E0BBE4',
    category: 'sociales_humanidades',
    description: 'Pensamiento crítico, filósofos clásicos, ética, lógica y debates escolares',
    defaultTasks: ['explanation', 'analysis', 'quiz_guide'],
    placeholderText: 'Escribe la corriente filosófica, dilema moral o fragmento de texto a reflexionar...',
  },
  {
    id: 'religion',
    name: 'Religión & Valores',
    shortName: 'Religión/Ética',
    icon: '🕊️',
    color: '#FFF1C5',
    category: 'sociales_humanidades',
    description: 'Valores humanos, respeto, convivencia, tradiciones y dilemas éticos',
    defaultTasks: ['explanation', 'analysis', 'quiz_guide'],
    placeholderText: 'Escribe sobre el valor, parábola, reflexión o actividad del libro de religión/ética...',
  },

  // --- 5. EXPRESIÓN & TECNOLOGÍA ---
  {
    id: 'tecnologia',
    name: 'Tecnología e Informática',
    shortName: 'Informática',
    icon: '💻',
    color: '#B5EAD7',
    category: 'expresion_tecnologia',
    description: 'Hardware, software básico, internet seguro, algoritmos y herramientas digitales',
    defaultTasks: ['explanation', 'step_by_step', 'summary'],
    placeholderText: 'Escribe la duda sobre partes de la computadora, internet o ejercicios de tecnología...',
  },
  {
    id: 'artes',
    name: 'Educación Artística',
    shortName: 'Artes',
    icon: '🎨',
    color: '#FFDAC1',
    category: 'expresion_tecnologia',
    description: 'Teoría del color, técnicas de dibujo, escultura, música e historia del arte escolar',
    defaultTasks: ['explanation', 'summary', 'quiz_guide'],
    placeholderText: 'Escribe sobre la técnica artística, colores primarios/secundarios o movimientos de arte...',
  },
  {
    id: 'educacion_fisica',
    name: 'Educación Física y Salud',
    shortName: 'Ed. Física',
    icon: '⚽',
    color: '#C7CEEA',
    category: 'expresion_tecnologia',
    description: 'Cuidado del cuerpo, reglas de deportes escolares, calentamiento y hábitos saludables',
    defaultTasks: ['explanation', 'summary', 'quiz_guide'],
    placeholderText: 'Escribe sobre el deporte, medidas de canchas, calentamiento o nutrición escolar...',
  },
];

export const DEFAULT_SUBJECT_ID: SchoolSubjectId = 'lengua';

export function getSubjectById(id: SchoolSubjectId): SchoolSubject {
  const found = SCHOOL_SUBJECTS.find((s) => s.id === id);
  return found || SCHOOL_SUBJECTS[0];
}

/**
 * Tareas disponibles por materia y sus metadatos pedagógicos
 */
export interface TaskOptionInfo {
  id: TaskType;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
}

export const ALL_TASK_OPTIONS: Record<TaskType, TaskOptionInfo> = {
  correction: {
    id: 'correction',
    title: '📝 Corrección ortográfica',
    subtitle: 'Tildes, grafías dudosas, puntuación y reglas',
    icon: '📝',
    color: '#FFE66D',
  },
  summary: {
    id: 'summary',
    title: '📌 Resumen y puntos clave',
    subtitle: 'Idea principal y 3-5 puntos indispensables para estudiar',
    icon: '📌',
    color: '#A8E6CF',
  },
  analysis: {
    id: 'analysis',
    title: '🔍 Comprensión y análisis',
    subtitle: 'Tipo de texto, moraleja, mensaje del autor y preguntas reflexivas',
    icon: '🔍',
    color: '#A0E7E5',
  },
  step_by_step: {
    id: 'step_by_step',
    title: '🔢 Solución explicada paso a paso',
    subtitle: 'Desarrollo didáctico, fórmulas aplicadas y resultado final',
    icon: '🔢',
    color: '#FFB3BA',
  },
  explanation: {
    id: 'explanation',
    title: '💡 Explicación fácil del tema',
    subtitle: 'Explicado como un profesor amigable con ejemplos de la vida real',
    icon: '💡',
    color: '#B5EAD7',
  },
  quiz_guide: {
    id: 'quiz_guide',
    title: '🤔 Guía de taller y preguntas',
    subtitle: 'Pistas pedagógicas para responder talleres y cuestionarios escolares',
    icon: '🤔',
    color: '#D5AAFF',
  },
};

/**
 * Obtiene las tareas sugeridas para una materia específica
 */
export function getAvailableTasksForSubject(subjectId: SchoolSubjectId): TaskType[] {
  const subject = getSubjectById(subjectId);
  switch (subject.category) {
    case 'exactas':
      return ['step_by_step', 'explanation', 'summary', 'quiz_guide'];
    case 'lenguas':
      return ['correction', 'summary', 'analysis', 'explanation'];
    case 'ciencias_vida':
    case 'sociales_humanidades':
    case 'expresion_tecnologia':
    default:
      return ['explanation', 'summary', 'quiz_guide', 'analysis'];
  }
}

/**
 * Determina si una materia admite la subida de foto/PDF por tener contenido gráfico, visual o numérico.
 * Las materias teóricas (lengua, historia, etc.) se enfocan en texto para mayor rapidez y cero consumo de OCR.
 */
export function isSubjectVisualOrFormula(subjectId: SchoolSubjectId): boolean {
  const visualSubjects: SchoolSubjectId[] = [
    'matematicas',
    'geometria',
    'estadistica',
    'fisica',
    'quimica',
    'biologia',
    'ciencias_naturales',
    'artes',
    'tecnologia',
  ];
  return visualSubjects.includes(subjectId);
}
