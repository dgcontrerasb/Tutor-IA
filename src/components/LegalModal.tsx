/**
 * Modal Legal y de Soporte:
 * 1. Términos de Servicio y Blindaje Legal Integral (Exención de responsabilidad, uso no comercial de IA, sin garantía de calificaciones)
 * 2. Política de Privacidad y Protección de Menores (Habeas Data / Ley 1581 de 2012 / Procesamiento efímero)
 * 3. Canales Oficiales de Contacto y Soporte
 *
 * Diseño adaptado al sistema Bento Grid Moderno.
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  FileText,
  Lock,
  Headphones,
  ExternalLink,
  MessageCircle,
  Mail,
  AlertTriangle,
  UserCheck,
  CheckCircle,
  Copy,
  Scale,
  Sparkles,
  BookOpen,
} from 'lucide-react';

export type LegalTab = 'terms' | 'privacy' | 'support';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: LegalTab;
  onOpenPayment?: () => void;
  isSubscriptionActive?: boolean;
}

const SUPPORT_EMAIL = 'dgcontrerasb@gmail.com';
const WHATSAPP_NUMBER = '573213902708';

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'terms',
  onOpenPayment,
  isSubscriptionActive = false,
}) => {
  const [activeTab, setActiveTab] = useState<LegalTab>(initialTab);
  const [copiedEmail, setCopiedEmail] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // Cerrar con Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(SUPPORT_EMAIL);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } catch {
      // Fallback
    }
  };

  const whatsappSupportUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    'Hola, necesito soporte o información sobre mi suscripción en Tutor-IA.'
  )}`;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs p-3 sm:p-6 flex items-start justify-center animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-3xl bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 text-slate-800 my-4 sm:my-8 max-h-[92vh] overflow-y-auto">
        {/* Botón Cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 hover:text-slate-900 transition-all cursor-pointer active:scale-95"
          title="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Encabezado */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/60 text-xs font-semibold text-indigo-700 mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            Marco Legal, Privacidad y Soporte
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Tutor-IA Escolar
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
            Plataforma multidisciplinar de apoyo pedagógico para 18 asignaturas escolares
          </p>
        </div>

        {/* Selector de pestañas estilo Bento */}
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mb-6 p-1.5 bg-slate-100 rounded-2xl border border-slate-200/80">
          <button
            onClick={() => setActiveTab('terms')}
            className={`py-2 px-2 sm:px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'terms'
                ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/60 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <FileText className="w-4 h-4 shrink-0 text-indigo-600" />
            <span className="truncate">Términos y Condiciones</span>
          </button>

          <button
            onClick={() => setActiveTab('privacy')}
            className={`py-2 px-2 sm:px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'privacy'
                ? 'bg-white text-emerald-700 shadow-xs border border-slate-200/60 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Lock className="w-4 h-4 shrink-0 text-emerald-600" />
            <span className="truncate">Privacidad y Datos</span>
          </button>

          <button
            onClick={() => setActiveTab('support')}
            className={`py-2 px-2 sm:px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'support'
                ? 'bg-white text-amber-700 shadow-xs border border-slate-200/60 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Headphones className="w-4 h-4 shrink-0 text-amber-600" />
            <span className="truncate">Contacto y Soporte</span>
          </button>
        </div>

        {/* Contenido de cada pestaña */}
        <div className="bg-slate-50/70 rounded-2xl border border-slate-200/80 p-5 sm:p-7 text-xs sm:text-sm leading-relaxed text-slate-700 space-y-5">
          {/* TAB 1: TÉRMINOS DE SERVICIO (BLINDAJE LEGAL RIGUROSO) */}
          {activeTab === 'terms' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-amber-50/80 rounded-xl border border-amber-200/70 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-900 font-medium leading-relaxed">
                  <strong className="font-bold text-amber-950">Aviso vinculante:</strong> Al ingresar y utilizar Tutor-IA, el usuario y sus acudientes o representantes legales declaran haber leído, comprendido y aceptado en su totalidad los presentes términos, eximiendo de toda responsabilidad académica, técnica o extracontractual a los operadores y desarrolladores de la plataforma.
                </p>
              </div>

              <div className="space-y-1.5">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  <span>1. Objeto y Alcance Pedagógico Multidisciplinar</span>
                </h4>
                <p className="text-xs sm:text-[13px] text-slate-600">
                  Tutor-IA es un asistente inteligente de apoyo al aprendizaje para educación primaria y secundaria, que abarca 18 asignaturas escolares (incluyendo matemáticas, ciencias naturales, física, química, lenguaje, ciencias sociales, idiomas y artes). Su propósito es orientador y formativo: <strong>no sustituye el criterio, la instrucción ni la evaluación de docentes, directivos o instituciones educativas formales</strong>, ni emite certificaciones oficiales con valor curricular.
                </p>
              </div>

              <div className="space-y-1.5">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span>2. Naturaleza de la Inteligencia Artificial y Exclusión de Garantías</span>
                </h4>
                <p className="text-xs sm:text-[13px] text-slate-600">
                  Las respuestas, correcciones, desgloses paso a paso y síntesis son generadas mediante modelos computacionales de lenguaje e Inteligencia Artificial de terceros de última generación. Dada la naturaleza probabilística de la IA:
                </p>
                <ul className="list-disc list-inside mt-1 text-xs text-slate-600 space-y-1 pl-1">
                  <li>Las respuestas pueden contener imprecisiones, interpretaciones desactualizadas o alucinaciones matemáticas/textuales.</li>
                  <li><strong>Tutor-IA no garantiza ni promete la obtención de notas, calificaciones aprobatorias o logros académicos</strong> específicos en colegios o exámenes oficiales.</li>
                  <li>El estudiante y sus tutores legales tienen la carga de verificar y contrastar los resultados con el material de sus libros escolares y guías docentes antes de presentar cualquier deber.</li>
                </ul>
              </div>

              <div className="space-y-1.5">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  <span>3. Licencia de Uso Personal, Individual e Intransferible</span>
                </h4>
                <p className="text-xs sm:text-[13px] text-slate-600">
                  El acceso a la plataforma y las suscripciones son licencias de uso final personales. Queda terminantemente prohibido:
                </p>
                <ul className="list-disc list-inside mt-1 text-xs text-slate-600 space-y-1 pl-1">
                  <li>Revender, sublicenciar, multiprestar o comercializar el acceso a terceros o grupos no autorizados.</li>
                  <li>Integrar la plataforma a sistemas externos mediante scraping, bots, ingeniería inversa o automatizaciones no documentadas.</li>
                  <li>Compartir masivamente una sola cuenta en centros educativos, academias o cibercafés para burlar los cupos de consulta.</li>
                </ul>
              </div>

              <div className="space-y-1.5">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-slate-700" />
                  <span>4. Limitación Total de Responsabilidad e Indemnidad</span>
                </h4>
                <p className="text-xs sm:text-[13px] text-slate-600">
                  En la máxima medida permitida por la ley colombiana y los tratados internacionales de comercio electrónico, los creadores y operadores de Tutor-IA no responderán por daños directos, indirectos, consecuenciales, morales o académicos derivados de: (a) fallas técnicas o interrupciones de servicios de conectividad o APIs de terceros; (b) reprobación de asignaturas, tareas o evaluaciones; (c) interpretaciones erradas de las respuestas suministradas por la IA; ni (d) el uso indebido de la plataforma por parte de menores o adultos.
                </p>
              </div>

              <div className="space-y-1.5">
                <h4 className="text-sm font-bold text-slate-900">
                  5. Cupos, Cortesías y Condiciones de Suscripción
                </h4>
                <p className="text-xs sm:text-[13px] text-slate-600">
                  Todo usuario registrado recibe de cortesía <strong>3 consultas de bienvenida</strong>. El plan mensual voluntario tiene un costo de <strong>$10.000 COP</strong> por 30 días calendario y otorga un límite de hasta <strong>10 consultas diarias</strong> para revisión escolar. Al expirar los 30 días, el usuario podrá renovar libremente sin cargos recurrentes sorpresa ni cobros automáticos ocultos.
                </p>
              </div>

              <div className="space-y-1.5">
                <h4 className="text-sm font-bold text-slate-900">
                  6. Filtro Ético y Derecho de Admisión o Cancelación
                </h4>
                <p className="text-xs sm:text-[13px] text-slate-600">
                  Tutor-IA cuenta con filtros de contexto que bloquean automáticamente consultas inapropiadas (contenido para adultos, violencia, actividades ilícitas o ajenas al ámbito escolar). La administración se reserva el derecho de cancelar o suspender temporal o definitivamente cuentas que reiteradamente intenten vulnerar las normas éticas o técnicas de la plataforma.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: PRIVACIDAD Y PROTECCIÓN DE DATOS (HABEAS DATA LEY 1581) */}
          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-emerald-50/80 rounded-xl border border-emerald-200/70 flex items-start gap-3">
                <Lock className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-xs text-emerald-950 font-medium leading-relaxed">
                  <strong className="font-bold">Privacidad y Procesamiento Efímero:</strong> No vendemos datos a empresas publicitarias. Las imágenes de cuadernos y tareas se procesan en memoria en tiempo real exclusivamente para resolver la duda pedagógica y <strong>no quedan almacenadas en repositorios públicos</strong>.
                </p>
              </div>

              <div className="space-y-1.5">
                <h4 className="text-sm font-bold text-slate-900">
                  1. Marco Regulatorio (Ley Estatutaria 1581 de 2012 de Colombia)
                </h4>
                <p className="text-xs sm:text-[13px] text-slate-600">
                  En cumplimiento de la legislación colombiana sobre protección de datos personales (Habeas Data, Ley 1581 de 2012, Decreto 1377 de 2013 y normatividad concordante), el tratamiento de los datos recolectados se realiza bajo estrictos principios de finalidad, necesidad, seguridad y confidencialidad.
                </p>
              </div>

              <div className="space-y-1.5">
                <h4 className="text-sm font-bold text-slate-900">
                  2. Protección Prioritaria a Menores de Edad
                </h4>
                <p className="text-xs sm:text-[13px] text-slate-600">
                  En observancia de los artículos 7 de la Ley 1581 de 2012 y 12 del Decreto 1377 de 2013:
                </p>
                <ul className="list-disc list-inside mt-1 text-xs text-slate-600 space-y-1 pl-1">
                  <li>El registro y uso por parte de menores de edad debe contar siempre con la debida supervisión y autorización previa de sus padres o representantes legales.</li>
                  <li>Tutor-IA <strong>no recopila datos sensibles</strong>, tales como ubicación por GPS en tiempo real, documentos de identidad física del menor, ni nombres y sedes específicas de su institución educativa.</li>
                </ul>
              </div>

              <div className="space-y-1.5">
                <h4 className="text-sm font-bold text-slate-900">
                  3. Datos Mínimos Tratados y sus Finalidades
                </h4>
                <ul className="list-disc list-inside text-xs sm:text-[13px] text-slate-600 space-y-1 pl-1">
                  <li><strong className="text-slate-800">Correo electrónico y perfil de autenticación (Google OAuth):</strong> Exclusivamente para verificar identidad de acceso, asociar las consultas de cortesía y verificar vigencia de suscripción de 30 días.</li>
                  <li><strong className="text-slate-800">Contador técnico de peticiones:</strong> Registro numérico para evitar abusos y respetar el cupo asignado al usuario.</li>
                  <li><strong className="text-slate-800">Imágenes y enunciados de tareas:</strong> Procesamiento efímero temporal para extracción OCR y respuesta de la IA. No se utilizan para entrenar modelos públicos ni para elaboración de perfiles comerciales.</li>
                </ul>
              </div>

              <div className="space-y-1.5">
                <h4 className="text-sm font-bold text-slate-900">
                  4. Ejercicio de Derechos de Habeas Data
                </h4>
                <p className="text-xs sm:text-[13px] text-slate-600">
                  Como titular de los datos o en representación del menor a su cargo, puede solicitar en cualquier momento la consulta, rectificación, revocatoria de consentimiento o supresión definitiva de su cuenta y registros, enviando una comunicación al correo electrónico oficial: <strong className="text-slate-800">{SUPPORT_EMAIL}</strong>.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: CONTACTO Y SOPORTE */}
          {activeTab === 'support' && (
            <div className="space-y-4">
              <p className="text-xs sm:text-sm text-slate-600">
                ¿Tienes dudas sobre las herramientas pedagógicas, necesitas validar un pago o requieres asistencia técnica directa? Estamos a tu disposición:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Canal WhatsApp */}
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-emerald-300 transition-all">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-2.5">
                      <MessageCircle className="w-5 h-5 text-emerald-600" />
                    </div>
                    <h5 className="text-sm font-bold text-slate-900">WhatsApp de Atención</h5>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Para coordinación y confirmación de pagos de suscripción escolar ($10.000 COP) y activación inmediata.
                    </p>
                  </div>

                  <a
                    href={whatsappSupportUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs"
                  >
                    <span>Abrir Chat de WhatsApp</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Canal Correo Electrónico */}
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-indigo-300 transition-all">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center mb-2.5">
                      <Mail className="w-5 h-5 text-indigo-600" />
                    </div>
                    <h5 className="text-sm font-bold text-slate-900">Correo Electrónico</h5>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Para consultas institucionales, solicitudes de revocatoria de datos (Habeas Data) o soporte técnico formal.
                    </p>
                    <code className="inline-block mt-2 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-mono text-slate-700 break-all select-all">
                      {SUPPORT_EMAIL}
                    </code>
                  </div>

                  <button
                    onClick={handleCopyEmail}
                    className="mt-4 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all border border-slate-200"
                  >
                    {copiedEmail ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700 font-bold">Correo copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar dirección</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="p-3.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
                <p>⏰ <strong className="text-slate-800">Horario de atención:</strong> Lunes a viernes en jornada diurna escolar (respuesta en un plazo máximo de 24 horas hábiles).</p>
                <p>🤝 <strong className="text-slate-800">Canal verificado:</strong> Equipo de soporte oficial de Tutor-IA.</p>
              </div>

              {onOpenPayment && !isSubscriptionActive && (
                <div className="pt-1">
                  <button
                    onClick={() => {
                      onClose();
                      onOpenPayment();
                    }}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white text-xs sm:text-sm font-semibold rounded-xl cursor-pointer flex items-center justify-center gap-2 shadow-xs transition-all"
                  >
                    <span>Ver cómo activar mi suscripción mensual ($10.000 COP)</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pie de modal */}
        <div className="mt-5 pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <span className="text-[11px]">
            Última actualización: Noviembre 2026 • Versión 2.0 Bento
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 rounded-xl cursor-pointer transition-all active:scale-95"
          >
            Cerrar ventana
          </button>
        </div>
      </div>
    </div>
  );
};
