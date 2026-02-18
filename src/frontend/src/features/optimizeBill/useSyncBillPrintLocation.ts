import { useEffect } from 'react';
import { useActor } from '@/hooks/useActor';
import { useBranchAuth } from '@/hooks/useBranchAuth';
import { loadBillFormatDefaults, saveBillFormatDefaults } from './optimizeBillStorage';
import { isFixedBranchUser, getFixedPrintLocationForBranchUser } from './branchFixedPrintLocation';

/**
 * Hook that syncs bill print location from backend user profile to branch-scoped local defaults
 * when authenticated. Falls back gracefully to localStorage-only on errors.
 * Skips syncing for fixed branch users to prevent overriding their enforced addresses.
 */
export function useSyncBillPrintLocation() {
  const { actor, isFetching } = useActor();
  const { branchUser } = useBranchAuth();

  useEffect(() => {
    if (!actor || isFetching || !branchUser) return;

    // Skip sync for fixed branch users - their address is enforced locally
    if (isFixedBranchUser(branchUser)) {
      return;
    }

    const syncFromBackend = async () => {
      try {
        const profile = await actor.getCallerUserProfile();
        
        if (profile && profile.billPrintLocation) {
          // Load current branch-scoped local defaults
          const currentDefaults = loadBillFormatDefaults(branchUser);
          
          // Only update if backend has a different value
          if (currentDefaults.printLocationAddress !== profile.billPrintLocation) {
            // Sync backend location to branch-scoped local defaults
            saveBillFormatDefaults({
              ...currentDefaults,
              printLocationAddress: profile.billPrintLocation,
            }, branchUser);
          }
        }
      } catch (error) {
        // Silently fall back to localStorage-only behavior
        console.warn('Failed to sync bill print location from backend:', error);
      }
    };

    syncFromBackend();
  }, [actor, isFetching, branchUser]);
}
