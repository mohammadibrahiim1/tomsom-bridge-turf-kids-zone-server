"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const routes_1 = __importDefault(require("./routes"));
const error_middleware_1 = require("./shared/middlewares/error.middleware");
const cors_2 = require("./shared/config/cors");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const app = (0, express_1.default)();
// Security & Parsing Middlewares
app.use((0, cors_1.default)(cors_2.corsOptions));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Root Route
app.get('/', (req, res) => {
    res.send('Playing in my turf zone!');
});
// API Routes (v1)
app.use('/api/v1', routes_1.default);
// Global Error Handler
app.use(error_middleware_1.globalErrorHandler);
exports.default = app;
