import { useState, useEffect } from 'react';
import { BillFormatDefaults, loadBillFormatDefaults, saveBillFormatDefaults } from './optimizeBillStorage';
import { useActor } from '@/hooks/useActor';

export function useOptimizeBillDefaults() {
  const [defaults, setDefaults] = useState<BillFormatDefaults>(loadBillFormatDefaults());
  const { actor } = useActor();

  useEffect(() => {
    // Load defaults on mount
    setDefaults(loadBillFormatDefaults());
  }, []);

  const saveDefaults = async (newDefaults: BillFormatDefaults) => {
    // Always save to localStorage first
    saveBillFormatDefaults(newDefaults);
    setDefaults(newDefaults);

    // If authenticated, also persist to backend
    if (actor) {
      try {
        // Get current profile or create new one
        const existingProfile = await actor.getCallerUserProfile();
        
        await actor.saveCallerUserProfile({
          name: existingProfile?.name || 'User',
          billPrintLocation: newDefaults.printLocationAddress || '',
        });
      } catch (error) {
        // Don't crash if backend save fails - localStorage is already updated
        console.warn('Failed to save bill print location to backend:', error);
      }
    }
  };

  return {
    defaults,
    saveDefaults,
  };
}
