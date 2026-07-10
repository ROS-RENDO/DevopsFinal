import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logSecurityEvent } from '../utils/logger.js';

interface DecodedToken {
  id: number;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: DecodedToken;
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
      logSecurityEvent('auth.missing_token', { ip: req.ip, path: req.originalUrl }, 'warn');
      res.status(401).json({
        status: 'error',
        message: 'Unauthorized',
      });
      return;
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      logSecurityEvent('auth.missing_secret', { path: req.originalUrl }, 'error');
      res.status(500).json({ status: 'error', message: 'Internal server error' });
      return;
    }

    const decoded = jwt.verify(token, secret) as DecodedToken;

    req.user = decoded;
    next();
  } catch (error) {
    logSecurityEvent('auth.invalid_token', { ip: req.ip, path: req.originalUrl, error: error instanceof Error ? error.message : 'unknown' }, 'warn');
    res.status(401).json({
      status: 'error',
      message: 'Unauthorized',
    });
  }
};

export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      logSecurityEvent('auth.unauthorized_no_user', { ip: req.ip, path: req.originalUrl }, 'warn');
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      logSecurityEvent('auth.forbidden', {
        ip: req.ip,
        userId: req.user.id,
        role: req.user.role,
        path: req.originalUrl,
        allowedRoles,
      }, 'warn');
      res.status(403).json({
        status: 'error',
        message: 'Forbidden',
      });
      return;
    }
    next();
  };
};
