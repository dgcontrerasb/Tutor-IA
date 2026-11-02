/**
 * Componente indicador de consultas libres e ilimitadas
 * Tutor-IA integra IA y Base de Conocimientos Escolar Abierta sin límites restrictivos.
 */

import React from 'react';
import { Sparkles, CheckCircle2, BookOpen } from 'lucide-react';
import { UserUsage } from '../types';

interface UsageCounterProps {
  usage?: UserUsage;
  onOpenPayment?: () => void;
}

export const UsageCounter: React.FC<UsageCounterProps> = () => {
  return (
    <div className="w-full">
      <div className="bg-white rounded-2xl border-[2.5px] border-[#1A1A1A] shadow-[4px_4px_0px_#1A1A1A] p-3.5 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#A8E6CF] border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-emerald-950" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#1A1A1A]">
                  Consultas Ilimitadas Escolares
                </span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#A8E6CF] text-emerald-950 border border-[#1A1A1A] flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-800" />
                  Acceso Libre Activo
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#A0E7E5] text-[#1A1A1A] border border-[#1A1A1A]">
                  📷 5 fotos/día
                </span>
              </div>
              <p className="text-[11px] font-semibold text-[#1A1A1A]/85 mt-0.5 leading-snug">
                Tu tutor escolar personal para corregir ortografía, redactar resúmenes, resolver ejercicios paso a paso y guiarte en todas tus materias.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
            <div className="px-3 py-1.5 rounded-xl bg-[#FAF7EE] border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] text-xs font-black text-[#1A1A1A] flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-[#1A1A1A] animate-pulse"></span>
              <span>18 Materias Activas</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
