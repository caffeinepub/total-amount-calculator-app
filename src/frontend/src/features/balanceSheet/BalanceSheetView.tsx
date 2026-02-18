import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '../calculator/format';
import { formatDayKey } from './ledgerUtils';
import { useDailyTotal } from './hooks/useDailyTotal';
import { Calendar, Package } from 'lucide-react';

export function BalanceSheetView() {
  const { availableDays, selectedDay, setSelectedDay, dayTotal, itemQuantities, isLoading } = useDailyTotal();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Daily Totals</h1>
        <p className="text-muted-foreground mt-2">
          View revenue and item quantities for each day
        </p>
      </div>

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
              No data available yet. Print your first bill to start tracking daily totals.
            </div>
          ) : (
            <Select value={selectedDay || undefined} onValueChange={setSelectedDay}>
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
            <div className="text-4xl font-bold text-primary">{formatCurrency(dayTotal)}</div>
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
            <CardDescription>Total quantities sold on {formatDayKey(selectedDay)}</CardDescription>
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
