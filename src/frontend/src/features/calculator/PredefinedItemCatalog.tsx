import { useState, useMemo } from 'react';
import { Search, Plus, Trash2, PackageX } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { CatalogItem } from './catalog';
import { LineItem } from './types';
import { formatCurrency } from './format';
import { getAddedCountForCatalogItem } from './lineItemCatalogMatching';

interface PredefinedItemCatalogProps {
  items: CatalogItem[];
  lineItems: LineItem[];
  onAddItem: (item: CatalogItem) => void;
  onAddNewItem: (item: Omit<CatalogItem, 'id'>) => void;
  onDeleteItem: (id: string) => void;
  onToggleOutOfStock: (id: string) => void;
}

export function PredefinedItemCatalog({
  items,
  lineItems,
  onAddItem,
  onAddNewItem,
  onDeleteItem,
  onToggleOutOfStock,
}: PredefinedItemCatalogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('');

  // Filter items based on search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) {
      return items;
    }
    const query = searchQuery.toLowerCase();
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query)
    );
  }, [items, searchQuery]);

  // Group items by category
  const itemsByCategory = useMemo(() => {
    const grouped = new Map<string, CatalogItem[]>();
    filteredItems.forEach((item) => {
      const category = item.category || 'Other';
      if (!grouped.has(category)) {
        grouped.set(category, []);
      }
      grouped.get(category)!.push(item);
    });
    return grouped;
  }, [filteredItems]);

  const handleSubmitNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || !newItemPrice) return;

    const price = parseFloat(newItemPrice);
    if (isNaN(price) || price < 0) return;

    onAddNewItem({
      name: newItemName.trim(),
      unitPrice: price,
      category: newItemCategory.trim() || 'Other',
      outOfStock: false,
    });

    // Reset form
    setNewItemName('');
    setNewItemPrice('');
    setNewItemCategory('');
    setShowAddForm(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Add Items</CardTitle>
        <CardDescription>Select items to add to your calculation</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Add New Item Form */}
        {showAddForm ? (
          <form onSubmit={handleSubmitNewItem} className="space-y-3 p-3 border rounded-lg bg-accent/20">
            <div className="space-y-2">
              <Label htmlFor="item-name" className="text-xs">Item Name *</Label>
              <Input
                id="item-name"
                type="text"
                placeholder="e.g., Paneer Tikka"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                required
                className="h-9"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="item-price" className="text-xs">Unit Price (₹) *</Label>
              <Input
                id="item-price"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={newItemPrice}
                onChange={(e) => setNewItemPrice(e.target.value)}
                required
                className="h-9"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="item-category" className="text-xs">Category (optional)</Label>
              <Input
                id="item-category"
                type="text"
                placeholder="e.g., Starters"
                value={newItemCategory}
                onChange={(e) => setNewItemCategory(e.target.value)}
                className="h-9"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" size="sm" className="flex-1">
                Add Item
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  setShowAddForm(false);
                  setNewItemName('');
                  setNewItemPrice('');
                  setNewItemCategory('');
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <Button
            onClick={() => setShowAddForm(true)}
            variant="outline"
            className="w-full gap-2"
            size="sm"
          >
            <Plus className="h-4 w-4" />
            Add New Item
          </Button>
        )}

        <Separator />

        {/* Items List */}
        <ScrollArea className="h-[400px] pr-4">
          {filteredItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No items found</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Array.from(itemsByCategory.entries()).map(([category, categoryItems]) => (
                <div key={category} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {category}
                    </Badge>
                    <div className="h-px flex-1 bg-border" />
                  </div>
                  <div className="space-y-2">
                    {categoryItems.map((item) => {
                      const addedCount = getAddedCountForCatalogItem(item.name, lineItems);
                      
                      return (
                        <div
                          key={item.id}
                          className={`flex items-start justify-between gap-3 p-3 rounded-lg border bg-card transition-colors ${
                            item.outOfStock
                              ? 'opacity-60 bg-muted/50'
                              : 'hover:bg-accent/50'
                          }`}
                        >
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center gap-2">
                              <p className={`font-medium text-sm truncate ${item.outOfStock ? 'line-through' : ''}`}>
                                {item.name}
                              </p>
                              {item.outOfStock && (
                                <Badge variant="destructive" className="text-xs shrink-0">
                                  <PackageX className="h-3 w-3 mr-1" />
                                  Out of Stock
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-primary font-semibold">
                              {formatCurrency(item.unitPrice)}
                            </p>
                            <div className="flex items-center gap-2 pt-1">
                              <Switch
                                id={`stock-${item.id}`}
                                checked={item.outOfStock || false}
                                onCheckedChange={() => onToggleOutOfStock(item.id)}
                                className="scale-75"
                              />
                              <Label
                                htmlFor={`stock-${item.id}`}
                                className="text-xs text-muted-foreground cursor-pointer"
                              >
                                Out of stock
                              </Label>
                            </div>
                          </div>
                          <div className="flex flex-col gap-1 shrink-0">
                            <Button
                              size="sm"
                              onClick={() => onAddItem(item)}
                              disabled={item.outOfStock}
                              className="gap-1 h-8 relative"
                            >
                              <Plus className="h-3 w-3" />
                              Add
                              {addedCount > 0 && (
                                <Badge 
                                  variant="secondary" 
                                  className="ml-1 h-5 min-w-5 px-1.5 text-xs font-semibold"
                                >
                                  {addedCount}
                                </Badge>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onDeleteItem(item.id)}
                              className="gap-1 h-8 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
