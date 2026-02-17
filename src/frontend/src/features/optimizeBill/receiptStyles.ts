export type ReceiptStyleId = 'classic' | 'compact';

export interface ReceiptStyle {
  id: ReceiptStyleId;
  name: string;
  description: string;
}

export const RECEIPT_STYLES: ReceiptStyle[] = [
  {
    id: 'classic',
    name: 'Classic',
    description: 'Traditional receipt with clear spacing and borders',
  },
  {
    id: 'compact',
    name: 'Compact',
    description: 'Space-efficient layout with minimal borders',
  },
];

export const DEFAULT_RECEIPT_STYLE: ReceiptStyleId = 'classic';
