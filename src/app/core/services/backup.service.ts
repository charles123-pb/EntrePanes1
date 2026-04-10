import { Injectable, inject, signal } from '@angular/core';
import { AppStateService } from './app-state.service';
import { AppState } from '../models/models';

export interface BackupFile {
  timestamp: string;
  version: string;
  data: AppState;
  hash: string;
  description?: string;
}

export interface BackupMetadata {
  id: string;
  timestamp: string;
  description?: string;
  size: number;
  entities: {
    ventas: number;
    compras: number;
    productos: number;
    insumos: number;
    clientes: number;
  };
}

const BACKUPS_KEY = 'entre_panes_backups';
const BACKUP_METADATA_KEY = 'entre_panes_backup_metadata';

@Injectable({ providedIn: 'root' })
export class BackupService {
  private store = inject(AppStateService);
  private autoBackupInterval: any;

  readonly backupMetadata = signal<BackupMetadata[]>([]);
  readonly lastBackup = signal<BackupMetadata | null>(null);

  constructor() {
    this.loadBackupMetadata();
    this.setupAutoBackup();
  }

  /**
   * Configurar backup automático cada 6 horas
   */
  private setupAutoBackup(): void {
    const BACKUP_INTERVAL = 6 * 60 * 60 * 1000; // 6 horas
    this.autoBackupInterval = setInterval(() => this.createBackup('Auto-backup'), BACKUP_INTERVAL);
  }

  /**
   * Crear backup manualmente
   */
  createBackup(description?: string): BackupFile {
    const state = this.store.state();
    const backup: BackupFile = {
      timestamp: new Date().toISOString(),
      version: 'v1',
      data: state,
      hash: this.calculateHash(state),
      description
    };

    // Guardar en localStorage (limitar a últimos 10 backups)
    this.saveBackup(backup);
    return backup;
  }

  /**
   * Guardar backup en localStorage
   */
  private saveBackup(backup: BackupFile): void {
    const allBackups = this.getAllBackupsFromStorage();
    allBackups.push(backup);

    // Mantener solo los últimos 10 backups
    if (allBackups.length > 10) {
      allBackups.shift();
    }

    localStorage.setItem(BACKUPS_KEY, JSON.stringify(allBackups));

    // Actualizar metadata
    const metadata: BackupMetadata = {
      id: backup.hash,
      timestamp: backup.timestamp,
      description: backup.description,
      size: JSON.stringify(backup).length,
      entities: {
        ventas: backup.data.ventas.length,
        compras: backup.data.compras.length,
        productos: backup.data.productos.length,
        insumos: backup.data.insumos.length,
        clientes: backup.data.clientes.length
      }
    };

    this.backupMetadata.update(arr => {
      const updated = [...arr, metadata];
      if (updated.length > 10) updated.shift();
      return updated;
    });

    this.lastBackup.set(metadata);
    localStorage.setItem(BACKUP_METADATA_KEY, JSON.stringify(this.backupMetadata()));
  }

  /**
   * Cargar metadata de backups del localStorage
   */
  private loadBackupMetadata(): void {
    const stored = localStorage.getItem(BACKUP_METADATA_KEY);
    if (stored) {
      try {
        const metadata = JSON.parse(stored);
        this.backupMetadata.set(metadata);
        if (metadata.length > 0) {
          this.lastBackup.set(metadata[metadata.length - 1]);
        }
      } catch (e) {
        console.error('Error loading backup metadata:', e);
      }
    }
  }

  /**
   * Obtener todos los backups del localStorage
   */
  private getAllBackupsFromStorage(): BackupFile[] {
    const stored = localStorage.getItem(BACKUPS_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Error loading backups:', e);
        return [];
      }
    }
    return [];
  }

  /**
   * Descargar backup como archivo JSON
   */
  downloadBackup(timestamp?: string): void {
    let backup: BackupFile;

    if (timestamp) {
      const all = this.getAllBackupsFromStorage();
      const found = all.find(b => b.timestamp === timestamp);
      if (!found) {
        console.error('Backup not found');
        return;
      }
      backup = found;
    } else {
      backup = this.createBackup('Manual download');
    }

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `entre-panes-backup-${backup.timestamp.split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Restaurar desde archivo de backup
   */
  restoreBackup(file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const backup = JSON.parse(event.target?.result as string) as BackupFile;

          // Validar estructura
          if (!this.validateBackup(backup)) {
            throw new Error('Backup file structure invalid');
          }

          // Restaurar estado
          this.store.update(backup.data);

          // Guardar como backup local
          this.saveBackup(backup);

          resolve();
        } catch (e) {
          reject(e);
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  }

  /**
   * Validar estructura de backup
   */
  private validateBackup(backup: any): boolean {
    if (!backup.data || !backup.timestamp || !backup.version) {
      return false;
    }

    const data = backup.data;
    const requiredFields = [
      'proveedores',
      'insumos',
      'productos',
      'ventas',
      'compras',
      'kardex',
      'histNRUS',
      'clientes',
      'auditLogs',
      'categorias'
    ];

    return requiredFields.every(field => Array.isArray(data[field]));
  }

  /**
   * Calcular hash SHA-256 simple del backup
   */
  private calculateHash(state: AppState): string {
    const str = JSON.stringify(state);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Limpiar backups para mantener espacio
   */
  clearOldBackups(keep: number = 5): void {
    const all = this.getAllBackupsFromStorage();
    const kept = all.slice(-keep);
    localStorage.setItem(BACKUPS_KEY, JSON.stringify(kept));

    this.backupMetadata.set(
      this.backupMetadata().slice(-keep)
    );
    localStorage.setItem(BACKUP_METADATA_KEY, JSON.stringify(this.backupMetadata()));
  }

  /**
   * Destruir (limpiar intervals)
   */
  ngOnDestroy(): void {
    if (this.autoBackupInterval) {
      clearInterval(this.autoBackupInterval);
    }
  }
}
