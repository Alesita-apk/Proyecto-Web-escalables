import { inject, Service, signal } from '@angular/core';
import { Alimento, Cajon, Funcion, Pelicula, Usuario } from '../interfaces/autocine.interface';
import { ApiService } from './api-service';

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

interface SiteData {
  peliculas: Pelicula[];
  funciones: Funcion[];
  cajones: Cajon[];
  alimentos: Alimento[];
  precioPorCajon: number;
}

@Service()
export class CatalogoService {
  private readonly api = inject(ApiService);
  private _precioPorCajon = 200;
  private _peliculas = signal<Pelicula[]>([]);
  private _funciones = signal<Funcion[]>([]);
  private _cajones = signal<Cajon[]>([]);
  private _alimentos = signal<Alimento[]>([]);

  get precioPorCajon(): number {
    return this._precioPorCajon;
  }
  readonly peliculas = this._peliculas.asReadonly();
  readonly funciones = this._funciones.asReadonly();
  readonly cajones = this._cajones.asReadonly();
  readonly alimentos = this._alimentos.asReadonly();

  async cargar(): Promise<void> {
    const data = await this.api.get<SiteData>('/site');
    this.aplicarDatos(data);
  }

  aplicarReserva(alimentosReservados: { alimentoId: number; cantidad: number }[]): void {
    this._alimentos.update((foods) =>
      foods.map((food) => {
        const order = alimentosReservados.find((item) => item.alimentoId === food.id);
        return order ? { ...food, existencias: food.existencias - order.cantidad } : food;
      }),
    );
  }

  async agregarPelicula(_actor: Usuario, datos: PeliculaInput): Promise<Pelicula> {
    const movie = await this.api.post<Pelicula>('/site/movies', datos);
    this._peliculas.update((movies) => [...movies, movie]);
    return movie;
  }

  async actualizarPelicula(
    _actor: Usuario,
    id: number,
    datos: PeliculaInput,
  ): Promise<boolean> {
    const movie = await this.api.put<Pelicula>(`/site/movies/${id}`, datos);
    this._peliculas.update((movies) => movies.map((item) => (item.id === id ? movie : item)));
    return true;
  }

  async eliminarPelicula(_actor: Usuario, id: number): Promise<boolean> {
    await this.api.delete(`/site/movies/${id}`);
    this._peliculas.update((movies) => movies.filter((movie) => movie.id !== id));
    return true;
  }

  async agregarFuncion(_actor: Usuario, datos: FuncionInput): Promise<Funcion> {
    const screening = await this.api.post<Funcion>('/site/functions', datos);
    this._funciones.update((screenings) => [...screenings, screening]);
    return screening;
  }

  async actualizarFuncion(
    _actor: Usuario,
    id: number,
    datos: FuncionInput,
  ): Promise<boolean> {
    const screening = await this.api.put<Funcion>(`/site/functions/${id}`, datos);
    this._funciones.update((screenings) =>
      screenings.map((item) => (item.id === id ? screening : item)),
    );
    return true;
  }

  async eliminarFuncion(_actor: Usuario, id: number): Promise<boolean> {
    await this.api.delete(`/site/functions/${id}`);
    this._funciones.update((screenings) => screenings.filter((screening) => screening.id !== id));
    return true;
  }

  async agregarAlimento(_actor: Usuario, datos: AlimentoInput): Promise<Alimento> {
    const food = await this.api.post<Alimento>('/site/foods', datos);
    this._alimentos.update((foods) => [...foods, food]);
    return food;
  }

  async actualizarAlimento(
    _actor: Usuario,
    id: number,
    datos: AlimentoInput,
  ): Promise<boolean> {
    const food = await this.api.put<Alimento>(`/site/foods/${id}`, datos);
    this._alimentos.update((foods) => foods.map((item) => (item.id === id ? food : item)));
    return true;
  }

  async eliminarAlimento(_actor: Usuario, id: number): Promise<boolean> {
    await this.api.delete(`/site/foods/${id}`);
    this._alimentos.update((foods) => foods.filter((food) => food.id !== id));
    return true;
  }

  horariosDe(peliculaId: number, fecha: string): string[] {
    return this.funciones()
      .filter((screening) => screening.peliculaId === peliculaId && screening.fecha === fecha)
      .map((screening) => screening.horario);
  }

  obtenerFuncion(id: number): Funcion | undefined {
    return this.funciones().find((screening) => screening.id === id);
  }

  async cambiarTipoCajon(_actor: Usuario, id: string, tipoVehiculo: string): Promise<boolean> {
    const space = await this.api.patch<Cajon>(`/site/parking/${encodeURIComponent(id)}`, {
      tipoVehiculo,
    });
    this._cajones.update((spaces) => spaces.map((item) => (item.id === id ? space : item)));
    return true;
  }

  private aplicarDatos(data: SiteData): void {
    this._peliculas.set(data.peliculas);
    this._funciones.set(data.funciones);
    this._cajones.set(data.cajones);
    this._alimentos.set(data.alimentos);
    this._precioPorCajon = data.precioPorCajon;
  }
}
