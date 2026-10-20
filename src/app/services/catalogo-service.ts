import { Injectable, signal } from '@angular/core';
import { Alimento, Cajon, Funcion, Pelicula, Usuario } from '../interfaces/autocine.interface';
import { AuthService } from './auth-service';

export interface PeliculaInput {
  titulo: string;
  sinopsis: string;
  genero: string;
  duracion: string;
  clasificacion: string;
  imagen: string;
}

export interface FuncionInput {
  peliculaId: number;
  fecha: string;
  horario: string;
}

export interface AlimentoInput {
  nombre: string;
  descripcion: string;
  categoria: string;
  precio: number;
  existencias: number;
}

@Injectable({ providedIn: 'root' })
export class CatalogoService {
  readonly precioPorCajon = 200;
  private _peliculas = signal<Pelicula[]>([
    {
      id: 1,
      titulo: 'El mapa de las luciérnagas',
      sinopsis: 'Durante una excursión nocturna, dos hermanos encuentran un sendero iluminado que los conduce a un secreto familiar.',
      genero: 'Aventura · Familiar',
      duracion: '1 h 48 min',
      clasificacion: 'A',
      imagen:
        'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=900&q=85',
    },
    {
      id: 2,
      titulo: 'Frecuencia de medianoche',
      sinopsis: 'En una estación de radio casi vacía, una locutora intenta descubrir quién está enviando mensajes desde el otro lado de la ciudad.',
      genero: 'Suspenso · Misterio',
      duracion: '2 h 05 min',
      clasificacion: 'B',
      imagen:
        'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=900&q=85',
    },
    {
      id: 3,
      titulo: 'Órbita perdida',
      sinopsis: 'Una exploradora despierta lejos de su ruta y debe encontrar una forma de volver a casa antes de perder contacto con la Tierra.',
      genero: 'Ciencia ficción',
      duracion: '1 h 56 min',
      clasificacion: 'A',
      imagen:
        'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=900&q=85',
    },
  ]);
  private _funciones = signal<Funcion[]>(this.crearFuncionesIniciales());
  private _cajones = signal<Cajon[]>(
    ['A', 'B', 'C', 'D'].flatMap((fila) =>
      Array.from({ length: 8 }, (_, indice) => ({
        id: `${fila}${indice + 1}`,
        tipoVehiculo: 'Automóvil',
      })),
    ),
  );
  private _alimentos = signal<Alimento[]>([
    { id: 1, nombre: 'Palomitas grandes', descripcion: 'Clásicas con mantequilla.', categoria: 'Palomitas', precio: 95, existencias: 40 },
    { id: 2, nombre: 'Combo Luna', descripcion: 'Palomitas grandes y dos bebidas.', categoria: 'Combos', precio: 185, existencias: 25 },
    { id: 3, nombre: 'Nachos', descripcion: 'Totopos con queso.', categoria: 'Snacks', precio: 90, existencias: 30 },
    { id: 4, nombre: 'Bebida', descripcion: 'Refresco de 700 ml.', categoria: 'Bebidas', precio: 55, existencias: 60 },
  ]);
  private siguienteIdPelicula = 4;
  private siguienteIdFuncion = 20;
  private siguienteIdAlimento = 5;

  readonly peliculas = this._peliculas.asReadonly();
  readonly funciones = this._funciones.asReadonly();
  readonly cajones = this._cajones.asReadonly();
  readonly alimentos = this._alimentos.asReadonly();

  constructor(private readonly auth: AuthService) {}

  agregarPelicula(actor: Usuario, datos: PeliculaInput): Pelicula | null {
    if (!this.auth.esRol(actor, 'admin')) {
      return null;
    }
    const pelicula = { ...datos, id: this.siguienteIdPelicula++ };
    this._peliculas.update((peliculas) => [...peliculas, pelicula]);
    return pelicula;
  }

  actualizarPelicula(actor: Usuario, id: number, datos: PeliculaInput): boolean {
    if (!this.auth.esRol(actor, 'admin') || !this.peliculas().some((pelicula) => pelicula.id === id)) {
      return false;
    }
    this._peliculas.update((peliculas) =>
      peliculas.map((pelicula) => (pelicula.id === id ? { ...datos, id } : pelicula)),
    );
    return true;
  }

  eliminarPelicula(actor: Usuario, id: number): boolean {
    if (
      !this.auth.esRol(actor, 'admin') ||
      this.funciones().some((funcion) => funcion.peliculaId === id) ||
      !this.peliculas().some((pelicula) => pelicula.id === id)
    ) {
      return false;
    }
    this._peliculas.update((peliculas) => peliculas.filter((pelicula) => pelicula.id !== id));
    return true;
  }

