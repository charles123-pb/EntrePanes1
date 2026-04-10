import { Injectable, inject } from '@angular/core';
import { AppStateService } from './app-state.service';
import { AnalisisService } from './analisis.service';
import { Venta, MetodoPago } from '../models/models';

export interface AnalyticsMetric {
  id: string;
  nombre: string;
  valor: number;
  unidad: string;
  trend?: 'up' | 'down' | 'stable';
  trendPercent?: number;
  color?: string;
}

export interface SalesAnalytics {
  totalVentas: AnalyticsMetric;
  ventasPorProducto: { nombre: string; total: number; percent: number; margen?: number }[];
  ventasPorMetodo: { metodo: MetodoPago; total: number; percent: number }[];
  ventasPorHora: { hora: number; ventas: number }[];
  clientesFrecuentes: { nombre: string; id: number; compras: number; gasto: number; ticket_promedio: number }[];
  margenPromedio: AnalyticsMetric;
  ticketPromedio: AnalyticsMetric;
}

export interface FinancialAnalytics {
  costoTotal: AnalyticsMetric;
  gananciaTotal: AnalyticsMetric;
  margenNeto: AnalyticsMetric;
  margenBruto: AnalyticsMetric;
  topProductosPorMargen: { nombre: string; margen: number; margenPct: number }[];
  productoCritico: { nombre: string; margen: number; precio: number }[];
}

export interface InventoryAnalytics {
  productosConStockBajo: { id: number; nombre: string; stock: number; minimo: number }[];
  valorInventario: AnalyticsMetric;
  rotacionPromedio: AnalyticsMetric;
  totalProductos: AnalyticsMetric;
}

@Injectable({ providedIn: 'root' })
export class AdvancedAnalyticsService {
  private store = inject(AppStateService);
  private analisis = inject(AnalisisService);

  /**
   * Obtener análisis de ventas para un período
   */
  getSalesAnalytics(periodo: 'hoy' | 'semana' | 'mes' | 'año' = 'mes'): SalesAnalytics {
    const ventas = this.filterByPeriodo(this.store.ventas(), periodo);
    const ventasCompletas = ventas.filter(v => v.estado === 'completada');

    const totalVentas = ventasCompletas.reduce((s, v) => s + v.total, 0);
    const cantVentas = ventasCompletas.length;

    // Productos con más revenue
    const ventasPorProducto = this.getTopProductsByRevenue(ventasCompletas, 10);

    // Ventas por método de pago
    const ventasPorMetodo = this.getSalesDistributionByMethod(ventasCompletas);

    // Ventas por hora
    const ventasPorHora = this.getSalesPerHour(ventasCompletas);

    // Clientes frecuentes
    const clientesFrecuentes = this.getTopCustomers(ventasCompletas, 5);

    // Margen promedio
    const margenPromedio = this.calculateAverageMargin(ventasCompletas);

    // Ticket promedio
    const ticketPromedio = cantVentas > 0 ? totalVentas / cantVentas : 0;

    return {
      totalVentas: {
        id: 'total_ventas',
        nombre: 'Total Ventas',
        valor: totalVentas,
        unidad: 'S/',
        trend: this.calculateTrend(ventasCompletas),
        trendPercent: this.calculateTrendPercent(ventasCompletas, periodo),
        color: '#fbbf24'
      },
      ventasPorProducto,
      ventasPorMetodo,
      ventasPorHora,
      clientesFrecuentes,
      margenPromedio: {
        id: 'margen_promedio',
        nombre: 'Margen Promedio',
        valor: margenPromedio,
        unidad: '%',
        color: '#86efac'
      },
      ticketPromedio: {
        id: 'ticket_promedio',
        nombre: 'Ticket Promedio',
        valor: ticketPromedio,
        unidad: 'S/',
        color: '#60a5fa'
      }
    };
  }

