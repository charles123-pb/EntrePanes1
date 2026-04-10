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
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { AppStateService }    from '../../core/services/app-state.service';
import { Insumo }             from '../../core/models/models';

@Component({
  selector: 'ep-inventario',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, DecimalPipe, FormsModule, MatButtonModule, MatIconModule,
            MatFormFieldModule, MatInputModule, MatSelectModule, MatTabsModule, MatDialogModule],
  template: `
    <div class="space-y-6 animate-slide-up">

      <div class="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 class="ep-section-title">Inventario</h1>
          <p class="text-stone-500 text-sm mt-1">Gestión de insumos y stock</p>
        </div>
        <button mat-flat-button color="primary" (click)="openForm()">
          <mat-icon>add</mat-icon> Nuevo Insumo
        </button>
      </div>

      <!-- KPIs -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div class="ep-card p-4 border-l-4 border-l-amber-500">
          <div class="text-stone-500 text-xs font-black tracking-widest mb-1">TOTAL INSUMOS</div>
          <div class="font-display text-3xl text-amber-400">{{ store.insumos().length }}</div>
        </div>
        <div class="ep-card p-4 border-l-4 border-l-red-500">
          <div class="text-stone-500 text-xs font-black tracking-widest mb-1">SIN STOCK</div>
          <div class="font-display text-3xl text-red-400">{{ sinStock().length }}</div>
        </div>
        <div class="ep-card p-4 border-l-4 border-l-amber-500">
          <div class="text-stone-500 text-xs font-black tracking-widest mb-1">STOCK BAJO</div>
          <div class="font-display text-3xl text-amber-400">{{ stockBajo().length }}</div>
        </div>
        <div class="ep-card p-4 border-l-4 border-l-emerald-500">
          <div class="text-stone-500 text-xs font-black tracking-widest mb-1">VALOR INVENTARIO</div>
          <div class="font-display text-2xl text-emerald-400">S/ {{ valorTotal() | number:'1.0-0' }}</div>
        </div>
      </div>

      <!-- Search + filter -->
      <div class="flex gap-3 flex-wrap">
        <mat-form-field appearance="outline" class="flex-1 min-w-48 ep-field-compact">
          <mat-icon matPrefix class="text-stone-500">search</mat-icon>
          <input matInput placeholder="Buscar insumo…" [(ngModel)]="searchQ" />
        </mat-form-field>
        <div class="flex gap-2">
          @for (f of filters; track f.val) {
            <button class="px-3 py-1.5 text-xs font-black tracking-wider rounded-sm border transition-all"
              [ngClass]="filterSel === f.val ? 'bg-amber-500 border-amber-500 text-stone-900' : 'border-stone-700 text-stone-400 hover:border-amber-500'"
              (click)="filterSel = f.val">{{ f.label }}</button>
          }
        </div>
      </div>

      <!-- Table -->
      <div class="ep-card overflow-x-auto">
        <table class="w-full text-xs">
          <thead class="bg-stone-800/60">
            <tr>
              @for (h of ['INSUMO','UNIDAD','STOCK','STOCK MÍN','COSTO UNIT.','VALOR','PROVEEDOR','ESTADO','ACCIONES']; track h) {
                <th class="px-3 py-2.5 text-left text-stone-500 font-black tracking-widest whitespace-nowrap">{{ h }}</th>
              }
            </tr>
          </thead>
          <tbody>
            @for (ins of filtered(); track ins.id) {
              <tr class="border-b border-stone-800/40 hover:bg-stone-800/20 transition-colors">
                <td class="px-3 py-2.5 text-stone-200 font-medium">{{ ins.nombre }}</td>
                <td class="px-3 py-2.5 text-stone-400">{{ ins.unidad }}</td>
                <td class="px-3 py-2.5 font-black font-mono"
                    [ngClass]="ins.stock <= 0 ? 'text-red-400' : ins.stock < ins.stock_min ? 'text-amber-400' : 'text-emerald-400'">
                  {{ ins.stock | number:'1.0-3' }}
                </td>
                <td class="px-3 py-2.5 text-stone-400 font-mono">{{ ins.stock_min }}</td>
                <td class="px-3 py-2.5 text-stone-300 font-mono">S/ {{ ins.costo | number:'1.2-2' }}</td>
                <td class="px-3 py-2.5 text-stone-300 font-mono">S/ {{ (ins.stock * ins.costo) | number:'1.2-2' }}</td>
                <td class="px-3 py-2.5 text-stone-400">{{ store.provNombre(ins.prov_id) }}</td>
                <td class="px-3 py-2.5">
                  <span class="ep-badge" [ngClass]="statusCls(ins)">{{ statusLabel(ins) }}</span>
                </td>
                <td class="px-3 py-2.5 flex gap-1">
                  <button mat-icon-button class="!w-7 !h-7 text-stone-500 hover:text-amber-400" (click)="openForm(ins)">
                    <mat-icon class="!text-sm">edit</mat-icon>
                  </button>
                  <button mat-icon-button class="!w-7 !h-7 text-stone-500 hover:text-blue-400" (click)="openAjuste(ins)">
                    <mat-icon class="!text-sm">tune</mat-icon>
                  </button>
                </td>
              </tr>
            }
            @empty {
              <tr><td colspan="9" class="text-center py-10 text-stone-600">Sin insumos</td></tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Kardex -->
      <div class="ep-card">
        <div class="px-4 py-3 border-b border-stone-800 flex justify-between items-center">
          <span class="text-stone-300 font-black text-sm tracking-wider">KARDEX — ÚLTIMOS MOVIMIENTOS</span>
          <mat-form-field appearance="outline" class="w-52 ep-field-compact">
            <mat-select [(ngModel)]="kardexIns" placeholder="Todos los insumos">
              <mat-option [value]="0">Todos</mat-option>
              @for (ins of store.insumos(); track ins.id) {
                <mat-option [value]="ins.id">{{ ins.nombre }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-xs">
            <thead class="bg-stone-800/60">
              <tr>
                @for (h of ['FECHA','INSUMO','TIPO','CANT','STOCK ANT.','STOCK NUEVO','COSTO U.','MOTIVO','REF']; track h) {
                  <th class="px-3 py-2.5 text-left text-stone-500 font-black tracking-widest whitespace-nowrap">{{ h }}</th>
                }
              </tr>
            </thead>
            <tbody>
              @for (k of kardexFiltrado(); track k.id) {
                <tr class="border-b border-stone-800/40 hover:bg-stone-800/20">
                  <td class="px-3 py-2.5 text-stone-400 font-mono">{{ k.fecha.slice(0,16) }}</td>
                  <td class="px-3 py-2.5 text-stone-200">{{ insNombre(k.ins_id) }}</td>
                  <td class="px-3 py-2.5">
                    <span class="ep-badge"
                      [ngClass]="k.tipo === 'entrada' ? 'bg-emerald-900/60 text-emerald-400' : k.tipo === 'merma' ? 'bg-amber-900/60 text-amber-400' : 'bg-blue-900/60 text-blue-400'">
                      {{ k.tipo }}
                    </span>
                  </td>
                  <td class="px-3 py-2.5 font-mono" [ngClass]="k.tipo === 'entrada' ? 'text-emerald-400' : 'text-red-400'">
                    {{ k.tipo === 'entrada' ? '+' : '−' }}{{ k.cant | number:'1.0-3' }}
                  </td>
                  <td class="px-3 py-2.5 text-stone-400 font-mono">{{ k.stock_antes | number:'1.0-3' }}</td>
                  <td class="px-3 py-2.5 text-stone-300 font-mono">{{ k.stock_despues | number:'1.0-3' }}</td>
                  <td class="px-3 py-2.5 text-stone-400 font-mono">S/ {{ k.costo_u | number:'1.2-2' }}</td>
                  <td class="px-3 py-2.5 text-stone-400">{{ k.motivo }}</td>
                  <td class="px-3 py-2.5 text-stone-500">{{ k.ref }}</td>
                </tr>
              }
              @empty {
                <tr><td colspan="9" class="text-center py-8 text-stone-600">Sin movimientos</td></tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Inline form modal (simplified) -->
      @if (showForm()) {
        <div class="fixed inset-0 bg-black/70 flex items-center justify-center z-50" (click)="showForm.set(false)">
          <div class="ep-card w-full max-w-md p-6 space-y-4" (click)="$event.stopPropagation()">
            <h2 class="ep-section-title text-xl">{{ editItem() ? 'Editar' : 'Nuevo' }} Insumo</h2>
            <div class="grid grid-cols-2 gap-3">
              <mat-form-field appearance="outline" class="col-span-2">
                <mat-label>Nombre</mat-label>
                <input matInput [(ngModel)]="form.nombre" />
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Unidad</mat-label>
                <mat-select [(ngModel)]="form.unidad">
                  @for (u of ['kg','g','L','ml','unid.']; track u) { <mat-option [value]="u">{{ u }}</mat-option> }
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Costo unit.</mat-label>
                <input matInput type="number" [(ngModel)]="form.costo" />
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Stock actual</mat-label>
                <input matInput type="number" [(ngModel)]="form.stock" />
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Stock mínimo</mat-label>
                <input matInput type="number" [(ngModel)]="form.stock_min" />
              </mat-form-field>
              <mat-form-field appearance="outline" class="col-span-2">
                <mat-label>Proveedor</mat-label>
                <mat-select [(ngModel)]="form.prov_id">
                  @for (p of store.proveedores(); track p.id) { <mat-option [value]="p.id">{{ p.nombre }}</mat-option> }
                </mat-select>
              </mat-form-field>
            </div>
            <div class="flex gap-3 justify-end">
              <button mat-stroked-button (click)="showForm.set(false)">Cancelar</button>
              <button mat-flat-button color="primary" (click)="saveInsumo()">Guardar</button>
            </div>
          </div>
        </div>
      }

    </div>
  `,
  styles: [`::ng-deep .ep-field-compact .mat-mdc-form-field-infix { padding-top: 8px !important; padding-bottom: 8px !important; min-height: 36px !important; }`]
})
export class InventarioComponent {
  store  = inject(AppStateService);
  private snack = inject(MatSnackBar);

