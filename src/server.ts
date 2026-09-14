import "dotenv/config";
import { Server } from "http";

import app from "./app";
import { connectDB, prisma } from "./shared/config/db";

const PORT: number = Number(process.env.PORT) || 9000;

let server: Server | null=null;

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  console.log(
    `\n🛑 Received ${signal}. Starting graceful shutdown...`
  );

  try {
    // HTTP server বন্ধ করুন
    if (server) {
      await new Promise<void>((resolve) => {
        server!.close(() => {
          console.log("HTTP server closed.");
          resolve();
        });
      });
    }

    // Prisma database connection বন্ধ করুন
    await prisma.$disconnect();

    console.log("📦 Database connection closed successfully.");

    process.exit(0);
  } catch (error) {
    console.error(
      "❌ Error during graceful shutdown:",
      error
    );

    await prisma.$disconnect().catch(() => {});

    process.exit(1);
  }
};

async function main() {
  try {
    // 1. Database connect
    await connectDB();

    // 2. Start HTTP server
    server = app.listen(PORT, "0.0.0.0", () => {
      console.log(
        `🚀 Server is running on port ${PORT}`
      );
    });
  } catch (error) {
    console.error("💥 Failed to start server:", error);

    await prisma.$disconnect().catch(() => {});

    process.exit(1);
  }
}

main();

// ========================================
// Process Error Handling
// ========================================

// Unhandled Promise Rejection
process.on(
  "unhandledRejection",
  (error: unknown) => {
    console.error(
      "💥 UNHANDLED REJECTION!",
      error
    );

    gracefulShutdown("unhandledRejection");
  }
);

// Uncaught Exception
process.on(
  "uncaughtException",
  (error: unknown) => {
    console.error(
      "💥 UNCAUGHT EXCEPTION!",
      error
    );

    prisma
      .$disconnect()
      .finally(() => {
        process.exit(1);
      });
  }
);

// ========================================
// Termination Signals
// ========================================

process.on("SIGTERM", () => {
  gracefulShutdown("SIGTERM");
});

process.on("SIGINT", () => {
  gracefulShutdown("SIGINT");
});