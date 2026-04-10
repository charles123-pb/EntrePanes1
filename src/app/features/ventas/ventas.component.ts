import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule, DecimalPipe }            from '@angular/common';
import { FormsModule }                          from '@angular/forms';
import { MatButtonModule }     from '@angular/material/button';
import { MatIconModule }       from '@angular/material/icon';
import { MatFormFieldModule }  from '@angular/material/form-field';
import { MatInputModule }      from '@angular/material/input';
import { MatSelectModule }     from '@angular/material/select';
import { MatTabsModule }       from '@angular/material/tabs';
import { MatChipsModule }      from '@angular/material/chips';
import { MatDividerModule }    from '@angular/material/divider';
import { MatSnackBar }         from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { AppStateService }     from '../../core/services/app-state.service';
import { AuthService }         from '../../core/services/auth.service';
import { PrintService }        from '../../core/services/print.service';
import { CAT_ACCENT } from '../../core/constants/constants';
import { Venta, VentaItem, TipoComprobante, MetodoPago } from '../../core/models/models';
import { VentaClienteDialogComponent, DatosClienteResult } from './venta-cliente.dialog';
import { PagoDigitalDialogComponent, PagoDigitalResult } from './pago-digital.dialog';

@Component({
  selector: 'ep-ventas',
  standalone: true,
  imports: [
    CommonModule, DecimalPipe, FormsModule,
    MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatTabsModule, MatChipsModule, MatDividerModule,
    MatDialogModule,
  ],
  template: `
    <div class="flex gap-4 h-[calc(100vh-6rem)] animate-slide-up">

      <!-- ── LEFT: Catálogo ── -->
      <div class="flex-1 flex flex-col min-w-0 ep-card">

        <!-- Search + filter -->
        <div class="p-3 border-b border-stone-800 flex gap-2">
          <mat-form-field appearance="outline" class="flex-1 ep-field-compact">
            <mat-icon matPrefix class="text-stone-500">search</mat-icon>
            <input matInput placeholder="Buscar producto…" [(ngModel)]="searchQ" />
          </mat-form-field>
          <mat-form-field appearance="outline" class="w-36 ep-field-compact">
            <mat-select [(ngModel)]="catFilter" placeholder="Categoría">
              <mat-option value="">Todas</mat-option>
              @for (c of store.categorias(); track c) {
                <mat-option [value]="c">{{ c }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
        </div>

        <!-- Category tabs -->
        <div class="flex gap-1.5 px-3 py-2 border-b border-stone-800 overflow-x-auto">
          <button
            class="px-3 py-1 text-xs font-black tracking-wider rounded-sm border transition-all whitespace-nowrap"
            [ngClass]="catFilter === '' ? 'bg-amber-500 border-amber-500 text-stone-900' : 'border-stone-700 text-stone-400 hover:border-amber-500 hover:text-amber-400'"
            (click)="catFilter = ''">
            TODAS
          </button>
          @for (cat of store.categorias(); track cat; let i = $index) {
            <button
              class="px-3 py-1 text-xs font-black tracking-wider rounded-sm border transition-all whitespace-nowrap"
              [ngClass]="catFilter === cat ? accent(i).bar + ' border-transparent text-stone-900' : 'border-stone-700 text-stone-400 ' + accent(i).ring"
              (click)="catFilter = cat">
              <mat-icon class="!text-xs">restaurant_menu</mat-icon> {{ cat }}
            </button>
          }
        </div>

        <!-- Products grid -->
        <div class="flex-1 overflow-y-auto p-3 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2 content-start">
          @for (prod of filteredProds(); track prod.id) {
            <button
              class="group ep-card border hover:border-amber-500/60 text-left transition-all p-0 overflow-hidden active:scale-95"
              (click)="addItem(prod)">
              <div class="h-1 w-full" [ngClass]="accent(catIdx(prod.cat)).bar"></div>
              <!-- Imagen del producto -->
              <div class="relative w-full h-20 bg-stone-800 flex items-center justify-center overflow-hidden">
                @if (prod.imagenUrl) {
                  <img [src]="prod.imagenUrl" alt="{{ prod.nombre }}" class="w-full h-full object-cover">
                } @else {
                  <mat-icon class="!text-2xl text-stone-600">image</mat-icon>
                }
              </div>
              <div class="p-3">
                <div class="text-stone-200 text-sm font-medium leading-snug mb-2">{{ prod.nombre }}</div>
                <div class="text-amber-400 font-display text-xl">S/ {{ prod.precio }}</div>
              </div>
            </button>
          }
          @empty {
            <div class="col-span-4 text-center py-12 text-stone-600">Sin productos en esta categoría</div>
          }
        </div>
      </div>

      <!-- ── RIGHT: Orden ── -->
      <div class="w-80 flex flex-col ep-card flex-shrink-0">

        <!-- Header -->
        <div class="px-4 py-3 border-b border-stone-800 flex justify-between items-center">
          <span class="text-stone-300 font-black tracking-wider">ORDEN</span>
          <button mat-icon-button (click)="clearOrder()" class="text-stone-600 hover:text-red-400" matTooltip="Limpiar">
            <mat-icon>delete_sweep</mat-icon>
          </button>
        </div>

        <!-- Items -->
        <div class="flex-1 overflow-y-auto divide-y divide-stone-800/60">
          @for (item of orderItems(); track item.id) {
            <div class="px-3 py-2.5 flex items-start gap-2">
              <div class="flex-1 min-w-0">
                <div class="text-stone-200 text-sm truncate">{{ item.nombre }}</div>
                <div class="text-stone-500 text-xs">S/ {{ item.pu | number:'1.2-2' }} c/u</div>
              </div>
              <div class="flex items-center gap-1.5 flex-shrink-0">
                <button mat-mini-fab color="basic" class="!w-6 !h-6 !min-h-0 !shadow-none bg-stone-800 text-stone-300 hover:text-amber-400 text-xs"
                  (click)="decItem(item)">−</button>
                <span class="text-stone-200 font-black w-5 text-center text-sm">{{ item.cant }}</span>
                <button mat-mini-fab color="basic" class="!w-6 !h-6 !min-h-0 !shadow-none bg-stone-800 text-stone-300 hover:text-amber-400 text-xs"
                  (click)="incItem(item)">+</button>
                <span class="text-amber-400 font-black text-sm w-14 text-right">S/ {{ item.sub | number:'1.2-2' }}</span>
                <button mat-icon-button class="!w-6 !h-6 text-stone-600 hover:text-red-400" (click)="removeItem(item)">
                  <mat-icon class="!text-sm">close</mat-icon>
                </button>
              </div>
            </div>
          }
          @empty {
            <div class="flex flex-col items-center justify-center h-32 text-stone-700">
              <mat-icon class="!text-4xl mb-2">shopping_cart</mat-icon>
              <span class="text-xs">Agrega productos</span>
            </div>
          }
        </div>

        <!-- Totals + checkout -->
        <div class="border-t border-stone-800 p-4 space-y-3">

          <!-- Descuento -->
          <div class="flex items-center gap-2">
            <span class="text-stone-500 text-xs flex-1">Descuento (S/)</span>
            <input type="number" min="0"
              class="w-20 bg-stone-800 border border-stone-700 rounded-sm px-2 py-1 text-sm text-stone-200 text-right focus:outline-none focus:border-amber-500"
              [(ngModel)]="descuento" />
          </div>

          <!-- Totals -->
          <div class="space-y-1 text-xs">
            <div class="flex justify-between text-stone-400">
              <span>Subtotal</span><span>S/ {{ subtotal() | number:'1.2-2' }}</span>
            </div>
            @if (descuento > 0) {
              <div class="flex justify-between text-green-400">
                <span>Descuento</span><span>−S/ {{ descuento | number:'1.2-2' }}</span>
              </div>
            }
            <div class="flex justify-between text-stone-200 font-black text-base pt-1 border-t border-stone-700">
              <span>TOTAL</span><span class="text-amber-400 font-display text-2xl">S/ {{ total() | number:'1.2-2' }}</span>
            </div>
          </div>

          <!-- Comprobante + Método -->
          <div class="grid grid-cols-2 gap-2">
            <mat-form-field appearance="outline" class="ep-field-compact">
              <mat-label>Comprobante</mat-label>
              <mat-select [(ngModel)]="tipoComp">
                <mat-option value="ticket">Ticket</mat-option>
                <mat-option value="boleta">Boleta</mat-option>
                <mat-option value="factura">Factura</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline" class="ep-field-compact">
              <mat-label>Pago</mat-label>
              <mat-select [(ngModel)]="metodoPago">
                <mat-option value="efectivo">Efectivo</mat-option>
                <mat-option value="tarjeta">Tarjeta</mat-option>
                <mat-option value="digital">💳 Digital (Yape/Plin)</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <!-- Efectivo dado -->
          @if (metodoPago === 'efectivo') {
            <div class="flex items-center gap-2">
              <span class="text-stone-500 text-xs flex-1">Efectivo recibido</span>
              <input type="number" min="0"
                class="w-24 bg-stone-800 border border-stone-700 rounded-sm px-2 py-1 text-sm text-stone-200 text-right focus:outline-none focus:border-amber-500"
                [(ngModel)]="efectivoDado" />
            </div>
            @if (efectivoDado >= total() && total() > 0) {
              <div class="flex justify-between text-emerald-400 text-sm font-black">
                <span>VUELTO</span><span>S/ {{ (efectivoDado - total()) | number:'1.2-2' }}</span>
              </div>
            }
          }

          <!-- Cobrar button -->
          <button mat-flat-button color="primary"
            class="w-full !h-12 !font-display !text-xl !tracking-widest"
            [disabled]="orderItems().length === 0 || (metodoPago === 'efectivo' && efectivoDado < total())"
            (click)="cobrar()">
            <mat-icon>point_of_sale</mat-icon>
            COBRAR
          </button>

        </div>
      </div>
    </div>

    <!-- Historial (below) -->
    <div class="mt-6 ep-card animate-slide-up">
      <div class="px-4 py-3 border-b border-stone-800 flex justify-between items-center">
        <span class="text-stone-300 font-black tracking-wider text-sm">HISTORIAL DE VENTAS</span>
        <input type="date" class="bg-stone-800 border border-stone-700 rounded-sm px-2 py-1 text-xs text-stone-300 focus:outline-none focus:border-amber-500"
          [(ngModel)]="fechaFiltro" />
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-xs">
          <thead class="bg-stone-800/60">
            <tr>
              @for (h of ['#','FECHA','COMPROBANTE','ITEMS','TOTAL','MÉTODO','ESTADO','ACCIONES']; track h) {
                <th class="px-3 py-2.5 text-left text-stone-500 font-black tracking-widest whitespace-nowrap">{{ h }}</th>
              }
            </tr>
          </thead>
          <tbody>
            @for (v of ventasFiltradas(); track v.id) {
              <tr class="border-b border-stone-800/40 hover:bg-stone-800/20 transition-colors">
                <td class="px-3 py-2.5 text-stone-600 font-mono">#{{ v.id }}</td>
                <td class="px-3 py-2.5 text-stone-400 font-mono">{{ v.fecha.slice(0,16) }}</td>
                <td class="px-3 py-2.5 text-stone-300">{{ v.comprobante ?? v.tipo_comp }}</td>
                <td class="px-3 py-2.5 text-stone-400">{{ v.items.length }} prod.</td>
                <td class="px-3 py-2.5 text-amber-400 font-black">S/ {{ v.total | number:'1.2-2' }}</td>
                <td class="px-3 py-2.5">
                  <span class="ep-badge" [ngClass]="metodoBadge(v.metodo)">{{ v.metodo }}</span>
                </td>
                <td class="px-3 py-2.5">
                  <span class="ep-badge"
                    [ngClass]="v.estado === 'completada' ? 'bg-emerald-900/60 text-emerald-400' : 'bg-red-900/60 text-red-400'">
                    {{ v.estado }}
                  </span>
                </td>
                <td class="px-3 py-2.5 flex gap-1">
                  <button mat-icon-button class="!w-7 !h-7 text-stone-500 hover:text-amber-400" (click)="print.ticket(v)" matTooltip="Imprimir">
                    <mat-icon class="!text-sm">print</mat-icon>
                  </button>
                  @if (v.estado === 'completada') {
                    <button mat-icon-button class="!w-7 !h-7 text-stone-500 hover:text-red-400" (click)="anularVenta(v)" matTooltip="Anular">
                      <mat-icon class="!text-sm">cancel</mat-icon>
                    </button>
                  }
                </td>
              </tr>
            }
            @empty {
              <tr><td colspan="8" class="text-center py-10 text-stone-600">Sin ventas para esta fecha</td></tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    ::ng-deep .ep-field-compact .mat-mdc-form-field-infix { padding-top: 8px !important; padding-bottom: 8px !important; min-height: 36px !important; }
    ::ng-deep .ep-field-compact .mat-mdc-text-field-wrapper { background: #1c1917 !important; }
    ::ng-deep .ep-field-compact .mdc-notched-outline__leading,
    ::ng-deep .ep-field-compact .mdc-notched-outline__notch,
    ::ng-deep .ep-field-compact .mdc-notched-outline__trailing { border-color: #44403c !important; }
  `]
})
export class VentasComponent {
  store = inject(AppStateService);
  auth = inject(AuthService);
  print = inject(PrintService);
  private snack = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  // Order state
  orderItems = signal<VentaItem[]>([]);
  descuento  = 0;
  tipoComp: TipoComprobante = 'ticket';
  metodoPago: MetodoPago | 'digital'    = 'efectivo';
  efectivoDado = 0;
  searchQ  = '';
  catFilter = '';
  fechaFiltro = new Date().toISOString().split('T')[0];

