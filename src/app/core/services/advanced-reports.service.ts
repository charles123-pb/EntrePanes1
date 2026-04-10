import { Injectable, inject } from '@angular/core';
import { AppStateService } from './app-state.service';
import { AnalisisService } from './analisis.service';
import { AdvancedAnalyticsService } from './advanced-analytics.service';
import * as jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

export interface ReportData {
  titulo: string;
  fecha: string;
  generador_usuario: string;
  datos: any;
  formato?: 'PDF' | 'Excel' | 'CSV';
}

@Injectable({ providedIn: 'root' })
export class AdvancedReportsService {
  private store = inject(AppStateService);
  private analisis = inject(AnalisisService);
  private analytics = inject(AdvancedAnalyticsService);

  /**
   * Generar reporte de ventas diarias
   */
  generateDailySalesReport(fecha?: string): ReportData {
    const date = fecha || this.getTodayStr();
    const ventas = this.store.ventas()
      .filter(v => v.fecha.startsWith(date) && v.estado === 'completada');

    const porMetodo = new Map<string, number>();
    let cantItemsTotales = 0;
    let totalDescuentos = 0;

    ventas.forEach(v => {
      const actual = porMetodo.get(v.metodo) || 0;
      porMetodo.set(v.metodo, actual + v.total);
      cantItemsTotales += v.items.length;
      totalDescuentos += v.descuento;
    });

    const totalVentas = ventas.reduce((s, v) => s + v.total, 0);
    const promedio = ventas.length ? totalVentas / ventas.length : 0;

    return {
      titulo: `REPORTE VENTAS DIARIAS - ${date}`,
      fecha: new Date().toISOString(),
      generador_usuario: 'sistema',
      datos: {
        fecha: date,
        totalVentas,
        cantidadTransacciones: ventas.length,
        promedioTicket: promedio,
        totalItems: cantItemsTotales,
        totalDescuentos,
        ventasPorMetodo: Object.fromEntries(porMetodo),
        detalles: ventas.map(v => ({
          id: v.id,
          hora: v.fecha.split('T')[1],
          items: v.items.length,
          subtotal: v.subtotal,
          descuento: v.descuento,
          total: v.total,
          metodo: v.metodo,
          cajero: v.cajero
        }))
      }
    };
  }

  /**
   * Generar Estado de Resultados (P&L)
   */
  generatePLStatement(fechaDesde?: string, fechaHasta?: string): ReportData {
    const desde = fechaDesde || this.getFirstDayOfMonthStr();
    const hasta = fechaHasta || this.getTodayStr();

    const ventas = this.store.ventas()
      .filter(v => v.fecha >= desde && v.fecha <= hasta && v.estado === 'completada');
    const compras = this.store.compras()
      .filter(c => c.fecha >= desde && c.fecha <= hasta);

    const ingresos = ventas.reduce((s, v) => s + v.total, 0);
    const costos = compras.reduce((s, c) => s + c.total, 0);
    const gananciaBruta = ingresos - costos;
    const margenBruto = ingresos > 0 ? (gananciaBruta / ingresos) * 100 : 0;

    return {
      titulo: `ESTADO DE RESULTADOS (P&L) ${desde} / ${hasta}`,
      fecha: new Date().toISOString(),
      generador_usuario: 'sistema',
      datos: {
        periodo: { desde, hasta },
        ingresos,
        costos,
        gananciaBruta,
        margenBruto,
        margenNeto: margenBruto, // Sin gastos operativos
        totalTransacciones: ventas.length + compras.length,
        ticketPromedio: ventas.length > 0 ? ingresos / ventas.length : 0,
        costoPorVenta: ventas.length > 0 ? costos / ventas.length : 0
      }
    };
  }

