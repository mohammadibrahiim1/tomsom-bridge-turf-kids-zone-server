import dotenv from 'dotenv';
dotenv.config();

import { Server } from 'http';
import app from './app';
import connectDB from './shared/config/db';

const PORT = Number(process.env.PORT) || 9000;
let server: Server;

async function main() {
  try {
    // Connect to Database
    await connectDB();

    // Start Express Server
    server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🌐 Server is running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('💥 Failed to start server:', err);
    process.exit(1);
  }
}

main();

// Unhandled Rejections (Async error handling)
process.on('unhandledRejection', (err) => {
  console.error('💥 UNHANDLED REJECTION! Shutting down...', err);
  if (server) {
    server.close(() => {
      process.exit(1); 
    });
  } else {
    process.exit(1);
  }
});

// Uncaught Exceptions (Sync error handling)
process.on('uncaughtException', (err) => {
  console.error('💥 UNCAUGHT EXCEPTION! Shutting down...', err);
  process.exit(1);
});