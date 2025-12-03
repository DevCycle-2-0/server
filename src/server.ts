import { createApp } from './app';
import { createDatabase } from './infrastructure/database/config/database.config';
import { config } from './config/env.config';

const startServer = async () => {
  try {
    // Initialize database
    const sequelize = createDatabase();

    console.log('🔄 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    // Sync database in development (use migrations in production)
    if (config.env === 'development') {
      await sequelize.sync({ alter: false });
      console.log('✅ Database synced');
    }

    // Create Express app
    const app = createApp();

    // Start server
    const server = app.listen(config.port, () => {
      console.log('🚀 Server started successfully');
      console.log(`📍 Environment: ${config.env}`);
      console.log(`🌐 Server running on http://localhost:${config.port}`);
      console.log(`📡 API endpoint: http://localhost:${config.port}/api/${config.apiVersion}`);
      console.log(
        `❤️  Health check: http://localhost:${config.port}/api/${config.apiVersion}/health`
      );
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      console.log(`\n${signal} received, closing server gracefully...`);

      server.close(async () => {
        console.log('🔄 Server closed');

        try {
          await sequelize.close();
          console.log('✅ Database connection closed');
          process.exit(0);
        } catch (error) {
          console.error('❌ Error closing database:', error);
          process.exit(1);
        }
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.error('❌ Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();
