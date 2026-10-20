import { Injectable, signal } from '@angular/core';
import { Reserva, Usuario } from '../interfaces/autocine.interface';
import { AuthService } from './auth-service';
import { CatalogoService } from './catalogo-service';

@Injectable({ providedIn: 'root' })
export class ReservasService {
  private _reservas = signal<Reserva[]>([]);
  private readonly reservasDeEjemplo = [
    { funcionId: 1, cajones: ['A3', 'B6', 'D2'] },
    { funcionId: 3, cajones: ['A5', 'C2', 'D7'] },
    { funcionId: 5, cajones: ['B3', 'C6', 'D1'] },
  ];
  private siguienteIdReserva = 1;

  readonly reservas = this._reservas.asReadonly();

  constructor(
    private readonly auth: AuthService,
    private readonly catalogo: CatalogoService,
  ) {}

  obtenerCajonesOcupados(funcionId: number): string[] {
    const ocupadosDeEjemplo =
      this.reservasDeEjemplo.find((reserva) => reserva.funcionId === funcionId)?.cajones ?? [];
    const reservados = this.reservas()
      .filter((reserva) => reserva.funcionId === funcionId)
      .flatMap((reserva) => reserva.cajones);
    return [...ocupadosDeEjemplo, ...reservados];
  }

  crearReserva(
    actor: Usuario,
    funcionId: number,
    cajones: string[],
    cantidadesAlimentos: Record<number, number>,
  ): Reserva | null {
    const funcion = this.catalogo.obtenerFuncion(funcionId);
    const pelicula = funcion
      ? this.catalogo.peliculas().find((actual) => actual.id === funcion.peliculaId)
      : undefined;
    if (
      !this.auth.esRol(actor, 'cliente') ||
      !funcion ||
      !pelicula ||
      cajones.length === 0 ||
      new Set(cajones).size !== cajones.length ||
      cajones.some((id) => !this.catalogo.cajones().some((cajon) => cajon.id === id)) ||
      cajones.some((id) => this.obtenerCajonesOcupados(funcionId).includes(id))
    ) {
      return null;
    }

    const alimentos: Reserva['alimentos'] = [];
    for (const [idTexto, cantidad] of Object.entries(cantidadesAlimentos)) {
      if (!Number.isInteger(cantidad) || cantidad < 0) {
        return null;
      }
      if (cantidad === 0) {
        continue;
      }
      const id = Number(idTexto);
      const alimento = this.catalogo.alimentos().find((actual) => actual.id === id);
      if (!alimento || alimento.existencias < cantidad) {
        return null;
      }
      alimentos.push({
        alimentoId: alimento.id,
        nombre: alimento.nombre,
        cantidad,
        precioUnitario: alimento.precio,
        entregado: false,
      });
    }

    const id = this.siguienteIdReserva++;
    const reserva: Reserva = {
      id,
      codigo: `ACD-${String(id).padStart(6, '0')}`,
      usuarioId: actor.id,
      correo: actor.correo,
      pelicula: pelicula.titulo,
      peliculaId: pelicula.id,
      funcionId: funcion.id,
      fecha: funcion.fecha,
      horario: funcion.horario,
      cajones: [...cajones],
      alimentos,
      total:
        cajones.length * this.catalogo.precioPorCajon +
        alimentos.reduce((total, alimento) => total + alimento.cantidad * alimento.precioUnitario, 0),
      estado: 'confirmada',
    };

    this.catalogo.descontarExistencias(alimentos);
    this._reservas.update((reservas) => [...reservas, reserva]);
    return reserva;
  }

  reservasDe(usuario: Usuario): Reserva[] {
    return this.reservas().filter((reserva) => reserva.usuarioId === usuario.id);
  }

  validarAcceso(actor: Usuario, codigo: string): Reserva | null {
    if (!this.auth.esRol(actor, 'empleado')) {
      return null;
    }
    const reserva = this.reservaPorCodigo(codigo);
    if (!reserva || reserva.estado === 'acceso-validado') {
      return null;
    }
    this._reservas.update((reservas) =>
      reservas.map((actual) =>
        actual.id === reserva.id ? { ...actual, estado: 'acceso-validado' } : actual,
      ),
    );
    return { ...reserva, estado: 'acceso-validado' };
  }

  validarEntregaDulceria(actor: Usuario, codigo: string): Reserva | null {
    if (!this.auth.esRol(actor, 'empleado')) {
      return null;
    }
    const reserva = this.reservaPorCodigo(codigo);
    if (
      !reserva ||
      reserva.estado !== 'acceso-validado' ||
      reserva.alimentos.length === 0 ||
      reserva.alimentos.every((alimento) => alimento.entregado)
    ) {
      return null;
    }
    const actualizada = {
      ...reserva,
      alimentos: reserva.alimentos.map((alimento) => ({ ...alimento, entregado: true })),
    };
    this._reservas.update((reservas) =>
      reservas.map((actual) => (actual.id === reserva.id ? actualizada : actual)),
    );
    return actualizada;
  }

  buscarReserva(codigo: string): Reserva | undefined {
    const reserva = this.reservaPorCodigo(codigo);
    return reserva ? { ...reserva, alimentos: reserva.alimentos.map((item) => ({ ...item })) } : undefined;
  }

  private reservaPorCodigo(codigo: string): Reserva | undefined {
    const normalizado = codigo.trim().toLowerCase();
    return this.reservas().find((reserva) => reserva.codigo.toLowerCase() === normalizado);
  }
}
