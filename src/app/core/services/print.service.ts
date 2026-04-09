import { Injectable } from '@angular/core';
import { Venta, Compra } from '../models/models';

@Injectable({ providedIn: 'root' })
export class PrintService {

  private printWindow(titulo: string, htmlBody: string) {
    const win = window.open('', '_blank', 'width=900,height=700');
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head>
      <meta charset="utf-8"/>
      <title>${titulo}</title>
      <style>
        *{box-sizing:border-box;margin:0;padding:0;}
        body{font-family:'Courier New',monospace;font-size:11px;color:#111;background:#fff;padding:24px;}
        h1{font-size:16px;font-weight:900;text-transform:uppercase;letter-spacing:2px;margin-bottom:4px;}
        h2{font-size:12px;font-weight:900;text-transform:uppercase;letter-spacing:1px;margin:16px 0 6px;border-bottom:1px solid #ddd;padding-bottom:4px;}
        .meta{color:#555;margin-bottom:16px;line-height:1.6;}
        table{width:100%;border-collapse:collapse;margin-bottom:12px;}
        th{background:#111;color:#fff;padding:6px 10px;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:1px;}
        td{padding:5px 10px;border-bottom:1px solid #eee;}
        tr:nth-child(even) td{background:#f9f9f9;}
        .total{font-weight:900;font-size:13px;}
        .right{text-align:right;}
        .footer{margin-top:24px;padding-top:12px;border-top:1px solid #ddd;color:#888;font-size:10px;}
        @media print{body{padding:12px;} button{display:none;}}
      </style>
    </head><body>
      ${htmlBody}
      <script>window.onload=function(){window.print();}<\/script>
    </body></html>`);
    win.document.close();
  }

  ticket(venta: Venta) {
    const items = venta.items.map(it =>
      `<tr><td>${it.nombre}</td><td class="right">${it.cant}</td><td class="right">S/ ${it.pu.toFixed(2)}</td><td class="right">S/ ${it.sub.toFixed(2)}</td></tr>`
    ).join('');
    this.printWindow('Ticket de Venta', `
      <h1>🥪 Entre Panes</h1>
      <div class="meta">
        Fecha: ${venta.fecha}<br/>
        Comprobante: ${venta.comprobante ?? venta.tipo_comp.toUpperCase()}<br/>
        Método: ${venta.metodo.toUpperCase()}<br/>
        Cajero: ${venta.cajero}
      </div>
      <table>
        <thead><tr><th>Producto</th><th class="right">Cant</th><th class="right">P.U.</th><th class="right">Sub</th></tr></thead>
        <tbody>${items}</tbody>
        <tfoot>
          <tr><td colspan="3" class="total">TOTAL</td><td class="right total">S/ ${venta.total.toFixed(2)}</td></tr>
          ${venta.vuelto ? `<tr><td colspan="3">Vuelto</td><td class="right">S/ ${venta.vuelto.toFixed(2)}</td></tr>` : ''}
        </tfoot>
      </table>
      <div class="footer">¡Gracias por su preferencia!</div>
    `);
  }

  reporteVentas(ventas: Venta[], titulo: string) {
    const rows = ventas.map(v =>
      `<tr>
        <td>${v.fecha}</td>
        <td>${v.comprobante ?? v.tipo_comp}</td>
        <td>${v.cajero}</td>
        <td class="right">S/ ${v.total.toFixed(2)}</td>
        <td>${v.metodo}</td>
        <td>${v.estado}</td>
      </tr>`
    ).join('');
    const total = ventas.reduce((s, v) => s + v.total, 0);
    this.printWindow(titulo, `
      <h1>${titulo}</h1>
      <table>
        <thead><tr><th>Fecha</th><th>Comprobante</th><th>Cajero</th><th class="right">Total</th><th>Método</th><th>Estado</th></tr></thead>
        <tbody>${rows}</tbody>
        <tfoot><tr><td colspan="3" class="total">TOTAL</td><td class="right total">S/ ${total.toFixed(2)}</td><td colspan="2"></td></tr></tfoot>
      </table>
      <div class="footer">Generado: ${new Date().toLocaleString('es-PE')}</div>
    `);
  }
}