  /**
   * Obtener análisis financiero
   */
  getFinancialAnalytics(periodo: 'hoy' | 'semana' | 'mes' | 'año' = 'mes'): FinancialAnalytics {
    const ventas = this.filterByPeriodo(this.store.ventas(), periodo)
      .filter(v => v.estado === 'completada');
    const compras = this.filterByPeriodo(this.store.compras(), periodo);

    const costoTotal = compras.reduce((s, c) => s + c.total, 0);
    const ventaTotal = ventas.reduce((s, v) => s + v.total, 0);
    const gananciaTotal = ventaTotal - costoTotal;
    const margenNeto = ventaTotal > 0 ? (gananciaTotal / ventaTotal) * 100 : 0;
    const margenBruto = ventaTotal > 0 ? ((ventaTotal - costoTotal) / ventaTotal) * 100 : 0;

    return {
      costoTotal: {
        id: 'costo_total',
        nombre: 'Costo Total',
        valor: costoTotal,
        unidad: 'S/',
        color: '#f87171'
      },
      gananciaTotal: {
        id: 'ganancia_total',
        nombre: 'Ganancia Total',
        valor: gananciaTotal,
        unidad: 'S/',
        trend: gananciaTotal > 0 ? 'up' : 'down',
        color: '#34d399'
      },
      margenNeto: {
        id: 'margen_neto',
        nombre: 'Margen Neto',
        valor: margenNeto,
        unidad: '%',
        color: '#a78bfa'
      },
      margenBruto: {
        id: 'margen_bruto',
        nombre: 'Margen Bruto',
        valor: margenBruto,
        unidad: '%',
        color: '#fbbf24'
      },
      topProductosPorMargen: this.analisis.productosRentables().slice(0, 5),
      productoCritico: this.analisis.productosCriticos().slice(0, 5)
    };
  }

  /**
   * Obtener análisis de inventario
   */
  getInventoryAnalytics(): InventoryAnalytics {
    const productos = this.store.productos();
    const insumos = this.store.insumos();

    // Productos/insumos con stock bajo
    const productosConStockBajo = insumos
      .filter(i => i.stock <= i.stock_min)
      .map(i => ({
        id: i.id,
        nombre: i.nombre,
        stock: i.stock,
        minimo: i.stock_min
      }))
      .slice(0, 10);

    // Valor total del inventario
    const valorInventario = insumos.reduce((s, i) => s + (i.stock * i.costo), 0);

    // Rotación promedio (basado en kardex)
    const kardex = this.store.kardex();
    const rotacion = kardex.length > 0 ? (kardex.filter(k => k.tipo === 'salida').length / kardex.length) * 100 : 0;

    return {
      productosConStockBajo,
      valorInventario: {
        id: 'valor_inventario',
        nombre: 'Valor del Inventario',
        valor: valorInventario,
        unidad: 'S/',
        color: '#60a5fa'
      },
      rotacionPromedio: {
        id: 'rotacion_promedio',
        nombre: 'Tasa de Rotación',
        valor: rotacion,
        unidad: '%',
        color: '#34d399'
      },
      totalProductos: {
        id: 'total_productos',
        nombre: 'Total de Productos',
        valor: productos.length,
        unidad: 'pcs',
        color: '#c084fc'
      }
    };
  }

  /**
   * Productos más vendidos por revenue
   */
  private getTopProductsByRevenue(
    ventas: Venta[],
    limit: number = 10
  ): { nombre: string; total: number; percent: number; margen?: number }[] {
    const products = new Map<number, { nombre: string; total: number; items: number }>();

    ventas.forEach(sale => {
      sale.items.forEach(item => {
        const prod = this.store.productos().find(p => p.id === item.id);
        if (prod) {
          const existing = products.get(item.id) || { nombre: prod.nombre, total: 0, items: 0 };
          existing.total += item.sub;
          existing.items += item.cant;
          products.set(item.id, existing);
        }
      });
    });

    const total = Array.from(products.values()).reduce((s, p) => s + p.total, 0);
    return Array.from(products.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, limit)
      .map(p => ({
        nombre: p.nombre,
        total: p.total,
        percent: total > 0 ? (p.total / total) * 100 : 0,
        margen: 0 // Calculado después
      }));
  }

  /**
   * Distribución de ventas por método de pago
   */
  private getSalesDistributionByMethod(
    ventas: Venta[]
  ): { metodo: MetodoPago; total: number; percent: number }[] {
    const distribution = new Map<MetodoPago, number>();

    ventas.forEach(v => {
      const current = distribution.get(v.metodo) || 0;
      distribution.set(v.metodo, current + v.total);
    });

    const total = Array.from(distribution.values()).reduce((s, v) => s + v, 0);
    return Array.from(distribution.entries()).map(([metodo, value]) => ({
      metodo,
      total: value,
      percent: total > 0 ? (value / total) * 100 : 0
    }));
  }

