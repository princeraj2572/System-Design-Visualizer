/**
 * Database Migrations
 */

import pool from '@/config/database';
import logger from '@/utils/logger';

const migrations = [
  // Users table
  {
    name: 'create_users_table',
    up: `
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        username VARCHAR(30) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
      
      CREATE INDEX idx_users_email ON users(email);
      CREATE INDEX idx_users_username ON users(username);
    `,
  },

  // Projects table
  {
    name: 'create_projects_table',
    up: `
      CREATE TABLE IF NOT EXISTS projects (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(200) NOT NULL,
        description TEXT,
        nodes JSONB DEFAULT '[]'::jsonb,
        edges JSONB DEFAULT '[]'::jsonb,
        version VARCHAR(20) DEFAULT '1.0.0',
        is_public BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
      
      CREATE INDEX idx_projects_user_id ON projects(user_id);
      CREATE INDEX idx_projects_updated_at ON projects(updated_at);
      CREATE INDEX idx_projects_is_public ON projects(is_public);
    `,
  },

  // Project shares table
  {
    name: 'create_project_shares_table',
    up: `
      CREATE TABLE IF NOT EXISTS project_shares (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        shared_with_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        permission VARCHAR(20) NOT NULL DEFAULT 'view',
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
      
      CREATE INDEX idx_project_shares_project_id ON project_shares(project_id);
      CREATE INDEX idx_project_shares_shared_with_user_id ON project_shares(shared_with_user_id);
    `,
  },

  // Audit logs table
  {
    name: 'create_audit_logs_table',
    up: `
      CREATE TABLE IF NOT EXISTS audit_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
        action VARCHAR(50) NOT NULL,
        details JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
      
      CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
      CREATE INDEX idx_audit_logs_project_id ON audit_logs(project_id);
      CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
    `,
  },
];

export async function runMigrations(): Promise<void> {
  logger.info('Starting database migrations...');

  try {
    for (const migration of migrations) {
      try {
        await pool.query(migration.up);
        logger.info(`Migration completed: ${migration.name}`);
      } catch (error: any) {
        if (error.code === '42P07') {
          // Table already exists
          logger.info(`Migration skipped (already exists): ${migration.name}`);
        } else {
          throw error;
        }
      }
    }

    logger.info('All migrations completed successfully');
  } catch (error) {
    logger.error('Migration failed:', error);
    throw error;
  }
}
