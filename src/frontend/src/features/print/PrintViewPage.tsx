import { useEffect, useState, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { getBillById, SavedBillRecord } from '../calculator/savedBills';
import { formatCurrency } from '../calculator/format';
import { Button } from '@/components/ui/button';
import { Printer, ArrowLeft } from 'lucide-react';
import { RECEIPT_STYLES } from '../optimizeBill/receiptStyles';
import { getActiveBranch } from '@/utils/branchScopedStorage';

export function PrintViewPage() {
  const navigate = useNavigate();
  const [bill, setBill] = useState<SavedBillRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [printAttempted, setPrintAttempted] = useState(false);
  const printTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    // Parse URL parameters
    const params = new URLSearchParams(window.location.search);
    const billId = params.get('id');
    const shouldPrint = params.get('print') === 'true';
    const branchParam = params.get('branch');

    if (!billId) {
      setError('No bill ID provided');
      return;
    }

    // Determine which branch to load from
    // Priority: URL branch param > stored branch in localStorage
    const targetBranch = branchParam || getActiveBranch();
    
    if (!targetBranch) {
      setError('No branch context available');
      return;
    }

    // Load bill from branch-scoped storage
    const loadedBill = getBillById(billId, targetBranch);

    if (!loadedBill) {
      setError('Bill not found');
      return;
    }

    setBill(loadedBill);

    // Auto-print once after bill loads (guarded by printAttempted flag)
    if (shouldPrint && !printAttempted) {
      setPrintAttempted(true);
      
      // Delay print to ensure rendering is complete
      printTimeoutRef.current = window.setTimeout(() => {
        window.print();
      }, 500);
    }

    // Cleanup timeout on unmount
    return () => {
      if (printTimeoutRef.current !== null) {
        window.clearTimeout(printTimeoutRef.current);
      }
    };
  }, [printAttempted]);

  const handleManualPrint = () => {
    window.print();
  };

  const handleBackToCalculator = () => {
    navigate({ to: '/' });
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-destructive">Error</h2>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={handleBackToCalculator} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Calculator
          </Button>
        </div>
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading bill...</p>
      </div>
    );
  }

  // Get receipt style configuration
  const receiptStyle = RECEIPT_STYLES.find(
    (style) => style.id === bill.billFormatSnapshot.receiptStyle
  ) || RECEIPT_STYLES[0];

  const isCompact = receiptStyle.id === 'compact';

  return (
    <div className="min-h-screen bg-background">
      {/* Print Controls - Hidden during print */}
      <div className="no-print sticky top-0 z-10 bg-background border-b p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <Button onClick={handleBackToCalculator} variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Calculator
          </Button>
          <div className="flex items-center gap-4">
            <p className="text-sm text-muted-foreground">
              If the print dialog didn't appear, click the button →
            </p>
            <Button onClick={handleManualPrint} className="gap-2">
              <Printer className="h-4 w-4" />
              Print Bill
            </Button>
          </div>
        </div>
      </div>

      {/* Bill Content - Visible during print */}
      <div className={`print-bill-container ${isCompact ? 'compact' : 'classic'}`}>
        <div className="print-bill-content">
          {/* Header */}
          <div className="print-bill-header">
            <h1 className="print-bill-title">Varshini Classic Cuisine</h1>
            {bill.billFormatSnapshot.printLocationAddress && (
              <p className="print-bill-location">{bill.billFormatSnapshot.printLocationAddress}</p>
            )}
            <div className="print-bill-meta">
              <p>Bill: {bill.billCode}</p>
              <p>{new Date(bill.timestamp).toLocaleString('en-IN')}</p>
            </div>
          </div>

          {/* Line Items Table */}
          <table className="print-bill-table">
            <thead>
              <tr>
                <th className="text-left">Item</th>
                <th className="text-center">Qty</th>
                <th className="text-right">Price</th>
                <th className="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {bill.lineItems.map((item, index) => (
                <tr key={index}>
                  <td>{item.label}</td>
                  <td className="text-center">{item.quantity}</td>
                  <td className="text-right">{formatCurrency(item.unitPrice)}</td>
                  <td className="text-right">
                    {formatCurrency(item.quantity * item.unitPrice)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals Breakdown */}
          <div className="print-bill-totals">
            <div className="print-bill-totals-row">
              <span>Subtotal:</span>
              <span>{formatCurrency(bill.breakdown.subtotal)}</span>
            </div>
            {bill.breakdown.taxAmount > 0 && (
              <div className="print-bill-totals-row">
                <span>Tax ({bill.taxRate}%):</span>
                <span>+{formatCurrency(bill.breakdown.taxAmount)}</span>
              </div>
            )}
            {bill.breakdown.discountAmount > 0 && (
              <div className="print-bill-totals-row">
                <span>
                  Discount (
                  {bill.discountType === 'percentage'
                    ? `${bill.discountValue}%`
                    : formatCurrency(bill.discountValue)}
                  ):
                </span>
                <span>-{formatCurrency(bill.breakdown.discountAmount)}</span>
              </div>
            )}
            <div className="print-bill-totals-row print-bill-total-final">
              <span>Total:</span>
              <span>{formatCurrency(bill.breakdown.finalTotal)}</span>
            </div>
          </div>

          {/* Payment Scan Image */}
          {bill.billFormatSnapshot.paymentScanDataUrl && (
            <div className="print-bill-payment-scan">
              <img
                src={bill.billFormatSnapshot.paymentScanDataUrl}
                alt="Payment information"
                className="print-bill-payment-image"
              />
            </div>
          )}

          {/* Footer */}
          <div className="print-bill-footer">
            <p>Thank you for your business!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
