# 📊 Entre Panes — Esquema de Base de Datos

Documento que define la estructura de tablas necesarias para el backend del sistema POS Entre Panes.

---

## 🗄️ TABLAS REQUERIDAS (7 tablas principales)

### 1️⃣ **`proveedores`** — Gestión de proveedores
| Campo | Tipo | Restricción | Descripción |
|-------|------|-------------|-------------|
| `id` | INT | PK, AUTO_INCREMENT | Identificador único |
| `nombre` | VARCHAR(255) | NOT NULL, UNIQUE | Nombre del proveedor |
| `ruc` | VARCHAR(11) | NOT NULL, UNIQUE | RUC del proveedor |
| `telefono` | VARCHAR(20) | | Número de contacto |
| `email` | VARCHAR(255) | | Correo electrónico |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Fecha de creación |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Última actualización |

**Índices:**
```sql
CREATE UNIQUE INDEX idx_proveedores_ruc ON proveedores(ruc);
CREATE UNIQUE INDEX idx_proveedores_nombre ON proveedores(nombre);
```

---

### 2️⃣ **`insumos`** — Inventario de insumos/ingredientes
| Campo | Tipo | Restricción | Descripción |
|-------|------|-------------|-------------|
| `id` | INT | PK, AUTO_INCREMENT | Identificador único |
| `nombre` | VARCHAR(255) | NOT NULL | Nombre del insumo |
| `unidad` | VARCHAR(50) | NOT NULL | kg, lt, unidad, etc. |
| `stock` | DECIMAL(10,2) | NOT NULL | Stock actual |
| `stock_min` | DECIMAL(10,2) | NOT NULL | Stock mínimo (alerta) |
| `costo` | DECIMAL(10,2) | NOT NULL | Costo unitario |
| `prov_id` | INT | FK → proveedores.id | Proveedor asociado |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Fecha creación |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Última modificación |

**Índices & Constraints:**
```sql
ALTER TABLE insumos 
  ADD CONSTRAINT fk_insumos_prov 
  FOREIGN KEY (prov_id) REFERENCES proveedores(id);

CREATE INDEX idx_insumos_prov_id ON insumos(prov_id);
```

---

### 3️⃣ **`productos`** — Catálogo de productos
| Campo | Tipo | Restricción | Descripción |
|-------|------|-------------|-------------|
| `id` | INT | PK, AUTO_INCREMENT | Identificador único |
| `nombre` | VARCHAR(255) | NOT NULL, UNIQUE | Nombre del producto |
| `categoria` | VARCHAR(100) | NOT NULL | Ej: Sándwiches, Bebidas, Postres |
| `precio` | DECIMAL(10,2) | NOT NULL | Precio de venta |
| `imagen_url` | VARCHAR(500) | | URL de la imagen del producto |
| `activo` | BOOLEAN | DEFAULT TRUE | Si está disponible para venta |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Fecha creación |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Última actualización |

**Índices:**
```sql
CREATE UNIQUE INDEX idx_productos_nombre ON productos(nombre);
CREATE INDEX idx_productos_categoria ON productos(categoria);
CREATE INDEX idx_productos_activo ON productos(activo);
```

---

### 4️⃣ **`recetas`** — Composición de productos (ingredientes por producto)
| Campo | Tipo | Restricción | Descripción |
|-------|------|-------------|-------------|
| `id` | INT | PK, AUTO_INCREMENT | Identificador único |
| `producto_id` | INT | FK → productos.id | Producto que contiene los insumos |
| `insumo_id` | INT | FK → insumos.id | Insumo utilizado |
| `cantidad` | DECIMAL(10,2) | NOT NULL | Cantidad de insumo por producto |

**Índices & Constraints:**
```sql
ALTER TABLE recetas 
  ADD CONSTRAINT fk_recetas_producto 
  FOREIGN KEY (producto_id) REFERENCES productos(id);

ALTER TABLE recetas 
  ADD CONSTRAINT fk_recetas_insumo 
  FOREIGN KEY (insumo_id) REFERENCES insumos(id);

CREATE INDEX idx_recetas_producto_id ON recetas(producto_id);
CREATE INDEX idx_recetas_insumo_id ON recetas(insumo_id);
```

