import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import prisma from '../utils/db.js';
import { encryptText, decryptText } from '../utils/crypto.js';
import { sendMfaEmail } from '../utils/smtp/index.js';
import { logSecurityEvent } from '../utils/logger.js';

const ALLOWED_ROLES = ['customer', 'worker', 'admin'] as const;

const normalizeRole = (role?: string): string => {
  const normalizedRole = (role || 'customer').toLowerCase();
  return ALLOWED_ROLES.includes(normalizedRole as (typeof ALLOWED_ROLES)[number])
    ? normalizedRole
    : 'customer';
};

const ensureSecret = (name: string): string => {
  const secret = process.env[name];
  if (!secret) {
    throw new Error(`Missing environment variable ${name}`);
  }
  return secret;
};

const generateToken = (user: { id: number; email: string; role: string }) => {
  const secret = ensureSecret('JWT_SECRET');
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, secret, {
    expiresIn: '15m',
  });
};

const generateRefreshToken = (user: { id: number; email: string; role: string }) => {
  const secret = ensureSecret('JWT_REFRESH_SECRET');
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, secret, {
    expiresIn: '7d',
  });
};

const generateMfaCode = (): string => {
  return crypto.randomInt(0, 10 ** 6).toString().padStart(6, '0');
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, role } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      logSecurityEvent('auth.register_conflict', { email }, 'warn');
      res.status(400).json({ status: 'error', message: 'User already exists with this email' });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
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

    logSecurityEvent('auth.register_success', { userId: newUser.id, email: newUser.email, role: newUser.role });

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: { id: newUser.id, email: newUser.email, role: newUser.role },
    });
  } catch (error) {
    logSecurityEvent('auth.register_error', { error: error instanceof Error ? error.message : 'unknown' }, 'error');
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      logSecurityEvent('auth.login_failed', { email, reason: 'user_not_found', ip: req.ip }, 'warn');
      res.status(401).json({ status: 'error', message: 'Invalid credentials' });
      return;
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logSecurityEvent('auth.login_failed', { email, reason: 'invalid_password', ip: req.ip }, 'warn');
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

    if (user.mfaEnabled) {
      const code = generateMfaCode();
      const expiresAt = new Date(Date.now() + 10 * 60_000);

      await prisma.user.update({
        where: { id: user.id },
        data: {
          mfaCode: code,
          mfaExpiresAt: expiresAt,
        },
      });

      await sendMfaEmail(user.email, code);
      logSecurityEvent('auth.mfa_sent_on_login', { userId: user.id, email: user.email, ip: req.ip });

      res.json({
        status: 'success',
        requiresMfa: true,
        message: 'MFA code sent to your email',
        email: user.email,
      });
      return;
    }

    // Generate JWTs
    const token = generateToken({ id: user.id, email: user.email, role: normalizedRole });
    const refreshToken = generateRefreshToken({ id: user.id, email: user.email, role: normalizedRole });

    const encryptedRefreshToken = encryptText(refreshToken);

    // Save refresh token in DB
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: encryptedRefreshToken },
    });

    // Set HttpOnly cookie for refresh token
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    logSecurityEvent('auth.login_success', { userId: user.id, email: user.email, role: normalizedRole, ip: req.ip });

    res.json({
      status: 'success',
      message: 'Logged in successfully',
      token,
      data: { id: user.id, email: user.email, role: normalizedRole },
    });
  } catch (error) {
    logSecurityEvent('auth.login_error', { error: error instanceof Error ? error.message : 'unknown' }, 'error');
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
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: new Date(0),
  });

  logSecurityEvent('auth.logout', { userId: req.user?.id, ip: req.ip });

  res.json({ status: 'success', message: 'Logged out successfully' });
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      res.status(401).json({ status: 'error', message: 'Unauthorized - No refresh token provided' });
      return;
    }

    const secret = ensureSecret('JWT_REFRESH_SECRET');
    const decoded = jwt.verify(token, secret) as { id: number; email: string; role: string };

    // Find user and check if token matches the DB
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user || !user.refreshToken) {
      logSecurityEvent('auth.refresh_rejected', { userId: decoded.id, ip: req.ip }, 'warn');
      res.status(403).json({ status: 'error', message: 'Forbidden' });
      return;
    }

    const storedToken = decryptText(user.refreshToken);
    if (storedToken !== token) {
      logSecurityEvent('auth.refresh_rejected', { userId: decoded.id, ip: req.ip }, 'warn');
      res.status(403).json({ status: 'error', message: 'Forbidden' });
      return;
    }

    // Generate new Access Token
    const newToken = generateToken(user);

    res.json({
      status: 'success',
      token: newToken,
    });
  } catch (error) {
    logSecurityEvent('auth.refresh_error', { error: error instanceof Error ? error.message : 'unknown', ip: req.ip }, 'warn');
    res.status(403).json({ status: 'error', message: 'Forbidden' });
  }
};
