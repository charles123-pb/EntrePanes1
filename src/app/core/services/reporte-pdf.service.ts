import { Injectable } from '@angular/core';
import { Venta, Cliente, AuditLog } from '../models/models';

/**
 * Servicio de Reportes PDF - Exporta ventas, análisis y reportes
 * Usa Print-to-PDF del navegador para generar PDFs
 */
@Injectable({ providedIn: 'root' })
export class ReportePdfService {

  /**
   * Genera reporte de ventas y abre diálogo de impresión
   */
  generarReportVentas(ventas: Venta[], titulo: string) {
    const html = this.generarHTMLVentas(ventas, titulo);
    this.abrirEnImpresora(html, titulo);
  }

  /**
   * Genera reporte de clientes
   */
  generarReportClientes(clientes: Cliente[], titulo: string) {
    const html = this.generarHTMLClientes(clientes, titulo);
    this.abrirEnImpresora(html, titulo);
  }

  /**
   * Genera reporte de auditoría
   */
  generarReportAuditoria(logs: AuditLog[], titulo: string) {
    const html = this.generarHTMLAuditoria(logs, titulo);
    this.abrirEnImpresora(html, titulo);
  }

  /**
   * Descarga como CSV
   */
  descargarCSV(contenido: string, nombreArchivo: string) {
    const blob = new Blob([contenido], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `${nombreArchivo}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // ── Private helpers

  private generarHTMLVentas(ventas: Venta[], titulo: string): string {
    const filas = ventas.map(v => `
      <tr>
        <td>${v.fecha.slice(0, 16)}</td>
        <td>${v.comprobante || v.tipo_comp}</td>
        <td class="text-right">${v.items.length}</td>
        <td class="text-right">S/ ${v.total.toFixed(2)}</td>
        <td>${v.metodo}</td>
        <td>${v.estado}</td>
      </tr>
    `).join('');

    const totalVentas = ventas.reduce((s, v) => s + v.total, 0);
    const totalItems = ventas.reduce((s, v) => s + v.items.length, 0);

    return `
      <html>
        <head>
          <title>${titulo}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; background: #fff; }
            h1 { color: #333; border-bottom: 3px solid #f59e0b; padding-bottom: 10px; }
            .info { color: #666; font-size: 12px; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th { background: #1c1917; color: #fff; padding: 12px; text-align: left; font-weight: bold; }
            td { padding: 10px; border-bottom: 1px solid #ddd; }
            tr:nth-child(even) { background: #f9f9f9; }
            tr.totales { background: #fff3cd; font-weight: bold; font-size: 14px; }
            .text-right { text-align: right; }
            .footer { margin-top: 30px; font-size: 11px; color: #999; border-top: 1px solid #ddd; padding-top: 10px; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <h1>🥪 ${titulo}</h1>
          <div class="info">
            <p><strong>Generado:</strong> ${new Date().toLocaleString('es-PE')}</p>
            <p><strong>Total registros:</strong> ${ventas.length}</p>
          </div>

          <table>
            <thead>
              <tr>
                <th>Fecha/Hora</th>
                <th>Comprobante</th>
                <th class="text-right">Items</th>
                <th class="text-right">Total</th>
                <th>Método</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              ${filas}
              <tr class="totales">
                <td colspan="2">TOTALES</td>
                <td class="text-right">${totalItems}</td>
                <td class="text-right">S/ ${totalVentas.toFixed(2)}</td>
                <td colspan="2"></td>
              </tr>
            </tbody>
          </table>

          <div class="footer">
            <p>Este reporte fue generado automáticamente por el Sistema POS EntrePanes.</p>
          </div>
        </body>
      </html>
    `;
  }

  private generarHTMLClientes(clientes: Cliente[], titulo: string): string {
    const filas = clientes.map(c => `
      <tr>
        <td>${c.nombre}</td>
        <td>${c.documento || '-'}</td>
        <td class="text-right">S/ ${c.total_gastado.toFixed(2)}</td>
        <td class="text-right">${c.num_compras}</td>
        <td class="text-right">${c.descuento_pct || 0}%</td>
        <td>${c.ultima_compra.slice(0, 10) || '-'}</td>
      </tr>
    `).join('');

    const totalGastado = clientes.reduce((s, c) => s + c.total_gastado, 0);

    return `
      <html>
        <head>
          <title>${titulo}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; border-bottom: 3px solid #3b82f6; padding-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; }
            th { background: #1c1917; color: #fff; padding: 12px; text-align: left; }
            td { padding: 10px; border-bottom: 1px solid #ddd; }
            tr:nth-child(even) { background: #f9f9f9; }
            tr.totales { background: #dbeafe; font-weight: bold; }
            .text-right { text-align: right; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <h1>👥 ${titulo}</h1>
          <p><strong>Generado:</strong> ${new Date().toLocaleString('es-PE')}</p>
          <p><strong>Total clientes:</strong> ${clientes.length}</p>

          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Documento</th>
                <th class="text-right">Total Gastado</th>
                <th class="text-right">N° Compras</th>
                <th class="text-right">Descuento %</th>
                <th>Última Compra</th>
              </tr>
            </thead>
            <tbody>
              ${filas}
              <tr class="totales">
                <td colspan="2">TOTALES</td>
                <td class="text-right">S/ ${totalGastado.toFixed(2)}</td>
                <td colspan="3"></td>
              </tr>
            </tbody>
          </table>
        </body>
      </html>
    `;
  }

  private generarHTMLAuditoria(logs: AuditLog[], titulo: string): string {
    const filas = logs.map(l => `
      <tr>
        <td>${l.fecha.slice(0, 19)}</td>
        <td>${l.usuario}</td>
        <td>${l.accion}</td>
        <td>${l.entidad}</td>
        <td>${l.detalles || '-'}</td>
      </tr>
    `).join('');

    return `
      <html>
        <head>
          <title>${titulo}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; border-bottom: 3px solid #ef4444; padding-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; }
            th { background: #1c1917; color: #fff; padding: 12px; text-align: left; font-size: 12px; }
            td { padding: 8px; border-bottom: 1px solid #ddd; font-size: 12px; }
            tr:nth-child(even) { background: #f9f9f9; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <h1>🔒 ${titulo}</h1>
          <p><strong>Generado:</strong> ${new Date().toLocaleString('es-PE')}</p>
          <p><strong>Total registros:</strong> ${logs.length}</p>

          <table>
            <thead>
              <tr>
                <th>Fecha/Hora</th>
                <th>Usuario</th>
                <th>Acción</th>
                <th>Entidad</th>
                <th>Detalles</th>
              </tr>
            </thead>
            <tbody>
              ${filas}
            </tbody>
          </table>
        </body>
      </html>
    `;
  }

  private abrirEnImpresora(html: string, titulo: string) {
    const ventana = window.open('', '', 'height=400,width=600');
    if (!ventana) {
      alert('Por favor, permite las ventanas emergentes para imprimir');
      return;
    }
    ventana.document.write(html);
    ventana.document.close();
    ventana.focus();
    
    // Auto-trigger print dialog después de que cargue
    setTimeout(() => {
      ventana.print();
    }, 500);
  }
}
                <th>Comprobante</th>
                <th>Items</th>
                <th>Total (S/)</th>
                <th>Método</th>
              </tr>
            </thead>
            <tbody>
              ${datos.map(d => `
                <tr>
                  <td>${d.fecha}</td>
                  <td>${d.comprobante}</td>
                  <td style="text-align: center;">${d.items}</td>
                  <td style="text-align: right;">${d.total.toFixed(2)}</td>
                  <td>${d.metodo}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <h2>Resumen</h2>
          <table>
            <tr class="totales">
              <td>Tickets</td>
              <td style="text-align: center;">${totales.tickets}</td>
              <td></td>
            </tr>
            <tr class="totales">
              <td>Total Items</td>
              <td style="text-align: center;">${totales.items}</td>
              <td></td>
            </tr>
            <tr class="totales">
              <td>Total Ventas</td>
              <td style="text-align: right;">S/ ${totales.total.toFixed(2)}</td>
              <td></td>
            </tr>
          </table>

          <div class="info">
            <p>Reporte generado automáticamente por Entre Panes POS</p>
          </div>
        </body>
      </html>
    `;

    this.downloadPDF(html, `${titulo.replace(/\s+/g, '_')}.pdf`);
  }

  /**
   * Exporta análisis de costos a PDF
   */
  exportarAnalisisCostosAPDF(
    datos: Array<{
      nombre: string;
      precioVenta: number;
      costoProduccion: number;
      margenBruto: number;
      margenPorcentaje: number;
    }>
  ) {
    let html = `
      <html>
        <head>
          <title>Análisis de Costos</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; border-bottom: 2px solid #f59e0b; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            th { background: #1c1917; color: #fff; padding: 10px; text-align: left; }
            td { padding: 8px; border-bottom: 1px solid #ddd; text-align: right; }
            td:first-child { text-align: left; }
            tr:nth-child(even) { background: #f9f9f9; }
            .alerta { background: #fecaca; }
          </style>
        </head>
        <body>
          <h1>📊 Análisis de Costos y Márgenes</h1>
          <p><strong>Generado:</strong> ${new Date().toLocaleString('es-PE')}</p>

          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Precio Venta</th>
                <th>Costo Producción</th>
                <th>Margen Bruto</th>
                <th>Margen %</th>
              </tr>
            </thead>
            <tbody>
              ${datos.map(d => `
                <tr ${d.margenPorcentaje < 30 ? 'class="alerta"' : ''}>
                  <td>${d.nombre}</td>
                  <td>S/ ${d.precioVenta.toFixed(2)}</td>
                  <td>S/ ${d.costoProduccion.toFixed(2)}</td>
                  <td>S/ ${d.margenBruto.toFixed(2)}</td>
                  <td>${d.margenPorcentaje.toFixed(1)}%</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    this.downloadPDF(html, 'Analisis_Costos.pdf');
  }

  /**
   * Método privado para descargar PDF
   */
  private downloadPDF(html: string, nombreArchivo: string) {
    // Crear elemento temporal
    const element = document.createElement('div');
    element.innerHTML = html;
    element.style.display = 'none';
    document.body.appendChild(element);

    // Usar Print API nativo (más simple que html2pdf)
    const printWindow = window.open('', '', 'width=900,height=600');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.print();
      printWindow.onafterprint = () => {
        printWindow.close();
        document.body.removeChild(element);
      };
    }
  }

  /**
   * Descarga como archivo HTML (fallback)
   */
  descargarHTML(html: string, nombreArchivo: string) {
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nombreArchivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Descarga como CSV
   */
  descargarCSV(csv: string, nombreArchivo: string) {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nombreArchivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
