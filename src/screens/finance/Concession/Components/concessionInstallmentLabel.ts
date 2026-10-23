/** API installment labels may already include the year (for example "Jun 2026"). */
export function concessionInstallmentLabel(label: string, year: number): string {
  const withoutYear = label.replace(new RegExp(`\\b${year}\\b`, 'g'), '').trim();
  return `${withoutYear} ${year}`.trim();
}
