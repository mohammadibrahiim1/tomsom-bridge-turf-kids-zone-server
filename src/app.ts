import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import routes from './routes';
import { globalErrorHandler } from './shared/middlewares/error.middleware';
import { corsOptions } from './shared/config/cors';
import cookieParser from 'cookie-parser';

const app: Application = express();

// Security & Parsing Middlewares
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root Route
app.get('/', (req: Request, res: Response) => {
  res.send('Playing in my turf zone!');
});

// API Routes (v1)
app.use('/api/v1', routes);

// Global Error Handler
app.use(globalErrorHandler);

export default app;
