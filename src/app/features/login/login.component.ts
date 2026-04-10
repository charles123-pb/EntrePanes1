import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../core/services/auth.service';
import { USERS_DEFAULT, AppUser } from '../../core/constants/constants';

type UserRole = 'admin' | 'cajero' | 'cocinero';

const ROLE_STYLES: Record<UserRole, {
  card: string;
  iconBox: string;
  iconColor: string;
  labelColor: string;
  icon: string;
}> = {
  admin: {
    card: 'bg-amber-900/10 border-2 border-amber-500 hover:shadow-lg hover:shadow-amber-500/20',
    iconBox: 'p-4 rounded-full bg-amber-500/20',
    iconColor: 'text-amber-400',
    labelColor: 'text-xs mt-1 text-amber-400',
    icon: 'admin_panel_settings',
  },
  cajero: {
    card: 'bg-blue-900/10 border-2 border-blue-500 hover:shadow-lg hover:shadow-blue-500/20',
    iconBox: 'p-4 rounded-full bg-blue-500/20',
    iconColor: 'text-blue-400',
    labelColor: 'text-xs mt-1 text-blue-400',
    icon: 'point_of_sale',
  },
  cocinero: {
    card: 'bg-orange-900/10 border-2 border-orange-500 hover:shadow-lg hover:shadow-orange-500/20',
    iconBox: 'p-4 rounded-full bg-orange-500/20',
    iconColor: 'text-orange-400',
    labelColor: 'text-xs mt-1 text-orange-400',
    icon: 'restaurant',
  },
};

