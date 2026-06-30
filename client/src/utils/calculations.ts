import { DiscountType } from '../types/invoice';
import { toMinorUnits } from './formatters';

export interface FormItemInput {
  description: string;
  quantity: number;
  unitPrice: number; // In major units (e.g. 2500.00)
  taxRate: number;   // Percentage e.g. 18
}

export interface FormCalculationResult {
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
    lineSubtotalMinor: number;
    lineTaxMinor: number;
    lineTotalMinor: number;
  }[];
  subtotalMinor: number;
  discountAmountMinor: number;
  taxTotalMinor: number;
  totalMinor: number;
}

export function calculateLiveTotals(
  items: FormItemInput[],
  discountType: DiscountType,
  discountValue: number
): FormCalculationResult {
  let subtotalMinor = 0;
  let taxTotalMinor = 0;

  const calculatedItems = items.map((item) => {
    const qty = Math.max(0, item.quantity || 0);
    const unitPriceMinor = toMinorUnits(item.unitPrice || 0);
    const taxRate = Math.max(0, item.taxRate || 0);

    const lineSubtotalMinor = qty * unitPriceMinor;
    const lineTaxMinor = Math.round(lineSubtotalMinor * (taxRate / 100));
    const lineTotalMinor = lineSubtotalMinor + lineTaxMinor;

    subtotalMinor += lineSubtotalMinor;
    taxTotalMinor += lineTaxMinor;

    return {
      description: item.description,
      quantity: qty,
      unitPrice: item.unitPrice,
      taxRate,
      lineSubtotalMinor,
      lineTaxMinor,
      lineTotalMinor,
    };
  });

  let discountAmountMinor = 0;
  const discVal = Math.max(0, discountValue || 0);
  if (discountType === 'PERCENTAGE') {
    const capped = Math.min(100, discVal);
    discountAmountMinor = Math.round(subtotalMinor * (capped / 100));
  } else {
    discountAmountMinor = Math.min(subtotalMinor, toMinorUnits(discVal));
  }

  const totalMinor = Math.max(0, subtotalMinor - discountAmountMinor + taxTotalMinor);

  return {
    items: calculatedItems,
    subtotalMinor,
    discountAmountMinor,
    taxTotalMinor,
    totalMinor,
  };
}
