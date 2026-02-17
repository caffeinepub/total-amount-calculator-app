import { BranchLoginForm } from './BranchLoginForm';
import LoginButton from './LoginButton';
import { Calculator } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export function AuthGatePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="p-3 rounded-xl bg-primary/10">
              <Calculator className="h-10 w-10 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Varshini Classic Cuisine</h1>
          <p className="text-muted-foreground">Restaurant Management System</p>
        </div>

        {/* Login Options */}
        <div className="bg-card rounded-lg border p-6 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">Branch Login</h2>
              <p className="text-sm text-muted-foreground">
                Login with your branch credentials
              </p>
            </div>
            <BranchLoginForm />
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">Internet Identity</h2>
              <p className="text-sm text-muted-foreground">
                Login with your Internet Identity
              </p>
            </div>
            <div className="flex justify-center">
              <LoginButton />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} Built with ❤️ using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                typeof window !== 'undefined' ? window.location.hostname : 'varshini-classic-cuisine'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
