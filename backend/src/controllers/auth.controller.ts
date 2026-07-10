import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../utils/db.js';

const ALLOWED_ROLES = ['customer', 'worker', 'admin'] as const;

const normalizeRole = (role?: string): string => {
  const normalizedRole = (role || 'customer').toLowerCase();
  return ALLOWED_ROLES.includes(normalizedRole as (typeof ALLOWED_ROLES)[number])
    ? normalizedRole
    : 'customer';
};

const generateToken = (user: { id: number; email: string; role: string }) => {
  const secret = process.env.JWT_SECRET || 'your_super_secret_jwt_key_here';
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, secret, {
    expiresIn: '15m',
  });
};

const generateRefreshToken = (user: { id: number; email: string; role: string }) => {
  const secret = process.env.JWT_REFRESH_SECRET || 'your_super_secret_refresh_key_here';
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, secret, {
    expiresIn: '7d',
  });
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, role } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ status: 'error', message: 'User already exists with this email' });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const normalizedRole = normalizeRole(role);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: normalizedRole,
      },
    });

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: { id: newUser.id, email: newUser.email, role: newUser.role },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ status: 'error', message: 'Invalid credentials' });
      return;
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ status: 'error', message: 'Invalid credentials' });
      return;
    }

    const normalizedRole = normalizeRole(user.role);

    if (normalizedRole !== user.role) {
      await prisma.user.update({
        where: { id: user.id },
        data: { role: normalizedRole },
      });
    }

    // Generate JWTs
    const token = generateToken({ ...user, role: normalizedRole });
    const refreshToken = generateRefreshToken({ ...user, role: normalizedRole });

    // Save refresh token in DB
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    // Set HttpOnly cookie for refresh token
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      status: 'success',
      message: 'Logged in successfully',
      token,
      data: { id: user.id, email: user.email, role: normalizedRole },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    // If we have a user in req (from auth middleware), remove their token in DB
    if (req.user?.id) {
      await prisma.user.update({
        where: { id: req.user.id },
        data: { refreshToken: null },
      });
    }
  } catch (error) {
    console.error('Logout error updating DB:', error);
  }

  // Clear cookie
  res.cookie('refreshToken', '', {
    httpOnly: true,
    expires: new Date(0),
  });

  res.json({ status: 'success', message: 'Logged out successfully' });
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      res.status(401).json({ status: 'error', message: 'Unauthorized - No refresh token provided' });
      return;
    }

    const secret = process.env.JWT_REFRESH_SECRET || 'your_super_secret_refresh_key_here';
    const decoded = jwt.verify(token, secret) as { id: number; email: string; role: string };

    // Find user and check if token matches the DB
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user || user.refreshToken !== token) {
      res.status(403).json({ status: 'error', message: 'Forbidden - Invalid refresh token' });
      return;
    }

    // Generate new Access Token
    const newToken = generateToken(user);

    res.json({
      status: 'success',
      token: newToken,
    });
  } catch (error) {
    res.status(403).json({ status: 'error', message: 'Forbidden - Invalid or expired refresh token' });
  }
};
