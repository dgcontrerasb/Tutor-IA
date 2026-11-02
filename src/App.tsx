/**
 * Tutor-IA - Aplicación Web para Corrección Ortográfica,
 * Resumen y Análisis de Textos y Tareas Escolares.
 *
 * Estilo Neubrutalismo Lúdico / Tutor-IA
 * Punto 3: 3 consultas de prueba gratuitas para usuarios nuevos y bloqueo al consumirlas.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  AlertCircle,
  RotateCcw,
  FileDown,
  Sparkles,
  Copy,
  Check,
  BookmarkCheck,
} from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import {
  GradeLevel,
  HomeworkReviewResult,
  SchoolSubjectId,
  SelectedTasks,
  TaskType,
  UserUsage,
  ResponseDepth,
} from './types';
import { reviewHomework } from './services/reviewService';
import { getUsage, recordUsage } from './services/usageService';
import { canUploadPhoto, recordPhotoUpload } from './services/photoUsageService';
import {
  auth,
  UserProfile,
  syncUserProfile,
  incrementUserUsage,
  getUserUsageFromProfile,
} from './services/firebase';
import { StickyNavbar, HeroBanner } from './components/Header';
import { UsageCounter } from './components/UsageCounter';
import { InputZone } from './components/InputZone';
import { SubjectSelector } from './components/SubjectSelector';
import { TaskSelector } from './components/TaskSelector';
import { ResponseDepthSelector } from './components/ResponseDepthSelector';
import { LoadingState } from './components/LoadingState';
import { ResultsDisplay } from './components/ResultsDisplay';
import { LoginPromptModal } from './components/LoginPromptModal';
import { TrialBlockedModal } from './components/TrialBlockedModal';
import { PaymentModal } from './components/PaymentModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { LegalModal, LegalTab } from './components/LegalModal';
import { SchoolGuardrailCard } from './components/SchoolGuardrailCard';
import {
  RecentHomeworksHistory,
  saveHomeworkToHistory,
  SavedHomeworkItem,
} from './components/RecentHomeworksHistory';
import { getSubjectById, isSubjectVisualOrFormula } from './data/schoolSubjects';
import { AuthToast } from './components/AuthToast';
import { getCleanDisplayName } from './components/AuthBar';
import { CelebrationBurst } from './components/CelebrationBurst';
import { PrintModal } from './components/PrintModal';
import { DiagnosticModal } from './components/DiagnosticModal';
import { useModals } from './hooks/useModals';
import { useAuthUser } from './hooks/useAuthUser';

export default function App() {
  // Hooks desacoplados de autenticación y modales
  const {
    currentUser,
    setCurrentUser,
    authLoading,
    authToast,
    setAuthToast,
    isSyncing,
    usage,
    setUsage,
    handleRefreshProfile,
  } = useAuthUser();

  const {
    isLoginModalOpen,
    setIsLoginModalOpen,
    isTrialBlockedModalOpen,
    setIsTrialBlockedModalOpen,
    isPaymentModalOpen,
    setIsPaymentModalOpen,
    isAdminModalOpen,
    setIsAdminModalOpen,
    isLegalModalOpen,
    setIsLegalModalOpen,
    isPrintModalOpen,
    setIsPrintModalOpen,
    legalModalTab,
    setLegalModalTab,
  } = useModals();

  // Entradas de usuario
  const [textInput, setTextInput] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [gradeLevel, setGradeLevel] = useState<GradeLevel>('primaria');
  const [selectedSubjectId, setSelectedSubjectId] = useState<SchoolSubjectId>('lengua');
  const [responseDepth, setResponseDepth] = useState<ResponseDepth>('detailed');

  // Selector de tareas (por defecto las activas para la materia)
  const [selectedTasks, setSelectedTasks] = useState<SelectedTasks>({
    correction: true,
    summary: true,
    analysis: true,
  });

  // Cambiar materia y adaptar tareas por defecto
  const handleSelectSubject = (id: SchoolSubjectId) => {
    setSelectedSubjectId(id);
    const subject = getSubjectById(id);
    const newTasks: SelectedTasks = {};
    subject.defaultTasks.forEach((t) => {
      newTasks[t] = true;
    });
    setSelectedTasks(newTasks);
    setErrorMessage(null);
  };

  // Estados de ejecución
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<HomeworkReviewResult | null>(null);
  const [isFormCollapsed, setIsFormCollapsed] = useState(false);

  const resultsRef = useRef<HTMLDivElement>(null);

  // Auto-scroll suave hacia el resultado en celulares al recibir o colapsar el formulario
  useEffect(() => {
    if (result && resultsRef.current) {
      const scrollTimer = setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
      return () => clearTimeout(scrollTimer);
    }
  }, [result, isFormCollapsed]);

  // Alternar selección de tarea
  const handleToggleTask = (task: TaskType) => {
    setSelectedTasks((prev) => ({
      ...prev,
      [task]: !prev[task],
    }));
    setErrorMessage(null);
  };

  // Enviar a revisar la tarea al servidor
  const handleSubmitReview = async () => {
    setErrorMessage(null);

    // 0. Punto 2: Exigir registro con correo Google para guardar el historial del estudiante
    if (!currentUser) {
      setIsLoginModalOpen(true);
      setErrorMessage('Para revisar tu tarea y guardar tus consultas escolares, por favor accede con tu correo Google.');
      return;
    }

    // 2. Asignación Inteligente de Casillas (Paso 3):
    // Si la consulta es explicativa o biográfica y no tiene casillas pedagógicas marcadas, o solo marcó análisis:
    const effectiveTasks: SelectedTasks = { ...selectedTasks };
    const queryText = textInput.trim().toLowerCase();
    const isExplanatoryQuery = /(\bqui[eé]n\s+fue\b|\bqu[eé]\s+[eé]s\b|\bqu[eé]\s+son\b|\bbiograf[ií]a\b|\bexplica\b|\bexpl[ií]came\b|\bresumen\b|\bconcepto\b|\bdefinici[oó]n\b)/i.test(queryText);

    const hasCorePedagogicalTask = Boolean(
      effectiveTasks.explanation ||
      effectiveTasks.step_by_step ||
      effectiveTasks.summary ||
      effectiveTasks.correction ||
      effectiveTasks.quiz_guide
    );

    if (isExplanatoryQuery && (!hasCorePedagogicalTask || (effectiveTasks.analysis && !effectiveTasks.explanation))) {
      effectiveTasks.explanation = true;
      if (queryText.includes('resumen')) {
        effectiveTasks.summary = true;
      }
      setSelectedTasks(effectiveTasks);
    }

    // Validar selección de tareas efectiva
    const hasAnyTask = Boolean(
      effectiveTasks.correction ||
        effectiveTasks.summary ||
        effectiveTasks.analysis ||
        effectiveTasks.step_by_step ||
        effectiveTasks.explanation ||
        effectiveTasks.quiz_guide
    );

    if (!hasAnyTask) {
      setErrorMessage('Debes seleccionar al menos una opción de ayuda pedagógica para tu materia.');
      return;
    }

    // 3. Validar texto o imagen
    if (!textInput.trim() && !imageFile) {
      setErrorMessage('Por favor ingresa un texto escrito o sube una imagen de tu tarea/cuaderno.');
      return;
    }

    // 3.1 Validar límite de fotos si hay una imagen cargada
    if (imageFile && !canUploadPhoto()) {
      setErrorMessage('Has alcanzado tu límite diario de 5 fotos de cuaderno. Por favor remueve la foto para consultar en texto libre ilimitado.');
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const reviewResult = await reviewHomework({
        text: textInput,
        imageFile: imageFile,
        tasks: effectiveTasks,
        gradeLevel: gradeLevel,
        subject: selectedSubjectId,
        responseDepth: responseDepth,
      });

      // Si la consulta fue bloqueada por estar fuera del contexto escolar, NO descontamos uso
      if (reviewResult.isSchoolRelated === false) {
        setResult(reviewResult);
        setIsFormCollapsed(true);
        setTimeout(() => {
          resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
        return;
      }

      // Consulta escolar válida: incrementar uso de forma optimizada en Firestore (0 lecturas)
      const updatedProfile = await incrementUserUsage(currentUser.uid, currentUser);
      if (updatedProfile) {
        setCurrentUser(updatedProfile);
        setUsage(getUserUsageFromProfile(updatedProfile));
      }
      recordUsage();
      if (imageFile) {
        recordPhotoUpload();
      }

      setResult(reviewResult);
      setIsFormCollapsed(true);

      // PASO 5: Guardar automáticamente en el cuaderno de apuntes local (LocalStorage)
      saveHomeworkToHistory(
        selectedSubjectId,
        textInput || (imageFile ? 'Foto de cuaderno/tarea' : 'Consulta escolar'),
        reviewResult,
        gradeLevel
      );

      // Desplazamiento suave inmediato hacia los resultados
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Ocurrió un error inesperado al procesar la tarea.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Reiniciar formulario
  const handleReset = () => {
    setTextInput('');
    setImageFile(null);
    setResult(null);
    setErrorMessage(null);
    setIsFormCollapsed(false);
  };

  // Abrir ventana de descarga en PDF y copiado completo
  const handlePrint = () => {
    if (!result) return;
    setIsPrintModalOpen(true);
  };

  // Escuchar solicitudes de impresión emitidas desde las tarjetas de materias
  useEffect(() => {
    const handlePrintRequest = () => {
      handlePrint();
    };
    window.addEventListener('tutor-ia-request-print', handlePrintRequest);
    return () => {
      window.removeEventListener('tutor-ia-request-print', handlePrintRequest);
    };
  }, [result, selectedSubjectId, gradeLevel, currentUser]);

  // Copiar apunte escolar completo al portapapeles
  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const handleCopyNotes = async () => {
    if (!result) return;
    const subject = getSubjectById(selectedSubjectId);
    let noteText = `📓 TUTOR-IA - APUNTES DE ESTUDIO\n`;
    noteText += `Materia: ${subject.name} (${gradeLevel === 'secundaria' ? 'Secundaria' : 'Primaria'})\n`;
    noteText += `Fecha: ${new Date().toLocaleDateString('es-ES')} - ${result.timestamp}\n`;
    noteText += `----------------------------------------\n\n`;

    if (result.stepByStep) {
      noteText += `🔢 SOLUCIÓN PASO A PASO: ${result.stepByStep.topic}\n`;
      noteText += `Problema: ${result.stepByStep.problemStatement}\n\n`;
      result.stepByStep.steps.forEach((s) => {
        noteText += `${s.title}:\n${s.explanation}\n`;
        if (s.mathOrFormula) noteText += `Fórmula/Cálculo: ${s.mathOrFormula}\n`;
        noteText += `\n`;
      });
      noteText += `Resultado Final: ${result.stepByStep.finalAnswer}\n`;
      if (result.stepByStep.teacherTip) noteText += `Consejo del Tutor: ${result.stepByStep.teacherTip}\n`;
      noteText += `\n`;
    }

    if (result.topicExplanation) {
      noteText += `💡 EXPLICACIÓN DIDÁCTICA: ${result.topicExplanation.topic}\n`;
      noteText += `Definición: ${result.topicExplanation.simpleDefinition}\n\n`;
      if (result.topicExplanation.causeAndEffect) {
        noteText += `Causa & Efecto:\n${result.topicExplanation.causeAndEffect}\n\n`;
      }
      noteText += `¿Cómo funciona?: ${result.topicExplanation.howItWorksOrWhy}\n\n`;
      noteText += `Ejemplo en la vida real: ${result.topicExplanation.realWorldExample}\n\n`;
      if (result.topicExplanation.examTipOrTrap) {
        noteText += `Clave de Examen / Trampa Típica:\n${result.topicExplanation.examTipOrTrap}\n\n`;
      }
      if (result.topicExplanation.keyConcepts?.length) {
        noteText += `Conceptos clave:\n${result.topicExplanation.keyConcepts.map((k) => `• ${k}`).join('\n')}\n\n`;
      }
      if (result.topicExplanation.teacherTip) noteText += `Truco para recordar: ${result.topicExplanation.teacherTip}\n\n`;
    }

    if (result.correction) {
      noteText += `📝 CORRECCIÓN ESCOLAR\n`;
      noteText += `Nota formativa: ${result.correction.scoreText}\n`;
      noteText += `Texto corregido:\n"${result.correction.correctedText}"\n\n`;
      if (result.correction.explanations?.length) {
        noteText += `Reglas aplicadas:\n`;
        result.correction.explanations.forEach((e) => {
          noteText += `• ${e.original} ➔ ${e.correction}: ${e.explanation}\n`;
        });
        noteText += `\n`;
      }
    }

    if (result.summary) {
      noteText += `📌 RESUMEN DE ESTUDIO\n`;
      noteText += `Idea Principal: ${result.summary.mainIdea}\n\n`;
      noteText += `Puntos Clave:\n${result.summary.keyPoints.map((p) => `• ${p}`).join('\n')}\n\n`;
    }

    if (result.quizGuide) {
      noteText += `🤔 GUÍA DE TALLER\nTema: ${result.quizGuide.topic}\n\n`;
      result.quizGuide.questions.forEach((q, idx) => {
        noteText += `Pregunta ${idx + 1}: ${q.questionOrConcept}\n`;
        noteText += `Pista: ${q.guideHint}\n`;
        noteText += `Respuesta modelo: ${q.sampleAnswerOrThought}\n\n`;
      });
    }

    try {
      await navigator.clipboard.writeText(noteText);
      setCopiedSuccess(true);
      setTimeout(() => setCopiedSuccess(false), 2500);
    } catch {
      // fallback
    }
  };

  // Notificación visual al recargar una consulta desde Mi Cuaderno
  const [reloadedNotice, setReloadedNotice] = useState<string | null>(null);

  // Manejador para recargar una consulta guardada completa en pantalla
  const handleSelectSavedHomework = (item: SavedHomeworkItem) => {
    setSelectedSubjectId(item.subjectId);
    if (item.gradeLevel) {
      setGradeLevel(item.gradeLevel);
    }
    // Si no es un texto genérico de marcador de foto, restaurar el texto
    if (
      item.previewText &&
      item.previewText !== 'Foto de cuaderno/tarea' &&
      item.previewText !== 'Foto de cuaderno/ejercicio' &&
      item.previewText !== 'Consulta escolar / Ficha de estudio'
    ) {
      setTextInput(item.previewText);
    }
    setImageFile(null);

    // Activar los módulos escolares que correspondan al resultado guardado
    const updatedTasks: SelectedTasks = {
      correction: !!item.result.correction,
      summary: !!item.result.summary,
      analysis: !!item.result.analysis,
      step_by_step: !!item.result.stepByStep,
      explanation: !!item.result.topicExplanation,
      quiz_guide: !!item.result.quizGuide,
    };
    setSelectedTasks(updatedTasks);
    setResult(item.result);
    setIsFormCollapsed(true);
    setErrorMessage(null);

    const subject = getSubjectById(item.subjectId);
    setReloadedNotice(`Consulta de ${subject.name} recargada con éxito desde Mi Cuaderno`);
    setTimeout(() => {
      setReloadedNotice(null);
    }, 4500);

    // Desplazamiento suave inmediato hacia los resultados escolares
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
  };

  const isAtLeastOneTaskSelected = Boolean(
    selectedTasks.correction ||
      selectedTasks.summary ||
      selectedTasks.analysis ||
      selectedTasks.step_by_step ||
      selectedTasks.explanation ||
      selectedTasks.quiz_guide
  );
  const hasInput = Boolean(textInput.trim() || imageFile);
  const isExhausted = !usage.isSubscriptionActive && usage.remainingUsages <= 0;

  return (
    <div className="min-h-screen bg-[#FAF7EE] text-[#1A1A1A] pb-16 selection:bg-[#FFE66D]">
      {/* Notificación flotante animada para inicio y cierre de sesión */}
      <AuthToast toast={authToast} onClose={() => setAuthToast(null)} />

      {/* Barra de cabecera fija permanentemente visible (Sticky Navbar) */}
      <StickyNavbar
        gradeLevel={gradeLevel}
        onGradeLevelChange={setGradeLevel}
        usage={usage}
        user={currentUser}
        authLoading={authLoading}
        onRefreshProfile={handleRefreshProfile}
        isSyncing={isSyncing}
        onOpenPayment={() => setIsPaymentModalOpen(true)}
        onOpenAdmin={() => setIsAdminModalOpen(true)}
        onOpenLegal={(tab) => {
          setLegalModalTab(tab || 'terms');
          setIsLegalModalOpen(true);
        }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        {/* Banner Hero escolar dinámico con Mascota Escolar e interruptor Primaria <-> Bachillerato */}
        <HeroBanner
          gradeLevel={gradeLevel}
          onGradeLevelChange={setGradeLevel}
          selectedSubjectId={selectedSubjectId}
          isLoading={isLoading}
        />

        {/* Modal para solicitar inicio de sesión */}
        <LoginPromptModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
        />

        {/* Modal de Bloqueo tras consumir los 3 usos de prueba (Punto 3) */}
        <TrialBlockedModal
          isOpen={isTrialBlockedModalOpen}
          onClose={() => setIsTrialBlockedModalOpen(false)}
          onOpenPayment={() => setIsPaymentModalOpen(true)}
        />

        {/* Modal de Pago vía WhatsApp con QR de $5.000 COP (Punto 4) */}
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          userEmail={currentUser?.email}
          userName={currentUser?.displayName}
          onCheckActivation={handleRefreshProfile}
        />

        {/* Panel de Control de Administrador (Punto 5) */}
        <AdminPanelModal
          isOpen={isAdminModalOpen}
          onClose={() => setIsAdminModalOpen(false)}
          adminEmail={currentUser?.email}
        />

        {/* Modal de Aspectos Legales, Privacidad y Soporte */}
        <LegalModal
          isOpen={isLegalModalOpen}
          onClose={() => setIsLegalModalOpen(false)}
          initialTab={legalModalTab}
          onOpenPayment={() => {
            setIsLegalModalOpen(false);
            setIsPaymentModalOpen(true);
          }}
          isSubscriptionActive={usage.isSubscriptionActive}
        />

        {/* Modal de Impresión y Exportación a PDF Escolar */}
        <PrintModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          result={result}
          subjectName={getSubjectById(selectedSubjectId).name}
          gradeLevel={gradeLevel}
          studentName={getCleanDisplayName(currentUser)}
          onCopyAllText={handleCopyNotes}
        />

        {/* Botón Flotante y Modal 'Mi Cuaderno de Repaso' (Consultas Guardadas) */}
        <RecentHomeworksHistory
          onSelectSavedHomework={handleSelectSavedHomework}
          gradeLevel={gradeLevel}
        />

        {/* Componente Flotante de Diagnóstico Visual (Solo Administrador: dgcontrerasb@gmail.com o rol admin) */}
        {(currentUser?.role === 'admin' || currentUser?.email?.toLowerCase() === 'dgcontrerasb@gmail.com') && (
          <DiagnosticModal />
        )}

        {/* Formulario Principal de Tareas */}
        <main className="space-y-6">
          <div className="no-print space-y-6">
            {/* Contador y control de usos de prueba (Punto 1 y 3) */}
            <UsageCounter
              usage={usage}
              onOpenPayment={() => setIsPaymentModalOpen(true)}
            />

          {/* Colapso Inteligente de Pasos 1, 2 y 3 al recibir el resultado */}
          {isFormCollapsed && result ? (
            <div className="h-[48px] max-h-[50px] px-3 py-1.5 bg-white rounded-2xl border-[2.5px] border-[#1A1A1A] shadow-[3px_3px_0px_#1A1A1A] flex items-center justify-between gap-2 transition-all">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span
                  className="px-2 py-0.5 rounded-lg border-[1.5px] border-[#1A1A1A] text-xs font-black text-[#1A1A1A] shrink-0 flex items-center gap-1 shadow-[1.5px_1.5px_0px_#1A1A1A]"
                  style={{ backgroundColor: getSubjectById(selectedSubjectId).color }}
                >
                  <span>{getSubjectById(selectedSubjectId).icon}</span>
                  <span>{getSubjectById(selectedSubjectId).shortName}</span>
                </span>
                <span className="text-xs font-bold text-[#1A1A1A]/80 truncate">
                  {textInput.trim()
                    ? textInput.trim().length > 40
                      ? `${textInput.trim().slice(0, 40)}...`
                      : textInput.trim()
                    : imageFile
                    ? `📸 ${imageFile.name.slice(0, 30)}`
                    : 'Consulta escolar analizada'}
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsFormCollapsed(false)}
                  className="neo-btn px-2.5 py-1 bg-[#FFE66D] hover:bg-[#fedd48] text-[#1A1A1A] text-[11px] sm:text-xs font-black rounded-xl border-[1.5px] border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] cursor-pointer flex items-center gap-1"
                >
                  <span>✏️ Editar consulta</span>
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="neo-btn px-2 py-1 bg-[#FAF7EE] hover:bg-white text-[#1A1A1A] text-[11px] font-black rounded-xl border-[1.5px] border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] cursor-pointer hidden xs:inline-flex items-center gap-1"
                  title="Empezar una nueva tarea desde cero"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Nueva tarea</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Selector Maestro de Materias Escolares (Paso 1) */}
              <div className="bg-white rounded-2xl border-[2.5px] border-[#1A1A1A] shadow-[4px_4px_0px_#1A1A1A] p-4">
                <SubjectSelector
                  selectedSubjectId={selectedSubjectId}
                  onSelectSubject={handleSelectSubject}
                  gradeLevel={gradeLevel}
                  disabled={isLoading || isExhausted}
                />
              </div>

              {/* Zona de Entrada Dual (Texto + Foto de cuaderno o PDF) */}
              <InputZone
                text={textInput}
                onTextChange={(t) => {
                  setTextInput(t);
                  setErrorMessage(null);
                }}
                imageFile={imageFile}
                onImageChange={(f) => {
                  setImageFile(f);
                  setErrorMessage(null);
                }}
                placeholder={getSubjectById(selectedSubjectId).placeholderText}
                disabled={isLoading || isExhausted}
                isMediaRelevant={isSubjectVisualOrFormula(selectedSubjectId)}
              />

              {/* Selector de Tareas Interactivo adaptado por materia */}
              <div className="bg-white rounded-2xl border-[2.5px] border-[#1A1A1A] shadow-[4px_4px_0px_#1A1A1A] p-4">
                <TaskSelector
                  selectedTasks={selectedTasks}
                  onToggleTask={handleToggleTask}
                  subjectId={selectedSubjectId}
                  disabled={isLoading || isExhausted}
                />
              </div>

              {/* Selector de Profundidad de Respuesta (⚡ Resumido vs 📚 Detallado y Extenso) */}
              <div className="bg-white rounded-2xl border-[2.5px] border-[#1A1A1A] shadow-[4px_4px_0px_#1A1A1A] p-4">
                <ResponseDepthSelector
                  responseDepth={responseDepth}
                  onChange={(depth) => setResponseDepth(depth)}
                  gradeLevel={gradeLevel}
                  disabled={isLoading || isExhausted}
                />
              </div>

              {/* Mensaje de Error si ocurre alguno */}
              {errorMessage && (
                <div className="flex items-start gap-3 p-4 bg-[#FF8B94] rounded-2xl border-[2.5px] border-[#1A1A1A] shadow-[4px_4px_0px_#1A1A1A] text-xs sm:text-sm font-black text-[#1A1A1A]">
                  <AlertCircle className="w-5 h-5 text-red-950 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="leading-tight">{errorMessage}</p>
                    {!currentUser ? (
                      <button
                        onClick={() => setIsLoginModalOpen(true)}
                        className="mt-1.5 text-xs font-black underline text-[#1A1A1A] hover:text-white cursor-pointer"
                      >
                        Haz clic aquí para identificarte con Google
                      </button>
                    ) : isExhausted ? (
                      <button
                        onClick={() => setIsTrialBlockedModalOpen(true)}
                        className="mt-1.5 text-xs font-black underline text-[#1A1A1A] hover:text-white cursor-pointer"
                      >
                        Haz clic aquí para ver cómo activar tu suscripción escolar
                      </button>
                    ) : null}
                  </div>
                </div>
              )}

              {/* Botón de Envío: "Revisar tarea" con animación interactiva - Centrado armónico */}
              <div className="pt-2 flex flex-col items-center justify-center gap-3 text-center">
                <div className="flex items-center justify-center gap-3 w-full sm:w-auto flex-wrap sm:flex-nowrap">
                  {(textInput || imageFile || result) && (
                    <button
                      type="button"
                      onClick={handleReset}
                      disabled={isLoading}
                      className="neo-btn px-5 py-3.5 bg-white hover:bg-[#FAF7EE] text-[#1A1A1A] text-sm font-black rounded-xl cursor-pointer flex items-center justify-center gap-2 w-full sm:w-auto shadow-[3px_3px_0px_#1A1A1A]"
                      title="Limpiar formulario y empezar de nuevo"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Limpiar todo</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleSubmitReview}
                    disabled={isLoading || !isAtLeastOneTaskSelected || !hasInput || isExhausted}
                    className={`neo-btn w-full sm:w-auto px-8 py-4 text-base sm:text-lg font-black rounded-2xl cursor-pointer flex items-center justify-center gap-2.5 shadow-[4px_4px_0px_#1A1A1A] disabled:opacity-50 transition-all ${
                      isExhausted
                        ? 'bg-gray-300 text-gray-700 cursor-not-allowed'
                        : gradeLevel === 'primaria'
                        ? 'bg-[#FFE66D] hover:bg-[#fedd48] text-[#1A1A1A]'
                        : 'bg-[#A0E7E5] hover:bg-[#8be0dd] text-[#1A1A1A]'
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <Sparkles className="w-5 h-5 animate-spin text-[#1A1A1A]" />
                        <span>Revisando tu cuaderno...</span>
                      </>
                    ) : isExhausted ? (
                      <span>Prueba completada (0 usos) 🚫</span>
                    ) : (
                      <>
                        <Send className="w-5 h-5 text-[#1A1A1A]" />
                        <span>
                          {gradeLevel === 'primaria'
                            ? '¡Revisar mi tarea ahora! 🚀'
                            : 'Analizar y resolver tarea 🚀'}
                        </span>
                      </>
                    )}
                  </button>
                </div>

                <div className="text-xs font-bold text-[#1A1A1A]/75 flex items-center justify-center gap-2 flex-wrap">
                  <span>
                    Modo activo:{' '}
                    <strong className="text-[#1A1A1A]">
                      {gradeLevel === 'primaria' ? '🎒 Primaria' : '📐 Bachillerato'}
                    </strong>{' '}
                    · Materia:{' '}
                    <strong className="text-[#1A1A1A]">{getSubjectById(selectedSubjectId).shortName}</strong>{' '}
                    · Explicación:{' '}
                    <strong className="text-[#1A1A1A]">
                      {responseDepth === 'detailed' ? '📚 Detallada y Extensa' : '⚡ Resumida y Rápida'}
                    </strong>
                  </span>
                </div>
              </div>
            </>
          )}
          </div>

          {/* Estado de Carga con Mensajes Rotativos */}
          {isLoading && <LoadingState />}

          {/* Contenedor de Resultados Escolares */}
          {result && (
            <div ref={resultsRef} className="pt-2 space-y-6">
              {/* Si la consulta fue bloqueada por no corresponder al contexto escolar */}
              {result.isSchoolRelated === false ? (
                <SchoolGuardrailCard
                  rejectionReason={result.rejectionReason}
                  onReset={() => {
                    setResult(null);
                    setIsFormCollapsed(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              ) : (
                <>
                  {/* Celebración animada con lluvia de estrellas al completar la tarea */}
                  <CelebrationBurst
                    triggerKey={result.timestamp}
                    gradeLevel={gradeLevel}
                    subjectName={getSubjectById(selectedSubjectId).shortName}
                  />

                  {/* Componente modular de Resultados con pestañas anti-fatiga de scroll */}
                  <ResultsDisplay
                    result={result}
                    reloadedNotice={reloadedNotice}
                    onClearReloadedNotice={() => setReloadedNotice(null)}
                    currentUser={currentUser}
                    selectedSubjectId={selectedSubjectId}
                    gradeLevel={gradeLevel}
                    copiedSuccess={copiedSuccess}
                    onCopyNotes={handleCopyNotes}
                    onPrint={handlePrint}
                  />
                </>
              )}
            </div>
          )}
        </main>

        {/* Pie de página con blindaje legal, privacidad y soporte */}
        <footer className="mt-16 pt-6 border-t-2 border-dashed border-[#1A1A1A]/30 text-center text-xs font-bold text-[#1A1A1A]/80 space-y-3">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 rounded bg-[#FFE66D] border border-[#1A1A1A]">
              ✏️ Tutor-IA
            </span>
            <span>•</span>
            <span>Herramienta pedagógica para Primaria y Secundaria</span>
            <span>•</span>
            <span className="px-2 py-0.5 rounded bg-[#A8E6CF] border border-[#1A1A1A]">
              Tutor Pedagógico de Lengua
            </span>
          </div>

          {/* Enlaces Legales y de Soporte */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap pt-1">
            <button
              onClick={() => {
                setLegalModalTab('terms');
                setIsLegalModalOpen(true);
              }}
              className="neo-btn px-2.5 py-1 bg-white hover:bg-[#FFE66D] rounded-lg border border-[#1A1A1A] text-[11px] font-bold text-[#1A1A1A] cursor-pointer shadow-[2px_2px_0px_#1A1A1A]"
            >
              📄 Términos y Uso Personal
            </button>

            <button
              onClick={() => {
                setLegalModalTab('privacy');
                setIsLegalModalOpen(true);
              }}
              className="neo-btn px-2.5 py-1 bg-white hover:bg-[#A8E6CF] rounded-lg border border-[#1A1A1A] text-[11px] font-bold text-[#1A1A1A] cursor-pointer shadow-[2px_2px_0px_#1A1A1A]"
            >
              🔒 Privacidad y Menores (Habeas Data)
            </button>

            <button
              onClick={() => {
                setLegalModalTab('support');
                setIsLegalModalOpen(true);
              }}
              className="neo-btn px-2.5 py-1 bg-white hover:bg-[#A0E7E5] rounded-lg border border-[#1A1A1A] text-[11px] font-bold text-[#1A1A1A] cursor-pointer shadow-[2px_2px_0px_#1A1A1A]"
            >
              🎧 Contacto y Soporte
            </button>
          </div>

          {/* Descargo legal pedagógico preventivo */}
          <p className="text-[11px] text-[#1A1A1A]/60 font-medium max-w-2xl mx-auto leading-relaxed pt-1">
            <strong>Aviso Legal & Pedagógico:</strong> Tutor-IA es un tutor escolar complementario con Inteligencia Artificial. Su uso es estrictamente personal e individual para la realización de tareas escolares. No sustituye la labor de los docentes de aula ni certifica calificaciones oficiales.
          </p>
        </footer>
      </div>
    </div>
  );
}
