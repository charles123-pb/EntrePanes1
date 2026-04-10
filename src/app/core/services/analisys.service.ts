import { Injectable, inject } from '@angular/core';
import { ProductoCosto, Producto, Venta, Insumo, RecetaItem } from '../models/models';
import { AppStateService } from './app-state.service';

/**
 * Servicio de Análisis - Calcula costos, márgenes y rentabilidad
 */
@Injectable({ providedIn: 'root' })
export class AnalisysService {
  private store = inject(AppStateService);

  /**
   * Calcula costo de producción de un producto basado en su receta
   */
  calcularCostoProducto(producto: Producto): number {
    if (!producto.receta || producto.receta.length === 0) return 0;

    return producto.receta.reduce((costo, recetaItem) => {
      const insumo = this.store.insumos().find(i => i.id === recetaItem.ins_id);
      if (!insumo) return costo;
      return costo + (insumo.costo * recetaItem.cant);
    }, 0);
  }

  /**
   * Obtiene análisis completo de un producto
   */
  getProductoCosto(producto: Producto): ProductoCosto {
    const costo = this.calcularCostoProducto(producto);
    const margen_bruto = producto.precio - costo;
    const margen_porcentaje = producto.precio > 0 ? (margen_bruto / producto.precio) * 100 : 0;

    return {
      id: producto.id,
      nombre: producto.nombre,
      precio_venta: producto.precio,
      costo_produccion: costo,
      margen_bruto,
      margen_porcentaje,
      ganancia_por_unidad: margen_bruto
    };
  }

  /**
   * Obtiene análisis de todos los productos
   */
  getAllProductosCosto(): ProductoCosto[] {
    return this.store.productos().map(p => this.getProductoCosto(p));
  }

  /**
   * Obtiene productos más rentables
   */
  getTopProductosPorMargen(limite: number = 10) {
    return this.getAllProductosCosto()
      .sort((a, b) => b.margen_porcentaje - a.margen_porcentaje)
      .slice(0, limite);
  }

  /**
   * Obtiene productos menos rentables (alerta)
   */
  getProductosBajoMargen(margenMinimo: number = 20): ProductoCosto[] {
    return this.getAllProductosCosto().filter(p => p.margen_porcentaje < margenMinimo);
  }

  /**
   * Calcula margen total de ventas del día
   */
  getMargenDelDia(ventasDelDia: Venta[]): { total_costo: number; total_margen: number; porcentaje: number } {
    let totalCosto = 0;
    let totalMargen = 0;

    ventasDelDia.forEach(venta => {
      venta.items.forEach(item => {
        const producto = this.store.productos().find(p => p.id === item.id);
        if (producto) {
          const costo = this.calcularCostoProducto(producto);
          const margen = (item.pu - costo) * item.cant;
          totalCosto += costo * item.cant;
          totalMargen += margen;
        }
      });
    });

    const ventaTotal = ventasDelDia.reduce((sum, v) => sum + v.total, 0);
    const porcentaje = ventaTotal > 0 ? (totalMargen / ventaTotal) * 100 : 0;

    return {
      total_costo: totalCosto,
      total_margen: totalMargen,
      porcentaje: Math.round(porcentaje * 100) / 100
    };
  }

  /**
   * Calcula rentabilidad mensual
   */
  getRentabilidadMensual(ventasMes: Venta[]) {
    const margen = this.getMargenDelDia(ventasMes);
    const totalVentas = ventasMes.reduce((sum, v) => sum + v.total, 0);

    return {
      total_ventas: totalVentas,
      total_costo: margen.total_costo,
      ganancia_bruta: margen.total_margen,
      margen_promedio: margen.porcentaje,
      ganancia_neta: margen.total_margen, // Sin gastos operacionales
      roi: totalVentas > 0 ? ((margen.total_margen / margen.total_costo) * 100) : 0
    };
  }

  /**
   * Exporta análisis a CSV
   */
  exportarAnalisisCSV(): string {
    const headers = ['Producto', 'Precio Venta', 'Costo Producción', 'Margen Bruto', 'Margen %', 'Ganancia Unitaria'];
    const rows = this.getAllProductosCosto().map(p => [
      p.nombre,
      p.precio_venta.toFixed(2),
      p.costo_produccion.toFixed(2),
      p.margen_bruto.toFixed(2),
      p.margen_porcentaje.toFixed(2),
      p.ganancia_por_unidad.toFixed(2)
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(r => r.map(c => `"${c}"`).join(','))
    ].join('\n');

    return csv;
  }
}
