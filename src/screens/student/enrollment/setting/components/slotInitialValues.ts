import dayjs from 'dayjs';

import type { ISlot } from '../type';

export const getSlotInitialValues = (editData: ISlot | null) => ({
  slotName: editData?.slotName || null,
  startTime: editData?.startDate ? dayjs(editData.startDate) : null,
  endTime: editData?.endDate ? dayjs(editData.endDate) : null,
  studentLimit: editData?.studentLimit || null,
  roomNo: editData?.roomNo || null,
});