  agregarFuncion(actor: Usuario, datos: FuncionInput): Funcion | null {
    if (
      !this.auth.esRol(actor, 'admin') ||
      !this.peliculas().some((pelicula) => pelicula.id === datos.peliculaId) ||
      this.funciones().some(
        (funcion) =>
          funcion.peliculaId === datos.peliculaId &&
          funcion.fecha === datos.fecha &&
          funcion.horario === datos.horario,
      )
    ) {
      return null;
    }
    const funcion = { ...datos, id: this.siguienteIdFuncion++ };
    this._funciones.update((funciones) => [...funciones, funcion]);
    return funcion;
  }

  actualizarFuncion(actor: Usuario, id: number, datos: FuncionInput): boolean {
    if (
      !this.auth.esRol(actor, 'admin') ||
      !this.funciones().some((funcion) => funcion.id === id) ||
      !this.peliculas().some((pelicula) => pelicula.id === datos.peliculaId) ||
      this.funciones().some(
        (funcion) =>
          funcion.id !== id &&
          funcion.peliculaId === datos.peliculaId &&
          funcion.fecha === datos.fecha &&
          funcion.horario === datos.horario,
      )
    ) {
      return false;
    }
    this._funciones.update((funciones) =>
      funciones.map((funcion) => (funcion.id === id ? { ...datos, id } : funcion)),
    );
    return true;
  }

  eliminarFuncion(actor: Usuario, id: number): boolean {
    if (!this.auth.esRol(actor, 'admin') || !this.funciones().some((funcion) => funcion.id === id)) {
      return false;
    }
    this._funciones.update((funciones) => funciones.filter((funcion) => funcion.id !== id));
    return true;
  }

  agregarAlimento(actor: Usuario, datos: AlimentoInput): Alimento | null {
    if (!this.auth.esRol(actor, 'admin')) {
      return null;
    }
    const alimento = { ...datos, id: this.siguienteIdAlimento++ };
    this._alimentos.update((alimentos) => [...alimentos, alimento]);
    return alimento;
  }

  actualizarAlimento(actor: Usuario, id: number, datos: AlimentoInput): boolean {
    if (!this.auth.esRol(actor, 'admin') || !this.alimentos().some((alimento) => alimento.id === id)) {
      return false;
    }
    this._alimentos.update((alimentos) =>
      alimentos.map((alimento) => (alimento.id === id ? { ...datos, id } : alimento)),
    );
    return true;
  }

  eliminarAlimento(actor: Usuario, id: number): boolean {
    if (!this.auth.esRol(actor, 'admin') || !this.alimentos().some((alimento) => alimento.id === id)) {
      return false;
    }
    this._alimentos.update((alimentos) => alimentos.filter((alimento) => alimento.id !== id));
    return true;
  }

  horariosDe(peliculaId: number, fecha: string): string[] {
    return this.funciones()
      .filter((funcion) => funcion.peliculaId === peliculaId && funcion.fecha === fecha)
      .map((funcion) => funcion.horario);
  }

  obtenerFuncion(id: number): Funcion | undefined {
    return this.funciones().find((funcion) => funcion.id === id);
  }

  cambiarTipoCajon(actor: Usuario, id: string, tipoVehiculo: string): boolean {
    if (!this.auth.esRol(actor, 'admin') || !this.cajones().some((cajon) => cajon.id === id)) {
      return false;
    }
    this._cajones.update((cajones) =>
      cajones.map((cajon) => (cajon.id === id ? { ...cajon, tipoVehiculo } : cajon)),
    );
    return true;
  }

  descontarExistencias(pedidos: { alimentoId: number; cantidad: number }[]): void {
    this._alimentos.update((alimentos) =>
      alimentos.map((alimento) => {
        const pedido = pedidos.find((item) => item.alimentoId === alimento.id);
        return pedido
          ? { ...alimento, existencias: alimento.existencias - pedido.cantidad }
          : alimento;
      }),
    );
  }

  private fechaLocal(fecha: Date): string {
    const local = new Date(fecha.getTime() - fecha.getTimezoneOffset() * 60_000);
    return local.toISOString().slice(0, 10);
  }

  private crearFuncionesIniciales(): Funcion[] {
    const horarios: { peliculaId: number; horarios: string[] }[] = [
      { peliculaId: 1, horarios: ['19:30', '21:45'] },
      { peliculaId: 2, horarios: ['20:00', '22:30'] },
      { peliculaId: 3, horarios: ['19:00', '21:30'] },
    ];
    const funciones: Funcion[] = [];
    for (let dia = 0; dia < 3; dia++) {
      for (const grupo of horarios) {
        for (const horario of grupo.horarios) {
          funciones.push({
            id: funciones.length + 1,
            peliculaId: grupo.peliculaId,
            fecha: this.fechaConDesfase(dia),
            horario,
          });
        }
      }
    }
    return funciones;
  }

  private fechaConDesfase(dias: number): string {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + dias);
    return this.fechaLocal(fecha);
  }
}