---

### 5️⃣ **`ventas`** — Registro de transacciones de venta
| Campo | Tipo | Restricción | Descripción |
|-------|------|-------------|-------------|
| `id` | INT | PK, AUTO_INCREMENT | Identificador transacción |
| `fecha` | DATETIME | NOT NULL | Fecha/hora de venta |
| `subtotal` | DECIMAL(10,2) | NOT NULL | Suma de items |
| `descuento` | DECIMAL(10,2) | DEFAULT 0 | Descuento aplicado |
| `total` | DECIMAL(10,2) | NOT NULL | Monto final |
| `metodo_pago` | ENUM('efectivo', 'tarjeta', 'yape', 'plin') | NOT NULL | Tipo de pago |
| `tipo_comprobante` | ENUM('ticket', 'boleta', 'factura') | NOT NULL | Comprobante fiscal |
| `num_comprobante` | VARCHAR(50) | | Número de boleta/factura |
| `cliente_dni` | VARCHAR(8) | | DNI del cliente |
| `cliente_ruc` | VARCHAR(11) | | RUC del cliente |
| `cliente_razon_social` | VARCHAR(255) | | Razón social (para factura) |
| `cajero` | VARCHAR(100) | NOT NULL | Usuario que realizó venta |
| `efectivo_dado` | DECIMAL(10,2) | | Dinero recibido (si efectivo) |
| `vuelto` | DECIMAL(10,2) | | Vuelto entregado |
| `sunat_estado` | ENUM('emitido', 'pendiente', 'error', '') | DEFAULT 'pendiente' | Estado SUNAT |
| `pdf_url` | VARCHAR(500) | | URL del PDF del comprobante |
| `estado` | ENUM('completada', 'anulada', 'pendiente') | DEFAULT 'completada' | Estado de venta |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Fecha creación |

**Índices:**
```sql
CREATE INDEX idx_ventas_fecha ON ventas(fecha);
CREATE INDEX idx_ventas_cajero ON ventas(cajero);
CREATE INDEX idx_ventas_estado ON ventas(estado);
CREATE INDEX idx_ventas_tipo_comprobante ON ventas(tipo_comprobante);
```

---

### 6️⃣ **`venta_items`** — Detalle de items por venta
| Campo | Tipo | Restricción | Descripción |
|-------|------|-------------|-------------|
| `id` | INT | PK, AUTO_INCREMENT | Identificador |
| `venta_id` | INT | FK → ventas.id | Venta asociada |
| `producto_id` | INT | FK → productos.id | Producto vendido |
| `cantidad` | DECIMAL(10,2) | NOT NULL | Cantidad vendida |
| `precio_unitario` | DECIMAL(10,2) | NOT NULL | Precio en momento venta |
| `subtotal` | DECIMAL(10,2) | NOT NULL | cant × pu |
| `nota` | TEXT | | Notas del item |

**Índices & Constraints:**
```sql
ALTER TABLE venta_items 
  ADD CONSTRAINT fk_venta_items_venta 
  FOREIGN KEY (venta_id) REFERENCES ventas(id) ON DELETE CASCADE;

ALTER TABLE venta_items 
  ADD CONSTRAINT fk_venta_items_producto 
  FOREIGN KEY (producto_id) REFERENCES productos(id);

CREATE INDEX idx_venta_items_venta_id ON venta_items(venta_id);
```

---

### 7️⃣ **`compras`** — Registro de compras a proveedores
| Campo | Tipo | Restricción | Descripción |
|-------|------|-------------|-------------|
| `id` | INT | PK, AUTO_INCREMENT | Identificador |
| `fecha` | DATETIME | NOT NULL | Fecha de compra |
| `proveedor_id` | INT | FK → proveedores.id | Proveedor |
| `total` | DECIMAL(10,2) | NOT NULL | Monto total |
| `num_comprobante` | VARCHAR(50) | NOT NULL | Ref. factura/ticket |
| `tipo_comprobante` | ENUM('boleta', 'factura', 'ticket') | NOT NULL | Tipo documento |
| `en_sire` | BOOLEAN | DEFAULT FALSE | ¿Registrado en SIRE? |
| `tipo_proveedor` | ENUM('electronico', 'fisico') | NOT NULL | Tipo proveedor |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Fecha creación |

