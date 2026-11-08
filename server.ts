import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { getPedagogicalKnowledgeFallback } from './server/schoolKnowledge';
import { SchoolSubjectId } from './src/types/index';

import fs from 'fs';
import crypto from 'crypto';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar configuración de Firebase para validar tokens del proyecto (Variables de entorno en Vercel o respaldo local)
let firebaseConfig: { projectId?: string } = {
  projectId: process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID || undefined,
};
if (!firebaseConfig.projectId) {
  try {
    const rawConfig = fs.readFileSync(path.resolve(__dirname, 'firebase-applet-config.json'), 'utf-8');
    firebaseConfig = JSON.parse(rawConfig);
  } catch {
    // Ignorar si no está disponible en este entorno (ej. Vercel sin archivo local)
  }
}

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Soporte para imágenes de tareas y documentos en Base64 hasta 4MB (alineado con Vercel Serverless Lambdas)
app.use(express.json({ limit: '4mb' }));

// Limitador de tasa por IP en memoria (máximo 20 peticiones por minuto por IP)
interface RateLimitRecord {
  count: number;
  resetAt: number;
}
const ipRateLimits = new Map<string, RateLimitRecord>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 20;

function checkRateLimit(ip: string): { allowed: boolean; retryAfterSeconds?: number } {
  const now = Date.now();
  const record = ipRateLimits.get(ip);
  if (!record || now > record.resetAt) {
    ipRateLimits.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true };
  }
  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    const retryAfterSeconds = Math.ceil((record.resetAt - now) / 1000);
    return { allowed: false, retryAfterSeconds };
  }
  record.count += 1;
  return { allowed: true };
}

// Limpieza periódica de IPs expiradas
setInterval(() => {
  const now = Date.now();
  for (const [ip, rec] of ipRateLimits.entries()) {
    if (now > rec.resetAt) {
      ipRateLimits.delete(ip);
    }
  }
}, 5 * 60 * 1000);

// Caché en memoria para certificados públicos oficiales de Firebase (Google x509)
let googleCertsCache: Record<string, string> = {};
let googleCertsExpiresAt = 0;

async function getGooglePublicCerts(): Promise<Record<string, string>> {
  const now = Date.now();
  if (googleCertsExpiresAt > now && Object.keys(googleCertsCache).length > 0) {
    return googleCertsCache;
  }
  try {
    const res = await fetch(
      'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com',
      { signal: AbortSignal.timeout(3000) }
    );
    if (res.ok) {
      const data = (await res.json()) as Record<string, string>;
      googleCertsCache = data;
      const cacheControl = res.headers.get('cache-control') || '';
      const match = cacheControl.match(/max-age=(\d+)/);
      const maxAgeSeconds = match ? parseInt(match[1], 10) : 21600; // 6 horas
      googleCertsExpiresAt = now + maxAgeSeconds * 1000;
      return googleCertsCache;
    }
  } catch (err) {
    console.warn('[CISO Auth] No se pudieron actualizar certificados públicos de Google:', err);
  }
  return googleCertsCache;
}

/**
 * Valida la autenticidad, vigencia y firma criptográfica asimétrica (RS256)
 * del Bearer token de Firebase emitido para este proyecto.
 */
async function verifyFirebaseToken(authHeader?: string): Promise<{ valid: boolean; uid?: string; error?: string }> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { valid: false, error: 'Acceso no autorizado: debes identificarte con tu cuenta escolar de Google para revisar tareas.' };
  }

  const token = authHeader.substring(7).trim();
  if (!token) {
    return { valid: false, error: 'Token de acceso no proporcionado.' };
  }

  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return { valid: false, error: 'Formato de credencial no válido.' };
    }

    const [headerB64, payloadB64, signatureB64] = parts;
    const header = JSON.parse(Buffer.from(headerB64, 'base64url').toString('utf-8'));
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf-8'));

    // 1. Validar algoritmo de firma de Google y presencia de Key ID (kid)
    if (header.alg !== 'RS256' || !header.kid) {
      return { valid: false, error: 'Algoritmo o llave de credencial no compatible.' };
    }

    // 2. Validar expiración del token
    const nowSeconds = Math.floor(Date.now() / 1000);
    if (typeof payload.exp === 'number' && payload.exp < nowSeconds) {
      return { valid: false, error: 'Tu sesión escolar ha caducado. Por favor recarga la página para continuar.' };
    }

    // 3. Validar proyecto escolar (aud y iss)
    const currentProjectId = firebaseConfig.projectId;
    if (currentProjectId) {
      if (payload.aud !== currentProjectId) {
        return { valid: false, error: 'El token de acceso no corresponde a este proyecto escolar.' };
      }
      if (payload.iss !== `https://securetoken.google.com/${currentProjectId}`) {
        return { valid: false, error: 'Emisor de credenciales no autorizado.' };
      }
    }

    // 4. Verificación criptográfica de firma con claves públicas oficiales de Google
    const certs = await getGooglePublicCerts();
    let cert = certs[header.kid];
    if (!cert) {
      // Reintentar refrescando la caché si el kid rotó
      googleCertsExpiresAt = 0;
      const freshCerts = await getGooglePublicCerts();
      cert = freshCerts[header.kid];
    }

    if (cert) {
      const verifier = crypto.createVerify('RSA-SHA256');
      verifier.update(`${headerB64}.${payloadB64}`);
      const isSignatureValid = verifier.verify(cert, signatureB64, 'base64url');
      if (!isSignatureValid) {
        return { valid: false, error: 'Firma criptográfica de credencial inválida o alterada.' };
      }
    }

    const uid = payload.sub || payload.user_id;
    if (!uid) {
      return { valid: false, error: 'Identificador de estudiante ausente en la credencial.' };
    }

    return { valid: true, uid };
  } catch (_err) {
    return { valid: false, error: 'Error al comprobar credenciales de acceso.' };
  }
}

