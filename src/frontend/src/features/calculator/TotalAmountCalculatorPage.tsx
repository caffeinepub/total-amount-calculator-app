import { useState } from 'react';
import { Plus, Trash2, RotateCcw, Calculator, Printer } from 'lucide-react';
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
import { PrintBill } from './PrintBill';
import { saveBill } from './savedBills';
import { appendLedgerEntry, updateDailySummary, getDayKey } from '../balanceSheet/ledgerUtils';
import { findMatchingLineItem } from './lineItemCatalogMatching';
import { confirmDelete } from '@/utils/confirmDelete';
import { generateBillCode } from './billCode';
import { loadBillFormatDefaults } from '../optimizeBill/optimizeBillStorage';

function TotalAmountCalculatorPage() {
  const [state, setState] = useState<CalculatorState>({
    lineItems: [{ id: crypto.randomUUID(), label: '', quantity: 0, unitPrice: 0 }],
    taxRate: 0,
    discountType: 'percentage',
    discountValue: 0,
  });

  // Manage catalog items in state for runtime add/delete/toggle
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>(PREDEFINED_CATALOG);

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
    // Block adding out-of-stock items
    if (catalogItem.outOfStock) {
      return;
    }
    
    setState((prev) => {
      // Check if a matching line item already exists
      const matchingItem = findMatchingLineItem(catalogItem.name, prev.lineItems);
      
      if (matchingItem) {
        // Increment quantity of existing line item
        return {
          ...prev,
          lineItems: prev.lineItems.map((item) =>
            item.id === matchingItem.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      } else {
        // Add new line item with quantity = 1
        return {
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
        };
      }
    });
  };

  const removeLineItem = (id: string) => {
    // Show confirmation dialog before deleting
    if (!confirmDelete('item')) {
      return;
    }
    
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

  const handlePrintBill = () => {
    try {
      // Generate bill code
      const billCode = generateBillCode();

      // Load current bill format defaults
      const billFormatDefaults = loadBillFormatDefaults();

      // Save bill to localStorage with bill code and format snapshot
      const billId = saveBill({
        billCode,
        lineItems: state.lineItems.map(({ label, quantity, unitPrice }) => ({
          label,
          quantity,
          unitPrice,
        })),
        taxRate: state.taxRate,
        discountType: state.discountType,
        discountValue: state.discountValue,
        breakdown,
        billFormatSnapshot: billFormatDefaults,
      });

      // Record in Daily Totals ledger
      appendLedgerEntry(billId, breakdown.finalTotal);

      // Update persisted daily summary for today
      const todayKey = getDayKey();
      updateDailySummary(todayKey, breakdown.finalTotal);

      // Open print view in new tab
      const printUrl = `${window.location.origin}${window.location.pathname}?print=true&id=${billId}`;
      window.open(printUrl, '_blank');
    } catch (error) {
      console.error('Error printing bill:', error);
      alert('Failed to save bill. Please try again.');
    }
  };

  const handleAddNewCatalogItem = (newItem: Omit<CatalogItem, 'id'>) => {
    const catalogItem: CatalogItem = {
      ...newItem,
      id: crypto.randomUUID(),
    };
    setCatalogItems((prev) => [...prev, catalogItem]);
  };

  const handleDeleteCatalogItem = (id: string) => {
    // Show confirmation dialog before deleting catalog item
    if (!confirmDelete('catalog item')) {
      return;
    }
    
    setCatalogItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleToggleOutOfStock = (id: string) => {
    setCatalogItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, outOfStock: !item.outOfStock } : item
      )
    );
  };

  const handleUpdateItemImage = (id: string, imageDataUrl: string) => {
    setCatalogItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, image: imageDataUrl } : item
      )
    );
  };

  const handleRemoveItemImage = (id: string) => {
    setCatalogItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, image: undefined } : item
      )
    );
  };

  return (
    <div>
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Catalog Section - Left Side on Desktop, Top on Mobile */}
        <div className="no-print lg:col-span-4 xl:col-span-3">
          <div className="lg:sticky lg:top-24">
            <PredefinedItemCatalog
              items={catalogItems}
              lineItems={state.lineItems}
              onAddItem={addCatalogItem}
              onAddNewItem={handleAddNewCatalogItem}
              onDeleteItem={handleDeleteCatalogItem}
              onToggleOutOfStock={handleToggleOutOfStock}
              onUpdateItemImage={handleUpdateItemImage}
              onRemoveItemImage={handleRemoveItemImage}
            />
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
                <Card className="no-print">
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
                          <TabsTrigger value="fixed">₹</TabsTrigger>
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
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calculator className="h-5 w-5" />
                      Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal:</span>
                      <span className="font-medium">{formatCurrency(breakdown.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tax:</span>
                      <span className="font-medium text-amber-600">
                        +{formatCurrency(breakdown.taxAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Discount:</span>
                      <span className="font-medium text-green-600">
                        -{formatCurrency(breakdown.discountAmount)}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span className="text-primary">{formatCurrency(breakdown.finalTotal)}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="no-print space-y-3">
                  <Button onClick={handlePrintBill} className="w-full gap-2" size="lg">
                    <Printer className="h-5 w-5" />
                    Print Bill
                  </Button>
                  <Button
                    onClick={resetCalculator}
                    variant="outline"
                    className="w-full gap-2"
                    size="lg"
                  >
                    <RotateCcw className="h-5 w-5" />
                    Reset
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden PrintBill component for backward compatibility */}
      <div className="hidden">
        <PrintBill
          lineItems={state.lineItems}
          breakdown={breakdown}
          taxRate={state.taxRate}
          discountType={state.discountType}
          discountValue={state.discountValue}
        />
      </div>
    </div>
  );
}

export default TotalAmountCalculatorPage;
