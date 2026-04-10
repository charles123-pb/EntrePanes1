import { Injectable } from '@angular/core';

/**
 * Servicio de Reportes PDF - Exporta ventas, análisis y reportes
 * Usa html2pdf para generar PDFs sin dependencias pesadas
 */
@Injectable({ providedIn: 'root' })
export class ReportePdfService {

  /**
   * Exporta un reporte de ventas a PDF
   */
  exportarVentasAPDF(
    titulo: string,
    periodo: string,
    datos: Array<{
      fecha: string;
      comprobante: string;
      items: number;
      total: number;
      metodo: string;
    }>,
    totales: { items: number; total: number; tickets: number }
  ) {
    let html = `
      <html>
        <head>
          <title>${titulo}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; border-bottom: 2px solid #f59e0b; padding-bottom: 10px; }
            h2 { color: #555; margin-top: 20px; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            th { background: #1c1917; color: #fff; padding: 10px; text-align: left; font-weight: bold; }
            td { padding: 8px; border-bottom: 1px solid #ddd; }
            tr:nth-child(even) { background: #f9f9f9; }
            .totales { background: #fff3cd; font-weight: bold; font-size: 14px; }
            .info { color: #666; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <h1>🥪 ${titulo}</h1>
          <p><strong>Periodo:</strong> ${periodo}</p>
          <p><strong>Generado:</strong> ${new Date().toLocaleString('es-PE')}</p>

          <h2>Detalle de Ventas</h2>
          <table>
            <thead>
              <tr>
                <th>Fecha/Hora</th>
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
