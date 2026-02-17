import { CatalogItem } from './catalog';
import { LineItem } from './types';

export interface PredefinedItemCatalogProps {
  items: CatalogItem[];
  lineItems: LineItem[];
  onAddItem: (item: CatalogItem) => void;
  onAddNewItem: (item: Omit<CatalogItem, 'id'>) => void;
  onDeleteItem: (id: string) => void;
  onToggleOutOfStock: (id: string) => void;
  onUpdateItemImage: (id: string, imageDataUrl: string) => void;
  onRemoveItemImage: (id: string) => void;
}
