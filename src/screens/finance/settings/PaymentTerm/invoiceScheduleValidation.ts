import { parseDateOnly } from 'src/utils/date-only';

import type { IInstallment, IPaymentTerm } from './type';

export function getInvoiceStart(installment: IInstallment, boardStart?: string) {
  const start = parseDateOnly(installment.startDate);
  const academicStart = parseDateOnly(boardStart);
  if (!start) return academicStart;
  return academicStart?.isAfter(start, 'day') ? academicStart : start;
}

export function getInvoiceDate(values: IPaymentTerm, installment: IInstallment) {
  switch (values.demandGenerationRule) {
    case 'SpecificDate':
      return parseDateOnly(installment.demandDate);
    case 'OnInstallmentStartDate':
      return parseDateOnly(installment.startDate);
    case 'OnDueDate':
      return parseDateOnly(installment.dueDate);
    case 'XDaysBeforeDue':
      return (
        parseDateOnly(installment.dueDate)?.subtract(Number(values.demandOffsetDays) || 0, 'day') ??
        null
      );
    default:
      return null;
  }
}

export function getInvoiceDateError(
  values: IPaymentTerm,
  installment: IInstallment,
  boardStart?: string
) {
  if (
    !values.invoiceCreationEnabled &&
    values.demandGenerationRule === 'SpecificDate' &&
    !installment.demandDate
  )
    return undefined;
  const date = getInvoiceDate(values, installment);
  const start = getInvoiceStart(installment, boardStart);
  const due = parseDateOnly(installment.dueDate);
  if (!date) return 'Invoice date is required';
  if (start && date.isBefore(start, 'day')) {
    return `Invoice date must be on or after ${start.format('DD/MM/YYYY')}`;
  }
  if (due && date.isAfter(due, 'day'))
    return 'Invoice date must be on or before the payment due date';
  return undefined;
}

export function getInvoiceOffsetLimit(values: IPaymentTerm, boardStart?: string) {
  const limits = values.installments.flatMap((installment) => {
    const start = getInvoiceStart(installment, boardStart);
    const due = parseDateOnly(installment.dueDate);
    return start && due
      ? [{ days: Math.min(365, due.diff(start, 'day')), name: installment.installmentName }]
      : [];
  });
  return limits.sort((a, b) => a.days - b.days)[0];
}
