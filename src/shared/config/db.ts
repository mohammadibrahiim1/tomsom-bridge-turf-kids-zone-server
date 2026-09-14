import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const connectionString = process.env.CP_DB_URL;

if (!connectionString) {
  throw new Error('CP_DB_URL is not defined');
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

const connectDB = async (): Promise<void> => {
  try {
    await prisma.$connect();

    console.log(
      'PostgreSQL Database connected successfully via Prisma',
    );
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(
        `Database connection error: ${error.message}`,
      );
    } else {
      console.error(
        'An unknown error occurred during database connection',
      );
    }

    process.exit(1);
  }
};

export { prisma, connectDB };