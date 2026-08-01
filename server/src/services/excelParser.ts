const HEADER_KEYWORDS = ['serial', 'lot', 'number', 'display', 'product', 'description', 'item', 'name', 'no.', 'header'];

const isHeaderCell = (value: string) => {
  const lower = value.toLowerCase();
  return HEADER_KEYWORDS.some((kw) => lower.includes(kw));
};

const looksLikeSerial = (value: string) => /^[A-Z0-9]{6,}$/i.test(value.trim());

export const extractSerialNumbersFromRows = (rows: unknown[][]): string[] => {
  if (!rows.length) return [];

  // Find which column contains serial numbers by scanning header row
  const headerRow = rows[0] as unknown[];
  let serialCol = -1;
  for (let c = 0; c < headerRow.length; c++) {
    const cell = String(headerRow[c] ?? '').toLowerCase();
    if (cell.includes('serial') || cell.includes('lot')) {
      serialCol = c;
      break;
    }
  }

  const serials: string[] = [];

  // If we found a serial column, extract from that column (skip header row)
  if (serialCol >= 0) {
    for (let r = 1; r < rows.length; r++) {
      const row = rows[r] as unknown[];
      const value = String(row[serialCol] ?? '').trim();
      if (value && !isHeaderCell(value)) serials.push(value);
    }
    return serials;
  }

  // Fallback: scan all cells for serial-like values
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r] as unknown[];
    for (const cell of row) {
      const value = String(cell ?? '').trim();
      if (value && !isHeaderCell(value) && looksLikeSerial(value)) {
        serials.push(value);
        break;
      }
    }
  }

  return serials;
};
