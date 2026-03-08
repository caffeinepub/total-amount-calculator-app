import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useBranchAuth } from "@/hooks/useBranchAuth";
import { confirmClearAll } from "@/utils/confirmDelete";
import { Calendar, CheckCircle2, Package, Trash2 } from "lucide-react";
import { useState } from "react";
import { formatCurrency } from "../calculator/format";
import { clearAllBills } from "../calculator/savedBills";
import { useDailyTotal } from "./hooks/useDailyTotal";
import { clearDailyTotalsCache, formatDayKey } from "./ledgerUtils";

export function BalanceSheetView() {
  const {
    availableDays,
    selectedDay,
    setSelectedDay,
    dayTotal,
    itemQuantities,
    isLoading,
  } = useDailyTotal();
  const { branchUser } = useBranchAuth();
  const [clearStatus, setClearStatus] = useState<"idle" | "success" | "error">(
    "idle",
  );
  const [isClearing, setIsClearing] = useState(false);

  const handleClearAll = () => {
    if (!confirmClearAll()) return;

    setIsClearing(true);
    setClearStatus("idle");

    try {
      if (branchUser) {
        clearDailyTotalsCache(branchUser);
        clearAllBills(branchUser);
      }
      setSelectedDay(null);
      setClearStatus("success");
      setTimeout(() => setClearStatus("idle"), 3000);
    } catch (error) {
      console.error("Error clearing daily totals:", error);
      setClearStatus("error");
      setTimeout(() => setClearStatus("idle"), 5000);
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Daily Totals</h1>
        <p className="text-muted-foreground mt-2">
          View revenue and item quantities for each day
        </p>
      </div>

      {/* Clear All Action with Feedback */}
      {availableDays.length > 0 && (
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Clear All Data
            </CardTitle>
            <CardDescription>
              Permanently delete all daily totals. This action cannot be undone.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="destructive"
              onClick={handleClearAll}
              disabled={isClearing}
              className="w-full sm:w-auto"
            >
              {isClearing ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Clearing...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All Daily Totals
                </>
              )}
            </Button>

            {clearStatus === "success" && (
              <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertDescription className="text-green-800 dark:text-green-200">
                  All daily totals have been successfully cleared.
                </AlertDescription>
              </Alert>
            )}

            {clearStatus === "error" && (
              <Alert variant="destructive">
                <AlertDescription>
                  Failed to clear daily totals. Please try again.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Day Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Select Day
          </CardTitle>
          <CardDescription>Choose a day to view its totals</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-sm text-muted-foreground">Loading days...</div>
          ) : availableDays.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No data available yet. Print your first bill to start tracking
              daily totals.
            </div>
          ) : (
            <Select
              value={selectedDay || undefined}
              onValueChange={setSelectedDay}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a day" />
              </SelectTrigger>
              <SelectContent>
                {availableDays.map((day) => (
                  <SelectItem key={day} value={day}>
                    {formatDayKey(day)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </CardContent>
      </Card>

      {/* Total Revenue */}
      {selectedDay && (
        <Card>
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
            <CardDescription>{formatDayKey(selectedDay)}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary">
              {formatCurrency(dayTotal)}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Item Quantities */}
      {selectedDay && Object.keys(itemQuantities).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Item Quantities
            </CardTitle>
            <CardDescription>
              Total quantities sold on {formatDayKey(selectedDay)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(itemQuantities)
                  .sort(([, a], [, b]) => b - a)
                  .map(([item, quantity]) => (
                    <TableRow key={item}>
                      <TableCell className="font-medium">{item}</TableCell>
                      <TableCell className="text-right">{quantity}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
