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
  loginWithGoogle,
  logout,
} from './services/firebase';
import { HomePage } from './components/HomePage';
import { HamsterLoadingTransition } from './components/HamsterLoadingTransition';
import { LogoutLoadingTransition } from './components/LogoutLoadingTransition';
import { StickyNavbar, HeroBanner } from './components/Header';
import { InputZone } from './components/InputZone';
import { SubjectsSidebar } from './components/SubjectsSidebar';
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
  const [currentView, setCurrentView] = useState<'home' | 'workspace'>('home');
  const [isSigningInGoogle, setIsSigningInGoogle] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (e) {
      console.error('Error al cerrar sesión:', e);
    } finally {
      setTimeout(() => {
        setCurrentUser(null);
        setCurrentView('home');
        setIsLoggingOut(false);
      }, 2000);
    }
  };

  // Si el usuario inicia sesión o ya está autenticado, llevarlo al espacio de trabajo (workspace)
  useEffect(() => {
    if (currentUser) {
      setCurrentView('workspace');
    } else {
      setCurrentView('home');
    }
  }, [currentUser]);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<HomeworkReviewResult | null>(null);
  const [isFormCollapsed, setIsFormCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isCollapsedDesktop, setIsCollapsedDesktop] = useState(false);

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

    // 0.1 Blindaje de Acceso: Si el usuario ya agotó sus 3 pruebas y no tiene días de suscripción activa
    if (isExhausted) {
      setIsTrialBlockedModalOpen(true);
      return;
    }

    // 2. Asignación Inteligente de Casillas (Paso 3):
    // Si la consulta es una pregunta de indagación conceptual o explicativa:
    const effectiveTasks: SelectedTasks = { ...selectedTasks };
    const queryText = textInput.trim().toLowerCase();
    const isExplanatoryQuery = /(\bqui[eé]n\b|\bqu[eé]\b|\bcu[aá]l\b|\bcu[aá]les\b|\bc[oó]mo\b|\bpor\s+qu[eé]\b|\bd[oó]nde\b|\bbiograf[ií]a\b|\bexplica\b|\bexpl[ií]came\b|\bresumen\b|\bconcepto\b|\bdefinici[oó]n\b|\bliteratura\b|\bhistoria\b)/i.test(queryText);

    const hasCorePedagogicalTask = Boolean(
      effectiveTasks.explanation ||
      effectiveTasks.step_by_step ||
      effectiveTasks.summary ||
      effectiveTasks.correction ||
      effectiveTasks.quiz_guide
    );

    if (isExplanatoryQuery) {
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

    // Timeout de seguridad: asegura que la interfaz NUNCA se quede en carga infinita
    const safetyTimer = setTimeout(() => {
      setIsLoading(false);
      setErrorMessage('La consulta tardó más de lo esperado en responder. Por favor intenta nuevamente.');
    }, 15000);

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
      clearTimeout(safetyTimer);
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
  const isAdmin = currentUser?.role === 'admin' || currentUser?.email?.toLowerCase() === 'dgcontrerasb@gmail.com';
  const isExhausted = Boolean(
    currentUser &&
    !isAdmin &&
    !usage.isSubscriptionActive &&
    !usage.isTrialActive
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 selection:bg-indigo-100">
      {/* 1. Transición de Inicio de Sesión (Hámster) */}
      {isSigningInGoogle ? (
        <HamsterLoadingTransition message="Iniciando sesión con Google..." />
      ) : isLoggingOut ? (
        /* 2. Transición de Cierre de Sesión (Círculos Rebotando) */
        <LogoutLoadingTransition />
      ) : currentView === 'home' || !currentUser ? (
        <>
          <HomePage
            onLoginWithGoogle={async () => {
              setIsSigningInGoogle(true);
              try {
                const profile = await loginWithGoogle();
                setCurrentUser(profile);
                setUsage(getUserUsageFromProfile(profile));
                setTimeout(() => {
                  setCurrentView('workspace');
                  setIsSigningInGoogle(false);
                }, 1600);
              } catch (e) {
                console.error('Error al iniciar sesión con Google:', e);
                setIsSigningInGoogle(false);
              }
            }}
            onEnterWorkspace={() => setCurrentView('workspace')}
            isLoggedIn={Boolean(currentUser)}
            userName={currentUser?.displayName || currentUser?.email?.split('@')[0]}
            isTrialActive={usage.isTrialActive}
            trialHoursRemaining={usage.trialHoursRemaining}
            isSubscriptionActive={usage.isSubscriptionActive}
            isAdmin={isAdmin}
          />
          <PaymentModal
            isOpen={isPaymentModalOpen}
            onClose={() => setIsPaymentModalOpen(false)}
            onGoHome={() => {
              setIsPaymentModalOpen(false);
              setCurrentView('home');
            }}
            userEmail={currentUser?.email}
            userUid={currentUser?.uid}
            userName={currentUser?.displayName}
            onCheckActivation={handleRefreshProfile}
          />
        </>
      ) : (
        <div className="pb-16">
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
            onGoHome={() => setCurrentView('home')}
            onLogout={handleLogout}
          />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-3 sm:pt-4">
        {/* Modal para solicitar inicio de sesión */}
        <LoginPromptModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
        />

        {/* Modal de Bloqueo tras consumir el día de prueba (Punto 3) */}
        <TrialBlockedModal
          isOpen={(isTrialBlockedModalOpen || isExhausted) && !isPaymentModalOpen}
          onClose={() => {
            setIsTrialBlockedModalOpen(false);
          }}
          onGoHome={() => {
            setIsTrialBlockedModalOpen(false);
            setIsPaymentModalOpen(false);
            setCurrentView('home');
          }}
          onOpenPayment={() => {
            setIsTrialBlockedModalOpen(false);
            setIsPaymentModalOpen(true);
          }}
        />

        {/* Modal de Pago vía WhatsApp con QR de $10.000 COP y Canje de Código (Punto 4) */}
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          onGoHome={() => {
            setIsPaymentModalOpen(false);
            setIsTrialBlockedModalOpen(false);
            setCurrentView('home');
          }}
          userEmail={currentUser?.email}
          userUid={currentUser?.uid}
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

        {/* Contenedor Principal: Sidebar Izquierda + Área Central */}
        <div className={`flex flex-col lg:flex-row gap-5 items-start transition-all ${isExhausted ? 'filter blur-xs pointer-events-none select-none opacity-60' : ''}`}>
          {/* Panel Lateral Izquierdo de Materias Escolares */}
          <SubjectsSidebar
            selectedSubjectId={selectedSubjectId}
            onSelectSubject={handleSelectSubject}
            gradeLevel={gradeLevel}
            isOpenMobile={isMobileSidebarOpen}
            onCloseMobile={() => setIsMobileSidebarOpen(false)}
            isCollapsedDesktop={isCollapsedDesktop}
            onToggleCollapseDesktop={() => setIsCollapsedDesktop((prev) => !prev)}
            disabled={isLoading || isExhausted}
          />

          {/* Área Central de Trabajo */}
          <main className="flex-1 min-w-0 w-full space-y-4">
            {/* Acceso Rápido a Materias en Móvil (Solo pantallas pequeñas) */}
            <div className="lg:hidden flex items-center justify-between p-3 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-base shrink-0 shadow-xs"
                  style={{ backgroundColor: getSubjectById(selectedSubjectId).color }}
                >
                  {getSubjectById(selectedSubjectId).icon}
                </span>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block leading-none">
                    Materia escolar activa
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-slate-800 truncate block">
                    {getSubjectById(selectedSubjectId).name}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsMobileSidebarOpen(true)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors"
              >
                <span>Cambiar</span>
                <span className="text-xs">▾</span>
              </button>
            </div>

            {/* Banner Hero Escolar Compacto Bento */}
            <HeroBanner
              gradeLevel={gradeLevel}
              onGradeLevelChange={setGradeLevel}
              selectedSubjectId={selectedSubjectId}
              isLoading={isLoading}
            />

            <div className="no-print">
              {/* Colapso Inteligente al recibir el resultado */}
              {isFormCollapsed && result ? (
                <div className="mb-4">
                  <div className="h-[48px] max-h-[50px] px-3.5 py-1.5 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-2 transition-all">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span
                        className="px-2 py-0.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-800 shrink-0 flex items-center gap-1 shadow-xs"
                        style={{ backgroundColor: getSubjectById(selectedSubjectId).color }}
                      >
                        <span>{getSubjectById(selectedSubjectId).icon}</span>
                        <span>{getSubjectById(selectedSubjectId).shortName}</span>
                      </span>
                      <span className="text-xs font-medium text-slate-600 truncate">
                        {textInput.trim()
                          ? textInput.trim().length > 40
                            ? `${textInput.trim().slice(0, 40)}...`
                            : textInput.trim()
                          : imageFile
                          ? `📸 ${imageFile.name.slice(0, 30)}`
                          : 'Consulta escolar analizada'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setIsFormCollapsed(false)}
                        className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-200 cursor-pointer flex items-center gap-1 transition-colors"
                      >
                        <span>✏️ Editar</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleReset}
                        className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-600 text-xs font-medium rounded-xl border border-slate-200 cursor-pointer hidden xs:inline-flex items-center gap-1 transition-colors"
                        title="Empezar una nueva tarea desde cero"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Nueva</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Tarjeta Bento 1: Entrada de Tarea */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 transition-all">
                    <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-600 border border-indigo-100 text-xs font-bold">
                          Tu Consulta
                        </span>
                        <h3 className="text-sm font-bold text-slate-800">
                          {getSubjectById(selectedSubjectId).name}
                        </h3>
                      </div>
                      <span className="text-xs text-slate-400 hidden sm:inline">
                        Texto o foto de tu cuaderno
                      </span>
                    </div>

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
                  </div>

                  {/* Tarjeta Bento 2: Opciones de Resolución (Dual Grid) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Selector de Tareas Adaptado */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 transition-all">
                      <TaskSelector
                        selectedTasks={selectedTasks}
                        onToggleTask={handleToggleTask}
                        subjectId={selectedSubjectId}
                        disabled={isLoading || isExhausted}
                      />
                    </div>

                    {/* Selector de Profundidad */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 transition-all">
                      <ResponseDepthSelector
                        responseDepth={responseDepth}
                        onChange={(depth) => setResponseDepth(depth)}
                        gradeLevel={gradeLevel}
                        disabled={isLoading || isExhausted}
                      />
                    </div>
                  </div>

                  {/* Mensaje de Error si ocurre alguno */}
                  {errorMessage && (
                    <div className="flex items-start gap-3 p-4 bg-red-50 rounded-2xl border border-red-200 shadow-xs text-xs sm:text-sm font-semibold text-red-900">
                      <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="leading-tight">{errorMessage}</p>
                        {!currentUser ? (
                          <button
                            onClick={() => setIsLoginModalOpen(true)}
                            className="mt-1.5 text-xs font-bold underline text-red-700 hover:text-red-900 cursor-pointer"
                          >
                            Haz clic aquí para identificarte con Google
                          </button>
                        ) : isExhausted ? (
                          <button
                            onClick={() => setIsTrialBlockedModalOpen(true)}
                            className="mt-1.5 text-xs font-bold underline text-red-700 hover:text-red-900 cursor-pointer"
                          >
                            Haz clic aquí para ver cómo activar tu suscripción escolar
                          </button>
                        ) : null}
                      </div>
                    </div>
                  )}

                  {/* Barra de Envío Bento */}
                  <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-3">
                    <div className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
                      {(textInput || imageFile || result) && (
                        <button
                          type="button"
                          onClick={handleReset}
                          disabled={isLoading}
                          className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer flex items-center justify-center gap-1.5 transition-colors shrink-0"
                          title="Limpiar formulario"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Limpiar</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={handleSubmitReview}
                        disabled={isLoading || !isAtLeastOneTaskSelected || !hasInput || isExhausted}
                        className={`flex-1 py-3 px-6 text-sm sm:text-base font-bold rounded-xl cursor-pointer flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 transition-all ${
                          isExhausted
                            ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100'
                        }`}
                      >
                        {isLoading ? (
                          <>
                            <Sparkles className="w-5 h-5 animate-spin text-white" />
                            <span>Revisando tu tarea...</span>
                          </>
                        ) : isExhausted ? (
                          <span>Prueba completada (0 usos) 🚫</span>
                        ) : (
                          <>
                            <Send className="w-5 h-5 text-white" />
                            <span>
                              {gradeLevel === 'primaria'
                                ? 'Revisar mi tarea ahora'
                                : 'Analizar y resolver tarea'}
                            </span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="text-xs text-slate-400 flex items-center justify-between gap-2 flex-wrap pt-2 border-t border-slate-100">
                      <span>
                        Materia: <strong className="text-slate-600">{getSubjectById(selectedSubjectId).shortName}</strong>
                      </span>
                      <span>
                        Modo: <strong className="text-slate-600">{responseDepth === 'detailed' ? 'Detallado' : 'Resumido'}</strong>
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Estado de Carga con Mensajes Rotativos (Único) */}
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
        </div>

        {/* Pie de página con blindaje legal, privacidad y soporte */}
        <footer className="mt-16 pt-8 pb-10 border-t border-slate-200 text-center text-xs text-slate-600 space-y-4">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200/60 font-semibold text-indigo-700">
              ✏️ Tutor-IA
            </span>
            <span className="text-slate-300">•</span>
            <span className="font-medium text-slate-700">Herramienta pedagógica para Primaria y Secundaria</span>
            <span className="text-slate-300">•</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200/60 font-semibold text-emerald-700">
              Todas las materias escolares (18 asignaturas)
            </span>
          </div>

          {/* Enlaces Legales y de Soporte */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap pt-1">
            <button
              onClick={() => {
                setLegalModalTab('terms');
                setIsLegalModalOpen(true);
              }}
              className="px-3 py-1.5 bg-white hover:bg-slate-50 active:scale-95 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 cursor-pointer shadow-xs transition-all hover:border-slate-300 hover:text-indigo-600"
            >
              📄 Términos y Condiciones
            </button>

            <button
              onClick={() => {
                setLegalModalTab('privacy');
                setIsLegalModalOpen(true);
              }}
              className="px-3 py-1.5 bg-white hover:bg-slate-50 active:scale-95 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 cursor-pointer shadow-xs transition-all hover:border-slate-300 hover:text-indigo-600"
            >
              🔒 Privacidad y Menores (Habeas Data)
            </button>

            <button
              onClick={() => {
                setLegalModalTab('support');
                setIsLegalModalOpen(true);
              }}
              className="px-3 py-1.5 bg-white hover:bg-slate-50 active:scale-95 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 cursor-pointer shadow-xs transition-all hover:border-slate-300 hover:text-indigo-600"
            >
              🎧 Contacto y Soporte
            </button>
          </div>

          {/* Descargo legal pedagógico preventivo */}
          <p className="text-[11px] text-slate-500 font-normal max-w-2xl mx-auto leading-relaxed pt-1">
            <strong className="font-semibold text-slate-700">Aviso Legal & Pedagógico:</strong> Tutor-IA es un asistente inteligente de apoyo escolar complementario multidisciplinar (matemáticas, ciencias, humanidades y artes). Su uso es personal, individual y con fines formativos. No sustituye la labor de los docentes de aula ni certifica o garantiza calificaciones académicas oficiales.
          </p>
        </footer>
      </div>
    </div>
      )}
    </div>
  );
}
