/**
 * Tutor-IA - Aplicación Web para Corrección Ortográfica,
 * Resumen y Análisis de Textos y Tareas Escolares.
 *
 * Estilo Neubrutalismo Lúdico / Tutor-IA
 * Punto 3: 3 consultas de prueba gratuitas para usuarios nuevos y bloqueo al consumirlas.
 */

import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
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
import { StickyNavbar } from './components/Header';
import { InputZone } from './components/InputZone';
import { SubjectsSidebar } from './components/SubjectsSidebar';
import { TaskSelector } from './components/TaskSelector';
import { ResponseDepthSelector } from './components/ResponseDepthSelector';
import { LoadingState } from './components/LoadingState';
import { ResultsDisplay } from './components/ResultsDisplay';
import type { LegalTab } from './components/LegalModal';
import { SchoolGuardrailCard } from './components/SchoolGuardrailCard';
import {
  RecentHomeworksHistory,
  saveHomeworkToHistory,
  SavedHomeworkItem,
} from './components/RecentHomeworksHistory';
import { getSubjectById, isSubjectVisualOrFormula } from './data/schoolSubjects';
import { getCleanDisplayName } from './components/AuthBar';
import { CelebrationBurst } from './components/CelebrationBurst';
import { useModals } from './hooks/useModals';
import { useAuthUser } from './hooks/useAuthUser';

