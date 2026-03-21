import type { TimetableSlot } from 'src/screens/academic/timetable-schedule-management/time-table/type';

import React from 'react';
import TimeTableView from 'src/screens/academic/timetable-schedule-management/time-table/component/timeTableView';

const employeeTimetable: TimetableSlot[] = [
  {
    startTime: '07:00 AM',
    endTime: '08:00 AM',
    isBreak: false,
    dayData: [
      {
        day: 'Mon',
        subjectColor: '#42a5f5',
        subjects: [
          {
            subject: 'Math',
            subjectCode: 'MTH101',
            teacher: 'Kumar Rajesh Sharma',
            room: 'A102',
            class: '10',
            division: 'A',
          },
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
            class: '9',
            division: 'B',
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
            class: '8',
            division: 'C',
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
            class: '10',
            division: 'B',
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
            class: '9',
            division: 'A',
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
            class: '8',
            division: 'D',
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
            class: '8',
            division: 'A',
          },
        ],
      },
      {
        day: 'Tue',
        subjectColor: '#42a5f5',
        subjects: [
          {
            subject: 'Math',
            subjectCode: 'MTH101',
            teacher: 'Kumar Rajesh Sharma',
            room: 'A102',
            class: '10',
            division: 'C',
          },
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
            class: '9',
            division: 'D',
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
            class: '10',
            division: 'D',
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
            class: '9',
            division: 'C',
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
            class: '8',
            division: 'B',
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
            class: '10',
            division: 'A',
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
            class: '9',
            division: 'B',
          },
        ],
      },
      {
        day: 'Wed',
        subjectColor: '#42a5f5',
        subjects: [
          {
            subject: 'Math',
            subjectCode: 'MTH101',
            teacher: 'Kumar Rajesh Sharma',
            room: 'A102',
            class: '8',
            division: 'C',
          },
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
            class: '10',
            division: 'B',
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
            class: '9',
            division: 'A',
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
            class: '8',
            division: 'D',
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
            class: '9',
            division: 'C',
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
            class: '8',
            division: 'A',
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
            class: '10',
            division: 'C',
          },
        ],
      },
      {
        day: 'Thu',
        subjectColor: '#42a5f5',
        subjects: [
          {
            subject: 'Math',
            subjectCode: 'MTH101',
            teacher: 'Kumar Rajesh Sharma',
            room: 'A102',
            class: '9',
            division: 'B',
          },
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
            class: '10',
            division: 'A',
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
            class: '8',
            division: 'D',
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
            class: '9',
            division: 'A',
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
            class: '8',
            division: 'C',
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
            class: '10',
            division: 'D',
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
            class: '9',
            division: 'D',
          },
        ],
      },
      {
        day: 'Fri',
        subjectColor: '#42a5f5',
        subjects: [
          {
            subject: 'Math',
            subjectCode: 'MTH101',
            teacher: 'Kumar Rajesh Sharma',
            room: 'A102',
            class: '10',
            division: 'B',
          },
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
            class: '8',
            division: 'A',
          },
        ],
      },
    ],
  },
];

const EmployeeTimetable = () => (
  <TimeTableView
    isClassVisible
    isDivisionVisible
    isDrag={false}
    isRoomVisible
    isTeacherVisible={false}
    timeTableData={employeeTimetable}
    showThreeDots={false}
  />
);

export default EmployeeTimetable;
