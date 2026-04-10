import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { AppStateService, MESES } from '../../core/services/app-state.service';
import { Venta } from '../../core/models/models';

/**
 * Registro de Ventas e Ingresos — Formato 14.1
 * Obligatorio por SUNAT/RER
 * Detalla todos los comprobantes de venta por período
 */
@Component({
  selector: 'ep-registro-ventas',
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

      <!-- Tabla Registro 14.1 -->
      <div class="ep-card overflow-x-auto border-t-4 border-t-amber-600">
        <div class="px-4 py-2 bg-stone-800/60 border-b border-stone-700">
          <h3 class="text-sm font-black text-stone-300 tracking-wider">
            📋 FORMATO 14.1 — REGISTRO DE VENTAS E INGRESOS
            <span class="text-xs text-stone-500 ml-2">
              {{ ventasFiltered().length }} comprobante(s)
            </span>
          </h3>
        </div>

        <table class="w-full text-xs">
          <thead class="bg-stone-800/40">
            <tr>
              @for (h of ['FECHA','TIPO','N° COMPROBANTE','CLIENTE','BASE IMPON.','IGV 10%','TOTAL']; track h) {
                <th class="px-3 py-2.5 text-left text-stone-500 font-black tracking-widest whitespace-nowrap">{{ h }}</th>
              }
            </tr>
          </thead>

          <tbody>
            @for (v of ventasFiltered(); track v.id) {
              <tr class="border-b border-stone-800/40 hover:bg-stone-800/20 transition-colors">
                <td class="px-3 py-2.5 text-stone-300 font-mono">{{ v.fecha.slice(0, 10) }}</td>
                <td class="px-3 py-2.5">
                  <span class="ep-badge" [ngClass]="{
                    'bg-amber-900/60 text-amber-400': v.tipo_comp === 'boleta',
                    'bg-blue-900/60 text-blue-400': v.tipo_comp === 'factura',
                    'bg-stone-700/60 text-stone-300': v.tipo_comp === 'ticket'
                  }">
                    {{ v.tipo_comp | uppercase }}
                  </span>
                </td>
                <td class="px-3 py-2.5 text-stone-400 font-mono">{{ v.comprobante || '—' }}</td>
                <td class="px-3 py-2.5 text-stone-400 text-xs">ref_cliente</td>
                <td class="px-3 py-2.5 text-blue-400 font-mono text-right">S/ {{ baseImponible(v) | number:'1.2-2' }}</td>
                <td class="px-3 py-2.5 text-orange-400 font-mono text-right">S/ {{ igvMonto(v) | number:'1.2-2' }}</td>
                <td class="px-3 py-2.5 text-amber-400 font-black text-right">S/ {{ v.total | number:'1.2-2' }}</td>
              </tr>
            }
            @empty {
              <tr><td colspan="7" class="text-center py-8 text-stone-600">Sin ventas en este período</td></tr>
            }
          </tbody>

          @if (ventasFiltered().length > 0) {
            <tfoot class="bg-stone-800/60 border-t border-stone-700 font-black">
              <tr>
                <td colspan="4" class="px-3 py-3 text-stone-400 text-xs">TOTALES DEL PERÍODO</td>
                <td class="px-3 py-3 text-blue-400 font-mono text-right">S/ {{ totBaseImponible() | number:'1.2-2' }}</td>
                <td class="px-3 py-3 text-orange-400 font-mono text-right">S/ {{ totIgv() | number:'1.2-2' }}</td>
                <td class="px-3 py-3 text-amber-400 text-right">S/ {{ totVentas() | number:'1.2-2' }}</td>
              </tr>
            </tfoot>
          }
        </table>
      </div>

      <!-- Info RER -->
      <div class="ep-card p-3 bg-blue-900/20 border-blue-700/40 text-xs text-blue-400">
        <mat-icon class="!text-base align-middle">info</mat-icon>
        <span class="ml-2">
          Este registro es obligatorio para RER/MYPE. Base imponible = Total ÷ 1.10
        </span>
      </div>
    </div>
  `,
})
export class RegistroVentasComponent {
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

  ventasFiltered = computed(() => {
    const mes = this.mesFilter();
    const anio = this.anioFilter();
    const tipo = this.tipoFilter();

    return this.store.ventas().filter(v => {
      if (v.estado !== 'completada') return false;
      
      const fechaMes = v.fecha.slice(5, 7);
      const fechaAnio = v.fecha.slice(0, 4);
      
      if (mes && fechaMes !== mes) return false;
      if (anio && fechaAnio !== anio) return false;
      if (tipo && v.tipo_comp !== tipo) return false;
      
      return true;
    });
  });

  baseImponible = (v: Venta) => Math.round((v.total / 1.10) * 100) / 100;
  igvMonto = (v: Venta) => Math.round((v.total - this.baseImponible(v)) * 100) / 100;

  totVentas = computed(() => this.ventasFiltered().reduce((s, v) => s + v.total, 0));
  totBaseImponible = computed(() => this.ventasFiltered().reduce((s, v) => s + this.baseImponible(v), 0));
  totIgv = computed(() => this.ventasFiltered().reduce((s, v) => s + this.igvMonto(v), 0));

  exportarCSV() {
    const headers = ['Fecha','Tipo','N° Comprobante','Cliente','Base Imponible','IGV 10%','Total'];
    const rows = this.ventasFiltered().map(v => [
      v.fecha.slice(0, 10),
      v.tipo_comp,
      v.comprobante || '',
      'cliente_ref',
      this.baseImponible(v).toFixed(2),
      this.igvMonto(v).toFixed(2),
      v.total.toFixed(2)
    ]);

    const csv = [headers, ...rows]
      .map(row => row.map(col => `"${col}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `Registro_14.1_Ventas_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
