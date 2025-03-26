const { getKnex } = require('./globalSetup');
let knexInstance = null;

beforeAll(async () => {
  console.log('📋 Setting up test environment');
  knexInstance = getKnex();
  global.db = knexInstance;
  console.log('✅ Test environment ready');
});