import { Injectable, inject, computed } from '@angular/core';
import { AppStateService } from './app-state.service';
import { Cliente } from '../models/models';

/**
 * Servicio de Clientes - Gestiona clientes frecuentes y descuentos
 */
@Injectable({ providedIn: 'root' })
export class ClientesService {
  private store = inject(AppStateService);

  /**
   * Obtener cliente por documento o crear nuevo
   */
  obtenerOCrearCliente(nombre: string, documento?: string): Cliente {
    const clientes = this.store.clientes();
    
    if (documento) {
      const existente = clientes.find(c => c.documento === documento);
      if (existente) return existente;
    }

    const nuevoCliente: Cliente = {
      id: this.store.nextId(clientes),
      nombre,
      documento,
      total_gastado: 0,
      num_compras: 0,
      fecha_registro: this.store.nowStr(),
      ultima_compra: '',
      descuento_pct: 0
    };

    this.store.update({ 
      clientes: [...clientes, nuevoCliente] 
    });

    return nuevoCliente;
  }

  /**
   * Registrar compra del cliente
   */
  registrarCompra(clienteId: number, montoVenta: number) {
    const clientes = this.store.clientes();
    const cliente = clientes.find(c => c.id === clienteId);
    
    if (!cliente) return;

    const clienteActualizado = {
      ...cliente,
      total_gastado: this.store.round2(cliente.total_gastado + montoVenta),
      num_compras: cliente.num_compras + 1,
      ultima_compra: this.store.nowStr(),
      descuento_pct: this.calcularDescuento(cliente.total_gastado + montoVenta)
    };

    const clientesActualizados = clientes.map(c => 
      c.id === clienteId ? clienteActualizado : c
    );

    this.store.update({ clientes: clientesActualizados });
  }

  /**
   * Obtener descuento por lealtad
   */
  calcularDescuento(totalGastado: number): number {
    if (totalGastado >= 5000) return 10;
    if (totalGastado >= 2000) return 5;
    if (totalGastado >= 1000) return 3;
    return 0;
  }

  /**
   * Clientes frecuentes (top 10)
   */
  clientesFrecuentes = computed(() => 
    [...this.store.clientes()]
      .sort((a, b) => b.total_gastado - a.total_gastado)
      .slice(0, 10)
  );

  /**
   * Clientes con descuento
   */
  clientesConDescuento = computed(() =>
    this.store.clientes().filter(c => c.descuento_pct! > 0)
  );

  /**
   * Total clientes registrados
   */
  totalClientes = computed(() => this.store.clientes().length);

  /**
   * Buscar cliente
   */
  buscarCliente(término: string): Cliente[] {
    const t = término.toLowerCase();
    return this.store.clientes().filter(c =>
      c.nombre.toLowerCase().includes(t) ||
      c.documento?.includes(término)
    );
  }

  /**
   * Exportar clientes a CSV
   */
  exportarCSV(): string {
    const headers = ['Nombre', 'Documento', 'Total Gastado', 'N° Compras', 'Descuento %', 'Última Compra'];
    const rows = this.store.clientes().map(c => [
      c.nombre,
      c.documento || '-',
      `S/ ${c.total_gastado.toFixed(2)}`,
      c.num_compras.toString(),
      `${c.descuento_pct || 0}%`,
      c.ultima_compra.slice(0, 10)
    ]);

    const csv = [headers, ...rows]
      .map(row => row.map(col => `"${col}"`).join(','))
      .join('\n');

    return csv;
  }
}
        num_compras: 1,
        ultima_compra: new Date().toISOString(),
        descuento_aplicable: this.calcularDescuento(monto),
        activo: true,
      };
      this.clientes.update(cc => [...cc, cliente!]);
    } else {
      // Actualizar cliente existente
      this.clientes.update(cc => cc.map(c => 
        c.id === cliente!.id 
          ? {
              ...c,
              total_gastado: c.total_gastado + monto,
              num_compras: c.num_compras + 1,
              ultima_compra: new Date().toISOString(),
              descuento_aplicable: this.calcularDescuento(c.total_gastado + monto)
            }
          : c
      ));
    }

    this.saveClientes();
  }

  /**
   * Calcula descuento basado en total gastado
   * - 0-500: 0%
   * - 500-2000: 3%
   * - 2000-5000: 5%
   * - 5000+: 8%
   */
  private calcularDescuento(totalGastado: number): number {
    if (totalGastado >= 5000) return 8;
    if (totalGastado >= 2000) return 5;
    if (totalGastado >= 500) return 3;
    return 0;
  }

  /**
   * Obtiene clientes top por gasto
   */
  getTopClientes(limite: number = 10) {
    return [...this.clientes()]
      .sort((a, b) => b.total_gastado - a.total_gastado)
      .slice(0, limite);
  }

  /**
   * Obtiene clientes por descuento
   */
  getClientesConDescuento() {
    return this.clientes().filter(c => c.descuento_aplicable > 0);
  }

  /**
   * Actualiza cliente
   */
  updateCliente(cliente: Cliente) {
    this.clientes.update(cc => cc.map(c => c.id === cliente.id ? cliente : c));
    this.saveClientes();
  }

  /**
   * Desactiva cliente
   */
  desactivarCliente(id: number) {
    this.clientes.update(cc => cc.map(c => c.id === id ? { ...c, activo: false } : c));
    this.saveClientes();
  }

  /**
   * Guarda clientes en localStorage
   */
  private saveClientes() {
    localStorage.setItem('entrepanes_clientes', JSON.stringify(this.clientes()));
  }

  /**
   * Carga clientes de localStorage
   */
  private loadClientes() {
    try {
      const stored = localStorage.getItem('entrepanes_clientes');
      if (stored) {
        this.clientes.set(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Error cargando clientes:', e);
    }
  }
}
