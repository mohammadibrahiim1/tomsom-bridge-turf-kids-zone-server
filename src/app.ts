import express, {
  Application,
  Request,
  Response,
} from 'express';

import cors from 'cors';
import cookieParser from 'cookie-parser';

import routes from './routes';
import { globalErrorHandler } from './shared/middlewares/error.middleware';
import { corsOptions } from './shared/config/cors';

const app: Application = express();

// ========================================
// SECURITY
// ========================================

app.use(cors(corsOptions));

app.use(cookieParser());

// ========================================
// BODY PARSERS
// ========================================

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  }),
);

// ========================================
// ROOT ROUTE
// ========================================

app.get('/', (_req: Request, res: Response) => {
  res.status(200).send('Playing in my turf zone!');
});

// ========================================
// API ROUTES
// ========================================

app.use('/api/v1', routes);

// ========================================
// GLOBAL ERROR HANDLER
// MUST BE LAST
// ========================================

app.use(globalErrorHandler);

export default app;