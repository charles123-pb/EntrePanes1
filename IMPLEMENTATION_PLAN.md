# Entre Panes — Implementation Plan (5 Priority Features)
**Date**: April 10, 2026 | **Target**: Next 4-6 weeks  
**Focus**: Data Management + Advanced Analytics + Audit Trail

---

## 📋 Features a Implementar

```
1. 💾 BACKUP/RESTAURACIÓN          [2-3 horas]
2. 📤 IMPORT/EXPORT DATOS           [2-3 horas]
3. 📝 AUDIT COMPLETO                [4-5 horas]
4. 📈 ANALYTICS AVANZADO            [8-10 horas]
5. 📊 REPORTES AVANZADO             [6-8 horas]
────────────────────────────────────────────────
   TOTAL ESTIMADO:                  [22-29 horas]
   TIEMPO DESARROLLO:               ~1 semana (40 hrs/semana)
```

---

## FASE 1: BACKUP & RESTAURACIÓN (2-3 horas)

### Descripción
Sistema automático + manual de backup/restore de datos

### Arquitectura

```typescript
// NEW SERVICE: backup.service.ts
@Injectable({ providedIn: 'root' })
export class BackupService {
  private store = inject(AppStateService);

  // Auto-backup cada 6 horas
  setupAutoBackup() {
    setInterval(() => this.createBackup(), 6 * 60 * 60 * 1000);
  }

  // Crear backup JSON
  createBackup(): BackupFile {
    return {
      timestamp: this.store.nowStr(),
      version: 'v1',
      data: this.store.state(),
      hash: this.calculateHash(this.store.state())
    };
  }

  // Descargar backup como archivo
  downloadBackup() {
    const backup = this.createBackup();
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `entre-panes-backup-${backup.timestamp}.json`;
    link.click();
  }

  // Restaurar desde backup
  restoreBackup(file: File) {
    const reader = new FileReader();
    reader.onload = (event) => {
      const backup = JSON.parse(event.target?.result as string);
      
      // Validar integridad
      if (this.validateBackup(backup)) {
        this.store.update(backup.data);
        // Guardar en localStorage
      } else {
        throw new Error('Backup corrupted or invalid');
      }
    };
    reader.readAsText(file);
  }
}
```

### UI Component (`admin.component.ts` - nueva sección)

```html
<!-- BACKUP MANAGEMENT SECTION -->
<div class="ep-card p-6 space-y-4">
  <h3 class="ep-section-title">💾 BACKUPS Y RESTAURACIÓN</h3>
  
  <div class="space-y-3">
    <!-- Auto-backups list -->
    <div class="text-xs text-stone-500">Últimos backups automáticos:</div>
    @for (b of autoBackups(); track b.id) {
      <div class="flex items-center justify-between p-2 bg-stone-800/40 rounded">
        <div class="text-stone-300">{{ b.timestamp | date:'short' }}</div>
        <div class="flex gap-2">
          <button mat-icon-button class="!w-7 !h-7 text-stone-500 hover:text-amber-400" 
                  (click)="restore(b)" matTooltip="Restaurar">
            <mat-icon class="!text-sm">restore</mat-icon>
          </button>
        </div>
      </div>
    }
    
    <mat-divider class="my-3"></mat-divider>
    
    <!-- Manual backup -->
    <div class="flex gap-2">
      <button mat-flat-button color="primary" (click)="manualBackup()">
        <mat-icon>download</mat-icon> Descargar Backup Ahora
      </button>
      <button mat-stroked-button (click)="openRestoreDialog()">
        <mat-icon>upload</mat-icon> Restaurar desde Archivo
      </button>
    </div>
  </div>
</div>
```

---

## FASE 2: IMPORT/EXPORT DATOS (2-3 horas)

### Descripción
Exportar/importar datos en formatos CSV, JSON para análisis externo

### Componentes Necesarios

