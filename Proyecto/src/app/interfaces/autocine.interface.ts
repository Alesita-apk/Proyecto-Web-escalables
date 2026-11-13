export type RolUsuario = 'cliente' | 'empleado' | 'admin';
export type EstadoReserva = 'confirmada' | 'acceso-validado';

export interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  rol: RolUsuario;
}

export interface Pelicula {
  id: number;
  titulo: string;
  sinopsis: string;
  genero: string;
  duracion: string;
  clasificacion: string;
  imagen: string;
}

export interface Funcion {
  id: number;
  peliculaId: number;
  fecha: string;
  horario: string;
}

export interface Cajon {
  id: string;
  tipoVehiculo: string;
}

export interface Alimento {
  id: number;
  nombre: string;
  descripcion: string;
  categoria: string;
  precio: number;
  existencias: number;
}

export interface Vehiculo {
  id: number;
  usuarioId: number;
  modelo: string;
  color: string;
  placas: string;
}

export interface AlimentoReservado {
  alimentoId: number;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  entregado: boolean;
}

export interface Reserva {
  id: number;
  codigo: string;
  usuarioId: number;
  correo: string;
  pelicula: string;
  peliculaId: number;
  funcionId: number;
  fecha: string;
  horario: string;
  cajones: string[];
  alimentos: AlimentoReservado[];
  total: number;
  estado: EstadoReserva;
}

export interface FechaFuncion {
  valor: string;
  etiqueta: string;
}
