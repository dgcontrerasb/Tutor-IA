# PROJECT_CONTEXT.md — Tutor-IA

## 1. Identidad del proyecto
- Nombre: Tutor-IA
- Propósito en una frase: Plataforma escolar interactiva con IA pedagógica que orienta a estudiantes en la comprensión, resolución paso a paso y redacción de sus tareas escolares sin hacerles el trabajo por ellos.
- Usuario objetivo: Estudiantes de educación básica primaria y secundaria/bachillerato en Colombia e Hispanoamérica, junto con padres de familia y docentes acompañantes.

## 2. Stack técnico
- Frontend: React 19 + TypeScript + Vite + Tailwind CSS v4 + Motion
- Backend/API: Node.js con Express (`server.ts`) + Vercel Serverless Functions (`api/`)
- Base de datos / persistencia: Firebase Firestore (Spark Plan) + Firebase Auth (Google Sign-In) + localStorage para caché y control de cuotas locales
- Despliegue: Vercel (primario) / Netlify (secundario)

## 3. Estructura de carpetas (solo lo relevante, no todo el árbol)
```
src/
  components/
    HomePage.tsx                -> Pantalla principal del tutor escolar con grid neubrutalista
    InputZone.tsx               -> Zona de entrada multimodal (texto escolar, fotos de cuadernos, selector de materia)
    ResultsDisplay.tsx          -> Despliegue modular de resultados pedagógicos
    StepByStepCard.tsx          -> Resolución paso a paso y fórmulas para materias numéricas
    CorrectionCard.tsx          -> Corrección ortográfica, gramatical y sugerencias de estilo
    SummaryCard.tsx             -> Síntesis didáctica, analogías cotidianas y glosario
    SchoolGuardrailCard.tsx     -> Bloqueador ético de consultas no escolares
    PrintModal.tsx              -> Exportación a PDF vectorial (jsPDF) y preparación para impresión
  hooks/
    useAuthUser.ts              -> Estado reactivo de autenticación con Firebase y perfil del alumno
    useModals.ts                -> Control centralizado de modales (diagnóstico, admin, auth, impresión)
  services/
    reviewService.ts            -> Enrutador en cascada (Wikipedia REST -> Groq Cloud -> Pollinations -> Respaldo local)
    firebase.ts                 -> Configuración y clientes de Firebase Auth y Firestore
    usageService.ts             -> Control y contabilidad de cuotas diarias gratuitas
    photoUsageService.ts        -> Gestión de límites para procesamiento de imágenes
    adminService.ts             -> Funciones de administración y auditoría escolar
server/
  server.ts                     -> Servidor Express con rate limiting por IP y proxy seguro
  server/schoolKnowledge.ts     -> Base curricular offline local para 18 materias escolares
```

## 4. Identidad visual actual
- Paleta de colores:
  - Fondo Canvas Escolar: `#F8FAFC`
  - Acento Primario (Azul Cobalto Eléctrico): `#2563EB` / `#1D4ED8`
  - Acento Secundario (Ámbar Escolar): `#F59E0B`
  - Acento Verificación (Verde Esmeralda): `#10B981`
  - Bordes y Superficies: Blanco Puro (`#FFFFFF`) con bordes nítidos de 1px `#E2E8F0` y elevaciones dimensionales suaves (`shadow-xs` a `shadow-sm`).
- Tipografía principal / secundaria: `Outfit` (Headings) / `Plus Jakarta Sans` (Cuerpo y datos).
- Set de iconos en uso: `lucide-react`
- Estilo general: **Dual-Pane Study Studio (Axiom AI / Claude Canvas)**. Distribución en dos paneles continuos de alto rendimiento (panel izquierdo de entrada 42% / panel derecho de cuaderno de estudio interactivo 58% sin scroll vertical forzado). Logotipo oficial `/logo_full.jpg` y estilo de texto del Nombre Tutor-IA estrictamente preservados.

