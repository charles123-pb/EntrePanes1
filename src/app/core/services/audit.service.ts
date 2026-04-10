import { Injectable, inject } from '@angular/core';
import { signal } from '@angular/core';
import { AuditLog, TipoAccion } from '../models/models';
import { AuthService } from './auth.service';

/**
 * Servicio de Auditoría - Registra todas las acciones importantes
 * Login/Logout, Ventas, Compras, Cambios de configuración, etc.
 */
@Injectable({ providedIn: 'root' })
export class AuditService {
  private auth = inject(AuthService);
  private logs = signal<AuditLog[]>([]);

  constructor() {
    this.loadLogs();
  }

  /**
   * Registra una acción en el log de auditoría
   */
  registrar(accion: TipoAccion, descripcion: string, archivoAfectado: string = '', detalles?: string) {
    const usuario = this.auth.currentUser()?.nombre || 'sistema';
    const log: AuditLog = {
      id: this.logs().length + 1,
      fecha: new Date().toISOString(),
      usuario,
      accion,
      descripcion,
      archivo_afectado: archivoAfectado,
      detalles,
    };
    
    this.logs.update(logs => [...logs, log]);
    this.saveLogs();
    console.log(`[AUDIT] ${usuario} - ${accion}: ${descripcion}`);
  }

  /**
   * Obtiene todos los logs
   */
  getLogs() {
    return this.logs();
  }

  /**
   * Obtiene logs por usuario
   */
  getLogsByUser(usuario: string) {
    return this.logs().filter(l => l.usuario === usuario);
  }

  /**
   * Obtiene logs por tipo de acción
   */
  getLogsByAccion(accion: TipoAccion) {
    return this.logs().filter(l => l.accion === accion);
  }

  /**
   * Obtiene logs de últimas N horas
   */
  getLogsRecientes(horas: number = 24) {
    const ahora = new Date();
    const hace = new Date(ahora.getTime() - horas * 60 * 60 * 1000);
    return this.logs().filter(l => new Date(l.fecha) >= hace);
  }

  /**
   * Limpia logs más antiguos que N días
   */
  limpiarLogsAntiguos(dias: number = 90) {
    const limite = new Date();
    limite.setDate(limite.getDate() - dias);
    
    const logsNuevos = this.logs().filter(l => new Date(l.fecha) > limite);
    this.logs.set(logsNuevos);
    this.saveLogs();
  }

  /**
   * Guarda logs en localStorage
   */
  private saveLogs() {
    localStorage.setItem('entrepanes_audit_logs', JSON.stringify(this.logs()));
  }

  /**
   * Carga logs de localStorage
   */
  private loadLogs() {
    try {
      const stored = localStorage.getItem('entrepanes_audit_logs');
      if (stored) {
        this.logs.set(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Error cargando audit logs:', e);
    }
  }

  /**
   * Exporta logs como CSV
   */
  exportarCSV(): string {
    const headers = ['Fecha', 'Usuario', 'Acción', 'Descripción', 'Archivo', 'Detalles'];
    const rows = this.logs().map(l => [
      new Date(l.fecha).toLocaleString('es-PE'),
      l.usuario,
      l.accion,
      l.descripcion,
      l.archivo_afectado,
      l.detalles || ''
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(r => r.map(c => `"${c}"`).join(','))
    ].join('\n');

    return csv;
  }
}
