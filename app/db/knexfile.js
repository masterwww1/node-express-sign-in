const path = require('path');

// Load appropriate .env file based on environment
const envPath = process.env.NODE_ENV === 'test' 
  ? path.resolve(__dirname, '../../.env.test')
  : path.resolve(__dirname, '../../.env');


require('dotenv').config({ path: envPath });

const defaultConfig = {
  client: 'postgresql',
  pool: {
    min: 2,
    max: 10
  },
  migrations: {
    directory: './migrations',
    tableName: 'knex_migrations'
  },
  seeds: {
    directory: './seeds'
  }
};

const testConfig = {
  ...defaultConfig,
  connection: {
    host: process.env.TEST_DB_HOST || 'localhost',
    port: process.env.TEST_DB_PORT || 5432,
    database: process.env.TEST_DB_NAME || 'group_todo_test',
    user: process.env.TEST_DB_USER || 'postgres',
    password: process.env.TEST_DB_PASSWORD || 'postgres'
  },
  pool: {
    min: 1,
    max: 5
  },
  // Enable debug in test environment
  debug: true,
  // Use in-memory SQLite for faster tests (optional)
  // client: 'sqlite3',
  // connection: ':memory:',
  // useNullAsDefault: true
};

const developmentConfig = {
  ...defaultConfig,
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'group_todo_dev',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres'
  }
};

const productionConfig = {
  ...defaultConfig,
  connection: process.env.DATABASE_URL,
  pool: {
    min: 2,
    max: 10
  },
  // Disable debug in production
  debug: false
};

// Log which configuration is being used
console.log(`Loading database configuration for environment: ${process.env.NODE_ENV}`);

module.exports = {
  test: testConfig,
  development: developmentConfig,
  production: productionConfig,

  // Helper function to get config for current environment
  getCurrentConfig: () => {
    const env = process.env.NODE_ENV || 'development';
    return module.exports[env];
  }
};