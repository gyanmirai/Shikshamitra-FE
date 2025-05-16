import type { IGuardShiftFormValues } from '../guard-settings-interface';

export const getInitialGuardShiftFormValues = (
  data: Partial<IGuardShiftFormValues> | null = {}
): IGuardShiftFormValues => ({
  id: data?.id ?? undefined,
  name: data?.name ?? '',
  startTime: data?.startTime ?? null,
  endTime: data?.endTime ?? null,
  description: data?.description ?? '',
});
