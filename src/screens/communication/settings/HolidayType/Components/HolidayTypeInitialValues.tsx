import type { IHolidayType } from '../type';

export const getHolidayTypeInitialValues = (editData: IHolidayType | null) => ({
  holidayType: editData?.holidayType || '',
  description: editData?.description || '',
});
