import { describe, it, expect } from 'vitest';
import { extractInvoiceDetailsFromText } from '../src/services/invoiceParser.js';
import { extractSerialNumbersFromRows } from '../src/services/excelParser.js';
import { validateSerialCount } from '../src/services/warrantyGenerator.js';

describe('warranty parsing services', () => {
  it('extracts invoice details from invoice text', () => {
    const sampleText = `
      Invoice No
      SL/FY26-27/635

      Invoice Date
      31/07/2026

      Customer
      Dhooli Controls

      GSTIN
      29ABCDE1234F1Z5

      Product
      Rayzon 550Wp PERC BF DCR Solar Module

      Qty
      216
    `;

    const result = extractInvoiceDetailsFromText(sampleText);

    expect(result.invoiceNumber).toBe('SL/FY26-27/635');
    expect(result.invoiceDate).toBe('31/07/2026');
    expect(result.customerName).toBe('Dhooli Controls');
    expect(result.gstin).toBe('29ABCDE1234F1Z5');
    expect(result.productName).toBe('Rayzon 550Wp PERC BF DCR Solar Module');
    expect(result.quantity).toBe(216);
  });

  it('extracts serial numbers from rows while ignoring headers', () => {
    const rows = [
      ['Serial No'],
      ['RSCB3M0060726159979'],
      ['RSCB3M0060726159984'],
      [''],
      ['RSCB3M0060726159990'],
    ];

    const result = extractSerialNumbersFromRows(rows);

    expect(result).toEqual([
      'RSCB3M0060726159979',
      'RSCB3M0060726159984',
      'RSCB3M0060726159990',
    ]);
  });

  it('validates a matching quantity and reports a mismatch clearly', () => {
    const matching = validateSerialCount(216, 216);
    expect(matching.ok).toBe(true);

    const mismatch = validateSerialCount(216, 213);
    expect(mismatch.ok).toBe(false);
    expect(mismatch.message).toContain('Quantity mismatch');
    expect(mismatch.message).toContain('216');
    expect(mismatch.message).toContain('213');
  });
});
