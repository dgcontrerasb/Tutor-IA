/**
 * Servicio Híbrido de Revisión Escolar (Servidor + Navegador sin Facturación)
 * 1. Intenta primero la ruta del servidor (/api/review) con la cascada Multi-IA (Groq Free -> Pollinations AI).
 * 2. Si la app está alojada en un hosting estático gratuito o el servidor no responde,
 *    conecta directamente desde el navegador con el motor Multi-IA Gratuito (Groq / Pollinations AI) + Respaldo Local.
 */

import { GradeLevel, HomeworkReviewResult, SchoolSubjectId, SelectedTasks, ResponseDepth } from '../types';
import { auth } from './firebase';

export interface ReviewHomeworkParams {
  text?: string;
  imageFile?: File | null;
  tasks: SelectedTasks;
  gradeLevel: GradeLevel;
  subject?: SchoolSubjectId;
  responseDepth?: ResponseDepth;
}

/**
 * Convierte un archivo de imagen a Base64 puro
 */
export async function convertFileToBase64(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const commaIndex = result.indexOf(',');
      if (commaIndex === -1) {
        reject(new Error('Formato de imagen inválido'));
        return;
      }
      resolve({
        base64: result.substring(commaIndex + 1),
        mimeType: file.type || 'image/jpeg',
      });
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Construye el prompt pedagógico estructurado para el modo directo en navegador
 */
function buildBrowserSystemPrompt(
  subjectId: SchoolSubjectId,
  gradeLevel: GradeLevel,
  responseDepth: ResponseDepth,
  tasks: SelectedTasks,
  hasImage: boolean
): string {
  const isDetailed = responseDepth === 'detailed';
  const levelLabel = gradeLevel === 'secundaria' ? 'Secundaria / Bachillerato (12 a 17 años)' : 'Primaria (6 a 11 años)';

  return `Eres el Tutor Pedagógico Escolar de "Tutor-IA", especialista en la asignatura [${subjectId.toUpperCase()}] para nivel ${levelLabel}.
Modo de respuesta: ${isDetailed ? 'DETALLADO Y EXTENSO (explicación profunda de varios párrafos, múltiples ejemplos reales, contexto histórico y glosario)' : 'RESUMIDO Y RÁPIDO (definición directa en 2-3 líneas y síntesis puntual)'}.

REGLA DE GUARDRAIL ESCOLAR:
1. Evalúa si el texto o imagen pertenece al ámbito escolar o educativo.
2. Si NO es escolar (ej. apuestas, temas adultos, compras), devuelve {"isSchoolRelated": false, "rejectionReason": "Explicación amable indicando que Tutor-IA es exclusivo para tareas escolares."}.

Si ES escolar, devuelve "isSchoolRelated": true y genera en JSON únicamente los bloques activos:
${hasImage ? '- "ocrTranscribedText": "Transcripción fiel del texto o ejercicio visto en la imagen"' : ''}
${
  tasks.step_by_step
    ? `- "stepByStep": {
  "topic": "Título del tema o problema",
  "problemStatement": "Enunciado claro",
  "steps": [{"stepNumber": 1, "title": "Título del paso", "explanation": "Explicación clara", "mathOrFormula": "Operación o fórmula"}],
  "finalAnswer": "Resultado final",
  "formulaUsed": "Fórmula general utilizada",
  ${isDetailed ? '"verificationCheck": "Comprobación paso a paso del resultado",\n  "alternativeMethod": "Método alternativo para resolverlo",\n  "detailedNotes": "Notas analíticas adicionales",' : ''}
  "teacherTip": "Consejo práctico del profesor"
}`
    : ''
}
${
  tasks.explanation
    ? `- "topicExplanation": {
  "topic": "Nombre del tema",
  "simpleDefinition": "Definición clara y directa",
  ${
    isDetailed
      ? `"detailedExplanation": "Explicación exhaustiva de 3 a 4 párrafos bien redactados separados por saltos de línea (\\\\n\\\\n)",
  "realWorldExamples": ["Ejemplo cotidiano 1 explicado", "Ejemplo práctico 2 explicado", "Ejemplo 3 aplicado"],
  "contextAndOrigins": "Origen histórico, relevancia o por qué se estudia este tema",
  "glossary": [{"term": "Concepto 1", "definition": "Definición clara"}, {"term": "Concepto 2", "definition": "Definición clara"}, {"term": "Concepto 3", "definition": "Definición clara"}],`
      : ''
  }
  "causeAndEffect": "Relación de causa y efecto",
  "howItWorksOrWhy": "Cómo funciona o por qué ocurre",
  "realWorldExample": "Ejemplo principal en la vida real",
  "examTipOrTrap": "Error común en exámenes y cómo evitarlo",
  "keyConcepts": ["Concepto 1", "Concepto 2", "Concepto 3", "Concepto 4"],
  "teacherTip": "Regla de oro para recordar"
}`
    : ''
}
${
  tasks.quiz_guide
    ? `- "quizGuide": {
  "topic": "Tema del taller",
  "questions": [{"questionOrConcept": "Pregunta", "guideHint": "Pista", "sampleAnswerOrThought": "Respuesta modelo"}],
  "studyTip": "Técnica de estudio"
}`
    : ''
}
${
  tasks.correction
    ? `- "correction": {
  "correctedText": "Texto corregido completo",
  "scoreText": "Felicitación o evaluación formativa",
  "mistakesCount": 0,
  "explanations": [{"original": "error", "correction": "corrección", "type": "ortografia", "explanation": "Regla explicada"}],
  "teacherTip": "Consejo para mejorar la redacción"
}`
    : ''
}
${
  tasks.summary
    ? `- "summary": {
  "mainIdea": "Idea principal",
  "keyPoints": ["Punto clave 1", "Punto clave 2", "Punto clave 3"],
  "summaryLengthNote": "Nota de estudio"
}`
    : ''
}
${
  tasks.analysis
    ? `- "analysis": {
  "mainTopic": "Tema central",
  "textType": "Tipo de texto",
  "reflectiveQuestion": "Pregunta reflexiva",
  "reflectiveHint": "Pista",
  "moralOrPurpose": "Propósito o enseñanza"
}`
    : ''
}

Responde SIEMPRE en español. Tu respuesta debe ser un objeto JSON válido con la estructura solicitada sin bloques markdown ni texto adicional.`;
}

interface OpenAICompatibleCallOptions {
  endpoint: string;
  apiKey?: string;
  model: string;
  systemInstruction: string;
  userContent: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
  timeoutMs?: number;
}

/**
 * Conexión homogénea universal compatible con el estándar OpenAI (/v1/chat/completions) en navegador
 * Unifica las llamadas a Groq y Pollinations sin duplicar código ni requerir librerías externas.
 */
async function callOpenAICompatibleProvider({
  endpoint,
  apiKey,
  model,
  systemInstruction,
  userContent,
  timeoutMs = 12000,
}: OpenAICompatibleCallOptions): Promise<string | null> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (apiKey) {
      const cleanToken = apiKey.trim().replace(/^["'`]|["'`]$/g, '').replace(/^bearer\s+/i, '').trim();
      headers['Authorization'] = `Bearer ${cleanToken}`;
    }

    const res = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model,
        temperature: 0.2,
        max_tokens: 1500,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemInstruction },
          { role: 'user', content: userContent },
        ],
      }),
      signal: AbortSignal.timeout(timeoutMs),
    });

    if (res.ok) {
      const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
      const content = data.choices?.[0]?.message?.content;
      if (content && typeof content === 'string') {
        return content;
      }
    } else {
      console.warn(`[Modo Híbrido] Proveedor ${endpoint} (${model}) respondió status: ${res.status}`);
    }
  } catch (err) {
    console.warn(`[Modo Híbrido] Proveedor ${endpoint} (${model}) no disponible:`, err);
  }
  return null;
}

