import { describe, it, expect } from 'vitest';
import {
  calculateLineTotal,
  calculateSubtotal,
  calculateTaxTotal,
  calculateDiscountAmount,
  calculateInvoiceTotal,
  CalculationItemInput
} from '../src/utils/calculations';

describe('Billing Calculation Engine', () => {
  it('should correctly calculate single line item total and tax', () => {
    const item: CalculationItemInput = {
      description: 'Website Development',
      quantity: 1,
      unitPrice: 2500000, // $25,000.00 in minor units
      taxRate: 18,        // 18% tax
    };

    const calculated = calculateLineTotal(item);
    expect(calculated.lineSubtotal).toBe(2500000);
    expect(calculated.lineTax).toBe(450000); // 18% of 2500000 = 450000
    expect(calculated.lineTotal).toBe(2950000);
  });

  it('should handle zero tax rate correctly', () => {
    const item: CalculationItemInput = {
      description: 'Consulting',
      quantity: 2,
      unitPrice: 100000, // $1,000.00
      taxRate: 0,
    };

    const calculated = calculateLineTotal(item);
    expect(calculated.lineSubtotal).toBe(200000);
    expect(calculated.lineTax).toBe(0);
    expect(calculated.lineTotal).toBe(200000);
  });

  it('should correctly sum subtotals across multiple items', () => {
    const items: CalculationItemInput[] = [
      { description: 'Item A', quantity: 1, unitPrice: 10000, taxRate: 10 },
      { description: 'Item B', quantity: 3, unitPrice: 20000, taxRate: 5 },
    ];

    const result = calculateInvoiceTotal(items, 'PERCENTAGE', 0);
    expect(result.subtotal).toBe(70000); // 10000 + 60000
    expect(result.taxTotal).toBe(4000);  // (10% of 10000) + (5% of 60000) = 1000 + 3000
    expect(result.discountAmount).toBe(0);
    expect(result.total).toBe(74000);
  });

  it('should correctly calculate percentage discount', () => {
    const subtotal = 100000; // $1,000.00
    const discount = calculateDiscountAmount(subtotal, 'PERCENTAGE', 15); // 15%
    expect(discount).toBe(15000);
  });

  it('should correctly calculate fixed discount and cap at subtotal', () => {
    const subtotal = 50000;
    const fixedDiscount = calculateDiscountAmount(subtotal, 'FIXED', 20000);
    expect(fixedDiscount).toBe(20000);

    const excessiveDiscount = calculateDiscountAmount(subtotal, 'FIXED', 999999);
    expect(excessiveDiscount).toBe(50000); // Capped at subtotal
  });

  it('should calculate complete invoice total with discount and tax', () => {
    const items: CalculationItemInput[] = [
      { description: 'Hosting', quantity: 1, unitPrice: 300000, taxRate: 18 }, // $3000, 18% tax ($540)
    ];

    // 10% discount on subtotal 300000 = 30000 discount
    const summary = calculateInvoiceTotal(items, 'PERCENTAGE', 10);
    expect(summary.subtotal).toBe(300000);
    expect(summary.discountAmount).toBe(30000);
    expect(summary.taxTotal).toBe(54000);
    expect(summary.total).toBe(300000 - 30000 + 54000); // 324000
  });

  it('should gracefully sanitize invalid quantities and prices', () => {
    const item: CalculationItemInput = {
      description: 'Edge case item',
      quantity: -5,
      unitPrice: -1000,
      taxRate: -10,
    };

    const calculated = calculateLineTotal(item);
    expect(calculated.quantity).toBe(0);
    expect(calculated.unitPrice).toBe(0);
    expect(calculated.lineSubtotal).toBe(0);
    expect(calculated.lineTotal).toBe(0);
  });
});
