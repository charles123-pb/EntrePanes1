import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { ShellComponent } from './shared/components/shell/shell.component';

@Component({
  selector: 'ep-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ShellComponent],
  template: `
    @if (isNotLogin()) {
      <ep-shell><router-outlet /></ep-shell>
    } @else {
      <router-outlet />
    }
  `,
})
export class AppComponent {
  private router = inject(Router);

  isNotLogin() {
    return !this.router.url.includes('/login');
  }
}
