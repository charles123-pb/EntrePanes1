# Entre Panes - Frontend API Integration Guide

## Configuración Actual

```typescript
// environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  useMock: false  // Set to true for local testing without backend
};
```

## Endpoints Requeridos por el Backend

Todos los endpoints deben responder en formato JSON. El frontend espera que el servidor esté en `http://localhost:3000/api`

### 1. DATOS (GET)

#### Proveedores
```
GET /api/proveedores
Response: Proveedor[]

interface Proveedor {
  id: number;
  nombre: string;
  ruc: string;
  telefono: string;
  email: string;
}
```

#### Insumos
```
GET /api/insumos
Response: Insumo[]

interface Insumo {
  id: number;
  nombre: string;
  unidad: string;      // 'kg', 'L', 'unid.'
  stock: number;
  stock_min: number;
  costo: number;
  prov_id: number;    // FK to Proveedor
}
```

#### Productos
```
GET /api/productos
Response: Producto[]

interface Producto {
  id: number;
  nombre: string;
  cat: string;
  precio: number;
  receta: RecetaItem[];
  imagen?: string;          // ID o nombre del archivo
  imagenUrl?: string;       // URL completa de la imagen
}

interface RecetaItem {
  ins_id: number;   // FK to Insumo
  cant: number;
}
```

#### Ventas
```
GET /api/ventas
Response: Venta[]

interface Venta {
  id: number;
  fecha: string;             // ISO format
  items: VentaItem[];
  subtotal: number;
  descuento: number;
  total: number;
  metodo: 'efectivo' | 'tarjeta' | 'yape' | 'plin';
  tipo_comp: 'boleta' | 'factura' | 'ticket';
  comprobante?: string;
  sunat_estado?: 'emitido' | 'pendiente' | 'error' | '';
  pdf_url?: string;
  estado: 'completada' | 'anulada' | 'pendiente';
  cajero: string;           // usuario del cajero
  cliente_dni?: string;
  cliente_ruc?: string;
  cliente_razon?: string;
  efectivo_dado?: number;
  vuelto?: number;
  mesa?: string;
}

interface VentaItem {
  id: number;
  nombre: string;
  cant: number;
  pu: number;               // precio unitario
  sub: number;              // subtotal
  nota?: string;
}
```

#### Compras
```
GET /api/compras
Response: Compra[]

interface Compra {
  id: number;
  fecha: string;
  prov_id: number;
  total: number;
  comprobante: string;
  tipo_comp: 'factura' | 'ticket';
  en_sire: boolean;
  tipo_proveedor: 'electronico' | 'fisico';
  items: CompraItem[];
}

interface CompraItem {
  ins_id: number;
  nombre: string;
  cant: number;
  pu: number;
  sub: number;
}
```

#### Kardex
```
GET /api/kardex
Response: KardexEntry[]

interface KardexEntry {
  id: number;
  fecha: string;
  ins_id: number;
  tipo: 'entrada' | 'salida' | 'merma' | 'ajuste';
  cant: number;
  stock_antes: number;
  stock_despues: number;
  costo_u: number;
  costo_total: number;
  motivo: string;
  ref: string;
  num_comp: string;
  tipo_comp: string;
}
```

---

### 2. CREAR/ACTUALIZAR (POST/PUT)

#### Crear Proveedor
```
POST /api/proveedores
Body: Omit<Proveedor, 'id'>
Response: Proveedor (con id asignado)
```

#### Actualizar Proveedor
```
PUT /api/proveedores/:id
Body: Partial<Proveedor>
Response: Proveedor (actualizado)
```

#### Crear Insumo
```
POST /api/insumos
Body: Omit<Insumo, 'id'>
Response: Insumo (con id asignado)
```

#### Actualizar Insumo
```
PUT /api/insumos/:id
Body: Partial<Insumo>
Response: Insumo (actualizado)
```

#### Crear Producto
```
POST /api/productos
Body: Omit<Producto, 'id'>
Response: Producto (con id asignado)
```

#### Actualizar Producto
```
PUT /api/productos/:id
Body: Partial<Producto>
Response: Producto (actualizado)
```

#### Crear Venta
```
POST /api/ventas
Body: Omit<Venta, 'id'>
Response: Venta (con id asignado)
```

#### Crear Compra
```
POST /api/compras
Body: Omit<Compra, 'id'>
Response: Compra (con id asignado)
```

---

### 3. UPLOAD DE IMÁGENES

#### Subir imagen de producto
```
POST /api/upload
Headers: Content-Type: multipart/form-data
Body: 
  - file: File (JPG, PNG, GIF, WebP, máx 5MB)
  - type: 'producto'

Response: {
  url: string;           // URL completa para acceder: http://localhost:3000/api/images/productos/...
  id: string;            // ID único de la imagen
  fileName: string;
  size: number;
  uploadedAt: string;    // ISO format
}
```

#### Obtener imagen
```
GET /api/images/productos/{imageId}
Response: Image file (binary)
```

#### Eliminar imagen
```
DELETE /api/images/productos/{imageId}
Response: 200 OK (vacío)
```

---

### 4. UTILIDAD

#### Health check
```
GET /api/health
Response: { status: 'online' }
```

---

## Manejo de Errores

El frontend espera respuestas HTTP con códigos de estado estándar:

```
200 OK       - Exitoso
201 Created  - Recurso creado
400 Bad Request - Datos inválidos
404 Not Found - Recurso no encontrado
500 Internal Server Error - Error del servidor
```

En caso de error, incluir mensaje en la respuesta:
```json
{
  "error": "Descripción del error",
  "statusCode": 400
}
```

---

## Cambios en Configuración

### Cambiar URL de API
Edita `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'https://tu-api.com/api',  // Cambiar aquí
  useMock: false
};
```

### Modo Mock (sin backend)
Para desarrollo sin backend, cambia a:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  useMock: true  // Retorna arrays vacíos
};
```

---

## Notas Importantes

1. **CORS**: El backend debe permitir CORS desde `http://localhost:4200` (puerto default de Angular)
2. **Timeouts**: El frontend espera respuestas dentro de 30 segundos
3. **Reintentos**: Automáticamente reintenta 2 veces en caso de error de conexión
4. **IDs**: Los IDs deben ser números enteros positivos
5. **Fechas**: Usar formato ISO 8601 (ej: "2025-03-05T12:30:00")
6. **Imágenes**: El servidor debe crear carpeta `/images/productos/` para almacenarlas

---

## Flujo de Integración Recomendado

1. Implementa primero los GET de datos (proveedores, insumos, productos)
2. Prueba como GET devuelve data real
3. Implementa POST para crear recursos
4. Implementa PUT para actualizar
5. Finalmente, implementa upload de imágenes

---

## Testing desde Postman

```
# Test proveedores
GET http://localhost:3000/api/proveedores

# Test crear proveedor
POST http://localhost:3000/api/proveedores
Content-Type: application/json
{
  "nombre": "San Fernando",
  "ruc": "20100154308",
  "telefono": "01-3150800",
  "email": "ventas@sanfernando.com.pe"
}

# Test upload de imagen
POST http://localhost:3000/api/upload
Content-Type: multipart/form-data
file: (seleccionar archivo)
type: producto
```
