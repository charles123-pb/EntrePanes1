import { Component, inject, computed, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, DecimalPipe }            from '@angular/common';
import { FormsModule }                          from '@angular/forms';
import { MatButtonModule }    from '@angular/material/button';
import { MatIconModule }      from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule }     from '@angular/material/input';
import { MatSelectModule }    from '@angular/material/select';
import { MatCheckboxModule }  from '@angular/material/checkbox';
import { MatSnackBar }        from '@angular/material/snack-bar';
import { AppStateService }    from '../../core/services/app-state.service';
import { Compra, CompraItem } from '../../core/models/models';

@Component({
  selector: 'ep-compras',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, DecimalPipe, FormsModule, MatButtonModule, MatIconModule,
            MatFormFieldModule, MatInputModule, MatSelectModule, MatCheckboxModule],
  template: `
    <div class="space-y-6 animate-slide-up">

      <div class="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 class="ep-section-title">Compras</h1>
          <p class="text-stone-500 text-sm mt-1">Registro de compras a proveedores</p>
        </div>
        <button mat-flat-button color="primary" (click)="showForm.set(true)">
          <mat-icon>add</mat-icon> Nueva Compra
        </button>
      </div>

      <!-- KPIs -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div class="ep-card p-4 border-l-4 border-l-blue-500">
          <div class="text-stone-500 text-xs font-black tracking-widest mb-1">TOTAL COMPRAS</div>
          <div class="font-display text-3xl text-blue-400">S/ {{ totalCompras() | number:'1.0-0' }}</div>
        </div>
        <div class="ep-card p-4 border-l-4 border-l-amber-500">
          <div class="text-stone-500 text-xs font-black tracking-widest mb-1">N° COMPRAS</div>
          <div class="font-display text-3xl text-amber-400">{{ store.compras().length }}</div>
        </div>
        <div class="ep-card p-4 border-l-4 border-l-emerald-500">
          <div class="text-stone-500 text-xs font-black tracking-widest mb-1">EN SIRE</div>
          <div class="font-display text-3xl text-emerald-400">{{ enSire() }}</div>
        </div>
        <div class="ep-card p-4 border-l-4 border-l-orange-500">
          <div class="text-stone-500 text-xs font-black tracking-widest mb-1">FÍSICOS PENDIENTES</div>
          <div class="font-display text-3xl text-orange-400">{{ noSire() }}</div>
        </div>
      </div>

      <!-- Table -->
      <div class="ep-card overflow-x-auto">
        <div class="px-4 py-3 border-b border-stone-800 flex gap-3 items-center">
          <span class="text-stone-300 font-black text-sm tracking-wider flex-1">HISTORIAL DE COMPRAS</span>
          <input type="month"
            class="bg-stone-800 border border-stone-700 rounded-sm px-2 py-1 text-xs text-stone-300 focus:outline-none focus:border-amber-500"
            [(ngModel)]="mesFiltro" />
        </div>
        <table class="w-full text-xs">
          <thead class="bg-stone-800/60">
            <tr>
              @for (h of ['#','FECHA','PROVEEDOR','COMPROBANTE','TOTAL','TIPO PROV.','SIRE','ITEMS','ACCIONES']; track h) {
                <th class="px-3 py-2.5 text-left text-stone-500 font-black tracking-widest whitespace-nowrap">{{ h }}</th>
              }
            </tr>
          </thead>
          <tbody>
            @for (c of comprasFiltradas(); track c.id) {
              <tr class="border-b border-stone-800/40 hover:bg-stone-800/20 transition-colors">
                <td class="px-3 py-2.5 text-stone-600 font-mono">#{{ c.id }}</td>
                <td class="px-3 py-2.5 text-stone-400 font-mono">{{ c.fecha }}</td>
                <td class="px-3 py-2.5 text-stone-200 font-medium">{{ store.provNombre(c.prov_id) }}</td>
                <td class="px-3 py-2.5 text-stone-300 font-mono">{{ c.comprobante }}</td>
                <td class="px-3 py-2.5 text-blue-400 font-black">S/ {{ c.total | number:'1.2-2' }}</td>
                <td class="px-3 py-2.5">
                  <span class="ep-badge"
                    [ngClass]="c.tipo_proveedor === 'electronico' ? 'bg-emerald-900/60 text-emerald-400' : 'bg-stone-800 text-stone-400'">
                    {{ c.tipo_proveedor }}
                  </span>
                </td>
                <td class="px-3 py-2.5">
                  <span class="ep-badge" [ngClass]="c.en_sire ? 'bg-blue-900/60 text-blue-400' : 'bg-stone-800 text-stone-500'">
                    {{ c.en_sire ? 'SIRE' : 'NO' }}
                  </span>
                </td>
                <td class="px-3 py-2.5 text-stone-400">{{ c.items.length }}</td>
                <td class="px-3 py-2.5">
                  <button mat-icon-button class="!w-7 !h-7 text-stone-500 hover:text-amber-400" (click)="verDetalle(c)">
                    <mat-icon class="!text-sm">visibility</mat-icon>
                  </button>
                </td>
              </tr>
            }
            @empty {
              <tr><td colspan="9" class="text-center py-10 text-stone-600">Sin compras este período</td></tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Nueva compra form modal -->
      @if (showForm()) {
        <div class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" (click)="showForm.set(false)">
          <div class="ep-card w-full max-w-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto" (click)="$event.stopPropagation()">
            <h2 class="ep-section-title text-xl">Nueva Compra</h2>

            <div class="grid grid-cols-2 gap-3">
              <mat-form-field appearance="outline">
                <mat-label>Proveedor</mat-label>
                <mat-select [(ngModel)]="nf.prov_id">
                  @for (p of store.proveedores(); track p.id) { <mat-option [value]="p.id">{{ p.nombre }}</mat-option> }
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Fecha</mat-label>
                <input matInput type="date" [(ngModel)]="nf.fecha" />
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Tipo comprobante</mat-label>
                <mat-select [(ngModel)]="nf.tipo_comp">
                  <mat-option value="factura">Factura</mat-option>
                  <mat-option value="boleta">Boleta</mat-option>
                  <mat-option value="ticket">Ticket</mat-option>
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>N° Comprobante</mat-label>
                <input matInput [(ngModel)]="nf.comprobante" />
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Tipo proveedor</mat-label>
                <mat-select [(ngModel)]="nf.tipo_proveedor">
                  <mat-option value="electronico">Electrónico</mat-option>
                  <mat-option value="fisico">Físico</mat-option>
                </mat-select>
              </mat-form-field>
              <div class="flex items-center gap-2 pt-2">
                <mat-checkbox [(ngModel)]="nf.en_sire" color="primary">Ingresado en SIRE</mat-checkbox>
              </div>
            </div>

            <!-- Items -->
            <div>
              <div class="text-stone-400 font-black text-xs tracking-widest mb-2">ÍTEMS</div>
              <div class="space-y-2">
                @for (item of nf.items; track $index; let i = $index) {
                  <div class="grid grid-cols-12 gap-2 items-center">
                    <mat-form-field appearance="outline" class="col-span-4 ep-field-compact">
                      <mat-select [(ngModel)]="item.ins_id" (ngModelChange)="onInsChange($event, item)" placeholder="Insumo">
                        @for (ins of store.insumos(); track ins.id) { <mat-option [value]="ins.id">{{ ins.nombre }}</mat-option> }
                      </mat-select>
                    </mat-form-field>
                    <mat-form-field appearance="outline" class="col-span-3 ep-field-compact">
                      <input matInput type="number" placeholder="Cant." [(ngModel)]="item.cant" (ngModelChange)="recalcItem(item)" />
                    </mat-form-field>
                    <mat-form-field appearance="outline" class="col-span-3 ep-field-compact">
                      <input matInput type="number" placeholder="P.U." [(ngModel)]="item.pu" (ngModelChange)="recalcItem(item)" />
                    </mat-form-field>
                    <span class="col-span-1 text-amber-400 font-black text-xs text-right">S/ {{ item.sub | number:'1.2-2' }}</span>
                    <button mat-icon-button class="col-span-1 !w-7 !h-7 text-stone-600 hover:text-red-400" (click)="removeNfItem(i)">
                      <mat-icon class="!text-sm">close</mat-icon>
                    </button>
                  </div>
                }
              </div>
              <button mat-stroked-button class="mt-2 text-xs" (click)="addNfItem()">
                <mat-icon>add</mat-icon> Agregar ítem
              </button>
            </div>

            <div class="flex justify-between items-center border-t border-stone-700 pt-3">
              <span class="text-stone-400 font-black">TOTAL: <span class="text-amber-400 font-display text-2xl ml-2">S/ {{ nfTotal() | number:'1.2-2' }}</span></span>
              <div class="flex gap-3">
                <button mat-stroked-button (click)="showForm.set(false)">Cancelar</button>
                <button mat-flat-button color="primary" (click)="saveCompra()">Registrar</button>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- Detalle modal -->
      @if (detalleCompra()) {
        <div class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" (click)="detalleCompra.set(null)">
          <div class="ep-card w-full max-w-lg p-6 space-y-4" (click)="$event.stopPropagation()">
            <h2 class="font-display text-xl text-amber-400">Detalle Compra #{{ detalleCompra()!.id }}</h2>
            <div class="text-xs text-stone-400 space-y-1">
              <div>Proveedor: <span class="text-stone-200">{{ store.provNombre(detalleCompra()!.prov_id) }}</span></div>
              <div>Fecha: <span class="text-stone-200">{{ detalleCompra()!.fecha }}</span></div>
              <div>Comprobante: <span class="text-stone-200 font-mono">{{ detalleCompra()!.comprobante }}</span></div>
            </div>
            <table class="w-full text-xs">
              <thead><tr>
                <th class="text-left text-stone-500 py-1 font-black">INSUMO</th>
                <th class="text-right text-stone-500 py-1 font-black">CANT</th>
                <th class="text-right text-stone-500 py-1 font-black">P.U.</th>
                <th class="text-right text-stone-500 py-1 font-black">SUBTOTAL</th>
              </tr></thead>
              <tbody>
                @for (it of detalleCompra()!.items; track it.ins_id) {
                  <tr class="border-t border-stone-800">
                    <td class="py-1.5 text-stone-200">{{ it.nombre }}</td>
                    <td class="py-1.5 text-stone-300 text-right font-mono">{{ it.cant }}</td>
                    <td class="py-1.5 text-stone-300 text-right font-mono">S/ {{ it.pu | number:'1.2-2' }}</td>
                    <td class="py-1.5 text-amber-400 text-right font-black font-mono">S/ {{ it.sub | number:'1.2-2' }}</td>
                  </tr>
                }
              </tbody>
              <tfoot><tr class="border-t border-stone-700">
                <td colspan="3" class="py-2 text-stone-400 font-black">TOTAL</td>
                <td class="py-2 text-amber-400 font-display text-xl text-right">S/ {{ detalleCompra()!.total | number:'1.2-2' }}</td>
              </tr></tfoot>
            </table>
            <button mat-stroked-button class="w-full" (click)="detalleCompra.set(null)">Cerrar</button>
          </div>
        </div>
      }

    </div>
  `,
  styles: [`::ng-deep .ep-field-compact .mat-mdc-form-field-infix { padding-top:8px !important; padding-bottom:8px !important; min-height:36px !important; }`]
})
export class ComprasComponent {
  store  = inject(AppStateService);
  private snack = inject(MatSnackBar);

