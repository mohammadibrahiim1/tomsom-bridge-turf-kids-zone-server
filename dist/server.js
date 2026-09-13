"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app_1 = __importDefault(require("./app"));
const db_1 = __importDefault(require("./shared/config/db"));
const PORT = Number(process.env.PORT) || 9000;
let server;
async function main() {
    try {
        // Connect to Database
        await (0, db_1.default)();
        // Start Express Server
        server = app_1.default.listen(PORT, '0.0.0.0', () => {
            console.log(`🌐 Server is running on http://localhost:${PORT}`);
        });
    }
    catch (err) {
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
    }
    else {
        process.exit(1);
    }
});
// Uncaught Exceptions (Sync error handling)
process.on('uncaughtException', (err) => {
    console.error('💥 UNCAUGHT EXCEPTION! Shutting down...', err);
    process.exit(1);
});
