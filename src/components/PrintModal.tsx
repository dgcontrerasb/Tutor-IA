/**
 * Modal de Exportación Escolar - Tutor-IA
 * - Únicas opciones: "DESCARGAR EN PDF" y "COPIAR TODO".
 * - Elimina "Mandar a imprimir" y "Descargar HTML" que fallaban en navegadores móviles e iframes.
 * - Genera un documento PDF real descargable en el dispositivo del estudiante.
 */

import React, { useState } from 'react';
import {
  Download,
  Copy,
  Check,
  X,
  FileText,
  Sparkles,
  FileDown,
  Loader2,
} from 'lucide-react';
import { HomeworkReviewResult, GradeLevel } from '../types';
import {
  downloadPrintableSheetPdf,
  generateSheetFormattedText,
  PrintableSheetData,
} from '../services/printService';

interface PrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: HomeworkReviewResult | null;
  subjectName: string;
  gradeLevel: GradeLevel;
  studentName?: string;
  onCopyAllText?: () => void;
}

export const PrintModal: React.FC<PrintModalProps> = ({
  isOpen,
  onClose,
  result,
  subjectName,
  gradeLevel,
  studentName = 'Estudiante',
  onCopyAllText,
}) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen || !result) return null;

  const sheetData: PrintableSheetData = {
    result,
    subjectName,
    gradeLevel,
    studentName,
  };

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    setStatusMessage('Preparando y descargando archivo PDF...');
    try {
      await downloadPrintableSheetPdf(sheetData);
      setDownloadSuccess(true);
      setStatusMessage('✓ ¡Ficha descargada exitosamente en formato PDF!');
      setTimeout(() => {
        setDownloadSuccess(false);
        setStatusMessage(null);
      }, 3500);
    } catch (err) {
      console.error('Error al generar PDF:', err);
      setStatusMessage('Hubo un problema al generar el PDF. Puedes usar "Copiar Todo" mientras tanto.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleCopy = () => {
    if (onCopyAllText) {
      onCopyAllText();
    } else {
      const fullText = generateSheetFormattedText(sheetData);
      navigator.clipboard.writeText(fullText);
    }
    setCopiedSuccess(true);
    setStatusMessage('✓ ¡Texto completo copiado! Listo para pegar en Word o Google Docs.');
    setTimeout(() => {
      setCopiedSuccess(false);
      setStatusMessage(null);
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-xl bg-white rounded-3xl border-[3px] border-[#1A1A1A] shadow-[8px_8px_0px_#1A1A1A] p-4 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="export-modal-title"
      >
        {/* Cabecera del Modal */}
        <div className="flex items-center justify-between border-b-2 border-[#1A1A1A] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#A0E7E5] border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] flex items-center justify-center text-xl shrink-0">
              📑
            </div>
            <div>
              <h3 id="export-modal-title" className="text-base sm:text-lg font-black text-[#1A1A1A] leading-tight">
                Guardar o Exportar Ficha Escolar
              </h3>
              <p className="text-xs font-bold text-[#1A1A1A]/70">
                {subjectName} · {gradeLevel === 'secundaria' ? 'Bachillerato' : 'Primaria'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white hover:bg-gray-100 border-2 border-[#1A1A1A] flex items-center justify-center text-[#1A1A1A] cursor-pointer shadow-[2px_2px_0px_#1A1A1A]"
            aria-label="Cerrar ventana de exportación"
          >
            <X className="w-4 h-4 stroke-[3]" />
          </button>
        </div>

        {/* Notificación amigable */}
        <div className="p-3.5 bg-[#FAF7EE] rounded-2xl border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] flex items-start gap-3">
          <span className="text-2xl shrink-0 mt-0.5">💡</span>
          <div className="text-xs sm:text-[13px] text-[#1A1A1A] space-y-1">
            <p className="font-black">
              Descarga tu ficha de estudio para guardarla o llevarla a clase
            </p>
            <p className="font-medium text-[#1A1A1A]/85 leading-snug">
              Guarda el archivo <strong>PDF limpio</strong> directamente en la memoria de tu celular o computador, o copia todo el texto ordenado para pegarlo en tu procesador de texto favorito.
            </p>
          </div>
        </div>

        {/* Estado interactivo de la acción */}
        {statusMessage && (
          <div className="p-2.5 bg-[#FFE66D] rounded-xl border-2 border-[#1A1A1A] text-xs font-black text-[#1A1A1A] text-center shadow-[2px_2px_0px_#1A1A1A] animate-in fade-in duration-150">
            {statusMessage}
          </div>
        )}

        {/* Únicas 2 opciones solicitadas por el usuario: DESCARGAR EN PDF y COPIAR TODO */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Opción 1: DESCARGAR EN PDF */}
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="neo-btn p-3.5 bg-[#A8E6CF] hover:bg-[#96dfc3] disabled:opacity-70 text-[#1A1A1A] rounded-2xl border-2 border-[#1A1A1A] font-black text-xs sm:text-sm flex flex-col items-center justify-center gap-1.5 shadow-[4px_4px_0px_#1A1A1A] cursor-pointer text-center transition-all"
          >
            <div className="flex items-center gap-2">
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generando PDF...</span>
                </>
              ) : downloadSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-900 stroke-[3]" />
                  <span>¡PDF Descargado!</span>
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4" />
                  <span>DESCARGAR EN PDF</span>
                </>
              )}
            </div>
            <span className="text-[10px] font-bold text-[#1A1A1A]/70">
              Archivo .pdf listo para guardar
            </span>
          </button>

          {/* Opción 2: COPIAR TODO */}
          <button
            type="button"
            onClick={handleCopy}
            className="neo-btn p-3.5 bg-[#FFE66D] hover:bg-[#fedc44] text-[#1A1A1A] rounded-2xl border-2 border-[#1A1A1A] font-black text-xs sm:text-sm flex flex-col items-center justify-center gap-1.5 shadow-[4px_4px_0px_#1A1A1A] cursor-pointer text-center transition-all"
          >
            <div className="flex items-center gap-2">
              {copiedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-900 stroke-[3]" />
                  <span>¡Todo Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>COPIAR TODO</span>
                </>
              )}
            </div>
            <span className="text-[10px] font-bold text-[#1A1A1A]/70">
              Para Word, Docs o WhatsApp
            </span>
          </button>
        </div>

        {/* Vista previa compacta de la ficha */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-[#1A1A1A] flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              <span>Contenido incluido en el PDF:</span>
            </span>
            <span className="text-[11px] font-bold text-[#1A1A1A]/70">
              {result.timestamp || 'Hoy'}
            </span>
          </div>

          <div className="p-3.5 bg-gray-50 rounded-2xl border-2 border-[#1A1A1A] text-xs space-y-2 text-[#1A1A1A] max-h-44 overflow-y-auto">
            <div className="font-bold border-b border-gray-300 pb-1.5 flex justify-between">
              <span>📓 Tutor-IA · {subjectName}</span>
              <span className="text-gray-600 font-semibold">{studentName}</span>
            </div>

            {result.stepByStep && (
              <div>
                <strong className="text-purple-900">🔢 Solución Paso a Paso:</strong> {result.stepByStep.topic}
                <p className="text-gray-700 font-medium pl-3">
                  Respuesta: <strong>{result.stepByStep.finalAnswer}</strong> ({result.stepByStep.steps.length} pasos explicados)
                </p>
              </div>
            )}

            {result.topicExplanation && (
              <div>
                <strong className="text-blue-900">📘 Explicación Didáctica:</strong> {result.topicExplanation.topic}
                <p className="text-gray-700 font-medium pl-3 line-clamp-2">
                  {result.topicExplanation.simpleDefinition}
                </p>
              </div>
            )}

            {result.correction && (
              <div>
                <strong className="text-emerald-900">📝 Corrección Ortográfica:</strong> {result.correction.scoreText}
                <p className="text-gray-700 font-medium pl-3 line-clamp-2">
                  {result.correction.correctedText}
                </p>
              </div>
            )}

            {result.summary && (
              <div>
                <strong className="text-amber-900">📌 Resumen:</strong> {result.summary.mainIdea}
              </div>
            )}

            {result.quizGuide && (
              <div>
                <strong className="text-rose-900">❓ Taller:</strong> {result.quizGuide.questions.length} preguntas preparadas
              </div>
            )}
          </div>
        </div>

        {/* Botón de cierre inferior */}
        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={onClose}
            className="neo-btn px-5 py-2.5 bg-white hover:bg-[#FAF7EE] text-[#1A1A1A] text-xs sm:text-sm font-black rounded-xl border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] cursor-pointer"
          >
            Listo / Volver a mi tarea
          </button>
        </div>
      </div>
    </div>
  );
};
