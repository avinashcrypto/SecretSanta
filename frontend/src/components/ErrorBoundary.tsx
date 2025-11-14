import React, { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full">
            <div className="text-center space-y-6">
              {/* Error Icon */}
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-red-500 blur-3xl opacity-20 animate-pulse" />
                <AlertTriangle className="relative w-20 h-20 mx-auto text-red-500" />
              </div>

              {/* Error Title */}
              <div>
                <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
                  Oops! Something went wrong
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  We're sorry for the inconvenience. An unexpected error has occurred.
                </p>
              </div>

              {/* Error Details (Development only) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="text-left">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-red-500 transition-colors">
                    Show error details (Development Mode)
                  </summary>
                  <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                    <p className="text-sm font-mono text-red-600 dark:text-red-400 mb-2">
                      {this.state.error.toString()}
                    </p>
                    {this.state.errorInfo && (
                      <pre className="text-xs text-gray-600 dark:text-gray-400 overflow-auto max-h-40">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    )}
                  </div>
                </details>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={this.handleReset}
                  className="w-full sm:w-auto"
                >
                  <RefreshCw className="w-5 h-5" />
                  Try Again
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={this.handleReload}
                  className="w-full sm:w-auto"
                >
                  <RefreshCw className="w-5 h-5" />
                  Reload Page
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={this.handleGoHome}
                  className="w-full sm:w-auto"
                >
                  <Home className="w-5 h-5" />
                  Go Home
                </Button>
              </div>

              {/* Help Text */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  If this problem persists, please{' '}
                  <a
                    href="https://github.com/your-repo/issues"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-santa-500 hover:text-santa-600 font-medium transition-colors"
                  >
                    report the issue
                  </a>
                  .
                </p>
              </div>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook version for functional components
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return setError;
}
