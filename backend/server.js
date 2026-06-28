console.log("Starting server.js...");
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const path = require('path');

dotenv.config();

const authRoutes = require('./src/routes/auth.routes');
const roleRoutes = require('./src/routes/role.routes');



const app = express();

// Configure EJS View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

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

// Demonstration Route for EJS Output Encoding (XSS Protection)
app.get('/profile', (req, res) => {
  // Simulating user data retrieved from a database that contains a malicious payload
  const userData = {
    username: 'HackerMan',
    bio: '<script>alert("XSS Attack Successful!");</script><img src="x" onerror="alert(\'Image XSS!\')">'
  };
  
  // Render the EJS template and pass the data
  res.render('profile', { user: userData });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
