import { useState, useEffect } from 'react';
import { BillFormatDefaults, loadBillFormatDefaults, saveBillFormatDefaults } from './optimizeBillStorage';
import { useActor } from '@/hooks/useActor';
import { useBranchAuth } from '@/hooks/useBranchAuth';
import { enforceFixedPrintLocation } from './branchFixedPrintLocation';

export function useOptimizeBillDefaults() {
  const { branchUser } = useBranchAuth();
  const [defaults, setDefaults] = useState<BillFormatDefaults>(loadBillFormatDefaults(branchUser || undefined));
  const { actor } = useActor();

  useEffect(() => {
    // Load defaults on mount and when branch changes
    if (branchUser) {
      setDefaults(loadBillFormatDefaults(branchUser));
    }
  }, [branchUser]);

  const saveDefaults = async (newDefaults: BillFormatDefaults) => {
    // Enforce fixed address for fixed branches before saving
    const finalAddress = enforceFixedPrintLocation(branchUser || undefined, newDefaults.printLocationAddress);
    
    const defaultsToSave: BillFormatDefaults = {
      ...newDefaults,
      printLocationAddress: finalAddress,
    };
    
    // Always save to branch-scoped localStorage first
    saveBillFormatDefaults(defaultsToSave, branchUser || undefined);
    setDefaults(defaultsToSave);

    // If authenticated, also persist to backend
    if (actor) {
      try {
        // Get current profile or create new one
        const existingProfile = await actor.getCallerUserProfile();
        
        await actor.saveCallerUserProfile({
          name: existingProfile?.name || 'User',
          billPrintLocation: finalAddress || '',
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
