import { Injectable, inject } from '@angular/core';
import { AppStateService } from './app-state.service';
import { Producto, Venta, Compra, Cliente, Insumo } from '../models/models';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';

@Injectable({ providedIn: 'root' })
export class ImportExportService {
  private store = inject(AppStateService);

  /**
   * Exportar productos como CSV
   */
  exportProductosCSV(): void {
    const productos = this.store.productos();
    const csv = this.convertToCSV(productos, ['id', 'nombre', 'cat', 'precio', 'costo']);
    this.downloadFile(csv, 'productos.csv', 'text/csv');
  }

  /**
   * Exportar productos como JSON
   */
  exportProductosJSON(): void {
    const productos = this.store.productos();
    const json = JSON.stringify(productos, null, 2);
    this.downloadFile(json, 'productos.json', 'application/json');
  }

  /**
   * Exportar ventas como CSV
   */
  exportVentasCSV(): void {
    const ventas = this.store.ventas();
    const data = ventas.map(v => ({
      id: v.id,
      fecha: v.fecha,
      items: v.items.length,
      subtotal: v.subtotal,
      descuento: v.descuento,
      total: v.total,
      metodo: v.metodo,
      cajero: v.cajero,
      estado: v.estado
    }));
    const csv = this.convertToCSV(data);
    this.downloadFile(csv, 'ventas.csv', 'text/csv');
  }

  /**
   * Exportar ventas como JSON
   */
  exportVentasJSON(): void {
    const ventas = this.store.ventas();
    const json = JSON.stringify(ventas, null, 2);
    this.downloadFile(json, 'ventas.json', 'application/json');
  }

  /**
   * Exportar compras como CSV
   */
  exportComprasCSV(): void {
    const compras = this.store.compras();
    const data = compras.map(c => ({
      id: c.id,
      fecha: c.fecha,
      prov_id: c.prov_id,
      items: c.items.length,
      total: c.total,
      tipo_comp: c.tipo_comp,
      en_sire: c.en_sire
    }));
    const csv = this.convertToCSV(data);
    this.downloadFile(csv, 'compras.csv', 'text/csv');
  }

  /**
   * Exportar compras como JSON
   */
  exportComprasJSON(): void {
    const compras = this.store.compras();
    const json = JSON.stringify(compras, null, 2);
    this.downloadFile(json, 'compras.json', 'application/json');
  }

  /**
   * Exportar insumos como CSV
   */
  exportInsumosCSV(): void {
    const insumos = this.store.insumos();
    const csv = this.convertToCSV(insumos, ['id', 'nombre', 'unidad', 'stock', 'stock_min', 'costo']);
    this.downloadFile(csv, 'insumos.csv', 'text/csv');
  }

  /**
   * Exportar insumos como JSON
   */
  exportInsumosJSON(): void {
    const insumos = this.store.insumos();
    const json = JSON.stringify(insumos, null, 2);
    this.downloadFile(json, 'insumos.json', 'application/json');
  }

  /**
   * Exportar clientes como CSV
   */
  exportClientesCSV(): void {
    const clientes = this.store.clientes();
    const data = clientes.map(c => ({
      id: c.id,
      nombre: c.nombre,
      documento: c.documento || '',
      telefono: c.telefono || '',
      total_gastado: c.total_gastado,
      num_compras: c.num_compras,
      ultima_compra: c.ultima_compra
    }));
    const csv = this.convertToCSV(data);
    this.downloadFile(csv, 'clientes.csv', 'text/csv');
  }

  /**
   * Exportar clientes como JSON
   */
  exportClientesJSON(): void {
    const clientes = this.store.clientes();
    const json = JSON.stringify(clientes, null, 2);
    this.downloadFile(json, 'clientes.json', 'application/json');
  }

  /**
   * Exportar todo como ZIP
   */
  async exportAllAsZIP(): Promise<void> {
    const zip = new JSZip();

    // Agregar todos los datos en JSON
    zip.file('productos.json', JSON.stringify(this.store.productos(), null, 2));
    zip.file('ventas.json', JSON.stringify(this.store.ventas(), null, 2));
    zip.file('compras.json', JSON.stringify(this.store.compras(), null, 2));
    zip.file('insumos.json', JSON.stringify(this.store.insumos(), null, 2));
    zip.file('clientes.json', JSON.stringify(this.store.clientes(), null, 2));
    zip.file('proveedores.json', JSON.stringify(this.store.proveedores(), null, 2));
    zip.file('kategorias.json', JSON.stringify(this.store.categorias(), null, 2));

    // Agregar CSVs
    zip.file('productos.csv', this.convertToCSV(this.store.productos()));
    zip.file('ventas.csv', this.convertToCSV(this.store.ventas().map(v => ({
      id: v.id, fecha: v.fecha, total: v.total, metodo: v.metodo, estado: v.estado
    }))));
    zip.file('clientes.csv', this.convertToCSV(this.store.clientes()));

    // Generar y descargar ZIP
    const blob = await zip.generateAsync({ type: 'blob' });
    this.downloadFile(blob, 'entre-panes-export.zip', 'application/zip');
  }

