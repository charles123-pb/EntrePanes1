import { Component, Inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

export interface DatosClienteDialogData {
  tipoComp: 'ticket' | 'boleta' | 'factura';
}

export interface DatosClienteResult {
  cliente_dni?: string;
  cliente_ruc?: string;
  cliente_razon?: string;
}

@Component({
  selector: 'ep-venta-cliente-dialog',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatDialogModule, MatIconModule,
  ],
  template: `
    <div class="space-y-4">
      <div class="text-lg font-black text-amber-400 mb-4">
        {{ data.tipoComp === 'factura' ? '📄 DATOS DE FACTURA' : '📋 DATOS DE BOLETA' }}
      </div>

      <!-- Tipo de documento -->
      <div>
        <label class="text-xs text-stone-400 font-black tracking-wide block mb-1">TIPO DE DOCUMENTO</label>
        <mat-form-field appearance="outline" class="w-full ep-field-compact">
          <mat-select [(ngModel)]="tipoDoc">
            <mat-option value="dni">DNI</mat-option>
            <mat-option value="ruc">RUC</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <!-- Número de documento -->
      <div>
        <label class="text-xs text-stone-400 font-black tracking-wide block mb-1">
          {{ tipoDoc === 'dni' ? 'NÚMERO DE DNI' : 'NÚMERO DE RUC' }}
        </label>
        <mat-form-field appearance="outline" class="w-full ep-field-compact">
          <mat-icon matPrefix>{{ tipoDoc === 'dni' ? 'badge' : 'business' }}</mat-icon>
          <input matInput placeholder="{{ tipoDoc === 'dni' ? '12345678' : '20123456789' }}" 
            [(ngModel)]="numDoc" 
            [maxlength]="tipoDoc === 'dni' ? 8 : 11"
            type="text"
            [pattern]="tipoDoc === 'dni' ? '[0-9]{8}' : '[0-9]{11}'"
          />
        </mat-form-field>
      </div>

      <!-- Razón social (si es factura o RUC) -->
      @if (data.tipoComp === 'factura' || tipoDoc === 'ruc') {
        <div>
          <label class="text-xs text-stone-400 font-black tracking-wide block mb-1">
            {{ tipoDoc === 'ruc' ? 'RAZÓN SOCIAL' : 'NOMBRE COMPLETO' }}
          </label>
          <mat-form-field appearance="outline" class="w-full ep-field-compact">
            <mat-icon matPrefix>person</mat-icon>
            <input matInput placeholder="Nombre del cliente" [(ngModel)]="razonSocial" />
          </mat-form-field>
        </div>
      }

      <!-- Notas (opcional) -->
      <div>
        <label class="text-xs text-stone-400 font-black tracking-wide block mb-1">NOTAS (OPCIONAL)</label>
        <mat-form-field appearance="outline" class="w-full ep-field-compact">
          <mat-icon matPrefix>note</mat-icon>
          <textarea matInput placeholder="Nota para el cliente..." [(ngModel)]="notas" rows="2"></textarea>
        </mat-form-field>
      </div>

      <!-- Acciones -->
      <div class="flex gap-2 mt-6 pt-4 border-t border-stone-700">
        <button mat-stroked-button class="flex-1" (click)="cancel()">
          <mat-icon>close</mat-icon>
          CANCELAR
        </button>
        <button mat-flat-button color="primary" class="flex-1" (click)="ok()" [disabled]="!isValid()">
          <mat-icon>check</mat-icon>
          CONFIRMAR
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host ::ng-deep .ep-field-compact .mat-mdc-form-field-infix { 
      padding-top: 8px !important; 
      padding-bottom: 8px !important; 
      min-height: 36px !important; 
    }
  `]
})
export class VentaClienteDialogComponent {
  tipoDoc = 'dni';
  numDoc = '';
  razonSocial = '';
  notas = '';

  constructor(
    public dialogRef: MatDialogRef<VentaClienteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DatosClienteDialogData
  ) {}

  isValid(): boolean {
    if (!this.numDoc) return false;
    if (this.tipoDoc === 'dni' && this.numDoc.length !== 8) return false;
    if (this.tipoDoc === 'ruc' && this.numDoc.length !== 11) return false;
    if ((this.data.tipoComp === 'factura' || this.tipoDoc === 'ruc') && !this.razonSocial.trim()) return false;
    return true;
  }

  ok() {
    const result: DatosClienteResult = {
      cliente_dni: this.tipoDoc === 'dni' ? this.numDoc : undefined,
      cliente_ruc: this.tipoDoc === 'ruc' ? this.numDoc : undefined,
      cliente_razon: this.razonSocial || undefined,
    };
    this.dialogRef.close(result);
  }

  cancel() {
    this.dialogRef.close(null);
  }
}
