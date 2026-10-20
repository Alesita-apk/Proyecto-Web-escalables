import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AutocineService } from '../../services/autocine-service';

@Component({
  selector: 'app-staff-page',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './staff-page.html',
  styleUrl: './staff-page.css',
})
export class StaffPage {
  readonly autocine = inject(AutocineService);
  tab: 'mapa' | 'validar' = 'mapa';
  funcionId = this.autocine.funciones()[0]?.id ?? 0;
  modo: 'acceso' | 'dulceria' = 'acceso';
  codigo = '';
  resultado = '';
  correcto = false;
  ocupados() {
    return this.autocine.obtenerCajonesOcupados(this.funcionId);
  }
  validar(): void {
    const usuario = this.autocine.usuarioActual();
    if (!usuario) return;
    const reserva =
      this.modo === 'acceso'
        ? this.autocine.validarAcceso(usuario, this.codigo)
        : this.autocine.validarEntregaDulceria(usuario, this.codigo);
    this.correcto = !!reserva;
    this.resultado = reserva
      ? this.modo === 'acceso'
        ? `Acceso autorizado: ${reserva.pelicula}, cajón ${reserva.cajones.join(', ')}.`
        : `Entrega registrada: ${reserva.alimentos.map((x) => `${x.cantidad} × ${x.nombre}`).join(', ')}.`
      : 'Folio inválido, ya validado o sin productos pendientes para esta operación.';
  }
}
