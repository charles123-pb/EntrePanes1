import { Injectable, signal, computed } from '@angular/core';
import { forkJoin, take } from 'rxjs';
import { ApiService } from './api.service';
import { environment } from '../../../environments/environment';
import {
  AppState, Proveedor, Insumo, Producto, Venta, Compra,
  KardexEntry, HistorialDeclaracion, NubefactConfig,
  RerCalculo, TipoComprobante
} from '../models/models';

const STORAGE_KEY  = 'entrepanes_v5';
const BOLETA_KEY   = 'entrepanes_boleta_counter';
const NUBEFACT_KEY = 'entrepanes_nubefact';

const NUBEFACT_DEFAULT: NubefactConfig = {
  token: '', ruta: '', serie_boleta: 'B001', serie_factura: 'F001',
  modo: 'demo', ruc_emisor: '10473019278',
  razon_social: 'GRE BANESA AYALA SOTO', direccion: 'Ayacucho',
};

// ── Constantes SUNAT 2026 Ley 31556
export const LIMITE_RER  = 525000;
export const IGV_TASA    = 0.08;
export const IPM_TASA    = 0.02;
export const IGV_TOTAL   = IGV_TASA + IPM_TASA;
export const IR_RER_TASA = 0.015;

export const MESES = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Setiembre','Octubre','Noviembre','Diciembre'
];

const PROVEEDORES_0: Proveedor[] = [
  { id:1, nombre:'San Fernando',       ruc:'20100154308', telefono:'01-3150800', email:'ventas@sanfernando.com.pe' },
  { id:2, nombre:'Metro Supermercado', ruc:'20492960268', telefono:'01-6115555', email:'' },
  { id:3, nombre:'Panadería Don José', ruc:'',            telefono:'999888777',  email:'' },
  { id:4, nombre:'Mercado Jesús María',ruc:'',            telefono:'01-4720000', email:'' },
  { id:5, nombre:'Lindley',            ruc:'20100043140', telefono:'01-6190000', email:'lindley@arca.com' },
];

const INSUMOS_0: Insumo[] = [
  { id:1,  nombre:'Pollo pechuga',     unidad:'kg',    stock:10,  stock_min:3,   costo:14.50, prov_id:1 },
  { id:2,  nombre:'Carne molida',      unidad:'kg',    stock:5,   stock_min:2,   costo:18.00, prov_id:2 },
  { id:3,  nombre:'Pan hamburguesa',   unidad:'unid.', stock:100, stock_min:30,  costo:0.60,  prov_id:3 },
  { id:4,  nombre:'Tortilla de trigo', unidad:'unid.', stock:50,  stock_min:15,  costo:0.80,  prov_id:3 },
  { id:5,  nombre:'Tomate',            unidad:'kg',    stock:4,   stock_min:2,   costo:3.00,  prov_id:4 },
  { id:6,  nombre:'Lechuga',           unidad:'kg',    stock:2,   stock_min:1,   costo:2.50,  prov_id:4 },
  { id:7,  nombre:'Papa amarilla',     unidad:'kg',    stock:15,  stock_min:5,   costo:2.50,  prov_id:4 },
  { id:8,  nombre:'Mayonesa',          unidad:'kg',    stock:3,   stock_min:1,   costo:9.00,  prov_id:2 },
  { id:9,  nombre:'Ketchup',           unidad:'kg',    stock:3,   stock_min:1,   costo:7.50,  prov_id:2 },
  { id:10, nombre:'Crema de ají',      unidad:'kg',    stock:1.5, stock_min:0.5, costo:15.00, prov_id:2 },
  { id:11, nombre:'Queso fundido',     unidad:'kg',    stock:3,   stock_min:1,   costo:22.00, prov_id:2 },
  { id:12, nombre:'Inca Kola 500ml',   unidad:'unid.', stock:48,  stock_min:12,  costo:2.50,  prov_id:5 },
  { id:13, nombre:'Coca Cola 500ml',   unidad:'unid.', stock:36,  stock_min:12,  costo:2.50,  prov_id:5 },
  { id:14, nombre:'Cebolla roja',      unidad:'kg',    stock:0.3, stock_min:1,   costo:2.00,  prov_id:4 },
  { id:15, nombre:'Aceite vegetal',    unidad:'L',     stock:5,   stock_min:2,   costo:6.50,  prov_id:2 },
];

