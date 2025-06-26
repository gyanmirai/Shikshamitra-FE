import type { TimetableSlot } from 'src/screens/academic/timetable-schedule-management/timeTable/type';

import React from 'react';

import TimeTableView from 'src/screens/academic/timetable-schedule-management/timeTable/component/timeTableView';

const teacherTimetable: TimetableSlot[] = [
  {
    startTime: '07:00 Am',
    endTime: '08:00 Am',
    isBreak: false,
    class: '6',
    division: 'B',
    dayData: [
      {
        day: 'Mon',
        subjectColor: '#42a5f5',
        subjects: [{ subject: 'Math', subjectCode: 'MTH101', room: 'A102' }],
      },
      {
        day: 'Tue',
        subjectColor: '#42a5f5',
        subjects: [{ subject: 'Math', subjectCode: 'MTH101', room: 'B201' }],
      },
      {
        day: 'Wed',
        subjectColor: '#42a5f5',
        subjects: [],
      },
      {
        day: 'Thu',
        subjectColor: '#42a5f5',
        subjects: [{ subject: 'Math', subjectCode: 'MTH101', room: 'B201' }],
      },
      {
        day: 'Fri',
        subjectColor: '#42a5f5',
        subjects: [],
      },
      { day: 'Sat', subjectColor: '', subjects: [] },
    ],
  },
  {
    startTime: '08:00 Am',
    endTime: '09:00 Am',
    isBreak: false,
    class: '7',
    division: 'A',
    dayData: [
      {
        day: 'Mon',
        subjectColor: '#ef5350',
        subjects: [{ subject: 'Science', subjectCode: 'SCI201', room: 'Lab1' }],
      },
      {
        day: 'Tue',
        subjectColor: '#ef5350',
        subjects: [],
      },
      {
        day: 'Wed',
        subjectColor: '#ef5350',
        subjects: [{ subject: 'Science', subjectCode: 'SCI201', room: 'Lab2' }],
      },
      {
        day: 'Thu',
        subjectColor: '#ef5350',
        subjects: [{ subject: 'Science', subjectCode: 'SCI201', room: 'Lab1' }],
      },
      {
        day: 'Fri',
        subjectColor: '#ef5350',
        subjects: [{ subject: 'Science', subjectCode: 'SCI201', room: 'Lab1' }],
      },
      { day: 'Sat', subjectColor: '', subjects: [] },
    ],
  },
  {
    startTime: '09:00 Am',
    endTime: '10:00 Am',
    isBreak: false,
    class: '8',
    division: 'C',
    dayData: [
      {
        day: 'Mon',
        subjectColor: '#42a5f5',
        subjects: [{ subject: 'Math', subjectCode: 'MTH301', room: 'C301' }],
      },
      {
        day: 'Tue',
        subjectColor: '#42a5f5',
        subjects: [],
      },
      {
        day: 'Wed',
        subjectColor: '#42a5f5',
        subjects: [{ subject: 'Math', subjectCode: 'MTH301', room: 'C301' }],
      },
      {
        day: 'Thu',
        subjectColor: '#42a5f5',
        subjects: [{ subject: 'Math', subjectCode: 'MTH301', room: 'C301' }],
      },
      {
        day: 'Fri',
        subjectColor: '#42a5f5',
        subjects: [],
      },
      { day: 'Sat', subjectColor: '', subjects: [] },
    ],
  },
  {
    startTime: '10:00 Am',
    endTime: '10:30 Am',
    isBreak: true,
    dayData: [],
  },
  {
    startTime: '10:30 Am',
    endTime: '11:30 Am',
    isBreak: false,
    class: '9',
    division: 'A',
    dayData: [
      {
        day: 'Mon',
        subjectColor: '#ef5350',
        subjects: [{ subject: 'Science', subjectCode: 'SCI401', room: 'Lab1' }],
      },
      {
        day: 'Tue',
        subjectColor: '#ef5350',
        subjects: [{ subject: 'Science', subjectCode: 'SCI401', room: 'Lab1' }],
      },
      {
        day: 'Wed',
        subjectColor: '#ef5350',
        subjects: [{ subject: 'Science', subjectCode: 'SCI401', room: 'Lab1' }],
      },
      {
        day: 'Thu',
        subjectColor: '#ef5350',
        subjects: [{ subject: 'Science', subjectCode: 'SCI401', room: 'Lab1' }],
      },
      {
        day: 'Fri',
        subjectColor: '#ef5350',
        subjects: [],
      },
      { day: 'Sat', subjectColor: '', subjects: [] },
    ],
  },
  {
    startTime: '11:30 Am',
    endTime: '12:00 Pm',
    isBreak: false,
    class: '10',
    division: 'B',
    dayData: [
      {
        day: 'Mon',
        subjectColor: '#42a5f5',
        subjects: [{ subject: 'Math', subjectCode: 'MTH501', room: 'E101' }],
      },
      {
        day: 'Tue',
        subjectColor: '#42a5f5',
        subjects: [],
      },
      {
        day: 'Wed',
        subjectColor: '#42a5f5',
        subjects: [{ subject: 'Math', subjectCode: 'MTH501', room: 'E101' }],
      },
      {
        day: 'Thu',
        subjectColor: '#42a5f5',
        subjects: [{ subject: 'Math', subjectCode: 'MTH501', room: 'E101' }],
      },
      {
        day: 'Fri',
        subjectColor: '#42a5f5',
        subjects: [{ subject: 'Math', subjectCode: 'MTH501', room: 'E101' }],
      },
      { day: 'Sat', subjectColor: '', subjects: [] },
    ],
  },
];

const AcademicTimetable = () => (
  <TimeTableView
    isClassVisible
    isDivisionVisible
    isDrag={false}
    isRoomVisible
    isTeacherVisible={false}
    timeTableData={teacherTimetable}
    showThreeDots={false}
  />
);

export default AcademicTimetable;
