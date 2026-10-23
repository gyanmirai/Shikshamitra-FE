import type { SchoolShiftType } from 'src/enums/academic-calendar';

export type WorkingHourValues = {
  standardId: string;
  shiftType: SchoolShiftType;
  startTime: string;
  endTime: string;
  recessStartTime: string;
  recessEndTime: string;
  isDefault: boolean;
};

export type WorkingHour = Omit<WorkingHourValues, 'recessStartTime' | 'recessEndTime'> & {
  id: string;
  recessStartTime?: string | null;
  recessEndTime?: string | null;
};

export type WorkingHourRow = {
  id: string;
  className: string;
  shift?: WorkingHour;
};