## 5. Zonas sensibles de ESTE proyecto (no tocar sin pedido explícito)
- Autenticación / sesiones: `src/services/firebase.ts`, `src/hooks/useAuthUser.ts`, validación de tokens Bearer en `server.ts`.
- Pagos / licencias: `src/components/PaymentModal.tsx`, `src/components/TrialBlockedModal.tsx`, `src/services/usageService.ts` (control estricto de cuotas para no superar el tier gratuito).
- Lógica pedagógica y algorítmica: `src/services/reviewService.ts` (orquestación en cascada y parsing de esquemas JSON), `server/schoolKnowledge.ts`.
- Guardrail escolar ético: Reglas de rechazo de consultas comerciales o inapropiadas en `src/components/SchoolGuardrailCard.tsx`.

## 6. Seguridad — dónde viven los secretos y qué está protegido
- Variables de entorno usadas: `FIREBASE_PROJECT_ID`, `FIREBASE_API_KEY`, `GROQ_API_KEY`, `VITE_FIREBASE_*` (retirado `VITE_GROQ_API_KEY` del bundle público).
- ¿Dónde se usan?: Las API keys de LLM (`GROQ_API_KEY`) se consumen solo en el backend (`server.ts` / serverless). Todas las rutas `/api/admin/*` validan Bearer token RS256 de Firebase + correo de administrador.
- Reglas de acceso a datos: Blindadas en `firestore.rules` (bloqueo de auto-elevación de `role` en `users/{userId}` y acceso restringido de listado/creación/eliminación en `activation_codes/{codeId}` solo a admin).
- Último chequeo de seguridad hecho: 2026-11-21 — Blindaje completo Prioridad 1 (`firestore.rules`, `/api/admin/*` y remoción de `VITE_GROQ_API_KEY`).

## 7. Herramientas/servicios en uso y su tier
- Vercel: Free Hobby ($0 USD / mes, 100GB ancho de banda).
- Firebase: Spark Plan ($0 USD, 50k lecturas y 20k escrituras/día en Firestore, Auth ilimitado para Google Sign-In).
- Groq Cloud: Free Developer Tier ($0 USD, cuotas por RPM/TPM en modelos Llama y Qwen).
- Wikipedia REST API: Pública y gratuita ($0 USD, 0 tokens consumidos).
- Pollinations AI: Gateway público gratuito ($0 USD, respaldo de emergencia).

## 8. Historial corto de cambios recientes
- 2026-11-21: Prioridad 3 completada: `OnboardingTourModal.tsx` (tour de 3 pasos disparado solo al iniciar sesión la primera vez, reabrible desde cabecera) y Service Worker PWA básico (`public/sw.js` registrado en `main.tsx`).
- 2026-11-21: Optimización Prioridad 2: `React.lazy` en 7 modales pesados (-500 kB / -35% gzip en carga inicial), `@media (prefers-reduced-motion: reduce)` en `index.css` y unificación visual de `CelebrationBurst`, `CorrectionCard` y `RecentHomeworksHistory`.
- 2026-11-21: Blindaje de seguridad Prioridad 1: `firestore.rules` (anti-elevación de rol y protección de códigos), autenticación RS256 admin en `/api/admin/*` y retiro de `VITE_GROQ_API_KEY` del frontend.
- 2026-11-21: Rediseño Zero-Scroll de `HomePage.tsx` (Foco Central + Selector de Nivel Primaria/Secundaria sin cajas ni píldoras, pie compacto PC/móvil) y deduplicación por correo en `adminService.ts` preservando rol admin.
- 2026-11-21: Rediseño completo al estilo **Dual-Pane Study Studio (Axiom AI / Claude Canvas)**: layout en 2 paneles sin scroll vertical, paleta azul cobalto + ámbar, modernización de modales, píldoras y chips interactivos. Logotipo y nombre Tutor-IA preservados intactos.
- 2026-11-21: Creación de `PROJECT_CONTEXT.md` oficial y corrección de tipado en `reviewService.ts` (`isCalculationSubject` y `wikiReturned404`). `npm run lint` y `build` 100% limpios.
- 2026-11-08: Actualización de marca Tutor-IA, soporte PWA Android, logo estático y configuración de despliegue.
