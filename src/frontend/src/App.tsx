import React from 'react';
import { useBranchAuth } from './hooks/useBranchAuth';
import TotalAmountCalculatorPage from './features/calculator/TotalAmountCalculatorPage';
import { BalanceSheetView } from './features/balanceSheet/BalanceSheetView';
import { OptimizeBillPage } from './features/optimizeBill/OptimizeBillPage';
import { PrintViewPage } from './features/print/PrintViewPage';
import { AuthGatePage } from './components/auth/AuthGatePage';
import { BranchSessionControl } from './components/auth/BranchSessionControl';
import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet, Link } from '@tanstack/react-router';

function Layout() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b border-border bg-card print:hidden">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">Varshini Classic Cuisine</h1>
          <nav className="flex items-center gap-4">
            <Link
              to="/"
              className="px-4 py-2 rounded-md hover:bg-accent transition-colors"
              activeProps={{ className: 'bg-accent' }}
            >
              Calculator
            </Link>
            <Link
              to="/balance-sheet"
              className="px-4 py-2 rounded-md hover:bg-accent transition-colors"
              activeProps={{ className: 'bg-accent' }}
            >
              Balance Sheet
            </Link>
            <Link
              to="/optimize-bill"
              className="px-4 py-2 rounded-md hover:bg-accent transition-colors"
              activeProps={{ className: 'bg-accent' }}
            >
              Optimize Bill
            </Link>
            <BranchSessionControl />
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-border bg-card py-6 print:hidden">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
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
        </div>
      </footer>
    </div>
  );
}

const rootRoute = createRootRoute({
  component: Layout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: TotalAmountCalculatorPage,
});

const balanceSheetRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/balance-sheet',
  component: BalanceSheetView,
});

const optimizeBillRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/optimize-bill',
  component: OptimizeBillPage,
});

const printViewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/print',
  component: PrintViewPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  balanceSheetRoute,
  optimizeBillRoute,
  printViewRoute,
]);

let router: ReturnType<typeof createRouter> | null = null;

try {
  router = createRouter({ routeTree });
} catch (error) {
  console.error('Failed to create router:', error);
}

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

function AppContent() {
  const { isAuthenticated } = useBranchAuth();

  if (!isAuthenticated) {
    return <AuthGatePage />;
  }

  if (!router) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-4">
          <h2 className="text-2xl font-bold text-destructive">Router Initialization Failed</h2>
          <p className="text-muted-foreground">The application router could not be initialized. Please check the console for details.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Reload Application
          </button>
        </div>
      </div>
    );
  }

  return <RouterProvider router={router} />;
}

export default function App() {
  return <AppContent />;
}
