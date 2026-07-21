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
  holidayShiftingMethod: editData?.holidayShiftingMethod || 'None',
  demandGenerationRule: editData?.demandGenerationRule || 'Immediately',
  demandOffsetDays: editData?.demandOffsetDays ?? null,
  initialDemandStatus: editData?.initialDemandStatus || 'Draft',
  currentVersionId: editData?.currentVersionId,
  currentVersionNumber: editData?.currentVersionNumber,
  isUsedInDownstream: editData?.isUsedInDownstream,
  canDirectEdit: editData?.canDirectEdit,
});
