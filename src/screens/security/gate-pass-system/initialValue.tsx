import type { IGatePassFormValues } from './gate-pass-system-interface';

export const getGatePassInitialValues = (
  data: Partial<IGatePassFormValues> | null = null
): IGatePassFormValues => ({
  studentName: data?.studentName || '',
  studentId: data?.studentId || '',
  reason: data?.reason || '',
  validFrom: data?.validFrom || null,
  validTo: data?.validTo || null,
  status: data?.status || '',
  specailInstructions: data?.specailInstructions || '',
});
