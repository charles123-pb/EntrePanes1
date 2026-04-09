/**
 * Configuración y constantes globales
 * Centraliza estilos, iconos, navegación y configuraciones estáticas
 */

import { NavItem } from '../models/models';

// ── Estilos por rol de usuario
export type UserRole = 'admin' | 'cajero' | 'cocinero';

export interface AppUser {
  id: number;
  nombre: string;
  usuario: string;
  rol: UserRole;
  activo: boolean;
  pin: string;
}

// ── Colores por categoría de productos
export const CAT_ACCENT = [
  { bar: 'bg-amber-500', ring: 'hover:border-amber-500' },
  { bar: 'bg-orange-500', ring: 'hover:border-orange-500' },
  { bar: 'bg-red-500', ring: 'hover:border-red-500' },
  { bar: 'bg-yellow-500', ring: 'hover:border-yellow-500' },
  { bar: 'bg-violet-500', ring: 'hover:border-violet-500' },
  { bar: 'bg-blue-500', ring: 'hover:border-blue-500' },
  { bar: 'bg-pink-500', ring: 'hover:border-pink-500' },
  { bar: 'bg-teal-500', ring: 'hover:border-teal-500' },
];

// ── Navegación principal
export const NAV: NavItem[] = [
  { route: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { route: '/ventas', label: 'Ventas', icon: 'shopping_cart' },
  { route: '/caja', label: 'Cierre Caja', icon: 'lock' },
  { route: '/inventario', label: 'Inventario', icon: 'home' },
  { route: '/compras', label: 'Compras', icon: 'description' },
  { route: '/productos', label: 'Productos', icon: 'star' },
  { route: '/proveedores', label: 'Proveedores', icon: 'group' },
  { route: '/sunat', label: 'SUNAT / RER', icon: 'receipt_long' },
  { route: '/admin', label: 'Admin', icon: 'admin_panel_settings' },
];

// ── Estilos por rol
export const ROL_BADGE: Record<UserRole, string> = {
  admin: 'bg-amber-900/60 text-amber-400',
  cajero: 'bg-blue-900/60 text-blue-400',
  cocinero: 'bg-orange-900/60 text-orange-400',
};

export const ROL_ICON: Record<UserRole, string> = {
  admin: 'admin_panel_settings',
  cajero: 'credit_card',
  cocinero: 'restaurant',
};

// ── Usuarios por defecto (para desarrollo)
export const USERS_DEFAULT: AppUser[] = [
  { id: 1, nombre: 'Administrador', usuario: 'admin', rol: 'admin', activo: true, pin: '0000' },
  { id: 2, nombre: 'Cajero 1', usuario: 'cajero1', rol: 'cajero', activo: true, pin: '1234' },
  { id: 3, nombre: 'Cocinero 1', usuario: 'cocinero1', rol: 'cocinero', activo: true, pin: '5678' },
];

export const USERS_KEY = 'entrepanes_users';
