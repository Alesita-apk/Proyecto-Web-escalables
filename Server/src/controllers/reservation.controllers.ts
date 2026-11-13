import type { Request, Response } from 'express';
import {
  FoodModel,
  MovieModel,
  ParkingSpaceModel,
  ReservationModel,
  ScreeningModel,
} from '../models/site.model.ts';
import { nextId } from '../utils/ids.ts';

interface ReservationRequest {
  funcionId: number;
  cajones: string[];
  cantidadesAlimentos: Record<string, number>;
}

export const listReservations = async (req: Request, res: Response): Promise<void> => {
  const filter = req.user!.rol === 'admin' ? {} : { usuarioId: req.user!.id };
  res.json(await ReservationModel.find(filter).sort({ id: -1 }).lean());
};

export const occupiedSpaces = async (req: Request, res: Response): Promise<void> => {
  const funcionId = Number(req.params['functionId']);
  const reservations = await ReservationModel.find({ funcionId }).select('cajones').lean();
  res.json({ cajones: reservations.flatMap((reservation) => reservation.cajones) });
};

export const createReservation = async (req: Request, res: Response): Promise<void> => {
  const { funcionId, cajones, cantidadesAlimentos } = req.body as ReservationRequest;
  const funcion = await ScreeningModel.findOne({ id: funcionId }).lean();
  const pelicula = funcion ? await MovieModel.findOne({ id: funcion.peliculaId }).lean() : null;

  if (!funcion || !pelicula) {
    res.status(404).json({ message: 'No se encontró la función.' });
    return;
  }

  const spaces = await ParkingSpaceModel.find({ id: { $in: cajones } }).lean();
  const reservations = await ReservationModel.find({ funcionId }).select('cajones').lean();
  const occupied = reservations.flatMap((reservation) => reservation.cajones);

  if (
    spaces.length !== cajones.length ||
    cajones.some((cajon) => occupied.includes(cajon))
  ) {
    res.status(409).json({ message: 'Uno o más cajones no están disponibles.' });
    return;
  }

  const alimentos = [];
  for (const [id, cantidad] of Object.entries(cantidadesAlimentos)) {
    if (cantidad <= 0) continue;
    const alimento = await FoodModel.findOne({ id: Number(id) }).lean();
    if (!alimento || alimento.existencias < cantidad) {
      res.status(409).json({ message: 'No hay existencias suficientes.' });
      return;
    }
    alimentos.push({
      alimentoId: alimento.id,
      nombre: alimento.nombre,
      cantidad,
      precioUnitario: alimento.precio,
      entregado: false,
    });
  }

  for (const alimento of alimentos) {
    await FoodModel.updateOne(
      { id: alimento.alimentoId },
      { $inc: { existencias: -alimento.cantidad } },
    );
  }

  const id = await nextId('reservation');
  const reserva = await ReservationModel.create({
    id,
    codigo: `ACD-${String(id).padStart(6, '0')}`,
    usuarioId: req.user!.id,
    correo: req.user!.correo,
    pelicula: pelicula.titulo,
    peliculaId: pelicula.id,
    funcionId: funcion.id,
    fecha: funcion.fecha,
    horario: funcion.horario,
    cajones,
    alimentos,
    total:
      cajones.length * 200 +
      alimentos.reduce((total, alimento) => total + alimento.cantidad * alimento.precioUnitario, 0),
    estado: 'confirmada',
  });

  res.status(201).json(reserva);
};

const updateReservation = async (
  req: Request,
  res: Response,
  action: 'access' | 'delivery',
): Promise<void> => {
  const codigo = String(req.params['code']).toUpperCase();
  const reservation = await ReservationModel.findOne({ codigo });
  if (!reservation) {
    res.status(404).json({ message: 'No se encontró la reserva.' });
    return;
  }

  if (action === 'access') {
    reservation.estado = 'acceso-validado';
  } else {
    reservation.alimentos.forEach((alimento) => {
      alimento.entregado = true;
    });
  }

  await reservation.save();
  res.json(reservation);
};

export const validateAccess = (req: Request, res: Response): Promise<void> =>
  updateReservation(req, res, 'access');

export const validateFoodDelivery = (req: Request, res: Response): Promise<void> =>
  updateReservation(req, res, 'delivery');