const PRODUCTOS_0: Producto[] = [
  { id:1, nombre:'Sánguche de Pollo', cat:'Sánguches', precio:27, receta:[{ins_id:1,cant:0.150},{ins_id:3,cant:1},{ins_id:6,cant:0.030},{ins_id:5,cant:0.050},{ins_id:8,cant:0.030}] },
  { id:2, nombre:'Sánguche de Carne', cat:'Sánguches', precio:32, receta:[{ins_id:2,cant:0.180},{ins_id:3,cant:1},{ins_id:6,cant:0.030},{ins_id:5,cant:0.050},{ins_id:9,cant:0.030}] },
  { id:3, nombre:'Sánguche Mixto',    cat:'Sánguches', precio:35, receta:[{ins_id:1,cant:0.100},{ins_id:2,cant:0.100},{ins_id:3,cant:1},{ins_id:11,cant:0.030}] },
  { id:4, nombre:'Taco de Pollo',     cat:'Tacos',     precio:28, receta:[{ins_id:1,cant:0.120},{ins_id:4,cant:2},{ins_id:14,cant:0.030},{ins_id:10,cant:0.020}] },
  { id:5, nombre:'Taco de Carne',     cat:'Tacos',     precio:30, receta:[{ins_id:2,cant:0.150},{ins_id:4,cant:2},{ins_id:14,cant:0.030},{ins_id:10,cant:0.020}] },
  { id:6, nombre:'Combo Sánguche+Papa', cat:'Combos',  precio:38, receta:[{ins_id:1,cant:0.150},{ins_id:3,cant:1},{ins_id:7,cant:0.200}] },
  { id:7, nombre:'Papas Fritas',      cat:'Papas',     precio:15, receta:[{ins_id:7,cant:0.250}] },
  { id:8, nombre:'Inca Kola',         cat:'Bebidas',   precio:5,  receta:[{ins_id:12,cant:1}] },
  { id:9, nombre:'Coca Cola',         cat:'Bebidas',   precio:5,  receta:[{ins_id:13,cant:1}] },
];

const VENTAS_0: Venta[] = [
  { id:1, fecha:'2025-03-05 12:30', items:[{id:1,nombre:'Sánguche de Pollo',cant:2,pu:27,sub:54},{id:2,nombre:'Inca Kola',cant:2,pu:5,sub:10}], subtotal:64, descuento:0, total:64, metodo:'efectivo', tipo_comp:'boleta', comprobante:'B001-00000001', sunat_estado:'emitido', estado:'completada', cajero:'cajero1' },
  { id:2, fecha:'2025-03-05 13:15', items:[{id:1,nombre:'Combo Sánguche+Papa',cant:1,pu:38,sub:38}], subtotal:38, descuento:0, total:38, metodo:'yape', tipo_comp:'ticket', estado:'completada', cajero:'cajero1' },
];

const COMPRAS_0: Compra[] = [
  { id:1, fecha:'2025-03-04', prov_id:1, total:145, comprobante:'F001-00000234', tipo_comp:'factura', en_sire:true,  tipo_proveedor:'electronico', items:[{ins_id:1,nombre:'Pollo pechuga',cant:10,pu:14.50,sub:145}] },
  { id:2, fecha:'2025-03-03', prov_id:3, total:72,  comprobante:'0023',          tipo_comp:'ticket',  en_sire:false, tipo_proveedor:'fisico',       items:[{ins_id:3,nombre:'Pan hamburguesa',cant:80,pu:0.60,sub:48},{ins_id:4,nombre:'Tortilla trigo',cant:30,pu:0.80,sub:24}] },
];

const KARDEX_0: KardexEntry[] = [
  { id:1, fecha:'2025-03-01 08:00', ins_id:1,  tipo:'entrada', cant:10,   stock_antes:0,    stock_despues:10,   costo_u:14.50, costo_total:145.00, motivo:'Stock inicial', ref:'Compra #1', num_comp:'F001-00000234', tipo_comp:'factura' },
  { id:2, fecha:'2025-03-05 09:15', ins_id:1,  tipo:'salida',  cant:0.15, stock_antes:10,   stock_despues:9.85, costo_u:14.50, costo_total:2.175,  motivo:'Venta #1',      ref:'Venta #1',  num_comp:'B001-00000001', tipo_comp:'boleta' },
];

