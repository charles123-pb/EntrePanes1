import { Component, inject, computed, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, DecimalPipe }            from '@angular/common';
import { FormsModule }                          from '@angular/forms';
import { MatButtonModule }    from '@angular/material/button';
import { MatIconModule }      from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule }     from '@angular/material/input';
import { MatSelectModule }    from '@angular/material/select';
import { MatTabsModule }      from '@angular/material/tabs';
import { MatSnackBar }        from '@angular/material/snack-bar';
import { AppStateService, MESES, LIMITE_RER } from '../../core/services/app-state.service';
import { HistorialDeclaracion } from '../../core/models/models';
import { RegistroVentasComponent } from './registro-ventas.component';
import { RegistroComprasComponent } from './registro-compras.component';

@Component({
  selector: 'ep-sunat',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, DecimalPipe, FormsModule, MatButtonModule, MatIconModule,
            MatFormFieldModule, MatInputModule, MatSelectModule, MatTabsModule,
            RegistroVentasComponent, RegistroComprasComponent],
  template: `
    <div class="space-y-6 animate-slide-up">

      <div>
        <h1 class="ep-section-title">SUNAT / RER</h1>
        <p class="text-stone-500 text-sm mt-1">Gestión tributaria — Régimen Especial de Renta · Ley 31556</p>
      </div>

      <mat-tab-group animationDuration="200ms" class="ep-tabs">

        <!-- ── TAB: Declarar ── -->
        <mat-tab label="📊 DECLARAR">
          <div class="pt-6 space-y-6">

            <!-- Selector mes/año + total ventas -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <mat-form-field appearance="outline">
                <mat-label>Mes</mat-label>
                <mat-select [(ngModel)]="mesSelec">
                  @for (m of meses; track m; let i = $index) {
                    <mat-option [value]="i">{{ m }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Año</mat-label>
                <mat-select [(ngModel)]="anioSelec">
                  @for (a of anios; track a) { <mat-option [value]="a">{{ a }}</mat-option> }
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Total Ventas del Período (S/)</mat-label>
                <input matInput type="number" [(ngModel)]="totalVentasManual" />
                <mat-hint>O se calcula automáticamente desde ventas</mat-hint>
              </mat-form-field>
            </div>

            <!-- Total auto vs manual -->
            <div class="flex gap-3 flex-wrap">
              <button mat-stroked-button (click)="usarVentasAuto()">
                <mat-icon>sync</mat-icon> Usar total de ventas (S/ {{ totalVentasAuto() | number:'1.2-2' }})
              </button>
            </div>

            <!-- RER cards -->
            @if (totalVentasManual > 0) {
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                @for (kpi of rerKpis(); track kpi.label) {
                  <div class="ep-card p-4 border-l-4" [ngClass]="kpi.accent">
                    <div class="text-stone-500 text-xs font-black tracking-widest mb-2">{{ kpi.label }}</div>
                    <div class="font-display text-2xl" [ngClass]="kpi.cls">S/ {{ kpi.value | number:'1.2-2' }}</div>
                    <div class="text-stone-600 text-xs mt-1">{{ kpi.sub }}</div>
                  </div>
                }
              </div>

              <!-- PDT 621 simulado -->
              <div class="ep-card">
                <div class="px-4 py-3 border-b border-stone-800">
                  <span class="text-stone-300 font-black text-sm tracking-wider">📋 PDT 621 — PERÍODO {{ meses[mesSelec] }} {{ anioSelec }}</span>
                </div>
                <div class="p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div class="ep-card p-3 bg-stone-800/40">
                    <div class="text-stone-500 font-black tracking-wider mb-1">CASILLA 100</div>
                    <div class="text-stone-200 font-mono">{{ meses[mesSelec] }} {{ anioSelec }}</div>
                    <div class="text-stone-500">Período tributario</div>
                  </div>
                  <div class="ep-card p-3 bg-stone-800/40">
                    <div class="text-stone-500 font-black tracking-wider mb-1">CASILLA 154</div>
                    <div class="text-amber-400 font-mono font-black">S/ {{ rer().baseImponible | number:'1.2-2' }}</div>
                    <div class="text-stone-500">Base imponible</div>
                  </div>
                  <div class="ep-card p-3 bg-stone-800/40">
                    <div class="text-stone-500 font-black tracking-wider mb-1">CASILLA 189</div>
                    <div class="text-orange-400 font-mono font-black">S/ {{ rer().igvTotal | number:'1.2-2' }}</div>
                    <div class="text-stone-500">IGV+IPM 10%</div>
                  </div>
                  <div class="ep-card p-3 bg-stone-800/40">
                    <div class="text-stone-500 font-black tracking-wider mb-1">CASILLA 301</div>
                    <div class="text-yellow-400 font-mono font-black">S/ {{ rer().ir | number:'1.2-2' }}</div>
                    <div class="text-stone-500">IR 1.5% RER</div>
                  </div>
                </div>
                <div class="px-4 pb-4">
                  <div class="ep-card p-3 bg-amber-900/20 border-amber-700/40">
                    <div class="flex justify-between items-center">
                      <span class="text-stone-300 font-black">TOTAL A PAGAR SUNAT (Casilla 188)</span>
                      <span class="font-display text-3xl text-amber-400">S/ {{ rer().totalSunat | number:'1.2-2' }}</span>
                    </div>
                    <div class="text-stone-500 text-xs mt-2">
                      Vence el día 18 de {{ meses[(mesSelec + 1) % 12] }} {{ mesSelec === 11 ? anioSelec + 1 : anioSelec }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Alerta RER -->
              @if (rer().alerta) {
                <div class="ep-card p-4 bg-amber-900/20 border-amber-700/40 text-amber-400 text-sm font-black">
                  {{ rer().alerta }}
                </div>
              }

              <!-- Registrar pago -->
              <div class="ep-card p-4">
                <div class="text-stone-400 font-black text-xs tracking-widest mb-3">REGISTRAR PAGO</div>
                <div class="flex flex-wrap gap-3 items-end">
                  <mat-form-field appearance="outline" class="w-44">
                    <mat-label>Fecha de pago</mat-label>
                    <input matInput type="date" [(ngModel)]="fechaPago" />
                  </mat-form-field>
                  <button mat-flat-button color="primary" (click)="registrarPago()">
                    <mat-icon>check</mat-icon> Registrar Declaración Pagada
                  </button>
                </div>
              </div>
            }
          </div>
        </mat-tab>

        <!-- ── TAB: Historial ── -->
        <mat-tab label="📁 HISTORIAL">
          <div class="pt-6 space-y-4">

            <!-- KPIs historial -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div class="ep-card p-4 border-l-4 border-l-emerald-500">
                <div class="text-stone-500 text-xs font-black tracking-widest mb-1">MESES DECLARADOS</div>
                <div class="font-display text-3xl text-emerald-400">{{ store.histNRUS().length }}</div>
              </div>
              <div class="ep-card p-4 border-l-4 border-l-orange-500">
                <div class="text-stone-500 text-xs font-black tracking-widest mb-1">TOTAL IGV PAGADO</div>
                <div class="font-display text-2xl text-orange-400">S/ {{ totIgv() | number:'1.0-0' }}</div>
              </div>
              <div class="ep-card p-4 border-l-4 border-l-yellow-500">
                <div class="text-stone-500 text-xs font-black tracking-widest mb-1">TOTAL IR PAGADO</div>
                <div class="font-display text-2xl text-yellow-400">S/ {{ totIr() | number:'1.0-0' }}</div>
              </div>
              <div class="ep-card p-4 border-l-4 border-l-amber-500">
                <div class="text-stone-500 text-xs font-black tracking-widest mb-1">TOTAL SUNAT</div>
                <div class="font-display text-2xl text-amber-400">S/ {{ totSunat() | number:'1.0-0' }}</div>
              </div>
            </div>

            <div class="ep-card overflow-x-auto">
              <table class="w-full text-xs">
                <thead class="bg-stone-800/60">
                  <tr>
                    @for (h of ['MES','AÑO','VENTAS','BASE IMPON.','IGV+IPM','IR 1.5%','TOTAL SUNAT','ESTADO','FECHA PAGO']; track h) {
                      <th class="px-3 py-2.5 text-left text-stone-500 font-black tracking-widest whitespace-nowrap">{{ h }}</th>
                    }
                  </tr>
                </thead>
                <tbody>
                  @for (h of histRev(); track h.mes + '-' + h.anio) {
                    <tr class="border-b border-stone-800/40 hover:bg-stone-800/20 transition-colors">
                      <td class="px-3 py-2.5 text-stone-200 font-black">{{ meses[h.mes - 1] }}</td>
                      <td class="px-3 py-2.5 text-stone-400">{{ h.anio }}</td>
                      <td class="px-3 py-2.5 text-amber-400 font-black">S/ {{ h.ventas | number:'1.2-2' }}</td>
                      <td class="px-3 py-2.5 text-blue-400 font-mono">S/ {{ h.baseImponible | number:'1.2-2' }}</td>
                      <td class="px-3 py-2.5 text-orange-400 font-black">S/ {{ h.igv | number:'1.2-2' }}</td>
                      <td class="px-3 py-2.5 text-yellow-400 font-black">S/ {{ h.ir | number:'1.2-2' }}</td>
                      <td class="px-3 py-2.5 text-emerald-400 font-black">S/ {{ h.totalSunat | number:'1.2-2' }}</td>
                      <td class="px-3 py-2.5">
                        <span class="ep-badge bg-emerald-900/60 text-emerald-400">✓ PAGADO</span>
                      </td>
                      <td class="px-3 py-2.5 text-stone-400 font-mono">{{ h.fecha_pago }}</td>
                    </tr>
                  }
                  @empty {
                    <tr><td colspan="9" class="text-center py-10 text-stone-600">Sin declaraciones registradas</td></tr>
                  }
                </tbody>
                @if (store.histNRUS().length > 0) {
                  <tfoot class="bg-stone-800/60 border-t border-stone-700">
                    <tr>
                      <td colspan="4" class="px-3 py-3 text-stone-400 font-black text-xs">TOTALES ACUMULADOS</td>
                      <td class="px-3 py-3 text-orange-400 font-black">S/ {{ totIgv() | number:'1.2-2' }}</td>
                      <td class="px-3 py-3 text-yellow-400 font-black">S/ {{ totIr() | number:'1.2-2' }}</td>
                      <td class="px-3 py-3 text-amber-400 font-black text-sm">S/ {{ totSunat() | number:'1.2-2' }}</td>
                      <td colspan="2"></td>
                    </tr>
                  </tfoot>
                }
              </table>
            </div>
          </div>
        </mat-tab>

        <!-- ── TAB: Config Nubefact ── -->
        <mat-tab label="⚙ NUBEFACT">
          <div class="pt-6 max-w-xl space-y-4">
            <div class="ep-card p-4 bg-blue-900/20 border-blue-700/40 text-xs text-blue-400">
              <mat-icon class="!text-base align-middle mr-1">info</mat-icon>
              Configura Nubefact para emitir boletas y facturas electrónicas ante SUNAT.
            </div>
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Token API Nubefact</mat-label>
              <input matInput [(ngModel)]="nfCfg.token" type="password" />
            </mat-form-field>
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>URL Endpoint (demo o producción)</mat-label>
              <input matInput [(ngModel)]="nfCfg.ruta" placeholder="https://api.nubefact.com/api/v1/..." />
            </mat-form-field>
            <div class="grid grid-cols-2 gap-3">
              <mat-form-field appearance="outline">
                <mat-label>Serie Boleta</mat-label>
                <input matInput [(ngModel)]="nfCfg.serie_boleta" />
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Serie Factura</mat-label>
                <input matInput [(ngModel)]="nfCfg.serie_factura" />
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>RUC Emisor</mat-label>
                <input matInput [(ngModel)]="nfCfg.ruc_emisor" maxlength="11" />
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Modo</mat-label>
                <mat-select [(ngModel)]="nfCfg.modo">
                  <mat-option value="demo">Demo</mat-option>
                  <mat-option value="produccion">Producción</mat-option>
                </mat-select>
              </mat-form-field>
            </div>
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Razón Social Emisor</mat-label>
              <input matInput [(ngModel)]="nfCfg.razon_social" />
            </mat-form-field>
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Dirección Fiscal</mat-label>
              <input matInput [(ngModel)]="nfCfg.direccion" />
            </mat-form-field>
            <button mat-flat-button color="primary" (click)="saveNubefact()">
              <mat-icon>save</mat-icon> Guardar Configuración
            </button>
          </div>
        </mat-tab>

        <!-- ── TAB: Registro Ventas (14.1) ── -->
        <mat-tab label="📋 REGISTRO 14.1 (VENTAS)">
          <ep-registro-ventas></ep-registro-ventas>
        </mat-tab>

        <!-- ── TAB: Registro Compras (8.1) ── -->
        <mat-tab label="📋 REGISTRO 8.1 (COMPRAS)">
          <ep-registro-compras></ep-registro-compras>
        </mat-tab>

      </mat-tab-group>

      <!-- Info RER -->
      <div class="ep-card p-4 text-xs text-stone-500 space-y-2">
        <div class="text-amber-400 font-black tracking-widest mb-2">📋 OBLIGACIONES TRIBUTARIAS RER — LEY 31556 · 2026</div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <div class="text-stone-300 font-black mb-1">Libros obligatorios:</div>
            <div>• Registro de Ventas e Ingresos (Formato 14.1)</div>
            <div>• Registro de Compras (Formato 8.1)</div>
          </div>
          <div>
            <div class="text-stone-300 font-black mb-1">Tasas 2026:</div>
            <div>• <span class="text-emerald-400 font-black">IGV 10%</span> (8% IGV + 2% IPM) — Ley 31556 restaurantes MYPE</div>
            <div>• <span class="text-yellow-400 font-black">IR 1.5%</span> s/ base imponible — RER</div>
            <div>• PDT 621 vence el <span class="text-amber-400 font-black">día 18</span> del mes siguiente</div>
            <div>• Límite RER: <span class="text-amber-400 font-black">S/ 525,000/año</span></div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    ::ng-deep .ep-tabs .mat-mdc-tab-label-container { border-bottom: 1px solid #292524; }
    ::ng-deep .ep-tabs .mdc-tab__text-label { color: #78716c; font-weight: 900; font-size: 0.7rem; letter-spacing: 0.1em; }
    ::ng-deep .ep-tabs .mdc-tab--active .mdc-tab__text-label { color: #fbbf24 !important; }
    ::ng-deep .ep-tabs .mdc-tab-indicator__content--underline { border-color: #f59e0b !important; }
  `]
})
export class SunatComponent {
  store = inject(AppStateService);
  private snack = inject(MatSnackBar);

