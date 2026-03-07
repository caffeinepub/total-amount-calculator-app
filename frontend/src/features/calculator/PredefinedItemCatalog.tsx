import { useState, useMemo, useRef } from 'react';
import { Search, Plus, Trash2, PackageX, Image as ImageIcon, X, Upload } from 'lucide-react';
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
              <Label>Item image (optional)</Label>
              <div className="flex items-start gap-3">
                {/* Fixed-size thumbnail preview slot */}
                <div className="flex-shrink-0 h-16 w-16 rounded-md border border-border overflow-hidden bg-muted flex items-center justify-center">
                  {newItemImage ? (
                    <img
                      src={newItemImage}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                
                {/* Hidden file input */}
                <input
                  ref={newItemImageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleNewItemImageSelect}
                  className="hidden"
                  id="new-item-image-input"
                />
                
                {/* Image action buttons */}
                <div className="flex flex-col gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => newItemImageInputRef.current?.click()}
                    className="gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    {newItemImage ? 'Change Image' : 'Upload Image'}
                  </Button>
                  {newItemImage && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setNewItemImage(null);
                        if (newItemImageInputRef.current) {
                          newItemImageInputRef.current.value = '';
                        }
                      }}
                      className="gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                      Remove Image
                    </Button>
                  )}
                </div>
              </div>
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
                        className={`group rounded-lg border p-3 transition-colors ${
                          item.outOfStock
                            ? 'border-muted bg-muted/30'
                            : 'border-border bg-card hover:border-primary/50 hover:bg-accent/5'
                        }`}
                      >
                        {/* Main row with image and details */}
                        <div className="flex items-start gap-3 mb-3">
                          {/* Fixed-size thumbnail slot - always rendered */}
                          <div className="flex-shrink-0 h-16 w-16 rounded-md border border-border overflow-hidden bg-muted flex items-center justify-center">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <ImageIcon className="h-6 w-6 text-muted-foreground" />
                            )}
                          </div>

                          {/* Item Details */}
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p
                                className={`font-medium ${
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
                        </div>

                        {/* Actions row - responsive layout */}
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Add Button - Primary action, always visible */}
                          <Button
                            onClick={() => onAddItem(item)}
                            size="sm"
                            disabled={item.outOfStock}
                            className="relative gap-1 flex-shrink-0"
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

                          {/* Secondary actions */}
                          <div className="flex items-center gap-2 flex-wrap">
                            {/* Image Actions - hidden file input with button triggers */}
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
                              title="Delete item"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
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
