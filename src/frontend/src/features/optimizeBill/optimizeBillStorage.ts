import { ReceiptStyleId, DEFAULT_RECEIPT_STYLE } from './receiptStyles';
import { getBillDefaultsKey } from '@/utils/branchScopedStorage';
import { enforceFixedPrintLocation } from './branchFixedPrintLocation';

export interface BillFormatDefaults {
  receiptStyle: ReceiptStyleId;
  paymentScanDataUrl?: string;
  printLocationAddress?: string;
}

export function loadBillFormatDefaults(branch?: string): BillFormatDefaults {
  try {
    const storageKey = getBillDefaultsKey(branch);
    const stored = localStorage.getItem(storageKey);
    if (!stored) {
      return {
        receiptStyle: DEFAULT_RECEIPT_STYLE,
        printLocationAddress: enforceFixedPrintLocation(branch, undefined),
      };
    }
    
    const parsed = JSON.parse(stored);
    
    // Validate and provide defaults, preserving empty string as undefined
    const loadedAddress = parsed.printLocationAddress || undefined;
    
    // Enforce fixed address for fixed branches, overriding any stored value
    const finalAddress = enforceFixedPrintLocation(branch, loadedAddress);
    
    return {
      receiptStyle: parsed.receiptStyle || DEFAULT_RECEIPT_STYLE,
      paymentScanDataUrl: parsed.paymentScanDataUrl || undefined,
      printLocationAddress: finalAddress,
    };
  } catch (error) {
    console.error('Error loading bill format defaults:', error);
    return {
      receiptStyle: DEFAULT_RECEIPT_STYLE,
      printLocationAddress: enforceFixedPrintLocation(branch, undefined),
    };
  }
}

export function saveBillFormatDefaults(defaults: BillFormatDefaults, branch?: string): void {
  try {
    const storageKey = getBillDefaultsKey(branch);
    
    // Enforce fixed address for fixed branches before saving
    const finalAddress = enforceFixedPrintLocation(branch, defaults.printLocationAddress);
    
    // Clean up the object before saving - remove undefined values
    const toSave: BillFormatDefaults = {
      receiptStyle: defaults.receiptStyle,
    };
    
    if (defaults.paymentScanDataUrl) {
      toSave.paymentScanDataUrl = defaults.paymentScanDataUrl;
    }
    
    if (finalAddress) {
      toSave.printLocationAddress = finalAddress;
    }
    
    localStorage.setItem(storageKey, JSON.stringify(toSave));
  } catch (error) {
    console.error('Error saving bill format defaults:', error);
    throw new Error('Failed to save bill format defaults');
  }
}