  meses    = MESES;
  anios    = [2025, 2026, 2027];
  mesSelec = new Date().getMonth();
  anioSelec = new Date().getFullYear();
  totalVentasManual = 0;
  fechaPago = this.store.todayStr();

  nfCfg = { ...this.store.nubefactConfig() };

  totalVentasAuto = computed(() =>
    this.store.ventas()
      .filter(v => v.estado === 'completada' && v.fecha.startsWith(`${this.anioSelec}-${String(this.mesSelec + 1).padStart(2,'0')}`))
      .reduce((s,v) => s + v.total, 0)
  );

  rer = computed(() => this.store.calcularRER(this.totalVentasManual));

  rerKpis = computed(() => {
    const r = this.rer();
    return [
      { label: 'BASE IMPONIBLE', value: r.baseImponible, sub: 'Casilla 154', accent: 'border-l-blue-500',   cls: 'text-blue-400' },
      { label: 'IGV+IPM 10%',    value: r.igvTotal,      sub: 'Casilla 189', accent: 'border-l-orange-500', cls: 'text-orange-400' },
      { label: 'IR 1.5% RER',    value: r.ir,            sub: 'Casilla 301', accent: 'border-l-yellow-500', cls: 'text-yellow-400' },
      { label: 'TOTAL SUNAT',    value: r.totalSunat,    sub: 'Casilla 188', accent: 'border-l-red-500',    cls: 'text-red-400' },
    ];
  });

