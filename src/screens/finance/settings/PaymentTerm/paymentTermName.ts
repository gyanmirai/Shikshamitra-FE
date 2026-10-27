// Match FinanceName.Equals: collapse whitespace, trim, then compare without case.
export const normalizePaymentTermName = (name: string) =>
  name.replace(/[\s\u0085]+/g, ' ').trim().toUpperCase();
