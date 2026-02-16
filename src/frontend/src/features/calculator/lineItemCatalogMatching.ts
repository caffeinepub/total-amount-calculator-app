import { LineItem } from './types';

/**
 * Normalize a label for case-insensitive comparison.
 * Trims leading/trailing whitespace and converts to lowercase.
 */
export function normalizeLabel(label: string): string {
  return label.trim().toLowerCase();
}

/**
 * Find an existing line item that matches the given catalog item name.
 * Returns the matching line item or null if no match is found.
 * 
 * Matching rules:
 * - Case-insensitive comparison
 * - Trimmed whitespace
 * - Ignores empty/whitespace-only labels
 */
export function findMatchingLineItem(
  catalogItemName: string,
  lineItems: LineItem[]
): LineItem | null {
  const normalizedCatalogName = normalizeLabel(catalogItemName);
  
  // Ignore empty catalog names
  if (!normalizedCatalogName) {
    return null;
  }
  
  return lineItems.find((lineItem) => {
    // Ignore empty/whitespace-only labels
    if (!lineItem.label.trim()) {
      return false;
    }
    
    // Check if labels match (case-insensitive, trimmed)
    return normalizeLabel(lineItem.label) === normalizedCatalogName;
  }) || null;
}

/**
 * Compute the total added quantity for a catalog item name
 * by summing matching line item quantities.
 * 
 * Ignores:
 * - Line items with empty/whitespace-only labels
 * - Line items with non-positive quantities
 */
export function getAddedCountForCatalogItem(
  catalogItemName: string,
  lineItems: LineItem[]
): number {
  const normalizedCatalogName = normalizeLabel(catalogItemName);
  
  return lineItems.reduce((total, lineItem) => {
    // Ignore empty/whitespace-only labels
    if (!lineItem.label.trim()) {
      return total;
    }
    
    // Ignore non-positive quantities
    if (lineItem.quantity <= 0) {
      return total;
    }
    
    // Check if labels match (case-insensitive, trimmed)
    if (normalizeLabel(lineItem.label) === normalizedCatalogName) {
      return total + lineItem.quantity;
    }
    
    return total;
  }, 0);
}