```typescript
// export.service.ts
exportAsJSON(entityType: 'productos' | 'ventas' | 'compras' | 'clientes') {
  const data = this.store[entityType]();
  const json = JSON.stringify(data, null, 2);
  this.downloadFile(json, `${entityType}.json`, 'application/json');
}

exportAsCSV(entityType: string) {
  const data = this.store[entityType]();
  const csv = this.convertToCSV(data);
  this.downloadFile(csv, `${entityType}.csv`, 'text/csv');
}

exportAllData() {
  // Generar ZIP con todos los datos
  const zip = new JSZip();
  zip.file('productos.json', JSON.stringify(this.store.productos()));
  zip.file('ventas.json', JSON.stringify(this.store.ventas()));
  zip.file('compras.json', JSON.stringify(this.store.compras()));
  zip.file('clientes.json', JSON.stringify(this.store.clientes()));
  
  zip.generateAsync({ type: 'blob' })
    .then(blob => this.downloadFile(blob, 'entre-panes-export.zip'));
}

private convertToCSV(data: any[]): string {
  if (!data.length) return '';
  
  const headers = Object.keys(data[0]);
  const rows = data.map(row => headers.map(h => row[h]).join(','));
  return [headers.join(','), ...rows].join('\n');
}
```

### UI (Admin Panel Export Tab)

```html
<mat-tab label="📤 Exportar Datos">
  <div class="p-6 space-y-4">
    <h3 class="ep-section-title">Exportar datos para análisis</h3>
    
    <div class="grid grid-cols-2 gap-3">
      @for (entity of ['productos', 'ventas', 'compras', 'clientes']; track entity) {
        <div class="flex gap-2">
          <button mat-stroked-button (click)="exportJSON(entity)">
            <mat-icon>file_download</mat-icon> {{ entity }}.json
          </button>
          <button mat-stroked-button (click)="exportCSV(entity)">
            <mat-icon>table_chart</mat-icon> {{ entity }}.csv
          </button>
        </div>
      }
    </div>
    
    <mat-divider class="my-4"></mat-divider>
    
    <button mat-flat-button color="primary" (click)="exportAll()">
      <mat-icon>cloud_download</mat-icon> Descargar TODO (ZIP)
    </button>
    
    <mat-tab label="📥 Importar Datos">
      <div class="p-6">
        <input type="file" #fileInput accept=".json,.csv,.zip" 
               (change)="importFile($event)" style="display:none" />
        <button mat-stroked-button (click)="fileInput.click()">
          <mat-icon>upload</mat-icon> Seleccionar archivo
        </button>
      </div>
    </mat-tab>
  </div>
</mat-tab>
```

---

## FASE 3: AUDIT COMPLETO (4-5 horas)

### Descripción
Registrar TODAS las mutaciones de datos con inmutabilidad

### Datos a Trackear

```typescript
export interface AuditEntry {
  id: number;
  timestamp: string;           // 2026-04-10 14:30:45
  usuario: string;             // 'cajero-juan'
  accion: TipoAccion;          // VENTA, COMPRA, PRODUCTO_ACTUALIZADO, etc.
  entidad: string;             // 'Venta', 'Producto', etc.
  entidad_id: number;
  cambios: {
    antes?: Record<string, any>;  // Estado anterior
    despues: Record<string, any>; // Nuevo estado
  };
  detalles?: string;           // "Cambió margen de 30% a 35%"
  ip?: string;                 // Para seguridad
  dispositivo?: string;        // PC, Mobile
}

export enum TipoAccion {
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  VENTA_CREADA = 'VENTA_CREADA',
  VENTA_ANULADA = 'VENTA_ANULADA',
  COMPRA_CREADA = 'COMPRA_CREADA',
  PRODUCTO_CREADO = 'PRODUCTO_CREADO',
  PRODUCTO_ACTUALIZADO = 'PRODUCTO_ACTUALIZADO',
  PRODUCTO_ELIMINADO = 'PRODUCTO_ELIMINADO',
  PRECIO_CAMBIO = 'PRECIO_CAMBIO',
  STOCK_AJUSTE = 'STOCK_AJUSTE',
  USUARIO_CREADO = 'USUARIO_CREADO',
  USUARIO_ELIMINADO = 'USUARIO_ELIMINADO',
  CONFIG_CAMBIO = 'CONFIG_CAMBIO',
}
```