  // Computed
  subtotal  = computed(() => this.orderItems().reduce((s, i) => s + i.sub, 0));
  total     = computed(() => Math.max(0, this.subtotal() - this.descuento));

  filteredProds = computed(() => {
    const q   = this.searchQ.toLowerCase();
    const cat = this.catFilter;
    return this.store.productos().filter(p =>
      (!q || p.nombre.toLowerCase().includes(q)) &&
      (!cat || p.cat === cat)
    );
  });

  ventasFiltradas = computed(() =>
    [...this.store.ventas()]
      .filter(v => v.fecha.startsWith(this.fechaFiltro))
      .reverse()
  );

  // Catalog helpers
  catIdx(cat: string) { return this.store.categorias().indexOf(cat); }
  accent(i: number)   { return CAT_ACCENT[i % CAT_ACCENT.length] ?? CAT_ACCENT[0]; }

  // Order actions
  addItem(prod: { id:number; nombre:string; precio:number }) {
    this.orderItems.update(items => {
      const ex = items.find(i => i.id === prod.id);
      if (ex) return items.map(i => i.id === prod.id ? { ...i, cant: i.cant+1, sub: (i.cant+1)*i.pu } : i);
      return [...items, { id: prod.id, nombre: prod.nombre, cant: 1, pu: prod.precio, sub: prod.precio }];
    });
  }
  incItem(item: VentaItem) {
    this.orderItems.update(items =>
      items.map(i => i.id === item.id ? { ...i, cant: i.cant+1, sub: (i.cant+1)*i.pu } : i)
    );
  }
  decItem(item: VentaItem) {
    if (item.cant <= 1) { this.removeItem(item); return; }
    this.orderItems.update(items =>
      items.map(i => i.id === item.id ? { ...i, cant: i.cant-1, sub: (i.cant-1)*i.pu } : i)
    );
  }
  removeItem(item: VentaItem) {
    this.orderItems.update(items => items.filter(i => i.id !== item.id));
  }
  clearOrder() {
    this.orderItems.set([]);
    this.descuento = 0;
    this.efectivoDado = 0;
  }

