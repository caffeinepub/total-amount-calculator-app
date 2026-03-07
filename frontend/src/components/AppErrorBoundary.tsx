import React, { Component, ReactNode } from 'react';
import { CrashFallbackScreen } from './CrashFallbackScreen';

interface AppErrorBoundaryProps {
  children: ReactNode;
  externalError?: string | null;
}

interface AppErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  constructor(props: AppErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('React Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    // Show external error (e.g., from startup failure handler)
    if (this.props.externalError) {
      return <CrashFallbackScreen error={this.props.externalError} />;
    }

    // Show caught render error
    if (this.state.hasError) {
      return <CrashFallbackScreen error={this.state.error} />;
    }

    return this.props.children;
  }
}
