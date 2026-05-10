const app = require('./app');
const { env } = require('./config/env');
const { connectDB } = require('./config/db');

connectDB().then(() => {
  const server = app.listen(env.PORT);

  server.on('listening', () => {
    console.log(`Sweet Science API running on port ${env.PORT}`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${env.PORT} is already in use. Kill the old process first:`);
      console.error(`  Windows: Get-Process node | Stop-Process -Force`);
      console.error(`  Mac/Linux: lsof -ti:${env.PORT} | xargs kill -9`);
      process.exit(1);
    }
    console.error('Server error:', error.message);
    process.exit(1);
  });
});
