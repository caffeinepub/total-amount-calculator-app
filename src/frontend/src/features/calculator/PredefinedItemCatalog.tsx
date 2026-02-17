import { useState, useMemo, useRef } from 'react';
import { Search, Plus, Trash2, PackageX, Image as ImageIcon, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { CatalogItem } from './catalog';
import { formatCurrency } from './format';
import { getAddedCountForCatalogItem } from './lineItemCatalogMatching';
import { readImageFileAsDataUrl } from './utils/readImageFileAsDataUrl';
import { PredefinedItemCatalogProps } from './PredefinedItemCatalog.types';

export function PredefinedItemCatalog({
  items,
  lineItems,
  onAddItem,
  onAddNewItem,
  onDeleteItem,
  onToggleOutOfStock,
  onUpdateItemImage,
  onRemoveItemImage,
}: PredefinedItemCatalogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('');
  const [newItemImage, setNewItemImage] = useState<string | null>(null);
  const newItemImageInputRef = useRef<HTMLInputElement>(null);

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
    const grouped: Record<string, CatalogItem[]> = {};
    filteredItems.forEach((item) => {
      const category = item.category || 'Uncategorized';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(item);
    });
    return grouped;
  }, [filteredItems]);

  const handleNewItemImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await readImageFileAsDataUrl(file);
      setNewItemImage(dataUrl);
    } catch (error) {
      console.error('Error reading image:', error);
      alert('Failed to read image. Please select a valid image file.');
    }
  };

  const handleAddNewItem = () => {
    const price = parseFloat(newItemPrice);
    if (!newItemName.trim() || isNaN(price) || price < 0) {
      alert('Please enter a valid item name and price.');
      return;
    }

    onAddNewItem({
      name: newItemName.trim(),
      unitPrice: price,
      category: newItemCategory.trim() || 'Custom',
      outOfStock: false,
      image: newItemImage || undefined,
    });

    // Reset form
    setNewItemName('');
    setNewItemPrice('');
    setNewItemCategory('');
    setNewItemImage(null);
    if (newItemImageInputRef.current) {
      newItemImageInputRef.current.value = '';
    }
    setShowAddForm(false);
  };

  const handleItemImageChange = async (itemId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await readImageFileAsDataUrl(file);
      onUpdateItemImage(itemId, dataUrl);
    } catch (error) {
      console.error('Error reading image:', error);
      alert('Failed to read image. Please select a valid image file.');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Add Items</CardTitle>
        <CardDescription>Select items to add to your bill</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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
          <div className="space-y-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
            <div className="space-y-2">
              <Label htmlFor="new-item-name">Item Name</Label>
              <Input
                id="new-item-name"
                type="text"
                placeholder="e.g., Masala Chai"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-item-price">Price (₹)</Label>
              <Input
                id="new-item-price"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={newItemPrice}
                onChange={(e) => setNewItemPrice(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-item-category">Category (Optional)</Label>
              <Input
                id="new-item-category"
                type="text"
                placeholder="e.g., Beverages"
                value={newItemCategory}
                onChange={(e) => setNewItemCategory(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-item-image">Item image (optional)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="new-item-image"
                  ref={newItemImageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleNewItemImageSelect}
                  className="flex-1"
                />
                {newItemImage && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setNewItemImage(null);
                      if (newItemImageInputRef.current) {
                        newItemImageInputRef.current.value = '';
                      }
                    }}
                    className="h-9 w-9"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {newItemImage && (
                <div className="mt-2">
                  <img
                    src={newItemImage}
                    alt="Preview"
                    className="h-16 w-16 rounded-md object-cover border border-border"
                  />
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddNewItem} size="sm" className="flex-1">
                Save Item
              </Button>
              <Button
                onClick={() => {
                  setShowAddForm(false);
                  setNewItemName('');
                  setNewItemPrice('');
                  setNewItemCategory('');
                  setNewItemImage(null);
                  if (newItemImageInputRef.current) {
                    newItemImageInputRef.current.value = '';
                  }
                }}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
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

        {/* Catalog Items */}
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-6">
            {Object.entries(itemsByCategory).map(([category, categoryItems]) => (
              <div key={category} className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground">{category}</h3>
                <div className="space-y-2">
                  {categoryItems.map((item) => {
                    const addedCount = getAddedCountForCatalogItem(item.name, lineItems);
                    return (
                      <div
                        key={item.id}
                        className={`group flex items-center gap-3 rounded-lg border p-3 transition-colors ${
                          item.outOfStock
                            ? 'border-muted bg-muted/30'
                            : 'border-border bg-card hover:border-primary/50 hover:bg-accent/5'
                        }`}
                      >
                        {/* Item Image Thumbnail */}
                        {item.image && (
                          <div className="flex-shrink-0">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-12 w-12 rounded-md object-cover border border-border"
                            />
                          </div>
                        )}

                        {/* Item Details */}
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center gap-2">
                            <p
                              className={`font-medium truncate ${
                                item.outOfStock ? 'text-muted-foreground line-through' : ''
                              }`}
                            >
                              {item.name}
                            </p>
                            {item.outOfStock && (
                              <Badge variant="destructive" className="gap-1 text-xs flex-shrink-0">
                                <PackageX className="h-3 w-3" />
                                Out of Stock
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {formatCurrency(item.unitPrice)}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {/* Image Actions */}
                          <div className="flex items-center gap-1">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleItemImageChange(item.id, e)}
                              className="hidden"
                              id={`image-input-${item.id}`}
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => document.getElementById(`image-input-${item.id}`)?.click()}
                              className="h-8 w-8"
                              title={item.image ? 'Change image' : 'Add image'}
                            >
                              <ImageIcon className="h-4 w-4" />
                            </Button>
                            {item.image && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onRemoveItemImage(item.id)}
                                className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                title="Remove image"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>

                          {/* Out of Stock Toggle */}
                          <div className="flex items-center gap-1.5">
                            <Switch
                              id={`stock-${item.id}`}
                              checked={item.outOfStock}
                              onCheckedChange={() => onToggleOutOfStock(item.id)}
                              className="scale-75"
                            />
                            <Label
                              htmlFor={`stock-${item.id}`}
                              className="cursor-pointer text-xs text-muted-foreground whitespace-nowrap"
                            >
                              Out of stock
                            </Label>
                          </div>

                          {/* Delete Button */}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDeleteItem(item.id)}
                            className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>

                          {/* Add Button */}
                          <Button
                            onClick={() => onAddItem(item)}
                            size="sm"
                            disabled={item.outOfStock}
                            className="relative gap-1"
                          >
                            <Plus className="h-4 w-4" />
                            Add
                            {addedCount > 0 && (
                              <Badge
                                variant="secondary"
                                className="ml-1 h-5 min-w-5 px-1.5 text-xs"
                              >
                                {addedCount}
                              </Badge>
                            )}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