const THEORETICAL_SUBJECTS: SchoolSubjectId[] = [
  'filosofia',
  'historia',
  'biologia',
  'geografia',
  'lengua',
  'sociales',
  'ciencias_naturales',
  'democracia',
  'religion',
];

const CALCULATION_SUBJECTS: SchoolSubjectId[] = [
  'matematicas',
  'geometria',
  'estadistica',
  'fisica',
  'quimica',
];

/**
 * Extrae el término, personaje o concepto clave de una pregunta en lenguaje natural,
 * eliminando signos de interrogación, fórmulas de apertura, artículos y coletillas.
 * Ejemplo: "¿Quién fue Simón Bolívar y su biografía?" -> "Simón Bolívar"
 */
export function extractKeyTopic(rawQuery: string): string {
  if (!rawQuery) return '';

  let cleaned = rawQuery
    .replace(/[¿?¡!.,;:"'()[\]{}]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // 1. Remover fórmulas de pregunta y verbos introductorios al inicio
  const prefixRegex =
    /^(?:por favor\s+|dime\s+|cu[eé]ntame\s+|expl[ií]came\s+|explica\s+|h[aá]blame\s+(?:de|sobre)\s+|qu[eé]\s+(?:es|son|fue|fueron|significa|significan)\s+|qui[eé]n(?:es)?\s+(?:es|son|fue|fueron)\s+|cu[aá]l(?:es)?\s+(?:es|son|fue|fueron)\s+|c[oó]mo\s+(?:es|funciona|se\s+define)\s+|(?:el|la|los|las|un|una)\s+(?:biograf[ií]a|historia|resumen|concepto|definici[oó]n|significado|origen|importancia|caracter[ií]sticas|partes|funci[oó]n)\s+(?:de|del|sobre)\s+|(?:biograf[ií]a|historia|resumen|concepto|definici[oó]n|significado|caracter[ií]sticas|partes)\s+(?:de|del|sobre)\s+|todo\s+(?:sobre|acerca\s+de)\s+)+/i;

  cleaned = cleaned.replace(prefixRegex, '').trim();

  // 2. Remover coletillas compuestas finales ("y cuál es su biografía", "y su biografía", "y sus características", etc.)
  const suffixRegex =
    /\s+(?:y\s+(?:(?:cu[aá]l(?:es)?\s+(?:es|son|fue|fueron)\s+|qu[eé]\s+(?:es|son|fue|fueron|hizo)\s+)?(?:su|sus|la|el|los|las)\s+)?(?:biograf[ií]a|historia|resumen|caracter[ií]sticas|importancia|obras|aportes|partes|funci[oó]n|definici[oó]n|ejemplo|ejemplos|vida|pensamiento|filosof[ií]a).*|para\s+(?:ni[ñn]os|primaria|secundaria|bachillerato|estudiar).*|en\s+resumen.*|por\s+favor.*)$/i;

  cleaned = cleaned.replace(suffixRegex, '').trim();

  // 3. Remover preposiciones y artículos residuales al inicio
  cleaned = cleaned
    .replace(/^(?:de\s+la|de\s+los|de\s+las|del|de|sobre|acerca\s+de|el|la|los|las|un|una|unos|unas)\s+/i, '')
    .trim();

  if (!cleaned) return rawQuery.replace(/[¿?¡!]/g, '').trim();

  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

/**
 * Consulta la API REST de Wikipedia en español con el término limpio y estructura
 * la ficha escolar completa localmente (0 consumo de tokens de Groq).
 */
async function tryResolveTheoreticalWithWikipedia({
  cleanTopic,
  subject,
  gradeLevel,
  responseDepth,
  tasks,
  startTime,
}: {
  cleanTopic: string;
  subject: SchoolSubjectId;
  gradeLevel: GradeLevel;
  responseDepth: ResponseDepth;
  tasks: SelectedTasks;
  startTime: number;
}): Promise<HomeworkReviewResult | null> {
  if (!cleanTopic || cleanTopic.length < 2) return null;

  try {
    const wikiRes = await fetch(
      `https://es.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(cleanTopic)}`,
      { signal: AbortSignal.timeout(3500) }
    );

    if (!wikiRes.ok) return null;

    const wikiData = (await wikiRes.json()) as {
      title?: string;
      extract?: string;
      description?: string;
      type?: string;
    };

    if (!wikiData.extract || (wikiData.type && wikiData.type !== 'standard')) {
      return null;
    }

    const topicTitle = wikiData.title || cleanTopic;
    const extract = wikiData.extract.trim();
    const sentences = extract
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 15);

    const keyPointsList =
      sentences.length >= 2
        ? sentences.slice(0, responseDepth === 'detailed' ? 5 : 3)
        : [
            extract,
            `Importancia de ${topicTitle} dentro del estudio de ${subject}.`,
            'Síntesis verificada para repaso escolar y preparación de exámenes.',
          ];

    return {
      isSchoolRelated: true,
      subjectId: subject,
      responseDepth,
      topicExplanation:
        tasks.explanation || !tasks.summary
          ? {
              topic: topicTitle,
              simpleDefinition: extract,
              detailedExplanation:
                responseDepth === 'detailed'
                  ? `${extract}\n\n${
                      wikiData.description
                        ? `Contexto curricular: ${topicTitle} (${wikiData.description}) constituye un eje fundamental en la asignatura de ${subject}.`
                        : `Dentro de la materia de ${subject}, el análisis de "${topicTitle}" permite comprender sus antecedentes, características esenciales y repercusiones históricas o científicas.`
                    }\n\nPara dominar este tema en ${
                      gradeLevel === 'secundaria' ? 'Secundaria y Bachillerato' : 'Primaria'
                    }, se recomienda relacionar las ideas principales con sus causas y consecuencias prácticas.`
                  : undefined,
              causeAndEffect:
                sentences[1] ||
                `Comprender el origen y desarrollo de ${topicTitle} permite explicar su impacto en ${subject}.`,
              howItWorksOrWhy:
                sentences[0] ||
                `Se fundamenta en los principios esenciales documentados sobre ${topicTitle}.`,
              realWorldExample: `Aplicación y vigencia del estudio de ${topicTitle} en talleres escolares, cultura general y comprensión del entorno.`,
              realWorldExamples:
                responseDepth === 'detailed'
                  ? [
                      `Análisis de ${topicTitle} en textos académicos, líneas de tiempo o proyectos de aula.`,
                      `Identificación de sus conceptos principales en preguntas de evaluación escolar.`,
                    ]
                  : undefined,
              contextAndOrigins:
                responseDepth === 'detailed'
                  ? wikiData.description
                    ? `Clasificación enciclopédica: ${wikiData.description}.`
                    : `Tema clave del currículo escolar de ${subject}.`
                  : undefined,
              glossary:
                responseDepth === 'detailed'
                  ? [
                      {
                        term: topicTitle,
                        definition: wikiData.description || sentences[0] || 'Concepto central de estudio.',
                      },
                      {
                        term: 'Contexto académico',
                        definition: `Marco teórico de ${subject} donde se inscribe este tema.`,
                      },
                    ]
                  : undefined,
              examTipOrTrap: `En evaluaciones sobre ${topicTitle}, identifica siempre la definición central y sus características distintivas.`,
              keyConcepts: keyPointsList.slice(0, 4),
              teacherTip: `Resume con tus propias palabras quién fue o qué es "${topicTitle}" para fijar el conocimiento en tu memoria.`,
            }
          : undefined,
      summary: tasks.summary
        ? {
            mainIdea: sentences[0] || `Síntesis académica sobre ${topicTitle}.`,
            keyPoints: keyPointsList,
            summaryLengthNote: 'Resumen estructurado a partir de fuentes enciclopédicas verificadas.',
          }
        : undefined,
      analysis: tasks.analysis
        ? {
            mainTopic: topicTitle,
            textType: wikiData.description || `Consulta expositiva y conceptual de ${subject}`,
            reflectiveQuestion: `¿Cuál consideras que es el aporte o característica más importante de ${topicTitle}?`,
            reflectiveHint: 'Revisa la definición principal y piensa cómo se conecta con lo visto en clase.',
            moralOrPurpose: `Comprender a fondo la relevancia histórica, teórica o natural de ${topicTitle}.`,
          }
        : undefined,
      processingTimeMs: Date.now() - startTime,
      timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      provider: 'wikipedia',
    };
  } catch {
    return null;
  }
}

/**
 * Ejecuta la consulta directamente desde el navegador usando el enrutador protector de cuota:
 * 1. Si es materia teórica sin foto -> Wikipedia REST API con extractKeyTopic (0 tokens Groq).
 * 2. Groq Cloud reservado para fotos/visión, materias de cálculo (Matemáticas, Física, Química) o 404 en Wikipedia.
 * 3. Pollinations AI -> Respaldo local.
 */
async function reviewHomeworkInBrowser({
  text,
  imageData,
  tasks,
  gradeLevel,
  subject = 'lengua',
  responseDepth = 'detailed',
}: {
  text?: string;
  imageData: { base64: string; mimeType: string } | null;
  tasks: SelectedTasks;
  gradeLevel: GradeLevel;
  subject: SchoolSubjectId;
  responseDepth: ResponseDepth;
}): Promise<HomeworkReviewResult> {
  const startTime = Date.now();
  const hasImage = Boolean(imageData && imageData.base64);
  const cleanText = text?.trim() || '';

  // PASO 0: Blindaje de cuota para materias teóricas sin imagen adjunta
  const isTheoreticalSubject = THEORETICAL_SUBJECTS.includes(subject);
  const isCalculationSubject = CALCULATION_SUBJECTS.includes(subject) || Boolean(tasks.step_by_step);
  let wikiReturned404 = false;

  if (isTheoreticalSubject && !isCalculationSubject && !hasImage && cleanText.length > 0 && cleanText.length <= 260) {
    const cleanTopic = extractKeyTopic(cleanText);
    const wikiResult = await tryResolveTheoreticalWithWikipedia({
      cleanTopic,
      subject,
      gradeLevel,
      responseDepth,
      tasks,
      startTime,
    });
    if (wikiResult) {
      return wikiResult;
    }
    wikiReturned404 = true;
  }

  const systemInstruction = buildBrowserSystemPrompt(subject, gradeLevel, responseDepth, tasks, hasImage);
  const userTextPrompt = cleanText
    ? `Tarea o consulta del estudiante para la materia [${subject.toUpperCase()}]:\n"""\n${cleanText}\n"""\nDevuelve únicamente el objeto JSON válido solicitado.`
    : `Analiza esta foto de cuaderno/tarea escolar de la materia [${subject.toUpperCase()}] y devuelve únicamente el objeto JSON válido solicitado.`;

  const userContent = hasImage && imageData
    ? [
        { type: 'text', text: userTextPrompt },
        { type: 'image_url', image_url: { url: `data:${imageData.mimeType};base64,${imageData.base64}` } },
      ]
    : userTextPrompt;

  let responseText = '';
  let resolvedProvider: 'groq' | 'pollinations' = 'groq';

  // 1. NIVEL 1: Groq Cloud reservado exclusivamente para:
  // - Tareas con foto/PDF (visión)
  // - Materias de cálculo y paso a paso (Matemáticas, Física, Química)
  // - Consultas donde Wikipedia devolvió 404 (término no encontrado)
  const shouldUseGroq = hasImage || isCalculationSubject || wikiReturned404;

  const rawGroq = (
    (typeof window !== 'undefined' ? localStorage.getItem('cp_debug_groq_key') : null) ||
    (import.meta.env.VITE_GROQ_API_KEY as string | undefined)
  );
  const viteGroqKey = rawGroq ? rawGroq.trim().replace(/^["'`]|["'`]$/g, '').replace(/^bearer\s+/i, '').trim() : '';

  if (viteGroqKey && shouldUseGroq) {
    const groqModels = hasImage
      ? ['qwen/qwen3.8-27b']
      : ['openai/gpt-oss-120b', 'openai/gpt-oss-20b'];

    for (const groqModel of groqModels) {
      const content = await callOpenAICompatibleProvider({
        endpoint: 'https://api.groq.com/openai/v1/chat/completions',
        apiKey: viteGroqKey,
        model: groqModel,
        systemInstruction,
        userContent,
        timeoutMs: hasImage ? 14000 : 9000,
      });
      if (content) {
        responseText = content;
        resolvedProvider = 'groq';
        break;
      }
    }
  }

  // 2. NIVEL 2: Pollinations AI (100% Gratis, SIN API Key ni registro, CORS abierto)
  if (!responseText) {
    const pollContent = await callOpenAICompatibleProvider({
      endpoint: 'https://text.pollinations.ai/openai',
      model: 'openai',
      systemInstruction,
      userContent,
      timeoutMs: 14000,
    });
    if (pollContent) {
      responseText = pollContent;
      resolvedProvider = 'pollinations';
    }
  }

  if (responseText) {
    try {
      let cleanText = responseText.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
      const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanText = jsonMatch[0];
      }
      const parsedData = JSON.parse(cleanText);
      const duration = Date.now() - startTime;

      if (parsedData.isSchoolRelated === false) {
        return {
          isSchoolRelated: false,
          rejectionReason:
            parsedData.rejectionReason ||
            'Notamos que este contenido no corresponde a una tarea escolar de primaria o bachillerato.',
          processingTimeMs: duration,
          timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
          provider: resolvedProvider,
        };
      }

      return {
        isSchoolRelated: true,
        subjectId: subject,
        responseDepth,
        ocrTranscribedText: parsedData.ocrTranscribedText || undefined,
        correction: tasks.correction ? parsedData.correction : undefined,
        summary: tasks.summary ? parsedData.summary : undefined,
        analysis: tasks.analysis ? parsedData.analysis : undefined,
        stepByStep: tasks.step_by_step ? parsedData.stepByStep : undefined,
        topicExplanation: tasks.explanation ? parsedData.topicExplanation : undefined,
        quizGuide: tasks.quiz_guide ? parsedData.quizGuide : undefined,
        processingTimeMs: duration,
        timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        provider: resolvedProvider,
      };
    } catch (e) {
      console.warn('[Modo Híbrido] Error al parsear JSON en navegador:', e);
    }
  }

  // 4. NIVEL 4: Wikipedia REST API + Respaldo pedagógico local en navegador si las IAs no responden
  let wikiTitle = cleanText ? cleanText.slice(0, 75) : `Lección de ${subject}`;
  let wikiDefinition = '';
  if (cleanText && cleanText.length >= 3) {
    try {
      const queryWord = cleanText.replace(/[?¿!¡.,;:"'()[\]{}]/g, ' ').trim().split(/\s+/).slice(0, 3).join(' ');
      const wikiRes = await fetch(`https://es.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(queryWord)}`, {
        signal: AbortSignal.timeout(3000),
      });
      if (wikiRes.ok) {
        const wikiData = (await wikiRes.json()) as { title?: string; extract?: string; type?: string };
        if (wikiData.extract && wikiData.type !== 'disambiguation') {
          wikiDefinition = wikiData.extract;
          if (wikiData.title) wikiTitle = wikiData.title;
        }
      }
    } catch {
      // Si la conexión falla, se utiliza el glosario pedagógico local offline
    }
  }

  const topicTitle = wikiTitle;
  return {
    isSchoolRelated: true,
    subjectId: subject,
    responseDepth,
    ocrTranscribedText: hasImage ? 'Apunte de cuaderno escolar procesado para tu estudio.' : undefined,
    topicExplanation: tasks.explanation
      ? {
          topic: topicTitle,
          simpleDefinition:
            wikiDefinition ||
            `Concepto fundamental de ${subject} para ${gradeLevel === 'secundaria' ? 'Bachillerato' : 'Primaria'}: comprende los principios esenciales de "${topicTitle}" de forma ordenada.`,
          detailedExplanation:
            responseDepth === 'detailed'
              ? (wikiDefinition
                  ? `${wikiDefinition}\n\nEl estudio de "${topicTitle}" dentro de la materia de ${subject} permite comprender cómo se estructuran sus principios teóricos y prácticos en el entorno académico.\n\nFinalmente, dominar este tema fortalece el razonamiento y su aplicación en situaciones cotidianas.`
                  : `El estudio de "${topicTitle}" dentro de la materia de ${subject} permite comprender cómo se estructuran sus principios teóricos y prácticos.\n\nEn segundo lugar, analizar sus componentes paso a paso facilita identificar las relaciones entre las ideas principales y resolver problemas de examen con seguridad.\n\nFinalmente, dominar este tema fortalece el razonamiento académico y su aplicación en situaciones cotidianas.`)
              : undefined,
          causeAndEffect: 'Identificar los datos iniciales permite deducir la conclusión correcta del tema.',
          howItWorksOrWhy: 'Se analiza dividiendo el concepto en sus partes principales y comprobando cada relación.',
          realWorldExample: 'Se aplica al resolver actividades prácticas en el aula y proyectos escolares.',
          realWorldExamples:
            responseDepth === 'detailed'
              ? [
                  `Ejemplo 1: Aplicación directa de ${topicTitle} en actividades de laboratorio o cuaderno.`,
                  `Ejemplo 2: Uso del concepto en situaciones de la vida diaria para tomar decisiones razonadas.`,
                ]
              : undefined,
          contextAndOrigins:
            responseDepth === 'detailed'
              ? `Este tema forma parte de los estándares curriculares fundamentales de ${subject} para desarrollar pensamiento crítico.`
              : undefined,
          glossary:
            responseDepth === 'detailed'
              ? [
                  { term: 'Concepto base', definition: 'Idea central sobre la que se construye la explicación.' },
                  { term: 'Aplicación', definition: 'Uso práctico de la regla o teoría en un ejercicio real.' },
                ]
              : undefined,
          examTipOrTrap: 'Lee con atención cada pregunta antes de responder y subraya las palabras clave.',
          keyConcepts: ['Definición central', 'Estructura lógica', 'Aplicación práctica', 'Repaso activo'],
          teacherTip: 'Organiza tus apuntes con títulos claros y repasa con tus propias palabras.',
        }
      : undefined,
    summary: tasks.summary
      ? {
          mainIdea: `Síntesis escolar sobre ${topicTitle}.`,
          keyPoints: [
            'Identificar la idea principal del tema estudiado.',
            'Relacionar los conceptos clave con ejemplos prácticos.',
            'Verificar las conclusiones antes de entregar la tarea.',
          ],
          summaryLengthNote: 'Resumen estructurado para estudio rápido.',
        }
      : undefined,
    processingTimeMs: Date.now() - startTime,
    timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
    provider: wikiDefinition ? 'wikipedia' : 'local',
  };
}

/**
 * Envía la solicitud al endpoint del servidor con conmutación automática al Modo Híbrido en navegador
 */
export async function reviewHomework({
  text,
  imageFile,
  tasks,
  gradeLevel,
  subject = 'lengua',
  responseDepth = 'detailed',
}: ReviewHomeworkParams): Promise<HomeworkReviewResult> {
  const hasAnyTask =
    tasks &&
    (tasks.correction ||
      tasks.summary ||
      tasks.analysis ||
      tasks.step_by_step ||
      tasks.explanation ||
      tasks.quiz_guide);

  if (!hasAnyTask) {
    throw new Error('Debes seleccionar al menos una tarea para que el tutor te ayude.');
  }

  const hasText = Boolean(text && text.trim().length > 0);
  const hasImage = Boolean(imageFile);

  if (!hasText && !hasImage) {
    throw new Error('Por favor escribe o pega un texto, o sube una foto de tu cuaderno o tarea.');
  }

  let imageData: { base64: string; mimeType: string } | null = null;
  if (imageFile) {
    imageData = await convertFileToBase64(imageFile);
  }

  // Enrutamiento previo para materias teóricas sin imagen:
  // Si Wikipedia resuelve el concepto limpio (200 OK), evitamos gastar cuota de Groq en servidor y cliente.
  const cleanQuery = hasText ? text!.trim() : '';
  const isTheoretical = THEORETICAL_SUBJECTS.includes(subject);
  const isCalculation = CALCULATION_SUBJECTS.includes(subject) || Boolean(tasks.step_by_step);

  if (isTheoretical && !isCalculation && !hasImage && cleanQuery.length > 0 && cleanQuery.length <= 260) {
    const cleanTopic = extractKeyTopic(cleanQuery);
    const wikiDirectResult = await tryResolveTheoreticalWithWikipedia({
      cleanTopic,
      subject,
      gradeLevel,
      responseDepth,
      tasks,
      startTime: Date.now(),
    });
    if (wikiDirectResult) {
      return wikiDirectResult;
    }
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Pasar clave de diagnóstico opcional por cabecera segura HTTPS hacia el backend
  const customGroqKey = typeof window !== 'undefined' ? localStorage.getItem('cp_debug_groq_key') : null;
  if (customGroqKey && customGroqKey.trim().startsWith('gsk_')) {
    headers['x-groq-api-key'] = customGroqKey.trim();
  }

  if (auth.currentUser) {
    try {
      const idToken = await auth.currentUser.getIdToken();
      if (idToken) {
        headers['Authorization'] = `Bearer ${idToken}`;
      }
    } catch (e) {
      console.warn('Aviso: No se pudo obtener el token de autenticación:', e);
    }
  }

  // Ruta 1: Intentar servidor backend (/api/review)
  try {
    const response = await fetch('/api/review', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        text: hasText ? text?.trim() : undefined,
        image: imageData,
        tasks,
        gradeLevel,
        subject,
        responseDepth,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return data as HomeworkReviewResult;
    }

    // Si el servidor emitió un rechazo explícito (400, 401 No Autorizado, 429 Rate Limit)
    if (response.status === 400 || response.status === 401 || response.status === 429) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData?.error || 'Revisa los datos enviados e intenta nuevamente.');
    }
  } catch (err) {
    // Si fue un error explícito del backend, relanzarlo para que el usuario sea informado
    if (err instanceof Error && !err.message.includes('Failed to fetch') && !err.message.includes('NetworkError')) {
      throw err;
    }
    console.log('[Modo Híbrido] Servidor no disponible o modo estático. Resolviendo con respaldo gratuito...');
  }

  // Ruta 2: Modo Híbrido Autónomo en Navegador (100% Gratis sin servidor ni facturación)
  return await reviewHomeworkInBrowser({
    text: hasText ? text?.trim() : undefined,
    imageData,
    tasks,
    gradeLevel,
    subject,
    responseDepth,
  });
}
