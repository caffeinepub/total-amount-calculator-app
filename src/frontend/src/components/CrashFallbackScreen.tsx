import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

interface CrashFallbackScreenProps {
  error?: Error | string | null;
  componentStack?: string;
}

export function CrashFallbackScreen({ error, componentStack }: CrashFallbackScreenProps) {
  const errorMessage = error instanceof Error ? error.message : typeof error === 'string' ? error : 'An unexpected error occurred';
  const errorStack = error instanceof Error ? error.stack : undefined;

  const handleReload = () => {
    // Clear any potentially corrupted localStorage data
    try {
      const keysToPreserve = ['branchAuthUser'];
      const preservedData: Record<string, string> = {};
      
      keysToPreserve.forEach(key => {
        const value = localStorage.getItem(key);
        if (value) {
          preservedData[key] = value;
        }
      });

      localStorage.clear();

      Object.entries(preservedData).forEach(([key, value]) => {
        localStorage.setItem(key, value);
      });
    } catch (e) {
      console.error('Failed to clear localStorage:', e);
    }

    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Application Error</AlertTitle>
          <AlertDescription className="space-y-2">
            <p className="font-semibold">{errorMessage}</p>
            {errorStack && (
              <details className="mt-2">
                <summary className="cursor-pointer text-sm hover:underline">Show error details</summary>
                <pre className="mt-2 text-xs overflow-auto max-h-40 bg-destructive/10 p-2 rounded">
                  {errorStack}
                </pre>
              </details>
            )}
            {componentStack && (
              <details className="mt-2">
                <summary className="cursor-pointer text-sm hover:underline">Show component stack</summary>
                <pre className="mt-2 text-xs overflow-auto max-h-40 bg-destructive/10 p-2 rounded">
                  {componentStack}
                </pre>
              </details>
            )}
          </AlertDescription>
        </Alert>
        
        <div className="text-sm text-muted-foreground text-center space-y-2">
          <p>The application encountered an error and cannot continue.</p>
          <p>Please check the browser console for more details.</p>
          <p className="text-xs">Environment: {import.meta.env.MODE || 'production'}</p>
          <button
            onClick={handleReload}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Reload Application
          </button>
        </div>
      </div>
    </div>
  );
}