  /**
   * Exportar como Excel (todas las hojas)
   */
  exportAllAsExcel(): void {
    const workbook = XLSX.utils.book_new();

    // Hoja de productos
    const productsSheet = XLSX.utils.json_to_sheet(this.store.productos());
    XLSX.utils.book_append_sheet(workbook, productsSheet, 'Productos');

    // Hoja de ventas (resumen)
    const ventasData = this.store.ventas().map(v => ({
      id: v.id,
      fecha: v.fecha,
      items: v.items.length,
      subtotal: v.subtotal,
      descuento: v.descuento,
      total: v.total,
      metodo: v.metodo,
      estado: v.estado
    }));
    const ventasSheet = XLSX.utils.json_to_sheet(ventasData);
    XLSX.utils.book_append_sheet(workbook, ventasSheet, 'Ventas');

    // Hoja de compras
    const comprasData = this.store.compras().map(c => ({
      id: c.id,
      fecha: c.fecha,
      prov_id: c.prov_id,
      items: c.items.length,
      total: c.total,
      tipo_comp: c.tipo_comp
    }));
    const comprasSheet = XLSX.utils.json_to_sheet(comprasData);
    XLSX.utils.book_append_sheet(workbook, comprasSheet, 'Compras');

    // Hoja de insumos
    const insumosSheet = XLSX.utils.json_to_sheet(this.store.insumos());
    XLSX.utils.book_append_sheet(workbook, insumosSheet, 'Insumos');

    // Hoja de clientes
    const clientesSheet = XLSX.utils.json_to_sheet(this.store.clientes());
    XLSX.utils.book_append_sheet(workbook, clientesSheet, 'Clientes');

    XLSX.writeFile(workbook, `entre-panes-export-${this.getTodayStr()}.xlsx`);
  }

  /**
   * Importar productos desde JSON
   */
  importProductosJSON(file: File): Promise<void> {
    return this.importJSONFile(file).then(data => {
      if (!Array.isArray(data)) throw new Error('Invalid format');
      // Validar estructura
      data.forEach(item => {
        if (!item.id || !item.nombre) throw new Error('Missing required fields');
      });
      // Actualizar estado (merge con existentes)
      const existentes = this.store.productos();
      const merged = this.mergeById(existentes, data);
      this.store.update({ productos: merged });
    });
  }

  /**
   * Importar clientes desde JSON
   */
  importClientesJSON(file: File): Promise<void> {
    return this.importJSONFile(file).then(data => {
      if (!Array.isArray(data)) throw new Error('Invalid format');
      data.forEach(item => {
        if (!item.id || !item.nombre) throw new Error('Missing required fields');
      });
      const existentes = this.store.clientes();
      const merged = this.mergeById(existentes, data);
      this.store.update({ clientes: merged });
    });
  }

  /**
   * Importar insumos desde JSON
   */
  importInsumosJSON(file: File): Promise<void> {
    return this.importJSONFile(file).then(data => {
      if (!Array.isArray(data)) throw new Error('Invalid format');
      data.forEach(item => {
        if (!item.id || !item.nombre) throw new Error('Missing required fields');
      });
      const existentes = this.store.insumos();
      const merged = this.mergeById(existentes, data);
      this.store.update({ insumos: merged });
    });
  }

  /**
   * Leer archivo JSON
   */
  private importJSONFile(file: File): Promise<any> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          resolve(data);
        } catch (e) {
          reject(new Error('Invalid JSON file'));
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  }

  /**
   * Convertir array a CSV
   */
  private convertToCSV(data: any[], fields?: string[]): string {
    if (!data.length) return '';

    const keys = fields || Object.keys(data[0]);
    const headers = keys.join(',');
    const rows = data.map(row =>
      keys.map(key => {
        const value = row[key];
        if (value === null || value === undefined) return '';
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        return value;
      }).join(',')
    );

    return [headers, ...rows].join('\n');
  }

  /**
   * Descargar archivo
   */
  private downloadFile(data: string | Blob, filename: string, mimeType: string): void {
    let blob: Blob;
    if (typeof data === 'string') {
      blob = new Blob([data], { type: mimeType });
    } else {
      blob = data;
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Merge de arrays por ID (actualiza existentes, agrega nuevos)
   */
  private mergeById(existing: any[], incoming: any[]): any[] {
    const map = new Map(existing.map(item => [item.id, item]));
    incoming.forEach(item => map.set(item.id, item));
    return Array.from(map.values());
  }

  /**
   * Obtener fecha actual como string
   */
  private getTodayStr(): string {
    return new Date().toISOString().split('T')[0];
  }
}
