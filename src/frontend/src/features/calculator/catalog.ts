/**
 * Predefined catalog of items with fixed prices for quick add to calculator
 */

export interface CatalogItem {
  id: string;
  name: string;
  unitPrice: number;
  category?: string;
}

export const PREDEFINED_CATALOG: CatalogItem[] = [
  // Office Supplies
  { id: 'pen-blue', name: 'Blue Pen', unitPrice: 1.50, category: 'Office Supplies' },
  { id: 'pen-black', name: 'Black Pen', unitPrice: 1.50, category: 'Office Supplies' },
  { id: 'notebook-a4', name: 'A4 Notebook', unitPrice: 5.99, category: 'Office Supplies' },
  { id: 'stapler', name: 'Stapler', unitPrice: 12.99, category: 'Office Supplies' },
  { id: 'paper-ream', name: 'Paper Ream (500 sheets)', unitPrice: 8.50, category: 'Office Supplies' },
  
  // Electronics
  { id: 'usb-cable', name: 'USB-C Cable', unitPrice: 15.99, category: 'Electronics' },
  { id: 'mouse-wireless', name: 'Wireless Mouse', unitPrice: 29.99, category: 'Electronics' },
  { id: 'keyboard', name: 'Keyboard', unitPrice: 49.99, category: 'Electronics' },
  { id: 'hdmi-cable', name: 'HDMI Cable', unitPrice: 12.99, category: 'Electronics' },
  
  // Furniture
  { id: 'desk-chair', name: 'Office Chair', unitPrice: 199.99, category: 'Furniture' },
  { id: 'desk', name: 'Standing Desk', unitPrice: 399.99, category: 'Furniture' },
  { id: 'lamp', name: 'Desk Lamp', unitPrice: 34.99, category: 'Furniture' },
  
  // Services
  { id: 'consulting-hour', name: 'Consulting (per hour)', unitPrice: 150.00, category: 'Services' },
  { id: 'design-hour', name: 'Design Work (per hour)', unitPrice: 100.00, category: 'Services' },
  { id: 'development-hour', name: 'Development (per hour)', unitPrice: 125.00, category: 'Services' },
];
