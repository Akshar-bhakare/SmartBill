import fs from 'fs';
import path from 'path';
import { ParsedInvoiceData } from './invoiceParser.js';

export interface ValidationResult {
  ok: boolean;
  message: string;
}

export interface WarrantyRow {
  srNo: number;
  itemName: string;
  serialNo: string;
  manufacturer: string;
}

export const validateSerialCount = (expectedQuantity: number, actualCount: number): ValidationResult => {
  if (expectedQuantity === actualCount) {
    return {
      ok: true,
      message: `Quantity matched. Found ${actualCount} serial numbers.`,
    };
  }

  return {
    ok: false,
    message: `Quantity mismatch. Expected ${expectedQuantity} serial numbers. Found ${actualCount}.`,
  };
};

export const buildWarrantyRows = (serialNumbers: string[], invoiceData: ParsedInvoiceData): WarrantyRow[] => {
  return serialNumbers.map((serialNo, index) => ({
    srNo: index + 1,
    itemName: invoiceData.productName || 'Product',
    serialNo,
    manufacturer: invoiceData.manufacturer || 'RAYZON',
  }));
};

export const renderWarrantyTemplate = (
  invoiceData: ParsedInvoiceData,
  rows: WarrantyRow[],
  templatePath?: string
): string => {
  const resolvedTemplatePath = templatePath || path.resolve(process.cwd(), 'templates/warranty.html');
  const template = fs.readFileSync(resolvedTemplatePath, 'utf8');

  const rowsHtml = rows
    .map(
      (row) => `
        <tr>
          <td>${row.srNo}</td>
          <td>${row.itemName}</td>
          <td>${row.serialNo}</td>
          <td>${row.manufacturer}</td>
        </tr>`
    )
    .join('');

  return template
    .replace(/\{\{customerName\}\}/g, invoiceData.customerName)
    .replace(/\{\{invoiceNo\}\}/g, invoiceData.invoiceNumber)
    .replace(/\{\{invoiceDate\}\}/g, invoiceData.invoiceDate)
    .replace(/\{\{address\}\}/g, invoiceData.customerAddress)
    .replace(/\{\{gst\}\}/g, invoiceData.gstin)
    .replace(/\{\{product\}\}/g, invoiceData.productName)
    .replace(/\{\{manufacturer\}\}/g, invoiceData.manufacturer)
    .replace(/\{\{serialRows\}\}/g, rowsHtml);
};
