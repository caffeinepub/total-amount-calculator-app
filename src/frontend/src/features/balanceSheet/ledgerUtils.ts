/**
 * Daily Totals Ledger Utilities
 * Browser localStorage-based ledger for tracking daily bill totals
 */

import { LineItem } from '../calculator/types';

const LEDGER_STORAGE_KEY = 'varshini_daily_totals_ledger';
const DAILY_SUMMARY_STORAGE_KEY = 'varshini_daily_summary';

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
 * Safely load ledger from localStorage
 */
export function loadLedger(): Ledger {
  try {
    const stored = localStorage.getItem(LEDGER_STORAGE_KEY);
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
 * Safely save ledger to localStorage
 */
export function saveLedger(ledger: Ledger): void {
  try {
    localStorage.setItem(LEDGER_STORAGE_KEY, JSON.stringify(ledger));
  } catch (error) {
    console.error('Error saving ledger:', error);
  }
}

/**
 * Load daily summaries from localStorage
 */
export function loadDailySummaries(): DailySummaryStore {
  try {
    const stored = localStorage.getItem(DAILY_SUMMARY_STORAGE_KEY);
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
 * Save daily summaries to localStorage
 */
export function saveDailySummaries(store: DailySummaryStore): void {
  try {
    localStorage.setItem(DAILY_SUMMARY_STORAGE_KEY, JSON.stringify(store));
  } catch (error) {
    console.error('Error saving daily summaries:', error);
  }
}

/**
 * Get or compute daily summary for a specific day
 * If summary doesn't exist, compute from ledger and persist
 */
export function getDailySummary(dayKey: string): DailySummary {
  const store = loadDailySummaries();
  
  // Return existing summary if available
  if (store.summaries[dayKey]) {
    return store.summaries[dayKey];
  }
  
  // Compute from ledger entries
  const totalRevenue = calculateDayTotal(dayKey);
  const summary: DailySummary = {
    dayKey,
    totalRevenue,
  };
  
  // Persist computed summary
  store.summaries[dayKey] = summary;
  saveDailySummaries(store);
  
  return summary;
}

/**
 * Update daily summary by incrementing the total revenue
 */
export function updateDailySummary(dayKey: string, additionalRevenue: number): void {
  const store = loadDailySummaries();
  
  if (!store.summaries[dayKey]) {
    store.summaries[dayKey] = {
      dayKey,
      totalRevenue: 0,
    };
  }
  
  store.summaries[dayKey].totalRevenue += additionalRevenue;
  saveDailySummaries(store);
}

/**
 * Append a new entry to the ledger for today
 */
export function appendLedgerEntry(billId: string, finalTotal: number): void {
  const ledger = loadLedger();
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

  saveLedger(ledger);
}

/**
 * Get all available day keys (sorted descending)
 */
export function getAvailableDays(): string[] {
  const ledger = loadLedger();
  return Object.keys(ledger.days).sort().reverse();
}

/**
 * Get entries for a specific day
 */
export function getEntriesForDay(dayKey: string): LedgerEntry[] {
  const ledger = loadLedger();
  return ledger.days[dayKey]?.entries || [];
}

/**
 * Calculate total for a specific day from ledger entries
 */
export function calculateDayTotal(dayKey: string): number {
  const entries = getEntriesForDay(dayKey);
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