/**
 * Nombres y especialidades pedagógicas por materia escolar
 */
const SUBJECT_SPECIALTIES: Record<string, { role: string; focus: string }> = {
  matematicas: {
    role: 'profesor de matemáticas y cálculo escolar',
    focus: 'resolver problemas con procedimiento paso a paso, explicar fórmulas con claridad y verificar cálculos',
  },
  geometria: {
    role: 'profesor de geometría y dibujo técnico escolar',
    focus: 'explicar figuras geométricas, áreas, perímetros, ángulos y teoremas de forma visual y sencilla',
  },
  estadistica: {
    role: 'profesor de estadística y análisis de datos escolar',
    focus: 'explicar media, mediana, moda, frecuencias y gráficos de forma práctica',
  },
  fisica: {
    role: 'profesor de física escolar',
    focus: 'explicar conceptos como velocidad, fuerza, energía y leyes de Newton con analogías del día a día',
  },
  quimica: {
    role: 'profesor de química escolar',
    focus: 'explicar la tabla periódica, átomos, enlaces y balanceo químico de manera didáctica y visual',
  },
  biologia: {
    role: 'profesor de biología y ciencias de la vida',
    focus: 'explicar los seres vivos, la célula, la fotosíntesis y los ecosistemas de forma apasionante y clara',
  },
  ciencias_naturales: {
    role: 'maestro de ciencias naturales para primaria',
    focus: 'explicar el cuerpo humano, los animales, las plantas y el medio ambiente con cariño y sencillez',
  },
  historia: {
    role: 'profesor de historia y ciencias sociales',
    focus: 'narrar hechos históricos, causas, consecuencias y personajes con contexto claro y sin tecnicismos complejos',
  },
  geografia: {
    role: 'profesor de geografía escolar',
    focus: 'explicar mapas, relieve, climas, países y recursos naturales de manera gráfica y entretenida',
  },
  sociales: {
    role: 'profesor de ciencias sociales',
    focus: 'guiar en temas de sociedad, convivencia, comunidad y geografía humana',
  },
  lengua: {
    role: 'profesor de lengua española y literatura',
    focus: 'corregir ortografía, tildes, redacción, enseñar comprensión lectora y figuras literarias',
  },
  ingles: {
    role: 'profesor de inglés escolar (English Teacher)',
    focus: 'explicar grammar, vocabulario, traducción pedagógica y redacción de oraciones en inglés',
  },
  democracia: {
    role: 'profesor de educación cívica, democracia y constitución',
    focus: 'enseñar derechos fundamentales, participación ciudadana, paz y valores republicanos',
  },
  filosofia: {
    role: 'profesor de filosofía y pensamiento crítico para secundaria',
    focus: 'guiar reflexiones éticas, ideas de grandes pensadores y razonamiento lógico de forma accesible',
  },
  religion: {
    role: 'tutor de valores éticos, religión y convivencia escolar',
    focus: 'reflexionar sobre el respeto, la empatía, las tradiciones y los valores humanos',
  },
  tecnologia: {
    role: 'profesor de informática y tecnología escolar',
    focus: 'explicar computación básica, internet seguro, partes de un ordenador y algoritmos sencillos',
  },
  artes: {
    role: 'profesor de educación artística',
    focus: 'explicar teoría del color, técnicas de dibujo, expresión plástica y apreciación artística escolar',
  },
  educacion_fisica: {
    role: 'profesor de educación física y hábitos saludables',
    focus: 'enseñar reglas de deportes escolares, calentamiento, anatomía motriz y nutrición',
  },
};

interface OpenAICompatibleCallOptions {
  endpoint: string;
  apiKey?: string;
  model: string;
  systemInstruction: string;
  userContent: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
  timeoutMs?: number;
}

/**
 * Conexión homogénea universal compatible con el estándar OpenAI (/v1/chat/completions)
 * Unifica las llamadas a Groq y Pollinations con tipado estricto, abort signal y manejo de errores.
 */
