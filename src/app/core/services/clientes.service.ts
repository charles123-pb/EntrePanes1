import { Injectable } from '@angular/core';
import { signal } from '@angular/core';
import { Cliente } from '../models/models';

/**
 * Servicio de Clientes - Gestiona clientes frecuentes y descuentos
 */
@Injectable({ providedIn: 'root' })
export class ClientesService {
  private clientes = signal<Cliente[]>([]);

  constructor() {
    this.loadClientes();
  }

  /**
   * Obtiene todos los clientes
   */
  getClientes() {
    return this.clientes();
  }

  /**
   * Obtiene cliente por ID
   */
  getClienteById(id: number) {
    return this.clientes().find(c => c.id === id);
  }

  /**
   * Obtiene cliente por DNI/RUC
   */
  getClienteByDocumento(documento: string) {
    return this.clientes().find(c => c.dni === documento || c.ruc === documento);
  }

  /**
   * Registra o actualiza una venta para un cliente
   */
  registrarVenta(clienteData: { nombre: string; dni?: string; ruc?: string }, monto: number) {
    let cliente = this.getClienteByDocumento(clienteData.dni || clienteData.ruc || '');
    
    if (!cliente) {
      // Crear nuevo cliente
      cliente = {
        id: this.clientes().length + 1,
        nombre: clienteData.nombre,
        dni: clienteData.dni,
        ruc: clienteData.ruc,
        total_gastado: monto,
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
