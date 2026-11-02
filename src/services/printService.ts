/**
 * Servicio de Generación de Fichas Escolares en PDF y Copiado de Apuntes
 * Genera documentos PDF reales y descargables directamente mediante jsPDF.
 * Elimina la dependencia de window.print() o iframes de impresión que fallan en entornos sandbox/móviles.
 */

import { jsPDF } from 'jspdf';
import { HomeworkReviewResult, GradeLevel } from '../types';

export interface PrintableSheetData {
  result: HomeworkReviewResult;
  subjectName: string;
  gradeLevel: GradeLevel;
  studentName?: string;
}

/**
 * Genera el texto formateado completo de la ficha escolar listo para pegar en Word / Docs
 */
export function generateSheetFormattedText({
  result,
  subjectName,
  gradeLevel,
  studentName = 'Estudiante',
}: PrintableSheetData): string {
  const levelLabel = gradeLevel === 'secundaria' ? 'Bachillerato / Secundaria' : 'Primaria';
  const currentDate = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  let text = `====================================================\n`;
  text += `📓 TUTOR-IA - FICHA ESCOLAR DE ESTUDIO\n`;
  text += `====================================================\n`;
  text += `Estudiante: ${studentName}\n`;
  text += `Materia: ${subjectName}\n`;
  text += `Nivel: ${levelLabel}\n`;
  text += `Modo: ${result.responseDepth === 'detailed' ? '📚 Detallado y Extenso' : '⚡ Resumido'}\n`;
  text += `Fecha: ${currentDate} - ${result.timestamp || ''}\n`;
  text += `----------------------------------------------------\n\n`;

  // 1. Paso a Paso
  if (result.stepByStep) {
    const s = result.stepByStep;
    text += `🔢 SOLUCIÓN PASO A PASO: ${s.topic}\n`;
    if (s.problemStatement) text += `Enunciado: ${s.problemStatement}\n`;
    if (s.formulaUsed) text += `Fórmula utilizada: ${s.formulaUsed}\n`;
    text += `\n>> RESPUESTA FINAL: ${s.finalAnswer} <<\n\n`;
    text += `Procedimiento didáctico:\n`;
    s.steps.forEach((step) => {
      text += `  • Paso ${step.stepNumber}: ${step.title}\n`;
      text += `    ${step.explanation}\n`;
      if (step.mathOrFormula) text += `    Cálculo: ${step.mathOrFormula}\n`;
    });
    if (s.verificationCheck) text += `\n✓ Verificación: ${s.verificationCheck}\n`;
    if (s.detailedNotes) text += `📌 Notas: ${s.detailedNotes}\n`;
    if (s.alternativeMethod) text += `💡 Método alternativo: ${s.alternativeMethod}\n`;
    if (s.teacherTip) text += `⭐ Consejo del profesor: ${s.teacherTip}\n`;
    text += `\n----------------------------------------------------\n\n`;
  }

  // 2. Explicación Didáctica
  if (result.topicExplanation) {
    const e = result.topicExplanation;
    text += `📘 EXPLICACIÓN DIDÁCTICA: ${e.topic}\n`;
    text += `Definición Central:\n${e.simpleDefinition}\n\n`;

    if (e.detailedExplanation) {
      text += `Desarrollo Pedagógico a Fondo:\n${e.detailedExplanation}\n\n`;
    }

    if (e.causeAndEffect) {
      text += `⚡ Causa & Efecto: ${e.causeAndEffect}\n`;
    }
    if (e.howItWorksOrWhy) {
      text += `🧭 ¿Cómo funciona?: ${e.howItWorksOrWhy}\n`;
    }
    if (e.realWorldExample) {
      text += `🌍 En la vida real: ${e.realWorldExample}\n`;
    }

    if (e.realWorldExamples && e.realWorldExamples.length > 0) {
      text += `\n🌐 Ejemplos del Mundo Real:\n`;
      e.realWorldExamples.forEach((ex) => {
        text += `  • ${ex}\n`;
      });
    }

    if (e.contextAndOrigins) {
      text += `\n📜 Contexto e Historia:\n${e.contextAndOrigins}\n`;
    }

    if (e.glossary && e.glossary.length > 0) {
      text += `\n📚 Glosario de Términos Clave:\n`;
      e.glossary.forEach((g) => {
        text += `  • ${g.term}: ${g.definition}\n`;
      });
    }

    if (e.examTipOrTrap) {
      text += `\n🎯 Clave de Examen: ${e.examTipOrTrap}\n`;
    }

    if (e.keyConcepts && e.keyConcepts.length > 0) {
      text += `\n📌 Conceptos Clave:\n`;
      e.keyConcepts.forEach((k) => {
        text += `  • ${k}\n`;
      });
    }

    if (e.teacherTip) {
      text += `\n⭐ Consejo del Tutor: ${e.teacherTip}\n`;
    }
    text += `\n----------------------------------------------------\n\n`;
  }

  // 3. Corrección
  if (result.correction) {
    const c = result.correction;
    text += `📝 CORRECCIÓN ORTOGRÁFICA Y GRAMATICAL\n`;
    text += `Evaluación: ${c.scoreText}\n\n`;
    text += `Texto Corregido:\n${c.correctedText}\n\n`;

    if (c.explanations && c.explanations.length > 0) {
      text += `Reglas explicadas:\n`;
      c.explanations.forEach((m) => {
        text += `  • "${m.original}" → "${m.correction}" (${m.type}): ${m.explanation}\n`;
      });
    }
    if (c.teacherTip) text += `\n⭐ Consejo de escritura: ${c.teacherTip}\n`;
    text += `\n----------------------------------------------------\n\n`;
  }

  // 4. Resumen
  if (result.summary) {
    const sum = result.summary;
    text += `📌 RESUMEN DE ESTUDIO\n`;
    text += `Idea Principal: "${sum.mainIdea}"\n\n`;
    text += `Puntos Clave:\n`;
    sum.keyPoints.forEach((p, idx) => {
      text += `  ${idx + 1}. ${p}\n`;
    });
    text += `\n----------------------------------------------------\n\n`;
  }

  // 5. Guía de Taller
  if (result.quizGuide) {
    const qg = result.quizGuide;
    text += `❓ GUÍA DE TALLER Y PREGUNTAS: ${qg.topic}\n\n`;
    qg.questions.forEach((q, idx) => {
      text += `Pregunta ${idx + 1}: ${q.questionOrConcept}\n`;
      text += `  Pista: ${q.guideHint}\n`;
      text += `  Respuesta modelo: ${q.sampleAnswerOrThought}\n\n`;
    });
    if (qg.studyTip) text += `⭐ Recomendación para exámenes: ${qg.studyTip}\n`;
    text += `\n====================================================\n`;
  }

  text += `Tutor-IA · Tutor Escolar Inteligente · Generado para estudio personal\n`;
  return text;
}

