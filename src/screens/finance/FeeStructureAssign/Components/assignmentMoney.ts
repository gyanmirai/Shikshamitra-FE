/** The current published fee-head amount contract; lower business caps need a matching API rule. */
export const MAX_ASSIGNMENT_AMOUNT = 9999999999.99;

export const formatAssignmentMoney = (amount: number, currency = 'INR'): string => {
  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    currencyDisplay: 'narrowSymbol',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
  return currency === 'INR' ? formatted.replace(/^₹\s*/, '₹ ') : formatted;
};
