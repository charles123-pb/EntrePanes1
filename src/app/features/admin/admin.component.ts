import { Component, inject, signal } from '@angular/core';
import { CommonModule }           from '@angular/common';
import { FormsModule }            from '@angular/forms';
import { MatButtonModule }        from '@angular/material/button';
import { MatIconModule }          from '@angular/material/icon';
import { MatFormFieldModule }     from '@angular/material/form-field';
import { MatInputModule }         from '@angular/material/input';
import { MatSelectModule }        from '@angular/material/select';
import { MatSlideToggleModule }   from '@angular/material/slide-toggle';
import { MatSnackBar }            from '@angular/material/snack-bar';
import { AppStateService }        from '../../core/services/app-state.service';

type UserRole = 'admin' | 'cajero' | 'cocinero';

interface AppUser {
  id: number;
  nombre: string;
  usuario: string;
  rol: UserRole;
  activo: boolean;
  pin: string;
}

const USERS_KEY = 'entrepanes_users';

const USERS_DEFAULT: AppUser[] = [
  { id:1, nombre:'Administrador',  usuario:'admin',   rol:'admin',   activo:true, pin:'0000' },
  { id:2, nombre:'Cajero 1',       usuario:'cajero1', rol:'cajero',  activo:true, pin:'1234' },
  { id:3, nombre:'Cocinero 1',     usuario:'cocinero1',rol:'cocinero',activo:true, pin:'5678' },
];

const ROL_BADGE: Record<UserRole, string> = {
  admin:    'bg-amber-900/60 text-amber-400',
  cajero:   'bg-blue-900/60 text-blue-400',
  cocinero: 'bg-orange-900/60 text-orange-400',
};
const ROL_ICON: Record<UserRole, string> = {
  admin: 'admin_panel_settings', cajero: 'credit_card', cocinero: 'restaurant'
};

