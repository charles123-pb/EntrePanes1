import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Proveedor, Insumo, Producto, Venta, Compra, KardexEntry } from '../models/models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

  // Proveedores
  proveedores(): Observable<Proveedor[]> {
    if (environment.useMock) return of([] as Proveedor[]);
    return this.http.get<Proveedor[]>(`${environment.apiUrl}/proveedores`);
  }

  // Insumos
  insumos(): Observable<Insumo[]> {
    if (environment.useMock) return of([] as Insumo[]);
    return this.http.get<Insumo[]>(`${environment.apiUrl}/insumos`);
  }

  // Productos
  productos(): Observable<Producto[]> {
    if (environment.useMock) return of([] as Producto[]);
    return this.http.get<Producto[]>(`${environment.apiUrl}/productos`);
  }

  // Ventas
  ventas(): Observable<Venta[]> {
    if (environment.useMock) return of([] as Venta[]);
    return this.http.get<Venta[]>(`${environment.apiUrl}/ventas`);
  }

  // Compras
  compras(): Observable<Compra[]> {
    if (environment.useMock) return of([] as Compra[]);
    return this.http.get<Compra[]>(`${environment.apiUrl}/compras`);
  }

  // Kardex
  kardex(): Observable<KardexEntry[]> {
    if (environment.useMock) return of([] as KardexEntry[]);
    return this.http.get<KardexEntry[]>(`${environment.apiUrl}/kardex`);
  }
}
