import { Injectable } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) {
    return true;
  }

  console.warn('🔐 No autenticado — Redirigiendo a login');
  router.navigateByUrl('/login');
  return false;
};

export const roleGuard = (roles: string[]): CanActivateFn => {
  return (route, state) => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (!auth.isAuthenticated()) {
      router.navigateByUrl('/login');
      return false;
    }

    if (auth.hasRole(roles)) {
      return true;
    }

    console.warn(`🚫 Rol insuficiente — Se requiere: ${roles.join(' o ')}`);
    router.navigateByUrl('/dashboard');
    return false;
  };
};
