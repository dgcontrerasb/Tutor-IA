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
    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
      {/* Cabecera */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-pink-50 border border-pink-100 flex items-center justify-center text-pink-700">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
              <span>Resolución Paso a Paso</span>
              <span className="text-[10px] font-semibold bg-pink-50 text-pink-700 px-2 py-0.5 rounded-full border border-pink-200">
                Matemáticas & Ciencias
              </span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">{data.topic}</p>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 cursor-pointer transition-colors"
            title="Copiar desarrollo completo"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copiado' : 'Copiar pasos'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
            title="Descargar ficha en PDF"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Descargar PDF</span>
          </button>
        </div>
      </div>

      {/* Enunciado del problema */}
      {data.problemStatement && (
        <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-800">
          <strong className="block font-bold text-slate-900 mb-1 text-xs uppercase tracking-wide">
            📌 Enunciado del problema:
          </strong>
          <p className="leading-relaxed">{data.problemStatement}</p>
        </div>
      )}

      {/* Caja destacada con la Respuesta Final */}
      <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 block">
            ✅ Respuesta final obtenida:
          </span>
          <span className="text-lg sm:text-xl font-bold text-emerald-950">
            {data.finalAnswer}
          </span>
        </div>
        {data.formulaUsed && (
          <div className="bg-white px-3 py-1.5 rounded-lg border border-emerald-200 text-xs font-bold text-emerald-900 shadow-xs">
            📐 Fórmula: <code className="font-mono text-indigo-600">{data.formulaUsed}</code>
          </div>
        )}
      </div>

      {/* Lista didáctica de Pasos */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
          <Compass className="w-4 h-4 text-indigo-600" />
          <span>Procedimiento didáctico guiado:</span>
        </h4>

        <div className="space-y-2.5">
          {data.steps.map((step) => (
            <div
              key={step.stepNumber}
              className="p-3.5 bg-white rounded-xl border border-slate-200/90 shadow-xs space-y-1.5"
            >
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-indigo-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                  {step.stepNumber}
                </span>
                <span className="text-xs sm:text-sm font-bold text-slate-900">
                  {step.title}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 pl-7 leading-relaxed">
                {step.explanation}
              </p>
              {step.mathOrFormula && (
                <div className="ml-7 mt-1 inline-block bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200 text-xs font-mono font-bold text-indigo-700">
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
          <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-200 text-xs space-y-1">
            <span className="font-bold text-indigo-950 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>Verificación del resultado:</span>
            </span>
            <p className="text-slate-700 font-medium leading-relaxed">{data.verificationCheck}</p>
          </div>
        )}

        {data.alternativeMethod && (
          <div className="p-3 bg-sky-50/50 rounded-xl border border-sky-200 text-xs space-y-1">
            <span className="font-bold text-sky-950 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-sky-600" />
              <span>Método alternativo o atajo:</span>
            </span>
            <p className="text-slate-700 font-medium leading-relaxed">{data.alternativeMethod}</p>
          </div>
        )}

        {data.detailedNotes && (
          <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200 text-xs space-y-1">
            <span className="font-bold text-amber-950 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-600" />
              <span>Notas analíticas importantes:</span>
            </span>
            <p className="text-slate-700 font-medium leading-relaxed">{data.detailedNotes}</p>
          </div>
        )}

        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs space-y-1">
          <span className="font-bold text-amber-900 flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
            <span>Consejo de tu profesor:</span>
          </span>
          <p className="text-slate-800 font-medium leading-relaxed">{data.teacherTip}</p>
        </div>
      </div>
    </div>
  );
};
