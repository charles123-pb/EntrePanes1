import { Injectable, inject, signal } from '@angular/core';
import { AppStateService } from './app-state.service';
import { AuthService } from './auth.service';
import { AuditLog, TipoAccion } from '../models/models';

export interface AuditFilter {
  usuario?: string;
  accion?: TipoAccion;
  entidad?: string;
  fechaDesde?: string;
  fechaHasta?: string;
}

const AUDIT_LOGS_KEY = 'entre_panes_audit_logs';
const AUDIT_LIMIT = 5000; // Máximo número de registros

@Injectable({ providedIn: 'root' })
export class AuditService {
  private store = inject(AppStateService);
  private auth = inject(AuthService);

  readonly entries = signal<AuditLog[]>([]);

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Registrar una acción (cambio) en el sistema
   */
  log(
    accion: TipoAccion,
    entidad: string,
    entidad_id: number,
    descripcion?: string,
    detalles?: string
  ): AuditLog {
    const entry: AuditLog = {
      id: this.entries().length + 1,
      fecha: this.getNowStr(),
      usuario: this.auth.currentUser()?.nombre || 'system',
      accion,
      entidad,
      entidad_id,
      descripcion,
      detalles
    };

    this.entries.update(arr => {
      const updated = [...arr, entry];
      // Mantener límite
      if (updated.length > AUDIT_LIMIT) {
        updated.shift();
      }
      return updated;
    });

    this.persistToStorage();
    return entry;
  }

  /**
   * Búsqueda avanzada con filtros
   */
  search(filtros: AuditFilter): AuditLog[] {
    let results = this.entries();

    if (filtros.usuario) {
      results = results.filter(e => e.usuario === filtros.usuario);
    }

    if (filtros.accion) {
      results = results.filter(e => e.accion === filtros.accion);
    }

    if (filtros.entidad) {
      results = results.filter(e => e.entidad === filtros.entidad);
    }

    if (filtros.fechaDesde) {
      results = results.filter(e => e.fecha >= filtros.fechaDesde!);
    }

    if (filtros.fechaHasta) {
      results = results.filter(e => e.fecha <= filtros.fechaHasta!);
    }

    return results;
  }

  /**
   * Obtener logs recientes
   */
  getRecent(limit: number = 100): AuditLog[] {
    return this.entries().slice(-limit);
  }

  /**
   * Obtener usuarios únicos
   */
  getUniqueUsers(): string[] {
    const users = new Set(this.entries().map(e => e.usuario));
    return Array.from(users).sort();
  }

  /**
   * Obtener tipos de acción únicos
   */
  getUniqueActions(): TipoAccion[] {
    const actions = new Set(this.entries().map(e => e.accion));
    return Array.from(actions).sort();
  }

  /**
   * Obtener entidades únicas
   */
  getUniqueEntities(): string[] {
    const entities = new Set(this.entries().map(e => e.entidad));
    return Array.from(entities).sort();
  }

  /**
   * Estadísticas de auditoría
   */
  getStatistics(): {
    total: number;
    byUser: Record<string, number>;
    byAction: Record<string, number>;
    byEntity: Record<string, number>;
    fromDate: string;
    toDate: string;
  } {
    const logs = this.entries();
    const stats = {
      total: logs.length,
      byUser: {} as Record<string, number>,
      byAction: {} as Record<string, number>,
      byEntity: {} as Record<string, number>,
      fromDate: logs.length > 0 ? logs[0].fecha : '',
      toDate: logs.length > 0 ? logs[logs.length - 1].fecha : ''
    };

    logs.forEach(log => {
      stats.byUser[log.usuario] = (stats.byUser[log.usuario] || 0) + 1;
      stats.byAction[log.accion] = (stats.byAction[log.accion] || 0) + 1;
      stats.byEntity[log.entidad] = (stats.byEntity[log.entidad] || 0) + 1;
    });

    return stats;
  }

  /**
   * Limpiar logs antiguos (mantener últimos N días)
   */
  cleanOldLogs(daysToKeep: number = 90): number {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    const cutoffStr = cutoffDate.toISOString().split('T')[0];

    const before = this.entries().length;
    this.entries.update(arr =>
      arr.filter(log => log.fecha >= cutoffStr)
    );
    const after = this.entries().length;

    this.persistToStorage();
    return before - after;
  }

  /**
   * Exportar logs como JSON
   */
  exportAsJSON(filtros?: AuditFilter): string {
    const logs = filtros ? this.search(filtros) : this.entries();
    return JSON.stringify(logs, null, 2);
  }

  /**
   * Exportar logs como CSV
   */
  exportAsCSV(filtros?: AuditFilter): string {
    const logs = filtros ? this.search(filtros) : this.entries();

    if (!logs.length) return '';

    const headers = ['ID', 'Fecha', 'Usuario', 'Acción', 'Entidad', 'Entidad ID', 'Descripción', 'Detalles'];
    const rows = logs.map(log => [
      log.id,
      log.fecha,
      log.usuario,
      log.accion,
      log.entidad,
      log.entidad_id,
      log.descripcion || '',
      log.detalles || ''
    ]);

    const csv = [headers, ...rows].map(row =>
      row.map(cell => {
        if (cell === null || cell === undefined) return '';
        if (typeof cell === 'string' && cell.includes(',')) {
          return `"${cell}"`;
        }
        return cell;
      }).join(',')
    ).join('\n');

    return csv;
  }

  /**
   * Cargar logs desde localStorage
   */
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(AUDIT_LOGS_KEY);
      if (stored) {
        const logs = JSON.parse(stored);
        this.entries.set(Array.isArray(logs) ? logs : []);
      }
    } catch (e) {
      console.error('Error loading audit logs:', e);
      this.entries.set([]);
    }
  }

  /**
   * Guardar logs en localStorage
   */
  private persistToStorage(): void {
    try {
      localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify(this.entries()));
    } catch (e) {
      console.error('Error saving audit logs:', e);
    }
  }

  /**
   * Obtener fecha y hora actual como string
   */
  private getNowStr(): string {
    return new Date().toISOString();
  }
}
