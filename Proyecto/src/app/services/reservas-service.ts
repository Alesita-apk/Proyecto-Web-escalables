import { inject, Service, signal } from '@angular/core';
import { Reserva, Usuario } from '../interfaces/autocine.interface';
import { ApiService } from './api-service';
import { CatalogoService } from './catalogo-service';

@Service()
export class ReservasService {
  private readonly api = inject(ApiService);
  private readonly catalogo = inject(CatalogoService);
  private _reservas = signal<Reserva[]>([]);
  private _cajonesOcupados = signal<Record<number, string[]>>({});

  readonly reservas = this._reservas.asReadonly();

  async cargar(actor: Usuario | null): Promise<void> {
    if (!actor || actor.rol === 'empleado') {
      this._reservas.set([]);
      return;
    }
    this._reservas.set(await this.api.get<Reserva[]>('/reservations'));
  }

  obtenerCajonesOcupados(funcionId: number): string[] {
    const cached = this._cajonesOcupados()[funcionId] ?? [];
    const reserved = this.reservas()
      .filter((reservation) => reservation.funcionId === funcionId)
      .flatMap((reservation) => reservation.cajones);
    return [...new Set([...cached, ...reserved])];
  }

  async cargarCajonesOcupados(funcionId: number): Promise<string[]> {
    const response = await this.api.get<{ cajones: string[] }>(
      `/reservations/occupied/${funcionId}`,
    );
    this._cajonesOcupados.update((current) => ({ ...current, [funcionId]: response.cajones }));
    return this.obtenerCajonesOcupados(funcionId);
  }

  async crearReserva(
    _actor: Usuario,
    funcionId: number,
    cajones: string[],
    cantidadesAlimentos: Record<number, number>,
  ): Promise<Reserva> {
    const reservation = await this.api.post<Reserva>('/reservations', {
      funcionId,
      cajones,
      cantidadesAlimentos,
    });
    this._reservas.update((reservations) => [reservation, ...reservations]);
    this.catalogo.aplicarReserva(
      reservation.alimentos.map(({ alimentoId, cantidad }) => ({ alimentoId, cantidad })),
    );
    this._cajonesOcupados.update((current) => ({
      ...current,
      [funcionId]: [...new Set([...(current[funcionId] ?? []), ...reservation.cajones])],
    }));
    return reservation;
  }

  reservasDe(usuario: Usuario): Reserva[] {
    return this.reservas().filter((reservation) => reservation.usuarioId === usuario.id);
  }

  async validarAcceso(_actor: Usuario, codigo: string): Promise<Reserva> {
    const reservation = await this.api.patch<Reserva>(
      `/reservations/${encodeURIComponent(codigo)}/access`,
    );
    this.actualizarReserva(reservation);
    return reservation;
  }

  async validarEntregaDulceria(_actor: Usuario, codigo: string): Promise<Reserva> {
    const reservation = await this.api.patch<Reserva>(
      `/reservations/${encodeURIComponent(codigo)}/delivery`,
    );
    this.actualizarReserva(reservation);
    return reservation;
  }

  buscarReserva(codigo: string): Reserva | undefined {
    const normalized = codigo.trim().toLowerCase();
    return this.reservas().find((reservation) => reservation.codigo.toLowerCase() === normalized);
  }

  private actualizarReserva(reservation: Reserva): void {
    this._reservas.update((reservations) => [
      reservation,
      ...reservations.filter((item) => item.id !== reservation.id),
    ]);
  }
}
