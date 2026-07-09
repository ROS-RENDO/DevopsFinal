import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

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
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
      res.status(401).json({
        status: 'error',
        message: 'Unauthorized - No token provided',
      });
      return;
    }

    const secret = process.env.JWT_SECRET || 'your_super_secret_jwt_key_here';
    const decoded = jwt.verify(token, secret) as DecodedToken;

    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      status: 'error',
      message: 'Unauthorized - Invalid token',
    });
    return;
  }
};
