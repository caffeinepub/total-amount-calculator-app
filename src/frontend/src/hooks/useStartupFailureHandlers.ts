import { useEffect, useState } from 'react';

export function useStartupFailureHandlers() {
  const [startupError, setStartupError] = useState<string | null>(null);

  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      console.error('Promise:', event.promise);
      
      let errorMessage = 'An unhandled promise rejection occurred';
      
      if (event.reason instanceof Error) {
        errorMessage = event.reason.message;
        console.error('Error stack:', event.reason.stack);
      } else if (typeof event.reason === 'string') {
        errorMessage = event.reason;
      } else if (event.reason && typeof event.reason === 'object') {
        errorMessage = JSON.stringify(event.reason);
      }
      
      setStartupError(errorMessage);
      
      // Prevent default browser error handling
      event.preventDefault();
    };

    const handleError = (event: ErrorEvent) => {
      console.error('Unhandled error:', event.error);
      console.error('Message:', event.message);
      console.error('Filename:', event.filename);
      console.error('Line:', event.lineno, 'Column:', event.colno);
      
      const errorMessage = event.error instanceof Error 
        ? event.error.message 
        : event.message || 'An unhandled error occurred';
      
      setStartupError(errorMessage);
      
      // Prevent default browser error handling
      event.preventDefault();
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