  histRev = computed(() => [...this.store.histNRUS()].reverse());
  totIgv  = computed(() => this.store.histNRUS().reduce((s,h) => s + (h.igv ?? 0), 0));
  totIr   = computed(() => this.store.histNRUS().reduce((s,h) => s + (h.ir ?? 0), 0));
  totSunat = computed(() => this.store.histNRUS().reduce((s,h) => s + (h.totalSunat ?? 0), 0));

  usarVentasAuto() {
    this.totalVentasManual = this.totalVentasAuto();
  }

  registrarPago() {
    if (!this.totalVentasManual || !this.fechaPago) return;
    const r = this.rer();
    const dec: HistorialDeclaracion = {
      mes: this.mesSelec + 1, anio: this.anioSelec,
      ventas: this.totalVentasManual,
      baseImponible: r.baseImponible, igv: r.igv, ipm: r.ipm, ir: r.ir,
      totalSunat: r.totalSunat, pagado: true, fecha_pago: this.fechaPago,
    };
    this.store.update({ histNRUS: [...this.store.histNRUS(), dec] });
    this.snack.open(`✓ Declaración ${MESES[this.mesSelec]} ${this.anioSelec} registrada`, '', { duration: 3000 });
    this.totalVentasManual = 0;
  }

  saveNubefact() {
    this.store.saveNubefact(this.nfCfg as any);
    this.snack.open('Configuración Nubefact guardada', '', { duration: 2000 });
  }
}
