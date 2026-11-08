/**
 * Home Page Oficial de Tutor-IA (Variante 2B: Canvas Académico Interactivo)
 * - Mismo logotipo oficial (/logo_full.jpg) y misma tipografía que el cuaderno escolar.
 * - Enfoque de tutoría escolar guiada y paciente (Primaria y Secundaria).
 * - Explicación detallada de cómo actúa el tutor en cada materia escolar.
 * - Botón oficial de Google para iniciar sesión.
 * - Medios de pago: Nequi, Daviplata o Bre-B ($10.000 COP al mes).
 */

import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Check,
  Lightbulb,
  GraduationCap,
} from 'lucide-react';

interface HomePageProps {
  onLoginWithGoogle: () => void;
  onEnterWorkspace?: () => void;
  isLoggedIn?: boolean;
  userName?: string;
  isTrialActive?: boolean;
  trialHoursRemaining?: number;
  isSubscriptionActive?: boolean;
  isAdmin?: boolean;
}

interface SubjectPedagogyProfile {
  role: string;
  focus: string;
  howItActs: string[];
  deliverables: string[];
  teacherTip: string;
}

export const HomePage: React.FC<HomePageProps> = ({
  onLoginWithGoogle,
  onEnterWorkspace,
  isLoggedIn = false,
  userName = '',
  isTrialActive = false,
  trialHoursRemaining = 24,
  isSubscriptionActive = false,
  isAdmin = false,
}) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('lengua');

  // Asignaturas destacadas para la cuadrícula interactiva
  const highlightedSubjects = [
    { id: 'lengua', name: 'Español o Literatura', icon: '📝' },
    { id: 'matematicas', name: 'Matemáticas', icon: '➗' },
    { id: 'ciencias_naturales', name: 'Ciencias Naturales', icon: '🌱' },
    { id: 'fisica', name: 'Física', icon: '⚡' },
    { id: 'quimica', name: 'Química', icon: '🧪' },
    { id: 'historia', name: 'Historia', icon: '🏛️' },
    { id: 'geografia', name: 'Geografía', icon: '🗺️' },
    { id: 'ingles', name: 'Inglés', icon: '🇬🇧' },
    { id: 'filosofia', name: 'Filosofía', icon: '💡' },
  ];

  // Explicación detallada de cómo actúa el tutor escolar en cada materia
  const subjectProfiles: Record<string, SubjectPedagogyProfile> = {
    lengua: {
      role: 'Profesor de Lengua Castellana y Literatura',
      focus: 'Corrección ortográfica, comprensión lectora y redacción escolar',
      howItActs: [
        'Revisa tu redacción palabra por palabra corrigiendo ortografía, tildes y signos de puntuación.',
        'Extrae las 3 ideas principales de cuentos, novelas, fábulas y lecturas escolares.',
        'Te enseña figuras literarias (metáforas, hipérboles, símiles) con ejemplos de la vida real.',
        'Te sugiere mejoras de estilo y vocabulario adaptadas a tu curso (Primaria o Secundaria).',
      ],
      deliverables: [
        'Texto corregido con nota formativa',
        'Resumen con 3 puntos clave',
        'Análisis de comprensión lectora',
      ],
      teacherTip: 'Lee tu redacción en voz alta: las pausas naturales te indican con precisión dónde colocar comas y puntos.',
    },
    matematicas: {
      role: 'Profesor de Matemáticas y Álgebra Escolar',
      focus: 'Resolución de problemas con procedimiento paso a paso y verificación',
      howItActs: [
        'Resuelve ejercicios numéricos desglosando el procedimiento paso a paso sin omitir cálculos.',
        'Te explica qué fórmula se utiliza, qué significa cada variable y por qué se aplica.',
        'Realiza la comprobación matemática para que verifiques que tu resultado es 100% correcto.',
        'Te enseña trucos mnemotécnicos para no confundirte con los signos ni las operaciones.',
      ],
      deliverables: [
        'Procedimiento paso a paso',
        'Fórmula general explicada',
        'Comprobación matemática',
        'Consejo para el examen',
      ],
      teacherTip: 'Anota primero todos los datos conocidos y lo que te piden hallar antes de empezar a operar.',
    },
    ciencias_naturales: {
      role: 'Maestro de Ciencias Naturales y Biología',
      focus: 'Explicación de seres vivos, ecosistemas y funcionamiento del cuerpo',
      howItActs: [
        'Explica el cuerpo humano, los animales, las plantas, la célula y los ecosistemas con sencillez.',
        'Relaciona los fenómenos naturales con situaciones cotidianas y observables del entorno.',
        'Desglosa el principio de causa y efecto de cada proceso biológico (ej. fotosíntesis o digestión).',
        'Incluye un glosario con los términos escolares clave explicados sin tecnicismos difíciles.',
      ],
      deliverables: [
        'Explicación didáctica ilustrada',
        'Ejemplos prácticos del entorno',
        'Glosario de términos escolares',
        'Preguntas para repasar',
      ],
      teacherTip: 'Dibuja un diagrama o esquema de lo que estás aprendiendo: la ciencia entra mejor por la vista.',
    },
    fisica: {
      role: 'Profesor de Física Escolar',
      focus: 'Leyes del movimiento, energía y despeje paso a paso de fórmulas',
      howItActs: [
        'Despeja variables paso a paso verificando la conversión de unidades (m/s, km/h, Newtons, Joules).',
        'Explica leyes de Newton, cinemática, energía y gravedad con analogías del día a día.',
        'Te advierte sobre trampas típicas que los profesores suelen poner en las evaluaciones.',
        'Comprueba los cálculos para que entregues tu taller o examen con total seguridad.',
      ],
      deliverables: [
        'Despeje guiado de variables',
        'Conversión de unidades paso a paso',
        'Analogías de la vida real',
        'Trampas conceptuales de examen',
      ],
      teacherTip: 'Verifica siempre que todas tus variables pertenezcan al mismo sistema de unidades antes de operar.',
    },
    quimica: {
      role: 'Profesor de Química Escolar',
      focus: 'Tabla periódica, estructura atómica y balanceo de ecuaciones',
      howItActs: [
        'Te guía paso a paso en el balanceo de ecuaciones químicas (por tanteo o método redox).',
        'Explica la tabla periódica, átomos, enlaces y estados de la materia de forma visual.',
        'Utiliza analogías cotidianas para entender reacciones químicas, disoluciones y escala de pH.',
        'Define con total claridad soluto, solvente, masa molar y valencias.',
      ],
      deliverables: [
        'Balanceo paso a paso',
        'Explicación atómica visual',
        'Glosario de elementos y valencias',
        'Resumen de estudio para clase',
      ],
      teacherTip: 'Recuerda la ley de conservación: la misma cantidad de átomos que entra debe salir de la reacción.',
    },
    historia: {
      role: 'Profesor de Historia y Ciencias Sociales',
      focus: 'Causas, consecuencias, líneas de tiempo y comprensión de épocas',
      howItActs: [
        'Narra los acontecimientos históricos ordenados cronológicamente con sus causas y consecuencias.',
        'Te explica quiénes fueron los personajes clave y por qué tomaron esas decisiones.',
        'Organiza resúmenes y líneas de tiempo para que estudies sin memorizar fechas mecánicamente.',
        'Plantea preguntas reflexivas para entender cómo ese hecho histórico influye en nuestro presente.',
      ],
      deliverables: [
        'Causas y consecuencias claras',
        'Resumen cronológico ordenado',
        'Perfil de personajes históricos',
        'Pregunta para pensar y debatir',
      ],
      teacherTip: 'Comprende los motivos y problemas que vivía la gente de esa época: la historia es una historia de personas.',
    },
    geografia: {
      role: 'Profesor de Geografía y Entorno Natural',
      focus: 'Relieve, mapas, climas, husos horarios y regiones naturales',
      howItActs: [
        'Explica mapas, relieve, cordilleras, hidrografía, coordenadas y husos horarios.',
        'Describe las regiones naturales, climas, biomas y recursos económicos de cada territorio.',
        'Analiza la relación entre el ser humano, el espacio geográfico y el cuidado ambiental.',
        'Sintetiza capitales, fronteras y datos geográficos clave en fichas listas para tus exámenes.',
      ],
      deliverables: [
        'Ubicación y relieve explicado',
        'Características del clima y biomas',
        'Fichas de regiones naturales',
        'Puntos clave para examen',
      ],
      teacherTip: 'Ubica siempre la orientación Norte-Sur en tu mapa antes de responder cualquier taller geográfico.',
    },
    ingles: {
      role: 'English Teacher (Profesor de Lengua Extranjera)',
      focus: 'Grammar, vocabulario, redacción de oraciones y traducción contextual',
      howItActs: [
        'Explica estructuras gramaticales (verb to be, tiempos verbales, modales, voz pasiva).',
        'Corrige tus oraciones y redacciones en inglés explicando por qué se usa cada término.',
        'Te enseña vocabulario temático, modismos comunes y cómo pronunciar adecuadamente.',
        'Brinda traducciones pedagógicas con contexto para que no dependas de traductores automáticos.',
      ],
      deliverables: [
        'Corrección de oraciones y párrafos',
        'Regla gramatical explicada con ejemplos',
        'Vocabulario temático en contexto',
        'Ejemplos prácticos de conversación',
      ],
      teacherTip: 'Formula oraciones cortas siguiendo la regla básica: Sujeto + Verbo + Complemento.',
    },
    filosofia: {
      role: 'Profesor de Filosofía y Pensamiento Crítico',
      focus: 'Corrientes filosóficas, dilemas éticos y argumentación lógica',
      howItActs: [
        'Explica las corrientes de pensamiento (Sócrates, Platón, Racionalismo, Ética, Existencialismo).',
        'Traduce ideas y dilemas filosóficos complejos a un lenguaje cercano y fácil de debatir.',
        'Te ayuda a estructurar argumentos sólidos y fundamentados para ensayos escolares.',
        'Plantea preguntas abiertas que despiertan tu propio criterio y capacidad de análisis.',
      ],
      deliverables: [
        'Idea central del filósofo',
        'Contexto de la corriente histórica',
        'Pregunta reflexiva para pensar',
        'Pistas para fundamentar debates',
      ],
      teacherTip: 'En filosofía tu opinión cuenta mucho: lo fundamental es que esté respaldada con un porqué lógico.',
    },
  };

  const currentProfile = subjectProfiles[selectedSubjectId] || subjectProfiles.lengua;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-indigo-100 flex flex-col justify-between">
      
      {/* 1. Barra de Navegación Oficial con el Logotipo Exacto */}
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-17 flex items-center justify-between gap-4">
          
          {/* Logotipo Oficial idéntico al cuaderno escolar */}
          <div className="flex items-center shrink-0">
            <a href="/" className="flex items-center cursor-pointer transition-transform hover:opacity-90 active:scale-98">
              <img
                src="/logo_full.jpg"
                alt="Tutor-IA"
                className="h-11 sm:h-12 w-auto object-contain"
              />
            </a>
          </div>

          {/* Lado Derecho: Estado o Botón de Google */}
          <div className="flex items-center gap-3">
            <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              <span>18 Asignaturas Escolares</span>
            </span>

            {isLoggedIn ? (
              <button
                onClick={onEnterWorkspace}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-xs transition-all flex items-center gap-2 cursor-pointer active:scale-98"
              >
                <span>Ir a mi Cuaderno Escolar</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onLoginWithGoogle}
                className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 hover:border-slate-400 text-xs sm:text-sm font-bold rounded-2xl shadow-xs transition-all flex items-center gap-2 cursor-pointer active:scale-98"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.27 21.37 7.36 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.95 0 12s.45 3.83 1.25 5.42l4.03-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.27 2.63 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
                <span>Acceder con Google</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 2. Cuerpo Principal: Hero y Canvas Académico Interactivo */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Columna Izquierda: Mensaje Pedagógico y Acceso con Google */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left pt-2">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 text-indigo-900 border border-indigo-200/80 text-xs font-bold shadow-2xs">
              <span className="text-amber-500">✨</span>
              <span>Tu acompañante escolar en casa • Primaria y Secundaria</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.18]">
              Comprender las materias del colegio nunca había sido tan sencillo.
            </h1>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
              Tutor-IA acompaña a tu hijo en sus tareas diarias con explicaciones claras, sin estrés y a su propio ritmo. No hacemos la tarea por ti para salir del paso: <strong>te enseñamos a pensar, verificar fórmulas y comprender cada lección</strong>.
            </p>

            {/* Llamado a la Acción con Google */}
            <div className="pt-2">
              {isLoggedIn ? (
                <div className="space-y-3">
                  <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-2xl text-xs font-semibold text-indigo-900 inline-flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Sesión iniciada como <strong>{userName}</strong> ({isAdmin ? 'Administrador' : isSubscriptionActive ? 'Suscripción activa' : isTrialActive ? `Día de prueba: ${trialHoursRemaining}h restantes` : 'Prueba completada'})</span>
                  </div>
                  <div>
                    <button
                      onClick={onEnterWorkspace}
                      className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white text-base font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-3 cursor-pointer active:scale-98"
                    >
                      <span>Abrir mi Cuaderno Escolar</span>
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={onLoginWithGoogle}
                    className="w-full sm:w-auto px-7 py-4 bg-white hover:bg-slate-50 active:scale-98 text-slate-800 text-sm sm:text-base font-bold rounded-2xl border-2 border-slate-200 hover:border-slate-300 shadow-md shadow-slate-100 transition-all flex items-center justify-center gap-3.5 cursor-pointer mx-auto lg:mx-0"
                  >
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.27 21.37 7.36 24 12 24z"/>
                      <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.95 0 12s.45 3.83 1.25 5.42l4.03-3.15z"/>
                      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.27 2.63 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                    </svg>
                    <span>Iniciar con Google • 24 Horas Gratis</span>
                  </button>

                  <p className="text-xs text-slate-500 font-medium">
                    Sin tarjetas de crédito requeridas • Acceso inmediato a las 18 materias
                  </p>
                </div>
              )}
            </div>

            {/* Garantías Pedagógicas */}
            <div className="pt-2 border-t border-slate-200/80 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 text-xs text-slate-600 font-medium">
              <span className="flex items-center gap-1.5"><span className="text-emerald-600 font-bold">✓</span> 1 día completo de prueba gratis</span>
              <span className="flex items-center gap-1.5"><span className="text-emerald-600 font-bold">✓</span> Revisión de fotos de cuaderno</span>
              <span className="flex items-center gap-1.5"><span className="text-emerald-600 font-bold">✓</span> Solo $10.000 COP al mes</span>
            </div>
          </div>

          {/* Columna Derecha: Canvas Académico Interactivo de Materias */}
          <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-5">
            
            {/* Cabecera del Canvas */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">Metodología por Materia</span>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">¿Cómo actúa tu tutor en cada asignatura?</h3>
              </div>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200/80">
                1 Día Full Gratis
              </span>
            </div>

            {/* Selector de Asignaturas */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              {highlightedSubjects.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubjectId(sub.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                    selectedSubjectId === sub.id
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs font-bold'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-base">{sub.icon}</span>
                  <span className="truncate">{sub.name}</span>
                </button>
              ))}
            </div>

            {/* Muestra Pedagógica: Cómo actúa el tutor en la materia seleccionada */}
            <div className="bg-slate-50/90 rounded-2xl border border-slate-200/90 p-4 sm:p-5 space-y-4">
              
              {/* Rol y Enfoque de la Materia */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-3 border-b border-slate-200/70">
                <div>
                  <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">
                    {currentProfile.role}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {currentProfile.focus}
                  </p>
                </div>
              </div>

              {/* Lista de Acciones Didácticas del Tutor */}
              <div className="space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-700">
                  ¿Cómo te acompaña en esta materia?:
                </p>
                <ul className="space-y-2 text-xs text-slate-700">
                  {currentProfile.howItActs.map((act, index) => (
                    <li key={index} className="flex items-start gap-2.5">
                      <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 text-[10px] font-bold mt-0.5">
                        ✓
                      </span>
                      <span className="leading-relaxed">{act}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Entregables que recibe el estudiante */}
              <div className="pt-2 border-t border-slate-200/70">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Lo que recibes en tu cuaderno de estudio:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {currentProfile.deliverables.map((item, index) => (
                    <span
                      key={index}
                      className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-700 shadow-2xs"
                    >
                      • {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* Consejo del Maestro */}
              <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <span className="font-bold">Consejo del profesor:</span> {currentProfile.teacherTip}
                </p>
              </div>
            </div>

            {/* Caja de Suscripción Transparente (Nequi, Daviplata, Bre-B) */}
            <div className="p-4 bg-indigo-50/40 rounded-2xl border border-indigo-100 text-xs text-slate-700 space-y-1.5">
              <div className="flex items-center justify-between font-bold text-slate-900 text-sm">
                <span>Pase Escolar Mensual</span>
                <span className="text-indigo-700 font-extrabold">$10.000 COP / mes</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Pagos 100% seguros mediante <strong>Nequi, Daviplata o Bre-B</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* 3. Tres Pilares de Confianza y Metodología */}
        <section className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-xl mb-4">
              👨‍🏫
            </div>
            <h4 className="text-sm font-bold text-slate-900 mb-1.5">Tono de Maestro Paciente</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              No usa tecnicismos incomprensibles. Adapta cada explicación para que niños de primaria y jóvenes de secundaria entiendan la lección con tranquilidad.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-xl mb-4">
              📷
            </div>
            <h4 className="text-sm font-bold text-slate-900 mb-1.5">Lectura de Cuaderno con OCR</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              ¿Tu hijo escribió la tarea a mano? Toma una foto a la hoja del cuaderno o sube un PDF de taller. El sistema transcribe su letra manuscrita y la analiza.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-xl mb-4">
              🛡️
            </div>
            <h4 className="text-sm font-bold text-slate-900 mb-1.5">Entorno 100% Escolar y Seguro</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Blindaje estricto de seguridad: Tutor-IA rechaza cualquier contenido inapropiado o ajeno a materias escolares, cuidando el entorno de aprendizaje.
            </p>
          </div>
        </section>
      </main>

      {/* 4. Pie de Página */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Tutor-IA • Acompañamiento pedagógico escolar para primaria y secundaria.</p>
          <div className="flex items-center gap-4">
            <span>Pagos vía Nequi, Daviplata o Bre-B</span>
            <span>•</span>
            <span>Solo $10.000 COP/mes</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
