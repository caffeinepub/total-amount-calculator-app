import { useState, useMemo } from 'react';
import { Search, Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { CatalogItem } from './catalog';
import { formatCurrency } from './format';

interface PredefinedItemCatalogProps {
  items: CatalogItem[];
  onAddItem: (item: CatalogItem) => void;
}

export function PredefinedItemCatalog({ items, onAddItem }: PredefinedItemCatalogProps) {
  const [searchQuery, setSearchQuery] = useState('');

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Add Items</CardTitle>
        <CardDescription>Select predefined items to add to your calculation</CardDescription>
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
                    {categoryItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{item.name}</p>
                          <p className="text-sm text-primary font-semibold">
                            {formatCurrency(item.unitPrice)}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => onAddItem(item)}
                          className="gap-1 shrink-0"
                        >
                          <Plus className="h-3 w-3" />
                          Add
                        </Button>
                      </div>
                    ))}
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
