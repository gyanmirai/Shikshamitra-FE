import dayjs from 'dayjs';

import type { ISlot } from '../type';

export const getSlotInitialValues = (editData: ISlot | null) => ({
  slotName: editData?.slotName || null,
  startTime: editData?.startTime ? dayjs(editData.startTime) : null,
  endTime: editData?.endTime ? dayjs(editData.endTime) : null,
  studentLimit: editData?.studentLimit || null,
  roomNo: editData?.roomNo || null,
});