  cobrar() {
    // Si es pago digital (Yape/Plin), abrir modal para elegir
    if (this.metodoPago === 'digital') {
      const dialogRef = this.dialog.open(PagoDigitalDialogComponent, {
        width: '400px',
        maxWidth: '90vw',
        disableClose: true,
      });

      dialogRef.afterClosed().subscribe((result: PagoDigitalResult | null) => {
        if (!result) return; // Canceló el diálogo
        this.metodoPago = result.metodo; // Actualizar método a yape o plin
        // Si es boleta o factura, pedir datos del cliente
        if (this.tipoComp !== 'ticket') {
          this.abrirDialogoCliente();
        } else {
          this.finalizarVenta({});
        }
      });
      return;
    }

    // Si es boleta o factura, pedir datos del cliente
    if (this.tipoComp !== 'ticket') {
      this.abrirDialogoCliente();
    } else {
      this.finalizarVenta({});
    }
  }

  private abrirDialogoCliente() {
    const dialogRef = this.dialog.open(VentaClienteDialogComponent, {
      width: '400px',
      maxWidth: '90vw',
      disableClose: true,
      data: { tipoComp: this.tipoComp }
    });

    dialogRef.afterClosed().subscribe((datosCliente: DatosClienteResult | null) => {
      if (!datosCliente) return; // Canceló el diálogo
      this.finalizarVenta(datosCliente);
    });
  }

