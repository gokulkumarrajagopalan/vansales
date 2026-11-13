import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import fs from 'fs';
import path from 'path';
import tallyRoutes from './routes/tally.routes.js';
import authRoutes from './routes/auth.routes.js';
import shiftRoutes from './routes/shift.routes.js';
import customerRoutes from './routes/customer.routes.js';
import stockRoutes from './routes/stock.routes.js';
import invoiceRoutes from './routes/invoice.routes.js';
import receiptRoutes from './routes/receipt.routes.js';
import reportsRoutes from './routes/reports.routes.js';
import tallyAdminRoutes from './routes/tally-admin.routes.js';
import orderRoutes from './routes/order.routes.js';
import vendorRoutes from './routes/vendor.routes.js';
import categoryRoutes from './routes/category.routes.js';
import productRoutes from './routes/product.routes.js';
import advisoryRoutes from './routes/advisory.routes.js';
import settingsRoutes from './routes/settings.routes.js';
import trackingRoutes from './routes/tracking.routes.js';
import nativeRoutes from './routes/native.routes.js';

export const app = express();

// Security headers & hardening
app.disable('x-powered-by');
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

const allowedOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

// Global Middleware
app.use(
  cors(
    allowedOrigins.length > 0
      ? { origin: allowedOrigins, credentials: true }
      : { origin: true, credentials: true }
  )
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Health check root
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'HEALTHY', service: 'talliffy-backend', timestamp: new Date().toISOString() });
});

// 1. Tally Connector Contract Routes
app.use('/TallyIntegration', tallyRoutes);
app.use('/api/tally', tallyRoutes);

// 2. Mobile & Web App Internal APIs
app.use('/api', nativeRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/shifts', shiftRoutes);
app.use('/api/v1/customers', customerRoutes);
app.use('/api/v1/stock', stockRoutes);
app.use('/api/v1/invoices', invoiceRoutes);
app.use('/api/v1/receipts', receiptRoutes);
app.use('/api/v1/reports', reportsRoutes);
app.use('/api/v1/tally', tallyAdminRoutes);

// 3. Tally Order & ApexERP Unified Modules
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/vendors', vendorRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/advisory', advisoryRoutes);
app.use('/api/v1/settings', settingsRoutes);
app.use('/api/v1/tracking', trackingRoutes);

// Serve built WebApp SPA if available (enables UI access on port 8080 as well as 3000)
const webappDistPath = [
  path.resolve(process.cwd(), '..', 'webapp', 'dist'),
  path.resolve(process.cwd(), 'webapp', 'dist'),
].find(p => fs.existsSync(path.join(p, 'index.html')));

if (webappDistPath) {
  app.use(express.static(webappDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/TallyIntegration') || req.path === '/health') {
      return next();
    }
    res.sendFile(path.join(webappDistPath, 'index.html'));
  });
}

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    isValid: false,
    message: `Endpoint ${req.method} ${req.url} not found`,
    errorCode: 'NOT_FOUND',
    data: null,
  });
});

// Centralized Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Unhandled Express Error]', err);
  const status = err?.status || err?.statusCode || 500;
  res.status(status).json({
    isValid: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err?.message || 'Internal server error',
    errorCode: err?.code || 'INTERNAL_ERROR',
    data: null,
  });
});
