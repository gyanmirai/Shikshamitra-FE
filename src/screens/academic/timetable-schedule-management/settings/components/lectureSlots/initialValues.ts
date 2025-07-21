import dayjs from 'dayjs';

import type { ITimeSlot } from './type';

export const getInitialValues = (classes: string, editData?: any) => ({
  className: editData?.className ? editData.className : classes || '',
  schoolHours: editData?.schoolHours || '',
  previousClassSlots: editData?.previousClassSlots || '',
  totalSlots: editData ? (editData.breakSlots || 0) + (editData.periodSlots || 0) : '',
  timeSlots:
    editData?.timeSlots?.map((slot: any) => ({
      ...slot,
      startTime: dayjs(slot.startTime),
      endTime: dayjs(slot.endTime),
    })) || ([] as ITimeSlot[]),
});
