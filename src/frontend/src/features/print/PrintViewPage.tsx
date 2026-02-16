import { useEffect, useState } from 'react';
import { getBillById, SavedBillRecord } from '../calculator/savedBills';
import { formatCurrency } from '../calculator/format';
import { calculateLineTotal } from '../calculator/utils';

type ViewState = 'loading' | 'readyToPrint' | 'completed' | 'error';

export function PrintViewPage() {
  const [bill, setBill] = useState<SavedBillRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [viewState, setViewState] = useState<ViewState>('loading');

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
    const timer = setTimeout(() => {
      window.print();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (viewState !== 'readyToPrint') return;

    // Listen for print dialog completion
    const handleAfterPrint = () => {
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
          <p className="text-muted-foreground">You can close this tab.</p>
        </div>
      </div>
    );
  }

  if (viewState === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-2">Error</h1>
          <p className="text-muted-foreground">{error}</p>
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

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white text-black">
      {/* Header */}
      <div className="text-center mb-8 border-b-2 border-black pb-4">
        <h1 className="text-3xl font-bold mb-2">Varshini Classic Cuisine</h1>
        <p className="text-sm">Bill Receipt</p>
        <p className="text-xs mt-2">{printDate}</p>
      </div>

      {/* Line Items Table */}
      <table className="w-full mb-6 border-collapse">
        <thead>
          <tr className="border-b-2 border-black">
            <th className="text-left py-2 px-2">Item</th>
            <th className="text-center py-2 px-2">Qty</th>
            <th className="text-right py-2 px-2">Unit Price</th>
            <th className="text-right py-2 px-2">Total</th>
          </tr>
        </thead>
        <tbody>
          {bill.lineItems
            .filter((item) => item.label.trim() !== '' && item.quantity > 0)
            .map((item, index) => (
              <tr key={index} className="border-b border-gray-300">
                <td className="py-2 px-2">{item.label}</td>
                <td className="text-center py-2 px-2">{item.quantity}</td>
                <td className="text-right py-2 px-2">{formatCurrency(item.unitPrice)}</td>
                <td className="text-right py-2 px-2 font-medium">
                  {formatCurrency(calculateLineTotal(item.quantity, item.unitPrice))}
                </td>
              </tr>
            ))}
        </tbody>
      </table>

      {/* Totals Breakdown */}
      <div className="border-t-2 border-black pt-4">
        <div className="flex justify-between mb-2">
          <span>Subtotal:</span>
          <span className="font-medium">{formatCurrency(bill.breakdown.subtotal)}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span>Tax ({bill.taxRate}%):</span>
          <span className="font-medium">+{formatCurrency(bill.breakdown.taxAmount)}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span>
            Discount ({bill.discountType === 'percentage' ? `${bill.discountValue}%` : '₹'}):
          </span>
          <span className="font-medium">-{formatCurrency(bill.breakdown.discountAmount)}</span>
        </div>
        <div className="flex justify-between text-xl font-bold border-t-2 border-black pt-4 mt-4">
          <span>Final Total:</span>
          <span>{formatCurrency(bill.breakdown.finalTotal)}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center mt-8 pt-4 border-t border-gray-300">
        <p className="text-xs">Thank you for dining with us!</p>
      </div>
    </div>
  );
}
