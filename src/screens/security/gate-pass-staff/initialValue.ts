import type { IGatePassStaffFormValues } from './gate-pass-staff-interface';

export function getStaffPassRequestInitialValues(
  data: Partial<IGatePassStaffFormValues> | null = null
): IGatePassStaffFormValues {
  return {
    leaveTime: data?.leaveTime || null,
    leaveDate: data?.leaveDate || null,
    reasonForLeave: data?.reasonForLeave || '',
  };
}
