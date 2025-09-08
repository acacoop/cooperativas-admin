import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWTPayload, UserRole } from '../types';

export interface AuthRequest extends Request {
  user?: JWTPayload;
}

export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Token requerido' });
    return;
  }

  jwt.verify(
    token,
    process.env.JWT_SECRET || 'secret_key',
    (err: any, decoded: any) => {
      if (err) {
        res.status(403).json({ error: 'Token inválido' });
        return;
      }
      req.user = decoded as JWTPayload;
      next();
    }
  );
};

export const checkRole = (roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'No autenticado' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: 'No autorizado' });
      return;
    }

    next();
  };
};