const HIST_0: HistorialDeclaracion[] = [
  { mes:1, anio:2025, ventas:8500,  baseImponible:7727.27, igv:618.18, ipm:154.55, ir:115.91, totalSunat:888.64, pagado:true, fecha_pago:'2025-02-15' },
  { mes:2, anio:2025, ventas:9200,  baseImponible:8363.64, igv:669.09, ipm:167.27, ir:125.45, totalSunat:961.81, pagado:true, fecha_pago:'2025-03-14' },
];

const DEFAULT_STATE: AppState = {
  proveedores: PROVEEDORES_0, insumos: INSUMOS_0, productos: PRODUCTOS_0,
  ventas: VENTAS_0, compras: COMPRAS_0, kardex: KARDEX_0,
  histNRUS: HIST_0, categorias: ['Sánguches','Tacos','Enchiladas','Papas','Combos','Bebidas'],
};

@Injectable({ providedIn: 'root' })
export class AppStateService {
  // ── Señales de estado
  private _state = signal<AppState>(this._loadState());
  readonly state  = this._state.asReadonly();

  constructor(private api: ApiService) {
    // If configured to load from API, attempt to fetch and replace defaults.
    if (!environment.useMock) {
      this.loadFromApi();
    }
  }

  // ── Computed signals
  readonly proveedores = computed(() => this._state().proveedores);
  readonly insumos     = computed(() => this._state().insumos);
  readonly productos   = computed(() => this._state().productos);
  readonly ventas      = computed(() => this._state().ventas);
  readonly compras     = computed(() => this._state().compras);
  readonly kardex      = computed(() => this._state().kardex);
  readonly histNRUS    = computed(() => this._state().histNRUS);
  readonly categorias  = computed(() => this._state().categorias);

  readonly nubefactConfig = signal<NubefactConfig>(this._loadNubefact());

  // ── KPIs del dashboard
  readonly ventasHoy = computed(() => {
    const today = new Date().toISOString().split('T')[0];
    return this.ventas()
      .filter(v => v.fecha.startsWith(today) && v.estado === 'completada')
      .reduce((s, v) => s + v.total, 0);
  });

  readonly stockAlerts = computed(() =>
    this.insumos().filter(i => i.stock < i.stock_min).length
  );

  // ── Helpers
  round2 = (n: number) => Math.round(n * 100) / 100;
  nextId = (arr: {id:number}[]) => arr.length ? Math.max(...arr.map(x => x.id)) + 1 : 1;
  todayStr = () => new Date().toISOString().split('T')[0];
  nowStr   = () => new Date().toLocaleString('es-PE', { hour12: false }).replace(',', '');

  // ── RER Calculator
  calcularRER(total: number, totalAnual?: number): RerCalculo {
    const baseImponible = this.round2(total / (1 + IGV_TOTAL));
    const igv           = this.round2(baseImponible * IGV_TASA);
    const ipm           = this.round2(baseImponible * IPM_TASA);
    const igvTotal      = this.round2(igv + ipm);
    const ir            = this.round2(baseImponible * IR_RER_TASA);
    const totalSunat    = this.round2(igvTotal + ir);
    const acumulado     = totalAnual ?? total;
    const pctRER        = this.round2((acumulado / LIMITE_RER) * 100);

    const alerta = acumulado > LIMITE_RER * 0.90
      ? `⚠ Superaste el 90% del límite anual RER (S/ ${LIMITE_RER.toLocaleString()}). Consulta a tu contador.`
      : acumulado > LIMITE_RER * 0.70
      ? `Llevas el ${pctRER}% del límite anual RER. Monitorea tus ventas.`
      : null;

    return {
      baseImponible, igv, ipm, igvTotal, ir, totalSunat,
      casilla154: baseImponible, casilla189: igvTotal,
      casilla301: ir, casilla188: totalSunat,
      tasaIGV: '10% (8% IGV + 2% IPM) — Ley 31556',
      tasaIR:  '1.5% sobre base imponible — RER',
      alerta,
    };
  }

