import { Injectable, inject, computed } from '@angular/core';
import { AppStateService } from './app-state.service';
import { AuthService } from './auth.service';
import { AuditLog } from '../models/models';

/**
 * Servicio de Auditoría - Registra todas las acciones importantes
 * Login/Logout, Ventas, Compras, Cambios de configuración, etc.
 */
@Injectable({ providedIn: 'root' })
export class AuditService {
  private store = inject(AppStateService);
  private auth = inject(AuthService);

  /**
   * Registra una acción en el log de auditoría
   */
  registrar(accion: string, entidad: string, entidad_id: number, detalles?: string) {
    const logs = this.store.auditLogs();
    const usuario = this.auth.currentUser()?.nombre || 'sistema';

    const nuevoLog: AuditLog = {
      id: this.store.nextId(logs),
      fecha: this.store.nowStr(),
      usuario,
      accion,
      entidad,
      entidad_id,
      detalles,
      descripcion: '',
      archivo_afectado: ''
    };

    this.store.update({ 
      auditLogs: [...logs, nuevoLog] 
    });

    console.log(`[AUDIT] ${usuario} - ${accion} ${entidad} #${entidad_id}`);
  }

  /**
   * Logs del día actual
   */
  logsHoy = computed(() => {
    const today = this.store.todayStr();
    return this.store.auditLogs()
      .filter((l: AuditLog) => l.fecha.startsWith(today))
      .sort((a: AuditLog, b: AuditLog) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  });

  /**
   * Logs por usuario
   */
  logsPorUsuario = computed(() => {
    const usuario = this.auth.currentUser()?.nombre || '';
    return this.store.auditLogs()
      .filter((l: AuditLog) => l.usuario === usuario)
      .slice(0, 50);
  });

  /**
   * Actividad de ventas (quién vendió qué)
   */
  actividadVentas = computed(() => {
    return this.store.auditLogs()
      .filter((l: AuditLog) => l.accion === 'VENTA' || l.accion === 'VENTA_ANULADA')
      .slice(0, 20);
  });

  /**
   * Cambios de precio (auditoría de precios)
   */
  cambiosPrecios = computed(() => {
    return this.store.auditLogs()
      .filter((l: AuditLog) => l.accion === 'PRECIO_ACTUALIZADO')
      .slice(0, 20);
  });

  /**
   * Exportar logs a CSV
   */
  exportarCSV(): string {
    const headers = ['Fecha', 'Usuario', 'Acción', 'Entidad', 'ID', 'Detalles'];
    const rows = this.store.auditLogs().map((l: AuditLog) => [
      l.fecha.slice(0, 19),
      l.usuario,
      l.accion,
      l.entidad,
      l.entidad_id.toString(),
      l.detalles || ''
    ]);

    const csv = [headers, ...rows]
      .map((row: string[]) => row.map((col: string) => `"${col}"`).join(','))
      .join('\n');

    return csv;
  }
}
