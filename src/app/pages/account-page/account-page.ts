import { CurrencyPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Reserva } from '../../interfaces/autocine.interface';
import { AutocineService } from '../../services/autocine-service';

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
    const actualizado = this.autocine.actualizarPerfil(this.usuario, data.nombre, data.correo);
    this.mensaje = actualizado
      ? 'Perfil actualizado.'
      : 'El correo ya está registrado en otra cuenta.';
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
  guardarVehiculo(): void {
    if (this.vehiculo.invalid) {
      this.vehiculo.markAllAsTouched();
      return;
    }
    const ok = this.autocine.guardarVehiculo(
      this.usuario,
      this.vehiculo.getRawValue(),
      this.vehiculoId ?? undefined,
    );
    this.mensajeVehiculo = ok ? 'Vehículo guardado.' : 'No fue posible guardar el vehículo.';
    if (ok) {
      this.mostrarVehiculo = false;
      this.vehiculoId = null;
    }
  }
  eliminarVehiculo(id: number): void {
    this.mensajeVehiculo = this.autocine.eliminarVehiculo(this.usuario, id)
      ? 'Vehículo eliminado.'
      : 'No fue posible eliminar el vehículo.';
  }
}
