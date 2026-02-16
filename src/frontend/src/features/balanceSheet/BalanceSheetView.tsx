import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, TrendingUp } from 'lucide-react';
import { useDailyTotal } from './hooks/useDailyTotal';
import { formatCurrency } from '../calculator/format';
import { formatDayKey } from './ledgerUtils';

export function BalanceSheetView() {
  const { availableDays, selectedDay, setSelectedDay, dayTotal, itemQuantities } = useDailyTotal();

  // Convert item quantities to sorted array for display
  const itemsArray = Object.entries(itemQuantities)
    .map(([label, quantity]) => ({ label, quantity }))
    .sort((a, b) => a.label.localeCompare(b.label));

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">Daily Totals</CardTitle>
              <CardDescription>View daily sales summary and item quantities</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {availableDays.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium text-muted-foreground">No bills printed yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Print your first bill to start tracking daily totals
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Day Selector */}
          <Card>
            <CardHeader>
              <CardTitle>Select Day</CardTitle>
              <CardDescription>Choose a day to view its sales summary</CardDescription>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>

          {selectedDay && (
            <>
              {/* Total Revenue Card */}
              <Card className="border-accent/20 bg-gradient-to-br from-card to-accent/5">
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

              {/* Per-Item Quantities */}
              <Card>
                <CardHeader>
                  <CardTitle>Items Sold</CardTitle>
                  <CardDescription>Quantity breakdown by item</CardDescription>
                </CardHeader>
                <CardContent>
                  {itemsArray.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No items recorded for this day
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Item Name</TableHead>
                            <TableHead className="text-right">Quantity Sold</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {itemsArray.map((item) => (
                            <TableRow key={item.label}>
                              <TableCell className="font-medium">{item.label}</TableCell>
                              <TableCell className="text-right font-semibold">
                                {item.quantity}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </>
      )}
    </div>
  );
}
