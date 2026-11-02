/**
 * Punto de entrada Serverless para Vercel (/api/*)
 * Reutiliza la aplicación Express de server.ts (rutas /api/review y /api/health)
 * manteniendo ocultas las variables de entorno del servidor y la validación de tokens.
 */
import app from '../server';

export default app;
