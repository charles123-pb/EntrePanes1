import { Component, inject, computed } from '@angular/core';
import { CommonModule, DecimalPipe }   from '@angular/common';
import { RouterLink }                  from '@angular/router';
import { MatCardModule }               from '@angular/material/card';
import { MatIconModule }               from '@angular/material/icon';
import { MatButtonModule }             from '@angular/material/button';
import { MatDividerModule }            from '@angular/material/divider';
import { BaseChartDirective }          from 'ng2-charts';
import { AppStateService, MESES }      from '../../core/services/app-state.service';
import { AnalisisService }             from '../../core/services/analisis.service';

@Component({
  selector: 'ep-dashboard',
  standalone: true,
  imports: [CommonModule, DecimalPipe, RouterLink, MatCardModule, MatIconModule, MatButtonModule, MatDividerModule, BaseChartDirective],
  template: `
    <div class="space-y-6 animate-slide-up">

      <!-- Header -->
      <div>
        <h1 class="ep-section-title">Dashboard</h1>
        <p class="text-stone-500 text-sm mt-1">Resumen operativo — {{ todayLabel }}</p>
      </div>

      <!-- KPI Grid -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
        @for (kpi of kpis(); track kpi.label) {
          <div class="ep-card p-4 border-l-4 hover:border-amber-500 transition-colors" [ngClass]="kpi.accent">
            <div class="text-stone-500 text-xs font-black tracking-widest mb-2">{{ kpi.label }}</div>
            <div class="font-display text-3xl" [ngClass]="kpi.valueClass">{{ kpi.value }}</div>
            @if (kpi.sub) {
              <div class="text-stone-500 text-xs mt-1">{{ kpi.sub }}</div>
            }
          </div>
        }
      </div>

      <!-- Charts Row -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <!-- Ventas últimos 7 días -->
        <div class="lg:col-span-2 ep-card p-4">
          <h3 class="text-stone-300 font-black text-sm tracking-wider mb-4">📈 VENTAS ÚLTIMOS 7 DÍAS</h3>
          <canvas baseChart
            [type]="'line'"
            [data]="weeklyChartData()"
            [options]="weeklyChartOptions"
            class="!max-h-64 !w-full">
          </canvas>
        </div>

        <!-- Ventas por Método de Pago -->
        <div class="ep-card p-4">
          <h3 class="text-stone-300 font-black text-sm tracking-wider mb-4">💳 POR MÉTODO DE PAGO</h3>
          <canvas baseChart
            [type]="'doughnut'"
            [data]="methodPieData()"
            [options]="methodPieOptions"
            class="!max-h-64">
          </canvas>
        </div>
      </div>

      <!-- Products Chart -->
      <div class="ep-card p-4">
        <h3 class="text-stone-300 font-black text-sm tracking-wider mb-4">⭐ TOP 5 PRODUCTOS MÁS VENDIDOS</h3>
        <canvas baseChart
          [type]="'bar'"
          [data]="topProductsData()"
          [options]="topProductsOptions"
          class="!max-h-80 !w-full">
        </canvas>
      </div>

      <!-- Análisis de Costos y Rentabilidad -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        <!-- Productos Críticos (Bajo Margen) -->
        <div class="ep-card">
          <div class="px-4 py-3 border-b border-stone-800 flex justify-between items-center">
            <span class="text-stone-300 font-black text-sm tracking-wider">⚠️ PRODUCTOS CRÍTICOS</span>
            <span class="text-red-400 text-xs font-black">(Margen < 20%)</span>
          </div>
          <div class="p-3 max-h-64 overflow-y-auto space-y-2">
            @for (prod of analisis.productosCriticos(); track prod.id) {
              <div class="flex items-center justify-between p-2 bg-red-900/20 border border-red-700/30 rounded-sm">
                <div class="flex-1 min-w-0">
                  <div class="text-stone-200 text-sm truncate">{{ prod.nombre }}</div>
                  <div class="text-stone-500 text-xs">Margen: S/ {{prod.margen | number:'1.2-2'}} (~{{prod.margenPct.toFixed(1)}}%)</div>
                </div>
                <span class="text-red-400 font-black text-sm whitespace-nowrap ml-2">{{prod.margenPct.toFixed(1)}}%</span>
              </div>
            }
            @empty {
              <div class="text-center py-6 text-emerald-500 text-sm">
                <mat-icon class="!text-3xl block mx-auto mb-1">check_circle</mat-icon>
                Todos los productos tienen margen sano
              </div>
            }
          </div>
        </div>

        <!-- Productos Rentables (Top 5) -->
        <div class="ep-card">
          <div class="px-4 py-3 border-b border-stone-800 flex justify-between items-center">
            <span class="text-stone-300 font-black text-sm tracking-wider">⭐ MÁS RENTABLES</span>
            <span class="text-emerald-400 text-xs font-black">(Top 5)</span>
          </div>
          <div class="p-3 max-h-64 overflow-y-auto space-y-2">
            @for (prod of analisis.productosRentables(); track prod.id) {
              <div class="flex items-center justify-between p-2 bg-emerald-900/20 border border-emerald-700/30 rounded-sm">
                <div class="flex-1 min-w-0">
                  <div class="text-stone-200 text-sm truncate">{{ prod.nombre }}</div>
                  <div class="text-stone-500 text-xs">Margen S/ {{prod.margen | number:'1.2-2'}} (~{{prod.margenPct.toFixed(1)}}%)</div>
                </div>
                <span class="text-emerald-400 font-black text-sm whitespace-nowrap ml-2">+S/ {{prod.margen | number:'1.2-2'}}</span>
              </div>
            }
            @empty {
              <div class="text-center py-6 text-stone-600 text-sm">
                <mat-icon class="!text-3xl block mx-auto mb-1">trending_flat</mat-icon>
                Sin datos de costoshoy
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Content Row -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">

        <!-- Últimas ventas -->
        <div class="ep-card lg:col-span-2">
          <div class="px-4 py-3 border-b border-stone-800 flex justify-between items-center">
            <span class="text-stone-300 font-black text-sm tracking-wider">ÚLTIMAS VENTAS</span>
            <a [routerLink]="'/ventas'" class="text-amber-400 text-xs hover:text-amber-300">Ver todas →</a>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-xs">
              <thead class="bg-stone-800/60">
                <tr>
                  @for (h of ['FECHA','COMPROBANTE','TOTAL','MÉTODO','ESTADO']; track h) {
                    <th class="px-3 py-2.5 text-left text-stone-500 font-black tracking-widest">{{ h }}</th>
                  }
                </tr>
              </thead>
              <tbody>
                @for (v of lastVentas(); track v.id) {
                  <tr class="border-b border-stone-800/50 hover:bg-stone-800/30 transition-colors">
                    <td class="px-3 py-2.5 text-stone-400 font-mono">{{ v.fecha.slice(0,16) }}</td>
                    <td class="px-3 py-2.5 text-stone-300">{{ v.comprobante ?? v.tipo_comp }}</td>
                    <td class="px-3 py-2.5 text-amber-400 font-black">S/ {{ v.total | number:'1.2-2' }}</td>
                    <td class="px-3 py-2.5">
                      <span class="ep-badge" [ngClass]="metodoBadge(v.metodo)">{{ v.metodo }}</span>
                    </td>
                    <td class="px-3 py-2.5">
                      <span class="ep-badge" [ngClass]="v.estado === 'completada' ? 'bg-emerald-900/60 text-emerald-400' : 'bg-red-900/60 text-red-400'">
                        {{ v.estado }}
                      </span>
                    </td>
                  </tr>
                }
                @empty {
                  <tr><td colspan="5" class="text-center py-8 text-stone-600">Sin ventas registradas hoy</td></tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- Alertas y accesos rápidos -->
        <div class="space-y-4">

          <!-- Stock alerts -->
          <div class="ep-card">
            <div class="px-4 py-3 border-b border-stone-800 flex justify-between items-center">
              <span class="text-stone-300 font-black text-sm tracking-wider">STOCK CRÍTICO</span>
              <a [routerLink]="'/inventario'" class="text-amber-400 text-xs hover:text-amber-300">Ver →</a>
            </div>
            <div class="p-3 space-y-2 max-h-48 overflow-y-auto">
              @for (ins of lowStock(); track ins.id) {
                <div class="flex justify-between items-center text-xs py-1 border-b border-stone-800/40">
                  <span class="text-stone-300">{{ ins.nombre }}</span>
                  <span class="ep-badge"
                    [ngClass]="ins.stock <= 0 ? 'bg-red-900/60 text-red-400' : ins.stock < ins.stock_min * 0.5 ? 'bg-red-700/60 text-red-300' : 'bg-amber-900/60 text-amber-400'">
                    {{ ins.stock }} {{ ins.unidad }}
                  </span>
                </div>
              }
              @empty {
                <div class="text-center py-4 text-emerald-500 text-xs">
                  <mat-icon class="!text-2xl block mx-auto mb-1">check_circle</mat-icon>
                  Todo el stock OK
                </div>
              }
            </div>
          </div>

          <!-- Quick actions -->
          <div class="ep-card p-4 space-y-2">
            <div class="text-stone-500 font-black text-xs tracking-widest mb-3">ACCESOS RÁPIDOS</div>
            @for (action of quickActions; track action.label) {
              <a [routerLink]="action.route"
                 class="flex items-center gap-3 px-3 py-2.5 rounded-sm bg-stone-800/40 hover:bg-stone-800 text-stone-300 hover:text-amber-300 text-sm font-medium transition-all group">
                <mat-icon class="!text-base text-stone-500 group-hover:text-amber-400 transition-colors">{{ action.icon }}</mat-icon>
                {{ action.label }}
              </a>
            }
          </div>
        </div>
      </div>

      <!-- RER Summary -->
      <div class="ep-card border-amber-800/30">
        <div class="px-4 py-3 border-b border-stone-800">
          <span class="text-stone-300 font-black text-sm tracking-wider">📊 RESUMEN RER — LEY 31556 · 2026</span>
        </div>
        <div class="p-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <div class="text-stone-500 text-xs font-black tracking-wider mb-1">VENTAS MES</div>
            <div class="text-amber-400 font-display text-2xl">S/ {{ rer().totalVentas | number:'1.0-0' }}</div>
          </div>
          <div>
            <div class="text-stone-500 text-xs font-black tracking-wider mb-1">IGV+IPM 10%</div>
            <div class="text-orange-400 font-display text-2xl">S/ {{ rer().igvTotal | number:'1.0-0' }}</div>
          </div>
          <div>
            <div class="text-stone-500 text-xs font-black tracking-wider mb-1">IR 1.5%</div>
            <div class="text-yellow-400 font-display text-2xl">S/ {{ rer().ir | number:'1.0-0' }}</div>
          </div>
          <div>
            <div class="text-stone-500 text-xs font-black tracking-wider mb-1">TOTAL SUNAT</div>
            <div class="text-red-400 font-display text-2xl">S/ {{ rer().totalSunat | number:'1.0-0' }}</div>
          </div>
        </div>
        @if (rer().alerta) {
          <div class="mx-4 mb-4 px-3 py-2 bg-amber-900/30 border border-amber-700/50 rounded-sm text-amber-400 text-xs font-black">
            {{ rer().alerta }}
          </div>
        }
      </div>

    </div>
  `,
})
export class DashboardComponent {
  store = inject(AppStateService);
  analisis = inject(AnalisisService);

