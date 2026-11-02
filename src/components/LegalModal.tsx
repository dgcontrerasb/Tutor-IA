/**
 * Modal Legal y de Soporte:
 * 1. Términos de Servicio y Uso Personal (Blindaje legal completo)
 * 2. Política de Privacidad y Protección de Menores (Habeas Data / Ley 1581 de 2012)
 * 3. Canales Oficiales de Contacto y Soporte
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
      className="fixed inset-0 z-50 overflow-y-auto bg-black/65 backdrop-blur-xs p-3 sm:p-6 flex items-start justify-center animate-in fade-in duration-150"
    >
      <div className="relative w-full max-w-3xl bg-[#FAF7EE] rounded-2xl border-[3px] border-[#1A1A1A] shadow-[8px_8px_0px_#1A1A1A] p-5 sm:p-7 text-[#1A1A1A] my-4 sm:my-8 max-h-[92vh] overflow-y-auto">
        {/* Washi tapes decorativos */}
        <div className="washi-tape top-2.5 left-10 w-28"></div>
        <div className="washi-tape washi-tape-coral top-2.5 right-12 w-24"></div>

        {/* Botón Cerrar */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 p-2 bg-[#FF8B94] hover:bg-[#ff7580] rounded-xl border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] cursor-pointer z-20 active:translate-x-0.5 active:translate-y-0.5 transition-all"
          title="Cerrar"
        >
          <X className="w-5 h-5 text-[#1A1A1A]" />
        </button>

        {/* Encabezado */}
        <div className="text-center mb-5 mt-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFE66D] border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] text-xs font-black uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-900" />
            Marco Legal, Privacidad y Soporte
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#1A1A1A]">
            Tutor-IA Escolar
          </h2>
          <p className="text-xs sm:text-sm font-semibold text-[#1A1A1A]/70 mt-0.5">
            Información legal transparente y canales de atención directa
          </p>
        </div>

        {/* Selector de pestañas */}
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mb-5 p-1.5 bg-white rounded-xl border-2 border-[#1A1A1A] shadow-[3px_3px_0px_#1A1A1A]">
          <button
            onClick={() => setActiveTab('terms')}
            className={`py-2 px-1 sm:px-3 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'terms'
                ? 'bg-[#FFE66D] border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A]'
                : 'hover:bg-[#FAF7EE] text-[#1A1A1A]/80'
            }`}
          >
            <FileText className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Términos de Servicio</span>
          </button>

          <button
            onClick={() => setActiveTab('privacy')}
            className={`py-2 px-1 sm:px-3 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'privacy'
                ? 'bg-[#A8E6CF] border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A]'
                : 'hover:bg-[#FAF7EE] text-[#1A1A1A]/80'
            }`}
          >
            <Lock className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Privacidad y Datos</span>
          </button>

          <button
            onClick={() => setActiveTab('support')}
            className={`py-2 px-1 sm:px-3 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'support'
                ? 'bg-[#A0E7E5] border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A]'
                : 'hover:bg-[#FAF7EE] text-[#1A1A1A]/80'
            }`}
          >
            <Headphones className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Contacto y Soporte</span>
          </button>
        </div>

        {/* Contenido de cada pestaña */}
        <div className="bg-white rounded-xl border-2 border-[#1A1A1A] shadow-[4px_4px_0px_#1A1A1A] p-4 sm:p-6 text-xs sm:text-sm font-medium leading-relaxed text-[#1A1A1A] space-y-4">
          {/* TAB 1: TÉRMINOS DE SERVICIO */}
          {activeTab === 'terms' && (
            <div className="space-y-4">
              <div className="p-3 bg-[#FFF9E6] rounded-xl border-2 border-[#1A1A1A] flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
                <p className="text-xs font-bold text-amber-950">
                  <strong>Resumen clave:</strong> Tutor-IA es un tutor escolar de apoyo educativo con Inteligencia Artificial. Su uso es estrictamente personal e individual para la realización de tareas escolares.
                </p>
              </div>

              <div>
                <h4 className="text-sm font-black text-[#1A1A1A] uppercase tracking-wide mb-1">
                  1. Naturaleza y Finalidad del Servicio
                </h4>
                <p className="text-xs sm:text-[13px] text-[#1A1A1A]/80">
                  Tutor-IA es una herramienta web de apoyo pedagógico diseñada para asistir a estudiantes de educación básica primaria y secundaria en la corrección ortográfica, síntesis de textos y análisis de comprensión lectora. <strong>No sustituye</strong> la labor de los docentes de aula, tutores pedagógicos ni instituciones educativas formales, ni emite certificaciones oficiales de calificaciones.
                </p>
              </div>

              <div>
                <h4 className="text-sm font-black text-[#1A1A1A] uppercase tracking-wide mb-1 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-emerald-700" />
                  <span>2. Uso Estrictamente Personal, Individual e Intransferible</span>
                </h4>
                <p className="text-xs sm:text-[13px] text-[#1A1A1A]/80">
                  La cuenta registrada y el plan de suscripción están vinculados al correo electrónico del titular y son para <strong>uso estrictamente personal</strong>. Queda expresamente prohibido:
                </p>
                <ul className="list-disc list-inside mt-1.5 text-xs text-[#1A1A1A]/80 space-y-1 pl-1">
                  <li>Revender, sublicenciar, alquilar o comercializar el acceso a la plataforma a terceros.</li>
                  <li>Compartir credenciales para el uso simultáneo o masivo en centros educativos o empresas.</li>
                  <li>Utilizar mecanismos automatizados, bots o scripts para consultar la herramienta como una API externa.</li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-black text-[#1A1A1A] uppercase tracking-wide mb-1">
                  3. Cupos de Consulta y Ciclo de Suscripción
                </h4>
                <p className="text-xs sm:text-[13px] text-[#1A1A1A]/80">
                  El usuario nuevo cuenta con <strong>3 consultas gratuitas de prueba</strong> como cortesía de bienvenida. Para acceder al servicio continuo, el usuario puede adquirir el plan escolar mensual por <strong>$5.000 COP</strong> (pesos colombianos) por un periodo de 30 días calendario, que otorga un cupo de hasta <strong>10 consultas diarias</strong> para revisión de tareas escolares. Al término de los 30 días, la suscripción expira y podrá renovarse voluntariamente.
                </p>
              </div>

              <div>
                <h4 className="text-sm font-black text-[#1A1A1A] uppercase tracking-wide mb-1">
                  4. Bloqueador de Contexto y Uso Ético Escolar
                </h4>
                <p className="text-xs sm:text-[13px] text-[#1A1A1A]/80">
                  La plataforma cuenta con un <strong>filtro ético de contexto escolar</strong>. Tutor-IA rechazará de manera automática solicitudes que no correspondan a tareas o deberes escolares (incluyendo consultas de adultos, material violento o ilícito, programación no escolar, o temas ajenos al aprendizaje). Dichos rechazos conservarán el saldo del usuario pero alertarán sobre el uso debido.
                </p>
              </div>

              <div>
                <h4 className="text-sm font-black text-[#1A1A1A] uppercase tracking-wide mb-1">
                  5. Exención y Límite de Responsabilidad
                </h4>
                <p className="text-xs sm:text-[13px] text-[#1A1A1A]/80">
                  Aunque los modelos de Inteligencia Artificial utilizados son de última generación pedagógica, pueden contener imprecisiones ocasionales. El estudiante y sus acudientes son responsables de evaluar críticamente las correcciones y sugerencias. Tutor-IA no asume responsabilidad por valoraciones o calificaciones escolares asignadas por terceros.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: PRIVACIDAD Y PROTECCIÓN DE DATOS */}
          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <div className="p-3 bg-[#E8F8F5] rounded-xl border-2 border-[#1A1A1A] flex items-start gap-2.5">
                <Lock className="w-5 h-5 text-emerald-800 shrink-0 mt-0.5" />
                <p className="text-xs font-bold text-emerald-950">
                  <strong>Compromiso de privacidad:</strong> No almacenamos las fotos de los cuadernos en bases de datos públicas. Las imágenes se leen en tiempo real únicamente para generar la corrección pedagógica y se descartan.
                </p>
              </div>

              <div>
                <h4 className="text-sm font-black text-[#1A1A1A] uppercase tracking-wide mb-1">
                  1. Cumplimiento Legal (Ley 1581 de 2012 / Habeas Data)
                </h4>
                <p className="text-xs sm:text-[13px] text-[#1A1A1A]/80">
                  En cumplimiento de la legislación colombiana de protección de datos personales (Ley Estatutaria 1581 de 2012, Decreto 1377 de 2013 y normativas concordantes), le informamos que los datos suministrados son tratados de forma confidencial, lícita y con fines exclusivos del funcionamiento del servicio escolar.
                </p>
              </div>

              <div>
                <h4 className="text-sm font-black text-[#1A1A1A] uppercase tracking-wide mb-1">
                  2. Protección Especial a Niños, Niñas y Adolescentes
                </h4>
                <p className="text-xs sm:text-[13px] text-[#1A1A1A]/80">
                  Reconocemos el interés superior de los menores de edad. El uso de esta aplicación por parte de menores debe contar con el conocimiento y autorización de sus padres, madres o acudientes legales. Tutor-IA no recopila información personal sensible como direcciones de residencia, teléfonos de menores ni nombres de sus instituciones educativas.
                </p>
              </div>

              <div>
                <h4 className="text-sm font-black text-[#1A1A1A] uppercase tracking-wide mb-1">
                  3. Datos Recopilados y su Finalidad
                </h4>
                <ul className="list-disc list-inside text-xs sm:text-[13px] text-[#1A1A1A]/80 space-y-1 pl-1">
                  <li><strong>Correo electrónico de Google:</strong> Utilizado únicamente para autenticar la cuenta, asociar los 3 usos de prueba y registrar la vigencia de la suscripción de 30 días.</li>
                  <li><strong>Contador de consultas:</strong> Número de revisiones realizadas para el control del límite diario (10 al día) o de bienvenida (3 de prueba).</li>
                  <li><strong>Textos y fotos de tareas:</strong> Son procesados de forma efímera en la memoria del servidor para realizar el análisis ortográfico y resumen pedagógico, sin ser empleados para publicidad ni cedidos a terceros comerciales.</li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-black text-[#1A1A1A] uppercase tracking-wide mb-1">
                  4. Derechos de los Titulares
                </h4>
                <p className="text-xs sm:text-[13px] text-[#1A1A1A]/80">
                  El titular del correo electrónico o su representante legal tienen derecho a conocer, actualizar y solicitar la supresión de sus datos de nuestro registro en cualquier momento enviando una solicitud a nuestro correo de contacto oficial <strong>{SUPPORT_EMAIL}</strong>.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: CONTACTO Y SOPORTE */}
          {activeTab === 'support' && (
            <div className="space-y-4">
              <p className="text-xs sm:text-sm text-[#1A1A1A]/80">
                ¿Tienes preguntas sobre el uso de la herramienta, deseas activar tu suscripción escolar o necesitas ayuda con una cuenta? Estamos a tu disposición:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Canal WhatsApp */}
                <div className="p-4 bg-[#FAF7EE] rounded-xl border-2 border-[#1A1A1A] shadow-[3px_3px_0px_#1A1A1A] flex flex-col justify-between">
                  <div>
                    <div className="w-9 h-9 rounded-lg bg-[#25D366] border border-[#1A1A1A] flex items-center justify-center mb-2.5">
                      <MessageCircle className="w-5 h-5 text-white" />
                    </div>
                    <h5 className="text-sm font-black text-[#1A1A1A]">WhatsApp de Atención</h5>
                    <p className="text-[11px] font-bold text-[#1A1A1A]/70 mt-1">
                      Para coordinación de pagos ($5.000 COP), comprobantes y activación de suscripciones.
                    </p>
                  </div>

                  <a
                    href={whatsappSupportUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="neo-btn mt-3 py-2 px-3 bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-black rounded-lg flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_#1A1A1A]"
                  >
                    <span>Abrir Chat de WhatsApp</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Canal Correo Electrónico */}
                <div className="p-4 bg-[#FAF7EE] rounded-xl border-2 border-[#1A1A1A] shadow-[3px_3px_0px_#1A1A1A] flex flex-col justify-between">
                  <div>
                    <div className="w-9 h-9 rounded-lg bg-[#FFE66D] border border-[#1A1A1A] flex items-center justify-center mb-2.5">
                      <Mail className="w-5 h-5 text-[#1A1A1A]" />
                    </div>
                    <h5 className="text-sm font-black text-[#1A1A1A]">Correo Electrónico</h5>
                    <p className="text-[11px] font-bold text-[#1A1A1A]/70 mt-1">
                      Para solicitudes formales de soporte, consultas sobre privacidad o eliminación de datos.
                    </p>
                    <code className="inline-block mt-2 px-2 py-0.5 rounded bg-white border border-[#1A1A1A] text-[11px] font-mono font-bold break-all">
                      {SUPPORT_EMAIL}
                    </code>
                  </div>

                  <button
                    onClick={handleCopyEmail}
                    className="neo-btn mt-3 py-2 px-3 bg-white text-[#1A1A1A] text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_#1A1A1A]"
                  >
                    {copiedEmail ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Correo copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar correo</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border-2 border-[#1A1A1A] text-xs text-[#1A1A1A]/80 font-bold space-y-1">
                <p>⏰ <strong>Horario de atención:</strong> Lunes a viernes en jornada diurna escolar (respuesta dentro de las 24 horas siguientes).</p>
                <p>🤝 <strong>Atención directa:</strong> Equipo de soporte oficial de Tutor-IA.</p>
              </div>

              {onOpenPayment && !isSubscriptionActive && (
                <div className="pt-2">
                  <button
                    onClick={() => {
                      onClose();
                      onOpenPayment();
                    }}
                    className="neo-btn w-full py-3 bg-[#FFE66D] hover:bg-[#fedd48] text-[#1A1A1A] text-xs sm:text-sm font-black rounded-xl cursor-pointer flex items-center justify-center gap-2 shadow-[3px_3px_0px_#1A1A1A]"
                  >
                    <span>Ver cómo activar mi suscripción mensual ($5.000 COP)</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pie de modal */}
        <div className="mt-4 pt-3 flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-[#1A1A1A]/70">
          <span className="text-[11px]">
            Última actualización: Octubre 2026 • Versión 1.2
          </span>
          <button
            onClick={onClose}
            className="neo-btn px-4 py-1.5 bg-[#FAF7EE] hover:bg-white text-xs font-black text-[#1A1A1A] rounded-lg cursor-pointer shadow-[2px_2px_0px_#1A1A1A]"
          >
            Cerrar ventana
          </button>
        </div>
      </div>
    </div>
  );
};