**Índices & Constraints:**
```sql
ALTER TABLE compras 
  ADD CONSTRAINT fk_compras_proveedor 
  FOREIGN KEY (proveedor_id) REFERENCES proveedores(id);

CREATE INDEX idx_compras_fecha ON compras(fecha);
CREATE INDEX idx_compras_proveedor_id ON compras(proveedor_id);
```

---

### 8️⃣ **`compra_items`** — Detalle de items por compra
| Campo | Tipo | Restricción | Descripción |
|-------|------|-------------|-------------|
| `id` | INT | PK, AUTO_INCREMENT | Identificador |
| `compra_id` | INT | FK → compras.id | Compra asociada |
| `insumo_id` | INT | FK → insumos.id | Insumo comprado |
| `cantidad` | DECIMAL(10,2) | NOT NULL | Cantidad |
| `precio_unitario` | DECIMAL(10,2) | NOT NULL | Precio en momento compra |
| `subtotal` | DECIMAL(10,2) | NOT NULL | cant × pu |

**Índices & Constraints:**
```sql
ALTER TABLE compra_items 
  ADD CONSTRAINT fk_compra_items_compra 
  FOREIGN KEY (compra_id) REFERENCES compras(id) ON DELETE CASCADE;

ALTER TABLE compra_items 
  ADD CONSTRAINT fk_compra_items_insumo 
  FOREIGN KEY (insumo_id) REFERENCES insumos(id);

CREATE INDEX idx_compra_items_compra_id ON compra_items(compra_id);
```

---

### 9️⃣ **`kardex`** — Movimiento de inventario (entrada/salida/merma/ajuste)
| Campo | Tipo | Restricción | Descripción |
|-------|------|-------------|-------------|
| `id` | INT | PK, AUTO_INCREMENT | Identificador |
| `fecha` | DATETIME | NOT NULL | Fecha del movimiento |
| `insumo_id` | INT | FK → insumos.id | Insumo movido |
| `tipo_movimiento` | ENUM('entrada', 'salida', 'merma', 'ajuste') | NOT NULL | Tipo de movimiento |
| `cantidad` | DECIMAL(10,2) | NOT NULL | Cantidad movida |
| `stock_antes` | DECIMAL(10,2) | NOT NULL | Stock previo |
| `stock_despues` | DECIMAL(10,2) | NOT NULL | Stock posterior |
| `costo_unitario` | DECIMAL(10,2) | NOT NULL | Costo unitario |
| `costo_total` | DECIMAL(10,2) | NOT NULL | cant × costo_u |
| `motivo` | VARCHAR(255) | | Razón del movimiento |
| `referencia` | VARCHAR(50) | | ID compra/venta asociada |
| `num_comprobante` | VARCHAR(50) | | Número de comprobante |
| `tipo_comprobante` | VARCHAR(50) | | Tipo de comprobante |
| `usuario` | VARCHAR(100) | | Usuario que registró |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Fecha creación |

**Índices:**
```sql
ALTER TABLE kardex 
  ADD CONSTRAINT fk_kardex_insumo 
  FOREIGN KEY (insumo_id) REFERENCES insumos(id);

CREATE INDEX idx_kardex_fecha ON kardex(fecha);
CREATE INDEX idx_kardex_insumo_id ON kardex(insumo_id);
CREATE INDEX idx_kardex_tipo ON kardex(tipo_movimiento);
```

---

