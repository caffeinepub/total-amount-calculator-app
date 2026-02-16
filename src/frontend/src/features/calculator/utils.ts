import { LineItem, CalculationBreakdown } from './types';

/**
 * Safely parse a numeric input, returning 0 for invalid/empty values
 */
export function safeParseNumber(value: string | number): number {
  if (typeof value === 'number') {
    return isFinite(value) ? value : 0;
  }
  const parsed = parseFloat(value);
  return isFinite(parsed) ? parsed : 0;
}

/**
 * Clamp a number to be non-negative
 */
export function clampNonNegative(value: number): number {
  return Math.max(0, value);
}

/**
 * Calculate the total for a single line item
 */
export function calculateLineTotal(quantity: number, unitPrice: number): number {
  const safeQty = clampNonNegative(safeParseNumber(quantity));
  const safePrice = clampNonNegative(safeParseNumber(unitPrice));
  return safeQty * safePrice;
}

/**
 * Calculate subtotal from all line items
 */
export function calculateSubtotal(lineItems: LineItem[]): number {
  return lineItems.reduce((sum, item) => {
    return sum + calculateLineTotal(item.quantity, item.unitPrice);
  }, 0);
}

/**
 * Calculate the full breakdown including tax and discount
 */
export function calculateBreakdown(
  lineItems: LineItem[],
  taxRate: number,
  discountType: 'percentage' | 'fixed',
  discountValue: number
): CalculationBreakdown {
  const subtotal = calculateSubtotal(lineItems);
  const safeTaxRate = clampNonNegative(safeParseNumber(taxRate));
  const safeDiscountValue = clampNonNegative(safeParseNumber(discountValue));

  const taxAmount = (subtotal * safeTaxRate) / 100;

  let discountAmount = 0;
  if (discountType === 'percentage') {
    discountAmount = (subtotal * safeDiscountValue) / 100;
  } else {
    discountAmount = Math.min(safeDiscountValue, subtotal); // Can't discount more than subtotal
  }

  const finalTotal = Math.max(0, subtotal + taxAmount - discountAmount);

  return {
    subtotal,
    taxAmount,
    discountAmount,
    finalTotal,
  };
}
