import { CurrencyPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Reserva } from '../../interfaces/autocine.interface';
import { AutocineService } from '../../services/autocine-service';
import { apiErrorMessage } from '../../services/api-error';

@Component({
  selector: 'app-account-page',
  standalone: true,
  imports: [CurrencyPipe, ReactiveFormsModule],
  templateUrl: './account-page.html',
  styleUrl: './account-page.css',
})
export class AccountPage {
  readonly autocine = inject(AutocineService);
  get usuario() {
    return this.autocine.usuarioActual()!;
  }
  tab: 'perfil' | 'vehiculos' | 'historial' = 'perfil';
  mensaje = '';
  mensajeVehiculo = '';
  mostrarVehiculo = false;
  vehiculoId: number | null = null;
  boleto: Reserva | null = null;
  readonly perfil = new FormGroup({
    nombre: new FormControl(this.usuario.nombre, {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)],
    }),
    correo: new FormControl(this.usuario.correo, {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
  });
  readonly vehiculo = new FormGroup({
    modelo: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    color: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    placas: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });
  guardarPerfil(): void {
    if (this.perfil.invalid) {
      this.perfil.markAllAsTouched();
      return;
    }
    const data = this.perfil.getRawValue();
    void this.actualizarPerfil(data.nombre, data.correo);
  }

  constructor() {
    void this.autocine.cargarDatosUsuario().catch((error: unknown) => {
      this.mensajeVehiculo = apiErrorMessage(error, 'No fue posible cargar los datos de la cuenta.');
    });
  }
  editarVehiculo(item?: { id: number; modelo: string; color: string; placas: string }): void {
    this.vehiculoId = item?.id ?? null;
    this.mostrarVehiculo = true;
    this.vehiculo.setValue({
      modelo: item?.modelo ?? '',
      color: item?.color ?? '',
      placas: item?.placas ?? '',
    });
  }
  async guardarVehiculo(): Promise<void> {
    if (this.vehiculo.invalid) {
      this.vehiculo.markAllAsTouched();
      return;
    }
    try {
      const ok = await this.autocine.guardarVehiculo(
        this.usuario,
        this.vehiculo.getRawValue(),
        this.vehiculoId ?? undefined,
      );
      this.mensajeVehiculo = ok ? 'Vehículo guardado.' : 'No fue posible guardar el vehículo.';
      if (ok) {
        this.mostrarVehiculo = false;
        this.vehiculoId = null;
      }
    } catch (error) {
      this.mensajeVehiculo = apiErrorMessage(error, 'No fue posible guardar el vehículo.');
    }
  }
  async eliminarVehiculo(id: number): Promise<void> {
    try {
      this.mensajeVehiculo = (await this.autocine.eliminarVehiculo(this.usuario, id))
        ? 'Vehículo eliminado.'
        : 'No fue posible eliminar el vehículo.';
    } catch (error) {
      this.mensajeVehiculo = apiErrorMessage(error, 'No fue posible eliminar el vehículo.');
    }
  }

  private async actualizarPerfil(nombre: string, correo: string): Promise<void> {
    try {
      const actualizado = await this.autocine.actualizarPerfil(this.usuario, nombre, correo);
      this.mensaje = actualizado
        ? 'Perfil actualizado.'
        : 'El correo ya está registrado en otra cuenta.';
    } catch (error) {
      this.mensaje = apiErrorMessage(error, 'No fue posible actualizar el perfil.');
    }
  }
}