/**
 * Sanea texto para jsPDF (fuentes WinAnsi estándar) eliminando emojis UTF-8
 * que generan Mojibake (Ø>Ýí, Ø<ß) y reemplazando símbolos especiales por ASCII seguro.
 */
export function cleanPdfText(text: string): string {
  if (!text) return '';
  return text
    .replace(
      /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{200D}]/gu,
      ''
    )
    .replace(/→|➔|➜|➡/g, '->')
    .replace(/←/g, '<-')
    .replace(/↔/g, '<->')
    .replace(/•|▪|▸|▹/g, '-')
    .replace(/✓|✔/g, '[OK]')
    .replace(/✗|✘/g, '[X]')
    .replace(/≤/g, '<=')
    .replace(/≥/g, '>=')
    .replace(/≠/g, '!=')
    .replace(/≈/g, '~=')
    .replace(/×/g, 'x')
    .replace(/÷/g, '/')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[ \t]+/g, ' ')
    .trim();
}

/**
 * Genera y descarga un PDF real de alta calidad estética escolar mediante jsPDF
 */
export async function downloadPrintableSheetPdf({
  result,
  subjectName,
  gradeLevel,
  studentName = 'Estudiante',
}: PrintableSheetData): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
  const margin = 15; // 15mm margen izquierdo y 15mm derecho
  const contentWidth = pageWidth - margin * 2; // 180mm ancho útil estricto
  const innerPadding = 5;
  const usableBoxWidth = contentWidth - innerPadding * 2; // 170mm dentro de tarjetas
  const maxY = pageHeight - 20; // 277mm

  let currentY = margin;

  const safeSubject = cleanPdfText(subjectName);
  const safeStudent = cleanPdfText(studentName);

  // Comprueba si se requiere una nueva página antes de dibujar un bloque
  function ensureSpace(neededHeight: number) {
    if (currentY + neededHeight > maxY) {
      doc.addPage();
      currentY = margin;
      drawPageHeaderMini();
    }
  }

  function drawPageHeaderMini() {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(`TUTOR-IA - ${safeSubject.toUpperCase()} - ${safeStudent.toUpperCase()}`, margin, currentY);
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(margin, currentY + 2, margin + contentWidth, currentY + 2);
    currentY += 7;
  }

  // ----------------------------------------------------
  // CABECERA PRINCIPAL (Portada escolar)
  // ----------------------------------------------------
  doc.setFillColor(250, 247, 238); // #FAF7EE
  doc.setDrawColor(26, 26, 26); // #1A1A1A
  doc.setLineWidth(0.8);
  doc.roundedRect(margin, currentY, contentWidth, 22, 2.5, 2.5, 'FD');

  // Sombra neubrutalista
  doc.setFillColor(26, 26, 26);
  doc.rect(margin + contentWidth, currentY + 1.2, 1.2, 20.8, 'F');
  doc.rect(margin + 1.2, currentY + 22, contentWidth, 1.2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(26, 26, 26);
  doc.text('TUTOR-IA', margin + 6, currentY + 8);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(70, 70, 70);
  doc.text('Tutor Escolar Inteligente - Ficha de Estudio y Apuntes', margin + 6, currentY + 14);

  // Fecha y hora
  const dateStr = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(26, 26, 26);
  doc.text(`Fecha: ${cleanPdfText(dateStr)}`, margin + contentWidth - 6, currentY + 8, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.text(`Hora: ${cleanPdfText(result.timestamp || '')}`, margin + contentWidth - 6, currentY + 14, { align: 'right' });

  currentY += 27;

  // ----------------------------------------------------
  // BARRA DE METADATOS ESCOLARES
  // ----------------------------------------------------
  const levelText = gradeLevel === 'secundaria' ? 'Bachillerato / Secundaria' : 'Primaria';
  const modeText = result.responseDepth === 'detailed' ? 'Modo Detallado' : 'Modo Resumido';

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(26, 26, 26);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, currentY, contentWidth, 10, 1.5, 1.5, 'FD');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(26, 26, 26);
  doc.text(`Estudiante: ${safeStudent}`, margin + 4, currentY + 6.5);
  doc.text(`Materia: ${safeSubject}`, margin + 65, currentY + 6.5);
  doc.text(`Nivel: ${levelText}`, margin + 115, currentY + 6.5);
  doc.text(`[${modeText}]`, margin + contentWidth - 4, currentY + 6.5, { align: 'right' });

  currentY += 14;

  // ----------------------------------------------------
  // FUNCIÓN PARA RENDERIZAR TÍTULOS DE SECCIÓN
  // ----------------------------------------------------
  function renderSectionHeader(title: string, badgeBg: [number, number, number]) {
    const cleanTitle = cleanPdfText(title).toUpperCase();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    const titleLines = doc.splitTextToSize(cleanTitle, usableBoxWidth);
    const headerHeight = Math.max(8, titleLines.length * 4.5 + 3.5);

    ensureSpace(headerHeight + 6);
    doc.setFillColor(...badgeBg);
    doc.setDrawColor(26, 26, 26);
    doc.setLineWidth(0.6);
    doc.roundedRect(margin, currentY, contentWidth, headerHeight, 1.5, 1.5, 'FD');

    doc.setTextColor(26, 26, 26);
    doc.text(titleLines, margin + innerPadding, currentY + 5.3);
    currentY += headerHeight + 3;
  }

  // ----------------------------------------------------
  // FUNCIÓN PARA DIBUJAR PÁRRAFOS Y LISTAS CON TÍTULO
  // ----------------------------------------------------
  function renderTextBlock(
    label: string,
    body: string,
    bgColor?: [number, number, number],
    borderColor: [number, number, number] = [200, 200, 200]
  ) {
    if (!body || !body.trim()) return;
    const cleanLabel = cleanPdfText(label);
    const paragraphs = body
      .split('\n')
      .map((line) => cleanPdfText(line))
      .filter(Boolean);
    if (paragraphs.length === 0) return;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.8);
    const splitLines: string[] = [];
    paragraphs.forEach((p) => {
      const wrapped = doc.splitTextToSize(p, usableBoxWidth);
      splitLines.push(...wrapped);
    });

    const lineHeight = 4.2;
    const boxHeight = 6 + splitLines.length * lineHeight + (cleanLabel ? 4.8 : 0);

    ensureSpace(boxHeight + 3);

    if (bgColor) {
      doc.setFillColor(...bgColor);
      doc.setDrawColor(...borderColor);
      doc.setLineWidth(0.4);
      doc.roundedRect(margin, currentY, contentWidth, boxHeight, 1.5, 1.5, 'FD');
    }

    let textY = currentY + 5;
    if (cleanLabel) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(26, 26, 26);
      doc.text(cleanLabel, margin + innerPadding, textY);
      textY += 4.8;
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.8);
    doc.setTextColor(40, 40, 40);
    doc.text(splitLines, margin + innerPadding, textY);

    currentY += boxHeight + 3;
  }

  // ----------------------------------------------------
  // 1. SOLUCIÓN PASO A PASO
  // ----------------------------------------------------
  if (result.stepByStep) {
    const s = result.stepByStep;
    renderSectionHeader(`SOLUCION PASO A PASO: ${s.topic}`, [168, 230, 207]); // Verde pastel

    if (s.problemStatement) {
      renderTextBlock('Enunciado del problema:', s.problemStatement, [250, 250, 250]);
    }

    if (s.formulaUsed) {
      renderTextBlock('Fórmula aplicada:', s.formulaUsed, [240, 248, 255]);
    }

    // Respuesta final destacada con auto-wrap dentro de los márgenes
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    const finalAnsLines = doc.splitTextToSize(cleanPdfText(s.finalAnswer), usableBoxWidth);
    const finalAnsBoxHeight = 7 + finalAnsLines.length * 4.5;

    ensureSpace(finalAnsBoxHeight + 3);
    doc.setFillColor(232, 248, 245);
    doc.setDrawColor(13, 95, 78);
    doc.setLineWidth(0.6);
    doc.roundedRect(margin, currentY, contentWidth, finalAnsBoxHeight, 1.5, 1.5, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(13, 95, 78);
    doc.text('RESPUESTA FINAL:', margin + innerPadding, currentY + 4.2);
    doc.setFontSize(10);
    doc.setTextColor(26, 26, 26);
    doc.text(finalAnsLines, margin + innerPadding, currentY + 8.5);
    currentY += finalAnsBoxHeight + 3;

    // Pasos didácticos con medición exacta de fuente para evitar desbordes
    s.steps.forEach((step) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      const titleLines = doc.splitTextToSize(
        cleanPdfText(`Paso ${step.stepNumber}: ${step.title}`),
        usableBoxWidth
      );

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      const explLines = doc.splitTextToSize(cleanPdfText(step.explanation), usableBoxWidth);

      // Medir el cálculo con la fuente 'courier' activa (monoespaciada es más ancha que helvetica)
      let mathLines: string[] = [];
      if (step.mathOrFormula) {
        doc.setFont('courier', 'bold');
        doc.setFontSize(8.3);
        const rawMathLines = step.mathOrFormula
          .split('\n')
          .map((l) => cleanPdfText(l))
          .filter(Boolean);
        rawMathLines.forEach((line, idx) => {
          const prefix = idx === 0 ? 'Calculo: ' : '         ';
          const wrappedMath = doc.splitTextToSize(`${prefix}${line}`, usableBoxWidth);
          mathLines.push(...wrappedMath);
        });
      }

      const titleH = titleLines.length * 4.2;
      const explH = explLines.length * 4.0;
      const mathH = mathLines.length > 0 ? mathLines.length * 4.0 + 2 : 0;
      const stepHeight = 5 + titleH + explH + mathH;

      ensureSpace(stepHeight + 2.5);

      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.3);
      doc.roundedRect(margin, currentY, contentWidth, stepHeight, 1, 1, 'FD');

      let stepY = currentY + 4.5;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(26, 26, 26);
      doc.text(titleLines, margin + innerPadding, stepY);
      stepY += titleH;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(50, 50, 50);
      doc.text(explLines, margin + innerPadding, stepY);
      stepY += explH + 1;

      if (mathLines.length > 0) {
        doc.setFont('courier', 'bold');
        doc.setFontSize(8.3);
        doc.setTextColor(20, 60, 120);
        doc.text(mathLines, margin + innerPadding, stepY);
      }

      currentY += stepHeight + 2.5;
    });

    if (s.verificationCheck) {
      renderTextBlock('Verificación matemática:', s.verificationCheck, [240, 244, 248]);
    }

    if (s.detailedNotes) {
      renderTextBlock('Notas analíticas:', s.detailedNotes, [255, 250, 240]);
    }

    if (s.alternativeMethod) {
      renderTextBlock('Método alternativo:', s.alternativeMethod, [245, 245, 255]);
    }

    if (s.teacherTip) {
      renderTextBlock('Consejo del Profesor:', s.teacherTip, [255, 248, 214], [200, 180, 50]);
    }

    currentY += 3;
  }

  // ----------------------------------------------------
  // 2. EXPLICACIÓN DIDÁCTICA
  // ----------------------------------------------------
  if (result.topicExplanation) {
    const e = result.topicExplanation;
    renderSectionHeader(`EXPLICACION DIDACTICA: ${e.topic}`, [160, 231, 229]); // Celeste pastel

    // Definición central
    renderTextBlock('Definición Central:', e.simpleDefinition, [250, 247, 238], [26, 26, 26]);

    // Desarrollo pedagógico a fondo
    if (e.detailedExplanation) {
      renderTextBlock('Desarrollo Pedagógico a Fondo:', e.detailedExplanation, [255, 255, 255], [200, 200, 200]);
    }

    // Causa & Efecto y Cómo Funciona (sin emojis que rompan jsPDF)
    if (e.causeAndEffect) {
      renderTextBlock('Causa y Efecto:', e.causeAndEffect, [248, 249, 250]);
    }

    if (e.howItWorksOrWhy) {
      renderTextBlock('¿Cómo funciona?:', e.howItWorksOrWhy, [248, 249, 250]);
    }

    if (e.realWorldExample) {
      renderTextBlock('Aplicación en la Vida Real:', e.realWorldExample, [245, 250, 245]);
    }

    // Ejemplos del mundo real
    if (e.realWorldExamples && e.realWorldExamples.length > 0) {
      const examplesBody = e.realWorldExamples.map((ex) => `- ${cleanPdfText(ex)}`).join('\n');
      renderTextBlock('Ejemplos del Mundo Real:', examplesBody, [255, 255, 255], [210, 210, 210]);
    }

    // Contexto histórico
    if (e.contextAndOrigins) {
      renderTextBlock('Contexto e Historia del Concepto:', e.contextAndOrigins, [253, 248, 240]);
    }

    // Glosario de términos clave
    if (e.glossary && e.glossary.length > 0) {
      const glossaryBody = e.glossary.map((g) => `- ${cleanPdfText(g.term)}: ${cleanPdfText(g.definition)}`).join('\n');
      renderTextBlock('Glosario de Términos Clave:', glossaryBody, [250, 247, 238]);
    }

    // Clave de examen
    if (e.examTipOrTrap) {
      renderTextBlock('Clave de Examen / Trampa Típica:', e.examTipOrTrap, [255, 240, 242], [220, 100, 100]);
    }

    // Conceptos clave
    if (e.keyConcepts && e.keyConcepts.length > 0) {
      const conceptsBody = e.keyConcepts.map((k, i) => `${i + 1}. ${cleanPdfText(k)}`).join('   |   ');
      renderTextBlock('Conceptos Clave para el Cuaderno:', conceptsBody, [245, 245, 245]);
    }

    if (e.teacherTip) {
      renderTextBlock('Consejo del Tutor:', e.teacherTip, [255, 248, 214], [200, 180, 50]);
    }

    currentY += 3;
  }

  // ----------------------------------------------------
  // 3. CORRECCIÓN ORTOGRÁFICA
  // ----------------------------------------------------
  if (result.correction) {
    const c = result.correction;
    renderSectionHeader('CORRECCION ORTOGRAFICA Y GRAMATICAL', [255, 230, 109]); // Amarillo pastel

    renderTextBlock('Evaluación Formativa:', c.scoreText, [255, 255, 255]);
    renderTextBlock('Texto Corregido:', c.correctedText, [240, 248, 240], [100, 180, 100]);

    if (c.explanations && c.explanations.length > 0) {
      const explanationsBody = c.explanations
        .map((m) => `- "${cleanPdfText(m.original)}" -> "${cleanPdfText(m.correction)}" (${cleanPdfText(m.type)}): ${cleanPdfText(m.explanation)}`)
        .join('\n');
      renderTextBlock('Reglas explicadas paso a paso:', explanationsBody, [255, 255, 255]);
    }

    if (c.teacherTip) {
      renderTextBlock('Consejo de Escritura:', c.teacherTip, [255, 248, 214], [200, 180, 50]);
    }

    currentY += 3;
  }

  // ----------------------------------------------------
  // 4. RESUMEN
  // ----------------------------------------------------
  if (result.summary) {
    const sum = result.summary;
    renderSectionHeader('RESUMEN DE ESTUDIO', [255, 218, 193]); // Salmón pastel
    renderTextBlock('Idea Principal:', `"${cleanPdfText(sum.mainIdea)}"`, [250, 247, 238]);

    const pointsBody = sum.keyPoints.map((p, i) => `${i + 1}. ${cleanPdfText(p)}`).join('\n');
    renderTextBlock('Puntos Clave:', pointsBody, [255, 255, 255]);

    currentY += 3;
  }

  // ----------------------------------------------------
  // 5. GUÍA DE TALLER
  // ----------------------------------------------------
  if (result.quizGuide) {
    const qg = result.quizGuide;
    renderSectionHeader(`GUIA DE TALLER: ${qg.topic}`, [255, 179, 186]); // Rosa pastel

    qg.questions.forEach((q, idx) => {
      const qText = `Pregunta ${idx + 1}: ${cleanPdfText(q.questionOrConcept)}\nPista: ${cleanPdfText(q.guideHint)}\nRespuesta Modelo: ${cleanPdfText(q.sampleAnswerOrThought)}`;
      renderTextBlock(`Ejercicio ${idx + 1}:`, qText, [255, 255, 255]);
    });

    if (qg.studyTip) {
      renderTextBlock('Recomendación para exámenes:', qg.studyTip, [255, 248, 214], [200, 180, 50]);
    }

    currentY += 3;
  }

  // ----------------------------------------------------
  // NUMERACIÓN DE PÁGINAS Y PIE DE PÁGINA
  // ----------------------------------------------------
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(120, 120, 120);
    doc.setDrawColor(210, 210, 210);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 12, margin + contentWidth, pageHeight - 12);
    doc.text(
      `Página ${i} de ${totalPages} · Tutor-IA - Tutor Escolar Inteligente para Primaria y Bachillerato`,
      pageWidth / 2,
      pageHeight - 8,
      { align: 'center' }
    );
  }

  // Descargar archivo PDF directamente
  const cleanSubject = subjectName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  doc.save(`TutorIA_${cleanSubject}_${Date.now()}.pdf`);
}
