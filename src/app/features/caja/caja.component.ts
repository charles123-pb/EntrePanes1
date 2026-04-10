import { Component, inject, computed, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, DecimalPipe }            from '@angular/common';
import { FormsModule }                          from '@angular/forms';
import { MatButtonModule }    from '@angular/material/button';
import { MatIconModule }      from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule }     from '@angular/material/input';
import { MatTabsModule }      from '@angular/material/tabs';
import { MatSnackBar }        from '@angular/material/snack-bar';
import { AppStateService }    from '../../core/services/app-state.service';
import { PrintService }       from '../../core/services/print.service';

@Component({
  selector: 'ep-caja',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, DecimalPipe, FormsModule, MatButtonModule, MatIconModule,
            MatFormFieldModule, MatInputModule, MatTabsModule],
  template: `
    <div class="space-y-6 animate-slide-up">

      <div class="flex items-center justify-between">
        <div>
          <h1 class="ep-section-title">Cierre de Caja</h1>
          <p class="text-stone-500 text-sm mt-1">{{ dateLabel }}</p>
        </div>
        <div class="flex gap-2">
          <button mat-stroked-button (click)="print.reporteVentas(ventasDia(), 'Reporte de Ventas — ' + fechaFiltro)">
            <mat-icon>print</mat-icon> Imprimir
          </button>
          <button mat-flat-button color="primary" (click)="cerrarCaja()">
            <mat-icon>lock</mat-icon> Cerrar Caja
          </button>
        </div>
      </div>

      <!-- Date filter -->
      <div class="flex items-center gap-3">
        <span class="text-stone-500 text-sm">Fecha:</span>
        <input type="date"
          class="bg-stone-800 border border-stone-700 rounded-sm px-3 py-1.5 text-sm text-stone-200 focus:outline-none focus:border-amber-500"
          [(ngModel)]="fechaFiltro" />
      </div>

      <!-- KPIs -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        @for (kpi of kpis(); track kpi.label) {
          <div class="ep-card p-4 border-l-4" [ngClass]="kpi.accent">
            <div class="text-stone-500 text-xs font-black tracking-widest mb-2">{{ kpi.label }}</div>
            <div class="font-display text-3xl" [ngClass]="kpi.cls">{{ kpi.value }}</div>
          </div>
        }
      </div>

      <!-- 2 col layout -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">

        <!-- Por método de pago -->
        <div class="ep-card">
          <div class="px-4 py-3 border-b border-stone-800">
            <span class="text-stone-300 font-black text-sm tracking-wider">POR MÉTODO DE PAGO</span>
          </div>
          <div class="p-4 space-y-3">
            @for (m of metodos(); track m.label) {
              <div class="flex items-center gap-3">
                <mat-icon [ngClass]="m.iconCls" class="!text-lg">{{ m.icon }}</mat-icon>
                <span class="text-stone-300 text-sm flex-1">{{ m.label | titlecase }}</span>
                <span class="text-stone-500 text-xs">{{ m.count }} ventas</span>
                <span class="font-display text-xl" [ngClass]="m.cls">S/ {{ m.total | number:'1.2-2' }}</span>
              </div>
            }
          </div>
          <!-- Efectivo en caja -->
          <div class="px-4 pb-4 border-t border-stone-800 pt-4">
            <div class="text-stone-500 text-xs font-black tracking-wider mb-3">ARQUEO DE CAJA</div>
            <div class="flex items-center gap-3">
              <span class="text-stone-400 text-sm flex-1">Fondo inicial</span>
              <input type="number" [(ngModel)]="fondoInicial" min="0"
                class="w-28 bg-stone-800 border border-stone-700 rounded-sm px-2 py-1 text-sm text-stone-200 text-right focus:outline-none focus:border-amber-500" />
            </div>
            <div class="mt-2 flex justify-between text-sm">
              <span class="text-stone-400">Efectivo teórico en caja</span>
              <span class="text-emerald-400 font-black">S/ {{ (fondoInicial + efectivoTotal()) | number:'1.2-2' }}</span>
            </div>
          </div>
        </div>

        <!-- Por comprobante -->
        <div class="ep-card">
          <div class="px-4 py-3 border-b border-stone-800">
            <span class="text-stone-300 font-black text-sm tracking-wider">POR COMPROBANTE</span>
          </div>
          <div class="p-4 space-y-3">
            @for (c of comprobantes(); track c.label) {
              <div class="flex items-center gap-3">
                <mat-icon class="text-stone-500 !text-lg">receipt</mat-icon>
                <span class="text-stone-300 text-sm flex-1">{{ c.label | titlecase }}</span>
                <span class="text-stone-500 text-xs">{{ c.count }}</span>
                <span class="font-display text-xl text-amber-400">S/ {{ c.total | number:'1.2-2' }}</span>
              </div>
            }
          </div>

          <!-- SUNAT RER resumen -->
          <div class="px-4 pb-4 border-t border-stone-800 pt-4 space-y-2">
            <div class="text-stone-500 text-xs font-black tracking-wider mb-3">OBLIGACIONES SUNAT — RER LEY 31556</div>
            <div class="flex justify-between text-xs">
              <span class="text-stone-400">Base imponible</span>
              <span class="text-stone-300 font-mono">S/ {{ rer().baseImponible | number:'1.2-2' }}</span>
            </div>
            <div class="flex justify-between text-xs">
              <span class="text-stone-400">IGV+IPM 10%</span>
              <span class="text-orange-400 font-black font-mono">S/ {{ rer().igvTotal | number:'1.2-2' }}</span>
            </div>
            <div class="flex justify-between text-xs">
              <span class="text-stone-400">IR 1.5% RER</span>
              <span class="text-yellow-400 font-black font-mono">S/ {{ rer().ir | number:'1.2-2' }}</span>
            </div>
            <div class="flex justify-between text-sm border-t border-stone-700 pt-2">
              <span class="text-stone-300 font-black">Total SUNAT</span>
              <span class="text-red-400 font-display text-xl">S/ {{ rer().totalSunat | number:'1.2-2' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Gastos Extras del Día -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        <!-- Agregar Gasto -->
        <div class="ep-card">
          <div class="px-4 py-3 border-b border-stone-800">
            <span class="text-stone-300 font-black text-sm tracking-wider">➕ AGREGAR GASTO EXTRA</span>
          </div>
          <div class="p-4 space-y-3">
            <mat-form-field appearance="outline" class="w-full ep-field-compact">
              <mat-label>Descripción (ej: Electricidad, Agua, etc)</mat-label>
              <input matInput [(ngModel)]="nuevoGastoDesc" />
            </mat-form-field>
            <mat-form-field appearance="outline" class="w-full ep-field-compact">
              <mat-label>Monto (S/)</mat-label>
              <input matInput type="number" [(ngModel)]="nuevoGastoMonto" min="0" step="0.01" />
            </mat-form-field>
            <button mat-flat-button color="primary" (click)="agregarGasto()" class="w-full">
              <mat-icon>add_circle</mat-icon> Registrar Gasto
            </button>
          </div>
        </div>

        <!-- Lista de Gastos -->
        <div class="ep-card">
          <div class="px-4 py-3 border-b border-stone-800 flex justify-between items-center">
            <span class="text-stone-300 font-black text-sm tracking-wider">💰 GASTOS DEL DÍA</span>
            <span class="text-red-400 font-display text-lg">S/ {{ totalGastosExtras() | number:'1.2-2' }}</span>
          </div>
          <div class="p-3 max-h-52 overflow-y-auto space-y-2">
            @for (gasto of gastosExtras(); track $index) {
              <div class="flex items-center justify-between p-2 bg-stone-800/40 rounded-sm">
                <div>
                  <div class="text-stone-300 text-sm">{{ gasto.descripcion }}</div>
                  <div class="text-stone-500 text-xs">S/ {{ gasto.monto | number:'1.2-2' }}</div>
                </div>
                <button mat-icon-button (click)="eliminarGasto($index)" class="text-stone-600 hover:text-red-400 transition">
                  <mat-icon class="!text-lg">delete</mat-icon>
                </button>
              </div>
            }
            @empty {
              <div class="text-center py-6 text-stone-600 text-sm">
                <mat-icon class="!text-3xl block mx-auto mb-1">no_meals</mat-icon>
                Sin gastos registrados
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Balance Final -->
      <div class="ep-card border-amber-800/30 bg-stone-900/40 p-4">
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <div class="text-stone-500 text-xs font-black tracking-wider mb-2">INGRESOS</div>
            <div class="font-display text-2xl text-amber-400">S/ {{ totalDia() | number:'1.2-2' }}</div>
          </div>
          <div>
            <div class="text-stone-500 text-xs font-black tracking-wider mb-2">GASTOS</div>
            <div class="font-display text-2xl text-red-400">−S/ {{ totalGastosExtras() | number:'1.2-2' }}</div>
          </div>
          <div class="col-span-2 sm:col-span-2">
            <div class="text-stone-500 text-xs font-black tracking-wider mb-2">BALANCE NETO</div>
            <div class="font-display text-3xl" [ngClass]="balanceNeto() >= 0 ? 'text-emerald-400' : 'text-red-400'">
              S/ {{ balanceNeto() | number:'1.2-2' }}
            </div>
          </div>
        </div>
      </div>

      <div class="ep-card">
        <div class="px-4 py-3 border-b border-stone-800">
          <span class="text-stone-300 font-black text-sm tracking-wider">DETALLE DE VENTAS DEL DÍA</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-xs">
            <thead class="bg-stone-800/60">
              <tr>
                @for (h of ['HORA','COMPROBANTE','ITEMS','TOTAL','MÉTODO','ESTADO']; track h) {
                  <th class="px-3 py-2.5 text-left text-stone-500 font-black tracking-widest">{{ h }}</th>
                }
              </tr>
            </thead>
            <tbody>
              @for (v of ventasDia(); track v.id) {
                <tr class="border-b border-stone-800/40 hover:bg-stone-800/20 transition-colors"
                    [ngClass]="v.estado === 'anulada' ? 'opacity-40 line-through' : ''">
                  <td class="px-3 py-2.5 text-stone-400 font-mono">{{ v.fecha.slice(11,16) }}</td>
                  <td class="px-3 py-2.5 text-stone-300">{{ v.comprobante ?? v.tipo_comp }}</td>
                  <td class="px-3 py-2.5 text-stone-400">{{ v.items.length }}</td>
                  <td class="px-3 py-2.5 text-amber-400 font-black">S/ {{ v.total | number:'1.2-2' }}</td>
                  <td class="px-3 py-2.5">
                    <span class="ep-badge bg-stone-800 text-stone-300">{{ v.metodo }}</span>
                  </td>
                  <td class="px-3 py-2.5">
                    <span class="ep-badge"
                      [ngClass]="v.estado === 'completada' ? 'bg-emerald-900/60 text-emerald-400' : 'bg-red-900/60 text-red-400'">
                      {{ v.estado }}
                    </span>
                  </td>
                </tr>
              }
              @empty {
                <tr><td colspan="6" class="text-center py-10 text-stone-600">Sin ventas este día</td></tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class CajaComponent {
  store  = inject(AppStateService);
  print  = inject(PrintService);
  private snack = inject(MatSnackBar);

  fechaFiltro  = new Date().toISOString().split('T')[0];
  fondoInicial = 0;
  dateLabel    = new Date().toLocaleDateString('es-PE', { weekday:'long', day:'2-digit', month:'long', year:'numeric' });

  // Gastos extras
  gastosExtras = signal<{ descripcion: string; monto: number }[]>([]);
  nuevoGastoDesc = '';
  nuevoGastoMonto = 0;

  ventasDia = computed(() =>
    this.store.ventas().filter(v => v.fecha.startsWith(this.fechaFiltro))
  );

  ventasOk = computed(() =>
    this.ventasDia().filter(v => v.estado === 'completada')
  );

  totalDia      = computed(() => this.ventasOk().reduce((s,v) => s + v.total, 0));
  efectivoTotal = computed(() => this.ventasOk().filter(v => v.metodo === 'efectivo').reduce((s,v) => s + v.total, 0));

  rer = computed(() => this.store.calcularRER(this.totalDia()));

  kpis = computed(() => [
    { label:'TOTAL VENTAS',    value:`S/ ${this.totalDia().toFixed(2)}`,     cls:'text-amber-400',  accent:'border-l-amber-500' },
    { label:'Nº TICKETS',      value:`${this.ventasOk().length}`,            cls:'text-blue-400',   accent:'border-l-blue-500' },
    { label:'ANULADAS',        value:`${this.ventasDia().filter(v=>v.estado==='anulada').length}`, cls:'text-red-400', accent:'border-l-red-500' },
    { label:'TOTAL SUNAT',     value:`S/ ${this.rer().totalSunat.toFixed(2)}`, cls:'text-red-400',  accent:'border-l-red-400' },
  ]);

  metodos = computed(() => {
    const metodosMap = ['efectivo','tarjeta','yape','plin'];
    const iconMap: Record<string,string>  = { efectivo:'payments',tarjeta:'credit_card',yape:'phone_android',plin:'phone_android' };
    const clsMap:  Record<string,string>  = { efectivo:'text-emerald-400',tarjeta:'text-blue-400',yape:'text-purple-400',plin:'text-pink-400' };
    return metodosMap.map(m => {
      const vs = this.ventasOk().filter(v => v.metodo === m);
      return { label: m, count: vs.length, total: vs.reduce((s,v)=>s+v.total,0), icon: iconMap[m], iconCls: clsMap[m], cls: clsMap[m] };
    }).filter(m => m.count > 0);
  });

  comprobantes = computed(() => {
    const tipos = ['ticket','boleta','factura'];
    return tipos.map(t => {
      const vs = this.ventasOk().filter(v => v.tipo_comp === t);
      return { label: t, count: vs.length, total: vs.reduce((s,v)=>s+v.total,0) };
    }).filter(c => c.count > 0);
  });

  // Gastos extras
  totalGastosExtras = computed(() =>
    this.gastosExtras().reduce((sum, g) => sum + g.monto, 0)
  );

  balanceNeto = computed(() =>
    this.totalDia() - this.totalGastosExtras()
  );

  agregarGasto() {
    if (!this.nuevoGastoDesc.trim() || this.nuevoGastoMonto <= 0) {
      this.snack.open('❌ Completa descripción y monto', 'Cerrar', { duration: 2000 });
      return;
    }
    this.gastosExtras.update(gastos => [
      ...gastos,
      { descripcion: this.nuevoGastoDesc, monto: this.nuevoGastoMonto }
    ]);
    this.snack.open(`✓ Gasto agregado`, '', { duration: 1500 });
    this.nuevoGastoDesc = '';
    this.nuevoGastoMonto = 0;
  }

  eliminarGasto(index: number) {
    this.gastosExtras.update(gastos => gastos.filter((_, i) => i !== index));
  }

  cerrarCaja() {
    this.snack.open(`✓ Caja cerrada — Total: S/ ${this.balanceNeto().toFixed(2)}`, '', { duration: 3000 });
    this.print.reporteVentas(this.ventasDia(), `Cierre de Caja — ${this.fechaFiltro}`);
  }
}
