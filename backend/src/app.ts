import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

// Constants
const NODE_ENV = process.env.NODE_ENV || 'development';
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

// Types
interface ErrorResponse {
  error: {
    message: string;
    code: string;
    timestamp: string;
    path?: string;
    requestId?: string;
  };
}

interface CustomError extends Error {
  statusCode?: number;
  code?: string;
}

// Initialize Express application
const app: Express = express();

// Trust proxy for proper IP forwarding in production
app.set('trust proxy', 1);

// Security middleware - helmet with secure defaults
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  })
);

// CORS configuration
app.use(
  cors({
    origin: CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['X-Total-Count', 'X-Page-Number'],
    maxAge: 86400,
  })
);

// Compression middleware
app.use(
  compression({
    filter: (req: Request, res: Response) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    },
    level: 6,
  })
);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(
    morgan('combined', {
      skip: (req: Request) => req.url === '/health',
    })
  );
}

// Request ID middleware for tracing
app.use((req: Request, res: Response, next: NextFunction) => {
  const requestId =
    (req.headers['x-request-id'] as string) ||
    `${Date.now()}-${Math.random().toString(36).substring(7)}`;
  res.setHeader('X-Request-ID', requestId);
  (req as any).requestId = requestId;
  next();
});

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      message: 'Too many requests from this IP, please try again later',
      code: 'RATE_LIMIT_EXCEEDED',
      timestamp: new Date().toISOString(),
    },
  },
  skip: (req: Request) => req.url === '/health',
});

app.use(limiter);

// API v1 routes placeholder
app.use('/api/v1', (req: Request, res: Response) => {
  res.status(200).json({
    message: 'HR Onboarding API v1',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api/v1',
    },
  });
});

// 404 handler for undefined routes
app.use((req: Request, res: Response<ErrorResponse>) => {
  const errorResponse: ErrorResponse = {
    error: {
      message: 'Resource not found',
      code: 'NOT_FOUND',
      timestamp: new Date().toISOString(),
      path: req.path,
      requestId: res.getHeader('X-Request-ID') as string,
    },
  };

  res.status(404).json(errorResponse);
});

// Global error handler
app.use(
  (
    err: CustomError,
    req: Request,
    res: Response<ErrorResponse>,
    next: NextFunction
  ) => {
    const statusCode = err.statusCode || 500;
    const errorCode = err.code || 'INTERNAL_SERVER_ERROR';
    const requestId = res.getHeader('X-Request-ID') as string;

    console.error('[ERROR]', {
      timestamp: new Date().toISOString(),
      requestId,
      method: req.method,
      path: req.path,
      error: {
        message: err.message,
        code: errorCode,
        stack: NODE_ENV === 'development' ? err.stack : undefined,
      },
    });

    const errorResponse: ErrorResponse = {
      error: {
        message:
          NODE_ENV === 'production'
            ? 'An unexpected error occurred'
            : err.message,
        code: errorCode,
        timestamp: new Date().toISOString(),
        path: req.path,
        requestId,
      },
    };

    res.status(statusCode).json(errorResponse);
  }
);

export { app };