### 🔟 **`historial_declaracion`** — Historial de declaraciones RER
| Campo | Tipo | Restricción | Descripción |
|-------|------|-------------|-------------|
| `id` | INT | PK, AUTO_INCREMENT | Identificador |
| `mes` | INT | NOT NULL | Mes (1-12) |
| `anio` | INT | NOT NULL | Año |
| `total_ventas` | DECIMAL(10,2) | NOT NULL | Total vendido |
| `base_imponible` | DECIMAL(10,2) | NOT NULL | Base para IGV |
| `igv` | DECIMAL(10,2) | NOT NULL | 18% del base |
| `ipm` | DECIMAL(10,2) | NOT NULL | IPM calculado |
| `ir` | DECIMAL(10,2) | NOT NULL | Impuesto a la renta |
| `total_sunat` | DECIMAL(10,2) | NOT NULL | Total a pagar SUNAT |
| `pagado` | BOOLEAN | DEFAULT FALSE | ¿Se pagó? |
| `fecha_pago` | DATETIME | | Fecha efectivo pago |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Fecha creación |

**Índices:**
```sql
CREATE UNIQUE INDEX idx_historial_mes_anio ON historial_declaracion(mes, anio);
```

---

### 1️⃣1️⃣ **`usuarios`** — Usuarios del sistema (admin, cajero, cocinero)
| Campo | Tipo | Restricción | Descripción |
|-------|------|-------------|-------------|
| `id` | INT | PK, AUTO_INCREMENT | Identificador |
| `nombre` | VARCHAR(255) | NOT NULL | Nombre completo |
| `usuario` | VARCHAR(100) | NOT NULL, UNIQUE | Username para login |
| `pin` | VARCHAR(4) | NOT NULL | PIN de 4 dígitos |
| `rol` | ENUM('admin', 'cajero', 'cocinero') | NOT NULL | Rol del usuario |
| `activo` | BOOLEAN | DEFAULT TRUE | ¿Usuario activo? |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Fecha creación |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Última actualización |

**Índices:**
```sql
CREATE UNIQUE INDEX idx_usuarios_username ON usuarios(usuario);
```

---

### 1️⃣2️⃣ **`config_nubefact`** — Configuración de emisión de comprobantes
| Campo | Tipo | Restricción | Descripción |
|-------|------|-------------|-------------|
| `id` | INT | PK = 1 | Solo 1 registro |
| `token` | VARCHAR(255) | NOT NULL | Token API Nubefact |
| `url_api` | VARCHAR(255) | NOT NULL | Base URL de API |
| `serie_boleta` | VARCHAR(10) | NOT NULL | Serie para boletas Ej: B001 |
| `serie_factura` | VARCHAR(10) | NOT NULL | Serie para facturas Ej: F001 |
| `modo` | ENUM('demo', 'produccion') | NOT NULL | Ambiente |
| `ruc_emisor` | VARCHAR(11) | NOT NULL | RUC del negocio |
| `razon_social` | VARCHAR(255) | NOT NULL | Razón social del negocio |
| `direccion` | VARCHAR(500) | NOT NULL | Dirección fiscal |
| `numero_boleta_actual` | INT | DEFAULT 1 | Contador boletas |
| `numero_factura_actual` | INT | DEFAULT 1 | Contador facturas |

---

## 🔑 RELACIONES PRINCIPALES

```
proveedores (1) ──→ (N) insumos
                 ──→ (N) compras

insumos (1) ──→ (N) recetas
            ──→ (N) compra_items
            ──→ (N) kardex

productos (1) ──→ (N) recetas
            ──→ (N) venta_items

ventas (1) ──→ (N) venta_items

compras (1) ──→ (N) compra_items

usuarios → Registro de quién hizo cada operación
```

---

## 📝 DIAGRAMA ER (Conceptual)

