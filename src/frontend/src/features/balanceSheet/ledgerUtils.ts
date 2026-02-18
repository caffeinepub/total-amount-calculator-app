/**
 * Daily Totals Ledger Utilities
 * Browser localStorage-based ledger for tracking daily bill totals with branch-scoped storage
 */

import { LineItem } from '../calculator/types';
import { getDailyLedgerKey, getDailySummaryKey } from '@/utils/branchScopedStorage';

export interface LedgerEntry {
  billId: string;
  timestamp: number;
  finalTotal: number;
}

export interface DayLedger {
  dayKey: string;
  entries: LedgerEntry[];
}

export interface Ledger {
  days: Record<string, DayLedger>;
}

export interface DailySummary {
  dayKey: string;
  totalRevenue: number;
}

export interface DailySummaryStore {
  summaries: Record<string, DailySummary>;
}

/**
 * Generate a stable local-day key from a timestamp
 * Format: YYYY-MM-DD
 */
export function getDayKey(timestamp: number = Date.now()): string {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Safely load ledger from branch-scoped localStorage
 */
export function loadLedger(branch?: string): Ledger {
  try {
    const storageKey = getDailyLedgerKey(branch);
    const stored = localStorage.getItem(storageKey);
    if (!stored) {
      return { days: {} };
    }
    const parsed = JSON.parse(stored);
    return parsed && typeof parsed === 'object' && parsed.days ? parsed : { days: {} };
  } catch (error) {
    console.error('Error loading ledger:', error);
    return { days: {} };
  }
}

/**
 * Safely save ledger to branch-scoped localStorage
 */
export function saveLedger(ledger: Ledger, branch?: string): void {
  try {
    const storageKey = getDailyLedgerKey(branch);
    localStorage.setItem(storageKey, JSON.stringify(ledger));
  } catch (error) {
    console.error('Error saving ledger:', error);
  }
}

/**
 * Load daily summaries from branch-scoped localStorage
 */
export function loadDailySummaries(branch?: string): DailySummaryStore {
  try {
    const storageKey = getDailySummaryKey(branch);
    const stored = localStorage.getItem(storageKey);
    if (!stored) {
      return { summaries: {} };
    }
    const parsed = JSON.parse(stored);
    return parsed && typeof parsed === 'object' && parsed.summaries ? parsed : { summaries: {} };
  } catch (error) {
    console.error('Error loading daily summaries:', error);
    return { summaries: {} };
  }
}

/**
 * Save daily summaries to branch-scoped localStorage
 */
export function saveDailySummaries(store: DailySummaryStore, branch?: string): void {
  try {
    const storageKey = getDailySummaryKey(branch);
    localStorage.setItem(storageKey, JSON.stringify(store));
  } catch (error) {
    console.error('Error saving daily summaries:', error);
  }
}

/**
 * Clear all daily totals localStorage caches for a specific branch
 * Removes both daily ledger and daily summary data
 */
export function clearDailyTotalsCache(branch: string): void {
  try {
    const ledgerKey = getDailyLedgerKey(branch);
    const summaryKey = getDailySummaryKey(branch);
    
    localStorage.removeItem(ledgerKey);
    localStorage.removeItem(summaryKey);
  } catch (error) {
    console.error('Error clearing daily totals cache:', error);
  }
}

/**
 * Get or compute daily summary for a specific day
 * If summary doesn't exist, compute from ledger and persist
 */
export function getDailySummary(dayKey: string, branch?: string): DailySummary {
  const store = loadDailySummaries(branch);
  
  // Return existing summary if available
  if (store.summaries[dayKey]) {
    return store.summaries[dayKey];
  }
  
  // Compute from ledger entries
  const totalRevenue = calculateDayTotal(dayKey, branch);
  const summary: DailySummary = {
    dayKey,
    totalRevenue,
  };
  
  // Persist computed summary
  store.summaries[dayKey] = summary;
  saveDailySummaries(store, branch);
  
  return summary;
}

/**
 * Update daily summary by incrementing the total revenue
 */
export function updateDailySummary(dayKey: string, additionalRevenue: number, branch?: string): void {
  const store = loadDailySummaries(branch);
  
  if (!store.summaries[dayKey]) {
    store.summaries[dayKey] = {
      dayKey,
      totalRevenue: 0,
    };
  }
  
  store.summaries[dayKey].totalRevenue += additionalRevenue;
  saveDailySummaries(store, branch);
}

/**
 * Append a new entry to the ledger for today
 */
export function appendLedgerEntry(billId: string, finalTotal: number, branch?: string): void {
  const ledger = loadLedger(branch);
  const timestamp = Date.now();
  const dayKey = getDayKey(timestamp);

  if (!ledger.days[dayKey]) {
    ledger.days[dayKey] = {
      dayKey,
      entries: [],
    };
  }

  ledger.days[dayKey].entries.push({
    billId,
    timestamp,
    finalTotal,
  });

  saveLedger(ledger, branch);
}

/**
 * Get all available day keys (sorted descending)
 */
export function getAvailableDays(branch?: string): string[] {
  const ledger = loadLedger(branch);
  return Object.keys(ledger.days).sort().reverse();
}

/**
 * Get entries for a specific day
 */
export function getEntriesForDay(dayKey: string, branch?: string): LedgerEntry[] {
  const ledger = loadLedger(branch);
  return ledger.days[dayKey]?.entries || [];
}

/**
 * Calculate total for a specific day from ledger entries
 */
export function calculateDayTotal(dayKey: string, branch?: string): number {
  const entries = getEntriesForDay(dayKey, branch);
  return entries.reduce((sum, entry) => sum + entry.finalTotal, 0);
}

/**
 * Aggregate per-item quantities from saved bills for a given day
 * Filters out empty labels and non-positive quantities
 * Normalizes labels by trimming whitespace
 */
export function aggregateItemQuantities(
  bills: Array<{ lineItems: Array<{ label: string; quantity: number }> }>
): Record<string, number> {
  const aggregated: Record<string, number> = {};

  for (const bill of bills) {
    for (const item of bill.lineItems) {
      const normalizedLabel = item.label.trim();
      
      // Skip empty labels and non-positive quantities
      if (!normalizedLabel || item.quantity <= 0) {
        continue;
      }

      if (!aggregated[normalizedLabel]) {
        aggregated[normalizedLabel] = 0;
      }
      aggregated[normalizedLabel] += item.quantity;
    }
  }

  return aggregated;
}

/**
 * Format day key for display
 */
export function formatDayKey(dayKey: string): string {
  try {
    const [year, month, day] = dayKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch (error) {
    return dayKey;
  }
}
