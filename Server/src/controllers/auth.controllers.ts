import bcrypt from 'bcryptjs';
import type { Request, Response } from 'express';
import { UserModel } from '../models/site.model.ts';
import { createToken } from '../middleware/auth.middleware.ts';
import type { AuthenticatedUser, RolUsuario } from '../types/site.ts';
import { nextId } from '../utils/ids.ts';

const publicUser = (user: {
  id: number;
  nombre: string;
  correo: string;
  rol: RolUsuario;
}): AuthenticatedUser => ({
  id: user.id,
  nombre: user.nombre,
  correo: user.correo,
  rol: user.rol,
});

export const register = async (req: Request, res: Response): Promise<void> => {
  const { nombre, correo, contrasena } = req.body as {
    nombre: string;
    correo: string;
    contrasena: string;
  };
  const normalizedEmail = correo.trim().toLowerCase();
  const user = await UserModel.create({
    id: await nextId('user'),
    nombre: nombre.trim(),
    correo: normalizedEmail,
    rol: 'cliente',
    contrasenaHash: await bcrypt.hash(contrasena, 12),
  });
  const usuario = publicUser(user);
  res.status(201).json({ usuario, token: createToken(usuario) });
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { correo, contrasena } = req.body as { correo: string; contrasena: string };
  const user = await UserModel.findOne({ correo: correo.trim().toLowerCase() }).select('+contrasenaHash');
  if (!user || !(await bcrypt.compare(contrasena, user.contrasenaHash))) {
    res.status(401).json({ message: 'Correo o contraseña incorrectos.' });
    return;
  }
  const usuario = publicUser(user);
  res.json({ usuario, token: createToken(usuario) });
};

export const currentUser = (req: Request, res: Response): void => {
  res.json({ usuario: req.user });
};
