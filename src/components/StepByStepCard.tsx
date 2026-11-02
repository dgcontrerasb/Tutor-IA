/**
 * Tarjeta Neubrutalista: Solución Explicada Paso a Paso
 * Para ejercicios de Matemáticas, Geometría, Física, Química y Estadística Escolar.
 */

import React, { useState } from 'react';
import { Calculator, CheckCircle2, Copy, Check, Lightbulb, Compass, Award, Bookmark, FileDown } from 'lucide-react';
import { StepByStepResult } from '../types';

interface StepByStepCardProps {
  data: StepByStepResult;
}

export const StepByStepCard: React.FC<StepByStepCardProps> = ({ data }) => {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleCopy = () => {
    const textContent = `
${data.topic}
Enunciado: ${data.problemStatement || ''}
Respuesta Final: ${data.finalAnswer}
${data.formulaUsed ? `Fórmula: ${data.formulaUsed}` : ''}

Pasos:
${data.steps.map((s) => `${s.stepNumber}. ${s.title}: ${s.explanation} ${s.mathOrFormula ? `(${s.mathOrFormula})` : ''}`).join('\n')}

${data.verificationCheck ? `Verificación: ${data.verificationCheck}\n` : ''}${data.alternativeMethod ? `Método alternativo: ${data.alternativeMethod}\n` : ''}${data.detailedNotes ? `Notas analíticas: ${data.detailedNotes}\n` : ''}Consejo del profesor: ${data.teacherTip}
    `.trim();

    navigator.clipboard.writeText(textContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveNote = () => {
    setSaved(true);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('tutor-ia-history-updated'));
    }
    setTimeout(() => setSaved(false), 2500);
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('tutor-ia-request-print'));
    }
  };

  return (
    <div className="neo-card bg-white p-5 sm:p-6 rounded-2xl border-[3px] border-[#1A1A1A] shadow-[6px_6px_0px_#1A1A1A] space-y-5">
      {/* Cabecera */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-[#1A1A1A] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FFB3BA] border-2 border-[#1A1A1A] flex items-center justify-center shadow-[2px_2px_0px_#1A1A1A]">
            <Calculator className="w-5 h-5 text-[#1A1A1A]" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-[#1A1A1A] flex items-center gap-2">
              <span>Resolución Paso a Paso</span>
              <span className="text-[10px] font-black bg-[#FFB3BA] px-2 py-0.5 rounded-full border border-[#1A1A1A]">
                Matemáticas & Ciencias
              </span>
            </h3>
            <p className="text-xs font-bold text-[#1A1A1A]/70">{data.topic}</p>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={handleCopy}
            className="neo-btn flex items-center gap-1 px-2.5 py-1.5 bg-[#FAF7EE] hover:bg-[#FFE66D] text-[#1A1A1A] rounded-xl text-xs font-bold cursor-pointer"
            title="Copiar desarrollo completo"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copiado' : 'Copiar pasos'}</span>
          </button>

          <button
            onClick={handleSaveNote}
            className={`neo-btn flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
              saved
                ? 'bg-[#A8E6CF] text-emerald-950 border-[#1A1A1A]'
                : 'bg-[#FAF7EE] hover:bg-[#FFE66D] text-[#1A1A1A]'
            }`}
            title="Guardar apunte en mi cuaderno"
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>{saved ? '✓ Guardado en tu libreta' : 'Guardar apunte'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="neo-btn flex items-center gap-1 px-2.5 py-1.5 bg-[#FAF7EE] hover:bg-[#A0E7E5] text-[#1A1A1A] rounded-xl text-xs font-bold cursor-pointer"
            title="Descargar ficha en PDF"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Descargar PDF</span>
          </button>
        </div>
      </div>

      {/* Enunciado y Fórmula si existen */}
      {data.problemStatement && (
        <div className="p-3.5 bg-[#FAF7EE] rounded-xl border-2 border-[#1A1A1A] text-xs sm:text-sm font-medium text-[#1A1A1A]">
          <strong className="block font-black text-[#1A1A1A] mb-1 text-xs uppercase tracking-wide">
            📌 Enunciado del problema:
          </strong>
          <p className="leading-relaxed">{data.problemStatement}</p>
        </div>
      )}

      {/* Caja destacada con la Respuesta Final */}
      <div className="p-4 bg-[#B4F8C8] rounded-xl border-2 border-[#1A1A1A] shadow-[3px_3px_0px_#1A1A1A] flex items-center justify-between gap-3 flex-wrap">
        <div>
          <span className="text-[11px] font-black uppercase tracking-wider text-[#1A1A1A]/80 block">
            ✅ Respuesta final obtenida:
          </span>
          <span className="text-lg sm:text-xl font-black text-[#1A1A1A]">
            {data.finalAnswer}
          </span>
        </div>
        {data.formulaUsed && (
          <div className="bg-white px-3 py-1.5 rounded-lg border border-[#1A1A1A] text-xs font-black text-[#1A1A1A] shadow-[1.5px_1.5px_0px_#1A1A1A]">
            📐 Fórmula: <code className="font-mono">{data.formulaUsed}</code>
          </div>
        )}
      </div>

      {/* Lista didáctica de Pasos */}
      <div className="space-y-3">
        <h4 className="text-xs font-black uppercase tracking-wider text-[#1A1A1A] flex items-center gap-1.5">
          <Compass className="w-4 h-4 text-[#1A1A1A]" />
          <span>Procedimiento didáctico guiado:</span>
        </h4>

        <div className="space-y-3">
          {data.steps.map((step) => (
            <div
              key={step.stepNumber}
              className="p-3.5 bg-white rounded-xl border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] space-y-1.5"
            >
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-[#1A1A1A] text-white text-xs font-black flex items-center justify-center shrink-0">
                  {step.stepNumber}
                </span>
                <span className="text-xs sm:text-sm font-black text-[#1A1A1A]">
                  {step.title}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#1A1A1A]/85 pl-8 leading-relaxed">
                {step.explanation}
              </p>
              {step.mathOrFormula && (
                <div className="ml-8 mt-1 inline-block bg-[#FAF7EE] px-2.5 py-1 rounded-md border border-[#1A1A1A] text-xs font-mono font-bold text-[#1A1A1A]">
                  {step.mathOrFormula}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Comprobación, Método Alternativo y Consejo del Maestro */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        {data.verificationCheck && (
          <div className="p-3 bg-[#E0BBE4] rounded-xl border-2 border-[#1A1A1A] text-xs space-y-1">
            <span className="font-black text-[#1A1A1A] flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Verificación del resultado:</span>
            </span>
            <p className="text-[#1A1A1A]/90 font-medium leading-relaxed">{data.verificationCheck}</p>
          </div>
        )}

        {data.alternativeMethod && (
          <div className="p-3 bg-[#FAF7EE] rounded-xl border-2 border-[#1A1A1A] text-xs space-y-1">
            <span className="font-black text-[#1A1A1A] flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-blue-700" />
              <span>Método alternativo o atajo:</span>
            </span>
            <p className="text-[#1A1A1A]/90 font-medium leading-relaxed">{data.alternativeMethod}</p>
          </div>
        )}

        {data.detailedNotes && (
          <div className="p-3 bg-white rounded-xl border-2 border-[#1A1A1A] text-xs space-y-1">
            <span className="font-black text-[#1A1A1A] flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-700" />
              <span>Notas analíticas importantes:</span>
            </span>
            <p className="text-[#1A1A1A]/90 font-medium leading-relaxed">{data.detailedNotes}</p>
          </div>
        )}

        <div className="p-3 bg-[#FFE66D] rounded-xl border-2 border-[#1A1A1A] text-xs space-y-1">
          <span className="font-black text-[#1A1A1A] flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5" />
            <span>Consejo de tu profesor:</span>
          </span>
          <p className="text-[#1A1A1A]/90 font-medium leading-relaxed">{data.teacherTip}</p>
        </div>
      </div>
    </div>
  );
};