```
┌──────────────┐         ┌─────────────┐
│  USUARIOS    │         │ PROVEEDORES │
├──────────────┤         ├─────────────┤
│ id (PK)      │         │ id (PK)     │
│ usuario      │         │ nombre      │
│ pin          │         │ ruc         │
│ rol          │         │ telefono    │
│ activo       │         │ email       │
└──────────────┘         └─────────────┘
                               │
                               │ (1:N)
                               ▼
┌──────────────┐         ┌──────────────┐
│   INSUMOS    │◄────┤  │   COMPRAS    │
├──────────────┤    (1:N) ├──────────────┤
│ id (PK)      │         │ id (PK)      │
│ nombre       │         │ fecha        │
│ unidad       │         │ total        │
│ stock        │         │ num_comp     │
│ stock_min    │         │ proveedor_id │
│ costo        │         └──────────────┘
│ prov_id (FK) │              │
└──────────────┘              │
     │                     (1:N)
     │                        ▼
     │              ┌──────────────────┐
     └─────────┼────┤  COMPRA_ITEMS    │
     (1:N)    (1:N) ├──────────────────┤
              / │   │ id (PK)          │
             /  │   │ compra_id (FK)   │
            /   │   │ insumo_id (FK)   │
           /    │   │ cantidad         │
          /     │   │ precio_unitario  │
         /      │   │ subtotal         │
        /       │   └──────────────────┘
       /        │
      /    (1:N)│
     /         │
┌──────────┐   │    ┌──────────────┐
│PRODUCTOS │───┼───→│   RECETAS    │
├──────────┤   │    ├──────────────┤
│ id (PK)  │   │    │ id (PK)      │
│ nombre   │   │    │ producto_id  │
│ cat      │   │    │ insumo_id    │
│ precio   │   │    │ cantidad     │
│ imagen   │   │    └──────────────┘
└──────────┘   │
     │         │
     │    (1:N)│
     │        ▼
     │    ┌──────────────┐
     └───→│  VENTA_ITEMS │
    (1:N) ├──────────────┤
          │ id (PK)      │
          │ venta_id (FK)│
          │ producto_id  │
          │ cantidad     │
          │ precio_unit  │
          │ subtotal     │
          └──────────────┘
                │
                │ Inversa
                ▼
          ┌──────────────┐
          │    VENTAS    │
          ├──────────────┤
          │ id (PK)      │
          │ fecha        │
          │ subtotal     │
          │ descuento    │
          │ total        │
          │ metodo_pago  │
          │ tipo_compro  │
          │ estado       │
          │ cliente_dni  │
          │ cajero       │
          └──────────────┘

┌──────────────────┐
│     KARDEX       │
├──────────────────┤
│ id (PK)          │
│ fecha            │
│ insumo_id (FK)   │──→ INSUMOS
│ tipo_movimiento  │
│ cantidad         │
│ stock_antes      │
│ stock_despues    │
│ costo_total      │
└──────────────────┘

┌──────────────────┐
│ HISTORIAL_RER    │
├──────────────────┤
│ id (PK)          │
│ mes              │
│ anio             │
│ total_ventas     │
│ igv              │
│ ir               │
│ total_sunat      │
│ pagado           │
└──────────────────┘

┌──────────────────┐
│ CONFIG_NUBEFACT  │
├──────────────────┤
│ id = 1 (PK)      │
│ token            │
│ url_api          │
│ serie_boleta     │
│ serie_factura    │
│ ruc_emisor       │
│ razon_social     │
└──────────────────┘
```

---

## 🚀 SCRIPT DE CREACIÓN (SQL)

