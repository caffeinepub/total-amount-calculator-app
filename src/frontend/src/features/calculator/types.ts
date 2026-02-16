export interface LineItem {
  id: string;
  label: string;
  quantity: number;
  unitPrice: number;
}

export interface CalculatorState {
  lineItems: LineItem[];
  taxRate: number;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
}

export interface CalculationBreakdown {
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  finalTotal: number;
}
