/**
 * Tarjeta de Transcripción OCR
 * Muestra el texto manuscrito o impreso extraído de la foto del cuaderno.
 */

import React, { useState } from 'react';
import { FileText, Copy, Check } from 'lucide-react';

interface OcrCardProps {
  transcription: string;
}

export const OcrCard: React.FC<OcrCardProps> = ({ transcription }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(transcription);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="bg-slate-50/80 rounded-2xl border border-slate-200 p-4 shadow-xs">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <FileText className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Texto detectado en tu foto (OCR):
          </span>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="text-xs font-semibold text-slate-600 hover:text-indigo-600 flex items-center gap-1 cursor-pointer transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Copiado</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copiar</span>
            </>
          )}
        </button>
      </div>

      <p className="text-xs sm:text-sm font-mono text-slate-700 bg-white p-3 rounded-xl border border-slate-200 whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto">
        {transcription}
      </p>
    </div>
  );
};
