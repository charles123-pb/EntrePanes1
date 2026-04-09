import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule, DecimalPipe }            from '@angular/common';
import { FormsModule }                          from '@angular/forms';
import { MatButtonModule }    from '@angular/material/button';
import { MatIconModule }      from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule }     from '@angular/material/input';
import { MatSelectModule }    from '@angular/material/select';
import { MatSnackBar }        from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AppStateService }    from '../../core/services/app-state.service';
import { ApiService }         from '../../core/services/api.service';
import { ImageService }       from '../../core/services/image.service';
import { CAT_ACCENT } from '../../core/constants/constants';
import { Producto, RecetaItem } from '../../core/models/models';

@Component({
  selector: 'ep-productos',
  standalone: true,
  imports: [CommonModule, DecimalPipe, FormsModule, MatButtonModule, MatIconModule,
            MatFormFieldModule, MatInputModule, MatSelectModule, MatProgressSpinnerModule],
  template: `
    <div class="space-y-6 animate-slide-up">

      <div class="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 class="ep-section-title">Productos</h1>
          <p class="text-stone-500 text-sm mt-1">Catálogo y gestión de productos del menú</p>
        </div>
        <div class="flex gap-2">
          <button mat-stroked-button (click)="showCatForm.set(true)">
            <mat-icon>label</mat-icon> Categorías
          </button>
          <button mat-flat-button color="primary" (click)="openForm()">
            <mat-icon>add</mat-icon> Nuevo Producto
          </button>
        </div>
      </div>

      <!-- Category filter chips -->
      <div class="flex gap-2 flex-wrap">
        <button class="px-3 py-1 text-xs font-black tracking-wider rounded-sm border transition-all"
          [ngClass]="catFilter === '' ? 'bg-amber-500 border-amber-500 text-stone-900' : 'border-stone-700 text-stone-400 hover:border-amber-500'"
          (click)="catFilter = ''">TODOS</button>
        @for (cat of store.categorias(); track cat; let i = $index) {
          <button class="px-3 py-1 text-xs font-black tracking-wider rounded-sm border transition-all"
            [ngClass]="catFilter === cat ? accent(i).bar + ' border-transparent text-stone-900' : 'border-stone-700 text-stone-400 hover:border-amber-500'"
            (click)="catFilter = cat"><mat-icon class="!text-xs">restaurant_menu</mat-icon> {{ cat }}</button>
        }
      </div>

      <!-- Products grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        @for (prod of filteredProds(); track prod.id) {
          <div class="ep-card overflow-hidden border hover:border-amber-500/40 transition-all group" [ngClass]="accent(catIdx(prod.cat)).ring">
            <div class="h-1.5" [ngClass]="accent(catIdx(prod.cat)).bar"></div>
            
            <!-- Imagen del producto -->
            <div class="relative w-full h-32 bg-stone-800 flex items-center justify-center overflow-hidden">
              @if (prod.imagenUrl) {
                <img [src]="prod.imagenUrl" alt="{{ prod.nombre }}" class="w-full h-full object-cover">
              } @else {
                <mat-icon class="!text-5xl text-stone-600">image</mat-icon>
              }
            </div>

            <div class="p-4">
              <div class="flex justify-between items-start mb-1">
                <h3 class="text-stone-200 font-medium text-sm leading-snug flex-1">{{ prod.nombre }}</h3>
                <span class="text-amber-400 font-display text-2xl ml-2">S/ {{ prod.precio }}</span>
              </div>
              <div class="text-stone-600 text-xs mb-3">{{ prod.cat }}</div>

              <!-- Receta -->
              <div class="space-y-1 mb-3">
                <div class="text-stone-600 text-xs font-black tracking-wider">RECETA</div>
                @for (r of prod.receta; track r.ins_id) {
                  <div class="flex justify-between text-xs text-stone-500">
                    <span>{{ insNombre(r.ins_id) }}</span>
                    <span class="font-mono">{{ r.cant }} {{ insUnidad(r.ins_id) }}</span>
                  </div>
                }
              </div>

              <!-- Costo y margen -->
              <div class="pt-2 border-t border-stone-800/60 flex justify-between text-xs">
                <span class="text-stone-500">Costo: <span class="text-stone-300">S/ {{ costoProd(prod) | number:'1.2-2' }}</span></span>
                <span class="text-emerald-400 font-black">{{ margen(prod) | number:'1.0-1' }}% margen</span>
              </div>

              <div class="flex gap-2 mt-3">
                <button mat-stroked-button class="flex-1 text-xs !h-8" (click)="openForm(prod)">
                  <mat-icon class="!text-sm">edit</mat-icon> Editar
                </button>
                <button mat-icon-button class="text-stone-600 hover:text-red-400 !w-8 !h-8" (click)="deleteProd(prod)">
                  <mat-icon class="!text-sm">delete</mat-icon>
                </button>
              </div>
            </div>
          </div>
        }
        @empty {
          <div class="col-span-4 text-center py-12 text-stone-600">Sin productos en esta categoría</div>
        }
      </div>

      <!-- Form modal -->
      @if (showForm()) {
        <div class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" (click)="showForm.set(false)">
          <div class="ep-card w-full max-w-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto" (click)="$event.stopPropagation()">
            <h2 class="ep-section-title text-xl">{{ editItem() ? 'Editar' : 'Nuevo' }} Producto</h2>

            <div class="grid grid-cols-2 gap-3">
              <mat-form-field appearance="outline" class="col-span-2">
                <mat-label>Nombre del producto</mat-label>
                <input matInput [(ngModel)]="form.nombre" />
              </mat-form-field>

              <!-- Upload de imagen -->
              <div class="col-span-2">
                <div class="text-stone-400 font-black text-xs tracking-widest mb-2">IMAGEN DEL PRODUCTO</div>
                <div class="ep-card p-4 border-2 border-dashed border-stone-700 hover:border-amber-500/50 transition-colors">
                  <!-- Preview de imagen -->
                  @if (imagePreview() || form.imagenUrl) {
                    <div class="relative w-full h-48 bg-stone-800 rounded-sm overflow-hidden mb-3">
                      <img [src]="imagePreview() || form.imagenUrl" alt="Preview" class="w-full h-full object-cover">
                      <button type="button" mat-icon-button class="absolute top-2 right-2 bg-red-600/80 hover:bg-red-700 text-white !w-8 !h-8"
                        (click)="clearImage()">
                        <mat-icon class="!text-sm">close</mat-icon>
                      </button>
                    </div>
                  }
                  
                  <!-- Input file -->
                  <div class="flex items-center justify-center">
                    @if (!uploadingImage()) {
                      <label class="cursor-pointer flex items-center gap-2 text-amber-500 hover:text-amber-400">
                        <mat-icon>cloud_upload</mat-icon>
                        <span>Seleccionar imagen</span>
                        <input type="file" #fileInput accept="image/*" hidden
                          (change)="onImageSelected($event)" />
                      </label>
                    } @else {
                      <div class="flex items-center gap-2 text-amber-500">
                        <mat-spinner diameter="20" class="[&>div]:h-5 [&>div]:w-5"></mat-spinner>
                        <span>Subiendo imagen...</span>
                      </div>
                    }
                  </div>
                  <div class="text-stone-600 text-xs text-center mt-2">JPG, PNG o GIF (máx 5MB)</div>
                </div>
              </div>

              <mat-form-field appearance="outline">
                <mat-label>Categoría</mat-label>
                <mat-select [(ngModel)]="form.cat">
                  @for (c of store.categorias(); track c) { <mat-option [value]="c">{{ c }}</mat-option> }
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Precio de venta (S/)</mat-label>
                <input matInput type="number" [(ngModel)]="form.precio" />
              </mat-form-field>
            </div>

            <!-- Receta -->
            <div>
              <div class="text-stone-400 font-black text-xs tracking-widest mb-2">RECETA / INGREDIENTES</div>
              <div class="space-y-2">
                @for (r of form.receta; track $index; let i = $index) {
                  <div class="flex gap-2 items-center">
                    <mat-form-field appearance="outline" class="flex-1 ep-field-compact">
                      <mat-select [(ngModel)]="r.ins_id" placeholder="Insumo">
                        @for (ins of store.insumos(); track ins.id) { <mat-option [value]="ins.id">{{ ins.nombre }}</mat-option> }
                      </mat-select>
                    </mat-form-field>
                    <mat-form-field appearance="outline" class="w-28 ep-field-compact">
                      <input matInput type="number" placeholder="Cantidad" [(ngModel)]="r.cant" />
                    </mat-form-field>
                    <span class="text-stone-500 text-xs w-12">{{ insUnidad(r.ins_id) }}</span>
                    <button mat-icon-button class="!w-7 !h-7 text-stone-600 hover:text-red-400" (click)="removeReceta(i)">
                      <mat-icon class="!text-sm">close</mat-icon>
                    </button>
                  </div>
                }
              </div>
              <button mat-stroked-button class="mt-2 text-xs" (click)="addReceta()">
                <mat-icon>add</mat-icon> Ingrediente
              </button>
            </div>

            <div class="flex gap-3 justify-end pt-2 border-t border-stone-700">
              <button mat-stroked-button (click)="showForm.set(false)">Cancelar</button>
              <button mat-flat-button color="primary" (click)="saveProducto()">Guardar</button>
            </div>
          </div>
        </div>
      }

      <!-- Cat form modal -->
      @if (showCatForm()) {
        <div class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" (click)="showCatForm.set(false)">
          <div class="ep-card w-full max-w-sm p-6 space-y-4" (click)="$event.stopPropagation()">
            <h2 class="ep-section-title text-xl">Categorías</h2>
            <div class="space-y-2">
              @for (cat of editCats; track cat; let i = $index) {
                <div class="flex items-center gap-2">
                  <input class="flex-1 bg-stone-800 border border-stone-700 rounded-sm px-2 py-1.5 text-sm text-stone-200 focus:outline-none focus:border-amber-500"
                    [(ngModel)]="editCats[i]" />
                  <button mat-icon-button class="!w-7 !h-7 text-stone-600 hover:text-red-400" (click)="editCats.splice(i,1)">
                    <mat-icon class="!text-sm">close</mat-icon>
                  </button>
                </div>
              }
            </div>
            <button mat-stroked-button class="w-full" (click)="editCats.push('')">
              <mat-icon>add</mat-icon> Agregar
            </button>
            <div class="flex gap-3">
              <button mat-stroked-button class="flex-1" (click)="showCatForm.set(false)">Cancelar</button>
              <button mat-flat-button color="primary" class="flex-1" (click)="saveCats()">Guardar</button>
            </div>
          </div>
        </div>
      }

    </div>
  `,
  styles: [`::ng-deep .ep-field-compact .mat-mdc-form-field-infix { padding-top:8px !important; padding-bottom:8px !important; min-height:36px !important; }`]
})
export class ProductosComponent {
  store = inject(AppStateService);
  private api = inject(ApiService);
  private imgService = inject(ImageService);
  private snack = inject(MatSnackBar);

