import { Injectable, computed, inject } from '@angular/core';
import { AppStateService } from './app-state.service';
import { Producto, Venta } from '../models/models';

export interface ProductoCosto {
  id: number;
  nombre: string;
  precio: number;
  costo: number;
  margen: number;
  margenPct: number;
  rentable: boolean;
}

export interface AnálisisVenta {
  ventaId: number;
  precioVenta: number;
  costoTotal: number;
  ganancia: number;
  gananciaPct: number;
}

@Injectable({ providedIn: 'root' })
export class AnalisisService {
  private store = inject(AppStateService);

  /**
   * Análisis de costos de productos
   */
  productosConCosto = computed(() => {
    return this.store.productos().map(p => this.analizarProducto(p));
  });

  /**
   * Total de costo de ventas del día
   */
  costoTotalVentasHoy = computed(() => {
    const today = this.store.todayStr();
    const ventasHoy = this.store.ventas()
      .filter(v => v.fecha.startsWith(today) && v.estado === 'completada');
    return this.calcularCostoVentas(ventasHoy);
  });

  /**
   * Ganancia neta del día
   */
  gananciaNetaHoy = computed(() => {
    const today = this.store.todayStr();
    const ventasHoy = this.store.ventas()
      .filter(v => v.fecha.startsWith(today) && v.estado === 'completada');
    const ingresos = ventasHoy.reduce((s, v) => s + v.total, 0);
    const costo = this.calcularCostoVentas(ventasHoy);
    return this.store.round2(ingresos - costo);
  });

  /**
   * Margen promedio del día
   */
  margenPromedioDia = computed(() => {
    const today = this.store.todayStr();
    const ventasHoy = this.store.ventas()
      .filter(v => v.fecha.startsWith(today) && v.estado === 'completada');
    
    if (!ventasHoy.length) return 0;
    
    const totalPrecio = ventasHoy.reduce((s, v) => s + v.total, 0);
    const totalCosto = this.calcularCostoVentas(ventasHoy);
    
    if (!totalCosto) return 0;
    return this.store.round2((totalPrecio - totalCosto) / totalPrecio * 100);
  });

  /**
   * Productos críticos (bajo margen)
   */
  productosCriticos = computed(() => {
    return this.productosConCosto()
      .filter(p => p.margenPct < 20)
      .sort((a, b) => a.margenPct - b.margenPct);
  });

  /**
   * Productos más rentables
   */
  productosRentables = computed(() => {
    return this.productosConCosto()
      .filter(p => p.rentable)
      .sort((a, b) => b.ganancia - a.ganancia)
      .slice(0, 5);
  });

  /**
   * Análisis por categoría
   */
  análisisPorCategoria = computed(() => {
    const porCat: Record<string, { ingresos: number; costos: number; margen: number }> = {};
    
    this.store.productos().forEach(p => {
      if (!porCat[p.cat]) {
        porCat[p.cat] = { ingresos: 0, costos: 0, margen: 0 };
      }
    });

    this.store.ventas()
      .filter(v => v.estado === 'completada')
      .forEach(venta => {
        venta.items.forEach(item => {
          const prod = this.store.productos().find(p => p.id === item.id);
          if (prod) {
            porCat[prod.cat].ingresos += item.sub;
            porCat[prod.cat].costos += prod.costo * item.cant;
          }
        });
      });

    // Calcular margen por categoría
    Object.keys(porCat).forEach(cat => {
      const ingresos = porCat[cat].ingresos;
      if (ingresos > 0) {
        porCat[cat].margen = this.store.round2((ingresos - porCat[cat].costos) / ingresos * 100);
      }
    });

    return porCat;
  });

  /**
   * Genera CSV de análisis de costos
   */
  exportarCSVCostos(): string {
    const headers = ['Producto', 'Precio', 'Costo', 'Margen S/', 'Margen %', 'Rentable'];
    const rows = this.productosConCosto().map(p => [
      p.nombre,
      `S/ ${p.precio.toFixed(2)}`,
      `S/ ${p.costo.toFixed(2)}`,
      `S/ ${p.margen.toFixed(2)}`,
      `${p.margenPct.toFixed(1)}%`,
      p.rentable ? 'Sí' : 'No'
    ]);
    
    const csv = [headers, ...rows]
      .map(row => row.map(col => `"${col}"`).join(','))
      .join('\n');
    
    return csv;
  }

  // ── Private helpers

  private analizarProducto(p: Producto): ProductoCosto {
    const margen = this.store.round2(p.precio - p.costo);
    const margenPct = p.costo > 0 ? this.store.round2((margen / p.precio) * 100) : 0;
    const rentable = margenPct >= 20;

    return {
      id: p.id,
      nombre: p.nombre,
      precio: p.precio,
      costo: p.costo,
      margen,
      margenPct,
      rentable
    };
  }

  private calcularCostoVentas(ventas: Venta[]): number {
    let totalCosto = 0;

    ventas.forEach(venta => {
      venta.items.forEach(item => {
        const prod = this.store.productos().find(p => p.id === item.id);
        if (prod) {
          totalCosto += prod.costo * item.cant;
        }
      });
    });

    return this.store.round2(totalCosto);
  }
}
