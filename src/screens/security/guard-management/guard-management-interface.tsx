import type { Dayjs } from 'dayjs';

export interface IGuardShift {
  day: string;
  timeSlot: string;
  location: string;
  date: Dayjs | string;
}

export interface IGuard {
  guardName: string;
  guardShiftPerDay: number;

  guardShiftlist: string[];
  assignedShift: IGuardShift[];
}

export interface IAssignedGuard extends IGuard {
  assignedLocation: string; // New property for location
  day: string; // New property for day
  timeSlot: string; // New property for timeSlot
  assignedDate: Dayjs | string; // New property for assigned date
}

export interface IGuardListProps {
  onDragStart: (e: any, subject: any) => void;
  guardList: IGuard[];
}