  todayLabel = new Date().toLocaleDateString('es-PE', { weekday:'long', day:'2-digit', month:'long', year:'numeric' });

  quickActions = [
    { route: '/ventas',     label: 'Nueva Venta',     icon: 'add_shopping_cart' },
    { route: '/compras',    label: 'Registrar Compra', icon: 'add_circle' },
    { route: '/inventario', label: 'Ver Inventario',  icon: 'inventory_2' },
    { route: '/caja',       label: 'Cierre de Caja',  icon: 'lock' },
  ];

  lastVentas = computed(() =>
    [...this.store.ventas()].reverse().slice(0, 8)
  );

  lowStock = computed(() =>
    this.store.insumos().filter(i => i.stock < i.stock_min)
  );

  kpis = computed(() => {
    const ventas  = this.store.ventas().filter(v => v.estado === 'completada');
    const today   = new Date().toISOString().split('T')[0];
    const ventasH = ventas.filter(v => v.fecha.startsWith(today));
    const totalH  = ventasH.reduce((s, v) => s + v.total, 0);
    const totalM  = ventas.reduce((s, v) => s + v.total, 0);
    const tickH   = ventasH.length;
    const prom    = tickH ? totalH / tickH : 0;
    const gananciaH = this.analisis.gananciaNetaHoy();
    const margenH = this.analisis.margenPromedioDia();

    return [
      { label: 'VENTAS HOY',    value: `S/ ${totalH.toFixed(2)}`,  sub: `${tickH} tickets`,           accent: 'border-l-amber-500',   valueClass: 'text-amber-400' },
      { label: 'GANANCIA NETA', value: `S/ ${gananciaH.toFixed(2)}`, sub: `Ingresos - Costos`,        accent: gananciaH >= 0 ? 'border-l-emerald-500' : 'border-l-red-500',
        valueClass: gananciaH >= 0 ? 'text-emerald-400' : 'text-red-400' },
      { label: 'MARGEN HOY',    value: `${margenH.toFixed(1)}%`,    sub: 'promedio de rentabilidad',   accent: margenH >= 20 ? 'border-l-emerald-500' : 'border-l-amber-500',
        valueClass: margenH >= 20 ? 'text-emerald-400' : 'text-amber-400' },
      { label: 'ALERTAS STOCK', value: `${this.store.stockAlerts()}`, sub: 'insumos bajo mínimo',      accent: this.store.stockAlerts() > 0 ? 'border-l-red-500' : 'border-l-emerald-500',
        valueClass: this.store.stockAlerts() > 0 ? 'text-red-400' : 'text-emerald-400' },
    ];
  });