  /**
   * Ventas por hora del día
   */
  private getSalesPerHour(ventas: Venta[]): { hora: number; ventas: number }[] {
    const hourly = new Map<number, number>();

    for (let i = 0; i < 24; i++) {
      hourly.set(i, 0);
    }

    ventas.forEach(v => {
      const hora = parseInt(v.fecha.split('T')[1].split(':')[0]);
      hourly.set(hora, (hourly.get(hora) || 0) + 1);
    });

    return Array.from(hourly.entries()).map(([hora, count]) => ({
      hora,
      ventas: count
    }));
  }

  /**
   * Clientes más frecuentes
   */
  private getTopCustomers(
    ventas: Venta[],
    limit: number = 5
  ): { nombre: string; id: number; compras: number; gasto: number; ticket_promedio: number }[] {
    const customers = new Map<number, { nombre: string; compras: number; gasto: number }>();

    ventas.forEach(v => {
      if (v.cliente_id) {
        const existing = customers.get(v.cliente_id) || {
          nombre: this.store.clientes().find(c => c.id === v.cliente_id)?.nombre || 'Unknown',
          compras: 0,
          gasto: 0
        };
        existing.compras += 1;
        existing.gasto += v.total;
        customers.set(v.cliente_id, existing);
      }
    });

    return Array.from(customers.entries())
      .map(([id, data]) => ({
        ...data,
        id,
        ticket_promedio: data.gasto / data.compras
      }))
      .sort((a, b) => b.gasto - a.gasto)
      .slice(0, limit);
  }

  /**
   * Margen promedio
   */
  private calculateAverageMargin(ventas: Venta[]): number {
    if (!ventas.length) return 0;

    let totalMargen = 0;
    let count = 0;

    ventas.forEach(v => {
      v.items.forEach(item => {
        const prod = this.store.productos().find(p => p.id === item.id);
        if (prod && prod.costo > 0) {
          const margenPct = ((item.pu - prod.costo) / item.pu) * 100;
          totalMargen += margenPct;
          count++;
        }
      });
    });

    return count > 0 ? totalMargen / count : 0;
  }

  /**
   * Detectar tendencia
   */
  private calculateTrend(ventas: Venta[]): 'up' | 'down' | 'stable' {
    if (ventas.length < 2) return 'stable';

    const mitad = Math.floor(ventas.length / 2);
    const primeraHalf = ventas.slice(0, mitad).reduce((s, v) => s + v.total, 0);
    const segundaHalf = ventas.slice(mitad).reduce((s, v) => s + v.total, 0);

    if (segundaHalf > primeraHalf * 1.1) return 'up';
    if (segundaHalf < primeraHalf * 0.9) return 'down';
    return 'stable';
  }

  /**
   * Calcular porcentaje de tendencia
   */
  private calculateTrendPercent(ventas: Venta[], periodo: string): number {
    if (ventas.length < 2) return 0;

    const mitad = Math.floor(ventas.length / 2);
    const primeraHalf = ventas.slice(0, mitad).reduce((s, v) => s + v.total, 0);
    const segundaHalf = ventas.slice(mitad).reduce((s, v) => s + v.total, 0);

    if (primeraHalf === 0) return 0;
    return Math.round(((segundaHalf - primeraHalf) / primeraHalf) * 100);
  }

  /**
   * Filtrar por período (genérico)
   */
  private filterByPeriodo<T extends { fecha: string }>(items: T[], periodo: 'hoy' | 'semana' | 'mes' | 'año'): T[] {
    const today = new Date();
    let from = new Date();

    switch (periodo) {
      case 'hoy':
        from = new Date(today.setHours(0, 0, 0, 0));
        break;
      case 'semana':
        from.setDate(today.getDate() - 7);
        break;
      case 'mes':
        from.setMonth(today.getMonth() - 1);
        break;
      case 'año':
        from.setFullYear(today.getFullYear() - 1);
        break;
    }

    const fromStr = from.toISOString().split('T')[0];
    const toStr = today.toISOString().split('T')[0];

    return items.filter(item => item.fecha >= fromStr && item.fecha <= toStr);
  }
}
