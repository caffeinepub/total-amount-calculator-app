import { ReceiptStyleId } from '../optimizeBill/receiptStyles';

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

const STORAGE_KEY = 'varshini_saved_bills';

export function saveBill(bill: Omit<SavedBillRecord, 'id' | 'timestamp'>): string {
  const billId = crypto.randomUUID();
  const timestamp = Date.now();
  
  const savedBill: SavedBillRecord = {
    id: billId,
    timestamp,
    ...bill,
  };

  try {
    // Get existing bills
    const existingBills = getAllBills();
    
    // Add new bill
    existingBills.push(savedBill);
    
    // Save back to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existingBills));
    
    return billId;
  } catch (error) {
    console.error('Error saving bill:', error);
    throw new Error('Failed to save bill');
  }
}

export function getBillById(billId: string): SavedBillRecord | null {
  try {
    const bills = getAllBills();
    return bills.find(bill => bill.id === billId) || null;
  } catch (error) {
    console.error('Error loading bill:', error);
    return null;
  }
}

export function getAllBills(): SavedBillRecord[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error loading bills:', error);
    return [];
  }
}

export function clearAllBills(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing bills:', error);
  }
}
