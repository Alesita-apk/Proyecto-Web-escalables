import { Injectable } from '@angular/core';
import { Alimento, Cajon, Funcion, Pelicula, Reserva, Usuario, Vehiculo } from '../interfaces/autocine.interface';
import { AuthService, CredencialesEmpleado } from './auth-service';
import { AlimentoInput, CatalogoService, FuncionInput, PeliculaInput } from './catalogo-service';
import { ReservasService } from './reservas-service';

export type { AlimentoInput, FuncionInput, PeliculaInput, CredencialesEmpleado };

@Injectable({ providedIn: 'root' })
export class AutocineService {
  constructor(
    private readonly auth: AuthService,
    private readonly catalogo: CatalogoService,
    private readonly reservasService: ReservasService,
  ) {}

  get precioPorCajon(): number {
    return this.catalogo.precioPorCajon;
  }

  get peliculas() {
    return this.catalogo.peliculas;
  }

  get funciones() {
    return this.catalogo.funciones;
  }

  get cajones() {
    return this.catalogo.cajones;
  }

  get alimentos() {
    return this.catalogo.alimentos;
  }

  get reservas() {
    return this.reservasService.reservas;
  }

  get usuarioActual() {
    return this.auth.usuarioActual;
  }

  establecerUsuario(usuario: Usuario | null): void {
    this.auth.establecerUsuario(usuario);
  }

  autenticar(correo: string, contrasena: string): Usuario | null {
    return this.auth.autenticar(correo, contrasena);
  }

  registrar(nombre: string, correo: string, contrasena: string): Usuario | null {
    return this.auth.registrar(nombre, correo, contrasena);
  }

  actualizarPerfil(actor: Usuario, nombre: string, correo: string): Usuario | null {
    return this.auth.actualizarPerfil(actor, nombre, correo);
  }

  vehiculosDe(usuario: Usuario): Vehiculo[] {
    return this.auth.vehiculosDe(usuario);
  }

  guardarVehiculo(
    actor: Usuario,
    vehiculo: Omit<Vehiculo, 'id' | 'usuarioId'>,
    id?: number,
  ): boolean {
    return this.auth.guardarVehiculo(actor, vehiculo, id);
  }

  eliminarVehiculo(actor: Usuario, id: number): boolean {
    return this.auth.eliminarVehiculo(actor, id);
  }

  crearEmpleado(actor: Usuario, datos: CredencialesEmpleado): Usuario | null {
    return this.auth.crearEmpleado(actor, datos);
  }

  empleados(actor: Usuario): Usuario[] {
    return this.auth.empleados(actor);
  }

  agregarPelicula(actor: Usuario, datos: PeliculaInput): Pelicula | null {
    return this.catalogo.agregarPelicula(actor, datos);
  }

  actualizarPelicula(actor: Usuario, id: number, datos: PeliculaInput): boolean {
    return this.catalogo.actualizarPelicula(actor, id, datos);
  }

  eliminarPelicula(actor: Usuario, id: number): boolean {
    if (this.catalogo.funciones().some((funcion) => funcion.peliculaId === id)) {
      return false;
    }
    return this.catalogo.eliminarPelicula(actor, id);
  }

  agregarFuncion(actor: Usuario, datos: FuncionInput): Funcion | null {
    return this.catalogo.agregarFuncion(actor, datos);
  }

  actualizarFuncion(actor: Usuario, id: number, datos: FuncionInput): boolean {
    if (this.reservas().some((reserva) => reserva.funcionId === id)) {
      return false;
    }
    return this.catalogo.actualizarFuncion(actor, id, datos);
  }

  eliminarFuncion(actor: Usuario, id: number): boolean {
    if (this.reservas().some((reserva) => reserva.funcionId === id)) {
      return false;
    }
    return this.catalogo.eliminarFuncion(actor, id);
  }

  agregarAlimento(actor: Usuario, datos: AlimentoInput): Alimento | null {
    return this.catalogo.agregarAlimento(actor, datos);
  }

  actualizarAlimento(actor: Usuario, id: number, datos: AlimentoInput): boolean {
    return this.catalogo.actualizarAlimento(actor, id, datos);
  }

  eliminarAlimento(actor: Usuario, id: number): boolean {
    return this.catalogo.eliminarAlimento(actor, id);
  }

  horariosDe(peliculaId: number, fecha: string): string[] {
    return this.catalogo.horariosDe(peliculaId, fecha);
  }

  obtenerFuncion(id: number): Funcion | undefined {
    return this.catalogo.obtenerFuncion(id);
  }

  obtenerCajonesOcupados(funcionId: number): string[] {
    return this.reservasService.obtenerCajonesOcupados(funcionId);
  }

  crearReserva(
    actor: Usuario,
    funcionId: number,
    cajones: string[],
    cantidadesAlimentos: Record<number, number>,
  ): Reserva | null {
    return this.reservasService.crearReserva(actor, funcionId, cajones, cantidadesAlimentos);
  }

  reservasDe(usuario: Usuario): Reserva[] {
    return this.reservasService.reservasDe(usuario);
  }

  validarAcceso(actor: Usuario, codigo: string): Reserva | null {
    return this.reservasService.validarAcceso(actor, codigo);
  }

  validarEntregaDulceria(actor: Usuario, codigo: string): Reserva | null {
    return this.reservasService.validarEntregaDulceria(actor, codigo);
  }

  buscarReserva(codigo: string): Reserva | undefined {
    return this.reservasService.buscarReserva(codigo);
  }

  cambiarTipoCajon(actor: Usuario, id: string, tipoVehiculo: string): boolean {
    return this.catalogo.cambiarTipoCajon(actor, id, tipoVehiculo);
  }
}
