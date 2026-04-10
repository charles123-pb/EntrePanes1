import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
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
  imports: [
    CommonModule, FormsModule,
    MatButtonModule, MatFormFieldModule, MatInputModule, MatIconModule
  ],
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
          <!-- Header con usuario seleccionado -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
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
            <button mat-icon-button (click)="cancelLogin()" class="text-stone-500 hover:text-white">
              <mat-icon>close</mat-icon>
            </button>
          </div>

          <!-- PIN Input -->
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>PIN (4 dígitos)</mat-label>
            <input matInput type="password" [(ngModel)]="pin" (keyup.enter)="tryLogin()" 
                   maxlength="4" placeholder="••••" autofocus />
            <mat-icon matPrefix>lock</mat-icon>
          </mat-form-field>

          <!-- Botones -->
          <div class="flex gap-3">
            <button mat-flat-button class="flex-1" (click)="cancelLogin()">
              <mat-icon>arrow_back</mat-icon>
              ATRÁS
            </button>
            <button mat-flat-button color="primary" class="flex-1 !h-12" (click)="tryLogin()">
              <mat-icon>check</mat-icon>
              CONTINUAR
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    ::ng-deep .mdc-form-field {
      width: 100%;
    }
    ::ng-deep .mdc-text-field__input {
      color: #f5f5f4 !important;
    }
    ::ng-deep .mat-mdc-form-field-focus-overlay {
      background-color: rgba(251, 146, 60, 0.1) !important;
    }
  `]
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

  cancelLogin() {
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

  getCardStyle(rol: any): string {
    return ROLE_STYLES[rol as UserRole]?.card || '';
  }

  getIconBoxStyle(rol: any): string {
    return ROLE_STYLES[rol as UserRole]?.iconBox || '';
  }

  getIconColor(rol: any): string {
    return ROLE_STYLES[rol as UserRole]?.iconColor || '';
  }

  getLabelColor(rol: any): string {
    return ROLE_STYLES[rol as UserRole]?.labelColor || '';
  }

  getIcon(rol: any): string {
    return ROLE_STYLES[rol as UserRole]?.icon || 'person';
  }

  getLabel(rol: any): string {
    const labels: Record<UserRole, string> = {
      admin: 'Administrador',
      cajero: 'Cajero',
      cocinero: 'Cocinero',
    };
    return labels[rol as UserRole] || 'Usuario';
  }
}
