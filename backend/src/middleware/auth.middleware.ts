import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

function resolveJwtSecret(): string {
  const envSecret = process.env.JWT_SECRET;
  if (envSecret && envSecret.trim().length > 0) return envSecret;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('[FATAL] JWT_SECRET environment variable must be set in production.');
  }
  return 'talliffy_dev_only_jwt_secret_change_in_prod';
}

export const JWT_SECRET = resolveJwtSecret();

export interface AuthenticatedUser {
  userId: number;
  username: string;
  fullName?: string;
  role: string;
  companyId: number;
  companyCode?: string;
  godownName?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      companyId?: number;
    }
  }
}

export function authenticateJwt(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      isValid: false,
      message: 'Missing or invalid Authorization header',
      errorCode: 'UNAUTHORIZED',
      data: null,
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedUser;
    req.user = decoded;
    req.companyId = decoded.companyId || parseInt(process.env.DEFAULT_COMPANY_ID || '12', 10);
    next();
  } catch (err: any) {
    return res.status(401).json({
      isValid: false,
      message: 'Token expired or invalid: ' + err.message,
      errorCode: 'TOKEN_INVALID',
      data: null,
    });
  }
}

export function authenticateTally(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      isValid: false,
      message: 'Tally connector Bearer token required',
      errorCode: 'TALLY_AUTH_REQUIRED',
      data: null,
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.role !== 'TALLY_CONNECTOR' && decoded.role !== 'ADMIN') {
      return res.status(403).json({
        isValid: false,
        message: 'Invalid permissions for Tally integration',
        errorCode: 'FORBIDDEN',
        data: null,
      });
    }
    req.user = decoded;
    req.companyId = decoded.companyId || parseInt(process.env.DEFAULT_COMPANY_ID || '12', 10);
    next();
  } catch (err: any) {
    return res.status(401).json({
      isValid: false,
      message: 'Tally connector token expired or invalid',
      errorCode: 'TALLY_TOKEN_INVALID',
      data: null,
    });
  }
}

export function requireRole(...allowedRoles: string[]) {
  const normalized = allowedRoles.map(r => r.toUpperCase());
  return (req: Request, res: Response, next: NextFunction) => {
    const role = (req.user?.role || '').toUpperCase();
    if (!req.user || !normalized.includes(role)) {
      return res.status(403).json({
        isValid: false,
        message: 'Insufficient permissions for this operation',
        errorCode: 'FORBIDDEN',
        data: null,
      });
    }
    next();
  };
}

const loginBuckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimitAuth(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const maxAttempts = parseInt(process.env.AUTH_RATE_LIMIT_MAX || '40', 10);

  const entry = loginBuckets.get(ip);
  if (!entry || now > entry.resetAt) {
    loginBuckets.set(ip, { count: 1, resetAt: now + windowMs });
    return next();
  }
  entry.count += 1;
  if (entry.count > maxAttempts) {
    return res.status(429).json({
      isValid: false,
      message: 'Too many authentication attempts. Please try again later.',
      errorCode: 'RATE_LIMITED',
      data: null,
    });
  }
  next();
}
