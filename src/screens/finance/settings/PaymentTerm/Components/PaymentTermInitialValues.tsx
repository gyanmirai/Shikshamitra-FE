import type { IPaymentTerm } from '../type';

export const getInitialPaymentTermData = (
  editData?: Partial<IPaymentTerm> | null,
  currentAcademicYearId?: string
): IPaymentTerm => ({
  id: editData?.id || '',
  paymentTermName: editData?.paymentTermName || '',
  paymentTermCode: editData?.paymentTermCode || '',
  boardId: editData?.boardId || '',
  description: editData?.description || '',
  status: editData?.status || 'Active',
  academicYearId: editData?.academicYearId || currentAcademicYearId || '',
  installments: (editData?.installments || []).map((inst) => ({
    ...inst,
    startDate: inst.startDate || null,
    endDate: inst.endDate || null,
    description: inst.description || '',
  })),
  isDefaultTerm: editData?.isDefaultTerm ?? false,
  enableBillingSchedule: editData?.enableBillingSchedule ?? true,

  // Reminder Rules (API compatibility)
  autoReminder: editData?.autoReminder ?? false,
  reminderDaysBefore: editData?.reminderDaysBefore ?? 3,
  reminderFrequencyDays: editData?.reminderFrequencyDays ?? 7,
  reminderMaxCount: editData?.reminderMaxCount ?? 3,

  // Holiday Rules (API compatibility)
  holidayShiftingMethod: editData?.holidayShiftingMethod || 'None',

  // Billing Schedule
  demandGenerationRule: editData?.demandGenerationRule || 'Immediately',
  demandOffsetDays: editData?.demandOffsetDays ?? null,
  initialDemandStatus: editData?.initialDemandStatus || 'Draft',

  // Advance & Partial Payment
  allowAdvancePayment: editData?.allowAdvancePayment ?? false,
  minAdvanceDays: editData?.minAdvanceDays ?? null,
  maxAdvanceMonths: editData?.maxAdvanceMonths ?? null,
  allowFullYearPayment: editData?.allowFullYearPayment ?? false,
  allowPartialInstallment: editData?.allowPartialInstallment ?? false,
  minPartialAmount: editData?.minPartialAmount ?? null,
  minPartialPercentage: editData?.minPartialPercentage ?? null,
});
