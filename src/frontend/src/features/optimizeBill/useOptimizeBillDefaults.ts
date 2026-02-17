import { useState, useEffect } from 'react';
import { BillFormatDefaults, loadBillFormatDefaults, saveBillFormatDefaults } from './optimizeBillStorage';

export function useOptimizeBillDefaults() {
  const [defaults, setDefaults] = useState<BillFormatDefaults>(loadBillFormatDefaults());

  useEffect(() => {
    // Load defaults on mount
    setDefaults(loadBillFormatDefaults());
  }, []);

  const saveDefaults = (newDefaults: BillFormatDefaults) => {
    saveBillFormatDefaults(newDefaults);
    setDefaults(newDefaults);
  };

  return {
    defaults,
    saveDefaults,
  };
}
