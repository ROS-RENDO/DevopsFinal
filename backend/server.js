console.log("Starting server.js...");
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./src/routes/auth.routes');
const roleRoutes = require('./src/routes/role.routes');



const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debug middleware to log incoming requests
app.use((req, res, next) => {
  if (req.path.includes('/api/auth')) {
    console.log(`\n[${req.method}] ${req.path}`);
    console.log('Content-Type Header:', req.headers['content-type']);
    console.log('Parsed Body:', req.body);
  }
  next();
});

// Basic route to check if server is running
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Auth service is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/roles', roleRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
