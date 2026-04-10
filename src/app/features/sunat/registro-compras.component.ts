import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { AppStateService, MESES } from '../../core/services/app-state.service';
import { Compra } from '../../core/models/models';

/**
 * Registro de Compras — Formato 8.1
 * Obligatorio por SUNAT/RER
 * Detalla todos los comprobantes de compra por período
 */
@Component({
  selector: 'ep-registro-compras',
  standalone: true,
  imports: [
    CommonModule, DecimalPipe, FormsModule,
    MatIconModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule
  ],
  template: `
    <div class="space-y-4 p-4">

      <!-- Filtros -->
      <div class="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <mat-form-field appearance="outline" class="flex-1">
          <mat-label>Mes</mat-label>
          <mat-select [(ngModel)]="mesFilter">
            <mat-option value="">Todos</mat-option>
            @for (m of meses; track m; let i = $index) {
              <mat-option [value]="formatMes(i)">{{ m }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="flex-1">
          <mat-label>Año</mat-label>
          <mat-select [(ngModel)]="anioFilter">
            <mat-option value="">Todos</mat-option>
            @for (a of anosComputed(); track a) { <mat-option [value]="formatAnio(a)">{{ a }}</mat-option> }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="flex-1">
          <mat-label>Tipo Comprobante</mat-label>
          <mat-select [(ngModel)]="tipoFilter">
            <mat-option value="">Todos</mat-option>
            <mat-option value="boleta">Boleta</mat-option>
            <mat-option value="factura">Factura</mat-option>
            <mat-option value="ticket">Ticket</mat-option>
          </mat-select>
        </mat-form-field>

        <button mat-stroked-button (click)="exportarCSV()">
          <mat-icon>download</mat-icon> DESCARGAR
        </button>
      </div>

      <!-- Tabla Registro 8.1 -->
      <div class="ep-card overflow-x-auto border-t-4 border-t-cyan-600">
        <div class="px-4 py-2 bg-stone-800/60 border-b border-stone-700">
          <h3 class="text-sm font-black text-stone-300 tracking-wider">
            📋 FORMATO 8.1 — REGISTRO DE COMPRAS
            <span class="text-xs text-stone-500 ml-2">
              {{ comprasFiltered().length }} comprobante(s)
            </span>
          </h3>
        </div>

        <table class="w-full text-xs">
          <thead class="bg-stone-800/40">
            <tr>
              @for (h of ['FECHA','PROVEEDOR','RUC','TIPO','N° COMPROBANTE','BASE IMPON.','IGV 10%','TOTAL']; track h) {
                <th class="px-3 py-2.5 text-left text-stone-500 font-black tracking-widest whitespace-nowrap">{{ h }}</th>
              }
            </tr>
          </thead>

          <tbody>
            @for (c of comprasFiltered(); track c.id) {
              <tr class="border-b border-stone-800/40 hover:bg-stone-800/20 transition-colors">
                <td class="px-3 py-2.5 text-stone-300 font-mono">{{ c.fecha.slice(0, 10) }}</td>
                <td class="px-3 py-2.5 text-stone-400 text-xs">{{ provNombre(c.prov_id) }}</td>
                <td class="px-3 py-2.5 text-cyan-400 font-mono">{{ provRuc(c.prov_id) }}</td>
                <td class="px-3 py-2.5">
                  <span class="ep-badge" [ngClass]="{
                    'bg-amber-900/60 text-amber-400': c.tipo_comp === 'boleta',
                    'bg-blue-900/60 text-blue-400': c.tipo_comp === 'factura',
                    'bg-stone-700/60 text-stone-300': c.tipo_comp === 'ticket'
                  }">
                    {{ c.tipo_comp | uppercase }}
                  </span>
                </td>
                <td class="px-3 py-2.5 text-stone-400 font-mono">{{ c.comprobante }}</td>
                <td class="px-3 py-2.5 text-blue-400 font-mono text-right">S/ {{ baseImponible(c) | number:'1.2-2' }}</td>
                <td class="px-3 py-2.5 text-orange-400 font-mono text-right">S/ {{ igvMonto(c) | number:'1.2-2' }}</td>
                <td class="px-3 py-2.5 text-cyan-400 font-black text-right">S/ {{ c.total | number:'1.2-2' }}</td>
              </tr>
            }
            @empty {
              <tr><td colspan="8" class="text-center py-8 text-stone-600">Sin compras en este período</td></tr>
            }
          </tbody>

          @if (comprasFiltered().length > 0) {
            <tfoot class="bg-stone-800/60 border-t border-stone-700 font-black">
              <tr>
                <td colspan="5" class="px-3 py-3 text-stone-400 text-xs">TOTALES DEL PERÍODO</td>
                <td class="px-3 py-3 text-blue-400 font-mono text-right">S/ {{ totBaseImponible() | number:'1.2-2' }}</td>
                <td class="px-3 py-3 text-orange-400 font-mono text-right">S/ {{ totIgv() | number:'1.2-2' }}</td>
                <td class="px-3 py-3 text-cyan-400 text-right">S/ {{ totCompras() | number:'1.2-2' }}</td>
              </tr>
            </tfoot>
          }
        </table>
      </div>

      <!-- Validación: Compras vs Ventas -->
      @if (totCompras() > 0 && totVentas() > 0) {
        <div class="ep-card p-3" 
          [ngClass]="{
            'bg-red-900/20 border-red-700/40 text-red-400': totCompras() > totVentas(),
            'bg-emerald-900/20 border-emerald-700/40 text-emerald-400': totCompras() <= totVentas()
          }">
          <mat-icon class="!text-base align-middle" [ngClass]="{
            'text-red-400': totCompras() > totVentas(),
            'text-emerald-400': totCompras() <= totVentas()
          }">
            {{ totCompras() > totVentas() ? 'warning' : 'check' }}
          </mat-icon>
          <span class="ml-2">
            Compras: S/ {{ totCompras() | number:'1.2-2' }} 
            <span *ngIf="totVentas() > 0">→ Ventas: S/ {{ totVentas() | number:'1.2-2' }}</span>
            <span *ngIf="totCompras() > totVentas()" class="font-black">
              — ⚠️ COMPRAS > VENTAS (revisar)
            </span>
          </span>
        </div>
      }

      <!-- Info RER -->
      <div class="ep-card p-3 bg-blue-900/20 border-blue-700/40 text-xs text-blue-400">
        <mat-icon class="!text-base align-middle">info</mat-icon>
        <span class="ml-2">
          Este registro es obligatorio para RER/MYPE. Base imponible = Total ÷ 1.10. IGV es creditable.
        </span>
      </div>
    </div>
  `,
})
export class RegistroComprasComponent {
  store = inject(AppStateService);
  
