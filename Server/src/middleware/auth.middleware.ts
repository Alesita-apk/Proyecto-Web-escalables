import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import type { AuthenticatedUser, RolUsuario } from '../types/site.ts';

const jwtSecret = 'autocine-local-secret';

export const createToken = (user: AuthenticatedUser): string =>
  jwt.sign(user, jwtSecret, { expiresIn: '8h' });

export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  const authorization = req.header('authorization');
  const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : '';
  if (!token) {
    res.status(401).json({ message: 'Se requiere iniciar sesión.' });
    return;
  }
  try {
    req.user = jwt.verify(token, jwtSecret) as AuthenticatedUser;
    next();
  } catch {
    res.status(401).json({ message: 'La sesión no es válida o expiró.' });
  }
};

export const requireRole =
  (...roles: RolUsuario[]) =>
  (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.rol)) {
      res.status(403).json({ message: 'No tienes permiso para realizar esta acción.' });
      return;
    }
    next();
  };
