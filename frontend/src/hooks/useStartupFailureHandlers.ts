import { useEffect, useState } from 'react';

export function useStartupFailureHandlers() {
  const [startupError, setStartupError] = useState<string | null>(null);

  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      
      const errorMessage = event.reason instanceof Error 
        ? event.reason.message 
        : typeof event.reason === 'string' 
        ? event.reason 
        : 'An unhandled promise rejection occurred';
      
      setStartupError(errorMessage);
    };

    const handleError = (event: ErrorEvent) => {
      console.error('Unhandled error:', event.error);
      
      const errorMessage = event.error instanceof Error 
        ? event.error.message 
        : event.message || 'An unhandled error occurred';
      
      setStartupError(errorMessage);
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);

  return startupError;
}
