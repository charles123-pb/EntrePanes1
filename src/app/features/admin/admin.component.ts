import { Component, inject, signal, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { AppStateService } from '../../core/services/app-state.service';
import { USERS_DEFAULT, USERS_KEY, ROL_BADGE, ROL_ICON, UserRole, AppUser } from '../../core/constants/constants';
import { BackupService } from '../../core/services/backup.service';
import { ImportExportService } from '../../core/services/import-export.service';
import { AuditService, AuditFilter } from '../../core/services/audit.service';
import { AdvancedAnalyticsService } from '../../core/services/advanced-analytics.service';
import { AdvancedReportsService } from '../../core/services/advanced-reports.service';

@Component({
  selector: 'ep-admin',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatSlideToggleModule, MatTabsModule,
    MatDatepickerModule, MatNativeDateModule, MatTableModule, MatPaginatorModule,
    MatTooltipModule, MatProgressSpinnerModule, MatDividerModule
  ],
  template: `
    <div class="space-y-6 animate-slide-up">

      <div>
        <h1 class="ep-section-title">Administración</h1>
        <p class="text-stone-500 text-sm mt-1">Usuarios, datos, auditoría y reportes</p>
      </div>

      <mat-tab-group class="ep-card">
        
        <!-- TAB 1: USUARIOS -->
        <mat-tab label="👤 Usuarios">
          <ng-template mat-tab-label>
            <mat-icon class="!mr-2">people</mat-icon>
            Usuarios
          </ng-template>
          
          <div class="p-6 space-y-4">
            <div class="flex justify-between items-center mb-4">
              <h3 class="ep-section-title text-lg">Gestión de Usuarios</h3>
              <button mat-flat-button color="primary" (click)="openForm()">
                <mat-icon>person_add</mat-icon> Nuevo Usuario
              </button>
            </div>

            <table class="w-full text-xs">
              <thead>
                <tr class="bg-stone-800/60">
                  <th class="px-4 py-2 text-left">Nombre</th>
                  <th class="px-4 py-2 text-left">Usuario</th>
                  <th class="px-4 py-2 text-left">Rol</th>
                  <th class="px-4 py-2 text-left">Estado</th>
                  <th class="px-4 py-2 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                @for (u of users(); track u.id) {
                  <tr class="border-b border-stone-800/40 hover:bg-stone-800/20">
                    <td class="px-4 py-2">{{ u.nombre }}</td>
                    <td class="px-4 py-2 font-mono text-stone-400">@{{ u.usuario }}</td>
                    <td class="px-4 py-2">
                      <span class="ep-badge" [ngClass]="ROL_BADGE[u.rol]">{{ u.rol }}</span>
                    </td>
                    <td class="px-4 py-2">
                      <mat-slide-toggle [checked]="u.activo" (change)="toggleUser(u)"></mat-slide-toggle>
                    </td>
                    <td class="px-4 py-2 flex gap-1 justify-center">
                      <button mat-icon-button class="!w-6 !h-6 text-stone-500 hover:text-amber-400" (click)="openForm(u)">
                        <mat-icon class="!text-sm">edit</mat-icon>
                      </button>
                      @if (u.rol !== 'admin') {
                        <button mat-icon-button class="!w-6 !h-6 text-stone-500 hover:text-red-400" (click)="deleteUser(u)">
                          <mat-icon class="!text-sm">delete</mat-icon>
                        </button>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </mat-tab>

        <!-- TAB 2: CONFIGURACIÓN -->
        <mat-tab label="⚙️ Configuración">
          <ng-template mat-tab-label>
            <mat-icon class="!mr-2">settings</mat-icon>
            Configuración
          </ng-template>

          <div class="p-6 space-y-6">
            <div>
              <h3 class="ep-section-title text-lg mb-4">Configuración del Negocio</h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Nombre del negocio</mat-label>
                  <input matInput [(ngModel)]="biz.nombre" />
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>RUC</mat-label>
                  <input matInput [(ngModel)]="biz.ruc" maxlength="11" />
                </mat-form-field>
                <mat-form-field appearance="outline" class="col-span-1 sm:col-span-2">
                  <mat-label>Dirección</mat-label>
                  <input matInput [(ngModel)]="biz.direccion" />
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Teléfono</mat-label>
                  <input matInput [(ngModel)]="biz.telefono" />
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Moneda</mat-label>
                  <mat-select [(ngModel)]="biz.moneda">
                    <mat-option value="PEN">PEN — Sol Peruano</mat-option>
                    <mat-option value="USD">USD — Dólar</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>
              <button mat-flat-button color="primary" (click)="saveBiz()" class="mt-4">
                <mat-icon>save</mat-icon> Guardar configuración
              </button>
            </div>

            <mat-divider></mat-divider>

            <!-- Datos del sistema -->
            <div>
              <h3 class="ep-section-title text-lg mb-4">Estadísticas</h3>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div class="ep-card p-3 bg-stone-800/40">
                  <div class="text-stone-500 font-black mb-1">VENTAS</div>
                  <div class="text-amber-400 font-display text-2xl">{{ store.ventas().length }}</div>
                </div>
                <div class="ep-card p-3 bg-stone-800/40">
                  <div class="text-stone-500 font-black mb-1">COMPRAS</div>
                  <div class="text-blue-400 font-display text-2xl">{{ store.compras().length }}</div>
                </div>
                <div class="ep-card p-3 bg-stone-800/40">
                  <div class="text-stone-500 font-black mb-1">PRODUCTOS</div>
                  <div class="text-violet-400 font-display text-2xl">{{ store.productos().length }}</div>
                </div>
                <div class="ep-card p-3 bg-stone-800/40">
                  <div class="text-stone-500 font-black mb-1">INSUMOS</div>
                  <div class="text-emerald-400 font-display text-2xl">{{ store.insumos().length }}</div>
                </div>
              </div>
            </div>
          </div>
        </mat-tab>

        <!-- TAB 3: BACKUPS Y RESTAURACIÓN -->
        <mat-tab label="💾 Backups">
          <ng-template mat-tab-label>
            <mat-icon class="!mr-2">backup</mat-icon>
            Backups
          </ng-template>

          <div class="p-6 space-y-4">
            <h3 class="ep-section-title text-lg mb-4">Backup y Restauración</h3>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="ep-card p-4 space-y-3">
                <div class="font-black text-stone-300">Crear Backup</div>
                <p class="text-xs text-stone-400">Descargar copia completa de todos los datos</p>
                <button mat-flat-button class="w-full" color="primary" (click)="backup.downloadBackup()">
                  <mat-icon>cloud_download</mat-icon> Descargar Ahora
                </button>
              </div>

              <div class="ep-card p-4 space-y-3">
                <div class="font-black text-stone-300">Restaurar Backup</div>
                <p class="text-xs text-stone-400">Cargar datos desde archivo JSON</p>
                <input #fileInput type="file" accept=".json" style="display:none" 
                       (change)="restoreBackup($event)" />
                <button mat-flat-button class="w-full" color="accent" (click)="fileInput.click()">
                  <mat-icon>cloud_upload</mat-icon> Seleccionar Archivo
                </button>
              </div>
            </div>

            <mat-divider></mat-divider>

            <!-- Últimos backups -->
            <div>
              <div class="font-black text-stone-300 mb-3">Últimos Backups Automáticos</div>
              @if (backup.backupMetadata().length > 0) {
                <div class="space-y-2">
                  @for (b of backup.backupMetadata() | slice:-5; track b.id) {
                    <div class="ep-card p-3 flex items-center justify-between">
                      <div>
                        <div class="text-stone-300 text-sm">{{ b.timestamp | date:'short' }}</div>
                        <div class="text-xs text-stone-500">{{ b.size | number }} bytes</div>
                      </div>
                      <div class="flex gap-2">
                        <button mat-icon-button class="!w-7 !h-7 text-stone-500 hover:text-amber-400"
                                (click)="backup.downloadBackup(b.timestamp)" matTooltip="Descargar">
                          <mat-icon class="!text-sm">download</mat-icon>
                        </button>
                      </div>
                    </div>
                  }
                </div>
              } @else {
                <p class="text-stone-500 text-sm">No hay backups automáticos disponibles</p>
              }
            </div>
          </div>
        </mat-tab>

        <!-- TAB 4: IMPORTAR/EXPORTAR -->
        <mat-tab label="📤 Exportar/Importar">
          <ng-template mat-tab-label>
            <mat-icon class="!mr-2">import_export</mat-icon>
            Import/Export
          </ng-template>

          <div class="p-6 space-y-6">
            <!-- EXPORTAR -->
            <div>
              <h3 class="ep-section-title text-lg mb-4">Exportar Datos</h3>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <button mat-stroked-button (click)="impexp.exportProductosJSON()">
                  <mat-icon>file_download</mat-icon> Productos JSON
                </button>
                <button mat-stroked-button (click)="impexp.exportProductosCSV()">
                  <mat-icon>table_chart</mat-icon> Productos CSV
                </button>
                <button mat-stroked-button (click)="impexp.exportVentasJSON()">
                  <mat-icon>file_download</mat-icon> Ventas JSON
                </button>
                <button mat-stroked-button (click)="impexp.exportVentasCSV()">
                  <mat-icon>table_chart</mat-icon> Ventas CSV
                </button>
                <button mat-stroked-button (click)="impexp.exportClientesJSON()">
                  <mat-icon>file_download</mat-icon> Clientes JSON
                </button>
                <button mat-stroked-button (click)="impexp.exportClientesCSV()">
                  <mat-icon>table_chart</mat-icon> Clientes CSV
                </button>
              </div>

              <button mat-flat-button color="primary" (click)="exportAllZip()" class="mt-4">
                <mat-icon>cloud_download</mat-icon> Descargar TODO (ZIP)
              </button>

              <button mat-flat-button color="accent" (click)="impexp.exportAllAsExcel()" class="mt-2">
                <mat-icon>cloud_download</mat-icon> Descargar TODO (Excel)
              </button>
            </div>

            <mat-divider></mat-divider>

            <!-- IMPORTAR -->
            <div>
              <h3 class="ep-section-title text-lg mb-4">Importar Datos</h3>
              <p class="text-sm text-stone-400 mb-3">Cargue archivos JSON para importar productos, clientes o insumos</p>
              
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input #importProducts type="file" accept=".json" style="display:none" 
                       (change)="importProductos($event)" />
                <button mat-stroked-button (click)="importProducts.click()">
                  <mat-icon>upload</mat-icon> Importar Productos
                </button>

                <input #importClientes type="file" accept=".json" style="display:none" 
                       (change)="importClientess($event)" />
                <button mat-stroked-button (click)="importClientes.click()">
                  <mat-icon>upload</mat-icon> Importar Clientes
                </button>

                <input #importInsumos type="file" accept=".json" style="display:none" 
                       (change)="importInsumoss($event)" />
                <button mat-stroked-button (click)="importInsumos.click()">
                  <mat-icon>upload</mat-icon> Importar Insumos
                </button>
              </div>
            </div>
          </div>
        </mat-tab>

        <!-- TAB 5: AUDITORÍA -->
        <mat-tab label="🔍 Auditoría">
          <ng-template mat-tab-label>
            <mat-icon class="!mr-2">history</mat-icon>
            Auditoría
          </ng-template>

          <div class="p-6 space-y-4">
            <h3 class="ep-section-title text-lg mb-4">Historial de Cambios</h3>

            <!-- Filtros -->
            <div class="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Usuario</mat-label>
                <mat-select [(ngModel)]="auditFilters.usuario">
                  <mat-option value="">Todos</mat-option>
                  @for (user of audit.getUniqueUsers(); track user) {
                    <mat-option [value]="user">{{ user }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Acción</mat-label>
                <mat-select [(ngModel)]="auditFilters.accion">
                  <mat-option value="">Todas</mat-option>
                  @for (action of audit.getUniqueActions(); track action) {
                    <mat-option [value]="action">{{ action }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Desde</mat-label>
                <input matInput [(ngModel)]="auditFilters.fechaDesde" type="date" />
              </mat-form-field>

              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Hasta</mat-label>
                <input matInput [(ngModel)]="auditFilters.fechaHasta" type="date" />
              </mat-form-field>
            </div>

            <div class="flex gap-2">
              <button mat-stroked-button (click)="applyAuditFilters()">
                <mat-icon>search</mat-icon> Buscar
              </button>
              <button mat-stroked-button (click)="resetAuditFilters()">
                <mat-icon>clear</mat-icon> Limpiar
              </button>
            </div>

            <!-- Tabla de auditoría -->
            <div class="overflow-x-auto">
              <table class="w-full text-xs">
                <thead>
                  <tr class="bg-stone-800/60">
                    <th class="px-3 py-2 text-left">Fecha</th>
                    <th class="px-3 py-2 text-left">Usuario</th>
                    <th class="px-3 py-2 text-left">Acción</th>
                    <th class="px-3 py-2 text-left">Entidad</th>
                    <th class="px-3 py-2 text-left">Descripción</th>
                  </tr>
                </thead>
                <tbody>
                  @for (entry of filteredAuditLogs(); track entry.id) {
                    <tr class="border-b border-stone-800/40 hover:bg-stone-800/20">
                      <td class="px-3 py-2 text-stone-400">{{ entry.fecha | date:'short' }}</td>
                      <td class="px-3 py-2">{{ entry.usuario }}</td>
                      <td class="px-3 py-2 text-amber-300">{{ entry.accion }}</td>
                      <td class="px-3 py-2">{{ entry.entidad }}</td>
                      <td class="px-3 py-2 text-stone-400">{{ entry.descripcion || entry.detalles }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </mat-tab>

        <!-- TAB 6: ANALYTICS -->
        <mat-tab label="📈 Analytics">
          <ng-template mat-tab-label>
            <mat-icon class="!mr-2">analytics</mat-icon>
            Analytics
          </ng-template>

          <div class="p-6 space-y-6">
            <!-- Período selector -->
            <div class="flex gap-2 mb-4">
              <button mat-stroked-button 
                      [class.!border-amber-500]="analyticsPeriodo() === 'hoy'"
                      (click)="analyticsPeriodo.set('hoy')">
                Hoy
              </button>
              <button mat-stroked-button 
                      [class.!border-amber-500]="analyticsPeriodo() === 'semana'"
                      (click)="analyticsPeriodo.set('semana')">
                Semana
              </button>
              <button mat-stroked-button 
                      [class.!border-amber-500]="analyticsPeriodo() === 'mes'"
                      (click)="analyticsPeriodo.set('mes')">
                Mes
              </button>
              <button mat-stroked-button 
                      [class.!border-amber-500]="analyticsPeriodo() === 'año'"
                      (click)="analyticsPeriodo.set('año')">
                Año
              </button>
            </div>

            <!-- KPIs -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
              @let sales = analytics.getSalesAnalytics(analyticsPeriodo());
              @let fin = analytics.getFinancialAnalytics(analyticsPeriodo());
              
              <div class="ep-card p-4 bg-stone-800/40">
                <div class="text-stone-500 text-xs font-black mb-2">TOTAL VENTAS</div>
                <div class="text-amber-400 font-display text-2xl">
                  S/ {{ sales.totalVentas.valor | number:'1.2-2' }}
                </div>
              </div>

              <div class="ep-card p-4 bg-stone-800/40">
                <div class="text-stone-500 text-xs font-black mb-2">MARGEN PROMEDIO</div>
                <div class="text-green-400 font-display text-2xl">
                  {{ sales.margenPromedio.valor | number:'1.0-0' }}%
                </div>
              </div>

              <div class="ep-card p-4 bg-stone-800/40">
                <div class="text-stone-500 text-xs font-black mb-2">COSTO TOTAL</div>
                <div class="text-blue-400 font-display text-2xl">
                  S/ {{ fin.costoTotal.valor | number:'1.2-2' }}
                </div>
              </div>

              <div class="ep-card p-4 bg-stone-800/40">
                <div class="text-stone-500 text-xs font-black mb-2">GANANCIA</div>
                <div class="text-emerald-400 font-display text-2xl">
                  S/ {{ fin.gananciaTotal.valor | number:'1.2-2' }}
                </div>
              </div>
            </div>

            <!-- Top Productos -->
            <div class="ep-card p-4">
              <h4 class="text-stone-300 font-black mb-3 text-sm">Top 5 Productos</h4>
              <table class="w-full text-xs">
                <tbody>
                  @for (prod of analytics.getSalesAnalytics(analyticsPeriodo()).ventasPorProducto.slice(0, 5); track prod.nombre) {
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

            <!-- Productos rentables vs críticos -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="ep-card p-4">
                <h4 class="text-stone-300 font-black mb-3 text-sm">Top Rentables</h4>
                <table class="w-full text-xs">
                  <tbody>
                    @for (prod of analytics.getFinancialAnalytics(analyticsPeriodo()).topProductosPorMargen.slice(0, 5); track prod.nombre) {
                      <tr class="border-b border-stone-800/40">
                        <td class="py-2 text-green-400">{{ prod.nombre }}</td>
                        <td class="py-2 text-right text-sm">{{ prod.margenPct | number:'1.0-0' }}%</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>

              <div class="ep-card p-4">
                <h4 class="text-stone-300 font-black mb-3 text-sm">Productos Críticos</h4>
                <table class="w-full text-xs">
                  <tbody>
                    @for (prod of analytics.getFinancialAnalytics(analyticsPeriodo()).productoCritico.slice(0, 5); track prod.nombre) {
                      <tr class="border-b border-stone-800/40">
                        <td class="py-2 text-red-400">{{ prod.nombre }}</td>
                        <td class="py-2 text-right text-red-300">{{ prod.margen | number:'1.2-2' }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </mat-tab>

        <!-- TAB 7: REPORTES -->
        <mat-tab label="📊 Reportes">
          <ng-template mat-tab-label>
            <mat-icon class="!mr-2">assessment</mat-icon>
            Reportes
          </ng-template>

          <div class="p-6 space-y-6">
            <h3 class="ep-section-title text-lg mb-4">Generar Reportes</h3>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="ep-card p-4 hover:border-amber-500/60 cursor-pointer transition-all"
                   (click)="generateAndDownloadReport('daily-sales', 'PDF')">
                <div class="text-stone-300 font-black text-sm mb-1">Ventas Diarias</div>
                <div class="text-stone-500 text-xs mb-3">Resumen completo de ventas del día</div>
                <div class="flex gap-2">
                  <button mat-mini-fab class="!w-8 !h-8 bg-red-900/60 text-red-400" 
                          (click)="generateAndDownloadReport('daily-sales', 'PDF'); $event.stopPropagation()">
                    PDF
                  </button>
                  <button mat-mini-fab class="!w-8 !h-8 bg-blue-900/60 text-blue-400"
                          (click)="generateAndDownloadReport('daily-sales', 'CSV'); $event.stopPropagation()">
                    CSV
                  </button>
                </div>
              </div>

              <div class="ep-card p-4 hover:border-amber-500/60 cursor-pointer transition-all"
                   (click)="generateAndDownloadReport('pl-statement', 'PDF')">
                <div class="text-stone-300 font-black text-sm mb-1">Estado de Resultados</div>
                <div class="text-stone-500 text-xs mb-3">P&L — Ingresos, Costos y Ganancias</div>
                <div class="flex gap-2">
                  <button mat-mini-fab class="!w-8 !h-8 bg-red-900/60 text-red-400"
                          (click)="generateAndDownloadReport('pl-statement', 'PDF'); $event.stopPropagation()">
                    PDF
                  </button>
                  <button mat-mini-fab class="!w-8 !h-8 bg-green-900/60 text-green-400"
                          (click)="generateAndDownloadReport('pl-statement', 'Excel'); $event.stopPropagation()">
                    XLS
                  </button>
                </div>
              </div>

              <div class="ep-card p-4 hover:border-amber-500/60 cursor-pointer transition-all"
                   (click)="generateAndDownloadReport('product-perf', 'PDF')">
                <div class="text-stone-300 font-black text-sm mb-1">Desempeño de Productos</div>
                <div class="text-stone-500 text-xs mb-3">Ranking por revenue y margen</div>
                <div class="flex gap-2">
                  <button mat-mini-fab class="!w-8 !h-8 bg-red-900/60 text-red-400"
                          (click)="generateAndDownloadReport('product-perf', 'PDF'); $event.stopPropagation()">
                    PDF
                  </button>
                  <button mat-mini-fab class="!w-8 !h-8 bg-green-900/60 text-green-400"
                          (click)="generateAndDownloadReport('product-perf', 'Excel'); $event.stopPropagation()">
                    XLS
                  </button>
                </div>
              </div>

              <div class="ep-card p-4 hover:border-amber-500/60 cursor-pointer transition-all"
                   (click)="generateAndDownloadReport('customer-anal', 'PDF')">
                <div class="text-stone-300 font-black text-sm mb-1">Análisis de Clientes</div>
                <div class="text-stone-500 text-xs mb-3">Valor, frecuencia y ticket promedio</div>
                <div class="flex gap-2">
                  <button mat-mini-fab class="!w-8 !h-8 bg-red-900/60 text-red-400"
                          (click)="generateAndDownloadReport('customer-anal', 'PDF'); $event.stopPropagation()">
                    PDF
                  </button>
                  <button mat-mini-fab class="!w-8 !h-8 bg-green-900/60 text-green-400"
                          (click)="generateAndDownloadReport('customer-anal', 'Excel'); $event.stopPropagation()">
                    XLS
                  </button>
                </div>
              </div>

              <div class="ep-card p-4 hover:border-amber-500/60 cursor-pointer transition-all"
                   (click)="generateAndDownloadReport('inventory-val', 'PDF')">
                <div class="text-stone-300 font-black text-sm mb-1">Valuación de Inventario</div>
                <div class="text-stone-500 text-xs mb-3">Valor total, rotación, alertas</div>
                <div class="flex gap-2">
                  <button mat-mini-fab class="!w-8 !h-8 bg-red-900/60 text-red-400"
                          (click)="generateAndDownloadReport('inventory-val', 'PDF'); $event.stopPropagation()">
                    PDF
                  </button>
                  <button mat-mini-fab class="!w-8 !h-8 bg-blue-900/60 text-blue-400"
                          (click)="generateAndDownloadReport('inventory-val', 'CSV'); $event.stopPropagation()">
                    CSV
                  </button>
                </div>
              </div>
            </div>
          </div>
        </mat-tab>

      </mat-tab-group>

      <!-- User form modal -->
      @if (showForm()) {
        <div class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" (click)="showForm.set(false)">
          <div class="ep-card w-full max-w-sm p-6 space-y-4" (click)="$event.stopPropagation()">
            <h2 class="ep-section-title text-xl">{{ editUser() ? 'Editar' : 'Nuevo' }} Usuario</h2>
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Nombre completo</mat-label>
              <input matInput [(ngModel)]="uForm.nombre" />
            </mat-form-field>
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Usuario (login)</mat-label>
              <input matInput [(ngModel)]="uForm.usuario" />
            </mat-form-field>
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>PIN (4 dígitos)</mat-label>
              <input matInput type="password" [(ngModel)]="uForm.pin" maxlength="4" />
            </mat-form-field>
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Rol</mat-label>
              <mat-select [(ngModel)]="uForm.rol">
                <mat-option value="admin">Administrador</mat-option>
                <mat-option value="cajero">Cajero</mat-option>
                <mat-option value="cocinero">Cocinero</mat-option>
              </mat-select>
            </mat-form-field>
            <div class="flex gap-3 justify-end">
              <button mat-stroked-button (click)="showForm.set(false)">Cancelar</button>
              <button mat-flat-button color="primary" (click)="saveUser()">Guardar</button>
            </div>
          </div>
        </div>
      }

    </div>
  `,
})
export class AdminComponent {
  store = inject(AppStateService);
  backup = inject(BackupService);
  impexp = inject(ImportExportService);
  audit = inject(AuditService);
  analytics = inject(AdvancedAnalyticsService);
  reports = inject(AdvancedReportsService);
  private snack = inject(MatSnackBar);

