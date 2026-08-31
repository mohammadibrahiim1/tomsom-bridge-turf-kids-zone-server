import dotenv from 'dotenv';
import { prisma } from './prisma';

dotenv.config();

/**
 * Connect to the PostgreSQL database using Prisma Client.
 */
export const connectDB = async (): Promise<void> => {
  try {
    await prisma.$connect();
    console.log('Database connected successfully!');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};
