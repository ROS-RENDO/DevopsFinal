import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import helmet from 'helmet';
import apiRoutes from './routes/index.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Trust proxy if you are behind Nginx
app.set('trust proxy', 1);

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Adjust based on your frontend URL
    credentials: true, // Required for httpOnly cookies
  })
);
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api', apiRoutes);

// Basic health check route
app.get('/', (req, res) => {
  res.json({ status: 'success', message: 'API is running' });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ status: 'error', message: 'Something went wrong!' });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