  ROL_BADGE = ROL_BADGE;
  ROL_ICON = ROL_ICON;

  users = signal<AppUser[]>(this.loadUsers());
  showForm = signal(false);
  editUser = signal<AppUser | null>(null);
  uForm: Partial<AppUser> & { rol: UserRole } = { nombre: '', usuario: '', pin: '', rol: 'cajero', activo: true };

  biz = this.loadBiz();

  // Analytics
  analyticsPeriodo = signal<'hoy' | 'semana' | 'mes' | 'año'>('mes');

  // Audit filters
  auditFilters: AuditFilter = {};
  filteredAuditLogs = computed(() => {
    if (Object.keys(this.auditFilters).length === 0) {
      return this.audit.getRecent(100);
    }
    return this.audit.search(this.auditFilters).slice(-100);
  });

  loadUsers(): AppUser[] {
    try { return JSON.parse(localStorage.getItem(USERS_KEY) ?? '') ?? USERS_DEFAULT; } catch { return USERS_DEFAULT; }
  }

  saveUsers() { try { localStorage.setItem(USERS_KEY, JSON.stringify(this.users())); } catch {} }

  loadBiz() {
    try { return JSON.parse(localStorage.getItem('entrepanes_biz') ?? '{}') ?? {}; } catch { return {}; }
  }

