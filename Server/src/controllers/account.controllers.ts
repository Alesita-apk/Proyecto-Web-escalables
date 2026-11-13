import bcrypt from 'bcryptjs';
import type { Request, Response } from 'express';
import { createToken } from '../middleware/auth.middleware.ts';
import { UserModel, VehicleModel } from '../models/site.model.ts';
import { nextId } from '../utils/ids.ts';

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  const { nombre, correo } = req.body as { nombre: string; correo: string };
  const normalizedEmail = correo.trim().toLowerCase();
  const user = await UserModel.findOneAndUpdate(
    { id: req.user!.id, rol: 'cliente' },
    { nombre: nombre.trim(), correo: normalizedEmail },
    { new: true, runValidators: true },
  );
  if (!user) {
    res.status(404).json({ message: 'No se encontró la cuenta.' });
    return;
  }
  const usuario = { id: user.id, nombre: user.nombre, correo: user.correo, rol: user.rol };
  res.json({ usuario, token: createToken(usuario) });
};

export const listVehicles = async (req: Request, res: Response): Promise<void> => {
  res.json(await VehicleModel.find({ usuarioId: req.user!.id }).sort({ id: 1 }).lean());
};

export const saveVehicle = async (req: Request, res: Response): Promise<void> => {
  const { modelo, color, placas } = req.body as { modelo: string; color: string; placas: string };
  const id = req.params['id'] ? Number(req.params['id']) : undefined;
  const vehicle =
    id !== undefined
      ? await VehicleModel.findOneAndUpdate(
          { id, usuarioId: req.user!.id },
          { modelo: modelo.trim(), color: color.trim(), placas: placas.trim() },
          { new: true, runValidators: true },
        )
      : await VehicleModel.create({
          id: await nextId('vehicle'),
          usuarioId: req.user!.id,
          modelo: modelo.trim(),
          color: color.trim(),
          placas: placas.trim(),
        });
  if (!vehicle) {
    res.status(404).json({ message: 'No se encontró el vehículo.' });
    return;
  }
  res.status(id !== undefined ? 200 : 201).json(vehicle);
};

export const deleteVehicle = async (req: Request, res: Response): Promise<void> => {
  const vehicle = await VehicleModel.findOneAndDelete({
    id: Number(req.params['id']),
    usuarioId: req.user!.id,
  });
  if (!vehicle) {
    res.status(404).json({ message: 'No se encontró el vehículo.' });
    return;
  }
  res.status(204).end();
};

export const listEmployees = async (_req: Request, res: Response): Promise<void> => {
  const employees = await UserModel.find({ rol: 'empleado' }).select('id nombre correo rol').lean();
  res.json(employees);
};

export const createEmployee = async (req: Request, res: Response): Promise<void> => {
  const { nombre, correo, contrasena } = req.body as {
    nombre: string;
    correo: string;
    contrasena: string;
  };
  const normalizedEmail = correo.trim().toLowerCase();
  const employee = await UserModel.create({
    id: await nextId('user'),
    nombre: nombre.trim(),
    correo: normalizedEmail,
    rol: 'empleado',
    contrasenaHash: await bcrypt.hash(contrasena, 12),
  });
  res.status(201).json({
    id: employee.id,
    nombre: employee.nombre,
    correo: employee.correo,
    rol: employee.rol,
  });
};
