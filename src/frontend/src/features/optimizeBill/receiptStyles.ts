export type ReceiptStyleId = "classic" | "compact" | "thermal" | "vintage";

export interface ReceiptStyle {
  id: ReceiptStyleId;
  name: string;
  description: string;
}

export const RECEIPT_STYLES: ReceiptStyle[] = [
  {
    id: "classic",
    name: "Classic",
    description: "Traditional receipt with clear spacing and borders",
  },
  {
    id: "compact",
    name: "Compact",
    description: "Space-efficient layout with minimal borders",
  },
  {
    id: "thermal",
    name: "Thermal",
    description:
      "Narrow thermal-printer style bill with dashed separators, ideal for point-of-sale printers",
  },
  {
    id: "vintage",
    name: "Vintage",
    description:
      "Classic monospaced thermal-paper receipt with GST, service charge, tip line and vintage styling",
  },
];

export const DEFAULT_RECEIPT_STYLE: ReceiptStyleId = "classic";