  searchQ   = '';
  filterSel = 'todos';
  kardexIns = 0;
  showForm  = signal(false);
  editItem  = signal<Insumo | null>(null);

  filters = [
    { val:'todos',    label:'TODOS' },
    { val:'critico',  label:'CRÍTICO' },
    { val:'bajo',     label:'BAJO' },
    { val:'ok',       label:'OK' },
  ];

  form: Partial<Insumo> = { nombre:'', unidad:'kg', costo:0, stock:0, stock_min:0, prov_id:1 };

  sinStock  = computed(() => this.store.insumos().filter(i => i.stock <= 0));
  stockBajo = computed(() => this.store.insumos().filter(i => i.stock > 0 && i.stock < i.stock_min));
  valorTotal = computed(() => this.store.insumos().reduce((s,i) => s + i.stock * i.costo, 0));

  filtered = computed(() => {
    const q = this.searchQ.toLowerCase();
    return this.store.insumos().filter(i => {
      if (q && !i.nombre.toLowerCase().includes(q)) return false;
      if (this.filterSel === 'critico') return i.stock <= i.stock_min * 0.5;
      if (this.filterSel === 'bajo')    return i.stock > i.stock_min * 0.5 && i.stock < i.stock_min;
      if (this.filterSel === 'ok')      return i.stock >= i.stock_min;
      return true;
    });
  });

