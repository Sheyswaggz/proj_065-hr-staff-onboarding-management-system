import { Router, Request, Response } from 'express';

// Types
interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  services: {
    database: ServiceStatus;
    api: ServiceStatus;
  };
  system: {
    memory: MemoryInfo;
    process: ProcessInfo;
  };
}

interface ServiceStatus {
  status: 'up' | 'down' | 'degraded';
  responseTime?: number;
  message?: string;
  lastChecked: string;
}

interface MemoryInfo {
  used: number;
  total: number;
  percentage: number;
  unit: string;
}

interface ProcessInfo {
  pid: number;
  uptime: number;
  nodeVersion: string;
}

interface ErrorResponse {
  error: {
    message: string;
    code: string;
    timestamp: string;
    requestId?: string;
  };
}

// Constants
const VERSION = '1.0.0';
const NODE_ENV = process.env.NODE_ENV || 'development';
const HEALTH_CHECK_TIMEOUT = 5000;
const startTime = Date.now();

// Utility functions
function formatBytes(bytes: number): { value: number; unit: string } {
  const mb = bytes / 1024 / 1024;
  return { value: Math.round(mb * 100) / 100, unit: 'MB' };
}

function getMemoryInfo(): MemoryInfo {
  const memUsage = process.memoryUsage();
  const heapUsed = formatBytes(memUsage.heapUsed);
  const heapTotal = formatBytes(memUsage.heapTotal);
  const percentage = Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100);

  return {
    used: heapUsed.value,
    total: heapTotal.value,
    percentage,
    unit: heapUsed.unit,
  };
}

function getProcessInfo(): ProcessInfo {
  return {
    pid: process.pid,
    uptime: Math.floor(process.uptime()),
    nodeVersion: process.version,
  };
}

async function checkDatabaseConnection(): Promise<ServiceStatus> {
  const startTime = Date.now();
  
  try {
    // Database connection check with timeout
    const checkPromise = new Promise<ServiceStatus>((resolve) => {
      // Simulate database check - in production, use actual Prisma client
      // Example: await prisma.$queryRaw`SELECT 1`
      const responseTime = Date.now() - startTime;
      
      resolve({
        status: 'up',
        responseTime,
        message: 'Database connection successful',
        lastChecked: new Date().toISOString(),
      });
    });

    const timeoutPromise = new Promise<ServiceStatus>((_, reject) => {
      setTimeout(() => {
        reject(new Error('Database health check timeout'));
      }, HEALTH_CHECK_TIMEOUT);
    });

    return await Promise.race([checkPromise, timeoutPromise]);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
    
    console.error('[HEALTH_CHECK] Database check failed:', {
      timestamp: new Date().toISOString(),
      error: errorMessage,
      duration: Date.now() - startTime,
    });

    return {
      status: 'down',
      responseTime: Date.now() - startTime,
      message: errorMessage,
      lastChecked: new Date().toISOString(),
    };
  }
}

function getApiStatus(): ServiceStatus {
  return {
    status: 'up',
    message: 'API service operational',
    lastChecked: new Date().toISOString(),
  };
}

function calculateUptime(): number {
  return Math.floor((Date.now() - startTime) / 1000);
}

function determineOverallHealth(services: HealthCheckResponse['services']): 'healthy' | 'unhealthy' {
  const allServicesUp = Object.values(services).every(
    (service) => service.status === 'up'
  );
  return allServicesUp ? 'healthy' : 'unhealthy';
}

// Router setup
const router = Router();

// Health check endpoint
router.get('/', async (req: Request, res: Response<HealthCheckResponse | ErrorResponse>) => {
  const requestId = res.getHeader('X-Request-ID') as string;
  const checkStartTime = Date.now();

  try {
    console.log('[HEALTH_CHECK] Starting health check', {
      timestamp: new Date().toISOString(),
      requestId,
      path: req.path,
      method: req.method,
    });

    // Perform service checks
    const [databaseStatus] = await Promise.all([
      checkDatabaseConnection(),
    ]);

    const apiStatus = getApiStatus();

    const services = {
      database: databaseStatus,
      api: apiStatus,
    };

    const overallStatus = determineOverallHealth(services);
    const statusCode = overallStatus === 'healthy' ? 200 : 503;

    const healthResponse: HealthCheckResponse = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: calculateUptime(),
      version: VERSION,
      environment: NODE_ENV,
      services,
      system: {
        memory: getMemoryInfo(),
        process: getProcessInfo(),
      },
    };

    const checkDuration = Date.now() - checkStartTime;

    console.log('[HEALTH_CHECK] Health check completed', {
      timestamp: new Date().toISOString(),
      requestId,
      status: overallStatus,
      duration: checkDuration,
      services: {
        database: databaseStatus.status,
        api: apiStatus.status,
      },
    });

    res.status(statusCode).json(healthResponse);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Health check failed';
    const checkDuration = Date.now() - checkStartTime;

    console.error('[HEALTH_CHECK] Health check error:', {
      timestamp: new Date().toISOString(),
      requestId,
      error: errorMessage,
      duration: checkDuration,
      stack: error instanceof Error ? error.stack : undefined,
    });

    const errorResponse: ErrorResponse = {
      error: {
        message: 'Health check failed',
        code: 'HEALTH_CHECK_ERROR',
        timestamp: new Date().toISOString(),
        requestId,
      },
    };

    res.status(503).json(errorResponse);
  }
});

// Liveness probe endpoint (simple check without dependencies)
router.get('/live', (req: Request, res: Response) => {
  const requestId = res.getHeader('X-Request-ID') as string;

  console.log('[HEALTH_CHECK] Liveness probe', {
    timestamp: new Date().toISOString(),
    requestId,
  });

  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: calculateUptime(),
  });
});

// Readiness probe endpoint (checks if service is ready to accept traffic)
router.get('/ready', async (req: Request, res: Response) => {
  const requestId = res.getHeader('X-Request-ID') as string;

  try {
    console.log('[HEALTH_CHECK] Readiness probe', {
      timestamp: new Date().toISOString(),
      requestId,
    });

    const databaseStatus = await checkDatabaseConnection();
    const isReady = databaseStatus.status === 'up';
    const statusCode = isReady ? 200 : 503;

    res.status(statusCode).json({
      status: isReady ? 'ready' : 'not_ready',
      timestamp: new Date().toISOString(),
      services: {
        database: databaseStatus.status,
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Readiness check failed';

    console.error('[HEALTH_CHECK] Readiness probe error:', {
      timestamp: new Date().toISOString(),
      requestId,
      error: errorMessage,
    });

    res.status(503).json({
      status: 'not_ready',
      timestamp: new Date().toISOString(),
      error: errorMessage,
    });
  }
});

export default router;