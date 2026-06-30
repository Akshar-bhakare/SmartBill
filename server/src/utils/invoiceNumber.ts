/**
 * Generates a standard formatted invoice number string, e.g., INV-2026-001
 */
export function generateInvoiceNumber(sequence: number, year: number = new Date().getFullYear()): string {
  const paddedSeq = String(sequence).padStart(3, '0');
  return `INV-${year}-${paddedSeq}`;
}
