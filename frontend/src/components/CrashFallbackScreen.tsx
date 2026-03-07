import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

interface CrashFallbackScreenProps {
  error?: Error | string | null;
}

export function CrashFallbackScreen({ error }: CrashFallbackScreenProps) {
  const errorMessage = error instanceof Error ? error.message : typeof error === 'string' ? error : 'An unexpected error occurred';

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Application Error</AlertTitle>
          <AlertDescription>
            {errorMessage}
          </AlertDescription>
        </Alert>
        
        <div className="text-sm text-muted-foreground text-center space-y-2">
          <p>The application encountered an error and cannot continue.</p>
          <p>Please check the browser console for more details.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Reload Application
          </button>
        </div>
      </div>
    </div>
  );
}
