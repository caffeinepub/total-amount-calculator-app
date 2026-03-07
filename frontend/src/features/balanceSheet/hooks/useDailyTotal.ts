import { useState, useEffect } from 'react';
import {
  getAvailableDays,
  getDailySummary,
  aggregateItemQuantities,
} from '../ledgerUtils';
import { getAllBills } from '../../calculator/savedBills';
import { useBranchAuth } from '@/hooks/useBranchAuth';
import { useGetBalanceSheet } from '@/hooks/useQueries';
import { isDailyTotalsKeyForBranch } from '@/utils/branchScopedStorage';

export function useDailyTotal() {
  const { branchUser } = useBranchAuth();
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [availableDays, setAvailableDays] = useState<string[]>([]);
  const [dayTotal, setDayTotal] = useState<number>(0);
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>({});

  // Fetch backend balance sheet with branch parameter
  const { data: backendBalanceSheet, isLoading: backendLoading, isError: backendError } = useGetBalanceSheet(branchUser || '');

  // Reset state when branch changes
  useEffect(() => {
    setSelectedDay(null);
    setAvailableDays([]);
    setDayTotal(0);
    setItemQuantities({});
  }, [branchUser]);

  // Load available days and selected day
  useEffect(() => {
    if (!branchUser) {
      setAvailableDays([]);
      setSelectedDay(null);
      return;
    }

    let days: string[] = [];

    // Prefer backend data if available
    if (backendBalanceSheet && backendBalanceSheet.length > 0 && !backendError) {
      days = backendBalanceSheet.map(([date]) => date).sort().reverse();
    } else {
      // Fallback to localStorage
      days = getAvailableDays(branchUser);
    }

    setAvailableDays(days);

    // Auto-select the most recent day if none selected
    if (days.length > 0 && !selectedDay) {
      setSelectedDay(days[0]);
    } else if (days.length === 0) {
      setSelectedDay(null);
    }
  }, [branchUser, backendBalanceSheet, backendError, selectedDay]);

  // Load day total and item quantities for selected day
  useEffect(() => {
    if (!branchUser || !selectedDay) {
      setDayTotal(0);
      setItemQuantities({});
      return;
    }

    // Try to get data from backend first
    if (backendBalanceSheet && !backendError) {
      const backendEntry = backendBalanceSheet.find(([date]) => date === selectedDay);
      if (backendEntry) {
        const [, dailyTotalView] = backendEntry;
        
        // Convert bigint to number (divide by 100 to restore 2 decimal places)
        const totalRevenue = Number(dailyTotalView.totalRevenue) / 100;
        
        // Convert productQuantities array to Record
        const quantities: Record<string, number> = {};
        for (const [label, qty] of dailyTotalView.productQuantities) {
          quantities[label] = Number(qty);
        }
        
        setDayTotal(totalRevenue);
        setItemQuantities(quantities);
        return;
      }
    }

    // Fallback to localStorage
    const summary = getDailySummary(selectedDay, branchUser);
    setDayTotal(summary.totalRevenue);

    // Load item quantities from saved bills
    const allBills = getAllBills(branchUser);
    const billsForDay = allBills.filter((bill) => {
      const billDate = new Date(bill.timestamp);
      const billDayKey = `${billDate.getFullYear()}-${String(billDate.getMonth() + 1).padStart(2, '0')}-${String(billDate.getDate()).padStart(2, '0')}`;
      return billDayKey === selectedDay;
    });

    const quantities = aggregateItemQuantities(billsForDay);
    setItemQuantities(quantities);
  }, [branchUser, selectedDay, backendBalanceSheet, backendError]);

  // Listen for storage changes in branch-scoped keys
  useEffect(() => {
    if (!branchUser) return;

    const handleStorageChange = (e: StorageEvent) => {
      // Only respond to daily totals changes for the current branch
      if (!isDailyTotalsKeyForBranch(e.key, branchUser)) {
        return;
      }

      // Reload available days
      const days = getAvailableDays(branchUser);
      setAvailableDays(days);

      // Reload selected day data if it exists
      if (selectedDay) {
        const summary = getDailySummary(selectedDay, branchUser);
        setDayTotal(summary.totalRevenue);

        const allBills = getAllBills(branchUser);
        const billsForDay = allBills.filter((bill) => {
          const billDate = new Date(bill.timestamp);
          const billDayKey = `${billDate.getFullYear()}-${String(billDate.getMonth() + 1).padStart(2, '0')}-${String(billDate.getDate()).padStart(2, '0')}`;
          return billDayKey === selectedDay;
        });

        const quantities = aggregateItemQuantities(billsForDay);
        setItemQuantities(quantities);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [branchUser, selectedDay]);

  return {
    availableDays,
    selectedDay,
    setSelectedDay,
    dayTotal,
    itemQuantities,
    isLoading: backendLoading,
  };
}
