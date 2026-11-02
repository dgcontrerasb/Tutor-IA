/**
 * Zona de entrada dual (Texto + Foto de cuaderno / PDF):
 * 1. Área de texto amplia para redactar o pegar con contador de caracteres.
 * 2. Caja drag-and-drop inteligente para subir imágenes de cuadernos o archivos PDF (PNG, JPG, WEBP, PDF) con vista previa.
 * 3. Filtrado según la necesidad real del tipo de ayuda seleccionada.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  UploadCloud,
  Image as ImageIcon,
  Trash2,
  FileText,
  X,
  Sparkles,
  AlertCircle,
  Loader2,
  FileCheck,
  FileType,
  HelpCircle,
  CheckCircle2,
} from 'lucide-react';
import { compressImage } from '../utils/imageCompressor';
import { getPhotoUsageToday, PhotoUsageState } from '../services/photoUsageService';

interface InputZoneProps {
  text: string;
  onTextChange: (newText: string) => void;
  imageFile: File | null;
  onImageChange: (file: File | null) => void;
  disabled?: boolean;
  placeholder?: string;
  isMediaRelevant?: boolean;
}

export const InputZone: React.FC<InputZoneProps> = ({
  text,
  onTextChange,
  imageFile,
  onImageChange,
  disabled = false,
  placeholder,
  isMediaRelevant = true,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [photoUsage, setPhotoUsage] = useState<PhotoUsageState>(getPhotoUsageToday());
  const [forceShowMediaUpload, setForceShowMediaUpload] = useState(false);
  const [fileErrorMessage, setFileErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isPdf = imageFile?.type === 'application/pdf' || imageFile?.name.toLowerCase().endsWith('.pdf');

  // Actualizar estado de cuotas de foto al cargar y cuando cambia imageFile
  useEffect(() => {
    setPhotoUsage(getPhotoUsageToday());
  }, [imageFile]);

  // Generar y limpiar vista previa de la imagen o PDF
  useEffect(() => {
    if (!imageFile) {
      setImagePreviewUrl(null);
      return;
    }

    if (isPdf) {
      setImagePreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(imageFile);
    setImagePreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [imageFile, isPdf]);

  // Contadores
  const charCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && photoUsage.remaining > 0) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = async (file: File) => {
    setFileErrorMessage(null);
    const isFilePdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const validImageTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

    if (!isFilePdf && !validImageTypes.includes(file.type)) {
      setFileErrorMessage('Por favor sube una imagen (PNG, JPG, WEBP) o un documento PDF de tu tarea escolar.');
      return;
    }

    // Límite de tamaño
    if (file.size > 8 * 1024 * 1024) {
      setFileErrorMessage('El archivo excede el límite permitido para tareas (máximo 8MB).');
      return;
    }

    // Verificar cuota estricta de 5 fotos/archivos diarios
    const currentUsage = getPhotoUsageToday();
    if (currentUsage.remaining <= 0) {
      setFileErrorMessage(
        'Has alcanzado tu límite diario de 5 fotos o archivos de cuaderno. Puedes continuar realizando todas tus consultas en texto libre de forma ilimitada.'
      );
      return;
    }

    try {
      if (isFilePdf) {
        // Los PDFs no se pasan por compresión de canvas, se envían directamente
        onImageChange(file);
      } else {
        setIsCompressing(true);
        // Compresión automática en el navegador (1 foto por envío, máximo 1024px)
        const compressed = await compressImage(file, 1024, 1024, 0.8);
        onImageChange(compressed);
      }
    } catch (err) {
      console.error('Error al procesar archivo:', err);
      onImageChange(file);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleRemoveImage = () => {
    onImageChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClearText = () => {
    onTextChange('');
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const [useNotebookLines, setUseNotebookLines] = useState(true);
  const shouldDisplayMediaDropzone = isMediaRelevant || forceShowMediaUpload || Boolean(imageFile);

  return (
    <div className="space-y-4">
      {/* 1. Área de texto amplia con insignia PASO 2 */}
      <div className="relative bg-white rounded-2xl border-[2.5px] border-[#1A1A1A] shadow-[4px_4px_0px_#1A1A1A] p-4">
        {/* Cabecera del área de texto */}
        <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-xl bg-[#A0E7E5] border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] text-xs font-black text-[#1A1A1A] shrink-0">
              PASO 2
            </span>
            <label htmlFor="homework-text" className="text-sm sm:text-base font-black text-[#1A1A1A] cursor-pointer">
              Escribe tu tarea o pregunta aquí:
            </label>
          </div>

          <div className="flex items-center gap-2">
            {/* Conmutador lúdico de hoja rayada vs hoja limpia */}
            <button
              type="button"
              onClick={() => setUseNotebookLines((prev) => !prev)}
              className="px-2.5 py-1 rounded-lg bg-[#FAF7EE] hover:bg-[#FFE66D] border border-[#1A1A1A] text-[11px] font-black text-[#1A1A1A] cursor-pointer transition-colors"
              title="Cambiar estilo de hoja de cuaderno"
            >
              {useNotebookLines ? '📓 Hoja rayada' : '📄 Hoja limpia'}
            </button>

            {text && (
              <button
                type="button"
                onClick={handleClearText}
                disabled={disabled}
                className="px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 border border-red-300 text-xs font-black text-red-700 flex items-center gap-1 cursor-pointer transition-colors"
                title="Borrar texto"
              >
                <X className="w-3.5 h-3.5" />
                <span>Borrar</span>
              </button>
            )}
          </div>
        </div>

        {/* Textarea con efecto de líneas escolares opcional */}
        <textarea
          id="homework-text"
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          disabled={disabled}
          placeholder={placeholder || "Escribe tu redacción, cuento, deberes o pega el texto que quieres revisar..."}
          rows={5}
          className={`w-full p-3.5 text-sm sm:text-base font-medium text-[#1A1A1A] placeholder:text-[#1A1A1A]/40 bg-[#FAF7EE]/60 rounded-xl border-2 border-[#1A1A1A] focus:outline-hidden focus:ring-2 focus:ring-[#FFE66D] resize-y ${
            useNotebookLines ? 'cuaderno-lines' : ''
          }`}
        />

        {/* Barra inferior: contador limpio */}
        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-[#1A1A1A]/70">
          <div className="flex items-center gap-2 tabular-nums">
            <span>{wordCount} {wordCount === 1 ? 'palabra' : 'palabras'}</span>
            <span aria-hidden="true">·</span>
            <span>{charCount} caracteres</span>
          </div>
          <span className="text-[11px] text-[#1A1A1A]/65">
            💡 También puedes adjuntar una foto de tu cuaderno abajo
          </span>
        </div>
      </div>

      {/* 2. Caja drag-and-drop inteligente para Foto o PDF (se muestra activamente solo si la tarea requiere archivo) */}
      {!shouldDisplayMediaDropzone ? (
        /* Aviso pedagógico cuando la materia o tarea es teórica (ej: lengua, historia, etc.) */
        <div className="bg-[#FAF7EE] rounded-2xl border-[2px] border-[#1A1A1A] p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-xs text-[#1A1A1A]/90">
            <div className="w-7 h-7 rounded-lg bg-[#FFE66D] border border-[#1A1A1A] flex items-center justify-center shrink-0 font-black">
              💡
            </div>
            <div>
              <p className="font-bold text-[#1A1A1A]">
                En materias teóricas, tu tutor responde al instante analizando el texto escrito o pegado arriba.
              </p>
              <p className="text-[11px] text-[#1A1A1A]/70">
                La subida de fotos y PDF está optimizada para ejercicios de matemáticas, ciencias, diagramas y figuras geométricas.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setForceShowMediaUpload(true)}
            className="neo-btn px-3 py-1.5 bg-white hover:bg-[#FFE66D] text-xs font-bold text-[#1A1A1A] rounded-xl shrink-0 cursor-pointer flex items-center gap-1"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Adjuntar Foto o PDF de todos modos</span>
          </button>
        </div>
      ) : (
        /* Dropzone completa para Foto o Archivo PDF */
        <div className="relative bg-white rounded-2xl border-[2.5px] border-[#1A1A1A] shadow-[4px_4px_0px_#1A1A1A] p-4">
          {/* Mensaje de error de archivo si ocurre */}
          {fileErrorMessage && (
            <div className="mb-3 p-2.5 bg-[#FF8B94] rounded-xl border-2 border-[#1A1A1A] flex items-center justify-between gap-2 text-xs font-black text-[#1A1A1A] animate-in fade-in">
              <div className="flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-red-950 shrink-0" />
                <span>{fileErrorMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => setFileErrorMessage(null)}
                className="p-1 hover:bg-black/10 rounded cursor-pointer"
                title="Cerrar aviso"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#A0E7E5] border-2 border-[#1A1A1A] shadow-[1.5px_1.5px_0px_#1A1A1A] flex items-center justify-center">
                <ImageIcon className="w-4 h-4 text-[#1A1A1A]" />
              </div>
              <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#1A1A1A]">
                2. Sube una foto de tu cuaderno o documento PDF:
              </span>
            </div>

            {/* Badge del límite diario de 5 fotos/PDFs */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border-2 border-[#1A1A1A] text-xs font-black shadow-[1.5px_1.5px_0px_#1A1A1A] ${
                photoUsage.remaining > 0
                  ? 'bg-[#A8E6CF] text-emerald-950'
                  : 'bg-[#FF8B94] text-red-950'
              }`}
            >
              <span>📷 📄 {photoUsage.remaining} de {photoUsage.max} fotos/PDFs disponibles hoy</span>
            </div>
          </div>

          {/* Input oculto */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp,application/pdf"
            onChange={handleFileInputChange}
            disabled={disabled || photoUsage.remaining <= 0 || isCompressing}
            className="hidden"
            id="homework-file-input"
          />

          {isCompressing ? (
            <div className="border-2 border-dashed border-[#1A1A1A] rounded-xl p-6 text-center bg-[#FAF7EE] flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-8 h-8 text-[#1A1A1A] animate-spin" />
              <p className="text-sm font-bold text-[#1A1A1A]">Optimizando imagen de cuaderno...</p>
              <p className="text-xs font-medium text-[#1A1A1A]/70">Ajustando resolución para respuesta ultrasónica</p>
            </div>
          ) : !imageFile ? (
            /* Zona de arrastrar y soltar vacía */
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => {
                if (disabled || isCompressing) return;
                if (photoUsage.remaining <= 0) {
                  setFileErrorMessage(
                    'Has alcanzado tu límite diario de 5 fotos o PDFs de cuaderno. Puedes continuar realizando todas tus consultas escritas de forma ilimitada.'
                  );
                  return;
                }
                fileInputRef.current?.click();
              }}
              className={`border-2 border-dashed rounded-xl p-5 sm:p-6 text-center cursor-pointer transition-all ${
                photoUsage.remaining <= 0
                  ? 'border-red-300 bg-red-50/50 cursor-not-allowed opacity-80'
                  : isDragging
                  ? 'border-[#1A1A1A] bg-[#FFE66D]/40 scale-[1.01]'
                  : 'border-[#1A1A1A]/60 bg-[#FAF7EE]/60 hover:bg-[#FAF7EE] hover:border-[#1A1A1A]'
              }`}
            >
              {photoUsage.remaining <= 0 ? (
                <div className="py-2">
                  <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                  <p className="text-xs sm:text-sm font-bold text-red-900 mb-1">
                    Has agotado tus 5 fotos o archivos PDF por el día de hoy
                  </p>
                  <p className="text-xs text-[#1A1A1A]/70">
                    Las consultas de texto e interrogatorio continuo siguen 100% ilimitadas.
                  </p>
                </div>
              ) : (
                <>
                  <div className="mx-auto w-12 h-12 rounded-xl bg-white border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] flex items-center justify-center mb-2.5">
                    <UploadCloud className="w-6 h-6 text-[#1A1A1A]" />
                  </div>
                  <p className="text-sm font-black text-[#1A1A1A] mb-1">
                    Arrastra aquí la foto de tu cuaderno o taller en PDF (máx. 1 archivo por envío)
                  </p>
                  <p className="text-xs font-medium text-[#1A1A1A]/70">
                    Formatos: PNG, JPG, WEBP o PDF • Lee manuscritos e impresos
                  </p>
                </>
              )}
            </div>
          ) : (
            /* Vista previa de la imagen o archivo PDF cargado */
            <div className="bg-[#FAF7EE] rounded-xl border-2 border-[#1A1A1A] p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                {isPdf ? (
                  <div className="shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] bg-[#FF8B94] flex flex-col items-center justify-center text-[#1A1A1A]">
                    <FileType className="w-7 h-7" />
                    <span className="text-[10px] font-black uppercase mt-0.5">PDF</span>
                  </div>
                ) : imagePreviewUrl ? (
                  <div className="relative shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] overflow-hidden bg-white">
                    <img
                      src={imagePreviewUrl}
                      alt="Vista previa de tarea"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-lg border-2 border-[#1A1A1A] bg-white flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-gray-500" />
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-emerald-800 bg-[#A8E6CF] px-1.5 py-0.2 rounded border border-[#1A1A1A] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-900" />
                      {isPdf ? 'Documento PDF listo' : 'Foto lista (Optimizada)'}
                    </span>
                    <span className="text-[10px] font-bold text-gray-600 hidden xs:inline">
                      (1 de 1 por envío)
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-[#1A1A1A] truncate mt-1">
                    {imageFile.name}
                  </p>
                  <p className="text-[11px] font-medium text-[#1A1A1A]/70">
                    {formatFileSize(imageFile.size)} • {isPdf ? 'Documento PDF escolar' : 'JPEG Comprimido'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={disabled}
                  className="neo-btn px-3 py-1.5 bg-white text-[#1A1A1A] text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cambiar
                </button>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  disabled={disabled}
                  className="neo-btn px-3 py-1.5 bg-[#FF8B94] hover:bg-[#ff7580] text-[#1A1A1A] text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1"
                  title="Quitar archivo"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Quitar</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
