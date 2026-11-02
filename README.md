# ✏️ Tutor-IA — Plataforma Escolar Inteligente

<div align="center">

![Tutor-IA Banner](https://img.shields.io/badge/Tutor--IA-Plataforma_Educativa_Inteligente-FFE66D?style=for-the-badge&logoColor=1A1A1A)
<br><br>

[![React](https://img.shields.io/badge/React_19-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript_5.x-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_v4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![Firebase](https://img.shields.io/badge/Firebase_Auth_%26_Firestore-FFCA28?style=flat-square&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Vercel](https://img.shields.io/badge/Deploy_on-Vercel-000000?style=flat-square&logo=vercel&logoColor=white)](https://vercel.com/)
[![Licencia](https://img.shields.io/badge/Costo-0.00_USD_(Free_Tier)-success?style=flat-square)](#-política-de-costo-cero)

**Tutor escolar interactivo con IA pedagógica, diseñado para acompañar a estudiantes de Primaria y Secundaria en la comprensión, resolución y redacción de sus tareas escolares.**

[Características](#-características-principales) • [Arquitectura](#-arquitectura-y-tecnologías) • [Instalación](#-instalación-y-ejecución-local) • [Despliegue](#-despliegue-en-vercel) • [Seguridad](#-seguridad-y-privacidad)

</div>

---

## 📖 Acerca de Tutor-IA

**Tutor-IA** es una aplicación web educativa con estética **Neubrutalista Lúdica** (paletas cálidas, bordes marcados, sombras duras y tipografía clara) construida para transformar la forma en que los estudiantes abordan sus deberes escolares. 

A diferencia de un asistente genérico, **Tutor-IA** actúa como un guía pedagógico:
- **No hace la tarea por el alumno**: desglosa procedimientos paso a paso y aplica el método socrático para incentivar el pensamiento crítico.
- **Se adapta al nivel**: cuenta con selector dinámico entre **Modo Explorador (Primaria)** —con lenguaje accesible y metáforas cotidianas— y **Modo Reto (Bachillerato)** —con desarrollo formal de fórmulas, argumentación y análisis crítico.
- **Soporte multimodal**: procesa tanto texto escrito como **fotografías de apuntes y ejercicios manuscritos** tomadas desde cualquier teléfono móvil o tableta.

---

## ✨ Características Principales

### 🎯 1. Módulos Pedagógicos Especializados
- **🔢 Solución Paso a Paso:** Resolución guiada de problemas matemáticos, físicos o químicos con enunciado, fórmula, desarrollo ordenado, verificación y consejo del profesor.
- **✍️ Corrector Ortográfico & Redacción:** Detección de errores gramaticales y de puntuación con explicaciones claras sobre la regla aplicada y sugerencias para enriquecer el vocabulario.
- **📘 Explicación Didáctica & Resúmenes:** Síntesis estructuradas con analogías simples, glosario clave y ejemplos cotidianos.
- **🧪 Generador de Preguntas Tipo Examen:** Cuestionarios interactivos para autoevaluación antes de evaluaciones de clase.

### 📚 2. Catálogo Multidisciplinario (18 Materias Escolares)
Cobertura completa para los planes de estudio de básica y media:
*Matemáticas, Álgebra, Geometría, Lengua Castellana, Ciencias Naturales, Biología, Física, Química, Ciencias Sociales, Historia, Geografía, Filosofía, Inglés, Ética y Valores, Tecnología e Informática, Educación Artística, Educación Física y Música.*

### 🛡️ 3. Filtro Ético y Guardrail Escolar
La plataforma cuenta con un bloqueador ético perimetral que detecta y rechaza automáticamente consultas inapropiadas, comerciales o ajenas al ámbito escolar infantil/juvenil, preservando la cuota del usuario y garantizando un entorno 100% seguro.

### 📄 4. Exportación Escolar de Alta Fidelidad
- **Generación de PDF vectorial (`jsPDF`):** Descarga fichas escolares maquetadas con tipografía nítida, encabezados escolares y paginación para pegar o grapar en cuadernos físicos.
- **Copiado Rápido y Formato para Impresión:** Adaptado para impresión en papel bond estándar mediante estilos `@media print`.

---

## 🏗️ Arquitectura y Tecnologías

El proyecto está diseñado bajo principios de desacoplamiento, modularidad y costo cero:

```
Tutor-IA/
├── api/                   # Serverless handler para Vercel (/api/index.ts)
├── server/                # Lógica del servidor y motor de conocimiento
│   └── schoolKnowledge.ts # Fallback offline/Wikipedia para ahorro de tokens
├── src/
│   ├── components/        # Componentes UI modulares (Header, Cards, Modals)
│   ├── data/              # Catálogo maestro de materias y metadatos
│   ├── services/          # Clientes de Firebase, IA (Review), Cuotas y PDF
│   ├── types/             # Contratos estrictos de TypeScript
│   ├── utils/             # Compresión en cliente y utilidades
│   ├── App.tsx            # Componente raíz orquestador
│   └── main.tsx           # Punto de entrada Vite React 19
├── server.ts              # Servidor Express de desarrollo y producción
├── vite.config.ts         # Configuración Vite + Tailwind CSS v4
└── tsconfig.json          # Reglas estrictas de compilación TypeScript
```

### Stack Técnico:
- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Motion.
- **Backend:** Express 4, TypeScript (`tsx`), Node.js.
- **Base de Datos y Autenticación:** Firebase Spark (Google Auth & Firestore optimizado con caché local).
- **Inferencia de IA y Ahorro:** Cascada con soporte de Groq, Pollinations AI y motor de conocimiento abierto sin cuotas.

---

## 💡 Política de Costo Cero ($0 USD)

Tutor-IA fue concebido para operar **perpetuamente sin requerir tarjetas de crédito ni suscripciones de pago**:
1. **Fallback Local y APIs Abiertas:** El servicio `schoolKnowledge.ts` resuelve consultas mediante la API abierta de Wikimedia/Wikipedia cuando los proveedores de LLM experimentan saturación o límites de cuota (HTTP 429).
2. **Optimización Firestore:** Se reducen las lecturas en hasta un 98% gracias a estrategias de caché local de 12 horas en el cliente.
3. **Compresión Previa de Imágenes:** Las fotos de cuadernos se procesan y optimizan en el navegador mediante Canvas antes del envío (máx. 1024px JPEG al 80%), minimizando el ancho de banda y el consumo de tokens de visión.

---

## 🚀 Instalación y Ejecución Local

### Prerrequisitos
- [Node.js](https://nodejs.org/) v18.0.0 o superior
- Un gestor de paquetes (`npm`, `pnpm` o `bun`)

### 1. Clonar el repositorio
```bash
git clone https://github.com/TU_USUARIO/Tutor-IA.git
cd Tutor-IA
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Copia la plantilla de variables de entorno:
```bash
cp .env.example .env
```

Edita `.env` con las credenciales de tu proyecto de Firebase (disponibles en la consola de Firebase):
```env
VITE_FIREBASE_PROJECT_ID="tu-proyecto-id"
VITE_FIREBASE_APP_ID="tu-app-id"
VITE_FIREBASE_API_KEY="tu-api-key"
VITE_FIREBASE_AUTH_DOMAIN="tu-proyecto.firebaseapp.com"
VITE_FIREBASE_STORAGE_BUCKET="tu-proyecto.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="tu-sender-id"

# Opcional (para potenciar respuestas con Groq):
GROQ_API_KEY=""
```

### 4. Iniciar en modo desarrollo
```bash
npm run dev
```
La aplicación estará disponible en `http://localhost:3000` (o el puerto asignado).

---

## ☁️ Despliegue en Vercel

El proyecto cuenta con configuración preconfigurada para Vercel ([vercel.json](vercel.json)):

1. Haz un push de tu código a tu repositorio de GitHub.
2. Ingresa a [Vercel Dashboard](https://vercel.com/) e importa el repositorio `Tutor-IA`.
3. En la sección **Environment Variables**, añade las variables definidas en tu archivo `.env.example`.
4. Haz clic en **Deploy**. Vercel compilará la aplicación estática y montará las rutas serverless en `/api`.

---

## 🔒 Seguridad y Privacidad

- **Protección de Menores:** No se almacena información sensible como colegios de procedencia, direcciones físicas o números telefónicos de menores de edad.
- **Tratamiento Efímero de Imágenes:** Las fotografías de cuadernos se procesan en memoria en tiempo real para generar la explicación didáctica y no se conservan en bases de datos públicas.
- **Aislamiento de Secretos:** Las llaves de API nunca se exponen al cliente. Las rutas del backend validan las solicitudes mediante cabeceras seguras y control de tasa de peticiones (Rate Limiting).

---

## 📄 Licencia

Este proyecto se distribuye bajo fines educativos y de código abierto para beneficio de la comunidad estudiantil.
