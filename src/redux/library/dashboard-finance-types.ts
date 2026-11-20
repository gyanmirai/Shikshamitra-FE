export const dashboardFinanceAmounts = [
  ['originalAmountText', 'Original'],
  ['acceptedAmountText', 'Accepted'],
  ['settledAmountText', 'Settled'],
  ['pendingVerificationAmountText', 'Pending verification'],
  ['netWaivedAmountText', 'Net waived'],
  ['financialOutstandingAmountText', 'Financial outstanding'],
  ['collectibleAmountText', 'Collectible'],
  ['refundedAmountText', 'Net refunds'],
] as const;

export type DashboardFinanceAmount = (typeof dashboardFinanceAmounts)[number][0];
export type LibraryDashboardFinanceCurrency = Record<DashboardFinanceAmount, string> & {
  currency: string;
};
export type LibraryDashboardFinancePosition = {
  verifiedCount: number;
  needsReviewCount: number;
  unpostedCount: number;
  currencyTotals: LibraryDashboardFinanceCurrency[];
};

const isCount = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
const text = (value: unknown) => (typeof value === 'string' ? value : '');

export function mapDashboardFinancePosition(
  value: unknown
): LibraryDashboardFinancePosition | null {
  const source = record(value);
  if (
    !isCount(source.verifiedCount) ||
    !isCount(source.needsReviewCount) ||
    !isCount(source.unpostedCount) ||
    !Array.isArray(source.currencyTotals)
  )
    return null;
  return {
    verifiedCount: source.verifiedCount,
    needsReviewCount: source.needsReviewCount,
    unpostedCount: source.unpostedCount,
    currencyTotals: source.currencyTotals.map((item) => {
      const row = record(item);
      const amounts = Object.fromEntries(
        dashboardFinanceAmounts.map(([field]) => [field, text(row[field])])
      ) as Record<DashboardFinanceAmount, string>;
      return { currency: text(row.currency), ...amounts };
    }),
  };
}
