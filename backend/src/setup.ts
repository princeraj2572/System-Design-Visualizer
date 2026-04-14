/**
 * Backend Setup Script
 */

import { runMigrations } from '@/migrations';
import pool from '@/config/database';
import logger from '@/utils/logger';

async function setup(): Promise<void> {
  try {
    logger.info('Starting backend setup...');

    // Test database connection
    logger.info('Testing database connection...');
    const result = await pool.query('SELECT NOW()');
    logger.info('Database connection successful');

    // Run migrations
    await runMigrations();

    logger.info('Backend setup completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Setup failed:', error);
    process.exit(1);
  }
}

setup();