```sql
CREATE DATABASE entre_panes;
USE entre_panes;

-- Tabla Proveedores
CREATE TABLE proveedores (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(255) NOT NULL UNIQUE,
  ruc VARCHAR(11) NOT NULL UNIQUE,
  telefono VARCHAR(20),
  email VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla Insumos
CREATE TABLE insumos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(255) NOT NULL,
  unidad VARCHAR(50) NOT NULL,
  stock DECIMAL(10,2) NOT NULL,
  stock_min DECIMAL(10,2) NOT NULL,
  costo DECIMAL(10,2) NOT NULL,
  prov_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (prov_id) REFERENCES proveedores(id),
  INDEX idx_prov_id (prov_id)
);

-- Tabla Productos
CREATE TABLE productos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(255) NOT NULL UNIQUE,
  categoria VARCHAR(100) NOT NULL,
  precio DECIMAL(10,2) NOT NULL,
  imagen_url VARCHAR(500),
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_categoria (categoria),
  INDEX idx_activo (activo)
);

-- Tabla Recetas
CREATE TABLE recetas (
  id INT PRIMARY KEY AUTO_INCREMENT,
  producto_id INT NOT NULL,
  insumo_id INT NOT NULL,
  cantidad DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (producto_id) REFERENCES productos(id),
  FOREIGN KEY (insumo_id) REFERENCES insumos(id),
  INDEX idx_producto_id (producto_id),
  INDEX idx_insumo_id (insumo_id)
);

-- Tabla Usuarios
CREATE TABLE usuarios (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(255) NOT NULL,
  usuario VARCHAR(100) NOT NULL UNIQUE,
  pin VARCHAR(4) NOT NULL,
  rol ENUM('admin', 'cajero', 'cocinero') NOT NULL,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla Ventas
CREATE TABLE ventas (
  id INT PRIMARY KEY AUTO_INCREMENT,
  fecha DATETIME NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  descuento DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  metodo_pago ENUM('efectivo', 'tarjeta', 'yape', 'plin') NOT NULL,
  tipo_comprobante ENUM('ticket', 'boleta', 'factura') NOT NULL,
  num_comprobante VARCHAR(50),
  cliente_dni VARCHAR(8),
  cliente_ruc VARCHAR(11),
  cliente_razon_social VARCHAR(255),
  cajero VARCHAR(100) NOT NULL,
  efectivo_dado DECIMAL(10,2),
  vuelto DECIMAL(10,2),
  sunat_estado ENUM('emitido', 'pendiente', 'error', '') DEFAULT 'pendiente',
  pdf_url VARCHAR(500),
  estado ENUM('completada', 'anulada', 'pendiente') DEFAULT 'completada',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_fecha (fecha),
  INDEX idx_cajero (cajero),
  INDEX idx_estado (estado),
  INDEX idx_tipo_comprobante (tipo_comprobante)
);

-- Tabla Venta Items
CREATE TABLE venta_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  venta_id INT NOT NULL,
  producto_id INT NOT NULL,
  cantidad DECIMAL(10,2) NOT NULL,
  precio_unitario DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  nota TEXT,
  FOREIGN KEY (venta_id) REFERENCES ventas(id) ON DELETE CASCADE,
  FOREIGN KEY (producto_id) REFERENCES productos(id),
  INDEX idx_venta_id (venta_id)
);

-- Tabla Compras
CREATE TABLE compras (
  id INT PRIMARY KEY AUTO_INCREMENT,
  fecha DATETIME NOT NULL,
  proveedor_id INT NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  num_comprobante VARCHAR(50) NOT NULL,
  tipo_comprobante ENUM('boleta', 'factura', 'ticket') NOT NULL,
  en_sire BOOLEAN DEFAULT FALSE,
  tipo_proveedor ENUM('electronico', 'fisico') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (proveedor_id) REFERENCES proveedores(id),
  INDEX idx_fecha (fecha),
  INDEX idx_proveedor_id (proveedor_id)
);

-- Tabla Compra Items
CREATE TABLE compra_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  compra_id INT NOT NULL,
  insumo_id INT NOT NULL,
  cantidad DECIMAL(10,2) NOT NULL,
  precio_unitario DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (compra_id) REFERENCES compras(id) ON DELETE CASCADE,
  FOREIGN KEY (insumo_id) REFERENCES insumos(id),
  INDEX idx_compra_id (compra_id)
);

-- Tabla Kardex
CREATE TABLE kardex (
  id INT PRIMARY KEY AUTO_INCREMENT,
  fecha DATETIME NOT NULL,
  insumo_id INT NOT NULL,
  tipo_movimiento ENUM('entrada', 'salida', 'merma', 'ajuste') NOT NULL,
  cantidad DECIMAL(10,2) NOT NULL,
  stock_antes DECIMAL(10,2) NOT NULL,
  stock_despues DECIMAL(10,2) NOT NULL,
  costo_unitario DECIMAL(10,2) NOT NULL,
  costo_total DECIMAL(10,2) NOT NULL,
  motivo VARCHAR(255),
  referencia VARCHAR(50),
  num_comprobante VARCHAR(50),
  tipo_comprobante VARCHAR(50),
  usuario VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (insumo_id) REFERENCES insumos(id),
  INDEX idx_fecha (fecha),
  INDEX idx_insumo_id (insumo_id),
  INDEX idx_tipo (tipo_movimiento)
);

-- Tabla Historial Declaración
CREATE TABLE historial_declaracion (
  id INT PRIMARY KEY AUTO_INCREMENT,
  mes INT NOT NULL,
  anio INT NOT NULL,
  total_ventas DECIMAL(10,2) NOT NULL,
  base_imponible DECIMAL(10,2) NOT NULL,
  igv DECIMAL(10,2) NOT NULL,
  ipm DECIMAL(10,2) NOT NULL,
  ir DECIMAL(10,2) NOT NULL,
  total_sunat DECIMAL(10,2) NOT NULL,
  pagado BOOLEAN DEFAULT FALSE,
  fecha_pago DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE INDEX idx_mes_anio (mes, anio)
);

-- Tabla Config Nubefact
CREATE TABLE config_nubefact (
  id INT PRIMARY KEY DEFAULT 1,
  token VARCHAR(255) NOT NULL,
  url_api VARCHAR(255) NOT NULL,
  serie_boleta VARCHAR(10) NOT NULL,
  serie_factura VARCHAR(10) NOT NULL,
  modo ENUM('demo', 'produccion') NOT NULL,
  ruc_emisor VARCHAR(11) NOT NULL,
  razon_social VARCHAR(255) NOT NULL,
  direccion VARCHAR(500) NOT NULL,
  numero_boleta_actual INT DEFAULT 1,
  numero_factura_actual INT DEFAULT 1
);

-- Datos iniciales
INSERT INTO usuarios (nombre, usuario, pin, rol, activo) VALUES
  ('Administrador', 'admin', '0000', 'admin', TRUE),
  ('Cajero 1', 'cajero1', '1234', 'cajero', TRUE),
  ('Cocinero 1', 'cocinero1', '5678', 'cocinero', TRUE);

INSERT INTO config_nubefact 
  (token, url_api, serie_boleta, serie_factura, modo, ruc_emisor, razon_social, direccion)
VALUES 
  ('YOUR_NUBEFACT_TOKEN', 'https://secure.nubefact.com/api/v2', 'B001', 'F001', 'demo', '12345678901', 'Entre Panes SAC', 'Calle Principal 123, Lima, Peru');
```