  catFilter   = '';
  showForm    = signal(false);
  showCatForm = signal(false);
  editItem    = signal<Producto | null>(null);
  editCats: string[] = [];

  // ── Imagen
  imagePreview = signal<string | null>(null);
  imageFile: File | null = null;
  uploadingImage = signal(false);

  form: Partial<Producto> & { receta: RecetaItem[] } = this.emptyForm();

  emptyForm() {
    return { nombre: '', cat: this.store.categorias()[0] ?? '', precio: 0, receta: [], imagenUrl: '' };
  }

  filteredProds = computed(() =>
    this.store.productos().filter(p => !this.catFilter || p.cat === this.catFilter)
  );

  catIdx(cat: string) { return this.store.categorias().indexOf(cat); }
  accent(i: number)   { return CAT_ACCENT[i % CAT_ACCENT.length] ?? CAT_ACCENT[0]; }
  insNombre(id: number){ return this.store.insumos().find(i => i.id === id)?.nombre ?? '—'; }
  insUnidad(id: number){ return this.store.insumos().find(i => i.id === id)?.unidad ?? ''; }

  costoProd(p: Producto) {
    return p.receta.reduce((s,r) => {
      const ins = this.store.insumos().find(i => i.id === r.ins_id);
      return s + (ins ? ins.costo * r.cant : 0);
    }, 0);
  }
  margen(p: Producto) {
    const c = this.costoProd(p);
    return p.precio > 0 ? ((p.precio - c) / p.precio) * 100 : 0;
  }

