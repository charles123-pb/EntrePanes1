/**
 * Environment Configuration
 * 
 * IMPORTANTE:
 * - Cambiar apiUrl a tu URL del backend antes de ir a producción
 * - useMock: false = Usa API real | true = Usa datos mockeados
 */
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',  // ← Configura tu backend aquí
  useMock: false  // Cambiar a false cuando backend esté listo
};
