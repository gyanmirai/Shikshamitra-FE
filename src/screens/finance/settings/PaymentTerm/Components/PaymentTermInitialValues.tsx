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

  // Holiday Rules
  holidayShiftingMethod: editData?.holidayShiftingMethod || 'None',

  // Billing Schedule
  demandGenerationRule: editData?.demandGenerationRule || 'Immediately',
  demandOffsetDays: editData?.demandOffsetDays ?? null,
  initialDemandStatus: editData?.initialDemandStatus || 'Draft',
});
