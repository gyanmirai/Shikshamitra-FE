import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';

import type { TeacherAvailabilityRow } from '../substitutionData';

export type CreateSubstitutionOriginMode = 'teacher' | 'lecture';

export type CreateTeacherOrigin = {
  teacherId: string;
  teacherName: string;
  departmentName: string;
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
  date: dayjs(),
  startTime: '09:00',
  endTime: '14:15',
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
  date: dayjs(availability.availabilityDate),
  startTime: availability.startTime,
  endTime: availability.endTime,
  isFullDay: availability.isFullDay,
  reason: availability.reason || 'Teacher Unavailable',
  remarks: availability.remarks || '',
  sourceType: availability.sourceType,
});

export const hasValidTeacherOriginRange = (origin: CreateTeacherOrigin) => {
  if (origin.isFullDay) return true;

  const [startHour, startMinute] = origin.startTime.split(':').map(Number);
  const [endHour, endMinute] = origin.endTime.split(':').map(Number);
  const start = startHour * 60 + startMinute;
  const end = endHour * 60 + endMinute;

  return Number.isFinite(start) && Number.isFinite(end) && end > start;
};
