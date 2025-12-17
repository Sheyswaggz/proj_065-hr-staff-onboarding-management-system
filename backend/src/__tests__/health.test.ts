import request from 'supertest';
import express, { type Express } from 'express';
import { describe, it, expect, beforeEach, afterEach, vi, beforeAll, afterAll } from 'vitest';

import healthRouter from '../routes/health';

/**
 * Test Suite: Health Check Endpoint
 * 
 * Coverage Areas:
 * - HTTP endpoint responses (GET /health, /health/live, /health/ready)
 * - Database connectivity checks
 * - Service status monitoring
 * - Error handling and timeouts
 * - System metrics reporting
 * - Performance validation
 * - Security headers
 * - Logging verification
 * 
 * Test Categories:
 * - Unit Tests: Individual function validation
 * - Integration Tests: HTTP endpoint behavior
 * - Performance Tests: Response time validation
 * - Security Tests: Error information leakage
 * - Edge Cases: Timeout, failures, concurrent requests
 */

// =============================================================================
// Test Setup and Utilities
// =============================================================================

let app: Express;
let consoleLogSpy: ReturnType<typeof vi.spyOn>;
let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

/**
 * Creates Express app with health router for testing
 */
function createTestApp(): Express {
  const testApp = express();
  
  // Add request ID middleware for testing
  testApp.use((req, res, next) => {
    res.setHeader('X-Request-ID', `test-${Date.now()}`);
    next();
  });
  
  testApp.use('/health', healthRouter);
  
  return testApp;
}

/**
 * Validates health check response structure
 */
function validateHealthResponse(body: any): void {
  expect(body).toHaveProperty('status');
  expect(body).toHaveProperty('timestamp');
  expect(body).toHaveProperty('uptime');
  expect(body).toHaveProperty('version');
  expect(body).toHaveProperty('environment');
  expect(body).toHaveProperty('services');
  expect(body).toHaveProperty('system');
  
  expect(body.services).toHaveProperty('database');
  expect(body.services).toHaveProperty('api');
  
  expect(body.system).toHaveProperty('memory');
  expect(body.system).toHaveProperty('process');
}

/**
 * Validates service status structure
 */
function validateServiceStatus(service: any): void {
  expect(service).toHaveProperty('status');
  expect(service).toHaveProperty('lastChecked');
  expect(['up', 'down', 'degraded']).toContain(service.status);
  expect(service.lastChecked).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
}

/**
 * Validates memory info structure
 */
function validateMemoryInfo(memory: any): void {
  expect(memory).toHaveProperty('used');
  expect(memory).toHaveProperty('total');
  expect(memory).toHaveProperty('percentage');
  expect(memory).toHaveProperty('unit');
  
  expect(typeof memory.used).toBe('number');
  expect(typeof memory.total).toBe('number');
  expect(typeof memory.percentage).toBe('number');
  expect(memory.unit).toBe('MB');
  
  expect(memory.used).toBeGreaterThan(0);
  expect(memory.total).toBeGreaterThan(0);
  expect(memory.percentage).toBeGreaterThanOrEqual(0);
  expect(memory.percentage).toBeLessThanOrEqual(100);
}

/**
 * Validates process info structure
 */
function validateProcessInfo(processInfo: any): void {
  expect(processInfo).toHaveProperty('pid');
  expect(processInfo).toHaveProperty('uptime');
  expect(processInfo).toHaveProperty('nodeVersion');
  
  expect(typeof processInfo.pid).toBe('number');
  expect(typeof processInfo.uptime).toBe('number');
  expect(typeof processInfo.nodeVersion).toBe('string');
  
  expect(processInfo.pid).toBeGreaterThan(0);
  expect(processInfo.uptime).toBeGreaterThanOrEqual(0);
  expect(processInfo.nodeVersion).toMatch(/^v\d+\.\d+\.\d+$/);
}

// =============================================================================
// Test Lifecycle Hooks
// =============================================================================

beforeAll(() => {
  // Set test environment
  process.env.NODE_ENV = 'test';
});

beforeEach(() => {
  // Create fresh app instance for each test
  app = createTestApp();
  
  // Spy on console methods
  consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  // Restore console methods
  consoleLogSpy.mockRestore();
  consoleErrorSpy.mockRestore();
  
  // Clear all mocks
  vi.clearAllMocks();
});