@Component({
  selector: 'ep-login',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-stone-950 via-stone-900 to-black flex items-center justify-center p-4">
      <div class="w-full max-w-2xl space-y-6">
        <!-- Logo -->
        <div class="text-center">
          <div class="text-5xl mb-3">🥪</div>
          <h1 class="text-3xl font-black text-amber-400 tracking-wider">ENTRE PANES</h1>
          <p class="text-stone-500 text-sm mt-1">Sistema POS</p>
        </div>

        <!-- Estado: Seleccionar Usuario -->
        <div *ngIf="!selectedUser()" class="space-y-4">
          <h2 class="text-center text-sm text-stone-400 font-semibold mb-6">Selecciona tu usuario</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div *ngFor="let user of users" 
                 (click)="selectUser(user)"
                 [ngClass]="getCardStyle(user.rol)"
                 class="group cursor-pointer rounded-xl p-6 transition-all hover:scale-105 flex flex-col items-center gap-4 text-center">
              <!-- Icono del rol -->
              <div [ngClass]="getIconBoxStyle(user.rol)">
                <mat-icon [ngClass]="'text-4xl ' + getIconColor(user.rol)">
                  {{ getIcon(user.rol) }}
                </mat-icon>
              </div>
              <!-- Nombre -->
              <div>
                <h3 class="text-lg font-bold text-stone-100">{{ user.nombre }}</h3>
                <p [ngClass]="getLabelColor(user.rol)">{{ getLabel(user.rol) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Estado: Ingresar PIN -->
        <div *ngIf="selectedUser()" class="bg-stone-900/60 border border-stone-800 rounded-lg p-8 space-y-6 backdrop-blur">
          <!-- Header con botón atrás -->
          <div class="flex items-center justify-between">
            <button 
              (click)="goBack()"
              class="p-2 rounded-full text-stone-500 hover:text-amber-400 hover:bg-stone-800 transition-all"
              title="Volver">
              <mat-icon class="!text-2xl">arrow_back</mat-icon>
            </button>
            
            <!-- Usuario seleccionado -->
            <div class="flex items-center gap-3 flex-1 justify-center">
              <div [ngClass]="getIconBoxStyle(selectedUser()!.rol)">
                <mat-icon [ngClass]="'text-2xl ' + getIconColor(selectedUser()!.rol)">
                  {{ getIcon(selectedUser()!.rol) }}
                </mat-icon>
              </div>
              <div>
                <p class="text-xs text-stone-500">Ingresando como</p>
                <h3 class="text-lg font-bold text-stone-100">{{ selectedUser()!.nombre }}</h3>
              </div>
            </div>
            
            <!-- Placeholder para alinear -->
            <div class="w-10"></div>
          </div>

          <!-- PIN Display -->
          <div class="text-center">
            <div class="text-5xl font-black tracking-[0.5em] text-amber-400 font-display">
              {{ '•'.repeat(pin.length) }}{{ '○'.repeat(4 - pin.length) }}
            </div>
          </div>

          <!-- Teclado Numérico -->
          <div class="grid grid-cols-3 gap-3">
            @for (num of [1, 2, 3, 4, 5, 6, 7, 8, 9]; track num) {
              <button 
                (click)="addNumber(num)"
                class="p-4 bg-stone-800 hover:bg-stone-700 border border-stone-700 rounded-lg text-2xl font-black text-stone-200 transition-all active:scale-95">
                {{ num }}
              </button>
            }
            <!-- Botón 0 (ancho completo) -->
            <button 
              (click)="addNumber(0)"
              class="col-span-2 p-4 bg-stone-800 hover:bg-stone-700 border border-stone-700 rounded-lg text-2xl font-black text-stone-200 transition-all active:scale-95">
              0
            </button>
            <!-- Botón Borrar -->
            <button 
              (click)="deleteLast()"
              class="p-4 bg-red-900/60 hover:bg-red-900 border border-red-700 rounded-lg text-xl font-black text-red-400 transition-all active:scale-95">
              <mat-icon>backspace</mat-icon>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class LoginComponent {
  auth = inject(AuthService);
  router = inject(Router);
  snack = inject(MatSnackBar);

  users = USERS_DEFAULT.filter(u => u.activo);
  selectedUser = signal<AppUser | null>(null);
  pin = '';

  selectUser(user: AppUser) {
    this.selectedUser.set(user);
    this.pin = '';
  }

  goBack() {
    this.selectedUser.set(null);
    this.pin = '';
  }

  tryLogin() {
    const user = this.selectedUser();
    if (!user || !this.pin.trim()) {
      this.snack.open('❌ Ingresa tu PIN', 'Cerrar', { duration: 2000 });
      return;
    }

    const result = this.auth.login(user.usuario, this.pin);
    if (result.success) {
      this.snack.open('✅ ¡Bienvenido!', '', { duration: 1500 });
      setTimeout(() => this.router.navigateByUrl('/dashboard'), 500);
    } else {
      this.snack.open('❌ PIN incorrecto', 'Cerrar', { duration: 3000 });
      this.pin = '';
    }
  }

  addNumber(num: number) {
    if (this.pin.length < 4) {
      this.pin += num.toString();
      if (this.pin.length === 4) {
        this.tryLogin();
      }
    }
  }

  deleteLast() {
    this.pin = this.pin.slice(0, -1);
  }

  getStyle(rol: any, prop: keyof typeof ROLE_STYLES['admin']) {
    return ROLE_STYLES[rol as UserRole]?.[prop] || '';
  }

  getCardStyle(rol: any): string { return this.getStyle(rol, 'card'); }
  getIconBoxStyle(rol: any): string { return this.getStyle(rol, 'iconBox'); }
  getIconColor(rol: any): string { return this.getStyle(rol, 'iconColor'); }
  getLabelColor(rol: any): string { return this.getStyle(rol, 'labelColor'); }
  getIcon(rol: any): string { return ROLE_STYLES[rol as UserRole]?.icon || 'person'; }

  getLabel(rol: any): string {
    const labels: Record<UserRole, string> = {
      admin: 'Administrador',
      cajero: 'Cajero',
      cocinero: 'Cocinero',
    };
    return labels[rol as UserRole] || 'Usuario';
  }
}
