/**
 * Database Creation Script
 * Creates the database and runs migrations
 */

const { Pool } = require('pg');

async function tryConnect(config) {
  try {
    const pool = new Pool(config);
    const result = await pool.query('SELECT NOW()');
    await pool.end();
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function createDatabase() {
  const strategies = [
    { name: 'Empty password', config: { host: 'localhost', port: 5432, database: 'postgres', user: 'postgres', password: '' } },
    { name: 'No password', config: { host: 'localhost', port: 5432, database: 'postgres', user: 'postgres' } },
  ];

  console.log('Attempting to connect to PostgreSQL...\n');

  let adminPool = null;
  let selectedConfig = null;

  for (const strategy of strategies) {
    console.log(`Trying: ${strategy.name}...`);
    const result = await tryConnect(strategy.config);
    if (result.success) {
      console.log(`✓ Connected using: ${strategy.name}\n`);
      adminPool = new Pool(strategy.config);
      selectedConfig = strategy.config;
      break;
    } else {
      console.log(`✗ Failed: ${result.error}\n`);
    }
  }

  if (!adminPool) {
    console.error('✗ Could not connect to PostgreSQL');
    process.exit(1);
  }

  try {
    console.log('Checking if database exists...');
    const checkResult = await adminPool.query(
      `SELECT 1 FROM pg_database WHERE datname = 'system_visualizer'`
    );

    if (checkResult.rows.length > 0) {
      console.log('✓ Database already exists');
    } else {
      console.log('Creating database system_visualizer...');
      await adminPool.query('CREATE DATABASE system_visualizer');
      console.log('✓ Database created successfully');
    }

    await adminPool.end();
    console.log('\n✓ Setup complete');
    process.exit(0);
  } catch (error) {
    console.error('\n✗ Error:', error.message);
    process.exit(1);
  }
}

createDatabase();
