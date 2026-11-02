import React, { useState } from 'react';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  RefreshCw,
  X,
  Key,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export type ServiceStatus = 'idle' | 'testing' | 'online' | 'rate_limited' | 'error' | 'not_configured';

export interface ServiceDiagnostic {
  name: string;
  role: string;
  status: ServiceStatus;
  latencyMs?: number;
  message?: string;
  details?: string;
}

/**
 * Sanea y valida la API Key de Groq protegiendo contra errores comunes de copiado móvil
 */
export function sanitizeGroqKey(rawKey?: string | null): {
  cleanKey: string;
  isValidFormat: boolean;
  maskedPreview: string;
  error?: string;
} {
  if (!rawKey) {
    return { cleanKey: '', isValidFormat: false, maskedPreview: 'No configurada' };
  }

  // 1. Eliminar espacios y saltos de línea invisibles
  let clean = rawKey.trim();

  // 2. Eliminar comillas iniciales o finales accidentales
  clean = clean.replace(/^["'`]|["'`]$/g, '').trim();

  // 3. Remover prefijo 'Bearer ' si se copió junto a la clave
  if (clean.toLowerCase().startsWith('bearer ')) {
    clean = clean.substring(7).trim();
  }

  if (!clean) {
    return { cleanKey: '', isValidFormat: false, maskedPreview: 'Vacía' };
  }

  const isValidFormat = clean.startsWith('gsk_');
  const maskedPreview =
    clean.length >= 11
      ? `${clean.slice(0, 7)}...${clean.slice(-4)}`
      : `${clean.slice(0, 4)}...`;

  if (!isValidFormat) {
    return {
      cleanKey: clean,
      isValidFormat: false,
      maskedPreview,
      error: 'La clave debe iniciar con gsk_',
    };
  }

  return { cleanKey: clean, isValidFormat: true, maskedPreview };
}

export function DiagnosticModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [customGroqKey, setCustomGroqKey] = useState<string>(() => {
    return localStorage.getItem('cp_debug_groq_key') || (import.meta.env.VITE_GROQ_API_KEY as string) || '';
  });
  const [showKeyInputs, setShowKeyInputs] = useState(false);

  const activeSanitized = sanitizeGroqKey(
    customGroqKey || (typeof window !== 'undefined' ? localStorage.getItem('cp_debug_groq_key') : null) || (import.meta.env.VITE_GROQ_API_KEY as string) || ''
  );

  const [diagnostics, setDiagnostics] = useState<ServiceDiagnostic[]>([
    {
      name: 'Groq Cloud',
      role: 'Nivel 1 - openai/gpt-oss-120b (Texto) / qwen3.8-27b (Visión)',
      status: 'idle',
      message: 'Pendiente de prueba',
    },
    {
      name: 'Pollinations AI',
      role: 'Nivel 2 - Respaldo Inmediato (Sin Key ni Registro)',
      status: 'idle',
      message: 'Pendiente de prueba',
    },
    {
      name: 'Wikipedia REST API',
      role: 'Nivel 3 - Glosario y Respaldo Escolar',
      status: 'idle',
      message: 'Pendiente de prueba',
    },
  ]);

  const updateServiceState = (index: number, patch: Partial<ServiceDiagnostic>) => {
    setDiagnostics((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  };

  const runAllTests = async () => {
    setIsRunning(true);

    // 1. TEST GROQ: Inspección de modelos oficiales y diagnóstico en vivo
    updateServiceState(0, { status: 'testing', message: 'Consultando modelos activos en Groq Cloud...' });

    // Prioridad de lectura: 1. Input/localStorage -> 2. import.meta.env
    const rawCandidate =
      customGroqKey ||
      (typeof window !== 'undefined' ? localStorage.getItem('cp_debug_groq_key') : null) ||
      (import.meta.env.VITE_GROQ_API_KEY as string) ||
      '';

    const { cleanKey: groqKey, isValidFormat, maskedPreview, error: formatError } = sanitizeGroqKey(rawCandidate);

    if (!groqKey) {
      updateServiceState(0, {
        status: 'not_configured',
        latencyMs: 0,
        message: 'Sin API Key configurada.',
        details: 'Pega tu clave abajo para activarla al instante.',
      });
    } else if (!isValidFormat) {
      updateServiceState(0, {
        status: 'error',
        latencyMs: 0,
        message: 'La clave debe iniciar con gsk_',
        details: `Clave detectada: [${maskedPreview}]. Revisa si copiaste caracteres o comillas extra.`,
      });
    } else {
      // Guardar clave limpia en localStorage
      localStorage.setItem('cp_debug_groq_key', groqKey);
      const t0 = Date.now();
      try {
        // Paso 1: Consultar ruta oficial de modelos (/v1/models)
        const modelsRes = await fetch('https://api.groq.com/openai/v1/models', {
          headers: {
            Authorization: `Bearer ${groqKey}`,
          },
          signal: AbortSignal.timeout(8000),
        });

        const latency = Date.now() - t0;

        // Caso 401: Llave inválida o mal copiada
        if (modelsRes.status === 401) {
          updateServiceState(0, {
            status: 'error',
            latencyMs: latency,
            message: 'API Key de Groq no válida o mal copiada (401 Unauthorized).',
            details: `Clave leída: [${maskedPreview}]. Genera una nueva en console.groq.com -> API Keys.`,
          });
        } else if (modelsRes.status === 429) {
          updateServiceState(0, {
            status: 'rate_limited',
            latencyMs: latency,
            message: 'Cuota temporal de Groq alcanzada (429 Rate Limit).',
            details: `Clave activa: [${maskedPreview}]. Conmutando a Pollinations AI.`,
          });
        } else if (modelsRes.ok) {
          const modelsData = (await modelsRes.json()) as { data?: Array<{ id: string }> };
          const allModelIds = (modelsData.data || []).map((m) => m.id);
          
          // Filtrar modelos de texto (excluyendo whisper, embeddings o guard)
          const textModels = allModelIds.filter(
            (id) => !id.includes('whisper') && !id.includes('vision') && !id.includes('guard')
          );
          const top3Models = textModels.slice(0, 3);
          const targetModel = 'openai/gpt-oss-120b';

          // Paso 2: Test de inferencia con openai/gpt-oss-120b y mensajes compatibles con JSON
          let testRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${groqKey}`,
            },
            body: JSON.stringify({
              model: targetModel,
              response_format: { type: 'json_object' },
              messages: [
                {
                  role: 'system',
                  content: 'Eres un evaluador de conectividad. Tu respuesta debe ser un objeto JSON válido con la estructura solicitada.',
                },
                {
                  role: 'user',
                  content: 'Responde únicamente en formato JSON con la clave status: {"status": "ok"}',
                },
              ],
              max_tokens: 25,
            }),
            signal: AbortSignal.timeout(9000),
          });

          // Si el validador estricto de JSON de Groq arroja 400 por reglas de prompt, reintentar como ping libre
          if (testRes.status === 400) {
            testRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${groqKey}`,
              },
              body: JSON.stringify({
                model: targetModel,
                messages: [{ role: 'user', content: 'Responde únicamente OK' }],
                max_tokens: 10,
              }),
              signal: AbortSignal.timeout(9000),
            });
          }

          const totalLatency = Date.now() - t0;

          if (testRes.ok) {
            updateServiceState(0, {
              status: 'online',
              latencyMs: totalLatency,
              message: `Conexión exitosa con: ${targetModel}`,
              details: `Clave activa: [${maskedPreview}] • Catálogo verificado: [${top3Models.join(', ')}]`,
            });
          } else if (testRes.status === 429) {
            updateServiceState(0, {
              status: 'rate_limited',
              latencyMs: totalLatency,
              message: 'Cuota de inferencia alcanzada (429 Rate Limit).',
              details: `Clave: [${maskedPreview}] • Modelos: [${top3Models.join(', ')}]. Conmutando a Pollinations.`,
            });
          } else {
            const errText = await testRes.text().catch(() => '');
            updateServiceState(0, {
              status: 'error',
              latencyMs: totalLatency,
              message: `Error ${testRes.status} al llamar a ${targetModel}`,
              details: `Clave: [${maskedPreview}] • ${errText.slice(0, 80)}`,
            });
          }
        } else {
          const errText = await modelsRes.text().catch(() => '');
          updateServiceState(0, {
            status: 'error',
            latencyMs: latency,
            message: `Error HTTP ${modelsRes.status} al consultar catálogo Groq`,
            details: `Clave: [${maskedPreview}]. ${errText.slice(0, 80)}`,
          });
        }
      } catch (err: unknown) {
        updateServiceState(0, {
          status: 'error',
          latencyMs: Date.now() - t0,
          message: 'Error de conexión o CORS al consultar Groq.',
          details: `Clave: [${maskedPreview}]. Configurando automáticamente llama-3.1-8b-instant. ` + (err instanceof Error ? err.message : ''),
        });
      }
    }

    // 2. TEST POLLINATIONS AI (Sin Key)
    updateServiceState(1, { status: 'testing', message: 'Conectando con Pollinations AI (Sin Key)...' });
    {
      const t0 = Date.now();
      try {
        let isSuccess = false;
        let lastStatus = 0;

        // Intento 1: Endpoint de texto sin key
        try {
          const res = await fetch('https://text.pollinations.ai/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              messages: [{ role: 'user', content: 'Di OK' }],
              model: 'openai',
            }),
            signal: AbortSignal.timeout(9000),
          });
          lastStatus = res.status;
          if (res.ok) isSuccess = true;
        } catch {}

        // Intento 2: Gateway unificado gen.pollinations.ai
        if (!isSuccess) {
          try {
            const res2 = await fetch('https://gen.pollinations.ai/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: 'openai',
                messages: [{ role: 'user', content: 'Di OK' }],
              }),
              signal: AbortSignal.timeout(9000),
            });
            lastStatus = res2.status;
            if (res2.ok) isSuccess = true;
          } catch {}
        }

        const latency = Date.now() - t0;
        if (isSuccess) {
          updateServiceState(1, {
            status: 'online',
            latencyMs: latency,
            message: 'Conexión exitosa y abierta (200 OK).',
            details: 'Motor 100% gratuito sin API Key operativo como respaldo inmediato.',
          });
        } else {
          updateServiceState(1, {
            status: 'error',
            latencyMs: latency,
            message: lastStatus ? `Servidor con respuesta (${lastStatus}).` : 'Tiempo de espera agotado en Pollinations.',
            details: 'Pollinations ocupado o en mantenimiento temporal.',
          });
        }
      } catch (err: unknown) {
        updateServiceState(1, {
          status: 'error',
          latencyMs: Date.now() - t0,
          message: 'Tiempo de espera agotado en Pollinations.',
          details: err instanceof Error ? err.message : 'Timeout de red',
        });
      }
    }

    // 3. TEST WIKIPEDIA REST API
    updateServiceState(2, { status: 'testing', message: 'Consultando concepto escolar de prueba...' });
    {
      const t0 = Date.now();
      try {
        const res = await fetch('https://es.wikipedia.org/api/rest_v1/page/summary/Fotos%C3%ADntesis', {
          signal: AbortSignal.timeout(5000),
        });
        const latency = Date.now() - t0;
        if (res.ok) {
          const data = (await res.json()) as { extract?: string };
          updateServiceState(2, {
            status: 'online',
            latencyMs: latency,
            message: 'Conexión impecable con Wikipedia en español.',
            details: `Respuesta recibida: "${data.extract?.slice(0, 70)}..."`,
          });
        } else {
          updateServiceState(2, {
            status: 'error',
            latencyMs: latency,
            message: `Respuesta HTTP ${res.status}`,
            details: 'Error al consultar API de Wikipedia.',
          });
        }
      } catch (err: unknown) {
        updateServiceState(2, {
          status: 'error',
          latencyMs: Date.now() - t0,
          message: 'Error de red o sin conexión a internet.',
          details: err instanceof Error ? err.message : 'Fallo de consulta',
        });
      }
    }

    setIsRunning(false);
  };

  const getStatusBadge = (status: ServiceStatus) => {
    switch (status) {
      case 'online':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-[#A8E6CF] text-[#1B4332] border border-[#1A1A1A]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#1B4332]" />
            🟢 ONLINE
          </span>
        );
      case 'rate_limited':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-[#FFE66D] text-[#7A5800] border border-[#1A1A1A]">
            <AlertTriangle className="w-3.5 h-3.5 text-[#7A5800]" />
            🟡 CUOTA EXCEDIDA (429)
          </span>
        );
      case 'error':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-[#FF8B8B] text-[#5A0B0B] border border-[#1A1A1A]">
            <XCircle className="w-3.5 h-3.5 text-[#5A0B0B]" />
            🔴 ERROR
          </span>
        );
      case 'not_configured':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-[#E2E8F0] text-[#475569] border border-[#1A1A1A]">
            <Clock className="w-3.5 h-3.5 text-[#475569]" />
            ⚪ NO CONFIGURADO
          </span>
        );
      case 'testing':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-[#A0E7E5] text-[#004B49] border border-[#1A1A1A] animate-pulse">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#004B49]" />
            PROBANDO...
          </span>
        );
      case 'idle':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-white text-[#1A1A1A]/70 border border-[#1A1A1A]/40">
            ⏳ SIN PROBAR
          </span>
        );
    }
  };

  return (
    <>
      {/* Botón flotante Neobrutalista ergonómico para celular */}
      <button
        onClick={() => {
          setIsOpen(true);
          // Si nunca se ha ejecutado el test, lanzarlo automáticamente al abrir
          if (diagnostics.every((d) => d.status === 'idle')) {
            setTimeout(runAllTests, 100);
          }
        }}
        aria-label="Abrir Diagnóstico Visual de IA"
        className="fixed bottom-4 left-4 z-40 flex items-center gap-2 px-3.5 py-2.5 bg-[#FFE66D] hover:bg-[#FFD93D] active:translate-x-0.5 active:translate-y-0.5 rounded-2xl border-2 border-[#1A1A1A] shadow-[3px_3px_0px_#1A1A1A] font-black text-xs text-[#1A1A1A] cursor-pointer transition-all select-none"
      >
        <Activity className="w-4 h-4 text-[#1A1A1A]" />
        <span>Diagnóstico IA</span>
      </button>

      {/* Modal Neobrutalista táctil y 100% responsivo */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-[#1A1A1A]/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
        >
          <div className="bg-[#FFFDF7] border-3 border-[#1A1A1A] rounded-2xl shadow-[6px_6px_0px_#1A1A1A] w-full max-w-lg overflow-hidden flex flex-col my-auto max-h-[92vh]">
            {/* Header del Modal */}
            <div className="bg-[#FFE66D] border-b-3 border-[#1A1A1A] p-3.5 sm:p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-white border-2 border-[#1A1A1A] flex items-center justify-center shadow-[2px_2px_0px_#1A1A1A]">
                  <Activity className="w-4 h-4 text-[#1A1A1A]" />
                </div>
                <div>
                  <h3 className="font-black text-base text-[#1A1A1A] leading-tight">
                    Diagnóstico en Vivo
                  </h3>
                  <p className="text-[11px] font-bold text-[#1A1A1A]/75">
                    Cascada Multi-IA y Servicios Escolares
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-xl bg-white hover:bg-[#FF8B8B] border-2 border-[#1A1A1A] flex items-center justify-center shadow-[2px_2px_0px_#1A1A1A] active:translate-x-0.5 active:translate-y-0.5 font-bold cursor-pointer text-[#1A1A1A]"
                aria-label="Cerrar modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Contenido desplazable */}
            <div className="p-3.5 sm:p-4 space-y-3.5 overflow-y-auto text-[#1A1A1A]">
              <div className="bg-[#A0E7E5]/30 border-2 border-[#1A1A1A] rounded-xl p-3 text-xs font-semibold leading-relaxed">
                🔍 <strong>Diagnóstico móvil:</strong> Evalúa la disponibilidad en tiempo real de cada proveedor en tu conexión actual sin necesidad de consola de desarrollo.
              </div>

              {/* Lista de Servicios */}
              <div className="space-y-2.5">
                {diagnostics.map((diag, index) => (
                  <div
                    key={diag.name}
                    className="p-3 bg-white border-2 border-[#1A1A1A] rounded-xl shadow-[3px_3px_0px_#1A1A1A] flex flex-col gap-1.5"
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div>
                        <h4 className="font-black text-sm text-[#1A1A1A] flex items-center gap-1.5">
                          {diag.name}
                        </h4>
                        <span className="text-[11px] font-bold text-[#1A1A1A]/60">
                          {diag.role}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {typeof diag.latencyMs === 'number' && diag.latencyMs > 0 && (
                          <span className="text-[11px] font-black px-1.5 py-0.5 rounded bg-gray-100 border border-[#1A1A1A]/40 text-[#1A1A1A]">
                            ⏱️ {diag.latencyMs} ms
                          </span>
                        )}
                        {getStatusBadge(diag.status)}
                      </div>
                    </div>

                    {/* Mensaje descriptivo */}
                    {diag.message && (
                      <p className="text-xs font-bold text-[#1A1A1A] mt-0.5">
                        {diag.message}
                      </p>
                    )}

                    {/* Detalles o sugerencias */}
                    {diag.details && (
                      <p className="text-[11px] font-medium text-[#1A1A1A]/70 bg-amber-50/70 p-1.5 rounded-lg border border-[#1A1A1A]/20">
                        💡 {diag.details}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Botón desplegable para configurar o revisar API Keys desde el móvil */}
              <div className="pt-1">
                <button
                  onClick={() => setShowKeyInputs((v) => !v)}
                  className="w-full flex items-center justify-between px-3 py-2 bg-[#FFFDF7] hover:bg-white border-2 border-[#1A1A1A] rounded-xl font-bold text-xs text-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-[#1A1A1A]" />
                    Configurar o pegar llaves de prueba desde este móvil
                  </span>
                  <span className="text-xs font-black">{showKeyInputs ? '▲ Ocultar' : '▼ Ver'}</span>
                </button>

                {showKeyInputs && (
                  <div className="mt-2 p-3 bg-white border-2 border-[#1A1A1A] rounded-xl space-y-2.5 text-xs shadow-[2px_2px_0px_#1A1A1A]">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block font-black text-[11px]">
                          GROQ_API_KEY (Gratuita en console.groq.com):
                        </label>
                        <span
                          className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                            activeSanitized.isValidFormat
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-400'
                              : 'bg-amber-50 text-amber-800 border-amber-300'
                          }`}
                        >
                          {activeSanitized.maskedPreview}
                        </span>
                      </div>
                      <input
                        type="password"
                        placeholder="gsk_..."
                        value={customGroqKey}
                        onChange={(e) => setCustomGroqKey(e.target.value)}
                        className={`w-full px-2.5 py-1.5 rounded-lg border-2 font-mono text-xs bg-[#FFFDF7] focus:outline-none ${
                          customGroqKey && !customGroqKey.trim().replace(/^["'`]|["'`]$/g, '').replace(/^bearer\s+/i, '').startsWith('gsk_')
                            ? 'border-red-500 focus:bg-red-50'
                            : 'border-[#1A1A1A] focus:bg-[#FFE66D]/20'
                        }`}
                      />
                      {customGroqKey && !customGroqKey.trim().replace(/^["'`]|["'`]$/g, '').replace(/^bearer\s+/i, '').startsWith('gsk_') && (
                        <p className="text-[11px] font-black text-red-600 mt-1">
                          ⚠️ La clave debe iniciar con gsk_
                        </p>
                      )}
                    </div>
                    <p className="text-[10px] text-[#1A1A1A]/60 leading-tight">
                      * Saneamiento activo: se eliminan espacios invisibles, comillas y "Bearer ". Clave censurada: <strong>{activeSanitized.maskedPreview}</strong>
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer con botón de acción táctil */}
            <div className="bg-gray-50 border-t-3 border-[#1A1A1A] p-3 sm:p-4 flex gap-2">
              <button
                onClick={runAllTests}
                disabled={isRunning}
                className="flex-1 py-3 px-4 bg-[#FFE66D] hover:bg-[#FFD93D] active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-50 border-2 border-[#1A1A1A] rounded-xl shadow-[3px_3px_0px_#1A1A1A] font-black text-sm text-[#1A1A1A] flex items-center justify-center gap-2 cursor-pointer transition-all min-h-[46px]"
              >
                {isRunning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verificando conexiones...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-[#1A1A1A]" />
                    <span>Probar Cascada Nuevamente</span>
                  </>
                )}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="py-3 px-4 bg-white hover:bg-gray-100 active:translate-x-0.5 active:translate-y-0.5 border-2 border-[#1A1A1A] rounded-xl shadow-[3px_3px_0px_#1A1A1A] font-black text-xs text-[#1A1A1A] cursor-pointer min-h-[46px]"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
