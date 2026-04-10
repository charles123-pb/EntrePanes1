import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/login/login.component').then(m => m.LoginComponent),
    title: 'Login — Entre Panes',
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    title: 'Dashboard — Entre Panes',
  },
  {
    path: 'ventas',
    canActivate: [authGuard],
    loadComponent: () => import('./features/ventas/ventas.component').then(m => m.VentasComponent),
    title: 'Ventas — Entre Panes',
  },
  {
    path: 'caja',
    canActivate: [authGuard],
    loadComponent: () => import('./features/caja/caja.component').then(m => m.CajaComponent),
    title: 'Cierre de Caja — Entre Panes',
  },
  {
    path: 'inventario',
    canActivate: [authGuard],
    loadComponent: () => import('./features/inventario/inventario.component').then(m => m.InventarioComponent),
    title: 'Inventario — Entre Panes',
  },
  {
    path: 'compras',
    canActivate: [authGuard],
    loadComponent: () => import('./features/compras/compras.component').then(m => m.ComprasComponent),
    title: 'Compras — Entre Panes',
  },
  {
    path: 'productos',
    canActivate: [authGuard],
    loadComponent: () => import('./features/productos/productos.component').then(m => m.ProductosComponent),
    title: 'Productos — Entre Panes',
  },
  {
    path: 'proveedores',
    canActivate: [authGuard],
    loadComponent: () => import('./features/proveedores/proveedores.component').then(m => m.ProveedoresComponent),
    title: 'Proveedores — Entre Panes',
  },
  {
    path: 'sunat',
    canActivate: [authGuard],
    loadComponent: () => import('./features/sunat/sunat.component').then(m => m.SunatComponent),
    title: 'SUNAT/RER — Entre Panes',
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard(['admin'])],
    loadComponent: () => import('./features/admin/admin.component').then(m => m.AdminComponent),
    title: 'Administración — Entre Panes',
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
