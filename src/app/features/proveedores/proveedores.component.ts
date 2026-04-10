import { Component, inject, computed, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule }           from '@angular/common';
import { FormsModule }            from '@angular/forms';
import { MatButtonModule }        from '@angular/material/button';
import { MatIconModule }          from '@angular/material/icon';
import { MatFormFieldModule }     from '@angular/material/form-field';
import { MatInputModule }         from '@angular/material/input';
import { MatSnackBar }            from '@angular/material/snack-bar';
import { AppStateService }        from '../../core/services/app-state.service';
import { Proveedor }              from '../../core/models/models';

@Component({
  selector: 'ep-proveedores',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, MatButtonModule, MatIconModule,
            MatFormFieldModule, MatInputModule],
  template: `
    <div class="space-y-6 animate-slide-up">

      <div class="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 class="ep-section-title">Proveedores</h1>
          <p class="text-stone-500 text-sm mt-1">Directorio de proveedores</p>
        </div>
        <button mat-flat-button color="primary" (click)="openForm()">
          <mat-icon>add</mat-icon> Nuevo Proveedor
        </button>
      </div>

      <!-- Search -->
      <mat-form-field appearance="outline" class="w-full max-w-sm ep-field-compact">
        <mat-icon matPrefix class="text-stone-500">search</mat-icon>
        <input matInput placeholder="Buscar proveedor…" [(ngModel)]="searchQ" />
      </mat-form-field>

      <!-- Grid cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        @for (prov of filtered(); track prov.id) {
          <div class="ep-card p-4 space-y-3 border hover:border-amber-500/40 transition-all group">
            <div class="flex justify-between items-start">
              <div>
                <h3 class="text-stone-200 font-medium">{{ prov.nombre }}</h3>
                @if (prov.ruc) {
                  <div class="text-stone-500 text-xs font-mono mt-0.5">RUC: {{ prov.ruc }}</div>
                }
              </div>
              <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button mat-icon-button class="!w-7 !h-7 text-stone-500 hover:text-amber-400" (click)="openForm(prov)">
                  <mat-icon class="!text-sm">edit</mat-icon>
                </button>
                <button mat-icon-button class="!w-7 !h-7 text-stone-500 hover:text-red-400" (click)="deleteProv(prov)">
                  <mat-icon class="!text-sm">delete</mat-icon>
                </button>
              </div>
            </div>

            <div class="space-y-1.5 text-xs">
              @if (prov.telefono) {
                <div class="flex items-center gap-2 text-stone-400">
                  <mat-icon class="!text-sm text-stone-600">phone</mat-icon>
                  {{ prov.telefono }}
                </div>
              }
              @if (prov.email) {
                <div class="flex items-center gap-2 text-stone-400">
                  <mat-icon class="!text-sm text-stone-600">email</mat-icon>
                  {{ prov.email }}
                </div>
              }
            </div>

            <!-- Compras resumen -->
            <div class="pt-2 border-t border-stone-800/60 flex justify-between text-xs">
              <span class="text-stone-500">Compras registradas</span>
              <span class="text-amber-400 font-black">{{ comprasCount(prov.id) }}</span>
            </div>
          </div>
        }
        @empty {
          <div class="col-span-3 text-center py-12 text-stone-600">Sin proveedores</div>
        }
      </div>

      <!-- Form modal -->
      @if (showForm()) {
        <div class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" (click)="showForm.set(false)">
          <div class="ep-card w-full max-w-md p-6 space-y-4" (click)="$event.stopPropagation()">
            <h2 class="ep-section-title text-xl">{{ editItem() ? 'Editar' : 'Nuevo' }} Proveedor</h2>
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Nombre / Razón social</mat-label>
              <input matInput [(ngModel)]="form.nombre" />
            </mat-form-field>
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>RUC (opcional)</mat-label>
              <input matInput [(ngModel)]="form.ruc" maxlength="11" />
            </mat-form-field>
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Teléfono</mat-label>
              <input matInput [(ngModel)]="form.telefono" />
            </mat-form-field>
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Email</mat-label>
              <input matInput type="email" [(ngModel)]="form.email" />
            </mat-form-field>
            <div class="flex gap-3 justify-end">
              <button mat-stroked-button (click)="showForm.set(false)">Cancelar</button>
              <button mat-flat-button color="primary" (click)="save()">Guardar</button>
            </div>
          </div>
        </div>
      }

    </div>
  `,
  styles: [`::ng-deep .ep-field-compact .mat-mdc-form-field-infix { padding-top:8px !important; padding-bottom:8px !important; min-height:36px !important; }`]
})
export class ProveedoresComponent {
  store = inject(AppStateService);
  private snack = inject(MatSnackBar);

  searchQ  = '';
  showForm = signal(false);
  editItem = signal<Proveedor | null>(null);
  form: Partial<Proveedor> = {};

  filtered = computed(() => {
    const q = this.searchQ.toLowerCase();
    return this.store.proveedores().filter(p =>
      !q || p.nombre.toLowerCase().includes(q) || p.ruc.includes(q)
    );
  });

  comprasCount(id: number) {
    return this.store.compras().filter(c => c.prov_id === id).length;
  }

  openForm(p?: Proveedor) {
    this.editItem.set(p ?? null);
    this.form = p ? { ...p } : { nombre: '', ruc: '', telefono: '', email: '' };
    this.showForm.set(true);
  }

  save() {
    if (!this.form.nombre?.trim()) return;
    const provs = this.store.proveedores();
    if (this.editItem()) {
      this.store.update({ proveedores: provs.map(p => p.id === this.editItem()!.id ? { ...p, ...this.form } as Proveedor : p) });
      this.snack.open('Proveedor actualizado', '', { duration: 2000 });
    } else {
      const nuevo: Proveedor = { ...this.form as Proveedor, id: this.store.nextId(provs) };
      this.store.update({ proveedores: [...provs, nuevo] });
      this.snack.open('Proveedor creado', '', { duration: 2000 });
    }
    this.showForm.set(false);
  }

  deleteProv(p: Proveedor) {
    if (!confirm(`¿Eliminar "${p.nombre}"?`)) return;
    this.store.update({ proveedores: this.store.proveedores().filter(x => x.id !== p.id) });
    this.snack.open('Proveedor eliminado', '', { duration: 2000 });
  }
}