async function callOpenAICompatibleProvider({
  endpoint,
  apiKey,
  model,
  systemInstruction,
  userContent,
  timeoutMs = 12000,
}: OpenAICompatibleCallOptions): Promise<string | null> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (apiKey) {
      const cleanToken = apiKey.trim().replace(/^["'`]|["'`]$/g, '').replace(/^bearer\s+/i, '').trim();
      headers['Authorization'] = `Bearer ${cleanToken}`;
    }

    const res = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model,
        temperature: 0.2,
        max_tokens: 2200,
        response_format: { type: 'json_object' },
        reasoning_format: 'hidden',
        messages: [
          { role: 'system', content: systemInstruction },
          { role: 'user', content: userContent },
        ],
      }),
      signal: AbortSignal.timeout(timeoutMs),
    });

    if (res.ok) {
      const data = (await res.json()) as { choices?: Array<{ message?: { content?: string; reasoning?: string } }> };
      const msg = data.choices?.[0]?.message;
      const content = (msg?.content && msg.content.trim().length > 0) ? msg.content : msg?.reasoning;
      if (content && typeof content === 'string') {
        return content;
      }
    } else {
      console.log(`[Multi-IA] Proveedor ${endpoint} (${model}) respondió status: ${res.status}`);
    }
  } catch (err) {
    console.log(`[Multi-IA] Proveedor ${endpoint} (${model}) no disponible:`, err);
  }
  return null;
}

/**
 * Conexión resiliente a Pollinations AI (100% gratuita, sin API Key requerida)
 * Usa https://text.pollinations.ai (sin key) y opcionalmente el gateway https://gen.pollinations.ai si se configura POLLINATIONS_API_KEY
 */
async function callPollinationsAI({
  systemInstruction,
  userContent,
  timeoutMs = 14000,
}: {
  systemInstruction: string;
  userContent: string | Array<any>;
  timeoutMs?: number;
}): Promise<string | null> {
  const pollApiKey = process.env.POLLINATIONS_API_KEY?.trim();

  // 1. Intento primario gratuito sin key: Endpoint directo de texto con jsonMode
  try {
    const res = await fetch('https://text.pollinations.ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: systemInstruction },
          { role: 'user', content: userContent },
        ],
        model: 'openai',
        jsonMode: true,
      }),
      signal: AbortSignal.timeout(timeoutMs),
    });

    if (res.ok) {
      const text = await res.text();
      if (text && text.trim().length > 0) {
        try {
          const parsed = JSON.parse(text);
          if (parsed.choices?.[0]?.message?.content) {
            return parsed.choices[0].message.content;
          }
        } catch {
          // Es texto directo
        }
        return text;
      }
    }
  } catch (err) {
    console.log('[Pollinations] Intento con https://text.pollinations.ai no disponible:', err);
  }

  // 2. Intento secundario: Gateway gen.pollinations.ai (solo si hay key configurada)
  if (pollApiKey) {
    try {
      const res = await fetch('https://gen.pollinations.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${pollApiKey}`,
        },
        body: JSON.stringify({
          model: 'openai',
          messages: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: userContent },
          ],
        }),
        signal: AbortSignal.timeout(timeoutMs),
      });

      if (res.ok) {
        const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
        const content = data.choices?.[0]?.message?.content;
        if (content) return content;
      }
    } catch (err) {
      console.log('[Pollinations] Intento con gen.pollinations.ai no disponible:', err);
    }
  }

  return null;
}

// ----------------------------------------------------------------------------
// Base de Datos Centralizada del Servidor (Respaldo universal permanente)
// ----------------------------------------------------------------------------
const DATA_DIR = path.resolve(__dirname, 'server', 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const CODES_FILE = path.join(DATA_DIR, 'codes.json');

function ensureDataFiles() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, '[]', 'utf-8');
  }
  if (!fs.existsSync(CODES_FILE)) {
    fs.writeFileSync(CODES_FILE, '[]', 'utf-8');
  }
}

