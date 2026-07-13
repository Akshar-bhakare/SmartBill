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
}

const normalizeText = (value: string) => value.replace(/\r\n/g, '\n').trim();

const extractByLabel = (text: string, labels: string[]): string => {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const lowerLine = line.toLowerCase();

    const matchedLabel = labels.find((label) => lowerLine.includes(label.toLowerCase()));
    if (!matchedLabel) continue;

    const valueFromSameLine = line
      .replace(new RegExp(matchedLabel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), '')
      .replace(/[:\-]+$/, '')
      .trim();

    if (valueFromSameLine && !valueFromSameLine.toLowerCase().includes('invoice') && !valueFromSameLine.toLowerCase().includes('customer')) {
      return valueFromSameLine;
    }

    for (let nextIndex = index + 1; nextIndex < lines.length; nextIndex += 1) {
      const nextLine = lines[nextIndex].replace(/[:\-]+$/, '').trim();
      if (!nextLine) continue;
      if (labels.some((label) => lines[nextIndex].toLowerCase().includes(label.toLowerCase()))) {
        break;
      }
      return nextLine;
    }
  }

  return '';
};

export const extractInvoiceDetailsFromText = (text: string): ParsedInvoiceData => {
  const normalizedText = normalizeText(text);
  const lines = normalizedText.split('\n').map((l) => l.trim()).filter(Boolean);

  const invoiceNumber = extractByLabel(normalizedText, ['tax invoice', 'invoice no', 'invoice number', 'invoice no.']);
  const invoiceDate = extractByLabel(normalizedText, ['invoice date', 'date']);
  const customerName = extractByLabel(normalizedText, ['customer', 'customer name', 'bill to']);
  const gstin = extractByLabel(normalizedText, ['gstin', 'gst no', 'gst number']);
  const warrantyNumber = extractByLabel(normalizedText, ['warranty no', 'warranty number']);
  const companyName = extractByLabel(normalizedText, ['company', 'manufacturer']);
  const manufacturer = companyName || 'RAYZON';
  const customerAddress = extractByLabel(normalizedText, ['address', 'customer address']);

  // Extract product name and quantity from lines after the Description/HSN header
  let productName = '';
  let quantity = 0;
  const descHeaderIdx = lines.findIndex((l) => /description.*hsn/i.test(l));
  if (descHeaderIdx >= 0) {
    // Collect lines after header until we hit the qty/price line (contains 'Units')
    const nameParts: string[] = [];
    for (let i = descHeaderIdx + 1; i < Math.min(descHeaderIdx + 6, lines.length); i++) {
      const l = lines[i];
      // HSN code (8 digits) is glued to qty e.g. "85414300216.00 Units" — strip 8-digit HSN prefix
      const qtyMatch = l.match(/^\d{8}(\d+)\./);
      if (qtyMatch) {
        quantity = parseInt(qtyMatch[1], 10);
        break;
      }
      nameParts.push(l.replace(/^\[.*?\]\s*/, '').trim());
    }
    productName = nameParts.filter(Boolean).join(' ').trim();
  }
  if (!productName) productName = extractByLabel(normalizedText, ['product', 'item', 'description']);
  // Fallback quantity patterns
  if (!quantity) {
    const fallback = normalizedText.match(/^\d{8}(\d+)\./m);
    if (fallback) quantity = parseInt(fallback[1], 10);
  }

  return {
    customerName: customerName || 'Customer',
    customerAddress: customerAddress || 'Address not found',
    gstin: gstin || '',
    invoiceNumber: invoiceNumber || 'N/A',
    invoiceDate: invoiceDate || 'N/A',
    warrantyNumber: warrantyNumber || '',
    companyName: companyName || 'RAYZON',
    productName: productName || 'Product',
    quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : 0,
    manufacturer,
  };
};
