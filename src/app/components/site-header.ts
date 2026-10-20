import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AutocineService } from '../services/autocine-service';

@Component({
  selector: 'app-site-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './site-header.html',
})
export class SiteHeader {
  readonly autocine = inject(AutocineService);
  private readonly router = inject(Router);

  cerrarSesion(): void {
    this.autocine.establecerUsuario(null);
    void this.router.navigateByUrl('/');
  }
}
