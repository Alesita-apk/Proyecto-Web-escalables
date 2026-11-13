import { inject, Service, signal } from '@angular/core';
import { Alimento, Cajon, Funcion, Pelicula, Reserva, Usuario, Vehiculo } from '../interfaces/autocine.interface';
import { AuthService, CredencialesEmpleado } from './auth-service';
import { AlimentoInput, CatalogoService, FuncionInput, PeliculaInput } from './catalogo-service';
import { ReservasService } from './reservas-service';

export type { AlimentoInput, FuncionInput, PeliculaInput, CredencialesEmpleado };

@Service()
export class AutocineService {
  readonly errorCarga = signal('');
  private readonly auth = inject(AuthService);
  private readonly catalogo = inject(CatalogoService);
  private readonly reservasService = inject(ReservasService);
  private inicializacion?: Promise<void>;

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

  inicializar(): Promise<void> {
    this.inicializacion ??= this.cargarInicializacion();
    return this.inicializacion;
  }

  private async cargarInicializacion(): Promise<void> {
    await this.auth.restaurarSesion();
    await this.catalogo.cargar();
    await this.cargarDatosUsuario();
    this.errorCarga.set('');
  }

  async cargarDatosUsuario(): Promise<void> {
    const user = this.usuarioActual();
    await this.reservasService.cargar(user);
    if (user?.rol === 'cliente') {
      await this.auth.cargarVehiculos();
    } else if (user?.rol === 'admin') {
      await this.auth.cargarEmpleados();
    }
  }

  establecerUsuario(usuario: Usuario | null): void {
    this.auth.establecerUsuario(usuario);
    if (!usuario) {
      void this.reservasService.cargar(null);
    }
  }

  autenticar(correo: string, contrasena: string): Promise<Usuario> {
    return this.auth.autenticar(correo, contrasena);
  }

  registrar(nombre: string, correo: string, contrasena: string): Promise<Usuario> {
    return this.auth.registrar(nombre, correo, contrasena);
  }

  actualizarPerfil(actor: Usuario, nombre: string, correo: string): Promise<Usuario> {
    return this.auth.actualizarPerfil(actor, nombre, correo);
  }

  vehiculosDe(usuario: Usuario): Vehiculo[] {
    return this.auth.vehiculosDe(usuario);
  }

  guardarVehiculo(
    actor: Usuario,
    vehiculo: Omit<Vehiculo, 'id' | 'usuarioId'>,
    id?: number,
  ): Promise<boolean> {
    return this.auth.guardarVehiculo(actor, vehiculo, id);
  }

  eliminarVehiculo(actor: Usuario, id: number): Promise<boolean> {
    return this.auth.eliminarVehiculo(actor, id);
  }

  crearEmpleado(actor: Usuario, datos: CredencialesEmpleado): Promise<Usuario> {
    return this.auth.crearEmpleado(actor, datos);
  }

  empleados(_actor: Usuario): Usuario[] {
    return this.auth.empleados();
  }

  agregarPelicula(actor: Usuario, datos: PeliculaInput): Promise<Pelicula> {
    return this.catalogo.agregarPelicula(actor, datos);
  }

  actualizarPelicula(actor: Usuario, id: number, datos: PeliculaInput): Promise<boolean> {
    return this.catalogo.actualizarPelicula(actor, id, datos);
  }

  eliminarPelicula(actor: Usuario, id: number): Promise<boolean> {
    return this.catalogo.eliminarPelicula(actor, id);
  }

  agregarFuncion(actor: Usuario, datos: FuncionInput): Promise<Funcion> {
    return this.catalogo.agregarFuncion(actor, datos);
  }

  actualizarFuncion(actor: Usuario, id: number, datos: FuncionInput): Promise<boolean> {
    return this.catalogo.actualizarFuncion(actor, id, datos);
  }

  eliminarFuncion(actor: Usuario, id: number): Promise<boolean> {
    return this.catalogo.eliminarFuncion(actor, id);
  }

  agregarAlimento(actor: Usuario, datos: AlimentoInput): Promise<Alimento> {
    return this.catalogo.agregarAlimento(actor, datos);
  }

  actualizarAlimento(actor: Usuario, id: number, datos: AlimentoInput): Promise<boolean> {
    return this.catalogo.actualizarAlimento(actor, id, datos);
  }

  eliminarAlimento(actor: Usuario, id: number): Promise<boolean> {
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

  cargarCajonesOcupados(funcionId: number): Promise<string[]> {
    return this.reservasService.cargarCajonesOcupados(funcionId);
  }

  crearReserva(
    actor: Usuario,
    funcionId: number,
    cajones: string[],
    cantidadesAlimentos: Record<number, number>,
  ): Promise<Reserva> {
    return this.reservasService.crearReserva(actor, funcionId, cajones, cantidadesAlimentos);
  }

  reservasDe(usuario: Usuario): Reserva[] {
    return this.reservasService.reservasDe(usuario);
  }

  validarAcceso(actor: Usuario, codigo: string): Promise<Reserva> {
    return this.reservasService.validarAcceso(actor, codigo);
  }

  validarEntregaDulceria(actor: Usuario, codigo: string): Promise<Reserva> {
    return this.reservasService.validarEntregaDulceria(actor, codigo);
  }

  buscarReserva(codigo: string): Reserva | undefined {
    return this.reservasService.buscarReserva(codigo);
  }

  cambiarTipoCajon(actor: Usuario, id: string, tipoVehiculo: string): Promise<boolean> {
    return this.catalogo.cambiarTipoCajon(actor, id, tipoVehiculo);
  }
}
