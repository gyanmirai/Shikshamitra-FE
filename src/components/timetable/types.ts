export type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY';

export const SlotType = {
  LECTURE: 'LECTURE',
  BREAK: 'BREAK',
} as const;

export type SlotTypes = (typeof SlotType)[keyof typeof SlotType];

export const BreakType = {
  SHORT: 'SHORT',
  LUNCH: 'LUNCH',
} as const;

export type BreakTypes = (typeof BreakType)[keyof typeof BreakType];

export interface Teacher {
  id: string;
  name: string;
  avatarUrl?: string; // For a nice UI touch if needed
}

export interface Subject {
  id: string;
  name: string;
  color: string; // CSS color string (e.g., '#e0f2f1')
  teacherId?: string;
  defaultDuration?: number; // minutes, default 30 or 60
}

export interface TimeSlot {
  id: string; // Unique ID for the slot instance
  sequence: number;
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  type: SlotTypes;
  breakType?: BreakTypes;
  day: DayOfWeek;
  subjectId?: string | null; // The assigned subject
}

export interface SlotConfig {
  applicableDays: DayOfWeek[];
  timeSlots: Omit<TimeSlot, 'day' | 'id' | 'subjectId'>[];
}

export interface DragItem {
  id: string;
  type: string;
  subject?: Subject;
  fromSlotId?: string;
}

export const ItemTypes = {
  SUBJECT: 'subject',
};