### Service Implementation

```typescript
@Injectable({ providedIn: 'root' })
export class AuditService {
  private entries = signal<AuditEntry[]>([]);
  
  constructor(private store: AppStateService, private auth: AuthService) {}

  // Registrar cambio
  logChange(
    accion: TipoAccion,
    entidad: string,
    entidad_id: number,
    antes?: any,
    despues?: any,
    detalles?: string
  ) {
    const entry: AuditEntry = {
      id: this.entries().length + 1,
      timestamp: this.store.nowStr(),
      usuario: this.auth.currentUser()?.nombre || 'system',
      accion,
      entidad,
      entidad_id,
      cambios: { antes, despues },
      detalles
    };
    
    this.entries.update(arr => [...arr, entry]);
    this.persist(entry);
  }

  // Búsqueda avanzada
  search(filtros: {
    usuario?: string;
    accion?: TipoAccion;
    entidad?: string;
    fechaDesde?: string;
    fechaHasta?: string;
  }): AuditEntry[] {
    let results = this.entries();
    
    if (filtros.usuario) 
      results = results.filter(e => e.usuario === filtros.usuario);
    if (filtros.accion) 
      results = results.filter(e => e.accion === filtros.accion);
    if (filtros.entidad) 
      results = results.filter(e => e.entidad === filtros.entidad);
    if (filtros.fechaDesde)
      results = results.filter(e => e.timestamp >= filtros.fechaDesde!);
    if (filtros.fechaHasta)
      results = results.filter(e => e.timestamp <= filtros.fechaHasta!);
    
    return results;
  }

  // Revertir a versión anterior
  revert(entryId: number) {
    const entry = this.entries().find(e => e.id === entryId);
    if (!entry?.cambios.antes) throw new Error('No previous state available');
    
    // Restaurar estado anterior
    const entity = entry.cambios.antes;
    this.store.update({ [entry.entidad]: entity });
    
    // Log de reverso
    this.logChange(
      'REVERTIDO' as any,
      entry.entidad,
      entry.entidad_id,
      entry.cambios.despues,
      entity,
      `Revertido a: ${entry.timestamp}`
    );
  }

  private persist(entry: AuditEntry) {
    const all = JSON.parse(localStorage.getItem('audit_log') ?? '[]');
    all.push(entry);
    localStorage.setItem('audit_log', JSON.stringify(all));
  }
}
```

### Hook: Auto-log en cambios críticos

```typescript
// Integrar en AppStateService.update()
export class AppStateService {
  update(changes: Partial<AppState>) {
    const before = this._state();
    
    this._state.update(state => ({...state, ...changes}));
    
    // Log cada cambio
    Object.entries(changes).forEach(([key, newValue]) => {
      const oldValue = before[key as keyof AppState];
      this.audit.logChange(
        'STATE_CHANGE',
        key,
        0,
        oldValue,
        newValue,
        `${key} modified`
      );
    });
  }
}
```

### Audit Viewer Component

