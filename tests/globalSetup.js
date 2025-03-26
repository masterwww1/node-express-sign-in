const path = require('path');
const { Client } = require('pg');
const knex = require('knex');
const knexfile = require('../src/db/knexfile');

const testConfig = knexfile.test;
const TEST_DB_NAME = testConfig.connection.database;

let masterClient = null;
let knexInstance = null;

async function isMasterConnected() {
  try {
    if (!masterClient) return false;
    await masterClient.query('SELECT 1');
    
    return true;
  } catch (error) {
    return false;
  }
}

async function setupTestDatabase() {
  try {
    console.log('🚀 Setting up test database...');

    // Check if master client exists and is connected
    if (!masterClient) {
      masterClient = new Client({
        host: testConfig.connection.host,
        port: testConfig.connection.port,
        user: testConfig.connection.user,
        password: testConfig.connection.password,
        database: 'postgres'
      });

      await masterClient.connect();
    }

    const isConnected = await isMasterConnected();
    if (!isConnected) {
        throw new Error("❌ Database connection failed.");
    }

    // Drop test database if exists
    await masterClient.query(`
      SELECT pg_terminate_backend(pg_stat_activity.pid)
      FROM pg_stat_activity
      WHERE pg_stat_activity.datname = '${TEST_DB_NAME}'
      AND pid <> pg_backend_pid();
    `);
    await masterClient.query(`DROP DATABASE IF EXISTS ${TEST_DB_NAME}`);

    // Create test database
    await masterClient.query(`CREATE DATABASE ${TEST_DB_NAME}`);
    console.log('✅ Test database created');

    // Close master connection
    await masterClient.end();
    masterClient = null;

    // Create or reuse knex instance
    if (!knexInstance) {
      knexInstance = knex({
        ...testConfig,
        connection: {
          ...testConfig.connection,
          database: TEST_DB_NAME
        },
        migrations: {
          directory: './src/db/migrations',
          tableName: 'knex_migrations'
        },
      });
    }

    // Run migrations
    await knexInstance.migrate.latest();
    console.log('✅ Migrations completed');

    return knexInstance;
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    if (masterClient) {
      try {
        await masterClient.end();
        masterClient = null;
      } catch (e) {
        console.error('Failed to close master client:', e);
      }
    }
    throw error;
  }
}

async function cleanup() {
  try {
    console.log('🧹 Starting cleanup...');
    
    // Close knex connection if exists
    if (knexInstance) {
      await knexInstance.destroy();
      knexInstance = null;
    }

    // Create new master connection for cleanup
    const cleanupClient = new Client({
      host: testConfig.connection.host,
      port: testConfig.connection.port,
      user: testConfig.connection.user,
      password: testConfig.connection.password,
      database: 'postgres'
    });

    await cleanupClient.connect();
    
    // Drop test database
    await cleanupClient.query(`
      SELECT pg_terminate_backend(pg_stat_activity.pid)
      FROM pg_stat_activity
      WHERE pg_stat_activity.datname = '${TEST_DB_NAME}'
      AND pid <> pg_backend_pid();
    `);
    await cleanupClient.query(`DROP DATABASE IF EXISTS ${TEST_DB_NAME}`);
    
    await cleanupClient.end();
    console.log('✅ Test database cleaned up');
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  }
}

// Export the setup function directly for Jest globalSetup
module.exports = async () => {
  try {
    console.log('🚀 Starting global setup...');
    knexInstance = await setupTestDatabase();
    global.knexInstance = knexInstance;
    console.log('✅ Global setup completed');
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  }
};

// Export utility functions
module.exports.getKnex = () => knexInstance || global.knexInstance;
module.exports.TEST_DB_NAME = TEST_DB_NAME;
module.exports.teardown = cleanup;
module.exports.getApp = () => {
    const { app } = require('../src/app');

    return app;
}
module.exports.getServer = () => {
    const { server } = require('../src/app');

    return server;
}