  openForm(u?: AppUser) {
    this.editUser.set(u ?? null);
    this.uForm = u ? { ...u } : { nombre: '', usuario: '', pin: '', rol: 'cajero', activo: true };
    this.showForm.set(true);
  }

  saveUser() {
    if (!this.uForm.nombre?.trim() || !this.uForm.usuario?.trim()) return;
    const us = this.users();
    if (this.editUser()) {
      this.users.set(us.map(u => u.id === this.editUser()!.id ? { ...u, ...this.uForm } as AppUser : u));
    } else {
      const nuevo: AppUser = { ...this.uForm as AppUser, id: us.length ? Math.max(...us.map(u => u.id)) + 1 : 1 };
      this.users.set([...us, nuevo]);
    }
    this.saveUsers();
    this.snack.open('Usuario guardado', '', { duration: 2000 });
    this.showForm.set(false);
  }

  toggleUser(u: AppUser) {
    this.users.update(us => us.map(x => x.id === u.id ? { ...x, activo: !x.activo } : x));
    this.saveUsers();
  }

  deleteUser(u: AppUser) {
    if (!confirm(`¿Eliminar usuario "${u.nombre}"?`)) return;
    this.users.update(us => us.filter(x => x.id !== u.id));
    this.saveUsers();
    this.snack.open('Usuario eliminado', '', { duration: 2000 });
  }

