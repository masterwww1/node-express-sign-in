const knex = require('knex');
const knexfile = require('../db/knexfile');

const environment = process.env.NODE_ENV || 'development';
const config = knexfile[environment];

const db = knex(config);


// Test the connection
db.raw('SELECT 1')
  .then(() => {
    console.log('Database connected');
  })
  .catch((err) => {
    console.error('Database connection failed:', err);
    process.exit(1);
  });

module.exports = db;