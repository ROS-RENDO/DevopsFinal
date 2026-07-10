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
      secure: true,
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
export const enableMfa = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }

    await prisma.user.update({
      where: { id: userId },
      data: { mfaEnabled: true },
    });

    logSecurityEvent('auth.mfa_enabled', { userId, ip: req.ip });
    res.json({ status: 'success', message: 'MFA has been enabled for your account' });
  } catch (error) {
    logSecurityEvent('auth.mfa_enable_error', { error: error instanceof Error ? error.message : 'unknown' }, 'error');
    res.status(500).json({ status: 'error', message: 'Unable to enable MFA' });
  }
};

export const disableMfa = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }

    await prisma.user.update({
      where: { id: userId },
      data: { mfaEnabled: false, mfaCode: null, mfaExpiresAt: null },
    });

    logSecurityEvent('auth.mfa_disabled', { userId, ip: req.ip });
    res.json({ status: 'success', message: 'MFA has been disabled for your account' });
  } catch (error) {
    logSecurityEvent('auth.mfa_disable_error', { error: error instanceof Error ? error.message : 'unknown' }, 'error');
    res.status(500).json({ status: 'error', message: 'Unable to disable MFA' });
  }
};

export const getMfaStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { mfaEnabled: true, email: true },
    });

    if (!user) {
      res.status(404).json({ status: 'error', message: 'User not found' });
      return;
    }

    res.json({ status: 'success', data: { mfaEnabled: user.mfaEnabled, email: user.email } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Unable to get MFA status' });
  }
};