```html
<!-- admin.component: Audit Tab -->
<mat-tab label="🔍 HISTORIAL CAMBIOS">
  <div class="p-6 space-y-4">
    <!-- Filters -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <mat-form-field appearance="outline" class="w-full">
        <mat-label>Usuario</mat-label>
        <mat-select [(ngModel)]="auditFilters.usuario">
          @for (u of uniqueUsers(); track u) {
            <mat-option [value]="u">{{ u }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
      
      <mat-form-field appearance="outline">
        <mat-label>Acción</mat-label>
        <mat-select [(ngModel)]="auditFilters.accion">
          @for (a of TipoAccion values; track a) {
            <mat-option [value]="a">{{ a }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
      
      <mat-form-field appearance="outline">
        <mat-label>Desde</mat-label>
        <input matInput type="date" [(ngModel)]="auditFilters.fechaDesde" />
      </mat-form-field>
      
      <mat-form-field appearance="outline">
        <mat-label>Hasta</mat-label>
        <input matInput type="date" [(ngModel)]="auditFilters.fechaHasta" />
      </mat-form-field>
    </div>
    
    <!-- Results table -->
    <table class="w-full text-xs">
      <thead>
        <tr class="bg-stone-800/60">
          <th class="px-3 py-2 text-left">Fecha</th>
          <th class="px-3 py-2 text-left">Usuario</th>
          <th class="px-3 py-2 text-left">Acción</th>
          <th class="px-3 py-2 text-left">Entidad</th>
          <th class="px-3 py-2 text-left">Antes</th>
          <th class="px-3 py-2 text-left">Después</th>
          <th class="px-3 py-2 text-center">Acciones</th>
        </tr>
      </thead>
      <tbody>
        @for (entry of filteredAudit(); track entry.id) {
          <tr class="border-b border-stone-800/40 hover:bg-stone-800/20">
            <td class="px-3 py-2 text-stone-400">{{ entry.timestamp }}</td>
            <td class="px-3 py-2">{{ entry.usuario }}</td>
            <td class="px-3 py-2 text-amber-300">{{ entry.accion }}</td>
            <td class="px-3 py-2">{{ entry.entidad }}</td>
            <td class="px-3 py-2 text-xs">
              <code class="text-red-300">{{ entry.cambios.antes | json }}</code>
            </td>
            <td class="px-3 py-2 text-xs">
              <code class="text-green-300">{{ entry.cambios.despues | json }}</code>
            </td>
            <td class="px-3 py-2 flex gap-1 justify-center">
              @if (entry.cambios.antes) {
                <button mat-icon-button class="!w-6 !h-6 text-stone-500 hover:text-blue-400"
                        (click)="revertChange(entry)" matTooltip="Revertir">
                  <mat-icon class="!text-sm">restore</mat-icon>
                </button>
              }
            </td>
          </tr>
        }
      </tbody>
    </table>
  </div>
</mat-tab>
```

---

## FASE 4: ANALYTICS AVANZADO (8-10 horas)

### Descriptores de Datos

```typescript
export interface AnalyticsMetric {
  id: string;
  nombre: string;
  valor: number;
  unidad: string;
  trend: 'up' | 'down' | 'stable';
  trendPercent: number;
  periodo: 'hoy' | 'semana' | 'mes' | 'año';
  color: string;
}

export interface SalesAnalytics {
  totalVentas: AnalyticsMetric;
  ventasPorProducto: { nombre: string; total: number; percent: number }[];
  ventasPorMetodo: { metodo: MetodoPago; total: number; percent: number }[];
  ventasPorHora: { hora: number; ventas: number }[];
  clientesFrecuentes: { nombre: string; compras: number; gasto: number }[];
  margenPromedio: AnalyticsMetric;
}

export interface FinancialAnalytics {
  costoTotal: AnalyticsMetric;
  gananciaTotal: AnalyticsMetric;
  margenNeto: AnalyticsMetric;
  margenBruto: AnalyticsMetric;
  topProductosPorMargen: { nombre: string; margen: number }[];
  productoCritico: { nombre: string; margen: number }[];
}

export interface InventoryAnalytics {
  produtosConStockBajo: Producto[];
  rotacionPromedio: AnalyticsMetric;
  valorInventario: AnalyticsMetric;
}
```

### Service

