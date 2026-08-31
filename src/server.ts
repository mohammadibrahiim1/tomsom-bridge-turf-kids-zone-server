import dotenv from 'dotenv';
dotenv.config();

import { Server } from 'http';
import app from './app';
import { connectDB } from './shared/config/db';

const PORT = process.env.PORT || 9000;

let server: Server;

async function main() {
  try {
    await connectDB();
    server = app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
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
