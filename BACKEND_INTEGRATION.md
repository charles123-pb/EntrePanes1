# Guía de Integración con Backend

## Estado Actual
✅ Frontend completamente desacoplado y listo para conectarse con tu backend
✅ Sistema de autenticación configurado (PIN de 4 dígitos)
✅ Teclado numérico virtual táctil para entrada de PIN
✅ Estructura de datos definida en `/src/app/core/models/models.ts`
✅ Endpoints API mapeo en `/src/app/core/services/api.service.ts`

## Configuración de Backend

### 1. URL del API
Edita `/src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://tu-backend-url/api',  // ← Cambiar aquí
  useMock: false  // Esto ya está listo
};
```

### 2. Endpoints Requeridos

Tu backend debe implementar estos endpoints:

#### Usuarios (Autenticación)
```
GET /api/usuarios
Response: AppUser[]

POST /api/usuarios/login
Body: { usuario: string, pin: string }
Response: { success: boolean, user?: AppUser }
```

#### Productos
```
GET /api/productos
Response: Producto[]

POST /api/productos
Body: Omit<Producto, 'id'>
Response: Producto
```

#### Ventas
```
GET /api/ventas
Response: Venta[]

POST /api/ventas
Body: Omit<Venta, 'id'>
Response: Venta
```

#### Compras
```
GET /api/compras
Response: Compra[]

POST /api/compras
Body: Omit<Compra, 'id'>
Response: Compra
```

#### Proveedores
```
GET /api/proveedores
Response: Proveedor[]

POST /api/proveedores
Body: Omit<Proveedor, 'id'>
Response: Proveedor
```

#### Insumos
```
GET /api/insumos
Response: Insumo[]

POST /api/insumos
Body: Omit<Insumo, 'id'>
Response: Insumo
```

#### Kardex
```
GET /api/kardex
Response: KardexEntry[]
```

#### Recetas
```
GET /api/recetas
Response: Receta[]
```

### 3. Modelos de Datos

Todos los modelos están definidos en `/src/app/core/models/models.ts`

**IMPORTANTE:** Los tipos de datos deben coincidir exactamente con lo definido en el frontend.

### 4. Autenticación

El sistema usa autenticación PIN:
- Al iniciar la app, se muestra un selector visual de usuarios
- El usuario selecciona su perfil (Admin, Cajero, Cocinero)
- Ingresa su PIN de 4 dígitos (visible en teclado numérico)
- Al completar los 4 dígitos, se valida automáticamente contra tu backend

**Endpoint especial:**
```
POST /api/login
Body: { usuario: string, pin: string }
Response: { success: boolean, user?: AppUser, token?: string }
```

### 5. Servicios Locales

- **AuthService** (`/src/app/core/services/auth.service.ts`) - Maneja login/logout
- **AppStateService** (`/src/app/core/services/app-state.service.ts`) - Estado global (productos, ventas, etc.)
- **ApiService** (`/src/app/core/services/api.service.ts`) - Llamadas HTTP al backend
- **PrintService** (`/src/app/core/services/print.service.ts`) - Impresión de tickets

### 6. Variables de Sesión

Tras login exitoso, se almacena en `currentUser`:
```typescript
{
  id: number;
  usuario: string;
  nombre: string;
  pin: string;
  rol: 'admin' | 'cajero' | 'cocinero';
  activo: boolean;
}
```

Acceso en componentes: `auth.currentUser()`

### 7. Flujos Principales

#### Venta
1. Usuário selecciona productos
2. Elige tipo de comprobante (Ticket/Boleta/Factura)
3. Selecciona método de pago:
   - Efectivo (requiere cantidad recibida)
   - Tarjeta
   - Digital (abre modal para elegir Yape/Plin)
4. Si es Boleta/Factura, pide datos del cliente
5. POST a `/api/ventas` con los datos
6. Imprime ticket

#### Compra
1. Selecciona proveedor
2. Agrega insumos/productos
3. Ingresa cantidades y precios
4. POST a `/api/compras`

#### Inventario
Sincronización con kardex del backend

## Testing

Para probar durante desarrollo:
```bash
npm start
# Navega a http://localhost:4200
# Usa las credenciales del archivo de constantes
```

## URL de Deployment

Cuando vayas a producción, cambia en `environment.prod.ts` o configura los endpoints según tu infraestructura.

---

**Status:** ✅ Listo para integración
**Última actualización:** Abril 9, 2026