```typescript
@Injectable({ providedIn: 'root' })
export class AdvancedAnalyticsService {
  constructor(
    private store: AppStateService,
    private analisis: AnalisisService
  ) {}

  getSalesAnalytics(periodo: 'hoy' | 'semana' | 'mes' | 'año'): SalesAnalytics {
    const ventas = this.filterByPeriodo(this.store.ventas(), periodo);
    
    return {
      totalVentas: {
        id: 'total_ventas',
        nombre: 'Total Ventas',
        valor: ventas.reduce((s, v) => s + v.total, 0),
        unidad: 'S/',
        trend: this.calculateTrend(ventas),
        trendPercent: this.calculateTrendPercent(ventas, periodo),
        periodo,
        color: '#fbbf24'
      },
      
      ventasPorProducto: this.getTopProductsByRevenue(ventas, 10),
      ventasPorMetodo: this.getSalesDistributionByMethod(ventas),
      ventasPorHora: this.getSalesPerHour(ventas),
      clientesFrecuentes: this.getTopCustomers(ventas, 5),
      margenPromedio: {
        id: 'margen_promedio',
        nombre: 'Margen Promedio',
        valor: this.calculateAverageMargin(ventas),
        unidad: '%',
        trend: 'stable',
        trendPercent: 0,
        periodo,
        color: '#86efac'
      }
    };
  }

  getFinancialAnalytics(periodo: string): FinancialAnalytics {
    const ventas = this.filterByPeriodo(this.store.ventas(), periodo as any);
    const costos = this.calculateTotalCosts(ventas);
    const ganancias = ventas.reduce((s, v) => s + v.total, 0) - costos;

    return {
      costoTotal: { /* ... */ },
      gananciaTotal: { /* ... */ },
      margenNeto: { /* ... */ },
      margenBruto: { /* ... */ },
      topProductosPorMargen: this.analisis.productosRentables(),
      productoCritico: this.analisis.productosCriticos()
    };
  }

  private calculateTrend(ventas: Venta[]): 'up' | 'down' | 'stable' {
    // Comparar con período anterior
    if (ventas.length === 0) return 'stable';
    
    const mitad = Math.floor(ventas.length / 2);
    const primeraHalf = ventas.slice(0, mitad).reduce((s, v) => s + v.total, 0);
    const segundaHalf = ventas.slice(mitad).reduce((s, v) => s + v.total, 0);
    
    if (segundaHalf > primeraHalf * 1.1) return 'up';
    if (segundaHalf < primeraHalf * 0.9) return 'down';
    return 'stable';
  }

  private getTopProductsByRevenue(ventas: Venta[], limit: number) {
    const products = new Map<number, { nombre: string; total: number }>();
    
    ventas.forEach(sale => {
      sale.items.forEach(item => {
        const prod = this.store.productos().find(p => p.id === item.id);
        if (prod) {
          const existing = products.get(item.id) || { nombre: prod.nombre, total: 0 };
          existing.total += item.sub;
          products.set(item.id, existing);
        }
      });
    });
    
    const total = Array.from(products.values()).reduce((s, p) => s + p.total, 0);
    return Array.from(products.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, limit)
      .map(p => ({ ...p, percent: (p.total / total) * 100 }));
  }
}
```

### Dashboard Component (New Advanced Analytics Tab)

