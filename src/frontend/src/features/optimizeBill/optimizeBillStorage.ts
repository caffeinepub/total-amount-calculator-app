import { ReceiptStyleId, DEFAULT_RECEIPT_STYLE } from './receiptStyles';

export interface BillFormatDefaults {
  receiptStyle: ReceiptStyleId;
  paymentScanDataUrl?: string;
  printLocationAddress?: string;
}

const STORAGE_KEY = 'varshini_bill_format_defaults';

export function loadBillFormatDefaults(): BillFormatDefaults {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return {
        receiptStyle: DEFAULT_RECEIPT_STYLE,
      };
    }
    
    const parsed = JSON.parse(stored);
    
    // Validate and provide defaults, preserving empty string as undefined
    return {
      receiptStyle: parsed.receiptStyle || DEFAULT_RECEIPT_STYLE,
      paymentScanDataUrl: parsed.paymentScanDataUrl || undefined,
      printLocationAddress: parsed.printLocationAddress || undefined,
    };
  } catch (error) {
    console.error('Error loading bill format defaults:', error);
    return {
      receiptStyle: DEFAULT_RECEIPT_STYLE,
    };
  }
}

export function saveBillFormatDefaults(defaults: BillFormatDefaults): void {
  try {
    // Clean up the object before saving - remove undefined values
    const toSave: BillFormatDefaults = {
      receiptStyle: defaults.receiptStyle,
    };
    
    if (defaults.paymentScanDataUrl) {
      toSave.paymentScanDataUrl = defaults.paymentScanDataUrl;
    }
    
    if (defaults.printLocationAddress) {
      toSave.printLocationAddress = defaults.printLocationAddress;
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch (error) {
    console.error('Error saving bill format defaults:', error);
    throw new Error('Failed to save bill format defaults');
  }
}
