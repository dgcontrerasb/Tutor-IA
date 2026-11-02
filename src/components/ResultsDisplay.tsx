import React, { useState } from 'react';
import {
  BookmarkCheck,
  Check,
  Copy,
  FileDown,
  Layers,
  Sparkles,
} from 'lucide-react';
import { HomeworkReviewResult, SchoolSubjectId, GradeLevel } from '../types';
import { UserProfile } from '../services/firebase';
import { getSubjectById } from '../data/schoolSubjects';
import { getCleanDisplayName } from './AuthBar';
import { OcrCard } from './OcrCard';
import { StepByStepCard } from './StepByStepCard';
import { TopicExplanationCard } from './TopicExplanationCard';
import { QuizGuideCard } from './QuizGuideCard';
import { CorrectionCard } from './CorrectionCard';
import { SummaryCard } from './SummaryCard';
import { AnalysisCard } from './AnalysisCard';

interface ResultsDisplayProps {
  result: HomeworkReviewResult;
  reloadedNotice: string | null;
  onClearReloadedNotice: () => void;
  currentUser: UserProfile | null;
  selectedSubjectId: SchoolSubjectId;
  gradeLevel: GradeLevel;
  copiedSuccess: boolean;
  onCopyNotes: () => void;
  onPrint: () => void;
}

