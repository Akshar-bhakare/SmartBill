export const extractSerialNumbersFromRows = (rows: unknown[][]): string[] => {
  const serials: string[] = [];

  rows.forEach((row) => {
    if (!Array.isArray(row)) return;

    const firstCell = row[0];
    if (typeof firstCell !== 'string') return;

    const value = firstCell.trim();
    if (!value) return;

    const lowerValue = value.toLowerCase();
    if (
      lowerValue.includes('serial') ||
      lowerValue.includes('no.') ||
      lowerValue.includes('header')
    ) {
      return;
    }

    if (/^[a-z0-9-]+$/i.test(value) || value.length >= 6) {
      serials.push(value);
    }
  });

  return serials;
};
