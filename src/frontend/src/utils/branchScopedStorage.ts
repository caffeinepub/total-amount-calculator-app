/**
 * Branch-scoped localStorage utilities
 * Provides namespaced storage keys per branch and one-time migration from legacy global keys
 */

const BRANCH_AUTH_KEY = 'branchAuthUser';

// Legacy global keys that need migration
const LEGACY_KEYS = {
  savedBills: 'varshini_saved_bills',
  dailyLedger: 'varshini_daily_totals_ledger',
  dailySummary: 'varshini_daily_summary',
  billDefaults: 'varshini_bill_format_defaults',
};

/**
 * Get the current active branch from localStorage
 * Returns null if no branch is authenticated
 */
export function getActiveBranch(): string | null {
  try {
    return localStorage.getItem(BRANCH_AUTH_KEY);
  } catch {
    return null;
  }
}

/**
 * Generate a branch-scoped localStorage key
 */
export function getBranchScopedKey(branch: string, baseKey: string): string {
  return `branch_${branch}_${baseKey}`;
}

/**
 * Get branch-scoped key for saved bills
 */
export function getSavedBillsKey(branch?: string): string {
  const activeBranch = branch || getActiveBranch();
  if (!activeBranch) {
    throw new Error('No active branch for saved bills storage');
  }
  return getBranchScopedKey(activeBranch, 'saved_bills');
}

/**
 * Get branch-scoped key for daily ledger
 */
export function getDailyLedgerKey(branch?: string): string {
  const activeBranch = branch || getActiveBranch();
  if (!activeBranch) {
    throw new Error('No active branch for daily ledger storage');
  }
  return getBranchScopedKey(activeBranch, 'daily_ledger');
}

/**
 * Get branch-scoped key for daily summary
 */
export function getDailySummaryKey(branch?: string): string {
  const activeBranch = branch || getActiveBranch();
  if (!activeBranch) {
    throw new Error('No active branch for daily summary storage');
  }
  return getBranchScopedKey(activeBranch, 'daily_summary');
}

/**
 * Get branch-scoped key for bill format defaults
 */
export function getBillDefaultsKey(branch?: string): string {
  const activeBranch = branch || getActiveBranch();
  if (!activeBranch) {
    throw new Error('No active branch for bill defaults storage');
  }
  return getBranchScopedKey(activeBranch, 'bill_defaults');
}

/**
 * Get migration marker key for a specific branch
 */
function getMigrationMarkerKey(branch: string): string {
  return getBranchScopedKey(branch, 'migration_complete');
}

/**
 * Check if migration has already been completed for a branch
 */
function isMigrationComplete(branch: string): boolean {
  try {
    const marker = localStorage.getItem(getMigrationMarkerKey(branch));
    return marker === 'true';
  } catch {
    return false;
  }
}

/**
 * Mark migration as complete for a branch
 */
function markMigrationComplete(branch: string): void {
  try {
    localStorage.setItem(getMigrationMarkerKey(branch), 'true');
  } catch (error) {
    console.error('Failed to mark migration complete:', error);
  }
}

/**
 * Check if legacy data exists
 */
function hasLegacyData(): boolean {
  try {
    return Object.values(LEGACY_KEYS).some(key => localStorage.getItem(key) !== null);
  } catch {
    return false;
  }
}

/**
 * Check if branch-scoped data already exists
 */
function hasBranchScopedData(branch: string): boolean {
  try {
    const keys = [
      getSavedBillsKey(branch),
      getDailyLedgerKey(branch),
      getDailySummaryKey(branch),
      getBillDefaultsKey(branch),
    ];
    return keys.some(key => localStorage.getItem(key) !== null);
  } catch {
    return false;
  }
}

/**
 * Migrate legacy global localStorage keys to branch-scoped keys
 * Only runs once per branch and only if:
 * 1. Legacy data exists
 * 2. Branch-scoped data does not exist
 * 3. Migration has not been completed before
 */
export function migrateLegacyDataToBranch(branch: string): void {
  // Skip if migration already completed
  if (isMigrationComplete(branch)) {
    return;
  }

  // Skip if no legacy data exists
  if (!hasLegacyData()) {
    markMigrationComplete(branch);
    return;
  }

  // Skip if branch-scoped data already exists (treat as source of truth)
  if (hasBranchScopedData(branch)) {
    markMigrationComplete(branch);
    return;
  }

  try {
    console.log(`Migrating legacy data to branch: ${branch}`);

    // Migrate saved bills
    const legacyBills = localStorage.getItem(LEGACY_KEYS.savedBills);
    if (legacyBills) {
      localStorage.setItem(getSavedBillsKey(branch), legacyBills);
    }

    // Migrate daily ledger
    const legacyLedger = localStorage.getItem(LEGACY_KEYS.dailyLedger);
    if (legacyLedger) {
      localStorage.setItem(getDailyLedgerKey(branch), legacyLedger);
    }

    // Migrate daily summary
    const legacySummary = localStorage.getItem(LEGACY_KEYS.dailySummary);
    if (legacySummary) {
      localStorage.setItem(getDailySummaryKey(branch), legacySummary);
    }

    // Migrate bill defaults
    const legacyDefaults = localStorage.getItem(LEGACY_KEYS.billDefaults);
    if (legacyDefaults) {
      localStorage.setItem(getBillDefaultsKey(branch), legacyDefaults);
    }

    // Mark migration complete
    markMigrationComplete(branch);
    console.log(`Migration complete for branch: ${branch}`);
  } catch (error) {
    console.error('Error during migration:', error);
  }
}
