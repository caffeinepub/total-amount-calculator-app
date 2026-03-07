/**
 * Shows a confirmation dialog before deleting an item.
 * @param itemType Optional description of what is being deleted (e.g., "item", "catalog entry")
 * @returns true if user confirms deletion, false otherwise
 */
export function confirmDelete(itemType: string = 'item'): boolean {
  return window.confirm(`Are you sure you want to delete this ${itemType}?`);
}

/**
 * Shows a confirmation dialog before clearing all daily totals.
 * @returns true if user confirms the clear action, false otherwise
 */
export function confirmClearAll(): boolean {
  return window.confirm(
    'Are you sure you want to clear all daily totals?\n\n' +
    'This will permanently delete all revenue and item quantity data for all days. ' +
    'This action cannot be undone.'
  );
}
