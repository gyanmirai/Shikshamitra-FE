export const financeCurrency = {
  currency: 'INR',
  originalAmountText: '100.75',
  acceptedAmountText: '60.50',
  settledAmountText: '40.25',
  pendingVerificationAmountText: '20.25',
  netWaivedAmountText: '10.00',
  financialOutstandingAmountText: '50.50',
  collectibleAmountText: '30.25',
  refundedAmountText: '5.00',
};
export const financePosition = {
  verifiedCount: 3,
  needsReviewCount: 2,
  unpostedCount: 1,
  currencyTotals: [financeCurrency],
};
export const dashboardFinancePayload = {
  academicYearId: 'recorded-year',
  charges: {
    paidCount: 3,
    paidAmount: 999,
    pendingCount: 2,
    pendingAmount: 888,
    waivedCount: 1,
    waivedAmount: 777,
  },
  utilization: { chargeCollectionRate: 99 },
  financePosition,
};
export const financeAmountLabels = {
  originalAmountText: 'Original',
  acceptedAmountText: 'Accepted',
  settledAmountText: 'Settled',
  pendingVerificationAmountText: 'Pending verification',
  netWaivedAmountText: 'Net waived',
  financialOutstandingAmountText: 'Financial outstanding',
  collectibleAmountText: 'Collectible',
  refundedAmountText: 'Net refunds',
};
