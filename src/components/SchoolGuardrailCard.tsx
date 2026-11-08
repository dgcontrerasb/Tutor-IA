/**
 * Tarjeta de Orientación Pedagógica / Guardrail Escolar
 * Se muestra cuando la consulta no corresponde a una tarea o temática escolar.
 * Diseñada bajo el sistema visual Bento Grid Moderno (consistente con el resto de la aplicación).
 */

import React from 'react';
import { BookOpen, GraduationCap, CheckCircle2, RotateCcw, HelpCircle, Sparkles, FileText, Camera, Check } from 'lucide-react';

interface SchoolGuardrailCardProps {
  rejectionReason?: string;
  onReset?: () => void;
}

export const SchoolGuardrailCard: React.FC<SchoolGuardrailCardProps> = ({
  rejectionReason,
  onReset,
}) => {
  // Limpiar cualquier residuo de plantilla o instrucción interna del modelo
  const cleanReason = () => {
    if (
      !rejectionReason ||
      rejectionReason.includes('Mensaje muy cordial') ||
      rejectionReason.includes('tono de profesor') ||
      rejectionReason.includes('Explica amablemente') ||
      rejectionReason.trim().length < 15
    ) {
      return '¡Hola! Tutor-IA está diseñado exclusivamente con fines pedagógicos para acompañarte en tus tareas del colegio, materias escolares (Español, Literatura, Matemáticas, Ciencias, Historia y más), ejercicios prácticos y dudas de estudio. Esta consulta en particular parece estar fuera del ámbito de las materias escolares.';
    }
    return rejectionReason;
  };

  return (
    <div className="relative bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 sm:p-7 space-y-6 text-slate-800 animate-in fade-in duration-200">
      {/* Cabecera Bento */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-700 shrink-0 shadow-xs">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                <Sparkles className="w-3 h-3 text-indigo-600" />
                Tutor Escolar Tutor-IA
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
              Orientación Pedagógica Escolar
            </h3>
          </div>
        </div>

        {/* Insignia destacada: NO se cobró el uso */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>¡Tu uso de consulta NO fue descontado!</span>
        </div>
      </div>

      {/* Explicación cordial y pedagógica */}
      <div className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-4 sm:p-5 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800">
          <HelpCircle className="w-4 h-4 text-amber-600" />
          <span>¿Por qué no se procesó esta consulta?</span>
        </div>
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
          <span>{cleanReason()}</span>
        </p>
      </div>

      {/* Qué tareas sí se admiten (Bento Grid de 4 micro-fichas) */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
          <BookOpen className="w-4 h-4 text-indigo-600" />
          <span>¿Qué puedes revisar aquí con tu tutor escolar?</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
              <Check className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="font-bold text-slate-800">Tareas y talleres escolares</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Español, Literatura, Matemáticas, Ciencias, Historia y 18 materias.</p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
              <Camera className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="font-bold text-slate-800">Fotos de cuaderno y PDFs</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Lectura de ejercicios manuscritos, hojas de examen y talleres impresos.</p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
              <FileText className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="font-bold text-slate-800">Cuentos, ortografía y redacción</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Corrección de tildes, puntuación, estilo y análisis de lecturas de clase.</p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="font-bold text-slate-800">Explicaciones paso a paso</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Fórmulas, comprobación paso a paso, ejemplos prácticos y notas de estudio.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Botón de acción para volver a consultar */}
      {onReset && (
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={onReset}
            className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold rounded-xl cursor-pointer flex items-center justify-center gap-2 shadow-xs transition-all active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Ingresar un deber escolar o subir otra foto</span>
          </button>
          <span className="text-xs text-slate-500 font-medium text-center sm:text-left">
            ¡Inténtalo con cualquier deber, lectura o ejercicio del colegio!
          </span>
        </div>
      )}
    </div>
  );
};
