const { teardown } = require('./globalSetup'); // Import cleanup logic

module.exports = async () => {
  console.log('🧹 Running global teardown...');
  await teardown();
  console.log('✅ Global teardown completed');

  process.exit(0);
};
