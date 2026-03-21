import React from 'react';
import { Box, Typography } from '@mui/material';

import TimeTableView from '../../timetable-schedule-management/time-table/component/timeTableView';

import type { TimetableSlot } from '../../timetable-schedule-management/time-table/type';

const studentTimetable: TimetableSlot[] = [
  {
    startTime: '07:00 AM',
    endTime: '08:00 AM',
    isBreak: false,
    dayData: [
      {
        day: 'Mon',
        subjectColor: '#42a5f5',
        subjects: [
          { subject: 'Math', subjectCode: 'MTH101', teacher: 'Kumar Rajesh Sharma', room: 'A102' },
        ],
      },
      {
        day: 'Tue',
        subjectColor: '#ff7043',
        subjects: [
          {
            subject: 'English',
            subjectCode: 'ENG101',
            teacher: 'Priyanka Rina Mehta',
            room: 'B201',
          },
        ],
      },
      {
        day: 'Wed',
        subjectColor: '#66bb6a',
        subjects: [
          {
            subject: 'Science',
            subjectCode: 'SCI101',
            teacher: 'Mohan Prakash Joshi',
            room: 'Lab1',
          },
        ],
      },
      {
        day: 'Thu',
        subjectColor: '#ab47bc',
        subjects: [
          {
            subject: 'Social Science',
            subjectCode: 'SOC101',
            teacher: 'Anjali Priya Desai',
            room: 'C103',
          },
        ],
      },
      {
        day: 'Fri',
        subjectColor: '#29b6f6',
        subjects: [
          {
            subject: 'Gujarati',
            subjectCode: 'GUJ101',
            teacher: 'Ramesh Hardik Patel',
            room: 'D101',
          },
        ],
      },
      {
        day: 'Sat',
        subjectColor: '#ec407a',
        subjects: [
          {
            subject: 'Computer',
            subjectCode: 'CMP101',
            teacher: 'Dipak Falguni Shah',
            room: 'Lab2',
          },
        ],
      },
    ],
  },
  {
    startTime: '08:00 AM',
    endTime: '09:00 AM',
    isBreak: false,
    dayData: [
      {
        day: 'Mon',
        subjectColor: '#ff7043',
        subjects: [
          {
            subject: 'English',
            subjectCode: 'ENG101',
            teacher: 'Priyanka Rina Mehta',
            room: 'B201',
          },
        ],
      },
      {
        day: 'Tue',
        subjectColor: '#42a5f5',
        subjects: [
          { subject: 'Math', subjectCode: 'MTH101', teacher: 'Kumar Rajesh Sharma', room: 'A102' },
        ],
      },
      {
        day: 'Wed',
        subjectColor: '#ab47bc',
        subjects: [
          {
            subject: 'Social Science',
            subjectCode: 'SOC101',
            teacher: 'Anjali Priya Desai',
            room: 'C103',
          },
        ],
      },
      {
        day: 'Thu',
        subjectColor: '#66bb6a',
        subjects: [
          {
            subject: 'Science',
            subjectCode: 'SCI101',
            teacher: 'Mohan Prakash Joshi',
            room: 'Lab1',
          },
        ],
      },
      {
        day: 'Fri',
        subjectColor: '#ec407a',
        subjects: [
          {
            subject: 'Computer',
            subjectCode: 'CMP101',
            teacher: 'Dipak Falguni Shah',
            room: 'Lab2',
          },
        ],
      },
      {
        day: 'Sat',
        subjectColor: '#29b6f6',
        subjects: [
          {
            subject: 'Gujarati',
            subjectCode: 'GUJ101',
            teacher: 'Ramesh Hardik Patel',
            room: 'D101',
          },
        ],
      },
    ],
  },
  {
    startTime: '09:00 AM',
    endTime: '10:00 AM',
    isBreak: false,
    dayData: [
      {
        day: 'Mon',
        subjectColor: '#66bb6a',
        subjects: [
          {
            subject: 'Science',
            subjectCode: 'SCI101',
            teacher: 'Mohan Prakash Joshi',
            room: 'Lab1',
          },
        ],
      },
      {
        day: 'Tue',
        subjectColor: '#ab47bc',
        subjects: [
          {
            subject: 'Social Science',
            subjectCode: 'SOC101',
            teacher: 'Anjali Priya Desai',
            room: 'C103',
          },
        ],
      },
      {
        day: 'Wed',
        subjectColor: '#42a5f5',
        subjects: [
          { subject: 'Math', subjectCode: 'MTH101', teacher: 'Kumar Rajesh Sharma', room: 'A102' },
        ],
      },
      {
        day: 'Thu',
        subjectColor: '#ff7043',
        subjects: [
          {
            subject: 'English',
            subjectCode: 'ENG101',
            teacher: 'Priyanka Rina Mehta',
            room: 'B201',
          },
        ],
      },
      {
        day: 'Fri',
        subjectColor: '#ec407a',
        subjects: [
          {
            subject: 'Computer',
            subjectCode: 'CMP101',
            teacher: 'Dipak Falguni Shah',
            room: 'Lab2',
          },
        ],
      },
      {
        day: 'Sat',
        subjectColor: '#ab47bc',
        subjects: [
          {
            subject: 'Sanskrit',
            subjectCode: 'SAN101',
            teacher: 'Shastri Venkatesh Iyer',
            room: 'D201',
          },
        ],
      },
    ],
  },
  {
    startTime: '10:00 AM',
    endTime: '10:30 AM',
    isBreak: true,
    dayData: [],
  },
  {
    startTime: '10:30 AM',
    endTime: '11:30 AM',
    isBreak: false,
    dayData: [
      {
        day: 'Mon',
        subjectColor: '#29b6f6',
        subjects: [
          {
            subject: 'Gujarati',
            subjectCode: 'GUJ101',
            teacher: 'Ramesh Hardik Patel',
            room: 'D101',
          },
        ],
      },
      {
        day: 'Tue',
        subjectColor: '#ec407a',
        subjects: [
          {
            subject: 'Computer',
            subjectCode: 'CMP101',
            teacher: 'Dipak Falguni Shah',
            room: 'Lab2',
          },
        ],
      },
      {
        day: 'Wed',
        subjectColor: '#ff7043',
        subjects: [
          {
            subject: 'English',
            subjectCode: 'ENG101',
            teacher: 'Priyanka Rina Mehta',
            room: 'B201',
          },
        ],
      },
      {
        day: 'Thu',
        subjectColor: '#42a5f5',
        subjects: [
          { subject: 'Math', subjectCode: 'MTH101', teacher: 'Kumar Rajesh Sharma', room: 'A102' },
        ],
      },
      {
        day: 'Fri',
        subjectColor: '#ab47bc',
        subjects: [
          {
            subject: 'Sanskrit',
            subjectCode: 'SAN101',
            teacher: 'Shastri Venkatesh Iyer',
            room: 'D201',
          },
        ],
      },
      {
        day: 'Sat',
        subjectColor: '#66bb6a',
        subjects: [
          {
            subject: 'Science',
            subjectCode: 'SCI101',
            teacher: 'Mohan Prakash Joshi',
            room: 'Lab1',
          },
        ],
      },
    ],
  },
  {
    startTime: '11:30 AM',
    endTime: '12:30 PM',
    isBreak: false,
    dayData: [
      {
        day: 'Mon',
        subjectColor: '#ab47bc',
        subjects: [
          {
            subject: 'Social Science',
            subjectCode: 'SOC101',
            teacher: 'Anjali Priya Desai',
            room: 'C103',
          },
        ],
      },
      {
        day: 'Tue',
        subjectColor: '#29b6f6',
        subjects: [
          {
            subject: 'Gujarati',
            subjectCode: 'GUJ101',
            teacher: 'Ramesh Hardik Patel',
            room: 'D101',
          },
        ],
      },
      {
        day: 'Wed',
        subjectColor: '#ec407a',
        subjects: [
          {
            subject: 'Computer',
            subjectCode: 'CMP101',
            teacher: 'Dipak Falguni Shah',
            room: 'Lab2',
          },
        ],
      },
      {
        day: 'Thu',
        subjectColor: '#ab47bc',
        subjects: [
          {
            subject: 'Sanskrit',
            subjectCode: 'SAN101',
            teacher: 'Shastri Venkatesh Iyer',
            room: 'D201',
          },
        ],
      },
      {
        day: 'Fri',
        subjectColor: '#42a5f5',
        subjects: [
          { subject: 'Math', subjectCode: 'MTH101', teacher: 'Kumar Rajesh Sharma', room: 'A102' },
        ],
      },
      {
        day: 'Sat',
        subjectColor: '#ff7043',
        subjects: [
          {
            subject: 'English',
            subjectCode: 'ENG101',
            teacher: 'Priyanka Rina Mehta',
            room: 'B201',
          },
        ],
      },
    ],
  },
];

const AcademicDashboardTimetable = () => (
  <>
    <Typography variant="h6" mb={2}>
      Timetable
    </Typography>

    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
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
  </>
);

export default AcademicDashboardTimetable;
