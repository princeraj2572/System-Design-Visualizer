/**
 * Setup Database and Migrations for Development
 * Supports both PostgreSQL and SQLite
 */

const fs = require('fs');
const path = require('path');

// Check if we should use SQLite
const useSQLite = process.argv.includes('--sqlite');

if (useSQLite) {
  setupSQLite();
} else {
  setupPostgres();
}

async function setupPostgres() {
  const { Pool } = require('pg');
  
  console.log('Setting up PostgreSQL database...\n');
  
  try {
    const pool = new Pool({
      host: 'localhost',
      port: 5432,
      database: 'postgres',
      user: 'postgres',
      password: '',
    });

    const checkResult = await pool.query(
      `SELECT 1 FROM pg_database WHERE datname = 'system_visualizer'`
    );

    if (checkResult.rows.length === 0) {
      await pool.query('CREATE DATABASE system_visualizer');
      console.log('✓ PostgreSQL database created');
    } else {
      console.log('✓ PostgreSQL database already exists');
    }

    await pool.end();
    console.log('\n✓ PostgreSQL setup complete');
  } catch (error) {
    console.error('\n✗ PostgreSQL setup failed:', error.message);
    console.log('\nFalling back to SQLite...');
    setupSQLite();
  }
}

function setupSQLite() {
  const Database = require('better-sqlite3');
  
  console.log('Setting up SQLite database...\n');
  
  try {
    const dbPath = path.join(__dirname, 'system_visualizer.db');
    const db = new Database(dbPath);
    
    // Create tables
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        nodes TEXT DEFAULT '[]',
        edges TEXT DEFAULT '[]',
        version TEXT DEFAULT '1.0.0',
        is_public INTEGER DEFAULT 0,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
      
      CREATE TABLE IF NOT EXISTS project_shares (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        shared_with_user_id TEXT NOT NULL,
        permission TEXT NOT NULL DEFAULT 'view',
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (shared_with_user_id) REFERENCES users(id) ON DELETE CASCADE
      );
      
      CREATE TABLE IF NOT EXISTS audit_logs (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        project_id TEXT,
        action TEXT NOT NULL,
        details TEXT DEFAULT '{}',
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
      );
      
      CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
      CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON projects(updated_at);
      CREATE INDEX IF NOT EXISTS idx_project_shares_project_id ON project_shares(project_id);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
    `);
    
    db.close();
    console.log(`✓ SQLite database created at: ${dbPath}`);
    console.log('\n⚠️  In development mode with SQLite (PostgreSQL unavailable)');
    console.log('❗ For production, use PostgreSQL\n');
  } catch (error) {
    console.error('\n✗ SQLite setup failed:', error.message);
    process.exit(1);
  }
}
