import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatIconModule } from '@angular/material/icon';

export type MetodoDigital = 'yape' | 'plin';

export interface PagoDigitalResult {
  metodo: MetodoDigital;
}

@Component({
  selector: 'ep-pago-digital-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
    MatIconModule
  ],
  template: `
    <div class="bg-stone-900 border border-stone-800 rounded-lg p-6 space-y-6 min-w-96">
      <div class="text-center">
        <mat-icon class="!text-4xl text-amber-400 !block mx-auto mb-2">payment</mat-icon>
        <h2 class="text-lg font-black text-stone-100 tracking-wider">PAGO DIGITAL</h2>
        <p class="text-xs text-stone-500 mt-1">Selecciona tu aplicación</p>
      </div>

      <mat-radio-group [(ngModel)]="metodo" class="space-y-3 flex flex-col">
        <!-- Yape Option -->
        <label class="group cursor-pointer">
          <div class="p-4 rounded-lg border-2 transition-all flex items-center gap-4"
               [ngClass]="metodo === 'yape' ? 'border-purple-500 bg-purple-900/20' : 'border-stone-700 bg-stone-900/60 hover:border-purple-600'">
            <mat-radio-button [value]="'yape'" class="!mt-0"></mat-radio-button>
            <div class="flex-1">
              <div class="text-base font-black text-purple-400">Yape</div>
              <p class="text-xs text-stone-500">Billetera digital Peruana</p>
            </div>
            <mat-icon class="text-purple-400">phone_android</mat-icon>
          </div>
        </label>

        <!-- Plin Option -->
        <label class="group cursor-pointer">
          <div class="p-4 rounded-lg border-2 transition-all flex items-center gap-4"
               [ngClass]="metodo === 'plin' ? 'border-pink-500 bg-pink-900/20' : 'border-stone-700 bg-stone-900/60 hover:border-pink-600'">
            <mat-radio-button [value]="'plin'" class="!mt-0"></mat-radio-button>
            <div class="flex-1">
              <div class="text-base font-black text-pink-400">Plin</div>
              <p class="text-xs text-stone-500">Transferencia instantánea Perú</p>
            </div>
            <mat-icon class="text-pink-400">phone_android</mat-icon>
          </div>
        </label>
      </mat-radio-group>

      <!-- Divider -->
      <div class="border-t border-stone-800"></div>

      <!-- Actions -->
      <div class="flex gap-3">
        <button mat-flat-button class="flex-1" (click)="cancelar()">CANCELAR</button>
        <button mat-flat-button color="primary" class="flex-1" (click)="confirmar()">
          <mat-icon>check</mat-icon>
          CONFIRMAR
        </button>
      </div>
    </div>
  `,
})
export class PagoDigitalDialogComponent {
  metodo: MetodoDigital = 'yape';

  constructor(private dialogRef: MatDialogRef<PagoDigitalDialogComponent>) {}

  cancelar() {
    this.dialogRef.close(null);
  }

  confirmar() {
    this.dialogRef.close({ metodo: this.metodo } as PagoDigitalResult);
  }
}
