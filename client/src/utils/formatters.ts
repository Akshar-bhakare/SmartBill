/**
 * Formats minor units (e.g., 2500000) into a formatted currency string (e.g., "$25,000.00")
 */
export function formatCurrency(minorUnits: number = 0): string {
  const majorUnits = (minorUnits || 0) / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(majorUnits);
}

/**
 * Converts a major unit number (e.g. 25000.50) to minor unit integer (e.g. 2500050)
 */
export function toMinorUnits(majorUnits: number = 0): number {
  return Math.round((majorUnits || 0) * 100);
}

/**
 * Converts minor unit integer to major unit number (e.g. 2500050 -> 25000.50)
 */
export function toMajorUnits(minorUnits: number = 0): number {
  return (minorUnits || 0) / 100;
}

/**
 * Formats Date string to readable format e.g. "Jul 27, 2026"
 */
export function formatDate(dateString?: string | Date): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

/**
 * Formats YYYY-MM-DD for input[type="date"]
 */
export function toInputDateString(dateString?: string | Date): string {
  if (!dateString) return new Date().toISOString().split('T')[0];
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return new Date().toISOString().split('T')[0];
  return d.toISOString().split('T')[0];
}
