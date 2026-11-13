import { HttpErrorResponse } from '@angular/common/http';
import { inject, Service, signal } from '@angular/core';
import { Usuario, Vehiculo } from '../interfaces/autocine.interface';
import { ApiService } from './api-service';

export interface CredencialesEmpleado {
  nombre: string;
  correo: string;
  contrasena: string;
}

interface AuthResponse {
  usuario: Usuario;
  token: string;
}

@Service()
export class AuthService {
  private readonly api = inject(ApiService);
  private _usuarioActual = signal<Usuario | null>(null);
  private _vehiculos = signal<Vehiculo[]>([]);
  private _empleados = signal<Usuario[]>([]);

  readonly usuarioActual = this._usuarioActual.asReadonly();
  readonly vehiculos = this._vehiculos.asReadonly();
  readonly empleadosActuales = this._empleados.asReadonly();

  async restaurarSesion(): Promise<void> {
    if (!localStorage.getItem('autocine-token')) return;
    try {
      const response = await this.api.get<{ usuario: Usuario }>('/auth/me');
      this._usuarioActual.set(response.usuario);
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        this.api.setToken(null);
        this._usuarioActual.set(null);
        return;
      }
      throw error;
    }
  }

  async autenticar(correo: string, contrasena: string): Promise<Usuario> {
    const response = await this.api.post<AuthResponse>('/auth/login', { correo, contrasena });
    this.establecerSesion(response);
    return response.usuario;
  }

  async registrar(nombre: string, correo: string, contrasena: string): Promise<Usuario> {
    const response = await this.api.post<AuthResponse>('/auth/register', {
      nombre,
      correo,
      contrasena,
    });
    this.establecerSesion(response);
    return response.usuario;
  }

  async actualizarPerfil(_actor: Usuario, nombre: string, correo: string): Promise<Usuario> {
    const response = await this.api.patch<{ usuario: Usuario; token: string }>(
      '/account/me',
      { nombre, correo },
    );
    this.api.setToken(response.token);
    this._usuarioActual.set(response.usuario);
    return response.usuario;
  }

  async cargarVehiculos(): Promise<Vehiculo[]> {
    const vehicles = await this.api.get<Vehiculo[]>('/account/me/vehicles');
    this._vehiculos.set(vehicles);
    return vehicles;
  }

  vehiculosDe(usuario: Usuario): Vehiculo[] {
    return this._vehiculos().filter((vehicle) => vehicle.usuarioId === usuario.id);
  }

  async guardarVehiculo(
    _actor: Usuario,
    vehiculo: Omit<Vehiculo, 'id' | 'usuarioId'>,
    id?: number,
  ): Promise<boolean> {
    const saved = await (id === undefined
      ? this.api.post<Vehiculo>('/account/me/vehicles', vehiculo)
      : this.api.put<Vehiculo>(`/account/me/vehicles/${id}`, vehiculo));
    this._vehiculos.update((vehicles) =>
      id === undefined
        ? [...vehicles, saved]
        : vehicles.map((vehicle) => (vehicle.id === id ? saved : vehicle)),
    );
    return true;
  }

  async eliminarVehiculo(_actor: Usuario, id: number): Promise<boolean> {
    await this.api.delete(`/account/me/vehicles/${id}`);
    this._vehiculos.update((vehicles) => vehicles.filter((vehicle) => vehicle.id !== id));
    return true;
  }

  async crearEmpleado(_actor: Usuario, data: CredencialesEmpleado): Promise<Usuario> {
    const employee = await this.api.post<Usuario>('/account/employees', data);
    this._empleados.update((employees) => [...employees, employee]);
    return employee;
  }

  async cargarEmpleados(): Promise<Usuario[]> {
    const employees = await this.api.get<Usuario[]>('/account/employees');
    this._empleados.set(employees);
    return employees;
  }

  empleados(): Usuario[] {
    return this._empleados();
  }

  establecerUsuario(usuario: Usuario | null): void {
    this._usuarioActual.set(usuario ? { ...usuario } : null);
    if (!usuario) {
      this.api.setToken(null);
      this._vehiculos.set([]);
      this._empleados.set([]);
    }
  }

  esRol(actor: Usuario, rol: Usuario['rol']): boolean {
    const actual = this._usuarioActual();
    return actual?.id === actor.id && actual.correo === actor.correo && actual.rol === rol;
  }

  private establecerSesion(response: AuthResponse): void {
    this.api.setToken(response.token);
    this._usuarioActual.set(response.usuario);
  }
}