// Carga diferida de modales pesados (reduce el bundle inicial separando jsPDF, html2canvas y paneles)
const LoginPromptModal = lazy(() => import('./components/LoginPromptModal').then((m) => ({ default: m.LoginPromptModal })));
const TrialBlockedModal = lazy(() => import('./components/TrialBlockedModal').then((m) => ({ default: m.TrialBlockedModal })));
const PaymentModal = lazy(() => import('./components/PaymentModal').then((m) => ({ default: m.PaymentModal })));
const AdminPanelModal = lazy(() => import('./components/AdminPanelModal').then((m) => ({ default: m.AdminPanelModal })));
const LegalModal = lazy(() => import('./components/LegalModal').then((m) => ({ default: m.LegalModal })));
const PrintModal = lazy(() => import('./components/PrintModal').then((m) => ({ default: m.PrintModal })));
const DiagnosticModal = lazy(() => import('./components/DiagnosticModal').then((m) => ({ default: m.DiagnosticModal })));
const OnboardingTourModal = lazy(() => import('./components/OnboardingTourModal').then((m) => ({ default: m.OnboardingTourModal })));

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
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  // Disparar el tour inicial ÚNICAMENTE cuando el usuario ha iniciado sesión en el workspace por primera vez
  useEffect(() => {
    if (!currentUser || authLoading || currentView !== 'workspace' || isSigningInGoogle || isLoggingOut) {
      return;
    }
    try {
      const storageKey = `tutor_ia_onboarding_seen_${currentUser.uid}`;
      if (localStorage.getItem(storageKey) !== 'true') {
        setIsOnboardingOpen(true);
      }
    } catch {
      // Ignorar si localStorage no está disponible
    }
  }, [currentUser, authLoading, currentView, isSigningInGoogle, isLoggingOut]);

  const handleCloseOnboarding = () => {
    setIsOnboardingOpen(false);
    if (currentUser?.uid) {
      try {
        localStorage.setItem(`tutor_ia_onboarding_seen_${currentUser.uid}`, 'true');
      } catch {}
    }
  };

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
            onOpenTour={() => setIsOnboardingOpen(true)}
          />

      <div className="max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 pt-3 sm:pt-4">
        <Suspense fallback={null}>
          {/* Modal para solicitar inicio de sesión */}
          {isLoginModalOpen && (
            <LoginPromptModal
              isOpen={isLoginModalOpen}
              onClose={() => setIsLoginModalOpen(false)}
            />
          )}

          {/* Modal de Bloqueo tras consumir el día de prueba (Punto 3) */}
          {((isTrialBlockedModalOpen || isExhausted) && !isPaymentModalOpen) && (
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
          )}

          {/* Modal de Pago vía WhatsApp con QR de $10.000 COP y Canje de Código (Punto 4) */}
          {isPaymentModalOpen && (
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
          )}

          {/* Panel de Control de Administrador (Punto 5) */}
          {isAdminModalOpen && (
            <AdminPanelModal
              isOpen={isAdminModalOpen}
              onClose={() => setIsAdminModalOpen(false)}
              adminEmail={currentUser?.email}
            />
          )}

          {/* Modal de Aspectos Legales, Privacidad y Soporte */}
          {isLegalModalOpen && (
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
          )}

          {/* Modal de Impresión y Exportación a PDF Escolar */}
          {isPrintModalOpen && (
            <PrintModal
              isOpen={isPrintModalOpen}
              onClose={() => setIsPrintModalOpen(false)}
              result={result}
              subjectName={getSubjectById(selectedSubjectId).name}
              gradeLevel={gradeLevel}
              studentName={getCleanDisplayName(currentUser)}
              onCopyAllText={handleCopyNotes}
            />
          )}

          {/* Guía rápida inicial (solo autenticados, primera vez o reabierta manualmente) */}
          {isOnboardingOpen && currentUser && (
            <OnboardingTourModal
              isOpen={isOnboardingOpen}
              onClose={handleCloseOnboarding}
              studentName={getCleanDisplayName(currentUser).split(' ')[0]}
            />
          )}

          {/* Componente Flotante de Diagnóstico Visual (Solo Administrador) */}
          {(currentUser?.role === 'admin' || currentUser?.email?.toLowerCase() === 'dgcontrerasb@gmail.com') && (
            <DiagnosticModal />
          )}
        </Suspense>

        {/* Botón Flotante y Modal 'Mi Cuaderno de Repaso' (Consultas Guardadas) */}
        <RecentHomeworksHistory
          onSelectSavedHomework={handleSelectSavedHomework}
          gradeLevel={gradeLevel}
        />

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
            <div data-tour="subjects" className="lg:hidden flex items-center justify-between p-3 bg-white rounded-2xl border border-slate-200 shadow-xs">
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

            {/* Dual-Pane Studio Layout (Axiom AI / Claude Canvas) — Proporción equilibrada 50/50 sin scroll forzado */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* Panel Izquierdo: Tarjeta Unificada de Entrada y Controles (lg:col-span-6) */}
              <div className="lg:col-span-6 space-y-4 no-print">
                {/* En móvil (< lg), si ya hay resultado y el formulario está colapsado, muestra la barra compacta */}
                {isFormCollapsed && result ? (
                  <div className="lg:hidden mb-2">
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
                            ? textInput.trim().length > 30
                              ? `${textInput.trim().slice(0, 30)}...`
                              : textInput.trim()
                            : imageFile
                            ? `📸 ${imageFile.name.slice(0, 25)}`
                            : 'Consulta escolar analizada'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => setIsFormCollapsed(false)}
                          className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl border border-blue-200 cursor-pointer flex items-center gap-1 transition-colors"
                        >
                          <span>✏️ Editar</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleReset}
                          className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-600 text-xs font-medium rounded-xl border border-slate-200 cursor-pointer inline-flex items-center gap-1 transition-colors"
                          title="Empezar una nueva tarea desde cero"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Nueva</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* Tarjeta Studio Unificada: Cabecera de Materia + Nivel + Input + Opciones + Acción */}
                <div className={`${isFormCollapsed && result ? 'hidden lg:block' : 'block'}`}>
                  <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-5 space-y-4">
                    {/* Cabecera compacta integrada (sin Banner redundante) */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-base shrink-0 shadow-2xs"
                          style={{ backgroundColor: getSubjectById(selectedSubjectId).color }}
                        >
                          {getSubjectById(selectedSubjectId).icon}
                        </span>
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block leading-none">
                            Tu Consulta
                          </span>
                          <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-tight mt-0.5">
                            {getSubjectById(selectedSubjectId).name}
                          </h2>
                        </div>
                      </div>

                      {/* Switch compacto de Nivel Escolar (Primaria / Bachillerato) */}
                      <div data-tour="grade-level" className="inline-flex items-center p-0.5 bg-slate-100 rounded-xl border border-slate-200/80 text-[11px] font-bold shrink-0">
                        <button
                          type="button"
                          onClick={() => setGradeLevel('primaria')}
                          disabled={isLoading || isExhausted}
                          className={`px-2.5 py-1 rounded-lg cursor-pointer transition-all ${
                            gradeLevel === 'primaria'
                              ? 'bg-white text-blue-700 shadow-2xs border border-blue-100'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          🎒 Primaria
                        </button>
                        <button
                          type="button"
                          onClick={() => setGradeLevel('secundaria')}
                          disabled={isLoading || isExhausted}
                          className={`px-2.5 py-1 rounded-lg cursor-pointer transition-all ${
                            gradeLevel === 'secundaria'
                              ? 'bg-white text-blue-700 shadow-2xs border border-blue-100'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          🎓 Secundaria
                        </button>
                      </div>
                    </div>

                    {/* Zona de Entrada (Texto + Foto) */}
                    <div data-tour="input-zone">
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

                    {/* Opciones + Botón principal agrupados para el Tour */}
                    <div data-tour="options-submit" className="space-y-4">
                      {/* Separador sutil + Selector de Tareas en chips compactos */}
                      <div className="pt-3 border-t border-slate-100">
                        <TaskSelector
                          selectedTasks={selectedTasks}
                          onToggleTask={handleToggleTask}
                          subjectId={selectedSubjectId}
                          disabled={isLoading || isExhausted}
                        />
                      </div>

                      {/* Selector de Profundidad (Control Segmentado sin solapamientos) */}
                      <div className="pt-3 border-t border-slate-100">
                        <ResponseDepthSelector
                          responseDepth={responseDepth}
                          onChange={(depth) => setResponseDepth(depth)}
                          gradeLevel={gradeLevel}
                          disabled={isLoading || isExhausted}
                        />
                      </div>

                      {/* Mensaje de Error si ocurre */}
                      {errorMessage && (
                        <div className="flex items-start gap-2.5 p-3 bg-red-50 rounded-xl border border-red-200 text-xs font-semibold text-red-900">
                          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                          <p className="leading-snug flex-1">{errorMessage}</p>
                        </div>
                      )}

                      {/* Botón Principal de Acción Integrado */}
                      <div className="pt-2 flex items-center gap-2.5">
                        {(textInput || imageFile || result) && (
                          <button
                            type="button"
                            onClick={handleReset}
                            disabled={isLoading}
                            className="px-3.5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer flex items-center justify-center gap-1.5 transition-colors shrink-0"
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
                          className={`flex-1 py-3 px-5 text-sm sm:text-base font-bold rounded-xl cursor-pointer flex items-center justify-center gap-2 shadow-md disabled:opacity-50 transition-all active:scale-[0.99] ${
                            isExhausted
                              ? 'bg-slate-200 text-slate-500 cursor-not-allowed shadow-none'
                              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-200/80'
                          }`}
                        >
                          {isLoading ? (
                            <>
                              <Sparkles className="w-4 h-4 animate-spin text-white" />
                              <span>Revisando tu tarea...</span>
                            </>
                          ) : isExhausted ? (
                            <span>Prueba completada (0 usos) 🚫</span>
                          ) : (
                            <>
                              <Send className="w-4 h-4 text-white" />
                              <span>
                                {gradeLevel === 'primaria'
                                  ? 'Revisar mi tarea ahora'
                                  : 'Analizar y resolver tarea'}
                              </span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Panel Derecho: Ficha Interactiva de Estudio / Live Canvas (lg:col-span-6, Sticky en escritorio) */}
              <div className="lg:col-span-6 lg:sticky lg:top-20 space-y-4">
                {isLoading ? (
                  <LoadingState />
                ) : result ? (
                  <div ref={resultsRef} className="space-y-4">
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
                        <CelebrationBurst
                          triggerKey={result.timestamp}
                          gradeLevel={gradeLevel}
                          subjectName={getSubjectById(selectedSubjectId).shortName}
                        />

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
                ) : (
                  /* Estado Vacío Minimalista — Solo visible en escritorio (oculto en móvil para no ocupar espacio innecesario) */
                  <div className="hidden lg:flex flex-col items-center justify-center text-center bg-white/70 rounded-2xl border border-dashed border-slate-300/90 p-10 min-h-[420px] space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center text-2xl shadow-2xs">
                      📓
                    </div>
                    <div className="max-w-sm space-y-1.5">
                      <h3 className="text-base font-bold text-slate-800">
                        Tu ficha de estudio aparecerá aquí
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Escribe tu consulta o sube una foto de tu cuaderno en el panel izquierdo y presiona{' '}
                        <strong className="text-slate-700">
                          {gradeLevel === 'primaria' ? 'Revisar mi tarea ahora' : 'Analizar y resolver tarea'}
                        </strong>{' '}
                        para ver la explicación paso a paso.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>

        {/* Pie de página compacto con logotipo oficial preservado */}
        <footer className="mt-6 pt-4 pb-20 lg:pb-6 border-t border-slate-200/80 text-center text-xs text-slate-500 space-y-2.5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
            {/* Logotipo oficial intacto */}
            <div className="flex items-center gap-2.5">
              <img
                src="/logo_full.jpg"
                alt="Tutor-IA"
                className="h-7 w-auto object-contain select-none"
                draggable={false}
              />
              <span className="hidden md:inline text-[11px] text-slate-400">
                • Apoyo escolar en 18 asignaturas (Primaria y Secundaria)
              </span>
            </div>

            {/* Enlaces legales compactos en una sola fila */}
            <div className="flex items-center justify-center gap-3 text-[11px] font-semibold text-slate-600">
              <button
                type="button"
                onClick={() => {
                  setLegalModalTab('terms');
                  setIsLegalModalOpen(true);
                }}
                className="hover:text-blue-600 cursor-pointer transition-colors"
              >
                Términos
              </button>
              <span className="text-slate-300">·</span>
              <button
                type="button"
                onClick={() => {
                  setLegalModalTab('privacy');
                  setIsLegalModalOpen(true);
                }}
                className="hover:text-blue-600 cursor-pointer transition-colors"
              >
                Privacidad
              </button>
              <span className="text-slate-300">·</span>
              <button
                type="button"
                onClick={() => {
                  setLegalModalTab('support');
                  setIsLegalModalOpen(true);
                }}
                className="hover:text-blue-600 cursor-pointer transition-colors"
              >
                Soporte
              </button>
            </div>
          </div>

          <p className="text-[10px] sm:text-[11px] text-slate-400 leading-snug max-w-3xl mx-auto">
            Asistente de apoyo escolar complementario con fines formativos. No sustituye la labor docente ni garantiza calificaciones oficiales.
          </p>
        </footer>
      </div>
    </div>
      )}
    </div>
  );
}
