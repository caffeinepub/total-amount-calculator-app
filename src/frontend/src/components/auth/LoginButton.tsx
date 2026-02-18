import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useState } from 'react';

export default function LoginButton() {
  const { login, clear, loginStatus, identity, loginError } = useInternetIdentity();
  const queryClient = useQueryClient();
  const [userVisibleError, setUserVisibleError] = useState<string | null>(null);

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';
  const disabled = isLoggingIn;

  const handleAuth = async () => {
    // Clear any previous errors
    setUserVisibleError(null);

    if (isAuthenticated) {
      try {
        await clear();
        queryClient.clear();
      } catch (error: any) {
        console.error('Logout error:', error);
        setUserVisibleError('Failed to logout. Please try again.');
      }
    } else {
      try {
        await login();
        // Clear error on successful login
        setUserVisibleError(null);
      } catch (error: any) {
        console.error('Login error:', error);
        
        // Handle specific error cases
        if (error.message === 'User is already authenticated') {
          try {
            await clear();
            setTimeout(() => login(), 300);
          } catch (clearError) {
            setUserVisibleError('Authentication state error. Please refresh the page.');
          }
        } else if (error.message?.includes('AuthClient is not initialized')) {
          setUserVisibleError('Login system is still initializing. Please wait a moment and try again.');
        } else if (error.message?.includes('Identity not found')) {
          setUserVisibleError('Login failed. Please try again.');
        } else {
          setUserVisibleError('Login failed. Please check your connection and try again.');
        }
      }
    }
  };

  // Show error from hook if present
  const displayError = userVisibleError || (loginError ? loginError.message : null);

  return (
    <div className="flex flex-col gap-2">
      <Button
        onClick={handleAuth}
        disabled={disabled}
        variant={isAuthenticated ? 'outline' : 'default'}
        size="sm"
        className="gap-2"
      >
        {isLoggingIn ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Logging in...
          </>
        ) : isAuthenticated ? (
          <>
            <LogOut className="h-4 w-4" />
            Logout
          </>
        ) : (
          <>
            <LogIn className="h-4 w-4" />
            Login
          </>
        )}
      </Button>
      
      {displayError && !isLoggingIn && (
        <Alert variant="destructive" className="text-xs py-2">
          <AlertCircle className="h-3 w-3" />
          <AlertDescription className="text-xs">
            {displayError}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
