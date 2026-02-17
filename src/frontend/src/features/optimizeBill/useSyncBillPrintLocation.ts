import { useEffect } from 'react';
import { useActor } from '@/hooks/useActor';
import { loadBillFormatDefaults, saveBillFormatDefaults } from './optimizeBillStorage';

/**
 * Hook that syncs bill print location from backend user profile to local defaults
 * when authenticated. Falls back gracefully to localStorage-only on errors.
 */
export function useSyncBillPrintLocation() {
  const { actor, isFetching } = useActor();

  useEffect(() => {
    if (!actor || isFetching) return;

    const syncFromBackend = async () => {
      try {
        const profile = await actor.getCallerUserProfile();
        
        if (profile && profile.billPrintLocation) {
          // Load current local defaults
          const currentDefaults = loadBillFormatDefaults();
          
          // Only update if backend has a different value
          if (currentDefaults.printLocationAddress !== profile.billPrintLocation) {
            // Sync backend location to local defaults
            saveBillFormatDefaults({
              ...currentDefaults,
              printLocationAddress: profile.billPrintLocation,
            });
          }
        }
      } catch (error) {
        // Silently fall back to localStorage-only behavior
        console.warn('Failed to sync bill print location from backend:', error);
      }
    };

    syncFromBackend();
  }, [actor, isFetching]);
}