---

## 📋 NOTAS DE IMPLEMENTACIÓN

1. **AutoIncrement**: MySQL automáticamente genera IDs
2. **Foreign Keys**: Usa ON DELETE CASCADE donde sea apropiado
3. **Timestamps**: Todos tienen `created_at` y `updated_at`
4. **Índices**: Creados en columnas frecuentemente consultadas
5. **Enums**: Usa tipos ENUM para datos limitados (roles, estados)
6. **Decimals**: Usa DECIMAL(10,2) para dinero (NO float)
7. **Kardex**: Se actualiza automáticamente con cada venta/compra
8. **Stock**: Se calcula en baseado en kardex entries

---

## ✅ CONEXIÓN CON FRONTEND

El frontend Angular enviará/recibirá datos en los siguientes endpoints:

```
GET/POST   /api/proveedores
GET/POST   /api/insumos
GET/POST   /api/productos
GET/POST   /api/usuarios
GET/POST   /api/ventas
GET/POST   /api/venta-items
GET/POST   /api/compras
GET/POST   /api/compra-items
GET        /api/kardex
GET/POST   /api/historial-declaracion
GET/PUT    /api/config-nubefact
POST       /api/upload (subir imágenes)
POST       /api/auth/login (autenticación)
GET        /api/health (health check)
```

Cada endpoint debe respetar los tipos y restricciones definidas en este documento.
