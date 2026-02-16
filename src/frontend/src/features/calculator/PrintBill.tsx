import { LineItem, CalculationBreakdown } from './types';
import { formatCurrency } from './format';
import { calculateLineTotal } from './utils';

interface PrintBillProps {
  lineItems: LineItem[];
  breakdown: CalculationBreakdown;
  taxRate: number;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
}

export function PrintBill({ lineItems, breakdown, taxRate, discountType, discountValue }: PrintBillProps) {
  const printDate = new Date().toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <div className="print-only hidden">
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
            {lineItems
              .filter((item) => item.label.trim() !== '' && item.quantity > 0)
              .map((item) => (
                <tr key={item.id} className="border-b border-gray-300">
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
            <span className="font-medium">{formatCurrency(breakdown.subtotal)}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>Tax ({taxRate}%):</span>
            <span className="font-medium">+{formatCurrency(breakdown.taxAmount)}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>
              Discount ({discountType === 'percentage' ? `${discountValue}%` : '₹'}):
            </span>
            <span className="font-medium">-{formatCurrency(breakdown.discountAmount)}</span>
          </div>
          <div className="flex justify-between text-xl font-bold border-t-2 border-black pt-4 mt-4">
            <span>Final Total:</span>
            <span>{formatCurrency(breakdown.finalTotal)}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 pt-4 border-t border-gray-300">
          <p className="text-xs">Thank you for dining with us!</p>
        </div>
      </div>
    </div>
  );
}