  /**
   * Generar reporte de desempeño de productos
   */
  generateProductPerformance(): ReportData {
    const products = this.analisis.productosConCosto()
      .sort((a, b) => b.margen - a.margen);

    const ventasPorProducto = new Map<number, { cant: number; total: number }>();

    this.store.ventas()
      .filter(v => v.estado === 'completada')
      .forEach(v => {
        v.items.forEach(item => {
          const existing = ventasPorProducto.get(item.id) || { cant: 0, total: 0 };
          existing.cant += item.cant;
          existing.total += item.sub;
          ventasPorProducto.set(item.id, existing);
        });
      });

    const datos = products.map(p => ({
      id: p.id,
      nombre: p.nombre,
      precioVenta: p.precio,
      costo: p.costo,
      margen: p.margen,
      margenPct: p.margenPct,
      rentable: p.rentable,
      ventasUnidades: ventasPorProducto.get(p.id)?.cant || 0,
      ventasTotal: ventasPorProducto.get(p.id)?.total || 0
    }));

    return {
      titulo: 'DESEMPEÑO DE PRODUCTOS',
      fecha: new Date().toISOString(),
      generador_usuario: 'sistema',
      datos: {
        detalles: datos,
        topPorMargen: datos.slice(0, 10),
        topPorVentas: [...datos].sort((a, b) => b.ventasTotal - a.ventasTotal).slice(0, 10),
        criticos: datos.filter(p => !p.rentable).slice(0, 10)
      }
    };
  }

  /**
   * Generar análisis de clientes
   */
  generateCustomerAnalysis(): ReportData {
    const clientes = this.store.clientes()
      .filter(c => c.num_compras > 0)
      .sort((a, b) => b.total_gastado - a.total_gastado);

    const topClientes = clientes.slice(0, 20);
    const stats = {
      totalClientes: this.store.clientes().length,
      clientesActivos: clientes.length,
      clientesInactivos: this.store.clientes().length - clientes.length,
      gastoPromedio: clientes.length > 0
        ? clientes.reduce((s, c) => s + c.total_gastado, 0) / clientes.length
        : 0,
      comprasPromedio: clientes.length > 0
        ? clientes.reduce((s, c) => s + c.num_compras, 0) / clientes.length
        : 0,
      ticketPromedio: clientes.length > 0
        ? clientes.reduce((s, c) => s + c.total_gastado, 0) /
        clientes.reduce((s, c) => s + c.num_compras, 0)
        : 0
    };

    return {
      titulo: 'ANÁLISIS DE CLIENTES',
      fecha: new Date().toISOString(),
      generador_usuario: 'sistema',
      datos: {
        estadisticas: stats,
        topClientes: topClientes.map(c => ({
          id: c.id,
          nombre: c.nombre,
          totalGastado: c.total_gastado,
          numCompras: c.num_compras,
          ticketPromedio: c.total_gastado / c.num_compras,
          ultimaCompra: c.ultima_compra,
          desuentoPct: c.descuento_pct || 0
        }))
      }
    };
  }

  /**
   * Generar valuación de inventario
   */
  generateInventoryValuation(): ReportData {
    const insumos = this.store.insumos();
    const valores = insumos.map(i => ({
      id: i.id,
      nombre: i.nombre,
      stock: i.stock,
      costo: i.costo,
      valor: i.stock * i.costo,
      stockMin: i.stock_min,
      stockAlerta: i.stock <= i.stock_min
    }));

    const valorTotal = valores.reduce((s, v) => s + v.valor, 0);
    const itemsCriticos = valores.filter(v => v.stockAlerta).length;

    return {
      titulo: 'VALUACIÓN DE INVENTARIO',
      fecha: new Date().toISOString(),
      generador_usuario: 'sistema',
      datos: {
        valorTotal,
        cantidadItems: insumos.length,
        itemsCriticos,
        valorPromedioPorItem: valorTotal / insumos.length,
        detalles: valores.sort((a, b) => b.valor - a.valor),
        criticos: valores.filter(v => v.stockAlerta)
      }
    };
  }

