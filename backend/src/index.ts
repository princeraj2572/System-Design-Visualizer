/**
 * Main Application Server
 */

import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import logger from '@/utils/logger';
import { errorHandler } from '@/middleware/errorHandler';
import { runMigrations } from '@/migrations';
import projectRoutes from '@/routes/projectRoutes';
import userRoutes from '@/routes/userRoutes';
import { initializeWebSocket } from '@/realtime/websocket';

dotenv.config();

const app: Express = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API v1 Routes
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/projects', projectRoutes);

// 404 Handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    data: null,
  });
});

// Error Handler (must be last)
app.use(errorHandler);

// Initialize Database
async function initializeDatabase() {
  try {
    logger.info('Initializing database...');
    await runMigrations();
    logger.info('Database initialized successfully');
    return true;
  } catch (error: any) {
    logger.error('Database initialization failed:', error.message);
    logger.warn('Server will start without database');
    logger.warn('Account creation and project features will not work until database is configured');
    return false;
  }
}

// Start Server
const PORT = process.env.PORT || 5000;

// Initialize DB then start server
initializeDatabase().then(() => {
  const server = createServer(app);
  
  // Initialize WebSocket
  const io = initializeWebSocket(server);
  
  server.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`, {
      environment: process.env.NODE_ENV || 'development',
      websocket: 'enabled',
      timestamp: new Date().toISOString(),
    });
  });

  // Graceful Shutdown
  const gracefulShutdown = () => {
    logger.info('Received shutdown signal, closing server gracefully...');
    io.close();
    server.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
  };

  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);
}).catch((error) => {
  logger.error('Failed to start server:', error);
  process.exit(1);
});

export default app;
