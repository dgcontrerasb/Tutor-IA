/**
 * Tipos de datos para Tutor-IA
 * Corrector y analizador escolar con estilo Neubrutalismo
 */

export type GradeLevel = 'primaria' | 'secundaria';

export type SchoolSubjectCategory =
  | 'exactas'
  | 'sociales_humanidades'
  | 'lenguas'
  | 'ciencias_vida'
  | 'expresion_tecnologia';

export type SchoolSubjectId =
  // Materias solicitadas por el usuario
  | 'matematicas'
  | 'biologia'
  | 'historia'
  | 'geografia'
  | 'geometria'
  | 'estadistica'
  | 'sociales'
  | 'lengua'
  | 'quimica'
  | 'fisica'
  | 'democracia'
  | 'religion'
  // Materias escolares complementarias indispensables
  | 'ingles'
  | 'ciencias_naturales'
  | 'filosofia'
  | 'artes'
  | 'tecnologia'
  | 'educacion_fisica';

export interface SchoolSubject {
  id: SchoolSubjectId;
  name: string;
  shortName: string;
  icon: string;
  color: string;
  category: SchoolSubjectCategory;
  description: string;
  defaultTasks: TaskType[];
  placeholderText: string;
}

export type TaskType =
  | 'correction'      // Corrección ortográfica y gramatical
  | 'summary'         // Resumen del texto o puntos clave
  | 'analysis'        // Análisis y comprensión
  | 'step_by_step'    // Explicación paso a paso de ejercicios
  | 'explanation'     // Explicación didáctica fácil del tema
  | 'quiz_guide';     // Guía de taller y preguntas reflexivas

export interface SelectedTasks {
  correction?: boolean;
  summary?: boolean;
  analysis?: boolean;
  step_by_step?: boolean;
  explanation?: boolean;
  quiz_guide?: boolean;
}

export interface MistakeDetail {
  original: string;
  correction: string;
  type: 'ortografia' | 'tilde' | 'puntuacion' | 'gramatica';
  explanation: string;
}

export interface CorrectionResult {
  correctedText: string;
  scoreText: string; // ej. "¡Muy buen trabajo!", "9/10 - Casi perfecto"
  mistakesCount: number;
  explanations: MistakeDetail[];
  teacherTip: string;
}

export interface SummaryResult {
  mainIdea: string; // 1-2 frases
  keyPoints: string[]; // 3-5 puntos clave
  summaryLengthNote?: string;
}

export interface AnalysisResult {
  mainTopic: string;
  textType: string; // "Texto Narrativo (Cuento / Fábula)", "Texto Expositivo (Ciencias)", etc.
  reflectiveQuestion: string; // 1 pregunta reflexiva para el estudiante
  reflectiveHint: string; // Guía pedagógica para reflexionar
  moralOrPurpose?: string; // Propósito del autor o moraleja
}

export type ResponseDepth = 'concise' | 'detailed';

export interface StepItem {
  stepNumber: number;
  title: string;
  explanation: string;
  mathOrFormula?: string;
}

export interface StepByStepResult {
  topic: string;
  problemStatement?: string;
  finalAnswer: string;
  steps: StepItem[];
  formulaUsed?: string;
  teacherTip: string;
  verificationCheck?: string;
  alternativeMethod?: string;
  detailedNotes?: string;
}

export interface GlossaryTerm {
  term: string;
  definition: string;
}

export interface TopicExplanationResult {
  topic: string;
  simpleDefinition: string;
  howItWorksOrWhy: string;
  detailedExplanation?: string; // Explicación profunda y desarrollada en varios párrafos
  causeAndEffect?: string; // Ficha de Causa y Efecto para bachillerato
  realWorldExample: string;
  realWorldExamples?: string[]; // Múltiples aplicaciones prácticas en la vida real
  contextAndOrigins?: string; // Contexto histórico, científico o por qué se originó el concepto
  glossary?: GlossaryTerm[]; // Glosario de términos clave explicados
  examTipOrTrap?: string; // Ficha de Enfoque de Examen y trampas típicas
  keyConcepts: string[];
  teacherTip: string;
}

export interface QuizGuideItem {
  questionOrConcept: string;
  guideHint: string;
  sampleAnswerOrThought: string;
}

export interface QuizGuideResult {
  topic: string;
  questions: QuizGuideItem[];
  studyTip: string;
}

export interface HomeworkReviewResult {
  isSchoolRelated?: boolean;
  rejectionReason?: string;
  ocrTranscribedText?: string;
  subjectId?: SchoolSubjectId;
  responseDepth?: ResponseDepth;
  correction?: CorrectionResult;
  summary?: SummaryResult;
  analysis?: AnalysisResult;
  stepByStep?: StepByStepResult;
  topicExplanation?: TopicExplanationResult;
  quizGuide?: QuizGuideResult;
  processingTimeMs?: number;
  timestamp: string;
  provider?: 'wikipedia' | 'groq' | 'pollinations' | 'local';
  sourceNote?: string; // Nota interna opcional
}

export interface UserUsage {
  usagesUsed: number;
  maxUsages: number;
  remainingUsages: number;
  isSubscriptionActive?: boolean;
  subscriptionDaysRemaining?: number;
  subscriptionExpiresAt?: string | null;
  isDailyLimit?: boolean;
}

