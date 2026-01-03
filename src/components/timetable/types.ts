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
  totalLectures?: number;
  teacherName?: string;
  roomId?: string;
  roomName?: string;
  totalSubjects?: number;
}

// --- New API Response Types ---
export interface SubjectItemResponse {
  subjectType: number;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  color: string;
}

export interface SubjectAllocationResponse {
  subjectType: number; // 0 for Core, 1 for Elective (Group)
  electiveGroupId: string | null;
  electiveGroupName: string | null;
  status: number;
  allocateLectures: number;
  totalLectures: number;
  subjects: SubjectItemResponse[];
  color?: string; // Optional: sometime group might have color at root level?
}

export interface SubjectResponse {
  items: SubjectAllocationResponse[];
}

export interface SlotSubject {
  id: string;
  name: string;
  color: string;
  teacherId?: string;
  teacherName?: string;
  roomId?: string;
  roomName?: string;
}

export interface TimeSlot {
  id: string; // Unique ID for the slot instance
  sequence: number;
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  type: SlotTypes;
  breakType?: BreakTypes;
  day: DayOfWeek;

  // New properties from API
  subjectType?: number | null; // 0: Core, 1: Elective
  electiveGroupId?: string | null;
  electiveGroupName?: string | null;
  subjects?: SlotSubject[];

  // Deprecated/Legacy (kept for now to avoid breaking everything immediately, will be mapped)
  // Deprecated/Legacy (kept for now to avoid breaking everything immediately, will be mapped)
  subjectId?: string | null;
  _attachedSubject?: Subject; // Temp property for drag-and-drop state
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