  private finalizarVenta(datosCliente: DatosClienteResult) {
    const cfg    = this.store.nubefactConfig();
    const serie  = this.tipoComp === 'factura' ? cfg.serie_factura : cfg.serie_boleta;
    const numComp = this.tipoComp !== 'ticket' ? this.store.nextNumComp(serie) : undefined;
    const metodo = this.metodoPago as MetodoPago; // Garantizar que no sea 'digital'
    const venta: Venta = {
      id:       this.store.nextId(this.store.ventas()),
      fecha:    this.store.nowStr(),
      items:    this.orderItems(),
      subtotal: this.subtotal(),
      descuento: this.descuento,
      total:    this.total(),
      metodo:   metodo,
      tipo_comp: this.tipoComp,
      comprobante: numComp,
      sunat_estado: this.tipoComp !== 'ticket' ? 'pendiente' : '',
      estado:   'completada',
      cajero:   this.auth.currentUser()?.usuario ?? 'sistema',
      efectivo_dado: metodo === 'efectivo' ? this.efectivoDado : undefined,
      vuelto:   metodo === 'efectivo' ? this.efectivoDado - this.total() : undefined,
    };
    this.store.addVenta(venta);
    this.print.ticket(venta);
    this.snack.open(`✓ Venta #${venta.id} registrada — S/ ${venta.total.toFixed(2)}`, '', { duration: 3000, panelClass: 'snack-ok' });
    this.clearOrder();
  }

  anularVenta(v: Venta) {
    if (!confirm(`¿Anular venta #${v.id}?`)) return;
    this.store.updateVenta({ ...v, estado: 'anulada' });
    this.snack.open(`Venta #${v.id} anulada`, '', { duration: 2500 });
  }

  metodoBadge(m: string) {
    const map: Record<string,string> = {
      efectivo:'bg-emerald-900/60 text-emerald-400', tarjeta:'bg-blue-900/60 text-blue-400',
      yape:'bg-purple-900/60 text-purple-400', plin:'bg-pink-900/60 text-pink-400',
    };
    return map[m] ?? 'bg-stone-800 text-stone-400';
  }
}
