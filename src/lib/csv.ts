/**
 * Safe CSV escaping and UTF-8 BOM download helper.
 */

const FORMULA_PREFIX_REGEX = /^[=+\-@\t\r]/;

export function escapeCsvCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '""';
  let str = String(value);
  // Neutralize spreadsheet formula injection payloads
  if (FORMULA_PREFIX_REGEX.test(str)) {
    str = `'${str}`;
  }
  return `"${str.replace(/"/g, '""')}"`;
}

export function buildCsvContent(
  rows: Array<Array<string | number | null | undefined>>
): string {
  // Prepend UTF-8 BOM so Bangla characters render accurately in Excel
  const body = rows.map((row) => row.map(escapeCsvCell).join(",")).join("\r\n");
  return `\uFEFF${body}`;
}

export function downloadCsv(
  filename: string,
  rows: Array<Array<string | number | null | undefined>>
): void {
  const csv = buildCsvContent(rows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