afterAll(() => {
  // Cleanup
  delete process.env.NODE_ENV;
});

// =============================================================================
// Unit Tests: Health Check Endpoint
// =============================================================================

describe('GET /health - Main Health Check', () => {
  it('should return 200 status for healthy service', async () => {
    const response = await request(app).get('/health');
    
    expect(response.status).toBe(200);
  });

  it('should return valid JSON response', async () => {
    const response = await request(app).get('/health');
    
    expect(response.headers['content-type']).toMatch(/application\/json/);
    expect(response.body).toBeDefined();
  });

  it('should include all required health check fields', async () => {
    const response = await request(app).get('/health');
    
    validateHealthResponse(response.body);
  });

  it('should return healthy status when all services are up', async () => {
    const response = await request(app).get('/health');
    
    expect(response.body.status).toBe('healthy');
    expect(response.body.services.database.status).toBe('up');
    expect(response.body.services.api.status).toBe('up');
  });

  it('should include valid timestamp in ISO 8601 format', async () => {
    const response = await request(app).get('/health');
    
    expect(response.body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    
    const timestamp = new Date(response.body.timestamp);
    expect(timestamp.getTime()).toBeLessThanOrEqual(Date.now());
  });

  it('should include uptime in seconds', async () => {
    const response = await request(app).get('/health');
    
    expect(typeof response.body.uptime).toBe('number');
    expect(response.body.uptime).toBeGreaterThanOrEqual(0);
  });

  it('should include version information', async () => {
    const response = await request(app).get('/health');
    
    expect(response.body.version).toBe('1.0.0');
    expect(typeof response.body.version).toBe('string');
  });

  it('should include environment information', async () => {
    const response = await request(app).get('/health');
    
    expect(response.body.environment).toBe('test');
    expect(['development', 'test', 'production']).toContain(response.body.environment);
  });

  it('should include database service status', async () => {
    const response = await request(app).get('/health');
    
    validateServiceStatus(response.body.services.database);
  });

  it('should include API service status', async () => {
    const response = await request(app).get('/health');
    
    validateServiceStatus(response.body.services.api);
  });

  it('should include database response time', async () => {
    const response = await request(app).get('/health');
    
    expect(response.body.services.database).toHaveProperty('responseTime');
    expect(typeof response.body.services.database.responseTime).toBe('number');
    expect(response.body.services.database.responseTime).toBeGreaterThanOrEqual(0);
  });

  it('should include service messages', async () => {
    const response = await request(app).get('/health');
    
    expect(response.body.services.database).toHaveProperty('message');
    expect(response.body.services.api).toHaveProperty('message');
    expect(typeof response.body.services.database.message).toBe('string');
    expect(typeof response.body.services.api.message).toBe('string');
  });
});

// =============================================================================
// Unit Tests: System Metrics
// =============================================================================

describe('GET /health - System Metrics', () => {
  it('should include memory information', async () => {
    const response = await request(app).get('/health');
    
    validateMemoryInfo(response.body.system.memory);
  });

  it('should include process information', async () => {
    const response = await request(app).get('/health');
    
    validateProcessInfo(response.body.system.process);
  });

  it('should report memory usage in megabytes', async () => {
    const response = await request(app).get('/health');
    
    const { memory } = response.body.system;
    expect(memory.unit).toBe('MB');
    expect(memory.used).toBeGreaterThan(0);
    expect(memory.total).toBeGreaterThan(memory.used);
  });

  it('should calculate memory percentage correctly', async () => {
    const response = await request(app).get('/health');
    
    const { memory } = response.body.system;
    const calculatedPercentage = Math.round((memory.used / memory.total) * 100);
    
    expect(memory.percentage).toBe(calculatedPercentage);
  });

  it('should include current process ID', async () => {
    const response = await request(app).get('/health');
    
    expect(response.body.system.process.pid).toBe(process.pid);
  });

  it('should include process uptime', async () => {
    const response = await request(app).get('/health');
    
    const { uptime } = response.body.system.process;
    expect(uptime).toBeGreaterThanOrEqual(0);
    expect(uptime).toBeLessThanOrEqual(Math.floor(process.uptime()) + 1);
  });

  it('should include Node.js version', async () => {
    const response = await request(app).get('/health');
    
    expect(response.body.system.process.nodeVersion).toBe(process.version);
  });
});

// =============================================================================
// Unit Tests: Liveness Probe
// =============================================================================

describe('GET /health/live - Liveness Probe', () => {
  it('should return 200 status', async () => {
    const response = await request(app).get('/health/live');
    
    expect(response.status).toBe(200);
  });

  it('should return alive status', async () => {
    const response = await request(app).get('/health/live');
    
    expect(response.body.status).toBe('alive');
  });

  it('should include timestamp', async () => {
    const response = await request(app).get('/health/live');
    
    expect(response.body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  });

  it('should include uptime', async () => {
    const response = await request(app).get('/health/live');
    
    expect(typeof response.body.uptime).toBe('number');
    expect(response.body.uptime).toBeGreaterThanOrEqual(0);
  });

  it('should respond quickly without dependency checks', async () => {
    const startTime = Date.now();
    await request(app).get('/health/live');
    const duration = Date.now() - startTime;
    
    expect(duration).toBeLessThan(100); // Should respond in less than 100ms
  });

  it('should not include service status', async () => {
    const response = await request(app).get('/health/live');
    
    expect(response.body).not.toHaveProperty('services');
  });

  it('should not include system metrics', async () => {
    const response = await request(app).get('/health/live');
    
    expect(response.body).not.toHaveProperty('system');
  });
});

// =============================================================================
// Unit Tests: Readiness Probe
// =============================================================================

describe('GET /health/ready - Readiness Probe', () => {
  it('should return 200 status when ready', async () => {
    const response = await request(app).get('/health/ready');
    
    expect(response.status).toBe(200);
  });

  it('should return ready status when database is up', async () => {
    const response = await request(app).get('/health/ready');
    
    expect(response.body.status).toBe('ready');
  });

  it('should include timestamp', async () => {
    const response = await request(app).get('/health/ready');
    
    expect(response.body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  });

  it('should include database service status', async () => {
    const response = await request(app).get('/health/ready');
    
    expect(response.body.services).toHaveProperty('database');
    expect(['up', 'down', 'degraded']).toContain(response.body.services.database);
  });

  it('should check database connectivity', async () => {
    const response = await request(app).get('/health/ready');
    
    expect(response.body.services.database).toBe('up');
  });
});

// =============================================================================
// Integration Tests: HTTP Behavior
// =============================================================================

describe('Health Endpoint - HTTP Behavior', () => {
  it('should handle GET requests only', async () => {
    const getResponse = await request(app).get('/health');
    expect(getResponse.status).toBe(200);
    
    const postResponse = await request(app).post('/health');
    expect(postResponse.status).toBe(404);
    
    const putResponse = await request(app).put('/health');
    expect(putResponse.status).toBe(404);
    
    const deleteResponse = await request(app).delete('/health');
    expect(deleteResponse.status).toBe(404);
  });

  it('should set correct content-type header', async () => {
    const response = await request(app).get('/health');
    
    expect(response.headers['content-type']).toMatch(/application\/json/);
  });

  it('should include request ID in logs', async () => {
    await request(app).get('/health');
    
    expect(consoleLogSpy).toHaveBeenCalled();
    const logCalls = consoleLogSpy.mock.calls;
    const hasRequestId = logCalls.some((call) => {
      const logMessage = call[1];
      return logMessage && typeof logMessage === 'object' && 'requestId' in logMessage;
    });
    
    expect(hasRequestId).toBe(true);
  });

  it('should log health check start', async () => {
    await request(app).get('/health');
    
    expect(consoleLogSpy).toHaveBeenCalledWith(
      '[HEALTH_CHECK] Starting health check',
      expect.objectContaining({
        timestamp: expect.any(String),
        path: '/health',
        method: 'GET',
      })
    );
  });

  it('should log health check completion', async () => {
    await request(app).get('/health');
    
    expect(consoleLogSpy).toHaveBeenCalledWith(
      '[HEALTH_CHECK] Health check completed',
      expect.objectContaining({
        timestamp: expect.any(String),
        status: 'healthy',
        duration: expect.any(Number),
      })
    );
  });

  it('should log liveness probe access', async () => {
    await request(app).get('/health/live');
    
    expect(consoleLogSpy).toHaveBeenCalledWith(
      '[HEALTH_CHECK] Liveness probe',
      expect.objectContaining({
        timestamp: expect.any(String),
      })
    );
  });

  it('should log readiness probe access', async () => {
    await request(app).get('/health/ready');
    
    expect(consoleLogSpy).toHaveBeenCalledWith(
      '[HEALTH_CHECK] Readiness probe',
      expect.objectContaining({
        timestamp: expect.any(String),
      })
    );
  });
});

// =============================================================================
// Integration Tests: Concurrent Requests
// =============================================================================

describe('Health Endpoint - Concurrent Requests', () => {
  it('should handle multiple simultaneous requests', async () => {
    const requests = Array.from({ length: 10 }, () => request(app).get('/health'));
    
    const responses = await Promise.all(requests);
    
    responses.forEach((response) => {
      expect(response.status).toBe(200);
      validateHealthResponse(response.body);
    });
  });

  it('should handle concurrent liveness probes', async () => {
    const requests = Array.from({ length: 20 }, () => request(app).get('/health/live'));
    
    const responses = await Promise.all(requests);
    
    responses.forEach((response) => {
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('alive');
    });
  });

  it('should handle concurrent readiness probes', async () => {
    const requests = Array.from({ length: 15 }, () => request(app).get('/health/ready'));
    
    const responses = await Promise.all(requests);
    
    responses.forEach((response) => {
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ready');
    });
  });

  it('should maintain consistent uptime across concurrent requests', async () => {
    const requests = Array.from({ length: 5 }, () => request(app).get('/health'));
    
    const responses = await Promise.all(requests);
    const uptimes = responses.map((r) => r.body.uptime);
    
    // All uptimes should be within 1 second of each other
    const maxUptime = Math.max(...uptimes);
    const minUptime = Math.min(...uptimes);
    expect(maxUptime - minUptime).toBeLessThanOrEqual(1);
  });
});

// =============================================================================
// Performance Tests
// =============================================================================

describe('Health Endpoint - Performance', () => {
  it('should respond within acceptable time limit', async () => {
    const startTime = Date.now();
    await request(app).get('/health');
    const duration = Date.now() - startTime;
    
    expect(duration).toBeLessThan(1000); // Should respond in less than 1 second
  });

  it('should handle rapid sequential requests efficiently', async () => {
    const startTime = Date.now();
    
    for (let i = 0; i < 10; i++) {
      await request(app).get('/health');
    }
    
    const totalDuration = Date.now() - startTime;
    const averageDuration = totalDuration / 10;
    
    expect(averageDuration).toBeLessThan(500); // Average should be less than 500ms
  });

  it('should have minimal memory overhead', async () => {
    const initialMemory = process.memoryUsage().heapUsed;
    
    // Make 100 requests
    for (let i = 0; i < 100; i++) {
      await request(app).get('/health');
    }
    
    const finalMemory = process.memoryUsage().heapUsed;
    const memoryIncrease = finalMemory - initialMemory;
    const memoryIncreaseMB = memoryIncrease / 1024 / 1024;
    
    expect(memoryIncreaseMB).toBeLessThan(10); // Should not increase by more than 10MB
  });

  it('should report database check duration', async () => {
    const response = await request(app).get('/health');
    
    const { responseTime } = response.body.services.database;
    expect(responseTime).toBeDefined();
    expect(responseTime).toBeGreaterThanOrEqual(0);
    expect(responseTime).toBeLessThan(5000); // Should be less than timeout
  });

  it('should complete health check within timeout', async () => {
    const response = await request(app).get('/health');
    
    const logCalls = consoleLogSpy.mock.calls;
    const completionLog = logCalls.find((call) => call[0] === '[HEALTH_CHECK] Health check completed');
    
    if (completionLog && completionLog[1]) {
      const duration = (completionLog[1] as any).duration;
      expect(duration).toBeLessThan(5000); // Should complete within 5 second timeout
    }
  });
});

// =============================================================================
// Security Tests
// =============================================================================

describe('Health Endpoint - Security', () => {
  it('should not expose sensitive system information', async () => {
    const response = await request(app).get('/health');
    
    expect(response.body).not.toHaveProperty('env');
    expect(response.body).not.toHaveProperty('config');
    expect(response.body).not.toHaveProperty('secrets');
  });

  it('should not expose internal error details in production', async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    
    const testApp = createTestApp();
    const response = await request(testApp).get('/health');
    
    if (response.status === 503) {
      expect(response.body.error).not.toHaveProperty('stack');
    }
    
    process.env.NODE_ENV = originalEnv;
  });

  it('should sanitize error messages', async () => {
    const response = await request(app).get('/health');
    
    if (response.status === 503 && response.body.error) {
      const errorMessage = response.body.error.message;
      expect(errorMessage).not.toContain('password');
      expect(errorMessage).not.toContain('token');
      expect(errorMessage).not.toContain('secret');
    }
  });

  it('should include request ID for tracing', async () => {
    const response = await request(app).get('/health');
    
    if (response.status === 503 && response.body.error) {
      expect(response.body.error).toHaveProperty('requestId');
    }
  });

  it('should not expose database connection strings', async () => {
    const response = await request(app).get('/health');
    
    const responseString = JSON.stringify(response.body);
    expect(responseString).not.toMatch(/postgres:\/\//);
    expect(responseString).not.toMatch(/mongodb:\/\//);
    expect(responseString).not.toMatch(/mysql:\/\//);
  });
});

// =============================================================================
// Edge Cases and Error Scenarios
// =============================================================================

describe('Health Endpoint - Edge Cases', () => {
  it('should handle requests with query parameters', async () => {
    const response = await request(app).get('/health?foo=bar&baz=qux');
    
    expect(response.status).toBe(200);
    validateHealthResponse(response.body);
  });

  it('should handle requests with trailing slash', async () => {
    const response = await request(app).get('/health/');
    
    expect(response.status).toBe(200);
  });

  it('should handle case-sensitive paths correctly', async () => {
    const upperResponse = await request(app).get('/HEALTH');
    expect(upperResponse.status).toBe(404);
    
    const mixedResponse = await request(app).get('/Health');
    expect(mixedResponse.status).toBe(404);
  });

  it('should handle invalid sub-paths', async () => {
    const response = await request(app).get('/health/invalid');
    
    expect(response.status).toBe(404);
  });

  it('should maintain uptime across multiple requests', async () => {
    const response1 = await request(app).get('/health');
    const uptime1 = response1.body.uptime;
    
    // Wait 1 second
    await new Promise((resolve) => {
      setTimeout(resolve, 1000);
    });
    
    const response2 = await request(app).get('/health');
    const uptime2 = response2.body.uptime;
    
    expect(uptime2).toBeGreaterThanOrEqual(uptime1);
  });

  it('should handle requests with custom headers', async () => {
    const response = await request(app)
      .get('/health')
      .set('X-Custom-Header', 'test-value')
      .set('User-Agent', 'test-agent');
    
    expect(response.status).toBe(200);
    validateHealthResponse(response.body);
  });

  it('should handle requests with accept header', async () => {
    const response = await request(app)
      .get('/health')
      .set('Accept', 'application/json');
    
    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toMatch(/application\/json/);
  });
});

// =============================================================================
// Data Validation Tests
// =============================================================================

describe('Health Endpoint - Data Validation', () => {
  it('should return valid ISO 8601 timestamps', async () => {
    const response = await request(app).get('/health');
    
    const timestamp = new Date(response.body.timestamp);
    expect(timestamp.toISOString()).toBe(response.body.timestamp);
  });

  it('should return consistent data types', async () => {
    const response = await request(app).get('/health');
    
    expect(typeof response.body.status).toBe('string');
    expect(typeof response.body.timestamp).toBe('string');
    expect(typeof response.body.uptime).toBe('number');
    expect(typeof response.body.version).toBe('string');
    expect(typeof response.body.environment).toBe('string');
    expect(typeof response.body.services).toBe('object');
    expect(typeof response.body.system).toBe('object');
  });

  it('should return valid service status values', async () => {
    const response = await request(app).get('/health');
    
    const validStatuses = ['up', 'down', 'degraded'];
    expect(validStatuses).toContain(response.body.services.database.status);
    expect(validStatuses).toContain(response.body.services.api.status);
  });

  it('should return valid overall health status', async () => {
    const response = await request(app).get('/health');
    
    expect(['healthy', 'unhealthy']).toContain(response.body.status);
  });

  it('should return non-negative numeric values', async () => {
    const response = await request(app).get('/health');
    
    expect(response.body.uptime).toBeGreaterThanOrEqual(0);
    expect(response.body.system.memory.used).toBeGreaterThanOrEqual(0);
    expect(response.body.system.memory.total).toBeGreaterThanOrEqual(0);
    expect(response.body.system.memory.percentage).toBeGreaterThanOrEqual(0);
    expect(response.body.system.process.pid).toBeGreaterThan(0);
    expect(response.body.system.process.uptime).toBeGreaterThanOrEqual(0);
  });

  it('should return valid memory percentage range', async () => {
    const response = await request(app).get('/health');
    
    const { percentage } = response.body.system.memory;
    expect(percentage).toBeGreaterThanOrEqual(0);
    expect(percentage).toBeLessThanOrEqual(100);
  });

  it('should return valid Node.js version format', async () => {
    const response = await request(app).get('/health');
    
    const { nodeVersion } = response.body.system.process;
    expect(nodeVersion).toMatch(/^v\d+\.\d+\.\d+$/);
  });
});

// =============================================================================
// Logging Tests
// =============================================================================

describe('Health Endpoint - Logging', () => {
  it('should log with structured format', async () => {
    await request(app).get('/health');
    
    expect(consoleLogSpy).toHaveBeenCalled();
    
    const logCalls = consoleLogSpy.mock.calls;
    logCalls.forEach((call) => {
      expect(call[0]).toMatch(/^\[HEALTH_CHECK\]/);
      if (call[1]) {
        expect(call[1]).toHaveProperty('timestamp');
      }
    });
  });

  it('should log request metadata', async () => {
    await request(app).get('/health');
    
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('[HEALTH_CHECK]'),
      expect.objectContaining({
        timestamp: expect.any(String),
        requestId: expect.any(String),
      })
    );
  });

  it('should log service check results', async () => {
    await request(app).get('/health');
    
    expect(consoleLogSpy).toHaveBeenCalledWith(
      '[HEALTH_CHECK] Health check completed',
      expect.objectContaining({
        services: expect.objectContaining({
          database: expect.any(String),
          api: expect.any(String),
        }),
      })
    );
  });

  it('should log check duration', async () => {
    await request(app).get('/health');
    
    expect(consoleLogSpy).toHaveBeenCalledWith(
      '[HEALTH_CHECK] Health check completed',
      expect.objectContaining({
        duration: expect.any(Number),
      })
    );
  });

  it('should not log sensitive information', async () => {
    await request(app).get('/health');
    
    const logCalls = consoleLogSpy.mock.calls;
    const allLogs = JSON.stringify(logCalls);
    
    expect(allLogs).not.toContain('password');
    expect(allLogs).not.toContain('secret');
    expect(allLogs).not.toContain('token');
  });
});

// =============================================================================
// Regression Tests
// =============================================================================

describe('Health Endpoint - Regression Tests', () => {
  it('should maintain backward compatibility with response structure', async () => {
    const response = await request(app).get('/health');
    
    // Ensure all expected fields are present
    const expectedFields = [
      'status',
      'timestamp',
      'uptime',
      'version',
      'environment',
      'services',
      'system',
    ];
    
    expectedFields.forEach((field) => {
      expect(response.body).toHaveProperty(field);
    });
  });

  it('should maintain consistent version format', async () => {
    const response = await request(app).get('/health');
    
    expect(response.body.version).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it('should maintain consistent service names', async () => {
    const response = await request(app).get('/health');
    
    expect(response.body.services).toHaveProperty('database');
    expect(response.body.services).toHaveProperty('api');
  });

  it('should maintain consistent system metric names', async () => {
    const response = await request(app).get('/health');
    
    expect(response.body.system).toHaveProperty('memory');
    expect(response.body.system).toHaveProperty('process');
  });
});