  saveBiz() {
    try { localStorage.setItem('entrepanes_biz', JSON.stringify(this.biz)); } catch { }
    this.snack.open('Configuración guardada', '', { duration: 2000 });
  }

  // Backup methods
  restoreBackup(event: any) {
    const file = event.target.files?.[0];
    if (!file) return;

    this.backup.restoreBackup(file).then(
      () => {
        this.snack.open('Backup restaurado exitosamente', '', { duration: 2000 });
        location.reload();
      },
      (error) => {
        this.snack.open(`Error: ${error.message}`, '', { duration: 3000 });
      }
    );
  }

  // Import methods
  importProductos(event: any) {
    const file = event.target.files?.[0];
    if (!file) return;

    this.impexp.importProductosJSON(file).then(
      () => {
        this.snack.open('Productos importados', '', { duration: 2000 });
      },
      (error) => {
        this.snack.open(`Error: ${error.message}`, '', { duration: 3000 });
      }
    );
  }

  importClientess(event: any) {
    const file = event.target.files?.[0];
    if (!file) return;

    this.impexp.importClientesJSON(file).then(
      () => {
        this.snack.open('Clientes importados', '', { duration: 2000 });
      },
      (error) => {
        this.snack.open(`Error: ${error.message}`, '', { duration: 3000 });
      }
    );
  }

