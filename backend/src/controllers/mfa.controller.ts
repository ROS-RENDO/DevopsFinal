import { Request, Response } from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import prisma from '../utils/db.js';
import { encryptText } from '../utils/crypto.js';
import { logSecurityEvent } from '../utils/logger.js';
import { sendMfaEmail } from '../utils/smtp/index.js';

const MFA_CODE_LENGTH = 6;
const MFA_EXPIRATION_MINUTES = 10;

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
  return crypto.randomInt(0, 10 ** MFA_CODE_LENGTH).toString().padStart(MFA_CODE_LENGTH, '0');
};

export const requestMfaCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      logSecurityEvent('auth.mfa_request_user_not_found', { email, ip: req.ip }, 'warn');
      res.status(404).json({ status: 'error', message: 'User not found' });
      return;
    }

    if (!user.mfaEnabled) {
      res.status(400).json({ status: 'error', message: 'MFA is not enabled for this account' });
      return;
    }

    const code = generateMfaCode();
    const expiresAt = new Date(Date.now() + MFA_EXPIRATION_MINUTES * 60_000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        mfaCode: code,
        mfaExpiresAt: expiresAt,
      },
    });

    await sendMfaEmail(email, code);

    logSecurityEvent('auth.mfa_code_sent', { userId: user.id, email, ip: req.ip });

    res.json({ status: 'success', message: 'MFA code sent' });
  } catch (error) {
    logSecurityEvent('auth.mfa_request_error', { error: error instanceof Error ? error.message : 'unknown', ip: req.ip }, 'error');
    res.status(500).json({ status: 'error', message: 'Unable to send MFA code' });
  }
};

export const verifyMfaCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, code } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.mfaCode || !user.mfaExpiresAt) {
      logSecurityEvent('auth.mfa_verify_invalid', { email, ip: req.ip }, 'warn');
      res.status(400).json({ status: 'error', message: 'Invalid or expired MFA code' });
      return;
    }

    if (user.mfaExpiresAt < new Date()) {
      await prisma.user.update({ where: { id: user.id }, data: { mfaCode: null, mfaExpiresAt: null } });
      logSecurityEvent('auth.mfa_verify_expired', { userId: user.id, email, ip: req.ip }, 'warn');
      res.status(400).json({ status: 'error', message: 'Invalid or expired MFA code' });
      return;
    }

    if (user.mfaCode !== code) {
      logSecurityEvent('auth.mfa_verify_wrong_code', { userId: user.id, email, ip: req.ip }, 'warn');
      res.status(400).json({ status: 'error', message: 'Invalid or expired MFA code' });
      return;
    }

    const token = generateToken({ id: user.id, email: user.email, role: user.role });
    const refreshToken = generateRefreshToken({ id: user.id, email: user.email, role: user.role });
    const encryptedRefreshToken = encryptText(refreshToken);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        mfaCode: null,
        mfaExpiresAt: null,
        refreshToken: encryptedRefreshToken,
      },
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    logSecurityEvent('auth.mfa_verify_success', { userId: user.id, email, ip: req.ip });

    res.json({
      status: 'success',
      message: 'MFA verified',
      token,
      data: { id: user.id, email: user.email, role: user.role },
    });
  } catch (error) {
    logSecurityEvent('auth.mfa_verify_error', { error: error instanceof Error ? error.message : 'unknown', ip: req.ip }, 'error');
    res.status(500).json({ status: 'error', message: 'Unable to verify MFA code' });
  }
};
