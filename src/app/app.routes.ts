import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/login/login.component').then(m => m.LoginComponent),
    title: 'Login — Entre Panes',
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    title: 'Dashboard — Entre Panes',
  },
  {
    path: 'ventas',
    loadComponent: () => import('./features/ventas/ventas.component').then(m => m.VentasComponent),
    title: 'Ventas — Entre Panes',
  },
  {
    path: 'caja',
    loadComponent: () => import('./features/caja/caja.component').then(m => m.CajaComponent),
    title: 'Cierre de Caja — Entre Panes',
  },
  {
    path: 'inventario',
    loadComponent: () => import('./features/inventario/inventario.component').then(m => m.InventarioComponent),
    title: 'Inventario — Entre Panes',
  },
  {
    path: 'compras',
    loadComponent: () => import('./features/compras/compras.component').then(m => m.ComprasComponent),
    title: 'Compras — Entre Panes',
  },
  {
    path: 'productos',
    loadComponent: () => import('./features/productos/productos.component').then(m => m.ProductosComponent),
    title: 'Productos — Entre Panes',
  },
  {
    path: 'proveedores',
    loadComponent: () => import('./features/proveedores/proveedores.component').then(m => m.ProveedoresComponent),
    title: 'Proveedores — Entre Panes',
  },
  {
    path: 'sunat',
    loadComponent: () => import('./features/sunat/sunat.component').then(m => m.SunatComponent),
    title: 'SUNAT/RER — Entre Panes',
  },
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/admin.component').then(m => m.AdminComponent),
    title: 'Administración — Entre Panes',
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
