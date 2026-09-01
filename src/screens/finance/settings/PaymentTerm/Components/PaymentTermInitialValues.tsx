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
  status: editData?.status || 'Draft',
  academicYearId: editData?.academicYearId || currentAcademicYearId || '',
  installments: (editData?.installments || []).map((inst) => ({
    ...inst,
    startDate: inst.startDate || null,
    endDate: inst.endDate || null,
    demandDate: inst.demandDate || null,
    dueDate: inst.dueDate || null,
    description: inst.description || '',
    allocationPercentage: inst.allocationPercentage ?? 0,
    reminderDate: inst.reminderDate || null,
    allowPartialOverride: inst.allowPartialOverride ?? null,
    gracePeriod: inst.gracePeriod ?? null,
    demandEnabled: inst.demandEnabled ?? true,
    reminderEnabled: inst.reminderEnabled ?? false,
  })),
  isDefaultTerm: editData?.isDefaultTerm ?? false,

  // Holiday Rules
  holidayShiftingMethod: editData?.holidayShiftingMethod || 'None',
  demandGenerationRule: editData?.demandGenerationRule || 'OnInstallmentStartDate',
  demandOffsetDays: editData?.demandOffsetDays ?? null,
  initialDemandStatus: 'Published',
});
