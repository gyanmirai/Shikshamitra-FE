import dayjs from 'dayjs';

import type { AdmissionCycleConfigurationProps } from '../admission-cycle-configuration-dialog';

export type CycleConfigurationValues = {
  name: string;
  description: string;
  academicYearId: string;
  startDate: string;
  endDate: string;
  reason: string;
  publishAt: string;
  closeAt: string;
};
export function cycleConfigurationPayload(
  mode: NonNullable<AdmissionCycleConfigurationProps['mode']>,
  cycle: NonNullable<AdmissionCycleConfigurationProps['cycle']>,
  {
    name,
    description,
    academicYearId,
    startDate,
    endDate,
    reason,
    publishAt,
    closeAt,
  }: CycleConfigurationValues
) {
  if (mode === 'clone') {
    return {
      sourceCycleId: cycle.id,
      name: name.trim(),
      code: '',
      description: description.trim() || null,
      academicYearId,
      startDate,
      endDate,
    };
  } if (mode === 'window') {
    return {
      concurrencyStamp: cycle.concurrencyStamp,
      startDate,
      endDate,
      reason: reason.trim(),
    };
  } 
    return {
      concurrencyStamp: cycle.concurrencyStamp,
      publishAt: publishAt ? dayjs(publishAt).toISOString() : null,
      closeAt: closeAt ? dayjs(closeAt).toISOString() : null,
    };
  
}
