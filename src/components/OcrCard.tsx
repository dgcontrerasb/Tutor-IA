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
    <div className="bg-[#FAF7EE] rounded-2xl border-2 border-[#1A1A1A] p-4 shadow-[4px_4px_0px_#1A1A1A]">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#FFE66D] border border-[#1A1A1A] flex items-center justify-center">
            <FileText className="w-3.5 h-3.5 text-[#1A1A1A]" />
          </div>
          <span className="text-xs font-black uppercase tracking-wider text-[#1A1A1A]">
            Texto detectado en tu foto (OCR):
          </span>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="text-xs font-bold text-[#1A1A1A] hover:underline flex items-center gap-1 cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-700" />
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

      <p className="text-xs sm:text-sm font-mono text-[#1A1A1A]/85 bg-white p-3 rounded-xl border border-[#1A1A1A] whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto">
        {transcription}
      </p>
    </div>
  );
};
