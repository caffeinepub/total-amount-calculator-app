import { useState } from 'react';
import { Plus, Trash2, RotateCcw, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineItem, CalculatorState } from './types';
import { calculateLineTotal, calculateBreakdown, safeParseNumber, clampNonNegative } from './utils';
import { formatCurrency } from './format';
import { PredefinedItemCatalog } from './PredefinedItemCatalog';
import { PREDEFINED_CATALOG, CatalogItem } from './catalog';

function TotalAmountCalculatorPage() {
  const [state, setState] = useState<CalculatorState>({
    lineItems: [{ id: crypto.randomUUID(), label: '', quantity: 0, unitPrice: 0 }],
    taxRate: 0,
    discountType: 'percentage',
    discountValue: 0,
  });

  const breakdown = calculateBreakdown(
    state.lineItems,
    state.taxRate,
    state.discountType,
    state.discountValue
  );

  const addLineItem = () => {
    setState((prev) => ({
      ...prev,
      lineItems: [...prev.lineItems, { id: crypto.randomUUID(), label: '', quantity: 0, unitPrice: 0 }],
    }));
  };

  const addCatalogItem = (catalogItem: CatalogItem) => {
    setState((prev) => ({
      ...prev,
      lineItems: [
        ...prev.lineItems,
        {
          id: crypto.randomUUID(),
          label: catalogItem.name,
          quantity: 1,
          unitPrice: catalogItem.unitPrice,
        },
      ],
    }));
  };

  const removeLineItem = (id: string) => {
    setState((prev) => ({
      ...prev,
      lineItems: prev.lineItems.filter((item) => item.id !== id),
    }));
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
    setState((prev) => ({
      ...prev,
      lineItems: prev.lineItems.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]:
                field === 'quantity' || field === 'unitPrice'
                  ? clampNonNegative(safeParseNumber(value))
                  : value,
            }
          : item
      ),
    }));
  };

  const resetCalculator = () => {
    setState({
      lineItems: [{ id: crypto.randomUUID(), label: '', quantity: 0, unitPrice: 0 }],
      taxRate: 0,
      discountType: 'percentage',
      discountValue: 0,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Calculator className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Total Amount Calculator</h1>
                <p className="text-sm text-muted-foreground">Calculate totals with tax and discounts</p>
              </div>
            </div>
            <Button onClick={resetCalculator} variant="outline" size="sm" className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Catalog Section - Left Side on Desktop, Top on Mobile */}
          <div className="lg:col-span-4 xl:col-span-3">
            <div className="lg:sticky lg:top-24">
              <PredefinedItemCatalog items={PREDEFINED_CATALOG} onAddItem={addCatalogItem} />
            </div>
          </div>

          {/* Line Items and Summary - Right Side */}
          <div className="lg:col-span-8 xl:col-span-9">
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Line Items Section */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Line Items</CardTitle>
                    <CardDescription>Add items with quantity and unit price</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[40%]">Item</TableHead>
                            <TableHead className="w-[20%]">Quantity</TableHead>
                            <TableHead className="w-[20%]">Unit Price</TableHead>
                            <TableHead className="w-[15%] text-right">Total</TableHead>
                            <TableHead className="w-[5%]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {state.lineItems.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>
                                <Input
                                  type="text"
                                  placeholder="Item name"
                                  value={item.label}
                                  onChange={(e) => updateLineItem(item.id, 'label', e.target.value)}
                                  className="h-9"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  min="0"
                                  step="1"
                                  placeholder="0"
                                  value={item.quantity || ''}
                                  onChange={(e) => updateLineItem(item.id, 'quantity', e.target.value)}
                                  className="h-9"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  placeholder="0.00"
                                  value={item.unitPrice || ''}
                                  onChange={(e) => updateLineItem(item.id, 'unitPrice', e.target.value)}
                                  className="h-9"
                                />
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                {formatCurrency(calculateLineTotal(item.quantity, item.unitPrice))}
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeLineItem(item.id)}
                                  disabled={state.lineItems.length === 1}
                                  className="h-8 w-8"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    <Button onClick={addLineItem} variant="outline" className="mt-4 w-full gap-2">
                      <Plus className="h-4 w-4" />
                      Add Line Item
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Summary Section */}
              <div className="lg:col-span-1">
                <div className="space-y-6 lg:sticky lg:top-24">
                  {/* Adjustments Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Adjustments</CardTitle>
                      <CardDescription>Apply tax and discounts</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Tax */}
                      <div className="space-y-2">
                        <Label htmlFor="tax">Tax Rate (%)</Label>
                        <Input
                          id="tax"
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          value={state.taxRate || ''}
                          onChange={(e) =>
                            setState((prev) => ({
                              ...prev,
                              taxRate: clampNonNegative(safeParseNumber(e.target.value)),
                            }))
                          }
                        />
                      </div>

                      <Separator />

                      {/* Discount */}
                      <div className="space-y-2">
                        <Label>Discount</Label>
                        <Tabs
                          value={state.discountType}
                          onValueChange={(value) =>
                            setState((prev) => ({
                              ...prev,
                              discountType: value as 'percentage' | 'fixed',
                            }))
                          }
                        >
                          <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="percentage">%</TabsTrigger>
                            <TabsTrigger value="fixed">$</TabsTrigger>
                          </TabsList>
                          <TabsContent value="percentage" className="mt-2">
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              step="0.01"
                              placeholder="0.00"
                              value={state.discountValue || ''}
                              onChange={(e) =>
                                setState((prev) => ({
                                  ...prev,
                                  discountValue: clampNonNegative(safeParseNumber(e.target.value)),
                                }))
                              }
                            />
                          </TabsContent>
                          <TabsContent value="fixed" className="mt-2">
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="0.00"
                              value={state.discountValue || ''}
                              onChange={(e) =>
                                setState((prev) => ({
                                  ...prev,
                                  discountValue: clampNonNegative(safeParseNumber(e.target.value)),
                                }))
                              }
                            />
                          </TabsContent>
                        </Tabs>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Breakdown Card */}
                  <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5">
                    <CardHeader>
                      <CardTitle>Total Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="font-medium">{formatCurrency(breakdown.subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Tax ({state.taxRate}%)</span>
                        <span className="font-medium text-amber-600 dark:text-amber-400">
                          +{formatCurrency(breakdown.taxAmount)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Discount ({state.discountType === 'percentage' ? `${state.discountValue}%` : '$'})
                        </span>
                        <span className="font-medium text-emerald-600 dark:text-emerald-400">
                          -{formatCurrency(breakdown.discountAmount)}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex justify-between items-center pt-2">
                        <span className="text-lg font-semibold">Final Total</span>
                        <span className="text-2xl font-bold text-primary">
                          {formatCurrency(breakdown.finalTotal)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-16 py-8 bg-card/30">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} Built with ❤️ using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                typeof window !== 'undefined' ? window.location.hostname : 'total-calculator'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default TotalAmountCalculatorPage;
