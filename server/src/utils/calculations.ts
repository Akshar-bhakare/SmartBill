export interface CalculationItemInput {
  description: string;
  quantity: number;
  unitPrice: number; // In minor units (e.g. 2500000 = 25000.00)
  taxRate: number;   // Percentage (e.g., 18 for 18%)
}

export interface LineItemCalculated extends CalculationItemInput {
  lineSubtotal: number;
  lineTax: number;
  lineTotal: number;
}

export interface InvoiceCalculationSummary {
  items: LineItemCalculated[];
  subtotal: number;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  discountAmount: number;
  taxTotal: number;
  total: number;
}

/**
 * Calculates line subtotal, tax, and total for a single invoice item.
 * All monetary amounts are returned in minor units (integers).
 */
export function calculateLineTotal(item: CalculationItemInput): LineItemCalculated {
  const quantity = Math.max(0, Math.floor(item.quantity || 0));
  const unitPrice = Math.max(0, Math.floor(item.unitPrice || 0));
  const taxRate = Math.max(0, item.taxRate || 0);

  const lineSubtotal = quantity * unitPrice;
  const lineTax = Math.round(lineSubtotal * (taxRate / 100));
  const lineTotal = lineSubtotal + lineTax;

  return {
    ...item,
    quantity,
    unitPrice,
    taxRate,
    lineSubtotal,
    lineTax,
    lineTotal,
  };
}

/**
 * Calculates subtotal for an array of calculated line items.
 */
export function calculateSubtotal(calculatedItems: LineItemCalculated[]): number {
  return calculatedItems.reduce((acc, item) => acc + item.lineSubtotal, 0);
}

/**
 * Calculates tax total across all line items.
 */
export function calculateTaxTotal(calculatedItems: LineItemCalculated[]): number {
  return calculatedItems.reduce((acc, item) => acc + item.lineTax, 0);
}

/**
 * Calculates discount amount in minor units based on subtotal and discount type/value.
 */
export function calculateDiscountAmount(
  subtotal: number,
  discountType: 'PERCENTAGE' | 'FIXED',
  discountValue: number
): number {
  const val = Math.max(0, discountValue || 0);
  if (discountType === 'PERCENTAGE') {
    const cappedPercent = Math.min(100, val);
    return Math.round(subtotal * (cappedPercent / 100));
  } else {
    // FIXED: value is passed in minor units (or scaled integer)
    return Math.min(subtotal, Math.floor(val));
  }
}

/**
 * Recalculates the complete invoice calculations safely on the backend.
 * Guaranteed to be floating-point safe and deterministic.
 */
export function calculateInvoiceTotal(
  items: CalculationItemInput[],
  discountType: 'PERCENTAGE' | 'FIXED' = 'PERCENTAGE',
  discountValue: number = 0
): InvoiceCalculationSummary {
  const calculatedItems = items.map(calculateLineTotal);
  const subtotal = calculateSubtotal(calculatedItems);
  const taxTotal = calculateTaxTotal(calculatedItems);
  const discountAmount = calculateDiscountAmount(subtotal, discountType, discountValue);
  const total = Math.max(0, subtotal - discountAmount + taxTotal);

  return {
    items: calculatedItems,
    subtotal,
    discountType,
    discountValue,
    discountAmount,
    taxTotal,
    total,
  };
}
