import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Constants
const PORT = process.env.PORT || 8080;
const NODE_ENV = process.env.NODE_ENV || 'development';
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

// Types
interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  environment: string;
  version: string;
}

interface ErrorResponse {
  error: {
    message: string;
    code: string;
    timestamp: string;
    path?: string;
  };
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
    req.headers['x-request-id'] ||
    `${Date.now()}-${Math.random().toString(36).substring(7)}`;
  res.setHeader('X-Request-ID', requestId);
  next();
});

// Health check endpoint
app.get('/health', (req: Request, res: Response<HealthCheckResponse>) => {
  const healthCheck: HealthCheckResponse = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: NODE_ENV,
    version: process.env.npm_package_version || '1.0.0',
  };

  res.status(200).json(healthCheck);
});

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
    },
  };

  res.status(404).json(errorResponse);
});

// Global error handler
app.use(
  (
    err: Error,
    req: Request,
    res: Response<ErrorResponse>,
    next: NextFunction
  ) => {
    const statusCode = (err as any).statusCode || 500;
    const errorCode = (err as any).code || 'INTERNAL_SERVER_ERROR';

    console.error('[ERROR]', {
      timestamp: new Date().toISOString(),
      requestId: res.getHeader('X-Request-ID'),
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
      },
    };

    res.status(statusCode).json(errorResponse);
  }
);

// Server instance
let server: ReturnType<typeof app.listen> | null = null;

// Graceful shutdown handler
const gracefulShutdown = async (signal: string): Promise<void> => {
  console.log(`[${signal}] Received shutdown signal, starting graceful shutdown...`);

  if (server) {
    server.close((err?: Error) => {
      if (err) {
        console.error('[SHUTDOWN] Error during server close:', err);
        process.exit(1);
      }

      console.log('[SHUTDOWN] HTTP server closed successfully');
      console.log('[SHUTDOWN] Closing database connections...');

      // Database cleanup would go here
      // await prisma.$disconnect();

      console.log('[SHUTDOWN] Graceful shutdown completed');
      process.exit(0);
    });

    // Force shutdown after 30 seconds
    setTimeout(() => {
      console.error('[SHUTDOWN] Forced shutdown after timeout');
      process.exit(1);
    }, 30000);
  } else {
    process.exit(0);
  }
};

// Register shutdown handlers
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Unhandled rejection handler
process.on('unhandledRejection', (reason: unknown, promise: Promise<any>) => {
  console.error('[UNHANDLED_REJECTION]', {
    timestamp: new Date().toISOString(),
    reason,
    promise,
  });

  if (NODE_ENV === 'production') {
    gracefulShutdown('UNHANDLED_REJECTION');
  }
});

// Uncaught exception handler
process.on('uncaughtException', (error: Error) => {
  console.error('[UNCAUGHT_EXCEPTION]', {
    timestamp: new Date().toISOString(),
    error: {
      message: error.message,
      stack: error.stack,
    },
  });

  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

// Start server
const startServer = async (): Promise<void> => {
  try {
    // Database connection would be initialized here
    // await prisma.$connect();
    // console.log('[DATABASE] Connected successfully');

    server = app.listen(PORT, () => {
      console.log('[SERVER] Starting HR Onboarding API...');
      console.log(`[SERVER] Environment: ${NODE_ENV}`);
      console.log(`[SERVER] Port: ${PORT}`);
      console.log(`[SERVER] Health check: http://localhost:${PORT}/health`);
      console.log(`[SERVER] API endpoint: http://localhost:${PORT}/api/v1`);
      console.log('[SERVER] Server started successfully');
    });

    server.on('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`[SERVER] Port ${PORT} is already in use`);
      } else {
        console.error('[SERVER] Server error:', error);
      }
      process.exit(1);
    });
  } catch (error) {
    console.error('[SERVER] Failed to start server:', error);
    process.exit(1);
  }
};

// Start the application
startServer();

// Export for testing
export { app };