  rer = computed(() => {
    const totalVentas = this.store.ventas()
      .filter(v => v.estado === 'completada')
      .reduce((s, v) => s + v.total, 0);
    const calc = this.store.calcularRER(totalVentas);
    return { totalVentas, ...calc };
  });

  // ── Gráfico 1: Ventas por Método de Pago (Donut)
  methodPieData = computed(() => {
    const ventas = this.store.ventas().filter(v => v.estado === 'completada');
    const metodos = { efectivo: 0, tarjeta: 0, yape: 0, plin: 0 };
    ventas.forEach(v => {
      if (metodos.hasOwnProperty(v.metodo)) {
        metodos[v.metodo as keyof typeof metodos] += v.total;
      }
    });
    return {
      labels: ['Efectivo', 'Tarjeta', 'Yape', 'Plin'],
      datasets: [{
        data: [metodos.efectivo, metodos.tarjeta, metodos.yape, metodos.plin],
        backgroundColor: ['#10b981', '#3b82f6', '#a855f7', '#ec4899'],
        borderColor: ['#10b981', '#3b82f6', '#a855f7', '#ec4899'],
      }]
    };
  });

  methodPieOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#a8a29e',
          font: { size: 12, weight: 'bold' as const }
        }
      }
    }
  } as any;

  // ── Gráfico 2: Productos Top 5 (Bar)
  topProductsData = computed(() => {
    const itemsByProduct: Record<number, { nombre: string; cantidad: number }> = {};
    this.store.ventas()
      .filter(v => v.estado === 'completada')
      .forEach(v => {
        v.items.forEach(item => {
          if (!itemsByProduct[item.id]) {
            itemsByProduct[item.id] = { nombre: item.nombre, cantidad: 0 };
          }
          itemsByProduct[item.id].cantidad += item.cant;
        });
      });
    
    const sorted = Object.values(itemsByProduct)
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5);

    return {
      labels: sorted.map(p => p.nombre),
      datasets: [{
        label: 'Unidades Vendidas',
        data: sorted.map(p => p.cantidad),
        backgroundColor: '#f59e0b',
        borderColor: '#d97706',
        borderWidth: 1,
      }]
    };
  });

  topProductsOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        labels: { color: '#a8a29e', font: { size: 12, weight: 'bold' as const } }
      }
    },
    scales: {
      y: {
        ticks: { color: '#a8a29e' },
        grid: { color: '#44403c' }
      },
      x: {
        ticks: { color: '#a8a29e' },
        grid: { color: '#44403c' }
      }
    }
  } as any;

  // ── Gráfico 3: Ventas últimos 7 días (Line)
  weeklyChartData = computed(() => {
    const today = new Date();
    const days: string[] = [];
    const ventasByDay: Record<string, number> = {};

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      days.push(d.toLocaleDateString('es-PE', { weekday: 'short' }));
      ventasByDay[dateStr] = 0;
    }

    this.store.ventas()
      .filter(v => v.estado === 'completada')
      .forEach(v => {
        const dateStr = v.fecha.split('T')[0];
        if (ventasByDay.hasOwnProperty(dateStr)) {
          ventasByDay[dateStr] += v.total;
        }
      });

    return {
      labels: days,
      datasets: [{
        label: 'Ventas (S/)',
        data: days.map((_, i) => {
          const d = new Date(today);
          d.setDate(d.getDate() - (6 - i));
          return ventasByDay[d.toISOString().split('T')[0]];
        }),
        borderColor: '#fbbf24',
        backgroundColor: 'rgba(251, 191, 36, 0.1)',
        borderWidth: 2,
        tension: 0.3,
        fill: true,
        pointBackgroundColor: '#fbbf24',
        pointBorderColor: '#f59e0b',
        pointRadius: 4,
        pointHoverRadius: 6,
      }]
    };
  });

  weeklyChartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        labels: { color: '#a8a29e', font: { size: 12, weight: 'bold' as const } }
      }
    },
    scales: {
      y: {
        ticks: { color: '#a8a29e' },
        grid: { color: '#44403c' }
      },
      x: {
        ticks: { color: '#a8a29e' },
        grid: { color: '#44403c' }
      }
    }
  } as any;

  metodoBadge(m: string) {
    const map: Record<string, string> = {
      efectivo: 'bg-emerald-900/60 text-emerald-400',
      tarjeta:  'bg-blue-900/60 text-blue-400',
      yape:     'bg-purple-900/60 text-purple-400',
      plin:     'bg-pink-900/60 text-pink-400',
    };
    return map[m] ?? 'bg-stone-800 text-stone-400';
  }
}
