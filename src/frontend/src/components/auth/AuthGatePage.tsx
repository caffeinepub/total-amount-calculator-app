import React from 'react';
import { BranchLoginForm } from './BranchLoginForm';
import LoginButton from './LoginButton';

export function AuthGatePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-primary">Varshini Classic Cuisine</h1>
          <p className="text-muted-foreground">Branch Management System</p>
        </div>

        <BranchLoginForm />

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Optional</span>
          </div>
        </div>

        <div className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            You can also connect with Internet Identity for additional features
          </p>
          <LoginButton />
        </div>
      </div>

      <footer className="mt-12 text-center text-sm text-muted-foreground">
        <p>
          © {new Date().getFullYear()} Varshini Classic Cuisine. Built with ❤️ using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