  /**
   * Exportar reporte a PDF
   */
  exportToPDF(report: ReportData, filename?: string): void {
    try {
      const doc = new jsPDF.jsPDF();
      const fontSize = 12;

      // Título
      doc.setFontSize(16);
      doc.text(report.titulo, 10, 20);

      // Meta información
      doc.setFontSize(10);
      doc.text(`Generado: ${new Date(report.fecha).toLocaleString()}`, 10, 30);

      // Contenido
      doc.setFontSize(11);
      let yPosition = 40;

      if (report.datos.detalles && Array.isArray(report.datos.detalles)) {
        report.datos.detalles.forEach((item: any) => {
          if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
          }

          doc.text(`${JSON.stringify(item)}`, 10, yPosition);
          yPosition += 5;
        });
      } else {
        const keys = Object.keys(report.datos);
        keys.forEach(key => {
          if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
          }

          const value = report.datos[key];
          if (typeof value === 'object') {
            doc.text(`${key}: ${JSON.stringify(value).substring(0, 50)}...`, 10, yPosition);
          } else {
            doc.text(`${key}: ${value}`, 10, yPosition);
          }
          yPosition += 5;
        });
      }

      const fname = filename || `reporte-${report.titulo.replace(/\s+/g, '-')}-${this.getTodayStr()}.pdf`;
      doc.save(fname);
    } catch (e) {
      console.error('Error generating PDF:', e);
    }
  }

  /**
   * Exportar reporte a Excel
   */
  exportToExcel(report: ReportData, filename?: string): void {
    try {
      const workbook = XLSX.utils.book_new();

      // Crear hoja
      let sheetData: any[] = [];

      if (report.datos.detalles && Array.isArray(report.datos.detalles)) {
        sheetData = report.datos.detalles;
      } else if (report.datos.topClientes) {
        sheetData = report.datos.topClientes;
      } else if (report.datos.detalles) {
        sheetData = [report.datos];
      }

      const sheet = XLSX.utils.json_to_sheet(sheetData);
      XLSX.utils.book_append_sheet(workbook, sheet, 'Reporte');

      const fname = filename || `reporte-${report.titulo.replace(/\s+/g, '-')}-${this.getTodayStr()}.xlsx`;
      XLSX.writeFile(workbook, fname);
    } catch (e) {
      console.error('Error generating Excel:', e);
    }
  }

  /**
   * Exportar reporte a CSV
   */
  exportToCSV(report: ReportData, filename?: string): string {
    let csv = `${report.titulo}\n`;
    csv += `Generado: ${new Date(report.fecha).toLocaleString()}\n\n`;

    if (report.datos.detalles && Array.isArray(report.datos.detalles)) {
      const keys = Object.keys(report.datos.detalles[0] || {});
      csv += keys.join(',') + '\n';
      report.datos.detalles.forEach((item: any) => {
        csv += keys.map(k => item[k] || '').join(',') + '\n';
      });
    }

    if (filename) {
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
    }

    return csv;
  }

  /**
   * Obtener lista de reportes disponibles
   */
  getAvailableReports() {
    return [
      { id: 'daily-sales', nombre: 'Ventas Diarias', generador: () => this.generateDailySalesReport() },
      { id: 'pl-statement', nombre: 'Estado de Resultados (P&L)', generador: () => this.generatePLStatement() },
      { id: 'product-perf', nombre: 'Desempeño de Productos', generador: () => this.generateProductPerformance() },
      { id: 'customer-anal', nombre: 'Análisis de Clientes', generador: () => this.generateCustomerAnalysis() },
      { id: 'inventory-val', nombre: 'Valuación de Inventario', generador: () => this.generateInventoryValuation() }
    ];
  }

  /**
   * Obtener fecha actual
   */
  private getTodayStr(): string {
    return new Date().toISOString().split('T')[0];
  }

  /**
   * Obtener primer día del mes actual
   */
  private getFirstDayOfMonthStr(): string {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    return firstDay.toISOString().split('T')[0];
  }
}
