console.log("Loading auth.controller.js...");
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');
const logger = require('../utils/logger');
const { sendMfaEmail } = require('../utils/mailer');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_jwt_key_prototype';

const generateSixDigitCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendVerificationEmail = async (user) => {
  const code = generateSixDigitCode();
  const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await prisma.user.update({
    where: { id: user.id },
    data: { 
      mfaCode: code,
      mfaCodeExpires: expires
    }
  });

  await sendMfaEmail(user.email, code);
  
  // Return a temporary token for the frontend to use in validation
  return jwt.sign(
    { id: user.id, email: user.email, mfaPending: true },
    JWT_SECRET,
    { expiresIn: '15m' }
  );
};

const register = async (req, res) => {
  try {
    const { email, password, name, role } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required. Ensure your request has a JSON body.' });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role || 'customer',
        mfaEnabled: true // Force MFA on for everyone now
      }
    });

    const tempToken = await sendVerificationEmail(user);

    res.status(201).json({ 
      message: 'Registration successful, verification code sent to email', 
      requiresMfa: true,
      tempToken,
      email: user.email
    });
  } catch (error) {
    logger.error('Registration error', { error: error.message, email: req.body?.email });
    res.status(500).json({ error: 'Server error during registration' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      logger.warn('Login Failure: Invalid credentials', { email, ip: req.ip });
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logger.warn('Login Failure: Invalid credentials', { email, ip: req.ip });
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Force MFA for all logins
    const tempToken = await sendVerificationEmail(user);

    return res.status(200).json({
      message: 'MFA required. Check your email.',
      requiresMfa: true,
      tempToken,
      email: user.email
    });
  } catch (error) {
    logger.error('Login error', { error: error.message, email: req.body?.email });
    res.status(500).json({ error: 'Server error during login' });
  }
};

const logout = async (req, res) => {
  // Clear the cookie for secure session termination
  res.clearCookie('token');
  res.status(200).json({ message: 'Logged out successfully' });
};

const me = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, email: true, name: true, role: true, createdAt: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error while fetching user profile' });
  }
};

// Manually request a new MFA code
const generateMfa = async (req, res) => {
  try {
    const { tempToken } = req.body;
    if (!tempToken) return res.status(400).json({ error: 'Missing temp token' });

    const decoded = jwt.verify(tempToken, JWT_SECRET);
    if (!decoded.mfaPending) return res.status(400).json({ error: 'Invalid token type' });

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const newTempToken = await sendVerificationEmail(user);

    res.status(200).json({ message: 'Code resent to email', tempToken: newTempToken });
  } catch (error) {
    logger.error('Resend MFA error', { error: error.message });
    res.status(500).json({ error: 'Failed to resend MFA code' });
  }
};

const validateMfa = async (req, res) => {
  try {
    const { tempToken, token } = req.body; // 'token' is the 6-digit code from the user
    if (!tempToken || !token) return res.status(400).json({ error: 'Missing token or code' });
    
    // Decode temp token
    const decoded = jwt.verify(tempToken, JWT_SECRET);
    if (!decoded.mfaPending) return res.status(400).json({ error: 'Invalid token type' });

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) return res.status(400).json({ error: 'User not found' });

    // Validate the code
    if (user.mfaCode !== token) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }

    if (new Date() > new Date(user.mfaCodeExpires)) {
      return res.status(400).json({ error: 'Verification code expired' });
    }

    // Code is valid! Clear it from the DB.
    await prisma.user.update({
      where: { id: user.id },
      data: { mfaCode: null, mfaCodeExpires: null, mfaEnabled: true }
    });

    // Generate real JWT
    const finalToken = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.cookie('token', finalToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000
    });

    logger.info('MFA Login/Register Success', { userId: user.id, role: user.role, ip: req.ip });

    res.status(200).json({
      message: 'Authentication successful',
      token: finalToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    logger.error('MFA Validate error', { error: error.message });
    res.status(401).json({ error: 'MFA validation failed or session expired' });
  }
};

module.exports = {
  register,
  login,
  logout,
  me,
  generateMfa, // used to resend code
  validateMfa
};
