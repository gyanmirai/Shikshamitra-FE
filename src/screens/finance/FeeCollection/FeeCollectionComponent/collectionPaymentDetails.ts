/** Cash is received at the counter and has no receiving school bank account. */
export const collectionPaymentDetails = <T>(
  paymentMethod: string,
  details: Record<string, T>
): Record<string, T> =>
  Object.fromEntries(
    Object.entries(details).filter(([key]) => paymentMethod !== 'Cash' || key !== 'bankAccount')
  );
