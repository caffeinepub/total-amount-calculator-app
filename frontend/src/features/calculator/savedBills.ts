import { ReceiptStyleId } from '../optimizeBill/receiptStyles';
import { getSavedBillsKey, getActiveBranch } from '@/utils/branchScopedStorage';

export interface BillFormatSnapshot {
  receiptStyle: ReceiptStyleId;
  paymentScanDataUrl?: string;
  printLocationAddress?: string;
}

export interface SavedBillRecord {
  id: string;
  timestamp: number;
  billCode: string;
  lineItems: Array<{
    label: string;
    quantity: number;
    unitPrice: number;
  }>;
  taxRate: number;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  breakdown: {
    subtotal: number;
    taxAmount: number;
    discountAmount: number;
    finalTotal: number;
  };
  billFormatSnapshot: BillFormatSnapshot;
}

export function saveBill(bill: Omit<SavedBillRecord, 'id' | 'timestamp'>, branch?: string): string {
  const billId = crypto.randomUUID();
  const timestamp = Date.now();
  
  const savedBill: SavedBillRecord = {
    id: billId,
    timestamp,
    ...bill,
  };

  try {
    // Get branch-scoped storage key
    const storageKey = getSavedBillsKey(branch);
    
    // Get existing bills
    const existingBills = getAllBills(branch);
    
    // Add new bill
    existingBills.push(savedBill);
    
    // Save back to localStorage
    localStorage.setItem(storageKey, JSON.stringify(existingBills));
    
    return billId;
  } catch (error) {
    console.error('Error saving bill:', error);
    throw new Error('Failed to save bill');
  }
}

export function getBillById(billId: string, branch?: string): SavedBillRecord | null {
  try {
    const bills = getAllBills(branch);
    return bills.find(bill => bill.id === billId) || null;
  } catch (error) {
    console.error('Error loading bill:', error);
    return null;
  }
}

export function getAllBills(branch?: string): SavedBillRecord[] {
  try {
    const storageKey = getSavedBillsKey(branch);
    const stored = localStorage.getItem(storageKey);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error loading bills:', error);
    return [];
  }
}

export function clearAllBills(branch?: string): void {
  try {
    const storageKey = getSavedBillsKey(branch);
    localStorage.removeItem(storageKey);
  } catch (error) {
    console.error('Error clearing bills:', error);
  }
}
