# 🥪 EntrePanes - Sistema POS

Sistema de Punto de Venta (POS) moderno para sandwicherías, desarrollado con **Angular 21** + **Tailwind CSS** + **Material Design**.

## ✨ Características

- ✅ **Autenticación por PIN** - Teclado numérico virtual para entrada segura
- ✅ **Gestión de Ventas** - Punto de venta completo con múltiples comprobantes
- ✅ **Gestión de Compras** - Inventario de proveedores e insumos
- ✅ **Inventario** - Control de stock y kardex
- ✅ **Admin** - Configuración de usuarios, SUNAT, Nubefact
- ✅ **Reportes** - Historial de ventas y compras
- ✅ **Diseño Responsive** - UI optimizado para escritorio y tablet táctil

## 🚀 Inicio Rápido

### Requisitos
- Node.js 20+
- npm o yarn

### Instalación
```bash
# Clonar repositorio
git clone https://github.com/charles123-pb/EntrePanes1.git
cd entre-panes

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm start
```

Abre http://localhost:4200 en tu navegador.

## 🔗 Integración con Backend

Para conectar con tu backend, edita `/src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://tu-backend-url/api',  // ← Cambiar aquí
  useMock: false
};
```

**Ver [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md) para detalles de endpoints y modelos de datos.**

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── core/
│   │   ├── services/          # AuthService, ApiService, AppStateService
│   │   ├── models/            # Tipos TypeScript
│   │   └── constants/         # Datos por defecto
│   ├── features/              # Componentes por página
│   │   ├── login/
│   │   ├── dashboard/
│   │   ├── ventas/
│   │   ├── compras/
│   │   ├── inventario/
│   │   └── ...
│   ├── shared/                # Componentes reutilizables
│   │   ├── components/
│   │   └── pipes/
│   └── app.routes.ts          # Rutas principales
├── environments/              # Configuraciones por entorno
└── styles.scss               # Estilos globales
```

## 🛠️ Scripts Disponibles

```bash
npm start          # Inicia servidor de desarrollo
npm run build      # Compila para producción
npm test           # Ejecuta tests
npm run lint       # Verifica código
```

## 🎨 Tecnologías

- **Angular 21.2.8** - Framework frontend
- **TypeScript 5.6** - Lenguaje tipado
- **Tailwind CSS 3** - Estilos utilitarios
- **Angular Material 21.2.6** - Componentes UI
- **RxJS** - Programación reactiva
- **Signals** - Estado reactivo (Angular 21+)

## 🔐 Autenticación

- Usuarios predefinidos en `/src/app/core/constants/constants.ts`
- PIN de 4 dígitos
- Roles: Admin, Cajero, Cocinero
- Sistema de caché en localStorage

## 📊 Modelos de Datos

Definidos en `/src/app/core/models/models.ts`:
- Usuario, Producto, Venta, Compra
- Proveedor, Insumo, Receta
- Kardex, Historial SUNAT

## 🚀 Despliegue

```bash
# Build para producción
npm run build

# La carpeta dist/ contiene los archivos listos para desplegar
```

## 📝 Licencia

Privado / Propietario

## 👤 Autor

Charles PB - charles123-pb

---

**Estado:** ✅ Listo para integración con backend  
**Última actualización:** Abril 9, 2026

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