```html
<mat-tab label="📈 ANALYTICS AVANZADO">
  <div class="p-6 space-y-6">
    
    <div class="flex gap-3 mb-4">
      @for (per of ['hoy', 'semana', 'mes', 'año']; track per) {
        <button mat-stroked-button 
                [class.!border-amber-500]="analyticsPeriodo() === per"
                (click)="analyticsPeriodo.set(per)">
          {{ per | titlecase }}
        </button>
      }
    </div>
    
    <!-- Sales Analytics Grid -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div class="ep-card p-4 bg-stone-800/40">
        <div class="text-stone-500 text-xs font-black mb-2">TOTAL VENTAS</div>
        <div class="text-amber-400 font-display text-2xl">
          S/ {{ salesAnalytics().totalVentas.valor | number:'1.2-2' }}
        </div>
        <div class="text-xs mt-1" 
             [ngClass]="salesAnalytics().totalVentas.trend === 'up' ? 'text-green-400' : 'text-red-400'">
          {{ salesAnalytics().totalVentas.trendPercent | number:'1.0-0' }}%
          {{ salesAnalytics().totalVentas.trend }}
        </div>
      </div>
      
      <div class="ep-card p-4 bg-stone-800/40">
        <div class="text-stone-500 text-xs font-black mb-2">MARGEN PROMEDIO</div>
        <div class="text-green-400 font-display text-2xl">
          {{ salesAnalytics().margenPromedio.valor | number:'1.0-0' }}%
        </div>
      </div>
      
      <div class="ep-card p-4 bg-stone-800/40">
        <div class="text-stone-500 text-xs font-black mb-2">COSTO TOTAL</div>
        <div class="text-blue-400 font-display text-2xl">
          S/ {{ financialAnalytics().costoTotal.valor | number:'1.2-2' }}
        </div>
      </div>
      
      <div class="ep-card p-4 bg-stone-800/40">
        <div class="text-stone-500 text-xs font-black mb-2">GANANCIA</div>
        <div class="text-emerald-400 font-display text-2xl">
          S/ {{ financialAnalytics().gananciaTotal.valor | number:'1.2-2' }}
        </div>
      </div>
    </div>
    
    <!-- Charts Row 1 -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <!-- Ventas por método de pago -->
      <div class="ep-card p-4">
        <h3 class="text-stone-300 font-black mb-4 text-sm">Ventas por Método</h3>
        <canvas baseChart [data]="chartMetodoPago" [options]="chartOptions"></canvas>
      </div>
      
      <!-- Ventas por hora -->
      <div class="ep-card p-4">
        <h3 class="text-stone-300 font-black mb-4 text-sm">Ventas por Hora</h3>
        <canvas baseChart [data]="chartVentasHora" [options]="chartOptions"></canvas>
      </div>
    </div>
    
    <!-- Charts Row 2 -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <!-- Top productos -->
      <div class="ep-card p-4">
        <h3 class="text-stone-300 font-black mb-4 text-sm">Top 5 Productos por Revenue</h3>
        <table class="w-full text-xs">
          <tbody>
            @for (prod of salesAnalytics().ventasPorProducto.slice(0, 5); track prod.nombre) {
              <tr class="border-b border-stone-800/40">
                <td class="py-2 text-stone-300">{{ prod.nombre }}</td>
                <td class="py-2 text-right">
                  <span class="text-amber-400 font-black">{{ prod.percent | number:'1.0-0' }}%</span>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
      
      <!-- Clientes frecuentes -->
      <div class="ep-card p-4">
        <h3 class="text-stone-300 font-black mb-4 text-sm">Clientes Frecuentes</h3>
        <table class="w-full text-xs">
          <tbody>
            @for (cli of salesAnalytics().clientesFrecuentes; track cli.nombre) {
              <tr class="border-b border-stone-800/40">
                <td class="py-2 text-stone-300">{{ cli.nombre }}</td>
                <td class="py-2 text-right text-stone-400">{{ cli.compras }} compras</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
    
  </div>
</mat-tab>
```

---

## FASE 5: REPORTES AVANZADOS (6-8 horas)

### Tipos de Reportes a Generar

```typescript
export interface ReportTheme {
  id: string;
  nombre: string;
  description: string;
  generador: () => ReportData;
}

export const REPORTS: ReportTheme[] = [
  {
    id: 'daily-sales',
    nombre: 'Reporte de Ventas Diarias',
    description: 'Resumen completo de ventas con desglose por método',
    generador: () => reports.generateDailySalesReport()
  },
  {
    id: 'pl-statement',
    nombre: 'Estado de Resultados (P&L)',
    description: 'Ingresos, costos y ganancias',
    generador: () => reports.generatePLStatement()
  },
  {
    id: 'product-performance',
    nombre: 'Desempeño de Productos',
    description: 'Ranking de productos por revenue y margen',
    generador: () => reports.generateProductPerformance()
  },
  {
    id: 'customer-analysis',
    nombre: 'Análisis de Clientes',
    description: 'Valor de clientes, frecuencia, promedio de ticket',
    generador: () => reports.generateCustomerAnalysis()
  },
  {
    id: 'inventory-valuation',
    nombre: 'Valuación de Inventario',
    description: 'Valor total, rotación, items con stock bajo',
    generador: () => reports.generateInventoryValuation()
  }
];
```

