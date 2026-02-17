/**
 * Shows a confirmation dialog before deleting an item.
 * @param itemType Optional description of what is being deleted (e.g., "item", "catalog entry")
 * @returns true if user confirms deletion, false otherwise
 */
export function confirmDelete(itemType: string = 'item'): boolean {
  return window.confirm(`Are you sure you want to delete this ${itemType}?`);
}