  showForm     = signal(false);
  detalleCompra = signal<Compra | null>(null);
  mesFiltro    = new Date().toISOString().slice(0,7);

  nf: {
    prov_id: number; fecha: string; tipo_comp: string;
    comprobante: string; tipo_proveedor: string; en_sire: boolean;
    items: CompraItem[];
  } = this.emptyForm();

  emptyForm() {
    return {
      prov_id: 1, fecha: this.store.todayStr(), tipo_comp: 'factura',
      comprobante: '', tipo_proveedor: 'electronico', en_sire: false,
      items: [{ ins_id: 1, nombre: '', cant: 1, pu: 0, sub: 0 }],
    };
  }

  totalCompras  = computed(() => this.store.compras().reduce((s,c) => s + c.total, 0));
  enSire  = computed(() => this.store.compras().filter(c => c.en_sire).length);
  noSire  = computed(() => this.store.compras().filter(c => !c.en_sire && c.tipo_proveedor === 'fisico').length);
  nfTotal = computed(() => this.nf.items.reduce((s,i) => s + i.sub, 0));

  comprasFiltradas = computed(() =>
    [...this.store.compras()]
      .filter(c => c.fecha.startsWith(this.mesFiltro))
      .reverse()
  );

  onInsChange(id: number, item: CompraItem) {
    const ins = this.store.insumos().find(i => i.id === id);
    if (ins) { item.nombre = ins.nombre; item.pu = ins.costo; this.recalcItem(item); }
  }
  recalcItem(item: CompraItem) { item.sub = Math.round(item.cant * item.pu * 100) / 100; }
  addNfItem()     { this.nf.items = [...this.nf.items, { ins_id: 1, nombre: '', cant: 1, pu: 0, sub: 0 }]; }
  removeNfItem(i: number) { this.nf.items = this.nf.items.filter((_,idx) => idx !== i); }

  saveCompra() {
    if (!this.nf.prov_id || this.nf.items.length === 0) return;
    const compra: Compra = {
      id: this.store.nextId(this.store.compras()),
      fecha: this.nf.fecha,
      prov_id: this.nf.prov_id,
      total: this.nfTotal(),
      comprobante: this.nf.comprobante,
      tipo_comp: this.nf.tipo_comp as any,
      en_sire: this.nf.en_sire,
      tipo_proveedor: this.nf.tipo_proveedor as any,
      items: this.nf.items.filter(i => i.cant > 0),
    };
    this.store.addCompra(compra);
    // Update stock
    const insumos = this.store.insumos().map(ins => {
      const item = compra.items.find(i => i.ins_id === ins.id);
      return item ? { ...ins, stock: ins.stock + item.cant } : ins;
    });
    this.store.updateInsumos(insumos);
    this.snack.open(`✓ Compra registrada — S/ ${compra.total.toFixed(2)}`, '', { duration: 2500 });
    this.nf = this.emptyForm();
    this.showForm.set(false);
  }

  verDetalle(c: Compra) { this.detalleCompra.set(c); }
}
