import type { TimetableSlot } from 'src/screens/academic/timetable-schedule-management/timeTable/type';

import React from 'react';
import { Box, Typography } from '@mui/material';
import TimeTableView from 'src/screens/academic/timetable-schedule-management/timeTable/component/timeTableView';

const studentTimetable: TimetableSlot[] = [
  {
    startTime: '08:00 AM',
    endTime: '08:40 AM',
    isBreak: false,
    dayData: [
      {
        day: 'Mon',
        subjectColor: '#ffb300',
        subjects: [
          {
            subject: 'Mathematics',
            subjectCode: 'MATH-10',
            teacher: 'Mr. Mathur',
            room: 'Room A-101',
          },
        ],
      },
      {
        day: 'Tue',
        subjectColor: '#00acc1',
        subjects: [
          {
            subject: 'Science',
            subjectCode: 'SCI-12',
            teacher: 'Mrs. Rao',
            room: 'Lab 1',
          },
        ],
      },
      {
        day: 'Wed',
        subjectColor: '#3949ab',
        subjects: [
          {
            subject: 'English',
            subjectCode: 'ENG-12',
            teacher: 'Ms. Wilson',
            room: 'Room B-203',
          },
        ],
      },
      {
        day: 'Thu',
        subjectColor: '#8d6e63',
        subjects: [
          {
            subject: 'Social Science',
            subjectCode: 'SOC-12',
            teacher: 'Mr. Desai',
            room: 'Room C-105',
          },
        ],
      },
      {
        day: 'Fri',
        subjectColor: '#43a047',
        subjects: [
          {
            subject: 'Gujarati',
            subjectCode: 'GUJ-12',
            teacher: 'Ms. Trivedi',
            room: 'Room D-102',
          },
        ],
      },
      {
        day: 'Sat',
        subjectColor: '#1e88e5',
        subjects: [
          {
            subject: 'Computer',
            subjectCode: 'CS-12',
            teacher: 'Mr. Rao',
            room: 'Computer Lab',
          },
        ],
      },
    ],
  },
  {
    startTime: '08:40 AM',
    endTime: '09:20 AM',
    isBreak: true,
    dayData: [],
  },
  {
    startTime: '09:20 AM',
    endTime: '10:10 AM',
    isBreak: false,
    dayData: [
      {
        day: 'Mon',
        subjectColor: '#3949ab',
        subjects: [
          {
            subject: 'English',
            subjectCode: 'ENG-12',
            teacher: 'Ms. Wilson',
            room: 'Room B-203',
          },
        ],
      },
      {
        day: 'Tue',
        subjectColor: '#ffb300',
        subjects: [
          {
            subject: 'Mathematics',
            subjectCode: 'MATH-10',
            teacher: 'Mr. Mathur',
            room: 'Room A-101',
          },
        ],
      },
      {
        day: 'Wed',
        subjectColor: '#00acc1',
        subjects: [
          {
            subject: 'Science',
            subjectCode: 'SCI-12',
            teacher: 'Mrs. Rao',
            room: 'Lab 1',
          },
        ],
      },
      {
        day: 'Thu',
        subjectColor: '#43a047',
        subjects: [
          {
            subject: 'Gujarati',
            subjectCode: 'GUJ-12',
            teacher: 'Ms. Trivedi',
            room: 'Room D-102',
          },
        ],
      },
      {
        day: 'Fri',
        subjectColor: '#8d6e63',
        subjects: [
          {
            subject: 'Social Science',
            subjectCode: 'SOC-12',
            teacher: 'Mr. Desai',
            room: 'Room C-105',
          },
        ],
      },
      {
        day: 'Sat',
        subjectColor: '#ab47bc',
        subjects: [
          {
            subject: 'Hindi',
            subjectCode: 'HIN-12',
            teacher: 'Mr. Mehta',
            room: 'Room E-201',
          },
        ],
      },
    ],
  },
  {
    startTime: '10:10 AM',
    endTime: '10:50 AM',
    isBreak: false,
    dayData: [
      {
        day: 'Mon',
        subjectColor: '#00acc1',
        subjects: [
          {
            subject: 'Science',
            subjectCode: 'SCI-12',
            teacher: 'Mrs. Rao',
            room: 'Lab 1',
          },
        ],
      },
      {
        day: 'Tue',
        subjectColor: '#3949ab',
        subjects: [
          {
            subject: 'English',
            subjectCode: 'ENG-12',
            teacher: 'Ms. Wilson',
            room: 'Room B-203',
          },
        ],
      },
      {
        day: 'Wed',
        subjectColor: '#ffb300',
        subjects: [
          {
            subject: 'Mathematics',
            subjectCode: 'MATH-10',
            teacher: 'Mr. Mathur',
            room: 'Room A-101',
          },
        ],
      },
      {
        day: 'Thu',
        subjectColor: '#1e88e5',
        subjects: [
          {
            subject: 'Computer',
            subjectCode: 'CS-12',
            teacher: 'Mr. Rao',
            room: 'Computer Lab',
          },
        ],
      },
      {
        day: 'Fri',
        subjectColor: '#ffb300',
        subjects: [
          {
            subject: 'Mathematics',
            subjectCode: 'MATH-10',
            teacher: 'Mr. Mathur',
            room: 'Room A-101',
          },
        ],
      },
      {
        day: 'Sat',
        subjectColor: '#3949ab',
        subjects: [
          {
            subject: 'English',
            subjectCode: 'ENG-12',
            teacher: 'Ms. Wilson',
            room: 'Room B-203',
          },
        ],
      },
    ],
  },
  {
    startTime: '10:50 AM',
    endTime: '11:30 AM',
    isBreak: false,
    dayData: [
      {
        day: 'Mon',
        subjectColor: '#8d6e63',
        subjects: [
          {
            subject: 'Social Science',
            subjectCode: 'SOC-12',
            teacher: 'Mr. Desai',
            room: 'Room C-105',
          },
        ],
      },
      {
        day: 'Tue',
        subjectColor: '#43a047',
        subjects: [
          {
            subject: 'Gujarati',
            subjectCode: 'GUJ-12',
            teacher: 'Ms. Trivedi',
            room: 'Room D-102',
          },
        ],
      },
      {
        day: 'Wed',
        subjectColor: '#8d6e63',
        subjects: [
          {
            subject: 'Social Science',
            subjectCode: 'SOC-12',
            teacher: 'Mr. Desai',
            room: 'Room C-105',
          },
        ],
      },
      {
        day: 'Thu',
        subjectColor: '#ffb300',
        subjects: [
          {
            subject: 'Mathematics',
            subjectCode: 'MATH-10',
            teacher: 'Mr. Mathur',
            room: 'Room A-101',
          },
        ],
      },
      {
        day: 'Fri',
        subjectColor: '#3949ab',
        subjects: [
          {
            subject: 'English',
            subjectCode: 'ENG-12',
            teacher: 'Ms. Wilson',
            room: 'Room B-203',
          },
        ],
      },
      {
        day: 'Sat',
        subjectColor: '#00acc1',
        subjects: [
          {
            subject: 'Science',
            subjectCode: 'SCI-12',
            teacher: 'Mrs. Rao',
            room: 'Lab 1',
          },
        ],
      },
    ],
  },
  {
    startTime: '11:30 AM',
    endTime: '12:00 PM',
    isBreak: true,
    dayData: [],
  },
  {
    startTime: '12:00 PM',
    endTime: '12:30 PM',
    isBreak: false,
    dayData: [
      {
        day: 'Mon',
        subjectColor: '#43a047',
        subjects: [
          {
            subject: 'Gujarati',
            subjectCode: 'GUJ-12',
            teacher: 'Ms. Trivedi',
            room: 'Room D-102',
          },
        ],
      },
      {
        day: 'Tue',
        subjectColor: '#8d6e63',
        subjects: [
          {
            subject: 'Social Science',
            subjectCode: 'SOC-12',
            teacher: 'Mr. Desai',
            room: 'Room C-105',
          },
        ],
      },
      {
        day: 'Wed',
        subjectColor: '#43a047',
        subjects: [
          {
            subject: 'Gujarati',
            subjectCode: 'GUJ-12',
            teacher: 'Ms. Trivedi',
            room: 'Room D-102',
          },
        ],
      },
      {
        day: 'Thu',
        subjectColor: '#00acc1',
        subjects: [
          {
            subject: 'Science',
            subjectCode: 'SCI-12',
            teacher: 'Mrs. Rao',
            room: 'Lab 1',
          },
        ],
      },
      {
        day: 'Fri',
        subjectColor: '#1e88e5',
        subjects: [
          {
            subject: 'Physical Training',
            subjectCode: 'PE-12',
            teacher: 'Coach Vivek',
            room: 'Sports Ground',
          },
        ],
      },
      {
        day: 'Sat',
        subjectColor: '#ffb300',
        subjects: [
          {
            subject: 'Mathematics',
            subjectCode: 'MATH-10',
            teacher: 'Mr. Mathur',
            room: 'Room A-101',
          },
        ],
      },
    ],
  },
];

const AcademicTimetable = () => (
  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
    <Typography variant="h6" mb={2}>
      Timetable
    </Typography>
    <TimeTableView
      isClassVisible={false}
      isDivisionVisible={false}
      isDrag={false}
      isRoomVisible
      isTeacherVisible
      timeTableData={studentTimetable}
      showThreeDots={false}
    />
  </Box>
);

export default AcademicTimetable;
