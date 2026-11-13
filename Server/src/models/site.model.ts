import { model, Schema } from 'mongoose';
import type { EstadoReserva, RolUsuario } from '../types/site.ts';

const userSchema = new Schema(
  {
    id: { type: Number, required: true, unique: true },
    nombre: { type: String, required: true, trim: true },
    correo: { type: String, required: true, unique: true, lowercase: true, trim: true },
    rol: { type: String, enum: ['cliente', 'empleado', 'admin'], required: true },
    contrasenaHash: { type: String, required: true, select: false },
  },
  { timestamps: true },
);

const movieSchema = new Schema({
  id: { type: Number, required: true, unique: true },
  titulo: { type: String, required: true, trim: true },
  sinopsis: { type: String, required: true },
  genero: { type: String, required: true },
  duracion: { type: String, required: true },
  clasificacion: { type: String, required: true },
  imagen: { type: String, required: true },
});

const screeningSchema = new Schema({
  id: { type: Number, required: true, unique: true },
  peliculaId: { type: Number, required: true, index: true },
  fecha: { type: String, required: true },
  horario: { type: String, required: true },
});
screeningSchema.index({ peliculaId: 1, fecha: 1, horario: 1 }, { unique: true });

const foodSchema = new Schema({
  id: { type: Number, required: true, unique: true },
  nombre: { type: String, required: true, trim: true },
  descripcion: { type: String, required: true },
  categoria: { type: String, required: true },
  precio: { type: Number, required: true, min: 0 },
  existencias: { type: Number, required: true, min: 0 },
});

const parkingSpaceSchema = new Schema({
  id: { type: String, required: true, unique: true },
  tipoVehiculo: { type: String, required: true },
});

const vehicleSchema = new Schema({
  id: { type: Number, required: true, unique: true },
  usuarioId: { type: Number, required: true, index: true },
  modelo: { type: String, required: true, trim: true },
  color: { type: String, required: true, trim: true },
  placas: { type: String, required: true, trim: true },
});

const reservedFoodSchema = new Schema(
  {
    alimentoId: { type: Number, required: true },
    nombre: { type: String, required: true },
    cantidad: { type: Number, required: true },
    precioUnitario: { type: Number, required: true },
    entregado: { type: Boolean, required: true, default: false },
  },
  { _id: false },
);

const reservationSchema = new Schema(
  {
    id: { type: Number, required: true, unique: true },
    codigo: { type: String, required: true, unique: true, uppercase: true },
    usuarioId: { type: Number, required: true, index: true },
    correo: { type: String, required: true },
    pelicula: { type: String, required: true },
    peliculaId: { type: Number, required: true },
    funcionId: { type: Number, required: true, index: true },
    fecha: { type: String, required: true },
    horario: { type: String, required: true },
    cajones: { type: [String], required: true },
    alimentos: { type: [reservedFoodSchema], required: true },
    total: { type: Number, required: true },
    estado: { type: String, enum: ['confirmada', 'acceso-validado'], required: true },
  },
  { timestamps: true },
);

const counterSchema = new Schema({
  _id: { type: String, required: true },
  secuencia: { type: Number, required: true, default: 0 },
});

export const UserModel = model('User', userSchema);
export const MovieModel = model('Movie', movieSchema);
export const ScreeningModel = model('Screening', screeningSchema);
export const FoodModel = model('Food', foodSchema);
export const ParkingSpaceModel = model('ParkingSpace', parkingSpaceSchema);
export const VehicleModel = model('Vehicle', vehicleSchema);
export const ReservationModel = model('Reservation', reservationSchema);
export const CounterModel = model('Counter', counterSchema);

export type UserRole = RolUsuario;
export type ReservationState = EstadoReserva;
