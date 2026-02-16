/**
 * Predefined catalog of items with fixed prices for quick add to calculator
 */

export interface CatalogItem {
  id: string;
  name: string;
  unitPrice: number;
  category?: string;
  outOfStock?: boolean;
}

export const PREDEFINED_CATALOG: CatalogItem[] = [
  // South Indian
  { id: 'idli', name: 'Idli (2 pcs)', unitPrice: 40, category: 'South Indian', outOfStock: false },
  { id: 'dosa-plain', name: 'Plain Dosa', unitPrice: 50, category: 'South Indian', outOfStock: false },
  { id: 'dosa-masala', name: 'Masala Dosa', unitPrice: 70, category: 'South Indian', outOfStock: false },
  { id: 'vada', name: 'Medu Vada (2 pcs)', unitPrice: 45, category: 'South Indian', outOfStock: false },
  { id: 'uttapam', name: 'Uttapam', unitPrice: 65, category: 'South Indian', outOfStock: false },
  
  // North Indian
  { id: 'chapati', name: 'Chapati (2 pcs)', unitPrice: 30, category: 'North Indian', outOfStock: false },
  { id: 'naan', name: 'Butter Naan', unitPrice: 40, category: 'North Indian', outOfStock: false },
  { id: 'paratha', name: 'Aloo Paratha', unitPrice: 60, category: 'North Indian', outOfStock: false },
  { id: 'kulcha', name: 'Kulcha', unitPrice: 50, category: 'North Indian', outOfStock: false },
  
  // Rice & Biryani
  { id: 'rice-plain', name: 'Plain Rice', unitPrice: 50, category: 'Rice & Biryani', outOfStock: false },
  { id: 'biryani-veg', name: 'Veg Biryani', unitPrice: 150, category: 'Rice & Biryani', outOfStock: false },
  { id: 'biryani-chicken', name: 'Chicken Biryani', unitPrice: 200, category: 'Rice & Biryani', outOfStock: false },
  { id: 'biryani-mutton', name: 'Mutton Biryani', unitPrice: 250, category: 'Rice & Biryani', outOfStock: false },
  { id: 'pulao', name: 'Veg Pulao', unitPrice: 120, category: 'Rice & Biryani', outOfStock: false },
  
  // Curries
  { id: 'dal-tadka', name: 'Dal Tadka', unitPrice: 100, category: 'Curries', outOfStock: false },
  { id: 'dal-makhani', name: 'Dal Makhani', unitPrice: 130, category: 'Curries', outOfStock: false },
  { id: 'paneer-butter-masala', name: 'Paneer Butter Masala', unitPrice: 180, category: 'Curries', outOfStock: false },
  { id: 'palak-paneer', name: 'Palak Paneer', unitPrice: 170, category: 'Curries', outOfStock: false },
  { id: 'chicken-curry', name: 'Chicken Curry', unitPrice: 200, category: 'Curries', outOfStock: false },
  
  // Snacks
  { id: 'samosa', name: 'Samosa (2 pcs)', unitPrice: 30, category: 'Snacks', outOfStock: false },
  { id: 'pakora', name: 'Pakora (6 pcs)', unitPrice: 50, category: 'Snacks', outOfStock: false },
  { id: 'pav-bhaji', name: 'Pav Bhaji', unitPrice: 80, category: 'Snacks', outOfStock: false },
  { id: 'chaat', name: 'Chaat', unitPrice: 60, category: 'Snacks', outOfStock: false },
  
  // Beverages
  { id: 'chai', name: 'Masala Chai', unitPrice: 20, category: 'Beverages', outOfStock: false },
  { id: 'lassi', name: 'Lassi', unitPrice: 40, category: 'Beverages', outOfStock: false },
  { id: 'coffee', name: 'Filter Coffee', unitPrice: 30, category: 'Beverages', outOfStock: false },
  
  // Desserts
  { id: 'gulab-jamun', name: 'Gulab Jamun (2 pcs)', unitPrice: 50, category: 'Desserts', outOfStock: false },
  { id: 'rasgulla', name: 'Rasgulla (2 pcs)', unitPrice: 50, category: 'Desserts', outOfStock: false },
  { id: 'kheer', name: 'Kheer', unitPrice: 60, category: 'Desserts', outOfStock: false },
];
