import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Calculator, TrendingUp, Settings } from 'lucide-react';
import TotalAmountCalculatorPage from './features/calculator/TotalAmountCalculatorPage';
import { BalanceSheetView } from './features/balanceSheet/BalanceSheetView';
import { PrintViewPage } from './features/print/PrintViewPage';
import { GuidanceNoticeBar } from './components/GuidanceNoticeBar';
import { OptimizeBillPage } from './features/optimizeBill/OptimizeBillPage';
import { useEffect, useState } from 'react';
import { Button } from './components/ui/button';
import LoginButton from './components/auth/LoginButton';
import { useSyncBillPrintLocation } from './features/optimizeBill/useSyncBillPrintLocation';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useBranchAuth, BranchAuthProvider } from './hooks/useBranchAuth';
import { AuthGatePage } from './components/auth/AuthGatePage';
import { BranchSessionControl } from './components/auth/BranchSessionControl';

const queryClient = new QueryClient();

type ViewMode = 'calculator' | 'dailyTotals' | 'optimizeBill';

function AppContent() {
  const [isPrintView, setIsPrintView] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('calculator');
  const { identity } = useInternetIdentity();
  const { isAuthenticated: branchAuthenticated } = useBranchAuth();

  // Sync bill print location from backend when authenticated
  useSyncBillPrintLocation();

  useEffect(() => {
    // Check if this is a print view request
    const params = new URLSearchParams(window.location.search);
    setIsPrintView(params.get('print') === 'true');
  }, []);

  // Render print view without header/footer/guidance
  if (isPrintView) {
    return <PrintViewPage />;
  }

  // Check overall authentication state
  const isAuthenticated = !!identity || branchAuthenticated;

  // Show login gate if not authenticated
  if (!isAuthenticated) {
    return <AuthGatePage />;
  }

  // Normal app view
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      {/* Guidance Notice Bar */}
      <GuidanceNoticeBar />

      {/* Header */}
      <header className="no-print border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Calculator className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Varshini Classic Cuisine</h1>
                <p className="text-sm text-muted-foreground">Restaurant Management System</p>
              </div>
            </div>
            
            {/* View Toggle Buttons and Login */}
            <div className="flex gap-2 items-center">
              <Button
                variant={viewMode === 'calculator' ? 'default' : 'outline'}
                onClick={() => setViewMode('calculator')}
                className="gap-2"
              >
                <Calculator className="h-4 w-4" />
                Calculator
              </Button>
              <Button
                variant={viewMode === 'dailyTotals' ? 'default' : 'outline'}
                onClick={() => setViewMode('dailyTotals')}
                className="gap-2"
              >
                <TrendingUp className="h-4 w-4" />
                Daily Totals
              </Button>
              <Button
                variant={viewMode === 'optimizeBill' ? 'default' : 'outline'}
                onClick={() => setViewMode('optimizeBill')}
                className="gap-2"
              >
                <Settings className="h-4 w-4" />
                Optimize Bill
              </Button>
              <div className="ml-2 pl-2 border-l flex items-center gap-2">
                <BranchSessionControl />
                <LoginButton />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {viewMode === 'calculator' ? (
          <TotalAmountCalculatorPage />
        ) : viewMode === 'dailyTotals' ? (
          <BalanceSheetView />
        ) : (
          <OptimizeBillPage />
        )}
      </main>

      {/* Footer */}
      <footer className="no-print border-t mt-16 py-8 bg-card/30">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
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
      </footer>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BranchAuthProvider>
        <AppContent />
      </BranchAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
