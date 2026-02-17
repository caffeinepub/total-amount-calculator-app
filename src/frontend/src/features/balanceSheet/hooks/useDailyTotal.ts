import { useState, useEffect, useMemo } from 'react';
import {
  getAvailableDays,
  getEntriesForDay,
  aggregateItemQuantities,
  getDailySummary,
} from '../ledgerUtils';
import { getBillById } from '../../calculator/savedBills';

/**
 * Hook for managing Daily Totals state and computations
 */
export function useDailyTotal() {
  const [availableDays, setAvailableDays] = useState<string[]>([]);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  // Load available days on mount and when storage changes
  useEffect(() => {
    const loadDays = () => {
      const days = getAvailableDays();
      setAvailableDays(days);
      
      // Auto-select most recent day if none selected
      if (days.length > 0 && !selectedDay) {
        setSelectedDay(days[0]);
      }
    };

    loadDays();

    // Listen for storage changes (e.g., new bills printed)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'varshini_daily_totals_ledger' || e.key === 'varshini_daily_summary') {
        loadDays();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [selectedDay]);

  // Get total for selected day from persisted daily summary
  const dayTotal = useMemo(() => {
    if (!selectedDay) return 0;
    const summary = getDailySummary(selectedDay);
    return summary.totalRevenue;
  }, [selectedDay]);

  // Compute per-item quantities for selected day
  const itemQuantities = useMemo(() => {
    if (!selectedDay) return {};

    const entries = getEntriesForDay(selectedDay);
    const bills = entries
      .map((entry) => getBillById(entry.billId))
      .filter((bill): bill is NonNullable<typeof bill> => bill !== null);

    return aggregateItemQuantities(bills);
  }, [selectedDay]);

  return {
    availableDays,
    selectedDay,
    setSelectedDay,
    dayTotal,
    itemQuantities,
  };
}
