/**
 * Generates a unique bill code for a new bill
 * Format: BILL-YYYYMMDD-HHMMSS-XXXX
 * Where XXXX is a random 4-character alphanumeric suffix
 */
export function generateBillCode(): string {
  const now = new Date();
  
  // Date part: YYYYMMDD
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const datePart = `${year}${month}${day}`;
  
  // Time part: HHMMSS
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const timePart = `${hours}${minutes}${seconds}`;
  
  // Random suffix: 4 alphanumeric characters
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomSuffix = '';
  for (let i = 0; i < 4; i++) {
    randomSuffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return `BILL-${datePart}-${timePart}-${randomSuffix}`;
}
