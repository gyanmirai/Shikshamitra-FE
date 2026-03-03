'use client';

import type { TimeSlot, DayOfWeek } from 'src/components/timetable/types';

import { SlotType, BreakType } from 'src/components/timetable/types';
import TimetableBoard from 'src/components/timetable/TimetableBoard';

import { DashboardWidgetWrapper } from '../component/dashboard-widget-wrapper';

// ----------------------------------------------------------------------
// Teacher dummy timetable — Subject · Class / Div · Room per slot
// readOnly=true disables all drag-drop interactions
// ----------------------------------------------------------------------

const TEACHER_SLOTS: Record<DayOfWeek, TimeSlot[]> = {
  MONDAY: [
    {
      id: 'MONDAY-0',
      sequence: 1,
      day: 'MONDAY',
      startTime: '07:30',
      endTime: '08:30',
      type: SlotType.LECTURE,
      subjects: [
        {
          id: 's1',
          name: 'Mathematics',
          color: '#1573b6ff',
          roomId: 'r101',
          roomName: 'Room 101',
          className: '10',
          division: 'A',
        },
      ],
      subjectId: 's1',
    },
    {
      id: 'MONDAY-1',
      sequence: 2,
      day: 'MONDAY',
      startTime: '08:30',
      endTime: '09:30',
      type: SlotType.LECTURE,
      subjects: [
        {
          id: 's2',
          name: 'Mathematics',
          color: '#b615a1ff',
          roomId: 'r102',
          roomName: 'Room 102',
          className: '9',
          division: 'B',
        },
      ],
      subjectId: 's2',
    },
    {
      id: 'MONDAY-2',
      sequence: 3,
      day: 'MONDAY',
      startTime: '09:30',
      endTime: '10:00',
      type: SlotType.BREAK,
      breakType: BreakType.SHORT,
      subjects: [],
    },
    {
      id: 'MONDAY-3',
      sequence: 4,
      day: 'MONDAY',
      startTime: '10:00',
      endTime: '11:00',
      type: SlotType.LECTURE,
      subjects: [
        {
          id: 's3',
          name: 'Science',
          color: '#197020ff',
          roomId: 'r105',
          roomName: 'Room 105',
          className: '8',
          division: 'A',
        },
      ],
      subjectId: 's3',
    },
    {
      id: 'MONDAY-4',
      sequence: 5,
      day: 'MONDAY',
      startTime: '11:00',
      endTime: '12:00',
      type: SlotType.BREAK,
      breakType: BreakType.LUNCH,
      subjects: [],
    },
    {
      id: 'MONDAY-5',
      sequence: 6,
      day: 'MONDAY',
      startTime: '12:00',
      endTime: '13:00',
      type: SlotType.LECTURE,
      subjects: [
        {
          id: 's4',
          name: 'Mathematics',
          color: '#b615a1ff',
          roomId: 'r101',
          roomName: 'Room 101',
          className: '10',
          division: 'B',
        },
      ],
      subjectId: 's4',
    },
  ],
  TUESDAY: [
    {
      id: 'TUESDAY-0',
      sequence: 1,
      day: 'TUESDAY',
      startTime: '07:30',
      endTime: '08:30',
      type: SlotType.LECTURE,
      subjects: [
        {
          id: 's5',
          name: 'Science',
          color: '#197020ff',
          roomId: 'r103',
          roomName: 'Room 103',
          className: '8',
          division: 'B',
        },
      ],
      subjectId: 's5',
    },
    {
      id: 'TUESDAY-1',
      sequence: 2,
      day: 'TUESDAY',
      startTime: '08:30',
      endTime: '09:30',
      type: SlotType.LECTURE,
      subjects: [
        {
          id: 's6',
          name: 'Mathematics',
          color: '#1573b6ff',
          roomId: 'r101',
          roomName: 'Room 101',
          className: '10',
          division: 'A',
        },
      ],
      subjectId: 's6',
    },
    {
      id: 'TUESDAY-2',
      sequence: 3,
      day: 'TUESDAY',
      startTime: '09:30',
      endTime: '10:00',
      type: SlotType.BREAK,
      breakType: BreakType.SHORT,
      subjects: [],
    },
    {
      id: 'TUESDAY-3',
      sequence: 4,
      day: 'TUESDAY',
      startTime: '10:00',
      endTime: '11:00',
      type: SlotType.LECTURE,
      subjects: [
        {
          id: 's7',
          name: 'Mathematics',
          color: '#1573b6ff',
          roomId: 'r102',
          roomName: 'Room 102',
          className: '9',
          division: 'A',
        },
      ],
      subjectId: 's7',
    },
    {
      id: 'TUESDAY-4',
      sequence: 5,
      day: 'TUESDAY',
      startTime: '11:00',
      endTime: '12:00',
      type: SlotType.BREAK,
      breakType: BreakType.LUNCH,
      subjects: [],
    },
    {
      id: 'TUESDAY-5',
      sequence: 6,
      day: 'TUESDAY',
      startTime: '12:00',
      endTime: '13:00',
      type: SlotType.LECTURE,
      subjects: [
        {
          id: 's8',
          name: 'Science',
          color: '#197020ff',
          roomId: 'r105',
          roomName: 'Room 105',
          className: '8',
          division: 'A',
        },
      ],
      subjectId: 's8',
    },
  ],
  WEDNESDAY: [
    {
      id: 'WEDNESDAY-0',
      sequence: 1,
      day: 'WEDNESDAY',
      startTime: '07:30',
      endTime: '08:30',
      type: SlotType.LECTURE,
      subjects: [
        {
          id: 's9',
          name: 'Mathematics',
          color: '#1573b6ff',
          roomId: 'r101',
          roomName: 'Room 101',
          className: '10',
          division: 'A',
        },
      ],
      subjectId: 's9',
    },
    {
      id: 'WEDNESDAY-1',
      sequence: 2,
      day: 'WEDNESDAY',
      startTime: '08:30',
      endTime: '09:30',
      type: SlotType.LECTURE,
      subjects: [
        {
          id: 's10',
          name: 'Science',
          color: '#197020ff',
          roomId: 'r103',
          roomName: 'Room 103',
          className: '8',
          division: 'B',
        },
      ],
      subjectId: 's10',
    },
    {
      id: 'WEDNESDAY-2',
      sequence: 3,
      day: 'WEDNESDAY',
      startTime: '09:30',
      endTime: '10:00',
      type: SlotType.BREAK,
      breakType: BreakType.SHORT,
      subjects: [],
    },
    {
      id: 'WEDNESDAY-3',
      sequence: 4,
      day: 'WEDNESDAY',
      startTime: '10:00',
      endTime: '11:00',
      type: SlotType.LECTURE,
      subjects: [
        {
          id: 's11',
          name: 'Mathematics',
          color: '#1573b6ff',
          roomId: 'r102',
          roomName: 'Room 102',
          className: '9',
          division: 'B',
        },
      ],
      subjectId: 's11',
    },
    {
      id: 'WEDNESDAY-4',
      sequence: 5,
      day: 'WEDNESDAY',
      startTime: '11:00',
      endTime: '12:00',
      type: SlotType.BREAK,
      breakType: BreakType.LUNCH,
      subjects: [],
    },
    {
      id: 'WEDNESDAY-5',
      sequence: 6,
      day: 'WEDNESDAY',
      startTime: '12:00',
      endTime: '13:00',
      type: SlotType.LECTURE,
      subjects: [
        {
          id: 's12',
          name: 'Science',
          color: '#197020ff',
          roomId: 'r105',
          roomName: 'Room 105',
          className: '8',
          division: 'A',
        },
      ],
      subjectId: 's12',
    },
  ],
  THURSDAY: [
    {
      id: 'THURSDAY-0',
      sequence: 1,
      day: 'THURSDAY',
      startTime: '07:30',
      endTime: '08:30',
      type: SlotType.LECTURE,
      subjects: [
        {
          id: 's13',
          name: 'Mathematics',
          color: '#1573b6ff',
          roomId: 'r101',
          roomName: 'Room 101',
          className: '10',
          division: 'A',
        },
      ],
      subjectId: 's13',
    },
    {
      id: 'THURSDAY-1',
      sequence: 2,
      day: 'THURSDAY',
      startTime: '08:30',
      endTime: '09:30',
      type: SlotType.LECTURE,
      subjects: [
        {
          id: 's14',
          name: 'Mathematics',
          color: '#b615a1ff',
          roomId: 'r102',
          roomName: 'Room 102',
          className: '10',
          division: 'B',
        },
      ],
      subjectId: 's14',
    },
    {
      id: 'THURSDAY-2',
      sequence: 3,
      day: 'THURSDAY',
      startTime: '09:30',
      endTime: '10:00',
      type: SlotType.BREAK,
      breakType: BreakType.SHORT,
      subjects: [],
    },
    {
      id: 'THURSDAY-3',
      sequence: 4,
      day: 'THURSDAY',
      startTime: '10:00',
      endTime: '11:00',
      type: SlotType.LECTURE,
      subjects: [
        {
          id: 's15',
          name: 'Science',
          color: '#197020ff',
          roomId: 'r103',
          roomName: 'Room 103',
          className: '8',
          division: 'B',
        },
      ],
      subjectId: 's15',
    },
    {
      id: 'THURSDAY-4',
      sequence: 5,
      day: 'THURSDAY',
      startTime: '11:00',
      endTime: '12:00',
      type: SlotType.BREAK,
      breakType: BreakType.LUNCH,
      subjects: [],
    },
    {
      id: 'THURSDAY-5',
      sequence: 6,
      day: 'THURSDAY',
      startTime: '12:00',
      endTime: '13:00',
      type: SlotType.LECTURE,
      subjects: [
        {
          id: 's16',
          name: 'Mathematics',
          color: '#1573b6ff',
          roomId: 'r101',
          roomName: 'Room 101',
          className: '9',
          division: 'A',
        },
      ],
      subjectId: 's16',
    },
  ],
  FRIDAY: [
    {
      id: 'FRIDAY-0',
      sequence: 1,
      day: 'FRIDAY',
      startTime: '07:30',
      endTime: '08:30',
      type: SlotType.LECTURE,
      subjects: [
        {
          id: 's17',
          name: 'Science',
          color: '#197020ff',
          roomId: 'r105',
          roomName: 'Room 105',
          className: '8',
          division: 'A',
        },
      ],
      subjectId: 's17',
    },
    {
      id: 'FRIDAY-1',
      sequence: 2,
      day: 'FRIDAY',
      startTime: '08:30',
      endTime: '09:30',
      type: SlotType.LECTURE,
      subjects: [
        {
          id: 's18',
          name: 'Mathematics',
          color: '#1573b6ff',
          roomId: 'r101',
          roomName: 'Room 101',
          className: '10',
          division: 'A',
        },
      ],
      subjectId: 's18',
    },
    {
      id: 'FRIDAY-2',
      sequence: 3,
      day: 'FRIDAY',
      startTime: '09:30',
      endTime: '10:00',
      type: SlotType.BREAK,
      breakType: BreakType.SHORT,
      subjects: [],
    },
    {
      id: 'FRIDAY-3',
      sequence: 4,
      day: 'FRIDAY',
      startTime: '10:00',
      endTime: '11:00',
      type: SlotType.LECTURE,
      subjects: [
        {
          id: 's19',
          name: 'Mathematics',
          color: '#1573b6ff',
          roomId: 'r102',
          roomName: 'Room 102',
          className: '9',
          division: 'B',
        },
      ],
      subjectId: 's19',
    },
    {
      id: 'FRIDAY-4',
      sequence: 5,
      day: 'FRIDAY',
      startTime: '11:00',
      endTime: '12:00',
      type: SlotType.BREAK,
      breakType: BreakType.LUNCH,
      subjects: [],
    },
    {
      id: 'FRIDAY-5',
      sequence: 6,
      day: 'FRIDAY',
      startTime: '12:00',
      endTime: '13:00',
      type: SlotType.LECTURE,
      subjects: [
        {
          id: 's20',
          name: 'Science',
          color: '#197020ff',
          roomId: 'r103',
          roomName: 'Room 103',
          className: '8',
          division: 'B',
        },
      ],
      subjectId: 's20',
    },
  ],
  SATURDAY: [
    {
      id: 'SATURDAY-0',
      sequence: 1,
      day: 'SATURDAY',
      startTime: '08:00',
      endTime: '09:00',
      type: SlotType.LECTURE,
      subjects: [
        {
          id: 's21',
          name: 'Mathematics',
          color: '#1573b6ff',
          roomId: 'r101',
          roomName: 'Room 101',
          className: '10',
          division: 'A',
        },
      ],
      subjectId: 's21',
    },
    {
      id: 'SATURDAY-1',
      sequence: 2,
      day: 'SATURDAY',
      startTime: '09:00',
      endTime: '09:30',
      type: SlotType.BREAK,
      breakType: BreakType.SHORT,
      subjects: [],
    },
    {
      id: 'SATURDAY-2',
      sequence: 3,
      day: 'SATURDAY',
      startTime: '09:30',
      endTime: '11:00',
      type: SlotType.LECTURE,
      subjects: [
        {
          id: 's22',
          name: 'Science',
          color: '#197020ff',
          roomId: 'r105',
          roomName: 'Room 105',
          className: '8',
          division: 'A',
        },
      ],
      subjectId: 's22',
    },
  ],
};

// ----------------------------------------------------------------------

export default function TeacherSchedule() {
  return (
    <DashboardWidgetWrapper
      title="Today's Schedule"
      subheader="Week-wise timetable — Subject · Class/Div · Room"
    >
      <TimetableBoard
        slots={TEACHER_SLOTS}
        onChange={() => {}}
        subjects={[]}
        readOnly
        selectedClass="10"
        selectedDivision="A"
      />
    </DashboardWidgetWrapper>
  );
}
