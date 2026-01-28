import type { IHolidayType } from '../type';

export const getHolidayTypeInitialValues = (editData: IHolidayType | null) => ({
  holidayType: editData?.name || '',
  description: editData?.description || '',
  color: editData?.color || '',
});