  meses = MESES;
  anosComputed = computed(() => {
    const years: number[] = [2024, 2025, 2026, 2027];
    return years;
  });

  mesFilter = signal('');
  anioFilter = signal('');
  tipoFilter = signal('');

  formatMes = (i: number) => String(i + 1).padStart(2, '0');
  formatAnio = (a: number) => String(a);

  comprasFiltered = computed(() => {
    const mes = this.mesFilter();
    const anio = this.anioFilter();
    const tipo = this.tipoFilter();

    return this.store.compras().filter(c => {
      const fechaMes = c.fecha.slice(5, 7);
      const fechaAnio = c.fecha.slice(0, 4);
      
      if (mes && fechaMes !== mes) return false;
      if (anio && fechaAnio !== anio) return false;
      if (tipo && c.tipo_comp !== tipo) return false;
      
      return true;
    });
  });

  baseImponible = (c: Compra) => Math.round((c.total / 1.10) * 100) / 100;
  igvMonto = (c: Compra) => Math.round((c.total - this.baseImponible(c)) * 100) / 100;

  provNombre = (id: number) => this.store.proveedores().find(p => p.id === id)?.nombre ?? '—';
  provRuc = (id: number) => this.store.proveedores().find(p => p.id === id)?.ruc ?? '—';

  totCompras = computed(() => this.comprasFiltered().reduce((s, c) => s + c.total, 0));
  totBaseImponible = computed(() => this.comprasFiltered().reduce((s, c) => s + this.baseImponible(c), 0));
  totIgv = computed(() => this.comprasFiltered().reduce((s, c) => s + this.igvMonto(c), 0));

  totVentas = computed(() => 
    this.store.ventas()
      .filter(v => v.estado === 'completada')
      .reduce((s, v) => s + v.total, 0)
  );

  exportarCSV() {
    const headers = ['Fecha','Proveedor','RUC','Tipo','N° Comprobante','Base Imponible','IGV 10%','Total'];
    const rows = this.comprasFiltered().map(c => [
      c.fecha.slice(0, 10),
      this.provNombre(c.prov_id),
      this.provRuc(c.prov_id),
      c.tipo_comp,
      c.comprobante,
      this.baseImponible(c).toFixed(2),
      this.igvMonto(c).toFixed(2),
      c.total.toFixed(2)
    ]);

    const csv = [headers, ...rows]
      .map(row => row.map(col => `"${col}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `Registro_8.1_Compras_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
