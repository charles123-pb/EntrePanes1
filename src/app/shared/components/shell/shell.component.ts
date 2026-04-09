import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive }         from '@angular/router';
import { MatSidenavModule }    from '@angular/material/sidenav';
import { MatToolbarModule }    from '@angular/material/toolbar';
import { MatListModule }       from '@angular/material/list';
import { MatIconModule }       from '@angular/material/icon';
import { MatButtonModule }     from '@angular/material/button';
import { MatBadgeModule }      from '@angular/material/badge';
import { MatTooltipModule }    from '@angular/material/tooltip';
import { MatDividerModule }    from '@angular/material/divider';
import { CommonModule }        from '@angular/common';
import { AppStateService }     from '../../../core/services/app-state.service';
import { NAV }                 from '../../../core/constants/constants';

@Component({
  selector: 'ep-shell',
  standalone: true,
  imports: [
    CommonModule, RouterLink, RouterLinkActive,
    MatSidenavModule, MatToolbarModule, MatListModule,
    MatIconModule, MatButtonModule, MatBadgeModule,
    MatTooltipModule, MatDividerModule,
  ],
  template: `
    <mat-sidenav-container class="h-screen bg-stone-950">

      <!-- ── SIDEBAR ── -->
      <mat-sidenav
        [opened]="sidenavOpen()"
        (closedStart)="sidenavOpen.set(false)"
        mode="side"
        class="w-56 bg-stone-900 border-r border-stone-800 flex flex-col"
      >
        <!-- Logo -->
        <div class="px-5 py-6 border-b border-stone-800">
          <div class="font-display text-3xl text-amber-400 leading-none">ENTRE</div>
          <div class="font-display text-3xl text-stone-300 leading-none">PANES</div>
          <div class="text-stone-600 text-xs mt-1 font-mono tracking-wider">POS v3.7</div>
        </div>

        <!-- Nav links -->
        <nav class="flex-1 py-2 overflow-y-auto">
          <mat-nav-list>
            @for (item of nav; track item.route) {
              <a
                mat-list-item
                [routerLink]="item.route"
                routerLinkActive="active-nav"
                class="rounded-none text-stone-400 hover:text-amber-300 transition-colors mx-2 my-0.5"
                [matTooltip]="item.label"
                matTooltipPosition="right"
              >
                <mat-icon
                  matListItemIcon
                  class="text-stone-500"
                  [matBadge]="item.route === '/inventario' && stockAlerts() > 0 ? stockAlerts() : null"
                  matBadgeColor="warn"
                  matBadgeSize="small"
                >{{ item.icon }}</mat-icon>
                <span matListItemTitle class="text-sm font-medium">{{ item.label }}</span>
              </a>
            }
          </mat-nav-list>
        </nav>

        <!-- Bottom info -->
        <div class="px-4 py-3 border-t border-stone-800">
          <div class="text-stone-600 text-xs font-mono">{{ now() }}</div>
          <div class="text-stone-500 text-xs mt-0.5">RER · Ley 31556 · 2026</div>
        </div>
      </mat-sidenav>

      <!-- ── MAIN CONTENT ── -->
      <mat-sidenav-content class="bg-stone-950 flex flex-col min-h-screen">

        <!-- Topbar -->
        <mat-toolbar class="bg-stone-900 border-b border-stone-800 !h-12 flex-shrink-0">
          <button mat-icon-button (click)="sidenavOpen.update(v => !v)" class="text-stone-400 hover:text-amber-400">
            <mat-icon>menu</mat-icon>
          </button>

          <span class="flex-1"></span>

          <!-- Stock alert chip -->
          @if (stockAlerts() > 0) {
            <div class="mr-3 flex items-center gap-1.5 px-3 py-1 bg-red-900/40 border border-red-700 rounded-sm cursor-pointer text-xs text-red-400 font-black tracking-wider"
                 [routerLink]="'/inventario'">
              <mat-icon class="!text-sm">warning</mat-icon>
              {{ stockAlerts() }} alertas stock
            </div>
          }

          <!-- Ventas hoy -->
          <div class="mr-4 text-right hidden sm:block">
            <div class="text-stone-500 text-xs font-black tracking-widest">VENTAS HOY</div>
            <div class="text-amber-400 font-display text-xl leading-none">S/ {{ ventasHoy() | number:'1.2-2' }}</div>
          </div>
        </mat-toolbar>

        <!-- Page content -->
        <main class="flex-1 overflow-auto p-4 sm:p-6 animate-fade-in">
          <ng-content />
        </main>

      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    ::ng-deep .active-nav {
      background: rgba(245,158,11,0.12) !important;
      border-left: 3px solid #f59e0b !important;
      .mdc-list-item__primary-text { color: #fbbf24 !important; }
      mat-icon { color: #f59e0b !important; }
    }
    ::ng-deep .mat-mdc-nav-list .mdc-list-item {
      border-radius: 0 !important;
    }
  `]
})
export class ShellComponent {
  private store = inject(AppStateService);

  nav        = NAV;
  sidenavOpen = signal(true);
  stockAlerts = this.store.stockAlerts;
  ventasHoy   = this.store.ventasHoy;

  now = computed(() => {
    return new Date().toLocaleString('es-PE', {
      weekday: 'short', day: '2-digit', month: 'short',
      hour: '2-digit', minute: '2-digit', hour12: false
    });
  });
}