  // ── Estado de stock
  estadoStock(stock: number, min: number) {
    if (stock <= 0)        return { label: 'SIN STOCK', color: 'warn',    tailwind: 'bg-red-700 text-white' };
    if (stock <= min * 0.5)return { label: 'CRÍTICO',   color: 'warn',    tailwind: 'bg-red-500 text-white' };
    if (stock < min)       return { label: 'BAJO',      color: 'accent',  tailwind: 'bg-amber-500 text-stone-900' };
    return                        { label: 'OK',        color: 'primary', tailwind: 'bg-emerald-600 text-white' };
  }

  // ── Mutations
  update(partial: Partial<AppState>) {
    this._state.update(s => ({ ...s, ...partial }));
    this._saveState();
  }

  addVenta(venta: Venta) {
    this._state.update(s => ({ ...s, ventas: [...s.ventas, venta] }));
    this._saveState();
  }

  updateVenta(venta: Venta) {
    this._state.update(s => ({
      ...s, ventas: s.ventas.map(v => v.id === venta.id ? venta : v)
    }));
    this._saveState();
  }

  addCompra(compra: Compra) {
    this._state.update(s => ({ ...s, compras: [...s.compras, compra] }));
    this._saveState();
  }

  updateInsumos(insumos: typeof INSUMOS_0) {
    this._state.update(s => ({ ...s, insumos }));
    this._saveState();
  }

  addKardex(entry: KardexEntry) {
    this._state.update(s => ({ ...s, kardex: [...s.kardex, entry] }));
    this._saveState();
  }

  saveNubefact(cfg: NubefactConfig) {
    this.nubefactConfig.set(cfg);
    try { localStorage.setItem(NUBEFACT_KEY, JSON.stringify(cfg)); } catch {}
  }

  resetToDefault() {
    this._state.set({ ...DEFAULT_STATE });
    this._saveState();
  }

  // ── Boleta counter
  peekNumComp(serie: string): string {
    const counters = this._loadBoletaCounter();
    const n = (counters[serie] ?? 0) + 1;
    return `${serie}-${String(n).padStart(8, '0')}`;
  }

  nextNumComp(serie: string): string {
    const counters = this._loadBoletaCounter();
    const next = (counters[serie] ?? 0) + 1;
    counters[serie] = next;
    this._saveBoletaCounter(counters);
    return `${serie}-${String(next).padStart(8, '0')}`;
  }

  // ── Nombre de proveedor
  provNombre(id: number): string {
    return this.proveedores().find(p => p.id === id)?.nombre ?? '—';
  }

  // ── Load from API (if available)
  loadFromApi() {
    forkJoin({
      proveedores: this.api.proveedores().pipe(take(1)),
      insumos:     this.api.insumos().pipe(take(1)),
      productos:   this.api.productos().pipe(take(1)),
      ventas:      this.api.ventas().pipe(take(1)),
      compras:     this.api.compras().pipe(take(1)),
      kardex:      this.api.kardex().pipe(take(1)),
    }).subscribe({
      next: (res) => {
        this._state.update(s => ({
          ...s,
          proveedores: res.proveedores ?? s.proveedores,
          insumos:     res.insumos ?? s.insumos,
          productos:   res.productos ?? s.productos,
          ventas:      res.ventas ?? s.ventas,
          compras:     res.compras ?? s.compras,
          kardex:      res.kardex ?? s.kardex,
        }));
        this._saveState();
      },
      error: () => {
        // keep local defaults on error
      }
    });
  }

  // ── Private
  private _loadState(): AppState {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...DEFAULT_STATE };
      return { ...DEFAULT_STATE, ...JSON.parse(raw) };
    } catch { return { ...DEFAULT_STATE }; }
  }

  private _saveState() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(this._state())); } catch {}
  }

  private _loadNubefact(): NubefactConfig {
    try {
      return { ...NUBEFACT_DEFAULT, ...JSON.parse(localStorage.getItem(NUBEFACT_KEY) ?? '{}') };
    } catch { return { ...NUBEFACT_DEFAULT }; }
  }

  private _loadBoletaCounter(): Record<string, number> {
    try { return JSON.parse(localStorage.getItem(BOLETA_KEY) ?? '{}'); } catch { return {}; }
  }

  private _saveBoletaCounter(c: Record<string, number>) {
    try { localStorage.setItem(BOLETA_KEY, JSON.stringify(c)); } catch {}
  }
}
