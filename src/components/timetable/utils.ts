import { SlotType, BreakType } from './types';

import type { Subject, TimeSlot, DayOfWeek, SlotConfig, SubjectResponse } from './types';

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
export const SLOT_HEIGHT_BASE = 70;
export const MINUTE_HEIGHT_RATIO = SLOT_HEIGHT_BASE / 30;

export const generateTimelineStamps = (
  startHour: number = TIMELINE_START_HOUR,
  endHour: number = TIMELINE_END_HOUR
): string[] => {
  const stamps: string[] = [];
  for (let h = startHour; h <= endHour; h += 1) {
    stamps.push(`${h.toString().padStart(2, '0')}:00`);
    if (h !== endHour) {
      stamps.push(`${h.toString().padStart(2, '0')}:30`);
    }
  }
  return stamps;
};

export const calculateSlotPosition = (
  startTime: string,
  endTime: string,
  timelineStartHour: number = TIMELINE_START_HOUR
) => {
  const startMin = parseTimeToMinutes(startTime);
  const endMin = parseTimeToMinutes(endTime);
  const timelineStartMin = timelineStartHour * 60;

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

// export const MOCK_SUBJECT_DATA: SubjectResponse = {
//   items: [
//     {
//       subjectType: 0,
//       electiveGroupId: null,
//       electiveGroupName: null,
//       status: 1,
//       allocateLectures: 6,
//       totalLectures: 6,
//       subjects: [
//         {
//           subjectType: 0,
//           subjectId: 'a1b2c3d4-1111-2222-3333-444455556666',
//           subjectName: 'Mathematics',
//           subjectCode: 'MATH101',
//           color: '#3F51B5',
//         },
//       ],
//     },
//     {
//       subjectType: 0,
//       electiveGroupId: null,
//       electiveGroupName: null,
//       status: 1,
//       allocateLectures: 6,
//       totalLectures: 6,
//       subjects: [
//         {
//           subjectType: 0,
//           subjectId: 'b2c3d4e5-7777-8888-9999-000011112222',
//           subjectName: 'English',
//           subjectCode: 'ENG101',
//           color: '#009688',
//         },
//       ],
//     },
//     {
//       subjectType: 1,
//       electiveGroupId: 'e86f1ef1-84de-48ff-89f9-8e86470e258a',
//       electiveGroupName: 'Tech & Fitness Group',
//       color: '#FF9800',
//       status: 1,
//       allocateLectures: 6,
//       totalLectures: 6,
//       subjects: [
//         {
//           subjectType: 1,
//           subjectId: '68460e63-0717-47f9-8fd8-d28f152cb30b',
//           subjectName: 'Computer',
//           subjectCode: 'COMP101',
//           color: '#2196F3',
//         },
//         {
//           subjectType: 1,
//           subjectId: '9d8c7b6a-5555-4444-3333-222211110000',
//           subjectName: 'Physical Training',
//           subjectCode: 'PT101',
//           color: '#E91E63',
//         },
//       ],
//     },
//   ],
// };

export const getSubjectsFromResponse = (data: SubjectResponse): Subject[] => {
  if (!data?.items) return [];

  return data.items.map((item) => {
    // 0 = Core Subject
    if (item.subjectType === 0) {
      const coreSub = item.subjects[0];
      return {
        subjectId: coreSub?.subjectId || 'unknown-core',
        subjectAssignmentId: coreSub?.subjectAssignmentId || 'unknown-core',
        name: coreSub?.subjectName || 'Unknown',
        color: coreSub?.color || '#e0e0e0',
        defaultDuration: 60,
        totalLectures: item.totalLectures || 0,
      };
    }

    // 1 = Elective Group
    // Concatenate names: "Sub 1 | Sub 2"
    if (item.subjectType === 1) {
      const names = item.subjects.map((s) => s.subjectName).join(' | ');
      return {
        subjectId: item.electiveGroupId || 'unknown-group',
        subjectAssignmentId: item.electiveGroupId || 'unknown-group',
        name: names || item.electiveGroupName || 'Elective Group',
        // Use group color if available, else first subject color
        color: item.color || item.subjects[0]?.color || '#e0e0e0',
        defaultDuration: 60,
        totalLectures: item.totalLectures || 0,
      };
    }

    // Fallback
    return {
      subjectId: 'unknown',
      subjectAssignmentId: 'unknown',
      name: 'Unknown',
      color: '#eee',
      defaultDuration: 60,
      totalLectures: 0,
    };
  });
};

export const MOCK_TIMETABLE_DATA = {
  MONDAY: [
    {
      sequence: 1,
      startTime: '07:30',
      endTime: '08:00',
      type: 0,
      id: 'MONDAY-0',
      subjectType: 0,
      electiveGroupId: null,
      electiveGroupName: null,
      subjects: [
        {
          id: 'sub-1',
          name: 'Mathematics',
          color: '#e3f2fd',
          teacherId: 'teacher-101',
          teacherName: 'Mr. John Doe',
          roomId: 'room-A1',
          roomName: 'Room A1',
        },
      ],
    },
    {
      sequence: 2,
      startTime: '08:00',
      endTime: '09:00',
      type: 0,
      id: 'MONDAY-1',
      subjectType: 1,
      electiveGroupId: 'eg-01',
      electiveGroupName: 'Elective Group 1',
      subjects: [
        {
          id: 'sub-5',
          name: 'Computer Science',
          color: '#e0f2f1',
          teacherId: 'teacher-104',
          teacherName: 'Mr. Alan Turing',
          roomId: 'lab-01',
          roomName: 'Computer Lab',
        },
        {
          id: 'sub-6',
          name: 'Physical Training',
          color: '#fce4ec',
          teacherId: 'teacher-105',
          teacherName: 'Mr. David Smith',
          roomId: 'ground-01',
          roomName: 'Play Ground',
        },
      ],
    },
    {
      sequence: 3,
      startTime: '09:00',
      endTime: '09:30',
      type: 1,
      breakType: 'SHORT',
      id: 'MONDAY-2',
      subjectType: null,
      electiveGroupId: null,
      electiveGroupName: null,
      subjects: [],
    },
    {
      sequence: 4,
      startTime: '09:30',
      endTime: '10:30',
      type: 0,
      id: 'MONDAY-3',
      subjectType: 0,
      electiveGroupId: null,
      electiveGroupName: null,
      subjects: [
        {
          id: 'sub-3',
          name: 'English',
          color: '#fff3e0',
          teacherId: 'teacher-103',
          teacherName: 'Ms. Emily Brown',
          roomId: 'room-B1',
          roomName: 'Room B1',
        },
      ],
    },
    {
      sequence: 5,
      startTime: '10:30',
      endTime: '11:00',
      type: 0,
      id: 'MONDAY-4',
      subjectType: 1,
      electiveGroupId: 'eg-02',
      electiveGroupName: 'Elective Group 2',
      subjects: [
        {
          id: 'sub-7',
          name: 'Music',
          color: '#ede7f6',
          teacherId: 'teacher-106',
          teacherName: 'Mr. Mozart',
          roomId: 'music-01',
          roomName: 'Music Room',
        },
        {
          id: 'sub-8',
          name: 'Art',
          color: '#f3e5f5',
          teacherId: 'teacher-107',
          teacherName: 'Ms. Frida',
          roomId: 'art-01',
          roomName: 'Art Room',
        },
      ],
    },
    {
      sequence: 6,
      startTime: '11:00',
      endTime: '12:00',
      type: 1,
      breakType: 'LUNCH',
      id: 'MONDAY-5',
      subjectType: null,
      electiveGroupId: null,
      electiveGroupName: null,
      subjects: [],
    },
    {
      sequence: 7,
      startTime: '12:00',
      endTime: '13:00',
      type: 0,
      id: 'MONDAY-6',
      subjectType: 0,
      electiveGroupId: null,
      electiveGroupName: null,
      subjects: [
        {
          id: 'sub-2',
          name: 'Science',
          color: '#e8f5e9',
          teacherId: 'teacher-102',
          teacherName: 'Dr. Albert',
          roomId: 'room-C1',
          roomName: 'Room C1',
        },
      ],
    },
  ],
};

export const getInitialSlotsFromResponse = (
  responseData: any,
  defaultConfig: SlotConfig[]
): Record<DayOfWeek, TimeSlot[]> => {
  const weeklySlots: Record<string, TimeSlot[]> = {};
  const days: DayOfWeek[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

  days.forEach((day) => {
    if (responseData[day]) {
      // Map API response to TimeSlot
      weeklySlots[day] = responseData[day].map((slot: any) => ({
        ...slot,
        day,
        type: slot.type === 0 ? SlotType.LECTURE : SlotType.BREAK, // Map integer type to enum
        // Ensure subjects is array
        subjects: slot.subjects || [],
        // Backward comp for now (pick first subject ID if any)
        subjectId: slot.subjects?.[0]?.id || null,
      }));
    } else {
      // Fallback to generating empty slots from config if NO data for that day
      const dayConfig = defaultConfig.find((c) => c.applicableDays.includes(day));
      if (dayConfig) {
        weeklySlots[day] = dayConfig.timeSlots.map((slot, index) => ({
          ...slot,
          id: `${day}-${index}`,
          day,
          subjectId: null,
          subjects: [],
        }));
      } else {
        weeklySlots[day] = [];
      }
    }
  });

  return weeklySlots;
};

// --- Mock Teachers & Rooms ---
export const MOCK_TEACHERS = [
  { id: 'teacher-101', name: 'Mr. John Doe' },
  { id: 'teacher-102', name: 'Dr. Albert' },
  { id: 'teacher-103', name: 'Ms. Emily Brown' },
  { id: 'teacher-104', name: 'Mr. Alan Turing' },
  { id: 'teacher-105', name: 'Mr. David Smith' },
  { id: 'teacher-106', name: 'Mr. Mozart' },
  { id: 'teacher-107', name: 'Ms. Frida' },
];

export const MOCK_ROOMS = [
  { id: 'room-A1', name: 'Room A1' },
  { id: 'room-B1', name: 'Room B1' },
  { id: 'room-C1', name: 'Room C1' },
  { id: 'lab-01', name: 'Computer Lab' },
  { id: 'ground-01', name: 'Play Ground' },
  { id: 'music-01', name: 'Music Room' },
  { id: 'art-01', name: 'Art Room' },
];
