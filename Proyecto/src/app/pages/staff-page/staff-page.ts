import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AutocineService } from '../../services/autocine-service';
import { apiErrorMessage } from '../../services/api-error';

@Component({
  selector: 'app-staff-page',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './staff-page.html',
  styleUrl: './staff-page.css',
})
export class StaffPage implements OnInit {
  readonly autocine = inject(AutocineService);
  tab: 'mapa' | 'validar' = 'mapa';
  funcionId = 0;
  modo: 'acceso' | 'dulceria' = 'acceso';
  codigo = '';
  resultado = '';
  correcto = false;
  ngOnInit(): void {
    this.funcionId = this.autocine.funciones()[0]?.id ?? 0;
    if (this.funcionId) void this.cargarOcupacion(this.funcionId);
  }
  async cargarOcupacion(funcionId: number): Promise<void> {
    try {
      await this.autocine.cargarCajonesOcupados(funcionId);
    } catch (error) {
      this.resultado = apiErrorMessage(error, 'No fue posible consultar la ocupación.');
    }
  }
  ocupados() {
    return this.autocine.obtenerCajonesOcupados(this.funcionId);
  }
  async validar(): Promise<void> {
    const usuario = this.autocine.usuarioActual();
    if (!usuario) return;
    let reserva;
    try {
      reserva =
        this.modo === 'acceso'
          ? await this.autocine.validarAcceso(usuario, this.codigo)
          : await this.autocine.validarEntregaDulceria(usuario, this.codigo);
    } catch (error) {
      this.correcto = false;
      this.resultado = apiErrorMessage(error, 'No fue posible validar el folio.');
      return;
    }
    this.correcto = !!reserva;
    this.resultado = reserva
      ? this.modo === 'acceso'
        ? `Acceso autorizado: ${reserva.pelicula}, cajón ${reserva.cajones.join(', ')}.`
        : `Entrega registrada: ${reserva.alimentos.map((x) => `${x.cantidad} × ${x.nombre}`).join(', ')}.`
      : 'Folio inválido, ya validado o sin productos pendientes para esta operación.';
  }
}
