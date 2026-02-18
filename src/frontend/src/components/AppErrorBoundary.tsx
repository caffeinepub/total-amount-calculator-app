import React, { Component, ReactNode } from 'react';
import { CrashFallbackScreen } from './CrashFallbackScreen';

interface AppErrorBoundaryProps {
  children: ReactNode;
  externalError?: string | null;
}

interface AppErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  constructor(props: AppErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<AppErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('React Error Boundary caught an error:', error);
    console.error('Component stack:', errorInfo.componentStack);
    console.error('Error stack:', error.stack);
    
    this.setState({ errorInfo });
  }

  render() {
    // Show external error (e.g., from startup failure handler)
    if (this.props.externalError) {
      return <CrashFallbackScreen error={this.props.externalError} />;
    }

    // Show caught render error
    if (this.state.hasError && this.state.error) {
      return (
        <CrashFallbackScreen 
          error={this.state.error} 
          componentStack={this.state.errorInfo?.componentStack ?? undefined}
        />
      );
    }

    return this.props.children;
  }
}
