# Entre Panes - Estructura Funcional para Backend ✅

El frontend está completamente preparado para conectar con tu backend.

## 📋 Servicios Disponibles

### 1. **ApiService** (`src/app/core/services/api.service.ts`)
Maneja todas las conexiones REST:
- ✅ GET de datos (proveedores, insumos, productos, ventas, compras, kardex)
- ✅ POST para crear recursos
- ✅ PUT para actualizar recursos
- ✅ DELETE para eliminar
- ✅ POST para upload de imágenes
- ✅ Health check

**Features:**
- Timeout de 30 segundos
- Reintentos automáticos (2 veces)
- Manejo de errores centralizado
- Soporte para modo mock (`useMock: true`)

### 2. **ImageService** (`src/app/core/services/image.service.ts`)
Maneja imágenes de productos:
- ✅ Validación de archivo (tipo, tamaño)
- ✅ Generación de preview (DataURL)
- ✅ Upload con FormData
- ✅ Obtener URL de imagen
- ✅ Obtener metadatos de imagen (dimensiones, tamaño)
- ✅ Eliminar imagen

**Validaciones:**
- Formatos soportados: JPG, PNG, GIF, WebP
- Tamaño máximo: 5MB

### 3. **AppStateService** (`src/app/core/services/app-state.service.ts`)
Gestiona estado global:
- ✅ Signals de estado reactivo
- ✅ Computed signals para derivados
- ✅ LocalStorage para persistencia
- ✅ Carga desde API si `useMock: false`

---

## 🎯 Componentes Actualizados

### Productos (`src/app/features/productos/productos.component.ts`)
- ✅ Visualización de imágenes en grid
- ✅ Formulario con upload de imagen
- ✅ Preview en tiempo real
- ✅ Validación de archivo
- ✅ Spinner mientras sube
- ✅ Manejo de errores amigable

**Funciones:**
- Crear producto con imagen
- Editar producto (cambiar imagen)
- Eliminar producto
- Filtrar por categoría
- Calcular costo y margen

### Ventas (`src/app/features/ventas/ventas.component.ts`)
- ✅ Visualización de imágenes en catálogo
- ✅ Fallback a ícono si no hay imagen

---

## 🔧 Configuración

### environment.ts
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',  // 👈 Cambia aquí tu URL
  useMock: false  // false = conectar backend, true = mock
};
```

---

## 🚀 Próximos Pasos para Conectar Backend

### 1. Implementar Endpoints (Backend)
Ver archivo `API_INTEGRATION.md` para especificación completa.

**Endpoints prioritarios:**
1. `GET /api/productos` - Listar productos
2. `GET /api/insumos` - Listar insumos
3. `POST /api/productos` - Crear producto
4. `POST /api/upload` - Subir imagen
5. `GET /api/images/productos/{id}` - Servir imagen

### 2. Configurar URL de API
```typescript
// En src/environments/environment.ts
apiUrl: 'http://tu-servidor:puerto/api'
```

### 3. Habilitar Backend
```typescript
// En src/environments/environment.ts
useMock: false
```

### 4. Pruebas
- Verificar CORS en el backend
- Testear endpoints con Postman
- Validar respuestas en formato correcto

---

## 📦 Modelos de Datos

Todos definidos en `src/app/core/models/models.ts`:
- ✅ `Proveedor`
- ✅ `Insumo`
- ✅ `Producto` (con imagen)
- ✅ `Venta`
- ✅ `Compra`
- ✅ `KardexEntry`

---

## 🎨 Constantes Centralizadas

Ubicado en `src/app/core/constants/constants.ts`:
- ✅ `CAT_ACCENT` - Colores por categoría
- ✅ `NAV` - Items de navegación
- ✅ `ROL_BADGE`, `ROL_ICON` - Estilos de roles
- ✅ `USERS_DEFAULT` - Usuarios por defecto

---

## ✨ Features Incluidas

✅ Upload de imágenes con preview  
✅ Validación automática de archivos  
✅ Spinners de carga  
✅ Mensajes de error/éxito  
✅ Modo mock para desarrollo  
✅ Reintentos automáticos  
✅ Estado reactivo con Signals  
✅ LocalStorage persistente  
✅ Soporte para CRUD completo  

---

## 🧪 Testing Sin Backend

Para trabajar sin backend, mantén:
```typescript
useMock: true
```

Esto retorna arrays vacíos automáticamente, permitiendo testear la UI sin conectar.

---

## 📝 Notas Importantes

1. **CORS**: Asegura que tu backend permita CORS
2. **Puertos**: Frontend en `:4200`, Backend en `:3000`
3. **Fechas**: Usar ISO 8601 ("2025-03-05T12:30:00")
4. **IDs**: Números enteros positivos
5. **Imágenes**: Backend debe crear carpeta `/images/productos/`

---

## 🔗 Archivos Clave

- `src/environments/environment.ts` - Configuración
- `src/app/core/services/api.service.ts` - API REST
- `src/app/core/services/image.service.ts` - Manejo de imágenes
- `src/app/core/models/models.ts` - Tipos TypeScript
- `API_INTEGRATION.md` - Especificación de endpoints
- `src/app/features/productos/` - Componentes UI

---

**¡Listo para conectar! 🎉**
