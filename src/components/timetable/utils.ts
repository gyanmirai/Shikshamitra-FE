import { SlotType, BreakType } from './types';

import type { TimeSlot, DayOfWeek, SlotConfig } from './types';

// --- Default Configuration ---
export const DEFAULT_CONFIG: SlotConfig[] = [
  {
    applicableDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'],
    timeSlots: [
      {
        sequence: 1,
        startTime: '07:30',
        endTime: '08:00',
        type: SlotType.LECTURE,
      },
      {
        sequence: 2,
        startTime: '08:00',
        endTime: '09:00',
        type: SlotType.LECTURE,
      },
      {
        sequence: 3,
        startTime: '09:00',
        endTime: '09:30',
        type: SlotType.BREAK,
        breakType: BreakType.SHORT,
      },
      {
        sequence: 4,
        startTime: '09:30',
        endTime: '10:30',
        type: SlotType.LECTURE,
      },
      {
        sequence: 5,
        startTime: '10:30',
        endTime: '11:00',
        type: SlotType.LECTURE,
      },
      {
        sequence: 6,
        startTime: '11:00',
        endTime: '12:00',
        type: SlotType.BREAK,
        breakType: BreakType.LUNCH,
      },
      {
        sequence: 7,
        startTime: '12:00',
        endTime: '13:00',
        type: SlotType.LECTURE,
      },
      {
        sequence: 8,
        startTime: '13:00',
        endTime: '13:30',
        type: SlotType.LECTURE,
      },
    ],
  },
  {
    applicableDays: ['SATURDAY'],
    timeSlots: [
      {
        sequence: 1,
        startTime: '08:00',
        endTime: '09:00',
        type: SlotType.LECTURE,
      },
      {
        sequence: 2,
        startTime: '09:00',
        endTime: '09:30',
        type: SlotType.BREAK,
        breakType: BreakType.SHORT,
      },
      {
        sequence: 3,
        startTime: '09:30',
        endTime: '11:00',
        type: SlotType.LECTURE,
      },
    ],
  },
] as unknown as SlotConfig[];

// Helper to parse "HH:mm" to minutes from midnight
export const parseTimeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const getTimelineEndHour = (): number => {
  let maxMinutes = 0;
  DEFAULT_CONFIG.forEach((config) => {
    config.timeSlots.forEach((slot) => {
      const minutes = parseTimeToMinutes(slot.endTime);
      if (minutes > maxMinutes) maxMinutes = minutes;
    });
  });

  // Calculate hour (ceil) + 1 for buffer
  const maxHour = Math.ceil(maxMinutes / 60);
  return maxHour + 1;
};

// Start of the timeline (e.g., 7:00 AM)
export const TIMELINE_START_HOUR = 7;
export const TIMELINE_END_HOUR = getTimelineEndHour();
export const SLOT_HEIGHT_BASE = 50; // px for 30 mins
export const MINUTE_HEIGHT_RATIO = SLOT_HEIGHT_BASE / 30;

export const generateTimelineStamps = (): string[] => {
  const stamps: string[] = [];
  for (let h = TIMELINE_START_HOUR; h <= TIMELINE_END_HOUR; h += 1) {
    stamps.push(`${h.toString().padStart(2, '0')}:00`);
    if (h !== TIMELINE_END_HOUR) {
      stamps.push(`${h.toString().padStart(2, '0')}:30`);
    }
  }
  return stamps;
};

export const calculateSlotPosition = (startTime: string, endTime: string) => {
  const startMin = parseTimeToMinutes(startTime);
  const endMin = parseTimeToMinutes(endTime);
  const timelineStartMin = TIMELINE_START_HOUR * 60;

  const top = (startMin - timelineStartMin) * MINUTE_HEIGHT_RATIO;
  const height = (endMin - startMin) * MINUTE_HEIGHT_RATIO;

  return { top, height };
};

// Mock Data Generator
export const generateWeeklySlots = (config: SlotConfig[]): Record<DayOfWeek, TimeSlot[]> => {
  const weeklySlots: Record<string, TimeSlot[]> = {};

  const days: DayOfWeek[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

  days.forEach((day) => {
    // Find config for this day
    const dayConfig = config.find((c) => c.applicableDays.includes(day));
    if (dayConfig) {
      weeklySlots[day] = dayConfig.timeSlots.map((slot, index) => ({
        ...slot,
        id: `${day}-${index}`,
        day,
        subjectId: null,
      }));
    } else {
      weeklySlots[day] = [];
    }
  });

  return weeklySlots;
};

export const MOCK_SUBJECTS = [
  { id: 'sub-1', name: 'Mathematics', color: '#e3f2fd', defaultDuration: 60 },
  { id: 'sub-2', name: 'Science', color: '#e8f5e9', defaultDuration: 45 },
  { id: 'sub-3', name: 'English', color: '#fff3e0', defaultDuration: 30 },
  { id: 'sub-4', name: 'History', color: '#f3e5f5', defaultDuration: 45 },
  { id: 'sub-5', name: 'Computer Sci', color: '#e0f2f1', defaultDuration: 60 },
  { id: 'sub-6', name: 'Art', color: '#fbe9e7', defaultDuration: 90 }, // Long slot
  { id: 'sub-7', name: 'Sports', color: '#fffde7', defaultDuration: 30 },
];
