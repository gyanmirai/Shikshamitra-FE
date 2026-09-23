import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';

import type { TeacherAvailabilityRow } from '../substitutionData';

export type CreateSubstitutionOriginMode = 'teacher' | 'lecture';

export type TeacherShiftInput = {
  name?: string | null;
  startTime?: string | null;
  endTime?: string | null;
};

const normalizeShiftTime = (value?: string | null) => {
  const match = value?.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return '';

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return '';

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

export const resolveTeacherShift = (shift?: TeacherShiftInput | null) => {
  const startTime = normalizeShiftTime(shift?.startTime);
  const endTime = normalizeShiftTime(shift?.endTime);
  const startMinutes = startTime
    ? Number(startTime.slice(0, 2)) * 60 + Number(startTime.slice(3))
    : 0;
  const endMinutes = endTime ? Number(endTime.slice(0, 2)) * 60 + Number(endTime.slice(3)) : 0;

  return {
    name: shift?.name?.trim() || '',
    startTime,
    endTime,
    isValid: Boolean(startTime && endTime && endMinutes > startMinutes),
  };
};

export type CreateTeacherOrigin = {
  teacherId: string;
  teacherName: string;
  departmentName: string;
  shiftName: string;
  shiftStartTime: string;
  shiftEndTime: string;
  date: Dayjs | null;
  startTime: string;
  endTime: string;
  isFullDay: boolean;
  reason: string;
  remarks: string;
  sourceType: string;
};

export const createDefaultTeacherOrigin = (): CreateTeacherOrigin => ({
  teacherId: '',
  teacherName: '',
  departmentName: '',
  shiftName: '',
  shiftStartTime: '',
  shiftEndTime: '',
  date: dayjs(),
  startTime: '',
  endTime: '',
  isFullDay: true,
  reason: 'Teacher Absent',
  remarks: '',
  sourceType: 'Manual',
});

export const createTeacherOriginFromAvailability = (
  availability: TeacherAvailabilityRow
): CreateTeacherOrigin => ({
  teacherId: availability.teacherId || '',
  teacherName: availability.teacherName,
  departmentName: availability.departmentName,
  shiftName: '',
  shiftStartTime: availability.startTime,
  shiftEndTime: availability.endTime,
  date: dayjs(availability.availabilityDate),
  startTime: availability.startTime,
  endTime: availability.endTime,
  isFullDay: availability.isFullDay,
  reason: availability.reason || 'Teacher Unavailable',
  remarks: availability.remarks || '',
  sourceType: availability.sourceType,
});

export const buildFullDayOriginPatch = (
  origin: CreateTeacherOrigin,
  isFullDay: boolean
): Partial<CreateTeacherOrigin> => ({
  isFullDay,
  ...(isFullDay
    ? {
        startTime: origin.shiftStartTime,
        endTime: origin.shiftEndTime,
      }
    : {}),
});

export const hasValidTeacherOriginRange = (origin: CreateTeacherOrigin) => {
  const [startHour, startMinute] = origin.startTime.split(':').map(Number);
  const [endHour, endMinute] = origin.endTime.split(':').map(Number);
  const start = startHour * 60 + startMinute;
  const end = endHour * 60 + endMinute;

  return Number.isFinite(start) && Number.isFinite(end) && end > start;
};
