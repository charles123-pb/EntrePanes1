// ── Entre Panes — Modelos de dominio

export interface Proveedor {
  id: number;
  nombre: string;
  ruc: string;
  telefono: string;
  email: string;
}

export interface Insumo {
  id: number;
  nombre: string;
  unidad: string;
  stock: number;
  stock_min: number;
  costo: number;
  prov_id: number;
}

export interface RecetaItem {
  ins_id: number;
  cant: number;
}

export interface Producto {
  id: number;
  nombre: string;
  cat: string;
  precio: number;
  costo: number;
  receta: RecetaItem[];
  imagenUrl?: string;
}

export interface VentaItem {
  id: number;
  nombre: string;
  cant: number;
  pu: number;
  sub: number;
}

export type TipoComprobante = 'boleta' | 'factura' | 'ticket';
export type MetodoPago     = 'efectivo' | 'tarjeta' | 'yape' | 'plin';
export type EstadoVenta    = 'completada' | 'anulada' | 'pendiente';

export interface Venta {
  id: number;
  fecha: string;
  items: VentaItem[];
  subtotal: number;
  descuento: number;
  total: number;
  metodo: MetodoPago;
  tipo_comp: TipoComprobante;
  comprobante?: string;
  sunat_estado?: 'emitido' | 'pendiente' | 'error' | '';
  estado: EstadoVenta;
  cajero: string;
  cliente_id?: number; // Relación con Cliente
  efectivo_dado?: number;
  vuelto?: number;
}

export interface CompraItem {
  ins_id: number;
  nombre: string;
  cant: number;
  pu: number;
  sub: number;
}

export interface Compra {
  id: number;
  fecha: string;
  prov_id: number;
  total: number;
  comprobante: string;
  tipo_comp: TipoComprobante | 'ticket';
  en_sire: boolean;
  tipo_proveedor: 'electronico' | 'fisico';
  items: CompraItem[];
}

export type TipoMovimiento = 'entrada' | 'salida' | 'merma' | 'ajuste';

export interface KardexEntry {
  id: number;
  fecha: string;
  ins_id: number;
  tipo: TipoMovimiento;
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

export interface HistorialDeclaracion {
  mes: number;
  anio: number;
  ventas: number;
  baseImponible: number;
  igv: number;
  ipm: number;
  ir: number;
  totalSunat: number;
  pagado: boolean;
  fecha_pago: string;
}

export interface NubefactConfig {
  token: string;
  ruta: string;
  serie_boleta: string;
  serie_factura: string;
  modo: 'demo' | 'produccion';
  ruc_emisor: string;
  razon_social: string;
  direccion: string;
}

// ── Tipo de acción para auditoría
export type TipoAccion = 'LOGIN' | 'LOGOUT' | 'VENTA' | 'VENTA_ANULADA' | 'COMPRA' | 'PRECIO_ACTUALIZADO' | 'USUARIO' | 'INVENTARIO' | 'CONFIG';

// ── Clientes Frecuentes
export interface Cliente {
  id: number;
  nombre: string;
  documento?: string;
  tipo_doc?: 'DNI' | 'RUC';
  telefono?: string;
  email?: string;
  direccion?: string;
  total_gastado: number;
  num_compras: number;
  fecha_registro: string;
  ultima_compra: string;
  descuento_pct?: number;
  activo?: boolean;
}

// ── Auditoría y Logs
export interface AuditLog {
  id: number;
  fecha: string;
  usuario: string;
  accion: TipoAccion;
  entidad: string;
  entidad_id: number;
  descripcion?: string;
  archivo_afectado?: string;
  detalles?: string;
  ip?: string;
}

export interface AppState {
  proveedores: Proveedor[];
  insumos: Insumo[];
  productos: Producto[];
  ventas: Venta[];
  compras: Compra[];
  kardex: KardexEntry[];
  histNRUS: HistorialDeclaracion[];
  clientes: Cliente[];
  auditLogs: AuditLog[];
  categorias: string[];
}

export interface RerCalculo {
  baseImponible: number;
  igv: number;
  ipm: number;
  igvTotal: number;
  ir: number;
  totalSunat: number;
  casilla154: number;
  casilla189: number;
  casilla301: number;
  casilla188: number;
  tasaIGV: string;
  tasaIR: string;
  alerta: string | null;
}

export interface NavItem {
  route: string;
  label: string;
  icon: string;
  roles?: string[];
}

export interface ProductoCosto {
  id: number;
  nombre: string;
  precio_venta: number;
  costo_produccion: number;
  margen_bruto: number;
  margen_porcentaje: number;
  ganancia_por_unidad: number;
}
