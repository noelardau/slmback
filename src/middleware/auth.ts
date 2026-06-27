import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { collectifService } from '../services/collectifService.js';

export type UserRole = 'COLLECTIF' | 'ADMIN';

export interface AuthRequest extends Request {
  userId?: number;
  userRole?: UserRole;
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token manquant' });
  }

  try {
    const isBlacklisted = await collectifService.isTokenBlacklisted(token);
    
    if (isBlacklisted) {
      return res.status(401).json({ error: 'Token révoqué' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret') as { userId: number; role?: UserRole };
    req.userId = decoded.userId;
    req.userRole = decoded.role ?? 'COLLECTIF';
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token invalide' });
  }
};

export const adminMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.userRole !== 'ADMIN') {
    return res.status(403).json({ error: 'Accès réservé à l\'administrateur' });
  }
  next();
};
