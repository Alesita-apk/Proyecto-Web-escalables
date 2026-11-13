import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MovieCard } from '../../components/movie-card/movie-card';
import { Funcion, RolUsuario } from '../../interfaces/autocine.interface';
import { AutocineService } from '../../services/autocine-service';

@Component({
  selector: 'app-cartelera-page',
  standalone: true,
  imports: [MovieCard],
  templateUrl: './cartelera-page.html',
  styleUrl: './cartelera-page.css',
})
export class CarteleraPage {
  readonly autocine = inject(AutocineService);
  private readonly router = inject(Router);
  readonly fechas = this.crearFechas();
  fecha = this.fechas[0]?.valor ?? '';

  funcionesDe(peliculaId: number) {
    return this.autocine
      .funciones()
      .filter((funcion) => funcion.peliculaId === peliculaId && funcion.fecha === this.fecha);
  }

  cambiarFecha(event: Event): void {
    this.fecha = (event.target as HTMLSelectElement).value;
  }

  iniciarCompra(funcion: Funcion): void {
    const usuario = this.autocine.usuarioActual();
    if (usuario?.rol === 'cliente') {
      void this.router.navigate(['/compra', funcion.id]);
      return;
    }
    if (!usuario) {
      void this.router.navigate(['/login'], {
        queryParams: { returnUrl: `/compra/${funcion.id}` },
      });
    }
  }

  get rolUsuario(): RolUsuario | null {
    return this.autocine.usuarioActual()?.rol ?? null;
  }

  private crearFechas(): { valor: string; etiqueta: string }[] {
    const hoy = new Date();
    return Array.from({ length: 10 }, (_, indice) => {
      const fecha = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + indice);
      const valor = [
        fecha.getFullYear(),
        String(fecha.getMonth() + 1).padStart(2, '0'),
        String(fecha.getDate()).padStart(2, '0'),
      ].join('-');
      return {
        valor,
        etiqueta: fecha.toLocaleDateString('es-MX', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        }),
      };
    });
  }
}