### Service

```typescript
@Injectable({ providedIn: 'root' })
export class AdvancedReportsService {
  
  generateDailySalesReport(fecha?: string): ReportData {
    const date = fecha || this.store.todayStr();
    const ventas = this.store.ventas().filter(v => v.fecha.startsWith(date));
    
    const por_metodo = new Map<MetodoPago, number>();
    ventas.forEach(v => {
      const actual = por_metodo.get(v.metodo) || 0;
      por_metodo.set(v.metodo, actual + v.total);
    });
    
    const totalVentas = ventas.reduce((s, v) => s + v.total, 0);
    const promedio = ventas.length ? totalVentas / ventas.length : 0;
    
    return {
      titulo: `REPORTE VENTAS ${date}`,
      fecha: new Date().toISOString(),
      datos: {
        totalVentas,
        cantidadTransacciones: ventas.length,
        promedioTicket: promedio,
        ventasPorMetodo: Object.fromEntries(por_metodo),
        detalles: ventas
      },
      formatos: ['PDF', 'CSV', 'Excel']
    };
  }
  
  generatePLStatement(fechaDesde?: string, fechaHasta?: string):  ReportData {
    // P&L = Ingresos - Costos - Gastos
    const ventas = this.getVentasPeriodo(fechaDesde, fechaHasta);
    const compras = this.getComprasPeriodo(fechaDesde, fechaHasta);
    const gastos = this.getGastosPeriodo(fechaDesde, fechaHasta);
    
    const ingresos = ventas.reduce((s, v) => s + v.total, 0);
    const costos = compras.reduce((s, c) => s + c.total, 0);
    const gastosOperativos = gastos.reduce((s, g) => s + g.monto, 0);
    
    const gananciaBruta = ingresos - costos;
    const gananciaOperativa = gananciaBruta - gastosOperativos;
    
    return {
      titulo: 'ESTADO DE RESULTADOS (P&L)',
      datos: {
        ingresos,
        costos,
        gananciaBruta,
        gastosOperativos,
        gananciaOperativa,
        margenBruto: (gananciaBruta / ingresos) * 100,
        margenOperativo: (gananciaOperativa / ingresos) * 100
      }
    };
  }
  
  generateProductPerformance(): ReportData {
    const products = this.analisis.productosConCosto()
      .sort((a, b) => b.margen - a.margen);
    
    return {
      titulo: 'DESEMPEÑO DE PRODUCTOS',
      datos: products.map(p => ({
        nombre: p.nombre,
        precioVenta: p.precio,
        costo: p.costo,
        margen: p.margen,
        margenPct: p.margenPct,
        rentable: p.rentable
      }))
    };
  }
  
  // Exportar a diferentes formatos
  exportPDF(report: ReportData) {
    // Usar jsPDF para generar PDF
    const pdf = new jsPDF();
    // ... renderizar reporte en PDF
  }
  
  exportExcel(report: ReportData) {
    // Usar xlsx para generar Excel
    const workbook = XLSX.utils.book_new();
    // ... crear hojas del excel
  }
  
  exportCSV(report: ReportData): string {
    // Convertir a CSV
    return this.convertToCSV(report.datos);
  }
}
```

### UI (Reports Component - Nueva Tab)

