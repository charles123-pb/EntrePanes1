import { Injectable, signal } from '@angular/core';
import { AppUser, USERS_DEFAULT, USERS_KEY } from '../constants/constants';

@Injectable({ providedIn: 'root' })
export class AuthService {
  currentUser = signal<AppUser | null>(null);
  isAuthenticated = signal(false);

  constructor() {
    this.loadUser();
  }

  /**
   * Intenta login con usuario y PIN
   */
  login(usuario: string, pin: string): { success: boolean; error?: string } {
    const allUsers = this.getAllUsers();
    const user = allUsers.find(u => u.usuario === usuario && u.pin === pin && u.activo);

    if (!user) {
      return { success: false, error: 'Usuario o PIN inválido' };
    }

    this.currentUser.set(user);
    this.isAuthenticated.set(true);
    localStorage.setItem('currentUser', JSON.stringify(user));
    console.log(`✓ Login: ${user.nombre} (${user.rol})`);
    return { success: true };
  }

  /**
   * Cierra sesión
   */
  logout() {
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    localStorage.removeItem('currentUser');
    console.log('✓ Logout');
  }

  /**
   * Restaura usuario de localStorage al iniciar
   */
  private loadUser() {
    const stored = localStorage.getItem('currentUser');
    if (stored) {
      try {
        const user = JSON.parse(stored);
        // Validar que el usuario siga existiendo y activo
        const allUsers = this.getAllUsers();
        const valid = allUsers.find(u => u.id === user.id && u.activo);
        if (valid) {
          this.currentUser.set(user);
          this.isAuthenticated.set(true);
          console.log(`✓ Sesión restaurada: ${user.nombre}`);
        } else {
          localStorage.removeItem('currentUser');
          this.autoLoginAdmin();
        }
      } catch (e) {
        localStorage.removeItem('currentUser');
        this.autoLoginAdmin();
      }
    } else {
      // Auto-login como admin si no hay sesión
      this.autoLoginAdmin();
    }
  }

  /**
   * Auto-login como usuario admin
   */
  private autoLoginAdmin() {
    const allUsers = this.getAllUsers();
    const adminUser = allUsers.find(u => u.rol === 'admin' && u.activo);
    if (adminUser) {
      this.currentUser.set(adminUser);
      this.isAuthenticated.set(true);
      localStorage.setItem('currentUser', JSON.stringify(adminUser));
      console.log(`✓ Auto-login: ${adminUser.nombre} (${adminUser.rol})`);
    }
  }

  /**
   * Obtiene todos los usuarios (de localStorage o defaults)
   */
  private getAllUsers(): AppUser[] {
    const stored = localStorage.getItem(USERS_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return [...USERS_DEFAULT];
      }
    }
    return [...USERS_DEFAULT];
  }

  /**
   * Verifica si usuario tiene rol específico
   */
  hasRole(role: string | string[]): boolean {
    const user = this.currentUser();
    if (!user) return false;
    const roles = Array.isArray(role) ? role : [role];
    return roles.includes(user.rol);
  }
}
