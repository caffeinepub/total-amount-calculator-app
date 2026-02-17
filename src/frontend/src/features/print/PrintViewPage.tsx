import { useEffect, useState, useRef } from 'react';
import { getBillById, SavedBillRecord } from '../calculator/savedBills';
import { formatCurrency } from '../calculator/format';
import { calculateLineTotal } from '../calculator/utils';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';

type ViewState = 'loading' | 'readyToPrint' | 'completed' | 'error';

export function PrintViewPage() {
  const [bill, setBill] = useState<SavedBillRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [viewState, setViewState] = useState<ViewState>('loading');
  const [showManualPrint, setShowManualPrint] = useState(false);
  
  // Refs to prevent duplicate print attempts and cleanup
  const printAttemptedRef = useRef(false);
  const completionHandledRef = useRef(false);
  const timersRef = useRef<{ print?: NodeJS.Timeout; manual?: NodeJS.Timeout }>({});

  useEffect(() => {
    // Get bill ID from URL query parameter
    const params = new URLSearchParams(window.location.search);
    const billId = params.get('id');

    if (!billId) {
      setError('Bill not found');
      setViewState('error');
      return;
    }

    // Load bill from localStorage
    const loadedBill = getBillById(billId);
    
    if (!loadedBill) {
      setError('Bill not found');
      setViewState('error');
      return;
    }

    setBill(loadedBill);
    setViewState('readyToPrint');

    // Trigger print dialog after a short delay to ensure rendering is complete
    // Guard against multiple print attempts
    if (!printAttemptedRef.current) {
      printAttemptedRef.current = true;
      timersRef.current.print = setTimeout(() => {
        window.print();
      }, 500);

      // Show manual print button if auto-print doesn't work within 3 seconds
      timersRef.current.manual = setTimeout(() => {
        setShowManualPrint(true);
      }, 3500);
    }

    return () => {
      if (timersRef.current.print) clearTimeout(timersRef.current.print);
      if (timersRef.current.manual) clearTimeout(timersRef.current.manual);
    };
  }, []);

  useEffect(() => {
    if (viewState !== 'readyToPrint') return;

    // Listen for print dialog completion
    const handleAfterPrint = () => {
      // Guard against multiple completion handlers
      if (completionHandledRef.current) return;
      completionHandledRef.current = true;

      // Transition to completed state
      setViewState('completed');

      // Attempt to close the tab
      window.close();

      // If window.close() is blocked (tab remains open), the UI will show the completion screen
      // because viewState is now 'completed'
    };

    // Listen for both afterprint event and media query change
    window.addEventListener('afterprint', handleAfterPrint);

    // Fallback: also listen to print media query changes
    const printMediaQuery = window.matchMedia('print');
    const handleMediaChange = (e: MediaQueryListEvent) => {
      if (!e.matches && viewState === 'readyToPrint') {
        // User has exited print mode
        handleAfterPrint();
      }
    };

    printMediaQuery.addEventListener('change', handleMediaChange);

    return () => {
      window.removeEventListener('afterprint', handleAfterPrint);
      printMediaQuery.removeEventListener('change', handleMediaChange);
    };
  }, [viewState]);

  const handleManualPrint = () => {
    setShowManualPrint(false);
    window.print();
  };

  const handleBackToCalculator = () => {
    // Navigate back to calculator without print mode
    window.location.href = `${window.location.origin}${window.location.pathname}`;
  };

  // Show completion screen after printing
  if (viewState === 'completed') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md p-8">
          <div className="mb-4">
            <svg
              className="w-16 h-16 mx-auto text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">Printing Complete</h1>
          <p className="text-muted-foreground mb-4">You can close this tab.</p>
          <Button onClick={handleBackToCalculator} variant="outline">
            Back to Calculator
          </Button>
        </div>
      </div>
    );
  }

  if (viewState === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md p-8">
          <h1 className="text-2xl font-bold text-destructive mb-2">Error</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={handleBackToCalculator}>
            Back to Calculator
          </Button>
        </div>
      </div>
    );
  }

  if (viewState === 'loading' || !bill) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground">Loading bill...</p>
        </div>
      </div>
    );
  }

  const printDate = new Date(bill.timestamp).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const isClassicStyle = bill.billFormatSnapshot.receiptStyle === 'classic';

  return (
    <>
      {/* Manual Print Help Panel - Hidden during print */}
      {showManualPrint && (
        <div className="no-print fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-background border border-border rounded-lg shadow-lg p-4 max-w-md">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-3">
              Print dialog didn't appear? Click the button below to print manually.
            </p>
            <Button onClick={handleManualPrint} className="gap-2">
              <Printer className="h-4 w-4" />
              Print Bill
            </Button>
          </div>
        </div>
      )}

      <div className={`max-w-3xl mx-auto p-8 bg-white text-black ${isClassicStyle ? 'classic-receipt' : 'compact-receipt'}`}>
        {/* Header */}
        <div className={`text-center mb-6 ${isClassicStyle ? 'border-b-2 border-black pb-4' : 'border-b border-gray-400 pb-3'}`}>
          <h1 className={`font-bold mb-2 ${isClassicStyle ? 'text-3xl' : 'text-2xl'}`}>Varshini Classic Cuisine</h1>
          <p className={`${isClassicStyle ? 'text-sm' : 'text-xs'}`}>Bill Receipt</p>
          <p className={`mt-2 ${isClassicStyle ? 'text-xs' : 'text-xs text-gray-600'}`}>{printDate}</p>
          <p className={`font-semibold mt-1 ${isClassicStyle ? 'text-sm' : 'text-xs'}`}>Bill Code: {bill.billCode}</p>
        </div>

        {/* Payment Scan (if present) */}
        {bill.billFormatSnapshot.paymentScanDataUrl && (
          <div className={`mb-6 ${isClassicStyle ? '' : 'mb-4'}`}>
            <img
              src={bill.billFormatSnapshot.paymentScanDataUrl}
              alt="Payment information"
              className="w-full max-h-48 object-contain border border-gray-300 rounded"
            />
          </div>
        )}

        {/* Print Location Address (if present) */}
        {bill.billFormatSnapshot.printLocationAddress && (
          <div className={`mb-6 ${isClassicStyle ? 'p-3 border border-gray-400 rounded' : 'p-2 bg-gray-50 text-xs'}`}>
            <p className={`font-semibold ${isClassicStyle ? 'text-sm mb-1' : 'text-xs mb-0.5'}`}>Print Location:</p>
            <p className={`${isClassicStyle ? 'text-sm' : 'text-xs'}`}>{bill.billFormatSnapshot.printLocationAddress}</p>
          </div>
        )}

        {/* Line Items Table */}
        <table className={`w-full border-collapse ${isClassicStyle ? 'mb-6' : 'mb-4'}`}>
          <thead>
            <tr className={`${isClassicStyle ? 'border-b-2 border-black' : 'border-b border-gray-400'}`}>
              <th className={`text-left py-2 px-2 ${isClassicStyle ? '' : 'text-sm'}`}>Item</th>
              <th className={`text-center py-2 px-2 ${isClassicStyle ? '' : 'text-sm'}`}>Qty</th>
              <th className={`text-right py-2 px-2 ${isClassicStyle ? '' : 'text-sm'}`}>Unit Price</th>
              <th className={`text-right py-2 px-2 ${isClassicStyle ? '' : 'text-sm'}`}>Total</th>
            </tr>
          </thead>
          <tbody>
            {bill.lineItems
              .filter((item) => item.label.trim() !== '' && item.quantity > 0)
              .map((item, index) => (
                <tr key={index} className={`${isClassicStyle ? 'border-b border-gray-300' : 'border-b border-gray-200'}`}>
                  <td className={`py-2 px-2 ${isClassicStyle ? '' : 'text-sm'}`}>{item.label}</td>
                  <td className={`text-center py-2 px-2 ${isClassicStyle ? '' : 'text-sm'}`}>{item.quantity}</td>
                  <td className={`text-right py-2 px-2 ${isClassicStyle ? '' : 'text-sm'}`}>{formatCurrency(item.unitPrice)}</td>
                  <td className={`text-right py-2 px-2 font-medium ${isClassicStyle ? '' : 'text-sm'}`}>
                    {formatCurrency(calculateLineTotal(item.quantity, item.unitPrice))}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>

        {/* Totals Breakdown */}
        <div className={`${isClassicStyle ? 'border-t-2 border-black pt-4' : 'border-t border-gray-400 pt-3'}`}>
          <div className={`flex justify-between ${isClassicStyle ? 'mb-2' : 'mb-1.5 text-sm'}`}>
            <span>Subtotal:</span>
            <span className="font-medium">{formatCurrency(bill.breakdown.subtotal)}</span>
          </div>
          <div className={`flex justify-between ${isClassicStyle ? 'mb-2' : 'mb-1.5 text-sm'}`}>
            <span>Tax ({bill.taxRate}%):</span>
            <span className="font-medium">+{formatCurrency(bill.breakdown.taxAmount)}</span>
          </div>
          <div className={`flex justify-between ${isClassicStyle ? 'mb-2' : 'mb-1.5 text-sm'}`}>
            <span>
              Discount ({bill.discountType === 'percentage' ? `${bill.discountValue}%` : '₹'}):
            </span>
            <span className="font-medium">-{formatCurrency(bill.breakdown.discountAmount)}</span>
          </div>
          <div className={`flex justify-between font-bold ${isClassicStyle ? 'text-xl border-t-2 border-black pt-4 mt-4' : 'text-lg border-t border-gray-400 pt-2 mt-2'}`}>
            <span>Final Total:</span>
            <span>{formatCurrency(bill.breakdown.finalTotal)}</span>
          </div>
        </div>

        {/* Footer */}
        <div className={`text-center ${isClassicStyle ? 'mt-8 pt-4 border-t border-gray-300' : 'mt-6 pt-3 border-t border-gray-200'}`}>
          <p className="text-xs">Thank you for dining with us!</p>
        </div>
      </div>
    </>
  );
}
