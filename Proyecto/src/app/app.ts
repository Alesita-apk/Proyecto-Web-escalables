import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SiteFooter } from './components/site-footer';
import { SiteHeader } from './components/site-header';
import { AutocineService } from './services/autocine-service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SiteHeader, SiteFooter],
  templateUrl: './app.html',
})
export class App {
  readonly autocine = inject(AutocineService);

  constructor() {
    void this.autocine.inicializar().catch((error: unknown) => {
      this.autocine.errorCarga.set(
        error instanceof Error ? error.message : 'No fue posible conectar con el servidor.',
      );
    });
  }
}
