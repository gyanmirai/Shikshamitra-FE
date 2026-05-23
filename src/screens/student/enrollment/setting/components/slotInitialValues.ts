import dayjs from 'dayjs';

import type { ISlot } from '../type';

export const getSlotInitialValues = (editData: ISlot | null) => ({
  slotName: editData?.slotName || null,
  startTime: editData?.startDateTime ? dayjs(editData.startDateTime) : null,
  endTime: editData?.endDateTime ? dayjs(editData.endDateTime) : null,
  studentLimit: editData?.studentLimit || null,
  roomNo: editData?.roomNo || null,
});
