import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'ep-login',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatButtonModule, MatFormFieldModule, MatInputModule, MatIconModule
  ],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-stone-950 via-stone-900 to-black flex items-center justify-center p-4">
      <!-- Card -->
      <div class="w-full max-w-sm space-y-6">
        <!-- Logo -->
        <div class="text-center">
          <div class="text-5xl mb-3">🥪</div>
          <h1 class="text-3xl font-black text-amber-400 tracking-wider">ENTRE PANES</h1>
          <p class="text-stone-500 text-sm mt-1">Sistema POS</p>
        </div>

        <!-- Form -->
        <div class="bg-stone-900/60 border border-stone-800 rounded-lg p-8 space-y-4 backdrop-blur">
          
          <!-- Usuario -->
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Usuario</mat-label>
            <input matInput [(ngModel)]="usuario" (keyup.enter)="tryLogin()" />
            <mat-icon matPrefix>person</mat-icon>
          </mat-form-field>

          <!-- PIN -->
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>PIN (4 dígitos)</mat-label>
            <input matInput type="password" [(ngModel)]="pin" (keyup.enter)="tryLogin()" maxlength="4" />
            <mat-icon matPrefix>lock</mat-icon>
          </mat-form-field>

          <!-- Login Button -->
          <button mat-flat-button color="primary" class="w-full !h-12 !font-display !text-lg !tracking-widest mt-6" (click)="tryLogin()">
            <mat-icon class="mr-2">login</mat-icon>
            INGRESAR
          </button>
        </div>

        <!-- Default users info -->
        <div class="bg-stone-900/40 border border-stone-800/40 rounded-lg p-4 text-xs text-stone-500 space-y-2">
          <div class="font-black text-stone-400">Usuarios por defecto:</div>
          <div>👤 admin / 0000 (Admin)</div>
          <div>👤 cajero1 / 1234 (Cajero)</div>
          <div>👤 cocinero1 / 5678 (Cocinero)</div>
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

  usuario = '';
  pin = '';

  tryLogin() {
    if (!this.usuario.trim() || !this.pin.trim()) {
      this.snack.open('❌ Completa usuario y PIN', 'Cerrar', { duration: 2000 });
      return;
    }

    const result = this.auth.login(this.usuario, this.pin);
    if (result.success) {
      this.snack.open('✓ Bienvenido', '', { duration: 1500 });
      setTimeout(() => this.router.navigateByUrl('/dashboard'), 500);
    } else {
      this.snack.open('❌ ' + result.error, 'Cerrar', { duration: 3000, panelClass: 'snack-error' });
      this.pin = '';
    }
  }
}
