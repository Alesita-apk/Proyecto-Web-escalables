import { Injectable, signal } from '@angular/core';
import { Usuario, Vehiculo } from '../interfaces/autocine.interface';

interface Cuenta {
  usuario: Usuario;
  contrasena: string;
}

export interface CredencialesEmpleado {
  nombre: string;
  correo: string;
  contrasena: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _usuarioActual = signal<Usuario | null>(null);
  private _vehiculos = signal<Vehiculo[]>([
    { id: 1, usuarioId: 1, modelo: 'Nissan Versa', color: 'Gris', placas: 'ABC-123' },
  ]);
  private readonly cuentas: Cuenta[] = [
    { usuario: { id: 1, nombre: 'Cliente de prueba', correo: 'cliente@autocine.mx', rol: 'cliente' }, contrasena: '123456' },
    { usuario: { id: 2, nombre: 'Empleado de prueba', correo: 'empleado@autocine.mx', rol: 'empleado' }, contrasena: '123456' },
    { usuario: { id: 3, nombre: 'Administrador de prueba', correo: 'admin@autocine.mx', rol: 'admin' }, contrasena: '123456' },
  ];
  private siguienteIdUsuario = 4;
  private siguienteIdVehiculo = 2;

  readonly usuarioActual = this._usuarioActual.asReadonly();

  establecerUsuario(usuario: Usuario | null): void {
    this._usuarioActual.set(usuario ? { ...usuario } : null);
  }

  autenticar(correo: string, contrasena: string): Usuario | null {
    const cuenta = this.cuentas.find(
      (registro) =>
        registro.usuario.correo === correo.trim().toLowerCase() &&
        registro.contrasena === contrasena,
    );

    return cuenta ? { ...cuenta.usuario } : null;
  }

  registrar(nombre: string, correo: string, contrasena: string): Usuario | null {
    const correoNormalizado = correo.trim().toLowerCase();
    if (
      nombre.trim().length < 2 ||
      !this.correoValido(correoNormalizado) ||
      contrasena.length < 6 ||
      this.cuentas.some((registro) => registro.usuario.correo === correoNormalizado)
    ) {
      return null;
    }

    const usuario: Usuario = {
      id: this.siguienteIdUsuario++,
      nombre: nombre.trim(),
      correo: correoNormalizado,
      rol: 'cliente',
    };
    this.cuentas.push({ usuario, contrasena });
    return { ...usuario };
  }

  actualizarPerfil(actor: Usuario, nombre: string, correo: string): Usuario | null {
    if (!this.esRol(actor, 'cliente') || nombre.trim().length < 2) {
      return null;
    }
    const correoNormalizado = correo.trim().toLowerCase();
    const duplicado = this.cuentas.some(
      ({ usuario }) => usuario.id !== actor.id && usuario.correo === correoNormalizado,
    );
    if (duplicado || !this.correoValido(correoNormalizado)) {
      return null;
    }

    const cuenta = this.cuentas.find(({ usuario }) => usuario.id === actor.id);
    if (!cuenta) {
      return null;
    }
    cuenta.usuario = { ...cuenta.usuario, nombre: nombre.trim(), correo: correoNormalizado };
    if (this._usuarioActual()?.id === actor.id) {
      this.establecerUsuario(cuenta.usuario);
    }
    return { ...cuenta.usuario };
  }

  vehiculosDe(usuario: Usuario): Vehiculo[] {
    return this._vehiculos().filter((vehiculo) => vehiculo.usuarioId === usuario.id);
  }

  guardarVehiculo(
    actor: Usuario,
    vehiculo: Omit<Vehiculo, 'id' | 'usuarioId'>,
    id?: number,
  ): boolean {
    if (
      !this.esRol(actor, 'cliente') ||
      !vehiculo.modelo.trim() ||
      !vehiculo.color.trim() ||
      !vehiculo.placas.trim()
    ) {
      return false;
    }
    const propios = this.vehiculosDe(actor);
    if (id !== undefined && !propios.some((actual) => actual.id === id)) {
      return false;
    }
    const actualizado: Vehiculo = {
      ...vehiculo,
      id: id ?? this.siguienteIdVehiculo++,
      usuarioId: actor.id,
    };
    this._vehiculos.update((vehiculos) =>
      id === undefined
        ? [...vehiculos, actualizado]
        : vehiculos.map((actual) => (actual.id === id ? actualizado : actual)),
    );
    return true;
  }

  eliminarVehiculo(actor: Usuario, id: number): boolean {
    if (!this.esRol(actor, 'cliente') || !this.vehiculosDe(actor).some((vehiculo) => vehiculo.id === id)) {
      return false;
    }
    this._vehiculos.update((vehiculos) =>
      vehiculos.filter((vehiculo) => vehiculo.id !== id),
    );
    return true;
  }

  crearEmpleado(actor: Usuario, datos: CredencialesEmpleado): Usuario | null {
    if (
      !this.esRol(actor, 'admin') ||
      datos.nombre.trim().length < 2 ||
      !this.correoValido(datos.correo.trim()) ||
      datos.contrasena.length < 6
    ) {
      return null;
    }
    const correoNormalizado = datos.correo.trim().toLowerCase();
    if (this.cuentas.some((cuenta) => cuenta.usuario.correo === correoNormalizado)) {
      return null;
    }
    const usuario: Usuario = {
      id: this.siguienteIdUsuario++,
      nombre: datos.nombre.trim(),
      correo: correoNormalizado,
      rol: 'empleado',
    };
    this.cuentas.push({ usuario, contrasena: datos.contrasena });
    return { ...usuario };
  }

  empleados(actor: Usuario): Usuario[] {
    if (!this.esRol(actor, 'admin')) {
      return [];
    }
    return this.cuentas
      .filter(({ usuario }) => usuario.rol === 'empleado')
      .map(({ usuario }) => ({ ...usuario }));
  }

  esRol(actor: Usuario, rol: Usuario['rol']): boolean {
    return this.cuentas.some(
      ({ usuario }) =>
        usuario.id === actor.id &&
        usuario.correo === actor.correo.toLowerCase() &&
        usuario.rol === rol,
    );
  }

  private correoValido(correo: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim());
  }
}
