export interface ParsedInvoiceData {
  customerName: string;
  customerAddress: string;
  gstin: string;
  invoiceNumber: string;
  invoiceDate: string;
  warrantyNumber: string;
  companyName: string;
  productName: string;
  quantity: number;
  manufacturer: string;
  // Seller info
  sellerName: string;
  sellerAddress: string;
  sellerGstin: string;
  placeOfSupply: string;
}

const normalizeText = (value: string) => value.replace(/\r\n/g, '\n').trim();

export const extractInvoiceDetailsFromText = (text: string): ParsedInvoiceData => {
  const normalizedText = normalizeText(text);
  const lines = normalizedText.split('\n').map((l) => l.trim()).filter(Boolean);

  // Invoice number: line containing "Tax Invoice" e.g. "Tax Invoice SL/FY26-27/635"
  const invoiceNumLine = lines.find((l) => /^tax invoice\s+\S/i.test(l)) || '';
  const invoiceNumber = invoiceNumLine.replace(/^tax invoice\s+/i, '').trim() || 'N/A';

  // Invoice date: line after "Invoice Date"
  const invDateIdx = lines.findIndex((l) => /^invoice date$/i.test(l));
  const invoiceDate = invDateIdx >= 0 ? (lines[invDateIdx + 1] || 'N/A') : 'N/A';

  // Place of supply
  const placeOfSupplyLine = lines.find((l) => /^place of supply:/i.test(l)) || '';
  const placeOfSupply = placeOfSupplyLine.replace(/^place of supply:\s*/i, '').trim();

  // Buyer block: starts after "Total amount in words" block, ends at GSTIN line
  // Lines 9-15 in our PDF: Dhooli Controls, address lines, GSTIN
  const wordsIdx = lines.findIndex((l) => /total amount in words/i.test(l));
  let buyerName = '';
  let buyerAddressParts: string[] = [];
  let buyerGstin = '';
  if (wordsIdx >= 0) {
    // Skip "Twenty-Seven..." lines, find first non-amount line
    let i = wordsIdx + 1;
    while (i < lines.length && /rupees|lakh|thousand|hundred|crore/i.test(lines[i])) i++;
    buyerName = lines[i] || '';
    i++;
    while (i < lines.length && !/^gstin:/i.test(lines[i]) && !/^place of supply/i.test(lines[i]) && !/^tax invoice/i.test(lines[i])) {
      buyerAddressParts.push(lines[i]);
      i++;
    }
    if (/^gstin:/i.test(lines[i] || '')) {
      buyerGstin = lines[i].replace(/^gstin:\s*/i, '').trim();
    }
  }

  // Seller block: "SUNLECTRIC PRIVATE LIMITED" appears after Terms and conditions
  const sellerIdx = lines.findIndex((l) => /sunlectric private limited/i.test(l));
  let sellerName = '';
  let sellerAddressParts: string[] = [];
  let sellerGstin = '';
  if (sellerIdx >= 0) {
    sellerName = lines[sellerIdx];
    let i = sellerIdx + 1;
    while (i < lines.length && !/^gstin:/i.test(lines[i]) && !/^bank details/i.test(lines[i])) {
      sellerAddressParts.push(lines[i].replace(/,$/, '').trim());
      i++;
    }
    if (/^gstin:/i.test(lines[i] || '')) {
      sellerGstin = lines[i].replace(/^gstin:\s*/i, '').trim();
    }
  }

  // Product name and quantity from Description/HSN table
  let productName = '';
  let quantity = 0;
  const descHeaderIdx = lines.findIndex((l) => /description.*hsn/i.test(l));
  if (descHeaderIdx >= 0) {
    const nameParts: string[] = [];
    for (let i = descHeaderIdx + 1; i < Math.min(descHeaderIdx + 6, lines.length); i++) {
      const qtyMatch = lines[i].match(/^\d{8}(\d+)\./);
      if (qtyMatch) { quantity = parseInt(qtyMatch[1], 10); break; }
      nameParts.push(lines[i].trim());
    }
    productName = nameParts.filter(Boolean).join(' ').trim();
  }
  if (!quantity) {
    const fallback = normalizedText.match(/^\d{8}(\d+)\./m);
    if (fallback) quantity = parseInt(fallback[1], 10);
  }

  return {
    customerName: buyerName || 'Customer',
    customerAddress: buyerAddressParts.join('\n') || 'Address not found',
    gstin: buyerGstin,
    invoiceNumber,
    invoiceDate,
    warrantyNumber: `Tax Invoice ${invoiceNumber}`,
    companyName: sellerName || 'SUNLECTRIC PRIVATE LIMITED',
    productName: productName || 'Product',
    quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : 0,
    manufacturer: 'RAYZON',
    sellerName: sellerName || 'SUNLECTRIC PRIVATE LIMITED',
    sellerAddress: sellerAddressParts.join('\n'),
    sellerGstin,
    placeOfSupply,
  };
};
