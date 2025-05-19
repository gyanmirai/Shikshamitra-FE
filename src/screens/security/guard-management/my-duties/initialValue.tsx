import type { IMyDuties } from './my-duties-interface';

export const getInitialMyDutiesValues = (data: Partial<IMyDuties> | null = {}): IMyDuties => ({
  startTime: data?.startTime ?? null,
  endTime: data?.endTime ?? null,
  status: data?.status ?? '',
  checkInNotes: data?.checkInNotes ?? '',
  checkOutNotes: data?.checkOutNotes ?? '',
});
