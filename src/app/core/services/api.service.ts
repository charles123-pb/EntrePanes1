import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, retry, timeout } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Proveedor, Insumo, Producto, Venta, Compra, KardexEntry } from '../models/models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly API_TIMEOUT = 30000; // 30 segundos
  private readonly RETRY_ATTEMPTS = 2;

  constructor(private http: HttpClient) {}

  // ── Métodos privados de utilidad  ──
  private handleError(error: HttpErrorResponse) {
    console.error('API Error:', error);
    let message = 'Error en la conexión';
    if (error.status === 0) {
      message = 'No se puede conectar con el servidor. Verifica que esté en línea.';
    } else if (error.status === 404) {
      message = 'Recurso no encontrado';
    } else if (error.status === 500) {
      message = 'Error interno del servidor';
    }
    return throwError(() => new Error(message));
  }

  private createRequest<T>(endpoint: string): Observable<T> {
    return this.http.get<T>(`${environment.apiUrl}${endpoint}`).pipe(
      timeout(this.API_TIMEOUT),
      retry(this.RETRY_ATTEMPTS),
      catchError(err => this.handleError(err))
    );
  }

  private createPostRequest<T>(endpoint: string, body: any): Observable<T> {
    return this.http.post<T>(`${environment.apiUrl}${endpoint}`, body).pipe(
      timeout(this.API_TIMEOUT),
      catchError(err => this.handleError(err))
    );
  }

  // ── Proveedores
  proveedores(): Observable<Proveedor[]> {
    if (environment.useMock) return of([] as Proveedor[]);
    return this.createRequest<Proveedor[]>('/proveedores');
  }

  createProveedor(proveedor: Omit<Proveedor, 'id'>): Observable<Proveedor> {
    if (environment.useMock) return of({ ...proveedor, id: 1 } as Proveedor);
    return this.createPostRequest<Proveedor>('/proveedores', proveedor);
  }

  // ── Insumos
  insumos(): Observable<Insumo[]> {
    if (environment.useMock) return of([] as Insumo[]);
    return this.createRequest<Insumo[]>('/insumos');
  }

  createInsumo(insumo: Omit<Insumo, 'id'>): Observable<Insumo> {
    if (environment.useMock) return of({ ...insumo, id: 1 } as Insumo);
    return this.createPostRequest<Insumo>('/insumos', insumo);
  }

  // ── Productos
  productos(): Observable<Producto[]> {
    if (environment.useMock) return of([] as Producto[]);
    return this.createRequest<Producto[]>('/productos');
  }

  createProducto(producto: Omit<Producto, 'id'>): Observable<Producto> {
    if (environment.useMock) return of({ ...producto, id: 1 } as Producto);
    return this.createPostRequest<Producto>('/productos', producto);
  }

  // ── Ventas
  ventas(): Observable<Venta[]> {
    if (environment.useMock) return of([] as Venta[]);
    return this.createRequest<Venta[]>('/ventas');
  }

  createVenta(venta: Omit<Venta, 'id'>): Observable<Venta> {
    if (environment.useMock) return of({ ...venta, id: 1 } as Venta);
    return this.createPostRequest<Venta>('/ventas', venta);
  }

  // ── Compras
  compras(): Observable<Compra[]> {
    if (environment.useMock) return of([] as Compra[]);
    return this.createRequest<Compra[]>('/compras');
  }

  createCompra(compra: Omit<Compra, 'id'>): Observable<Compra> {
    if (environment.useMock) return of({ ...compra, id: 1 } as Compra);
    return this.createPostRequest<Compra>('/compras', compra);
  }

  // ── Kardex
  kardex(): Observable<KardexEntry[]> {
    if (environment.useMock) return of([] as KardexEntry[]);
    return this.createRequest<KardexEntry[]>('/kardex');
  }

  // ── Imágenes de productos
  uploadProductImage(file: File): Observable<{ url: string; id: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'producto');
    return this.http.post<{ url: string; id: string }>(`${environment.apiUrl}/upload`, formData).pipe(
      timeout(this.API_TIMEOUT),
      catchError(err => this.handleError(err))
    );
  }

  // ── Health check
  healthCheck(): Observable<{ status: string }> {
    return this.http.get<{ status: string }>(`${environment.apiUrl}/health`).pipe(
      timeout(5000),
      catchError(() => of({ status: 'offline' }))
    );
  }
}