@Component({
  selector: 'ep-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatIconModule,
            MatFormFieldModule, MatInputModule, MatSelectModule, MatSlideToggleModule],
  template: `
    <div class="space-y-6 animate-slide-up">

      <div>
        <h1 class="ep-section-title">Administración</h1>
        <p class="text-stone-500 text-sm mt-1">Usuarios, roles y configuración del sistema</p>
      </div>

      <!-- Users -->
      <div class="ep-card">
        <div class="px-4 py-3 border-b border-stone-800 flex justify-between items-center">
          <span class="text-stone-300 font-black text-sm tracking-wider">USUARIOS DEL SISTEMA</span>
          <button mat-flat-button color="primary" class="!text-xs !h-8" (click)="openForm()">
            <mat-icon>person_add</mat-icon> Nuevo
          </button>
        </div>
        <div class="divide-y divide-stone-800/40">
          @for (u of users(); track u.id) {
            <div class="px-4 py-3 flex items-center gap-4">
              <div class="w-10 h-10 rounded-sm flex items-center justify-center" [ngClass]="ROL_BADGE[u.rol]">
                <mat-icon class="!text-lg">{{ ROL_ICON[u.rol] }}</mat-icon>
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-stone-200 font-medium text-sm">{{ u.nombre }}</div>
                <div class="text-stone-500 text-xs font-mono">@{{ u.usuario }}</div>
              </div>
              <span class="ep-badge" [ngClass]="ROL_BADGE[u.rol]">{{ u.rol }}</span>
              <mat-slide-toggle [checked]="u.activo" (change)="toggleUser(u)" color="primary" class="scale-75"></mat-slide-toggle>
              <div class="flex gap-1">
                <button mat-icon-button class="!w-7 !h-7 text-stone-500 hover:text-amber-400" (click)="openForm(u)">
                  <mat-icon class="!text-sm">edit</mat-icon>
                </button>
                @if (u.rol !== 'admin') {
                  <button mat-icon-button class="!w-7 !h-7 text-stone-500 hover:text-red-400" (click)="deleteUser(u)">
                    <mat-icon class="!text-sm">delete</mat-icon>
                  </button>
                }
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Configuración negocio -->
      <div class="ep-card p-6 space-y-4">
        <div class="text-stone-300 font-black text-sm tracking-wider mb-4">CONFIGURACIÓN DEL NEGOCIO</div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
          <mat-form-field appearance="outline">
            <mat-label>Nombre del negocio</mat-label>
            <input matInput [(ngModel)]="biz.nombre" />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>RUC</mat-label>
            <input matInput [(ngModel)]="biz.ruc" maxlength="11" />
          </mat-form-field>
          <mat-form-field appearance="outline" class="col-span-2 sm:col-span-1">
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
          <mat-form-field appearance="outline">
            <mat-label>Régimen tributario</mat-label>
            <mat-select [(ngModel)]="biz.regimen">
              <mat-option value="RER">RER — Régimen Especial</mat-option>
              <mat-option value="NRUS">NRUS — Nuevo RUS</mat-option>
              <mat-option value="MYPE">MYPE Tributario</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
        <button mat-flat-button color="primary" (click)="saveBiz()">
          <mat-icon>save</mat-icon> Guardar configuración
        </button>
      </div>

      <!-- Datos del sistema -->
      <div class="ep-card p-6 space-y-4">
        <div class="text-stone-300 font-black text-sm tracking-wider mb-2">DATOS DEL SISTEMA</div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div class="ep-card p-3 bg-stone-800/40">
            <div class="text-stone-500 font-black tracking-wider mb-1">VENTAS</div>
            <div class="text-amber-400 font-display text-2xl">{{ store.ventas().length }}</div>
          </div>
          <div class="ep-card p-3 bg-stone-800/40">
            <div class="text-stone-500 font-black tracking-wider mb-1">COMPRAS</div>
            <div class="text-blue-400 font-display text-2xl">{{ store.compras().length }}</div>
          </div>
          <div class="ep-card p-3 bg-stone-800/40">
            <div class="text-stone-500 font-black tracking-wider mb-1">PRODUCTOS</div>
            <div class="text-violet-400 font-display text-2xl">{{ store.productos().length }}</div>
          </div>
          <div class="ep-card p-3 bg-stone-800/40">
            <div class="text-stone-500 font-black tracking-wider mb-1">INSUMOS</div>
            <div class="text-emerald-400 font-display text-2xl">{{ store.insumos().length }}</div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex flex-wrap gap-3 pt-2">
          <button mat-stroked-button (click)="exportData()">
            <mat-icon>download</mat-icon> Exportar datos JSON
          </button>
          <button mat-stroked-button color="warn" (click)="resetData()">
            <mat-icon>restore</mat-icon> Restablecer datos de ejemplo
          </button>
        </div>
      </div>

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
  store  = inject(AppStateService);
  private snack = inject(MatSnackBar);

  ROL_BADGE = ROL_BADGE;
  ROL_ICON  = ROL_ICON;

  users    = signal<AppUser[]>(this.loadUsers());
  showForm = signal(false);
  editUser = signal<AppUser | null>(null);
  uForm: Partial<AppUser> & { rol: UserRole } = { nombre:'', usuario:'', pin:'', rol:'cajero', activo:true };

  biz = this.loadBiz();

  loadUsers(): AppUser[] {
    try { return JSON.parse(localStorage.getItem(USERS_KEY) ?? '') ?? USERS_DEFAULT; } catch { return USERS_DEFAULT; }
  }
  saveUsers() { try { localStorage.setItem(USERS_KEY, JSON.stringify(this.users())); } catch {} }

  loadBiz() {
    try { return JSON.parse(localStorage.getItem('entrepanes_biz') ?? '{}') ?? {}; } catch { return {}; }
  }

  openForm(u?: AppUser) {
    this.editUser.set(u ?? null);
    this.uForm = u ? { ...u } : { nombre:'', usuario:'', pin:'', rol:'cajero', activo:true };
    this.showForm.set(true);
  }

  saveUser() {
    if (!this.uForm.nombre?.trim() || !this.uForm.usuario?.trim()) return;
    const us = this.users();
    if (this.editUser()) {
      this.users.set(us.map(u => u.id === this.editUser()!.id ? { ...u, ...this.uForm } as AppUser : u));
    } else {
      const nuevo: AppUser = { ...this.uForm as AppUser, id: us.length ? Math.max(...us.map(u=>u.id))+1 : 1 };
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
    try { localStorage.setItem('entrepanes_biz', JSON.stringify(this.biz)); } catch {}
    this.snack.open('Configuración guardada', '', { duration: 2000 });
  }

  exportData() {
    const data = JSON.stringify(this.store.state(), null, 2);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
    a.download = `entrepanes-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  }

  resetData() {
    if (!confirm('¿Restablecer todos los datos de ejemplo? Se perderán los datos actuales.')) return;
    this.store.resetToDefault();
    this.snack.open('Datos restablecidos', '', { duration: 2500 });
  }
}