  importInsumoss(event: any) {
    const file = event.target.files?.[0];
    if (!file) return;

    this.impexp.importInsumosJSON(file).then(
      () => {
        this.snack.open('Insumos importados', '', { duration: 2000 });
      },
      (error) => {
        this.snack.open(`Error: ${error.message}`, '', { duration: 3000 });
      }
    );
  }

  async exportAllZip() {
    this.snack.open('Generando archivo...', '', { duration: 1000 });
    await this.impexp.exportAllAsZIP();
    this.snack.open('Descarga completa', '', { duration: 2000 });
  }

  // Audit methods
  applyAuditFilters() {
    // Filtros ya se aplican automáticamente
  }

  resetAuditFilters() {
    this.auditFilters = {};
  }

  // Report methods
  generateAndDownloadReport(reportType: string, format: 'PDF' | 'Excel' | 'CSV') {
    let report;

    switch (reportType) {
      case 'daily-sales':
        report = this.reports.generateDailySalesReport();
        break;
      case 'pl-statement':
        report = this.reports.generatePLStatement();
        break;
      case 'product-perf':
        report = this.reports.generateProductPerformance();
        break;
      case 'customer-anal':
        report = this.reports.generateCustomerAnalysis();
        break;
      case 'inventory-val':
        report = this.reports.generateInventoryValuation();
        break;
      default:
        return;
    }

    if (format === 'PDF') {
      this.reports.exportToPDF(report);
    } else if (format === 'Excel') {
      this.reports.exportToExcel(report);
    } else if (format === 'CSV') {
      const csv = this.reports.exportToCSV(report);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${report.titulo}-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    }

    this.snack.open(`Reporte generado: ${report.titulo}`, '', { duration: 2000 });
  }
}
