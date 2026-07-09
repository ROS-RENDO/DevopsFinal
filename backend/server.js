const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const https = require('https');
const fs = require('fs');
const path = require('path');
const logger = require('./src/utils/logger');
const { errorHandler } = require('./src/middleware/error.middleware');

dotenv.config();

const authRoutes = require('./src/routes/auth.routes');
const roleRoutes = require('./src/routes/role.routes');
const bookingRoutes = require('./src/routes/booking.routes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Debug middleware to log incoming requests securely
app.use((req, res, next) => {
  if (req.path.includes('/api/auth')) {
    logger.info(`Incoming Request: [${req.method}] ${req.path}`);
  }
  next();
});

// Basic route to check if server is running
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Auth service is running securely' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/bookings', bookingRoutes);

// Global Error Handler Middleware
app.use(errorHandler);

// EJS Configuration for XSS Defense (Track A)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Test route to prove EJS auto-escaping
app.get('/test-xss', (req, res) => {
  const untrustedInput = req.query.name || "<script>alert('xss')</script>Hacker";
  res.render('test', { name: untrustedInput });
});

const PORT = process.env.PORT || 5000;

// Reverting to HTTP for the Node app because the Nginx Reverse Proxy handles the TLS/HTTPS
const server = app.listen(PORT, () => {
  logger.info(`Server running on http://localhost:${PORT} (TLS handled by Nginx)`);
});

module.exports = server;
