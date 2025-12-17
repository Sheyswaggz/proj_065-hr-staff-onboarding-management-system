import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';

/**
 * Global error boundary component for catching and handling React errors
 * Provides fallback UI and error logging for production monitoring
 */
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null; errorInfo: React.ErrorInfo | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): { hasError: boolean; error: Error } {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log error to monitoring service in production
    console.error('Application Error Boundary caught error:', {
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
      },
      errorInfo: {
        componentStack: errorInfo.componentStack,
      },
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    });

    this.setState({ errorInfo });

    // In production, send to error tracking service
    if (import.meta.env.PROD) {
      // Example: Sentry, LogRocket, or custom error tracking
      // errorTrackingService.captureException(error, { extra: errorInfo });
    }
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-soft p-8">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-error-100 rounded-full mb-4">
              <svg
                className="w-6 h-6 text-error-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-neutral-900 text-center mb-2">
              Something went wrong
            </h1>
            <p className="text-neutral-600 text-center mb-6">
              We apologize for the inconvenience. The application encountered an unexpected error.
            </p>
            {import.meta.env.DEV && this.state.error && (
              <div className="mb-6 p-4 bg-neutral-100 rounded-lg overflow-auto max-h-48">
                <p className="text-sm font-mono text-error-700 mb-2">
                  {this.state.error.message}
                </p>
                {this.state.error.stack && (
                  <pre className="text-xs text-neutral-600 whitespace-pre-wrap">
                    {this.state.error.stack}
                  </pre>
                )}
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                Return to Home
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 px-4 py-2 bg-neutral-200 text-neutral-700 rounded-lg hover:bg-neutral-300 transition-colors font-medium"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Lazy-loaded App component for code splitting
 * Reduces initial bundle size and improves load performance
 */
const App = React.lazy(() =>
  import('./App').catch((error) => {
    console.error('Failed to load App component:', {
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    // Return fallback component on chunk load failure
    return {
      default: () => (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-soft p-8 text-center">
            <h1 className="text-2xl font-bold text-neutral-900 mb-4">
              Failed to Load Application
            </h1>
            <p className="text-neutral-600 mb-6">
              Unable to load the application. Please check your internet connection and try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              Retry
            </button>
          </div>
        </div>
      ),
    };
  })
);

/**
 * Loading fallback component displayed during lazy component loading
 * Provides visual feedback to users during code splitting
 */
const LoadingFallback: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-neutral-50">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600 mb-4"></div>
      <p className="text-neutral-600 font-medium">Loading application...</p>
    </div>
  </div>
);

/**
 * Root element validation and initialization
 * Ensures DOM is ready before React rendering
 */
const rootElement = document.getElementById('root');

if (!rootElement) {
  const errorMessage = 'Failed to find root element. Ensure index.html contains <div id="root"></div>';
  console.error(errorMessage);
  throw new Error(errorMessage);
}

/**
 * Initialize React application with StrictMode for development checks
 * StrictMode enables additional checks and warnings for descendants
 */
const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <React.Suspense fallback={<LoadingFallback />}>
          <App />
        </React.Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);

/**
 * Global error handler for unhandled promise rejections
 * Logs errors for monitoring and debugging
 */
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled Promise Rejection:', {
    reason: event.reason,
    promise: event.promise,
    timestamp: new Date().toISOString(),
    url: window.location.href,
  });

  // Prevent default browser behavior
  event.preventDefault();

  // In production, send to error tracking service
  if (import.meta.env.PROD) {
    // errorTrackingService.captureException(event.reason);
  }
});

/**
 * Global error handler for uncaught errors
 * Provides last line of defense for error tracking
 */
window.addEventListener('error', (event) => {
  console.error('Uncaught Error:', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error,
    timestamp: new Date().toISOString(),
  });

  // In production, send to error tracking service
  if (import.meta.env.PROD) {
    // errorTrackingService.captureException(event.error);
  }
});

/**
 * Performance monitoring for Core Web Vitals
 * Tracks key performance metrics in production
 */
if (import.meta.env.PROD && 'PerformanceObserver' in window) {
  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        console.log('Performance Metric:', {
          name: entry.name,
          value: entry.startTime,
          timestamp: new Date().toISOString(),
        });
        // Send to analytics service
        // analyticsService.trackPerformance(entry);
      }
    });

    observer.observe({ entryTypes: ['navigation', 'paint', 'largest-contentful-paint'] });
  } catch (error) {
    console.warn('Performance monitoring not available:', error);
  }
}