type TabKey = 'all' | 'ocr' | 'stepByStep' | 'topicExplanation' | 'quizGuide' | 'correction' | 'summary' | 'analysis';

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  result,
  reloadedNotice,
  onClearReloadedNotice,
  currentUser,
  selectedSubjectId,
  gradeLevel,
  copiedSuccess,
  onCopyNotes,
  onPrint,
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>('all');

  // Determinar pestañas activas según lo que trajo el resultado
  const availableTabs: { key: TabKey; label: string; icon: string }[] = [];

  if (result.stepByStep) availableTabs.push({ key: 'stepByStep', label: 'Paso a Paso', icon: '🔢' });
  if (result.topicExplanation) availableTabs.push({ key: 'topicExplanation', label: 'Explicación', icon: '📘' });
  if (result.correction) availableTabs.push({ key: 'correction', label: 'Ortografía', icon: '✍️' });
  if (result.quizGuide) availableTabs.push({ key: 'quizGuide', label: 'Preguntas', icon: '🧪' });
  if (result.summary) availableTabs.push({ key: 'summary', label: 'Resumen', icon: '📄' });
  if (result.analysis) availableTabs.push({ key: 'analysis', label: 'Análisis', icon: '🔍' });
  if (result.ocrTranscribedText) availableTabs.push({ key: 'ocr', label: 'Texto Foto', icon: '📷' });

  const showTabs = availableTabs.length > 1;

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-300">
      {/* Aviso visual al recargar una consulta guardada */}
      {reloadedNotice && (
        <div className="p-3.5 bg-[#FFE66D] rounded-2xl border-[2.5px] border-[#1A1A1A] shadow-[4px_4px_0px_#1A1A1A] flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">📓</span>
            <div>
              <p className="text-xs sm:text-sm font-black text-[#1A1A1A]">
                {reloadedNotice}
              </p>
              <p className="text-[11px] font-bold text-[#1A1A1A]/70">
                Ficha cargada directamente desde tu memoria local. Puedes repasarla libremente sin gastar consultas.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClearReloadedNotice}
            className="px-2.5 py-1 bg-white hover:bg-[#FAF7EE] text-[#1A1A1A] rounded-xl border-2 border-[#1A1A1A] text-xs font-black shadow-[1.5px_1.5px_0px_#1A1A1A] cursor-pointer shrink-0"
          >
            Entendido ✓
          </button>
        </div>
      )}

      {/* Cabecera exclusiva para impresión en hoja escolar (@media print) */}
      <div className="hidden print-header">
        <div className="flex justify-between items-center text-sm font-bold">
          <span className="font-black">📓 TUTOR-IA - FICHA ESCOLAR DE ESTUDIO</span>
          <span>Fecha: {new Date().toLocaleDateString('es-ES')} - {result.timestamp}</span>
        </div>
        <div className="text-xs text-gray-700 mt-1 flex gap-4">
          <span><strong>Alumno:</strong> {getCleanDisplayName(currentUser)}</span>
          <span><strong>Materia:</strong> {getSubjectById(selectedSubjectId).name} ({gradeLevel === 'secundaria' ? 'Secundaria' : 'Primaria'})</span>
        </div>
      </div>

      {/* Barra de cabecera de resultados en pantalla con acciones del estudiante */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-white rounded-2xl border-[2.5px] border-[#1A1A1A] shadow-[4px_4px_0px_#1A1A1A]">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">🎓</span>
          <div>
            <h2 className="text-base sm:text-lg font-black text-[#1A1A1A]">
              Resultado de la Revisión Escolar
            </h2>
            <div className="flex items-center gap-2 flex-wrap text-[11px] font-bold text-[#1A1A1A]/70">
              <span>Revisado a las {result.timestamp}</span>
              {result.processingTimeMs && <span>• {(result.processingTimeMs / 1000).toFixed(1)}s</span>}
              <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-300 flex items-center gap-1 font-black">
                <BookmarkCheck className="w-3 h-3 text-emerald-600" />
                Guardado en tu cuaderno local
              </span>
              <span
                className={`px-2 py-0.5 rounded-full border border-[#1A1A1A] text-[10px] font-black uppercase flex items-center gap-1 shadow-[1px_1px_0px_#1A1A1A] ${
                  result.responseDepth === 'detailed'
                    ? 'bg-[#A8E6CF] text-[#1A1A1A]'
                    : 'bg-[#FFE66D] text-[#1A1A1A]'
                }`}
              >
                {result.responseDepth === 'detailed' ? '📚 Modo Detallado' : '⚡ Modo Resumido'}
              </span>
              {/* Badge Neobrutalista de Motor / Fuente Activa (Exclusivo Auditoría Admin) */}
              {(currentUser?.role === 'admin' ||
                currentUser?.email?.toLowerCase() === 'dgcontrerasb@gmail.com') && (
                <>
                  {result.provider === 'wikipedia' && (
                    <span className="px-2.5 py-0.5 rounded-lg border-2 border-[#1A1A1A] bg-[#A0E7E5] text-[#1A1A1A] text-[10px] sm:text-[11px] font-black shadow-[2px_2px_0px_#1A1A1A] inline-flex items-center gap-1">
                      📚 Fuente: Wikipedia REST (0 tokens)
                    </span>
                  )}
                  {result.provider === 'groq' && (
                    <span className="px-2.5 py-0.5 rounded-lg border-2 border-[#1A1A1A] bg-[#D9F99D] text-[#1A1A1A] text-[10px] sm:text-[11px] font-black shadow-[2px_2px_0px_#1A1A1A] inline-flex items-center gap-1">
                      ⚡ Motor: Groq IA (openai/gpt-oss-120b)
                    </span>
                  )}
                  {result.provider === 'pollinations' && (
                    <span className="px-2.5 py-0.5 rounded-lg border-2 border-[#1A1A1A] bg-[#F5D0FE] text-[#1A1A1A] text-[10px] sm:text-[11px] font-black shadow-[2px_2px_0px_#1A1A1A] inline-flex items-center gap-1">
                      🌐 Respaldo: Pollinations AI
                    </span>
                  )}
                  {result.provider === 'local' && (
                    <span className="px-2.5 py-0.5 rounded-lg border-2 border-[#1A1A1A] bg-[#FFE66D] text-[#1A1A1A] text-[10px] sm:text-[11px] font-black shadow-[2px_2px_0px_#1A1A1A] inline-flex items-center gap-1">
                      📓 Glosario Escolar Local
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Botón rápido: Copiar al portapapeles */}
          <button
            type="button"
            onClick={onCopyNotes}
            className={`neo-btn flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
              copiedSuccess
                ? 'bg-[#A8E6CF] text-emerald-950'
                : 'bg-[#FAF7EE] hover:bg-[#FFE66D] text-[#1A1A1A]'
            }`}
            title="Copiar apunte escolar al portapapeles"
          >
            {copiedSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-900" />
                <span>¡Copiado! ✓</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar apunte</span>
              </>
            )}
          </button>

          {/* Botón rápido: Descargar en PDF */}
          <button
            type="button"
            onClick={onPrint}
            className="neo-btn flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF7EE] hover:bg-[#A0E7E5] text-[#1A1A1A] rounded-xl text-xs font-bold cursor-pointer"
            title="Descargar en PDF o copiar ficha de estudio"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Descargar en PDF</span>
          </button>
        </div>
      </div>

      {/* Selector de Pestañas Didácticas (Mitiga la fatiga de scroll en móviles) */}
      {showTabs && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none select-none">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`neo-btn px-3 py-1.5 rounded-xl text-xs font-black shrink-0 cursor-pointer flex items-center gap-1.5 transition-all ${
              activeTab === 'all'
                ? 'bg-[#1A1A1A] text-white shadow-[2px_2px_0px_#FFE66D]'
                : 'bg-white text-[#1A1A1A] hover:bg-[#FAF7EE] shadow-[2px_2px_0px_#1A1A1A]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Ver Todo Completo</span>
          </button>

          {availableTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`neo-btn px-3 py-1.5 rounded-xl text-xs font-black shrink-0 cursor-pointer flex items-center gap-1.5 transition-all ${
                activeTab === tab.key
                  ? 'bg-[#FFE66D] text-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A]'
                  : 'bg-white text-[#1A1A1A] hover:bg-[#FAF7EE] shadow-[2px_2px_0px_#1A1A1A]'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Vista de Tarjetas con filtro por pestaña activa */}
      {(activeTab === 'all' || activeTab === 'ocr') && result.ocrTranscribedText && (
        <OcrCard transcription={result.ocrTranscribedText} />
      )}

      {(activeTab === 'all' || activeTab === 'stepByStep') && result.stepByStep && (
        <StepByStepCard data={result.stepByStep} />
      )}

      {(activeTab === 'all' || activeTab === 'topicExplanation') && result.topicExplanation && (
        <TopicExplanationCard data={result.topicExplanation} />
      )}

      {(activeTab === 'all' || activeTab === 'quizGuide') && result.quizGuide && (
        <QuizGuideCard data={result.quizGuide} />
      )}

      {(activeTab === 'all' || activeTab === 'correction') && result.correction && (
        <CorrectionCard data={result.correction} />
      )}

      {(activeTab === 'all' || activeTab === 'summary') && result.summary && (
        <SummaryCard data={result.summary} />
      )}

      {(activeTab === 'all' || activeTab === 'analysis') && result.analysis && (
        <AnalysisCard data={result.analysis} />
      )}
    </div>
  );
};
