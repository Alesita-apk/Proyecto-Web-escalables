export type RolUsuario = 'cliente' | 'empleado' | 'admin';
export type EstadoReserva = 'confirmada' | 'acceso-validado';

export interface AuthenticatedUser {
  id: number;
  nombre: string;
  correo: string;
  rol: RolUsuario;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}