  // ── Manejo de imágenes
  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    // Validar con servicio
    const validation = this.imgService.validateImage(file);
    if (!validation.valid) {
      this.snack.open(`❌ ${validation.error}`, 'Cerrar', { duration: 3000 });
      return;
    }

    this.imageFile = file;

    // Generar preview
    this.imgService.generatePreview(file).then(preview => {
      this.imagePreview.set(preview);
    }).catch(err => {
      console.error('Error generating preview:', err);
      this.snack.open('❌ Error al procesar la imagen', 'Cerrar', { duration: 3000 });
    });
  }

  clearImage() {
    this.imageFile = null;
    this.imagePreview.set(null);
    this.form.imagenUrl = '';
  }

  async uploadImage(): Promise<string | null> {
    if (!this.imageFile) return this.form.imagenUrl || null;

    this.uploadingImage.set(true);
    try {
      const response = await this.api.uploadProductImage(this.imageFile).toPromise();
      this.uploadingImage.set(false);
      return response?.url || null;
    } catch (error) {
      this.uploadingImage.set(false);
      console.error('Error uploading image:', error);
      this.snack.open('❌ Error al subir la imagen', 'Cerrar', { duration: 3000 });
      return null;
    }
  }

  openForm(p?: Producto) {
    this.editItem.set(p ?? null);
    this.form = p ? { ...p, receta: p.receta.map(r => ({ ...r })) } : this.emptyForm();
    this.imageFile = null;
    this.imagePreview.set(null);
    this.showForm.set(true);
  }

  addReceta()     { this.form.receta = [...this.form.receta, { ins_id: 1, cant: 0 }]; }
  removeReceta(i: number) { this.form.receta = this.form.receta.filter((_,idx) => idx !== i); }

  async saveProducto() {
    if (!this.form.nombre?.trim() || this.form.precio! <= 0) {
      this.snack.open('❌ Completa nombre y precio', 'Cerrar', { duration: 3000 });
      return;
    }

    // Upload imagen si hay nueva
    let imagenUrl = this.form.imagenUrl;
    if (this.imageFile) {
      imagenUrl = await this.uploadImage();
    }

    const prods = this.store.productos();
    const productoData: Producto = {
      ...this.form as Producto,
      imagenUrl: imagenUrl || undefined,
      id: this.editItem()?.id || this.store.nextId(prods)
    };

    if (this.editItem()) {
      this.store.update({ productos: prods.map(p => p.id === this.editItem()!.id ? productoData : p) });
      this.snack.open('✅ Producto actualizado', '', { duration: 2000 });
    } else {
      this.store.update({ productos: [...prods, productoData] });
      this.snack.open('✅ Producto creado', '', { duration: 2000 });
    }
    this.showForm.set(false);
    this.clearImage();
  }

  deleteProd(p: Producto) {
    if (!confirm(`¿Eliminar "${p.nombre}"?`)) return;
    this.store.update({ productos: this.store.productos().filter(x => x.id !== p.id) });
    this.snack.open('Producto eliminado', '', { duration: 2000 });
  }

  openCatForm() {
    this.editCats = [...this.store.categorias()];
    this.showCatForm.set(true);
  }

  saveCats() {
    this.store.update({ categorias: this.editCats.filter(c => c.trim()) });
    this.showCatForm.set(false);
    this.snack.open('Categorías guardadas', '', { duration: 2000 });
  }
}
