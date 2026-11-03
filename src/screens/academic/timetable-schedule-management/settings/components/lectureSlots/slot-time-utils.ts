import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';

export interface ITimeSlot {
  id: string;
  startTime: Dayjs | null;
  endTime: Dayjs | null;
  slotType: string;
  breakType: string;
}

export const slotDurationMin = (slot: ITimeSlot, fallback = 30) => {
  if (!slot.startTime || !slot.endTime) return fallback;
  const difference = dayjs(slot.endTime).diff(dayjs(slot.startTime), 'minute');
  return difference > 0 ? difference : fallback;
};

export const cascadeFromIndex = (slots: ITimeSlot[], fromIndex: number): ITimeSlot[] => {
  const next = slots.map((slot) => ({ ...slot }));
  for (let index = fromIndex + 1; index < next.length; index += 1) {
    const previous = next[index - 1];
    if (!previous.endTime) break;
    const duration = slotDurationMin(next[index]);
    const startTime = dayjs(previous.endTime);
    next[index] = { ...next[index], startTime, endTime: startTime.add(duration, 'minute') };
  }
  return next;
};