  kardexFiltrado = computed(() => {
    const k = [...this.store.kardex()].reverse();
    return this.kardexIns ? k.filter(e => e.ins_id === this.kardexIns) : k.slice(0, 50);
  });

  insNombre(id: number) { return this.store.insumos().find(i => i.id === id)?.nombre ?? '—'; }

  statusLabel(i: Insumo) { return this.store.estadoStock(i.stock, i.stock_min).label; }
  statusCls(i: Insumo) {
    const s = i.stock;
    const m = i.stock_min;
    if (s <= 0)         return 'bg-red-900/60 text-red-400';
    if (s <= m * 0.5)   return 'bg-red-800/60 text-red-300';
    if (s < m)          return 'bg-amber-900/60 text-amber-400';
    return 'bg-emerald-900/60 text-emerald-400';
  }

  openForm(ins?: Insumo) {
    this.editItem.set(ins ?? null);
    this.form = ins ? { ...ins } : { nombre:'', unidad:'kg', costo:0, stock:0, stock_min:0, prov_id:1 };
    this.showForm.set(true);
  }

  saveInsumo() {
    const insumos = this.store.insumos();
    if (this.editItem()) {
      const updated = insumos.map(i => i.id === this.editItem()!.id ? { ...i, ...this.form } as Insumo : i);
      this.store.updateInsumos(updated);
      this.snack.open('Insumo actualizado', '', { duration: 2000 });
    } else {
      const nuevo: Insumo = { ...this.form as Insumo, id: this.store.nextId(insumos) };
      this.store.updateInsumos([...insumos, nuevo]);
      this.snack.open('Insumo creado', '', { duration: 2000 });
    }
    this.showForm.set(false);
  }

  openAjuste(ins: Insumo) {
    const cantStr = prompt(`Ajuste de stock para "${ins.nombre}" (actual: ${ins.stock} ${ins.unidad})\nIngresa el nuevo stock:`);
    if (cantStr === null) return;
    const cant = parseFloat(cantStr);
    if (isNaN(cant)) return;
    const insumos = this.store.insumos().map(i => i.id === ins.id ? { ...i, stock: cant } : i);
    this.store.updateInsumos(insumos);
    this.store.addKardex({
      id: this.store.nextId(this.store.kardex()),
      fecha: this.store.nowStr(), ins_id: ins.id,
      tipo: 'ajuste', cant: Math.abs(cant - ins.stock),
      stock_antes: ins.stock, stock_despues: cant,
      costo_u: ins.costo, costo_total: 0,
      motivo: 'Ajuste manual', ref: 'Manual', num_comp: '', tipo_comp: '',
    });
    this.snack.open(`Stock de ${ins.nombre} ajustado a ${cant}`, '', { duration: 2000 });
  }
}