```html
<mat-tab label="📊 REPORTES AVANZADOS">
  <div class="p-6 space-y-6">
    
    <div class="text-stone-300 font-black mb-4">Generar Reportes</div>
    
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      @for (report of REPORTS; track report.id) {
        <div class="ep-card p-4 hover:border-amber-500/60 cursor-pointer transition-all"
             (click)="selectReport(report)">
          <div class="text-stone-300 font-black text-sm mb-1">{{ report.nombre }}</div>
          <div class="text-stone-500 text-xs mb-3">{{ report.description }}</div>
          <div class="flex gap-2 flex-wrap text-xs">
            <button mat-mini-fab class="!w-8 !h-8 bg-red-900/60 text-red-400" 
                    (click)="generateReport(report, 'PDF'); $event.stopPropagation()">
              PDF
            </button>
            <button mat-mini-fab class="!w-8 !h-8 bg-green-900/60 text-green-400"
                    (click)="generateReport(report, 'Excel'); $event.stopPropagation()">
              XLS
            </button>
            <button mat-mini-fab class="!w-8 !h-8 bg-blue-900/60 text-blue-400"
                    (click)="generateReport(report, 'CSV'); $event.stopPropagation()">
              CSV
            </button>
          </div>
        </div>
      }
    </div>
    
    <mat-divider></mat-divider>
    
    <!-- Recent reports -->
    <div>
      <div class="text-stone-300 font-black mb-3 text-sm">Reportes Generados Recientemente</div>
      <table class="w-full text-xs">
        <thead>
          <tr class="bg-stone-800/60">
            <th class="px-3 py-2 text-left">Reporte</th>
            <th class="px-3 py-2 text-left">Fecha</th>
            <th class="px-3 py-2 text-center">Formato</th>
            <th class="px-3 py-2 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          @for (rpt of generatedReports(); track rpt.id) {
            <tr class="border-b border-stone-800/40">
              <td class="px-3 py-2">{{ rpt.nombre }}</td>
              <td class="px-3 py-2 text-stone-400">{{ rpt.fecha | date:'short' }}</td>
              <td class="px-3 py-2 text-center">{{ rpt.formato }}</td>
              <td class="px-3 py-2 text-center flex gap-2 justify-center">
                <button mat-icon-button (click)="downloadReport(rpt)"
                        class="!w-6 !h-6 text-stone-500 hover:text-amber-400">
                  <mat-icon class="!text-sm">download</mat-icon>
                </button>
                <button mat-icon-button (click)="deleteReport(rpt)"
                        class="!w-6 !h-6 text-stone-500 hover:text-red-400">
                  <mat-icon class="!text-sm">delete</mat-icon>
                </button>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
    
  </div>
</mat-tab>
```

---

## CRONOGRAMA DE IMPLEMENTACIÓN

```
SEMANA 1 (40 horas)
├─ Día 1-2: Backup/Restore        (3 horas)
├─ Día 2-3: Import/Export         (3 horas)
├─ Día 3-5: Audit Completo        (5 horas)
└─ Día 5: Testing & fixes          (1 hora)

SEMANA 2 (40 horas)
├─ Día 1-3: Analytics Avanzado    (10 horas)
├─ Día 3-4: Reportes Avanzados    (8 horas)
├─ Día 4-5: Hook integrations     (5 horas)
├─ Día 5: Testing & optimization   (2 horas)
└─ Día 5: Documentation            (3 horas)
```

---

## COMMIT PLAN

```
Commit 1: feat: add backup/restore system
Commit 2: feat: add import/export data functionality
Commit 3: feat: implement comprehensive audit logging
Commit 4: feat: add advanced analytics service
Commit 5: feat: implement advanced reports generation
Commit 6: docs: add data management documentation
```

---

## TESTING CHECKLIST

- [ ] Backup creates valid JSON
- [ ] Restore recovers all data correctly
- [ ] Import validates file format
- [ ] Export generates correct CSV/JSON
- [ ] Audit logs captured for all mutations
- [ ] Audit search filters work
- [ ] Undo/revert functionality works
- [ ] Analytics metrics calculate correctly
- [ ] Charts render without errors
- [ ] Reports export to all formats
- [ ] Performance: no memory leaks

---

**Ready to start implementing!** 🚀