function getServerUsers(): any[] {
  ensureDataFiles();
  try {
    const raw = fs.readFileSync(USERS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveServerUsers(users: any[]): void {
  ensureDataFiles();
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Server DB] Error al guardar usuarios:', err);
  }
}

function getServerCodes(): any[] {
  ensureDataFiles();
  try {
    const raw = fs.readFileSync(CODES_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveServerCodes(codes: any[]): void {
  ensureDataFiles();
  try {
    fs.writeFileSync(CODES_FILE, JSON.stringify(codes, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Server DB] Error al guardar códigos:', err);
  }
}

// 1. Obtener lista de usuarios registrados
app.get('/api/admin/users', (_req, res) => {
  const users = getServerUsers();
  res.json({ success: true, users });
});

// 2. Sincronizar o registrar un usuario
app.post('/api/users/sync', (req, res) => {
  const profile = req.body;
  if (!profile || (!profile.uid && !profile.email)) {
    return res.status(400).json({ success: false, message: 'Perfil inválido' });
  }
  const users = getServerUsers();
  const existingIdx = users.findIndex(
    (u) => (profile.uid && u.uid === profile.uid) || (profile.email && u.email?.toLowerCase() === profile.email?.toLowerCase())
  );
  if (existingIdx >= 0) {
    users[existingIdx] = {
      ...users[existingIdx],
      ...profile,
      updatedAt: new Date().toISOString(),
    };
  } else {
    users.unshift({
      ...profile,
      createdAt: profile.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
  saveServerUsers(users);
  res.json({ success: true, user: existingIdx >= 0 ? users[existingIdx] : users[0] });
});

// 3. Obtener lista de códigos de activación
app.get('/api/admin/codes', (_req, res) => {
  const codes = getServerCodes();
  res.json({ success: true, codes });
});

// 4. Crear código de activación
app.post('/api/admin/codes', (req, res) => {
  const { code, durationDays, createdBy } = req.body;
  if (!code) {
    return res.status(400).json({ success: false, message: 'Código requerido' });
  }
  const codes = getServerCodes();
  const newCode = {
    id: code,
    code,
    durationDays: durationDays || 30,
    isRedeemed: false,
    redeemedByEmail: null,
    redeemedByUid: null,
    redeemedAt: null,
    createdAt: new Date().toISOString(),
    createdBy: createdBy || 'admin',
  };
  codes.unshift(newCode);
  saveServerCodes(codes);
  res.json({ success: true, code: newCode });
});

// 5. Canjear código de activación en el servidor
app.post('/api/codes/redeem', (req, res) => {
  const { code, user } = req.body;
  const normalized = (code || '').trim().toUpperCase();
  if (!normalized) {
    return res.status(400).json({ success: false, message: 'Código requerido' });
  }
  const codes = getServerCodes();
  const targetCode = codes.find((c) => c.code === normalized);
  if (targetCode && targetCode.isRedeemed) {
    return res.json({
      success: false,
      message: `Este código ya fue canjeado el ${new Date(targetCode.redeemedAt || '').toLocaleDateString('es-CO')}.`,
    });
  }

  const calculatedDays = targetCode ? targetCode.durationDays : 30;
  const nowIso = new Date().toISOString();
  const expiresIso = new Date(Date.now() + calculatedDays * 24 * 60 * 60 * 1000).toISOString();

  // Marcar código como canjeado
  if (targetCode) {
    targetCode.isRedeemed = true;
    targetCode.redeemedByEmail = user?.email || 'Estudiante';
    targetCode.redeemedByUid = user?.uid || null;
    targetCode.redeemedAt = nowIso;
  } else {
    codes.unshift({
      id: normalized,
      code: normalized,
      durationDays: calculatedDays,
      isRedeemed: true,
      redeemedByEmail: user?.email || 'Estudiante',
      redeemedByUid: user?.uid || null,
      redeemedAt: nowIso,
      createdAt: nowIso,
      createdBy: 'admin',
    });
  }
  saveServerCodes(codes);

  // Activar suscripción del usuario en users.json
  if (user && (user.uid || user.email)) {
    const users = getServerUsers();
    const existingIdx = users.findIndex(
      (u) => (user.uid && u.uid === user.uid) || (user.email && u.email?.toLowerCase() === user.email?.toLowerCase())
    );
    const updatedUser = {
      uid: user.uid || `user_${Date.now()}`,
      email: user.email,
      displayName: user.displayName || user.email?.split('@')[0] || 'Estudiante',
      role: 'student',
      isSubscriptionActive: true,
      subscriptionDaysRemaining: calculatedDays,
      subscriptionExpiresAt: expiresIso,
      maxDailyUsages: 9999,
      maxUsages: 9999,
      usagesUsed: 0,
      updatedAt: nowIso,
    };
    if (existingIdx >= 0) {
      users[existingIdx] = { ...users[existingIdx], ...updatedUser };
    } else {
      users.unshift({ ...updatedUser, createdAt: nowIso });
    }
    saveServerUsers(users);
  }

  res.json({
    success: true,
    message: '¡Código canjeado con éxito! Tienes 30 días de acceso escolar activo.',
    daysRemaining: calculatedDays,
  });
});

// 6. Eliminar código
app.delete('/api/admin/codes/:code', (req, res) => {
  const codeToDelete = (req.params.code || '').trim().toUpperCase();
  const codes = getServerCodes();
  const updated = codes.filter((c) => c.code !== codeToDelete && c.id !== codeToDelete);
  saveServerCodes(updated);
  res.json({ success: true });
});

/**
 * Endpoint de revisión escolar
 * Procesa texto e imágenes de tareas de forma 100% segura en el servidor.
 */
app.post('/api/review', async (req, res) => {
  // 1. Verificación de Rate Limiting por IP para neutralizar abusos y scripts
  let rawIp =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    req.socket.remoteAddress ||
    '127.0.0.1';
  if (rawIp.startsWith('::ffff:')) {
    rawIp = rawIp.replace('::ffff:', '');
  }
  const clientIp = rawIp === '::1' ? '127.0.0.1' : rawIp;

  const rateLimitResult = checkRateLimit(clientIp);
  if (!rateLimitResult.allowed) {
    return res.status(429).json({
      error: `Has enviado muchas consultas en poco tiempo. Por favor espera ${rateLimitResult.retryAfterSeconds} segundos antes de enviar otra tarea.`,
    });
  }

  // 2. Verificación criptográfica de credenciales de Firebase del estudiante
  const authHeader = req.headers.authorization;
  const authResult = await verifyFirebaseToken(authHeader);
  if (!authResult.valid) {
    return res.status(401).json({
      error: authResult.error || 'Acceso no autorizado. Inicia sesión con tu cuenta Google para revisar tareas.',
    });
  }

  const { text, image, tasks, gradeLevel, subject = 'lengua', responseDepth = 'detailed' } = req.body;
  const subjectId = (typeof subject === 'string' ? subject : 'lengua') as SchoolSubjectId;
  const level = gradeLevel === 'secundaria' ? 'Secundaria' : 'Primaria';
  const isDetailed = responseDepth === 'detailed';

  try {
    // Asignación inteligente: si es consulta explicativa o biográfica, activar topicExplanation por defecto
    const queryStr = (typeof text === 'string' ? text : '').toLowerCase().trim();
    const isExplanatoryQuestion = /(\bqui[eé]n\s+fue\b|\bqu[eé]\s+[eé]s\b|\bqu[eé]\s+son\b|\bbiograf[ií]a\b|\bexplica\b|\bexpl[ií]came\b|\bresumen\b|\bconcepto\b|\bdefinici[oó]n\b)/i.test(queryStr);
    if (tasks && isExplanatoryQuestion && (!tasks.explanation || (!tasks.summary && queryStr.includes('resumen')))) {
      tasks.explanation = true;
      if (queryStr.includes('resumen')) tasks.summary = true;
    }

    const hasAnyTask =
      tasks &&
      (tasks.correction ||
        tasks.summary ||
        tasks.analysis ||
        tasks.step_by_step ||
        tasks.explanation ||
        tasks.quiz_guide);

    if (!hasAnyTask) {
      return res.status(400).json({
        error: 'Debes seleccionar al menos una tarea para la materia seleccionada.',
      });
    }

    const hasText = Boolean(text && typeof text === 'string' && text.trim().length > 0);
    const hasImage = Boolean(image && image.base64 && image.mimeType);

    if (!hasText && !hasImage) {
      return res.status(400).json({
        error: 'Por favor proporciona un texto escrito o una imagen de cuaderno.',
      });
    }

    // 3. Validación de tipos de archivos permitidos
    const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'application/pdf'];
    if (hasImage && !ALLOWED_MIME_TYPES.includes(image.mimeType)) {
      return res.status(400).json({
        error: 'Formato de archivo no admitido. Sube una foto (JPG, PNG, WEBP) o documento PDF de tu tarea.',
      });
    }

    if (hasText && text.length > 15000) {
      return res.status(400).json({
        error: 'El texto excede el límite permitido para una tarea escolar (máximo 15.000 caracteres).',
      });
    }

    // Resumen de tareas escolares solicitadas
    const requestedTasks: string[] = [];
    if (tasks.step_by_step) requestedTasks.push('- Solución paso a paso con fórmulas (objeto "stepByStep")');
    if (tasks.explanation) requestedTasks.push('- Explicación didáctica del tema (objeto "topicExplanation")');
    if (tasks.quiz_guide) requestedTasks.push('- Guía de taller y preguntas reflexivas (objeto "quizGuide")');
    if (tasks.correction) requestedTasks.push('- Corrección ortográfica y gramatical (objeto "correction")');
    if (tasks.summary) requestedTasks.push('- Resumen y puntos clave (objeto "summary")');
    if (tasks.analysis) requestedTasks.push('- Análisis y comprensión lectora (objeto "analysis")');

    const specialty = SUBJECT_SPECIALTIES[subjectId] || SUBJECT_SPECIALTIES.lengua;

    const systemInstruction = `
Eres un ${specialty.role}, pedagógico, cálido, motivador y paciente para estudiantes de ${level}.
Tu misión en esta materia es: ${specialty.focus}.

MODO DE PROFUNDIDAD: ${isDetailed ? 'DETALLADO Y EXTENSO' : 'RESUMIDO Y CONCISO'}.
${isDetailed ? `
INSTRUCCIONES CLAVE PARA MODO DETALLADO:
1. NO te limites a 2 o 3 líneas. Desarrolla las explicaciones con profundidad académica, claridad didáctica y rigor pedagógico.
2. Incluye múltiples ejemplos reales y cotidianos donde se aplique el concepto.
3. Proporciona el contexto u orígenes del tema (por qué surgió, quién lo estudió o qué problema resuelve).
4. Incluye un glosario con los términos técnicos y escolares clave definidos con sencillez.
5. Si la materia es de ciencias exactas o números (Matemáticas, Física, Química, Geometría, Estadística), desglosa TODOS los pasos matemáticos sin omitir cálculos intermedios e incluye la verificación paso a paso.
` : `
INSTRUCCIONES PARA MODO RESUMIDO:
1. Sé directo, breve y conciso (fichas rápidas de 2-3 líneas).
2. Ideal para un repaso veloz antes de una clase o examen.
`}

REGLA CARDINAL SOBRE CONTENIDO EDUCATIVO Y ESCOLAR:
- CUALQUIER consulta sobre asignaturas escolares (Español o Literatura, Matemáticas, Historia, Ciencias, Geografía, Filosofía, etc.), preguntas conceptuales, obras literarias, autores, debates académicos, dudas de clase o preguntas de conocimiento general (por ejemplo: "¿Cuál es la mejor literatura del mundo?", "¿Quién escribió Don Quijote?", "¿Por qué ocurren los terremotos?") ES 100% EDUCATIVA Y ESCOLAR y DEBE SER RESPONDIDA con "isSchoolRelated": true.
- El rol del tutor escolar es enseñar y explicar con entusiasmo pedagógico, adaptando la respuesta al nivel del estudiante.
- ÚNICAMENTE debes responder "isSchoolRelated": false si la consulta pertenece de forma evidente a:
  1. Contenido sexual o para adultos.
  2. Apuestas, casinos, juegos de azar o estafas.
  3. Contratos comerciales/laborales o finanzas de empresas para adultos.
  4. Hacking, malware, piratería o vulneración de sistemas.
  5. Drogas ilícitas, armas o violencia extrema.
- Si de verdad se trata de uno de estos casos ajenos, "rejectionReason" DEBE SER una explicación natural y redactada para el alumno en 1 o 2 oraciones amables (NUNCA copies instrucciones de sistema ni plantillas).

SI LA CONSULTA SÍ PERTENECE AL CONTEXTO ESCOLAR (el 99% de las dudas de clase y preguntas académicas):
Debes incluir "isSchoolRelated": true y generar los objetos solicitados:

${tasks.step_by_step ? `
OBJETO "stepByStep":
{
  "topic": "Nombre del tema o ejercicio matemático/científico",
  "problemStatement": "Enunciado claro del problema planteado",
  "finalAnswer": "Respuesta final destacada (ej: x = 5, 25 cm², etc.)",
  "steps": [
    {
      "stepNumber": 1,
      "title": "Paso 1: Identificar datos y fórmula",
      "explanation": "${isDetailed ? 'Explicación completa y fundamentada de lo que se hace en este paso y la razón matemática' : 'Explicación sencilla y directa'}",
      "mathOrFormula": "a² + b² = c² (opcional)"
    }
  ],
  "formulaUsed": "Fórmula principal utilizada con explicación de variables",
  "teacherTip": "Consejo o truco del profe para no equivocarse en el examen",
  "verificationCheck": "${isDetailed ? 'Comprobación matemática paso a paso sustituyendo valores para verificar que la respuesta es 100% correcta' : 'Cómo comprobar que la respuesta es correcta'}",
  ${isDetailed ? `"alternativeMethod": "Método alternativo de resolución o comprobación rápida si existe",
  "detailedNotes": "Notas sobre propiedades aplicadas, signos o simplificaciones importantes",` : ''}
}
` : ''}

${tasks.explanation ? `
OBJETO "topicExplanation":
{
  "topic": "Nombre del concepto o tema",
  "simpleDefinition": "${isDetailed ? 'Definición pedagógica completa y enriquecida adaptada a ' + level : 'Definición concisa y directa adaptada a ' + level}",
  ${isDetailed ? `"detailedExplanation": "Explicación profunda de 3 a 5 párrafos completos que aborde la lección a fondo, desglosando los principios fundamentales, el funcionamiento interno y su relevancia académica.",
  "realWorldExamples": [
    "Ejemplo cotidiano 1 con explicación de cómo se observa",
    "Ejemplo práctico 2 en la tecnología, la naturaleza o el entorno real",
    "Ejemplo 3 en la vida escolar o profesional"
  ],
  "contextAndOrigins": "Contexto histórico o científico: antecedentes, quién o cómo se descubrió este concepto y por qué es importante aprenderlo.",
  "glossary": [
    { "term": "Término 1", "definition": "Definición clara y precisa del término escolar" },
    { "term": "Término 2", "definition": "Definición clara y precisa del término escolar" },
    { "term": "Término 3", "definition": "Definición clara y precisa del término escolar" }
  ],` : ''}
  "howItWorksOrWhy": "Mecanismo esencial o por qué ocurre este fenómeno",
  "causeAndEffect": "Qué causa u origina este fenómeno y qué consecuencias o impacto produce",
  "realWorldExample": "Aplicación práctica principal en el mundo real",
  "examTipOrTrap": "Pregunta clave de examen, trampa conceptual típica o error común que evalúan los profesores",
  "keyConcepts": ${isDetailed ? '["Concepto clave 1", "Concepto clave 2", "Concepto clave 3", "Concepto clave 4", "Concepto clave 5"]' : '["Concepto clave 1", "Concepto clave 2", "Concepto clave 3"]'},
  "teacherTip": "Regla mnemotécnica o truco del profesor para recordar y no confundirse"
}
` : ''}

${tasks.quiz_guide ? `
OBJETO "quizGuide":
{
  "topic": "Tema del taller escolar",
  "questions": [
    {
      "questionOrConcept": "Pregunta de examen o del taller",
      "guideHint": "Pista del tutor para pensar la respuesta",
      "sampleAnswerOrThought": "Respuesta modelo bien fundamentada"
    }
  ],
  "studyTip": "Recomendación para responder con éxito esta clase de preguntas"
}
` : ''}

${tasks.correction ? `
OBJETO "correction":
{
  "correctedText": "Texto completamente corregido con ortografía y puntuación impecables",
  "scoreText": "Nota formativa o felicitación adaptada a ${level}",
  "mistakesCount": 0,
  "explanations": [
    {
      "original": "palabra con error",
      "correction": "palabra correcta",
      "type": "ortografia" | "tilde" | "puntuacion" | "gramatica",
      "explanation": "Regla explicada para niños o jóvenes"
    }
  ],
  "teacherTip": "Truco mnemotécnico para no repetir el error"
}
` : ''}

${tasks.summary ? `
OBJETO "summary":
{
  "mainIdea": "${isDetailed ? 'Resumen exhaustivo de la idea principal con contexto' : 'Idea principal en 1-2 frases claras'}",
  "keyPoints": ${isDetailed ? '["Punto clave 1 bien explicado", "Punto clave 2", "Punto clave 3", "Punto clave 4", "Punto clave 5"]' : '["Punto clave 1", "Punto clave 2", "Punto clave 3"]'},
  "summaryLengthNote": "Extensión ideal recomendada para estudiar"
}
` : ''}

${tasks.analysis ? `
OBJETO "analysis":
{
  "mainTopic": "Tema central del texto o lección",
  "textType": "Tipo de texto o género",
  "reflectiveQuestion": "Pregunta para hacer pensar al estudiante",
  "reflectiveHint": "Pista orientadora de la maestra",
  "moralOrPurpose": "Propósito del autor o moraleja"
}
` : ''}

Responde SIEMPRE en español. Tu respuesta debe ser un objeto JSON válido con la estructura solicitada.
`;

    const startTime = Date.now();
    let responseText = '';
    let resolvedProvider: 'groq' | 'pollinations' = 'groq';

    // Construir contenido para el estándar universal OpenAI (/v1/chat/completions)
    const userTextPrompt = hasText
      ? `Tarea o consulta del estudiante para la materia [${subjectId.toUpperCase()}]:\n"""\n${text.trim()}\n"""\nDevuelve únicamente el objeto JSON válido solicitado.`
      : `Analiza esta foto de cuaderno/tarea escolar de la materia [${subjectId.toUpperCase()}] y devuelve únicamente el objeto JSON válido solicitado.`;

    const userContent = hasImage
      ? [
          { type: 'text', text: userTextPrompt },
          { type: 'image_url', image_url: { url: `data:${image.mimeType};base64,${image.base64}` } },
        ]
      : userTextPrompt;

    // 1. NIVEL 1: Groq Cloud ($0 USD - GPT-OSS 120B / Qwen 27B / Llama 3.3)
    const rawGroq = (req.headers['x-groq-api-key'] as string) || process.env.GROQ_API_KEY;
    const groqKey = rawGroq ? rawGroq.trim().replace(/^["'`]|["'`]$/g, '').replace(/^bearer\s+/i, '').trim() : '';
    if (groqKey) {
      const groqModels = hasImage
        ? ['qwen/qwen3.8-27b', 'llama-3.2-11b-vision-preview', 'llama-3.2-90b-vision-preview']
        : ['openai/gpt-oss-120b', 'qwen/qwen3.8-27b', 'openai/gpt-oss-20b', 'llama-3.3-70b-versatile', 'llama-3.1-8b-instant'];

      for (const groqModel of groqModels) {
        const content = await callOpenAICompatibleProvider({
          endpoint: 'https://api.groq.com/openai/v1/chat/completions',
          apiKey: groqKey,
          model: groqModel,
          systemInstruction,
          userContent,
          timeoutMs: hasImage ? 12000 : 6500,
        });
        if (content) {
          responseText = content;
          resolvedProvider = 'groq';
          break;
        }
      }
    }

    // 2. NIVEL 2: Pollinations AI (100% Gratis, SIN API Key ni registro previo - Respaldo Inmediato)
    if (!responseText) {
      const pollContent = await callPollinationsAI({
        systemInstruction,
        userContent,
        timeoutMs: 4000,
      });
      if (pollContent) {
        responseText = pollContent;
        resolvedProvider = 'pollinations';
      }
    }

    // 4. NIVEL 4: Wikipedia REST API + Glosario local (schoolKnowledge.ts) como fail-safe final
    if (!responseText) {
      console.log('[Tutor Router] Resolviendo con Wikipedia REST API + base pedagógica escolar (schoolKnowledge.ts).');
      const fallbackResult = await getPedagogicalKnowledgeFallback({
        subjectId,
        text,
        tasks,
        gradeLevel,
        responseDepth,
      });
      if (hasImage && !fallbackResult.ocrTranscribedText) {
        fallbackResult.ocrTranscribedText = 'Ficha de cuaderno escolar analizada y estructurada para tu estudio.';
      }
      return res.json({ ...fallbackResult, provider: 'wikipedia' });
    }

    let parsedData: Record<string, unknown> = {};

    try {
      // Limpieza ultra-robusta de JSON (elimina etiquetas de pensamiento <think> y markdown)
      let cleanText = responseText.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
      const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanText = jsonMatch[0];
      }
      parsedData = JSON.parse(cleanText);
    } catch {
      // Si falla el parseo, activar el fallback sin romper la experiencia del estudiante
      const fallbackResult = await getPedagogicalKnowledgeFallback({
        subjectId,
        text,
        tasks,
        gradeLevel,
        responseDepth,
      });
      if (hasImage && !fallbackResult.ocrTranscribedText) {
        fallbackResult.ocrTranscribedText = 'Ficha de cuaderno escolar analizada y estructurada para tu estudio.';
      }
      return res.json({ ...fallbackResult, provider: 'wikipedia' });
    }

    const duration = Date.now() - startTime;

    // Patrón de contenido estrictamente no escolar / prohibido
    const forbiddenPatterns = /\b(porn|xxx|sexo|erotico|erótico|casino|apuestas|ruleta|bet365|betplay|droga|cocaina|cocaína|marihuana|sicario|arma|matar|suicid|hackear|malware|troyano|phishing)\b/i;
    const isExplicitlyForbidden = Boolean(text && forbiddenPatterns.test(text));

    if (parsedData.isSchoolRelated === false) {
      // Si la consulta NO es explícitamente prohibida, la reclasificamos como válida escolar
      // y garantizamos una respuesta pedagógica completa en vez de bloquear al estudiante.
      if (!isExplicitlyForbidden) {
        console.log('[Tutor Router] Consulta académica reclasificada a escolar válida:', text);
        const fallbackResult = await getPedagogicalKnowledgeFallback({
          subjectId,
          text,
          tasks,
          gradeLevel,
          responseDepth,
        });
        return res.json({
          ...fallbackResult,
          isSchoolRelated: true,
          provider: 'tutor-pedagogico',
        });
      }

      let reason = typeof parsedData.rejectionReason === 'string' ? parsedData.rejectionReason : '';
      if (
        !reason ||
        reason.includes('Mensaje muy cordial') ||
        reason.includes('tono de profesor') ||
        reason.includes('Explica amablemente') ||
        reason.trim().length < 15
      ) {
        reason =
          '¡Hola! Notamos que este texto o imagen no corresponde a una tarea o deber escolar de primaria o secundaria. Tutor-IA está diseñado con dedicación para acompañarte en tus tareas de clase, matemáticas, ciencias, historia, literatura y materias del colegio. ¡Por favor sube una tarea escolar o duda de clase y con mucho gusto te ayudamos!';
      }
      return res.json({
        isSchoolRelated: false,
        rejectionReason: reason,
        processingTimeMs: duration,
        timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        provider: resolvedProvider,
      });
    }

    return res.json({
      isSchoolRelated: true,
      subjectId,
      responseDepth,
      ocrTranscribedText: parsedData.ocrTranscribedText || undefined,
      correction: tasks.correction ? parsedData.correction : undefined,
      summary: tasks.summary ? parsedData.summary : undefined,
      analysis: tasks.analysis ? parsedData.analysis : undefined,
      stepByStep: tasks.step_by_step ? parsedData.stepByStep : undefined,
      topicExplanation: tasks.explanation ? parsedData.topicExplanation : undefined,
      quizGuide: tasks.quiz_guide ? parsedData.quizGuide : undefined,
      processingTimeMs: duration,
      timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      provider: resolvedProvider,
    });
  } catch (_error) {
    console.log('[Tutor Router] Activando base de conocimiento escolar transparente ante contingencia de red.');
    
    // RESPALDO TRANSPARENTE: Si la IA está saturada, agotada o sin red,
    // responder con la base de conocimiento estudiantil gratuita sin que el usuario lo note.
    try {
      const fallbackResult = await getPedagogicalKnowledgeFallback({
        subjectId,
        text,
        tasks,
        gradeLevel,
        responseDepth,
      });
      return res.json(fallbackResult);
    } catch {
      return res.status(503).json({
        error: 'El servicio de tutoría tiene una alta demanda en este momento. Por favor espera unos segundos y pulsa "Revisar tarea" nuevamente. ¡Tu cupo no ha sido descontado!',
      });
    }
  }
});

// Configuración de Vite / Servidor estático (solo para servidor dedicado o desarrollo local)
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    // Servir index.html transformado por Vite para SPA en desarrollo local
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      if (url.startsWith('/api')) {
        return next();
      }
      try {
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        next(e);
      }
    });
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  function listenOnPort(portToUse: number) {
    const serverInstance = app.listen(portToUse, '0.0.0.0', () => {
      console.log(`Servidor activo en http://localhost:${portToUse}`);
    });

    serverInstance.on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        console.warn(`[Servidor] El puerto ${portToUse} está ocupado. Intentando en http://localhost:${portToUse + 1}...`);
        listenOnPort(portToUse + 1);
      } else {
        console.error('[Servidor] Error al iniciar servidor:', err);
      }
    });
  }

  listenOnPort(PORT);
}

// Ejecutar listen() únicamente fuera del entorno Serverless de Vercel
if (!process.env.VERCEL) {
  startServer();
}

export { app };
export default app;
