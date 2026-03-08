import { useBranchAuth } from "@/hooks/useBranchAuth";
import { isDailyTotalsKeyForBranch } from "@/utils/branchScopedStorage";
import { useEffect, useState } from "react";
import { getAllBills } from "../../calculator/savedBills";
import {
  aggregateItemQuantities,
  getAvailableDays,
  getDailySummary,
} from "../ledgerUtils";

function loadDaysFromStorage(branch: string): string[] {
  return getAvailableDays(branch);
}

function loadDayData(
  branch: string,
  day: string,
): { total: number; quantities: Record<string, number> } {
  const summary = getDailySummary(day, branch);
  const allBills = getAllBills(branch);
  const billsForDay = allBills.filter((bill) => {
    const billDate = new Date(bill.timestamp);
    const billDayKey = `${billDate.getFullYear()}-${String(billDate.getMonth() + 1).padStart(2, "0")}-${String(billDate.getDate()).padStart(2, "0")}`;
    return billDayKey === day;
  });
  const quantities = aggregateItemQuantities(billsForDay);
  return { total: summary.totalRevenue, quantities };
}

export function useDailyTotal() {
  const { branchUser } = useBranchAuth();
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [availableDays, setAvailableDays] = useState<string[]>([]);
  const [dayTotal, setDayTotal] = useState<number>(0);
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>(
    {},
  );

  // Reset state when branch changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally exclude setters
  useEffect(() => {
    setSelectedDay(null);
    setAvailableDays([]);
    setDayTotal(0);
    setItemQuantities({});
  }, [branchUser]);

  // Load available days when branch is set
  // biome-ignore lint/correctness/useExhaustiveDependencies: selectedDay intentionally excluded to avoid loop
  useEffect(() => {
    if (!branchUser) {
      setAvailableDays([]);
      setSelectedDay(null);
      return;
    }

    const days = loadDaysFromStorage(branchUser);
    setAvailableDays(days);

    if (days.length > 0 && !selectedDay) {
      setSelectedDay(days[0]);
    } else if (days.length === 0) {
      setSelectedDay(null);
    }
  }, [branchUser]);

  // Load day total and item quantities for selected day
  useEffect(() => {
    if (!branchUser || !selectedDay) {
      setDayTotal(0);
      setItemQuantities({});
      return;
    }

    const { total, quantities } = loadDayData(branchUser, selectedDay);
    setDayTotal(total);
    setItemQuantities(quantities);
  }, [branchUser, selectedDay]);

  // Listen for storage changes in branch-scoped keys
  useEffect(() => {
    if (!branchUser) return;

    const handleStorageChange = (e: StorageEvent) => {
      if (!isDailyTotalsKeyForBranch(e.key, branchUser)) return;

      const days = loadDaysFromStorage(branchUser);
      setAvailableDays(days);

      if (selectedDay) {
        const { total, quantities } = loadDayData(branchUser, selectedDay);
        setDayTotal(total);
        setItemQuantities(quantities);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [branchUser, selectedDay]);

  return {
    availableDays,
    selectedDay,
    setSelectedDay,
    dayTotal,
    itemQuantities,
    isLoading: false,
  };
}
