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
  receta: RecetaItem[];
}

export interface VentaItem {
  id: number;
  nombre: string;
  cant: number;
  pu: number;
  sub: number;
  nota?: string;
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
  pdf_url?: string;
  estado: EstadoVenta;
  cajero: string;
  cliente_dni?: string;
  cliente_ruc?: string;
  cliente_razon?: string;
  efectivo_dado?: number;
  vuelto?: number;
  mesa?: string;
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

export interface AppState {
  proveedores: Proveedor[];
  insumos: Insumo[];
  productos: Producto[];
  ventas: Venta[];
  compras: Compra[];
  kardex: KardexEntry[];
  histNRUS: HistorialDeclaracion[];
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
