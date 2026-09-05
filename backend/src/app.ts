import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import authRoutes from './modules/auth/auth.routes';
import { usersRouter, locationsStaffRouter } from './modules/users/users.routes';
import categoriesRouter from './modules/categories/categories.routes';
import itemsRouter from './modules/items/items.routes';
import locationsRouter from './modules/locations/locations.routes';
import movementsRouter from './modules/movements/movements.routes';
import alertsRouter from './modules/alerts/alerts.routes';
import dashboardRouter from './modules/dashboard/dashboard.routes';
import importExportRouter from './modules/import-export/import-export.routes';
import { errorHandler } from '../middleware/errorHandler';

const app: Application = express();

// Global Middlewares
app.use(helmet());

// CORS Configuration
const corsOptions = {
  origin: [
    process.env.FRONTEND_URL || 'https://inventory-management-jet-five.vercel.app',
    'http://localhost:3000', // For local development
    'http://localhost:3001',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

// Health Check Endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/auth', authRoutes);
app.use('/users', usersRouter);
app.use('/locations', locationsStaffRouter);
app.use('/locations', locationsRouter);
app.use('/categories', categoriesRouter);
app.use('/items', itemsRouter);
app.use('/movements', movementsRouter);
app.use('/alerts', alertsRouter);
app.use('/dashboard', dashboardRouter);
app.use('/', importExportRouter);

// Global Error Handler
app.use(errorHandler);

export default app;
