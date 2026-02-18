/**
 * Branch-fixed print location utility
 * 
 * Enforces that certain branch users always have a specific print location address
 * that cannot be changed by the user or overridden by backend/localStorage values.
 */

const FIXED_BRANCH_ADDRESSES: Record<string, string> = {
  bachupally: 'bachupally',
  nezampat: 'nezampat',
};

/**
 * Check if a branch user has a fixed print location address
 */
export function isFixedBranchUser(branchUser: string | null | undefined): boolean {
  if (!branchUser) return false;
  return branchUser in FIXED_BRANCH_ADDRESSES;
}

/**
 * Get the fixed print location address for a branch user
 * Returns undefined if the branch user does not have a fixed address
 */
export function getFixedPrintLocationForBranchUser(branchUser: string | null | undefined): string | undefined {
  if (!branchUser) return undefined;
  return FIXED_BRANCH_ADDRESSES[branchUser];
}

/**
 * Enforce the fixed print location address for a branch user if applicable
 * Returns the fixed address if the branch has one, otherwise returns the provided address
 */
export function enforceFixedPrintLocation(
  branchUser: string | null | undefined,
  providedAddress: string | undefined
): string | undefined {
  const fixedAddress = getFixedPrintLocationForBranchUser(branchUser);
  return fixedAddress !== undefined ? fixedAddress : providedAddress;
}
