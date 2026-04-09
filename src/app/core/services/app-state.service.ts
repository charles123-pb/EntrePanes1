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

// ── Estado inicial limpio sin datos de prueba
// Todos los datos se cargarán desde la API cuando useMock: false
const DEFAULT_STATE: AppState = {
  proveedores: [],
  insumos: [],
  productos: [],
  ventas: [],
  compras: [],
  kardex: [],
  histNRUS: [],
  categorias: ['Sánguches', 'Tacos', 'Enchiladas', 'Papas', 'Combos', 'Bebidas'],
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

  updateInsumos(insumos: Insumo[]) {
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
