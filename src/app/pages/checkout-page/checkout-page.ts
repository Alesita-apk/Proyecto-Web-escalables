import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Alimento, Funcion, Reserva } from '../../interfaces/autocine.interface';
import { AutocineService } from '../../services/autocine-service';

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './checkout-page.html',
  styleUrl: './checkout-page.css',
})
export class CheckoutPage implements OnInit {
  readonly autocine = inject(AutocineService);
  private readonly route = inject(ActivatedRoute);
  funcion?: Funcion;
  pelicula?: ReturnType<AutocineService['peliculas']>[number];
  paso = 1;
  seleccionados: string[] = [];
  cantidades: Record<number, number> = {};
  reserva: Reserva | null = null;
  mensaje = '';

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('funcionId'));
    this.funcion = this.autocine.obtenerFuncion(id);
    this.pelicula = this.funcion
      ? this.autocine.peliculas().find((item) => item.id === this.funcion?.peliculaId)
      : undefined;
  }
  ocupado(id: string): boolean {
    return !!this.funcion && this.autocine.obtenerCajonesOcupados(this.funcion.id).includes(id);
  }
  alternarCajon(id: string): void {
    if (this.ocupado(id)) return;
    this.seleccionados = this.seleccionados.includes(id)
      ? this.seleccionados.filter((actual) => actual !== id)
      : [...this.seleccionados, id];
  }
  cambiarCantidad(item: Alimento, cambio: number): void {
    this.cantidades = {
      ...this.cantidades,
      [item.id]: Math.max(0, Math.min(item.existencias, (this.cantidades[item.id] ?? 0) + cambio)),
    };
  }
  get subtotalBoletos(): number {
    return this.seleccionados.length * this.autocine.precioPorCajon;
  }
  get subtotalAlimentos(): number {
    return this.autocine
      .alimentos()
      .reduce((suma, item) => suma + item.precio * (this.cantidades[item.id] ?? 0), 0);
  }
  get total(): number {
    return this.reserva?.total ?? this.subtotalBoletos + this.subtotalAlimentos;
  }
  get alimentosTexto(): string {
    return (
      this.reserva?.alimentos.map((item) => `${item.cantidad} × ${item.nombre}`).join(', ') ?? ''
    );
  }
  anterior(): void {
    this.paso = Math.max(1, this.paso - 1);
    this.mensaje = '';
  }
  continuar(): void {
    this.mensaje = '';
    if (this.paso === 1 && !this.seleccionados.length) {
      this.mensaje = 'Selecciona al menos un cajón disponible.';
      return;
    }
    if (this.paso < 3) {
      this.paso++;
      return;
    }
    const usuario = this.autocine.usuarioActual();
    if (!usuario || usuario.rol !== 'cliente' || !this.funcion) return;
    this.reserva = this.autocine.crearReserva(
      usuario,
      this.funcion.id,
      this.seleccionados,
      this.cantidades,
    );
    if (!this.reserva) {
      this.mensaje = 'No se pudo reservar: revisa disponibilidad y existencias.';
      this.paso = 1;
      return;
    }
    this.paso = 4;
  }
  descargar(): void {
    if (!this.reserva || !this.funcion || !this.pelicula) return;
    const body = `AUTOCINEMA DIGITAL\nFolio: ${this.reserva.codigo}\nPelícula: ${this.pelicula.titulo}\nFecha: ${this.funcion.fecha}\nHorario: ${this.funcion.horario}\nCajones: ${this.reserva.cajones.join(', ')}\nTotal: ${this.reserva.total}`;
    const url = URL.createObjectURL(new Blob([body], { type: 'text/plain;charset=utf-8' }));
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = `${this.reserva.codigo}.txt`;
    enlace.click();
    URL.revokeObjectURL(url);
  }
}
