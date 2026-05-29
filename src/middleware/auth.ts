import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { collectifService } from '../services/collectifService.js';

export interface AuthRequest extends Request {
  userId?: number;
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

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret') as { userId: number };
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token invalide' });
  }
};
