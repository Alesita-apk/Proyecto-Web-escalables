import type { Request, Response } from 'express';
import {
  FoodModel,
  MovieModel,
  ParkingSpaceModel,
  ReservationModel,
  ScreeningModel,
} from '../models/site.model.ts';
import { nextId } from '../utils/ids.ts';

const numericId = (req: Request): number => Number(req.params['id']);

export const getSiteData = async (_req: Request, res: Response): Promise<void> => {
  const [peliculas, funciones, cajones, alimentos] = await Promise.all([
    MovieModel.find().sort({ id: 1 }).lean(),
    ScreeningModel.find().sort({ id: 1 }).lean(),
    ParkingSpaceModel.find().sort({ id: 1 }).lean(),
    FoodModel.find().sort({ id: 1 }).lean(),
  ]);
  res.json({ peliculas, funciones, cajones, alimentos, precioPorCajon: 200 });
};

export const createMovie = async (req: Request, res: Response): Promise<void> => {
  const movie = await MovieModel.create({ ...req.body, id: await nextId('movie') });
  res.status(201).json(movie);
};

export const updateMovie = async (req: Request, res: Response): Promise<void> => {
  const { titulo, sinopsis, genero, duracion, clasificacion, imagen } = req.body as Record<
    string,
    unknown
  >;
  const movie = await MovieModel.findOneAndUpdate(
    { id: numericId(req) },
    { titulo, sinopsis, genero, duracion, clasificacion, imagen },
    { new: true },
  );
  if (!movie) {
    res.status(404).json({ message: 'No se encontró la película.' });
    return;
  }
  res.json(movie);
};

export const deleteMovie = async (req: Request, res: Response): Promise<void> => {
  const id = numericId(req);
  if (await ScreeningModel.exists({ peliculaId: id })) {
    res.status(409).json({ message: 'No se puede eliminar: hay funciones que dependen de esta película.' });
    return;
  }
  const movie = await MovieModel.findOneAndDelete({ id });
  if (!movie) {
    res.status(404).json({ message: 'No se encontró la película.' });
    return;
  }
  res.status(204).end();
};

export const createScreening = async (req: Request, res: Response): Promise<void> => {
  const screening = await ScreeningModel.create({
    ...req.body,
    id: await nextId('screening'),
  });
  res.status(201).json(screening);
};

export const updateScreening = async (req: Request, res: Response): Promise<void> => {
  const id = numericId(req);
  if (await ReservationModel.exists({ funcionId: id })) {
    res.status(409).json({ message: 'No se puede modificar: la función tiene reservas.' });
    return;
  }
  const { peliculaId, fecha, horario } = req.body as Record<string, unknown>;
  const screening = await ScreeningModel.findOneAndUpdate(
    { id },
    { peliculaId, fecha, horario },
    { new: true },
  );
  if (!screening) {
    res.status(404).json({ message: 'No se encontró la función.' });
    return;
  }
  res.json(screening);
};

export const deleteScreening = async (req: Request, res: Response): Promise<void> => {
  const id = numericId(req);
  if (await ReservationModel.exists({ funcionId: id })) {
    res.status(409).json({ message: 'No se puede eliminar: la función tiene reservas.' });
    return;
  }
  const screening = await ScreeningModel.findOneAndDelete({ id });
  if (!screening) {
    res.status(404).json({ message: 'No se encontró la función.' });
    return;
  }
  res.status(204).end();
};

export const createFood = async (req: Request, res: Response): Promise<void> => {
  const food = await FoodModel.create({ ...req.body, id: await nextId('food') });
  res.status(201).json(food);
};

export const updateFood = async (req: Request, res: Response): Promise<void> => {
  const { nombre, descripcion, categoria, precio, existencias } = req.body as Record<
    string,
    unknown
  >;
  const food = await FoodModel.findOneAndUpdate(
    { id: numericId(req) },
    { nombre, descripcion, categoria, precio, existencias },
    { new: true },
  );
  if (!food) {
    res.status(404).json({ message: 'No se encontró el producto.' });
    return;
  }
  res.json(food);
};

export const deleteFood = async (req: Request, res: Response): Promise<void> => {
  const food = await FoodModel.findOneAndDelete({ id: numericId(req) });
  if (!food) {
    res.status(404).json({ message: 'No se encontró el producto.' });
    return;
  }
  res.status(204).end();
};

export const updateParkingSpace = async (req: Request, res: Response): Promise<void> => {
  const { tipoVehiculo } = req.body as { tipoVehiculo: string };
  const space = await ParkingSpaceModel.findOneAndUpdate(
    { id: req.params['id'] },
    { tipoVehiculo },
    { new: true },
  );
  if (!space) {
    res.status(404).json({ message: 'No se encontró el cajón.' });
    return;
  }
  res.json(space);
};
