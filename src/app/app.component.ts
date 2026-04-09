import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ShellComponent } from './shared/components/shell/shell.component';

@Component({
  selector: 'ep-root',
  standalone: true,
  imports: [RouterOutlet, ShellComponent],
  template: `<ep-shell><router-outlet /></ep-shell>`,
})
export class AppComponent {}
