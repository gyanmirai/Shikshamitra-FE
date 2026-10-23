import React, { useState } from 'react';
import { Box, Card, Switch } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import EditNotificationDialog from 'src/screens/student/studentNotification/editNotificationDialog';
import {
  NotificationStatusType,
  NotificationStatusOptions,
} from 'src/enums/notification-status-type';

export const examinationNotificationsData = [
  {
    id: '1',
    event: 'Exam timetable published',
    triggerCondition:
      'When subject-wise exam dates, start/end times, and durations are finalized and visible to users.',
    recipient: [
      {
        name: 'Student',
        message:
          'Exam timetable for [Exam Name] has been published. Check your schedule for [Subject Name].',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Exam Name]', '[Subject Name]'],
        placeHolderOptions: [
          { value: '[Exam Name]', label: 'Exam Name' },
          { value: '[Subject Name]', label: 'Subject Name' },
        ],
        isEnable: true,
      },
      {
        name: 'Teacher',
        message: 'Exam timetable for [Exam Name] has been published for your subjects.',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Exam Name]'],
        placeHolderOptions: [{ value: '[Exam Name]', label: 'Exam Name' }],
        isEnable: true,
      },
      {
        name: 'Principal',
        message: 'Exam timetable for [Exam Name] is now visible to all users.',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Exam Name]'],
        placeHolderOptions: [{ value: '[Exam Name]', label: 'Exam Name' }],
        isEnable: true,
      },
    ],
  },
  {
    id: '2',
    event: 'Exam approval by Principal',
    triggerCondition:
      'When the principal officially approves and finalizes the examination schedule.',
    recipient: [
      {
        name: 'Admin',
        message: 'Principal has approved the [Exam Name] timetable.',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Exam Name]'],
        placeHolderOptions: [{ value: '[Exam Name]', label: 'Exam Name' }],
        isEnable: true,
      },
      {
        name: 'Teacher',
        message: 'Principal has approved the final [Exam Name] timetable.',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Exam Name]'],
        placeHolderOptions: [{ value: '[Exam Name]', label: 'Exam Name' }],
        isEnable: true,
      },
    ],
  },
  {
    id: '3',
    event: 'Exam rescheduled (after publish)',
    triggerCondition: 'When any published exam date/time/room is modified after publishing.',
    recipient: [
      {
        name: 'Student',
        message: '[Subject Name] exam has been rescheduled to [New Date] at [New Time].',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Subject Name]', '[New Date]', '[New Time]'],
        placeHolderOptions: [
          { value: '[Subject Name]', label: 'Subject Name' },
          { value: '[New Date]', label: 'New Date' },
          { value: '[New Time]', label: 'New Time' },
        ],
        isEnable: true,
      },
      {
        name: 'Teacher',
        message:
          'Exam reschedule notice: [Subject Name] has been moved to [New Date] ([New Time]).',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Subject Name]', '[New Date]', '[New Time]'],
        placeHolderOptions: [
          { value: '[Subject Name]', label: 'Subject Name' },
          { value: '[New Date]', label: 'New Date' },
          { value: '[New Time]', label: 'New Time' },
        ],
        isEnable: true,
      },
      {
        name: 'Invigilators',
        message:
          'Exam schedule updated for [Subject Name] — please check new timing and room details.',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Subject Name]'],
        placeHolderOptions: [{ value: '[Subject Name]', label: 'Subject Name' }],
        isEnable: true,
      },
      {
        name: 'Principal',
        message: 'Exam [Subject Name] rescheduled to [New Date] ([New Time]).',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Subject Name]', '[New Date]', '[New Time]'],
        placeHolderOptions: [
          { value: '[Subject Name]', label: 'Subject Name' },
          { value: '[New Date]', label: 'New Date' },
          { value: '[New Time]', label: 'New Time' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '4',
    event: 'Exam conflict alert (if any detected)',
    triggerCondition:
      'When overlapping exam schedules or room conflicts are detected post-publish.',
    recipient: [
      {
        name: 'Admin',
        message: 'Exam conflict detected for [Class Name] — overlapping schedule or room issue.',
        communicationChannel: ['In-App'],
        placeHolder: ['[Class Name]'],
        placeHolderOptions: [{ value: '[Class Name]', label: 'Class Name' }],
        isEnable: true,
      },
      {
        name: 'Principal',
        message: 'Conflict alert: overlapping exam detected in [Room Number] for [Class Name].',
        communicationChannel: ['In-App'],
        placeHolder: ['[Room Number]', '[Class Name]'],
        placeHolderOptions: [
          { value: '[Room Number]', label: 'Room Number' },
          { value: '[Class Name]', label: 'Class Name' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '5',
    event: 'Exam reminder',
    triggerCondition:
      'Automatically sent one day before each scheduled exam (based on published timetable).',
    recipient: [
      {
        name: 'Student',
        message: 'Reminder: Your [Subject Name] exam is scheduled for tomorrow at [Time].',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Subject Name]', '[Time]'],
        placeHolderOptions: [
          { value: '[Subject Name]', label: 'Subject Name' },
          { value: '[Time]', label: 'Time' },
        ],
        isEnable: true,
      },
      {
        name: 'Teacher',
        message:
          'Reminder: You are assigned for invigilation in [Room Number] for [Subject Name] tomorrow.',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Room Number]', '[Subject Name]'],
        placeHolderOptions: [
          { value: '[Room Number]', label: 'Room Number' },
          { value: '[Subject Name]', label: 'Subject Name' },
        ],
        isEnable: true,
      },
      {
        name: 'Invigilators',
        message: 'Exam reminder: [Subject Name] scheduled tomorrow at [Time] in [Room Number].',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Subject Name]', '[Time]', '[Room Number]'],
        placeHolderOptions: [
          { value: '[Subject Name]', label: 'Subject Name' },
          { value: '[Time]', label: 'Time' },
          { value: '[Room Number]', label: 'Room Number' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '9',
    event: 'Seat allocation completed',
    triggerCondition:
      'When all students are assigned seats for the selected exam (after saving or confirming allocation).',
    recipient: [
      {
        name: 'Principal',
        message:
          'Seat allocation for [Exam Name] has been successfully completed for all divisions.',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Exam Name]'],
        placeHolderOptions: [{ value: '[Exam Name]', label: 'Exam Name' }],
        isEnable: true,
      },
      {
        name: 'Admin',
        message:
          'Seat allocation process for [Exam Name] has been completed and saved successfully.',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Exam Name]'],
        placeHolderOptions: [{ value: '[Exam Name]', label: 'Exam Name' }],
        isEnable: true,
      },
    ],
  },
  {
    id: '10',
    event: 'Seat allocation published',
    triggerCondition:
      'When seat numbers and room details become visible to students and invigilators.',
    recipient: [
      {
        name: 'Student',
        message:
          'Your seat for [Exam Name] is published — Seat No: [Seat Number], Room: [Room Number].',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Exam Name]', '[Seat Number]', '[Room Number]'],
        placeHolderOptions: [
          { value: '[Exam Name]', label: 'Exam Name' },
          { value: '[Seat Number]', label: 'Seat Number' },
          { value: '[Room Number]', label: 'Room Number' },
        ],
        isEnable: true,
      },
      {
        name: 'Invigilators',
        message:
          'Seat allocation for [Exam Name] is now available. Please verify Room [Room Number].',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Exam Name]', '[Room Number]'],
        placeHolderOptions: [
          { value: '[Exam Name]', label: 'Exam Name' },
          { value: '[Room Number]', label: 'Room Number' },
        ],
        isEnable: true,
      },
      {
        name: 'Teacher',
        message: 'Seat allocation for [Exam Name] has been published for your class/division.',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Exam Name]'],
        placeHolderOptions: [{ value: '[Exam Name]', label: 'Exam Name' }],
        isEnable: true,
      },
    ],
  },
  {
    id: '11',
    event: 'Student range allocated to room',
    triggerCondition:
      'When a batch (range of roll numbers) of students is assigned to a specific room.',
    recipient: [
      {
        name: 'Invigilators',
        message: 'Student range [Roll Range] assigned to Room [Room Number] for [Exam Name].',
        communicationChannel: ['In-App'],
        placeHolder: ['[Roll Range]', '[Room Number]', '[Exam Name]'],
        placeHolderOptions: [
          { value: '[Roll Range]', label: 'Roll Range' },
          { value: '[Room Number]', label: 'Room Number' },
          { value: '[Exam Name]', label: 'Exam Name' },
        ],
        isEnable: true,
      },
      {
        name: 'Teacher',
        message:
          'Students with roll numbers [Roll Range] have been allocated to Room [Room Number].',
        communicationChannel: ['In-App'],
        placeHolder: ['[Roll Range]', '[Room Number]'],
        placeHolderOptions: [
          { value: '[Roll Range]', label: 'Roll Range' },
          { value: '[Room Number]', label: 'Room Number' },
        ],
        isEnable: true,
      },
      {
        name: 'Principal',
        message: 'Room [Room Number] assigned to student range [Roll Range] for [Exam Name].',
        communicationChannel: ['In-App'],
        placeHolder: ['[Room Number]', '[Roll Range]', '[Exam Name]'],
        placeHolderOptions: [
          { value: '[Room Number]', label: 'Room Number' },
          { value: '[Roll Range]', label: 'Roll Range' },
          { value: '[Exam Name]', label: 'Exam Name' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '12',
    event: 'Seat allocation updated',
    triggerCondition:
      'When seat assignments are modified or reallocated (seat number or room change).',
    recipient: [
      {
        name: 'Student',
        message:
          'Your seat has been updated for [Exam Name] — New Seat: [Seat Number], Room: [Room Number].',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Exam Name]', '[Seat Number]', '[Room Number]'],
        placeHolderOptions: [
          { value: '[Exam Name]', label: 'Exam Name' },
          { value: '[Seat Number]', label: 'Seat Number' },
          { value: '[Room Number]', label: 'Room Number' },
        ],
        isEnable: true,
      },
      {
        name: 'Invigilators',
        message:
          'Seat changes detected for Room [Room Number] in [Exam Name]. Please review updated student list.',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Room Number]', '[Exam Name]'],
        placeHolderOptions: [
          { value: '[Room Number]', label: 'Room Number' },
          { value: '[Exam Name]', label: 'Exam Name' },
        ],
        isEnable: true,
      },
      {
        name: 'Teacher',
        message:
          'Seat allocation has been updated for [Exam Name]. Review changes for your division.',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Exam Name]'],
        placeHolderOptions: [{ value: '[Exam Name]', label: 'Exam Name' }],
        isEnable: true,
      },
    ],
  },
  {
    id: '13',
    event: 'Seat reallocation (conflict correction)',
    triggerCondition:
      'When students are moved to another room or seat due to a conflict or correction.',
    recipient: [
      {
        name: 'Student',
        message:
          'Seat updated due to correction — New Seat No: [Seat Number], Room: [Room Number], Exam: [Exam Name].',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Seat Number]', '[Room Number]', '[Exam Name]'],
        placeHolderOptions: [
          { value: '[Seat Number]', label: 'Seat Number' },
          { value: '[Room Number]', label: 'Room Number' },
          { value: '[Exam Name]', label: 'Exam Name' },
        ],
        isEnable: true,
      },
      {
        name: 'Invigilators',
        message:
          'Seat reallocation notice: [Student Name] has been moved to Seat [Seat Number] in Room [Room Number].',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Student Name]', '[Seat Number]', '[Room Number]'],
        placeHolderOptions: [
          { value: '[Student Name]', label: 'Student Name' },
          { value: '[Seat Number]', label: 'Seat Number' },
          { value: '[Room Number]', label: 'Room Number' },
        ],
        isEnable: true,
      },
      {
        name: 'Principal',
        message: 'Seat reallocation completed for [Exam Name] — affected student: [Student Name].',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Exam Name]', '[Student Name]'],
        placeHolderOptions: [
          { value: '[Exam Name]', label: 'Exam Name' },
          { value: '[Student Name]', label: 'Student Name' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '14',
    event: 'Seat allocation deleted',
    triggerCondition: 'When an allocated seat or slot assignment is removed.',
    recipient: [
      {
        name: 'Admin',
        message: 'A seat allocation record for [Exam Name] was deleted from Room [Room Number].',
        communicationChannel: ['In-App'],
        placeHolder: ['[Exam Name]', '[Room Number]'],
        placeHolderOptions: [
          { value: '[Exam Name]', label: 'Exam Name' },
          { value: '[Room Number]', label: 'Room Number' },
        ],
        isEnable: true,
      },
      {
        name: 'Principal',
        message: 'Seat allocation removed for [Exam Name] — please verify recent changes.',
        communicationChannel: ['In-App'],
        placeHolder: ['[Exam Name]'],
        placeHolderOptions: [{ value: '[Exam Name]', label: 'Exam Name' }],
        isEnable: true,
      },
    ],
  },
  {
    id: '15',
    event: 'Seat conflict detected',
    triggerCondition:
      'When two students are assigned the same seat or overlapping range in the same room.',
    recipient: [
      {
        name: 'Admin',
        message:
          'Seat conflict detected in Room [Room Number]: [Student Name 1] and [Student Name 2] have the same seat number.',
        communicationChannel: ['In-App'],
        placeHolder: ['[Room Number]', '[Student Name 1]', '[Student Name 2]'],
        placeHolderOptions: [
          { value: '[Room Number]', label: 'Room Number' },
          { value: '[Student Name 1]', label: 'Student Name 1' },
          { value: '[Student Name 2]', label: 'Student Name 2' },
        ],
        isEnable: true,
      },
      {
        name: 'Principal',
        message: 'Conflict alert: Duplicate seat detected in Room [Room Number] for [Exam Name].',
        communicationChannel: ['In-App'],
        placeHolder: ['[Room Number]', '[Exam Name]'],
        placeHolderOptions: [
          { value: '[Room Number]', label: 'Room Number' },
          { value: '[Exam Name]', label: 'Exam Name' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '16',
    event: 'Room capacity exceeded',
    triggerCondition: 'When student count exceeds the maximum allowed capacity for the room.',
    recipient: [
      {
        name: 'Admin',
        message: 'Room [Room Number] exceeds capacity during seat allocation for [Exam Name].',
        communicationChannel: ['In-App'],
        placeHolder: ['[Room Number]', '[Exam Name]'],
        placeHolderOptions: [
          { value: '[Room Number]', label: 'Room Number' },
          { value: '[Exam Name]', label: 'Exam Name' },
        ],
        isEnable: true,
      },
      {
        name: 'Principal',
        message:
          'Capacity alert: [Student Count] students in Room [Room Number] (Max: [Max Capacity]).',
        communicationChannel: ['In-App'],
        placeHolder: ['[Student Count]', '[Room Number]', '[Max Capacity]'],
        placeHolderOptions: [
          { value: '[Student Count]', label: 'Student Count' },
          { value: '[Room Number]', label: 'Room Number' },
          { value: '[Max Capacity]', label: 'Max Capacity' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '17',
    event: 'Seat allocation reminder (pre-exam)',
    triggerCondition:
      'Automatically sent one day before the exam — includes seat number, room, and slot details.',
    recipient: [
      {
        name: 'Student',
        message:
          'Reminder: [Exam Name] tomorrow at [Exam Time]. Seat: [Seat Number], Room: [Room Number].',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Exam Name]', '[Exam Time]', '[Seat Number]', '[Room Number]'],
        placeHolderOptions: [
          { value: '[Exam Name]', label: 'Exam Name' },
          { value: '[Exam Time]', label: 'Exam Time' },
          { value: '[Seat Number]', label: 'Seat Number' },
          { value: '[Room Number]', label: 'Room Number' },
        ],
        isEnable: true,
      },
      {
        name: 'Invigilators',
        message: 'Reminder: Invigilation for [Exam Name] at [Exam Time] in Room [Room Number].',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Exam Name]', '[Exam Time]', '[Room Number]'],
        placeHolderOptions: [
          { value: '[Exam Name]', label: 'Exam Name' },
          { value: '[Exam Time]', label: 'Exam Time' },
          { value: '[Room Number]', label: 'Room Number' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '18',
    event: 'Marks entry started',
    triggerCondition:
      'When a teacher starts entering marks for students in a particular subject/division.',
    recipient: [
      {
        name: 'Admin',
        message:
          '[Teacher Name] has started entering marks for [Subject Name] ([Class Name] – [Division Name]).',
        communicationChannel: ['In-App'],
        placeHolder: ['[Teacher Name]', '[Subject Name]', '[Class Name]', '[Division Name]'],
        placeHolderOptions: [
          { value: '[Teacher Name]', label: 'Teacher Name' },
          { value: '[Subject Name]', label: 'Subject Name' },
          { value: '[Class Name]', label: 'Class Name' },
          { value: '[Division Name]', label: 'Division Name' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '19',
    event: 'Marks saved (draft)',
    triggerCondition: 'When marks are entered but not yet finalized or published by the teacher.',
    recipient: [
      {
        name: 'Admin',
        message:
          'Marks have been saved as draft for [Subject Name] ([Class Name] – [Division Name]) by [Teacher Name].',
        communicationChannel: ['In-App'],
        placeHolder: ['[Subject Name]', '[Class Name]', '[Division Name]', '[Teacher Name]'],
        placeHolderOptions: [
          { value: '[Subject Name]', label: 'Subject Name' },
          { value: '[Class Name]', label: 'Class Name' },
          { value: '[Division Name]', label: 'Division Name' },
          { value: '[Teacher Name]', label: 'Teacher Name' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '20',
    event: 'Marks updated',
    triggerCondition: 'When any student’s marks are edited before publishing.',
    recipient: [
      {
        name: 'Admin',
        message:
          '[Teacher Name] updated marks for [Student Name] in [Subject Name] ([Class Name]).',
        communicationChannel: ['In-App'],
        placeHolder: ['[Teacher Name]', '[Student Name]', '[Subject Name]', '[Class Name]'],
        placeHolderOptions: [
          { value: '[Teacher Name]', label: 'Teacher Name' },
          { value: '[Student Name]', label: 'Student Name' },
          { value: '[Subject Name]', label: 'Subject Name' },
          { value: '[Class Name]', label: 'Class Name' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '21',
    event: 'All marks entered for a division/subject',
    triggerCondition:
      'When a teacher completes mark entry for all students in a particular exam and subject.',
    recipient: [
      {
        name: 'Principal',
        message:
          '[Teacher Name] has completed mark entry for [Subject Name] ([Class Name] – [Division Name]).',
        communicationChannel: ['In-App'],
        placeHolder: ['[Teacher Name]', '[Subject Name]', '[Class Name]', '[Division Name]'],
        placeHolderOptions: [
          { value: '[Teacher Name]', label: 'Teacher Name' },
          { value: '[Subject Name]', label: 'Subject Name' },
          { value: '[Class Name]', label: 'Class Name' },
          { value: '[Division Name]', label: 'Division Name' },
        ],
        isEnable: true,
      },
      {
        name: 'Admin',
        message:
          'All marks entered for [Subject Name] in [Class Name] ([Division Name]) by [Teacher Name].',
        communicationChannel: ['In-App'],
        placeHolder: ['[Subject Name]', '[Class Name]', '[Division Name]', '[Teacher Name]'],
        placeHolderOptions: [
          { value: '[Subject Name]', label: 'Subject Name' },
          { value: '[Class Name]', label: 'Class Name' },
          { value: '[Division Name]', label: 'Division Name' },
          { value: '[Teacher Name]', label: 'Teacher Name' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '22',
    event: 'Marks submitted for approval (optional)',
    triggerCondition:
      'When the teacher submits all entered marks for review or verification (before publishing).',
    recipient: [
      {
        name: 'Principal',
        message:
          'Marks for [Subject Name] ([Class Name] – [Division Name]) have been submitted by [Teacher Name] for approval.',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Subject Name]', '[Class Name]', '[Division Name]', '[Teacher Name]'],
        placeHolderOptions: [
          { value: '[Subject Name]', label: 'Subject Name' },
          { value: '[Class Name]', label: 'Class Name' },
          { value: '[Division Name]', label: 'Division Name' },
          { value: '[Teacher Name]', label: 'Teacher Name' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '23',
    event: 'Marks approved by Principal',
    triggerCondition: 'When the principal reviews and approves marks for a division/subject.',
    recipient: [
      {
        name: 'Teacher',
        message:
          'Marks for [Subject Name] ([Class Name] – [Division Name]) have been approved by the Principal.',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Subject Name]', '[Class Name]', '[Division Name]'],
        placeHolderOptions: [
          { value: '[Subject Name]', label: 'Subject Name' },
          { value: '[Class Name]', label: 'Class Name' },
          { value: '[Division Name]', label: 'Division Name' },
        ],
        isEnable: true,
      },
      {
        name: 'Admin',
        message:
          'Principal has approved marks for [Subject Name] ([Class Name] – [Division Name]).',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Subject Name]', '[Class Name]', '[Division Name]'],
        placeHolderOptions: [
          { value: '[Subject Name]', label: 'Subject Name' },
          { value: '[Class Name]', label: 'Class Name' },
          { value: '[Division Name]', label: 'Division Name' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '24',
    event: 'Marks rejected by Principal',
    triggerCondition: 'When the principal rejects submitted marks and requests corrections.',
    recipient: [
      {
        name: 'Teacher',
        message:
          'Marks for [Subject Name] ([Class Name] – [Division Name]) were rejected by the Principal. Please make corrections and resubmit.',
        communicationChannel: ['In-App'],
        placeHolder: ['[Subject Name]', '[Class Name]', '[Division Name]'],
        placeHolderOptions: [
          { value: '[Subject Name]', label: 'Subject Name' },
          { value: '[Class Name]', label: 'Class Name' },
          { value: '[Division Name]', label: 'Division Name' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '25',
    event: 'Marks published by Teacher',
    triggerCondition: 'When the teacher publishes final marks for students (visible to students).',
    recipient: [
      {
        name: 'Student',
        message:
          'Marks for [Subject Name] are published for [Exam Name]. You can now view your results.',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Subject Name]', '[Exam Name]'],
        placeHolderOptions: [
          { value: '[Subject Name]', label: 'Subject Name' },
          { value: '[Exam Name]', label: 'Exam Name' },
        ],
        isEnable: true,
      },
      {
        name: 'Admin',
        message: '[Teacher Name] has published marks for [Subject Name] ([Class Name]).',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Teacher Name]', '[Subject Name]', '[Class Name]'],
        placeHolderOptions: [
          { value: '[Teacher Name]', label: 'Teacher Name' },
          { value: '[Subject Name]', label: 'Subject Name' },
          { value: '[Class Name]', label: 'Class Name' },
        ],
        isEnable: true,
      },
      {
        name: 'Principal',
        message: 'Marks published for [Subject Name] ([Class Name]) by [Teacher Name].',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Subject Name]', '[Class Name]', '[Teacher Name]'],
        placeHolderOptions: [
          { value: '[Subject Name]', label: 'Subject Name' },
          { value: '[Class Name]', label: 'Class Name' },
          { value: '[Teacher Name]', label: 'Teacher Name' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '26',
    event: 'Marks corrected after publish',
    triggerCondition:
      'When marks are updated after publication (post-correction or re-evaluation).',
    recipient: [
      {
        name: 'Student',
        message: 'Your marks for [Subject Name] have been updated after re-evaluation.',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Subject Name]'],
        placeHolderOptions: [{ value: '[Subject Name]', label: 'Subject Name' }],
        isEnable: true,
      },
    ],
  },
  {
    id: '27',
    event: 'Mark entry reminder (optional)',
    triggerCondition:
      'Automated reminder for teachers who haven’t entered marks before a deadline.',
    recipient: [
      {
        name: 'Teacher',
        message:
          'Reminder: Please enter marks for [Subject Name] ([Class Name] – [Division Name]) before the deadline.',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Subject Name]', '[Class Name]', '[Division Name]'],
        placeHolderOptions: [
          { value: '[Subject Name]', label: 'Subject Name' },
          { value: '[Class Name]', label: 'Class Name' },
          { value: '[Division Name]', label: 'Division Name' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '28',
    event: 'Mark entry overdue',
    triggerCondition: 'When the mark entry deadline passes without submission/publishing.',
    recipient: [
      {
        name: 'Teacher',
        message:
          'Mark entry for [Subject Name] ([Class Name]) is overdue. Please complete it immediately.',
        communicationChannel: ['In-App'],
        placeHolder: ['[Subject Name]', '[Class Name]'],
        placeHolderOptions: [
          { value: '[Subject Name]', label: 'Subject Name' },
          { value: '[Class Name]', label: 'Class Name' },
        ],
        isEnable: true,
      },
      {
        name: 'Admin',
        message:
          'Mark entry for [Subject Name] ([Class Name]) has not been completed by [Teacher Name].',
        communicationChannel: ['In-App'],
        placeHolder: ['[Subject Name]', '[Class Name]', '[Teacher Name]'],
        placeHolderOptions: [
          { value: '[Subject Name]', label: 'Subject Name' },
          { value: '[Class Name]', label: 'Class Name' },
          { value: '[Teacher Name]', label: 'Teacher Name' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '29',
    event: 'Marks verification completed',
    triggerCondition: 'When the admin or principal verifies and locks the marks.',
    recipient: [
      {
        name: 'Teacher',
        message: 'Marks for [Subject Name] ([Class Name]) have been verified and locked.',
        communicationChannel: ['In-App'],
        placeHolder: ['[Subject Name]', '[Class Name]'],
        placeHolderOptions: [
          { value: '[Subject Name]', label: 'Subject Name' },
          { value: '[Class Name]', label: 'Class Name' },
        ],
        isEnable: true,
      },
      {
        name: 'Admin',
        message: 'Marks verification completed for [Subject Name] ([Class Name]).',
        communicationChannel: ['In-App'],
        placeHolder: ['[Subject Name]', '[Class Name]'],
        placeHolderOptions: [
          { value: '[Subject Name]', label: 'Subject Name' },
          { value: '[Class Name]', label: 'Class Name' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '30',
    event: 'Result summary generated',
    triggerCondition: 'When total marks, grades, and averages are compiled per division.',
    recipient: [
      {
        name: 'Principal',
        message: 'Result summary for [Exam Name] has been generated successfully.',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Exam Name]'],
        placeHolderOptions: [{ value: '[Exam Name]', label: 'Exam Name' }],
        isEnable: true,
      },
      {
        name: 'Admin',
        message: 'Exam result summary for [Exam Name] ([Class Name]) is now ready.',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Exam Name]', '[Class Name]'],
        placeHolderOptions: [
          { value: '[Exam Name]', label: 'Exam Name' },
          { value: '[Class Name]', label: 'Class Name' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '31',
    event: 'Result published to students',
    triggerCondition: 'When final marks (subject-wise) become visible to students.',
    recipient: [
      {
        name: 'Student',
        message: 'Final result for [Exam Name] is now available. View your marks in the portal.',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Exam Name]'],
        placeHolderOptions: [{ value: '[Exam Name]', label: 'Exam Name' }],
        isEnable: true,
      },
    ],
  },
  {
    id: '32',
    event: 'Result sheet available for download (optional)',
    triggerCondition: 'When a downloadable result sheet or PDF is generated.',
    recipient: [
      {
        name: 'Student',
        message: 'Your result sheet for [Exam Name] is now available for download.',
        communicationChannel: ['In-App'],
        placeHolder: ['[Exam Name]'],
        placeHolderOptions: [{ value: '[Exam Name]', label: 'Exam Name' }],
        isEnable: true,
      },
      {
        name: 'Teacher',
        message: 'Result sheets for [Exam Name] ([Class Name]) are ready for download.',
        communicationChannel: ['In-App'],
        placeHolder: ['[Exam Name]', '[Class Name]'],
        placeHolderOptions: [
          { value: '[Exam Name]', label: 'Exam Name' },
          { value: '[Class Name]', label: 'Class Name' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '33',
    event: 'Low performance alert (optional)',
    triggerCondition: 'When a student scores below a defined threshold.',
    recipient: [
      {
        name: 'Student',
        message:
          'Your score in [Subject Name] for [Exam Name] is below the expected threshold. Please review your performance.',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Subject Name]', '[Exam Name]'],
        placeHolderOptions: [
          { value: '[Subject Name]', label: 'Subject Name' },
          { value: '[Exam Name]', label: 'Exam Name' },
        ],
        isEnable: true,
      },
      {
        name: 'Teacher',
        message: 'Student [Student Name] scored below threshold in [Subject Name] ([Class Name]).',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Student Name]', '[Subject Name]', '[Class Name]'],
        placeHolderOptions: [
          { value: '[Student Name]', label: 'Student Name' },
          { value: '[Subject Name]', label: 'Subject Name' },
          { value: '[Class Name]', label: 'Class Name' },
        ],
        isEnable: true,
      },
      {
        name: 'Parent',
        message:
          'Your ward [Student Name] has scored below average in [Subject Name] ([Exam Name]).',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Student Name]', '[Subject Name]', '[Exam Name]'],
        placeHolderOptions: [
          { value: '[Student Name]', label: 'Student Name' },
          { value: '[Subject Name]', label: 'Subject Name' },
          { value: '[Exam Name]', label: 'Exam Name' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '34',
    event: 'Quiz published',
    triggerCondition: 'When the quiz is officially published (visible to students).',
    recipient: [
      {
        name: 'Student',
        message:
          'A new quiz [Quiz Title] has been published. You can now access it under [Subject Name].',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Quiz Title]', '[Subject Name]'],
        placeHolderOptions: [
          { value: '[Quiz Title]', label: 'Quiz Title' },
          { value: '[Subject Name]', label: 'Subject Name' },
        ],
        isEnable: true,
      },
      {
        name: 'Principal',
        message: '[Quiz Title] has been published for [Subject Name].',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Quiz Title]', '[Subject Name]'],
        placeHolderOptions: [
          { value: '[Quiz Title]', label: 'Quiz Title' },
          { value: '[Subject Name]', label: 'Subject Name' },
        ],
        isEnable: true,
      },
      {
        name: 'Admin',
        message: 'Quiz [Quiz Title] for [Subject Name] is now live and visible to students.',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Quiz Title]', '[Subject Name]'],
        placeHolderOptions: [
          { value: '[Quiz Title]', label: 'Quiz Title' },
          { value: '[Subject Name]', label: 'Subject Name' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '35',
    event: 'Quiz updated',
    triggerCondition:
      'When quiz details (title, timing, duration) are modified before the start time.',
    recipient: [
      {
        name: 'Student',
        message:
          'The quiz [Quiz Title] schedule has been updated. Check new time: [Start Time] – [End Time].',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Quiz Title]', '[Start Time]', '[End Time]'],
        placeHolderOptions: [
          { value: '[Quiz Title]', label: 'Quiz Title' },
          { value: '[Start Time]', label: 'Start Time' },
          { value: '[End Time]', label: 'End Time' },
        ],
        isEnable: true,
      },
      {
        name: 'Teacher',
        message: 'Quiz [Quiz Title] details were updated — timing: [Start Time] to [End Time].',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Quiz Title]', '[Start Time]', '[End Time]'],
        placeHolderOptions: [
          { value: '[Quiz Title]', label: 'Quiz Title' },
          { value: '[Start Time]', label: 'Start Time' },
          { value: '[End Time]', label: 'End Time' },
        ],
        isEnable: true,
      },
      {
        name: 'Admin',
        message:
          'Quiz schedule updated for [Quiz Title] ([Subject Name]) — new timing: [Start Time] to [End Time].',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Quiz Title]', '[Subject Name]', '[Start Time]', '[End Time]'],
        placeHolderOptions: [
          { value: '[Quiz Title]', label: 'Quiz Title' },
          { value: '[Subject Name]', label: 'Subject Name' },
          { value: '[Start Time]', label: 'Start Time' },
          { value: '[End Time]', label: 'End Time' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '36',
    event: 'Quiz started (active window opened)',
    triggerCondition:
      'When the quiz start date and time arrive (quiz becomes available for students).',
    recipient: [
      {
        name: 'Student',
        message: 'Quiz [Quiz Title] for [Subject Name] is now live. Attempt it before [End Time].',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Quiz Title]', '[Subject Name]', '[End Time]'],
        placeHolderOptions: [
          { value: '[Quiz Title]', label: 'Quiz Title' },
          { value: '[Subject Name]', label: 'Subject Name' },
          { value: '[End Time]', label: 'End Time' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '37',
    event: 'Quiz reminder (before start)',
    triggerCondition: 'Automatically sent 1 hour (or customizable time) before quiz start time.',
    recipient: [
      {
        name: 'Student',
        message:
          'Reminder: Quiz [Quiz Title] starts at [Start Time]. Be ready to attempt it on time.',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Quiz Title]', '[Start Time]'],
        placeHolderOptions: [
          { value: '[Quiz Title]', label: 'Quiz Title' },
          { value: '[Start Time]', label: 'Start Time' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '38',
    event: 'Quiz ongoing reminder',
    triggerCondition:
      'Sent while the quiz is open (e.g., 10 minutes remaining before closing time).',
    recipient: [
      {
        name: 'Student',
        message: 'Reminder: Only [Time Remaining] minutes left to complete your quiz [Quiz Title].',
        communicationChannel: ['In-App'],
        placeHolder: ['[Time Remaining]', '[Quiz Title]'],
        placeHolderOptions: [
          { value: '[Time Remaining]', label: 'Time Remaining' },
          { value: '[Quiz Title]', label: 'Quiz Title' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '39',
    event: 'Quiz attempt submitted',
    triggerCondition: 'When a student completes and submits their quiz.',
    recipient: [
      {
        name: 'Teacher',
        message: '[Student Name] has submitted the quiz [Quiz Title] for [Subject Name].',
        communicationChannel: ['In-App'],
        placeHolder: ['[Student Name]', '[Quiz Title]', '[Subject Name]'],
        placeHolderOptions: [
          { value: '[Student Name]', label: 'Student Name' },
          { value: '[Quiz Title]', label: 'Quiz Title' },
          { value: '[Subject Name]', label: 'Subject Name' },
        ],
        isEnable: true,
      },
      {
        name: 'Admin',
        message: 'Quiz [Quiz Title] submitted by [Student Name] ([Class Name]).',
        communicationChannel: ['In-App'],
        placeHolder: ['[Quiz Title]', '[Student Name]', '[Class Name]'],
        placeHolderOptions: [
          { value: '[Quiz Title]', label: 'Quiz Title' },
          { value: '[Student Name]', label: 'Student Name' },
          { value: '[Class Name]', label: 'Class Name' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '40',
    event: 'Quiz re-attempt submitted',
    triggerCondition: 'When a student re-attempts the quiz within the allowed window.',
    recipient: [
      {
        name: 'Teacher',
        message: '[Student Name] has submitted a re-attempt for quiz [Quiz Title].',
        communicationChannel: ['In-App'],
        placeHolder: ['[Student Name]', '[Quiz Title]'],
        placeHolderOptions: [
          { value: '[Student Name]', label: 'Student Name' },
          { value: '[Quiz Title]', label: 'Quiz Title' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '41',
    event: 'Quiz window closed',
    triggerCondition: 'When the quiz end time is reached, and it becomes inactive.',
    recipient: [
      {
        name: 'Teacher',
        message: 'Quiz [Quiz Title] has ended for [Class Name]. Review the submissions.',
        communicationChannel: ['In-App'],
        placeHolder: ['[Quiz Title]', '[Class Name]'],
        placeHolderOptions: [
          { value: '[Quiz Title]', label: 'Quiz Title' },
          { value: '[Class Name]', label: 'Class Name' },
        ],
        isEnable: true,
      },
      {
        name: 'Student',
        message: 'Quiz [Quiz Title] has closed. You can no longer submit responses.',
        communicationChannel: ['In-App'],
        placeHolder: ['[Quiz Title]'],
        placeHolderOptions: [{ value: '[Quiz Title]', label: 'Quiz Title' }],
        isEnable: true,
      },
      {
        name: 'Admin',
        message: 'Quiz [Quiz Title] window closed for all classes.',
        communicationChannel: ['In-App'],
        placeHolder: ['[Quiz Title]'],
        placeHolderOptions: [{ value: '[Quiz Title]', label: 'Quiz Title' }],
        isEnable: true,
      },
    ],
  },
  {
    id: '42',
    event: 'Quiz results published (optional)',
    triggerCondition: 'When the teacher publishes results or marks for the quiz.',
    recipient: [
      {
        name: 'Student',
        message: 'Results for quiz [Quiz Title] are now available. Check your score in the portal.',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Quiz Title]'],
        placeHolderOptions: [{ value: '[Quiz Title]', label: 'Quiz Title' }],
        isEnable: true,
      },
    ],
  },
  {
    id: '43',
    event: 'Low performance alert (optional)',
    triggerCondition: 'When a student scores below a set threshold.',
    recipient: [
      {
        name: 'Student',
        message: 'Your score in [Quiz Title] is below the passing threshold. Review your answers.',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Quiz Title]'],
        placeHolderOptions: [{ value: '[Quiz Title]', label: 'Quiz Title' }],
        isEnable: true,
      },
      {
        name: 'Teacher',
        message: 'Student [Student Name] scored below threshold in [Quiz Title].',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Student Name]', '[Quiz Title]'],
        placeHolderOptions: [
          { value: '[Student Name]', label: 'Student Name' },
          { value: '[Quiz Title]', label: 'Quiz Title' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '44',
    event: 'Quiz completion summary generated',
    triggerCondition: 'When all attempts are completed, and results are finalized.',
    recipient: [
      {
        name: 'Principal',
        message: 'Quiz completion summary for [Quiz Title] has been generated.',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Quiz Title]'],
        placeHolderOptions: [{ value: '[Quiz Title]', label: 'Quiz Title' }],
        isEnable: true,
      },
      {
        name: 'Admin',
        message: 'All quiz attempts for [Quiz Title] are finalized. Summary is now available.',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Quiz Title]'],
        placeHolderOptions: [{ value: '[Quiz Title]', label: 'Quiz Title' }],
        isEnable: true,
      },
    ],
  },
  {
    id: '45',
    event: 'Quiz published',
    triggerCondition: 'When the quiz is officially published (visible to students).',
    recipient: [
      {
        name: 'Student',
        message:
          'A new quiz [Quiz Title] has been published. You can now access it under [Subject Name].',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Quiz Title]', '[Subject Name]'],
        placeHolderOptions: [
          { value: '[Quiz Title]', label: 'Quiz Title' },
          { value: '[Subject Name]', label: 'Subject Name' },
        ],
        isEnable: true,
      },
      {
        name: 'Principal',
        message: '[Quiz Title] has been published for [Subject Name].',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Quiz Title]', '[Subject Name]'],
        placeHolderOptions: [
          { value: '[Quiz Title]', label: 'Quiz Title' },
          { value: '[Subject Name]', label: 'Subject Name' },
        ],
        isEnable: true,
      },
      {
        name: 'Admin',
        message: 'Quiz [Quiz Title] for [Subject Name] is now live and visible to students.',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Quiz Title]', '[Subject Name]'],
        placeHolderOptions: [
          { value: '[Quiz Title]', label: 'Quiz Title' },
          { value: '[Subject Name]', label: 'Subject Name' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '46',
    event: 'Quiz updated',
    triggerCondition:
      'When quiz details (title, timing, duration) are modified before the start time.',
    recipient: [
      {
        name: 'Student',
        message:
          'The quiz [Quiz Title] schedule has been updated. Check new time: [Start Time] – [End Time].',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Quiz Title]', '[Start Time]', '[End Time]'],
        placeHolderOptions: [
          { value: '[Quiz Title]', label: 'Quiz Title' },
          { value: '[Start Time]', label: 'Start Time' },
          { value: '[End Time]', label: 'End Time' },
        ],
        isEnable: true,
      },
      {
        name: 'Teacher',
        message: 'Quiz [Quiz Title] details were updated — timing: [Start Time] to [End Time].',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Quiz Title]', '[Start Time]', '[End Time]'],
        placeHolderOptions: [
          { value: '[Quiz Title]', label: 'Quiz Title' },
          { value: '[Start Time]', label: 'Start Time' },
          { value: '[End Time]', label: 'End Time' },
        ],
        isEnable: true,
      },
      {
        name: 'Admin',
        message:
          'Quiz schedule updated for [Quiz Title] ([Subject Name]) — new timing: [Start Time] to [End Time].',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Quiz Title]', '[Subject Name]', '[Start Time]', '[End Time]'],
        placeHolderOptions: [
          { value: '[Quiz Title]', label: 'Quiz Title' },
          { value: '[Subject Name]', label: 'Subject Name' },
          { value: '[Start Time]', label: 'Start Time' },
          { value: '[End Time]', label: 'End Time' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '47',
    event: 'Quiz started (active window opened)',
    triggerCondition:
      'When the quiz start date and time arrive (quiz becomes available for students).',
    recipient: [
      {
        name: 'Student',
        message: 'Quiz [Quiz Title] for [Subject Name] is now live. Attempt it before [End Time].',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Quiz Title]', '[Subject Name]', '[End Time]'],
        placeHolderOptions: [
          { value: '[Quiz Title]', label: 'Quiz Title' },
          { value: '[Subject Name]', label: 'Subject Name' },
          { value: '[End Time]', label: 'End Time' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '48',
    event: 'Quiz reminder (before start)',
    triggerCondition: 'Automatically sent 1 hour (or customizable time) before quiz start time.',
    recipient: [
      {
        name: 'Student',
        message:
          'Reminder: Quiz [Quiz Title] starts at [Start Time]. Be ready to attempt it on time.',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Quiz Title]', '[Start Time]'],
        placeHolderOptions: [
          { value: '[Quiz Title]', label: 'Quiz Title' },
          { value: '[Start Time]', label: 'Start Time' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '49',
    event: 'Quiz ongoing reminder',
    triggerCondition:
      'Sent while the quiz is open (e.g., 10 minutes remaining before closing time).',
    recipient: [
      {
        name: 'Student',
        message: 'Reminder: Only [Time Remaining] minutes left to complete your quiz [Quiz Title].',
        communicationChannel: ['In-App'],
        placeHolder: ['[Time Remaining]', '[Quiz Title]'],
        placeHolderOptions: [
          { value: '[Time Remaining]', label: 'Time Remaining' },
          { value: '[Quiz Title]', label: 'Quiz Title' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '50',
    event: 'Quiz attempt submitted',
    triggerCondition: 'When a student completes and submits their quiz.',
    recipient: [
      {
        name: 'Teacher',
        message: '[Student Name] has submitted the quiz [Quiz Title] for [Subject Name].',
        communicationChannel: ['In-App'],
        placeHolder: ['[Student Name]', '[Quiz Title]', '[Subject Name]'],
        placeHolderOptions: [
          { value: '[Student Name]', label: 'Student Name' },
          { value: '[Quiz Title]', label: 'Quiz Title' },
          { value: '[Subject Name]', label: 'Subject Name' },
        ],
        isEnable: true,
      },
      {
        name: 'Admin',
        message: 'Quiz [Quiz Title] submitted by [Student Name] ([Class Name]).',
        communicationChannel: ['In-App'],
        placeHolder: ['[Quiz Title]', '[Student Name]', '[Class Name]'],
        placeHolderOptions: [
          { value: '[Quiz Title]', label: 'Quiz Title' },
          { value: '[Student Name]', label: 'Student Name' },
          { value: '[Class Name]', label: 'Class Name' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '51',
    event: 'Quiz re-attempt submitted',
    triggerCondition: 'When a student re-attempts the quiz within the allowed window.',
    recipient: [
      {
        name: 'Teacher',
        message: '[Student Name] has submitted a re-attempt for quiz [Quiz Title].',
        communicationChannel: ['In-App'],
        placeHolder: ['[Student Name]', '[Quiz Title]'],
        placeHolderOptions: [
          { value: '[Student Name]', label: 'Student Name' },
          { value: '[Quiz Title]', label: 'Quiz Title' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '52',
    event: 'Quiz window closed',
    triggerCondition: 'When the quiz end time is reached, and it becomes inactive.',
    recipient: [
      {
        name: 'Teacher',
        message: 'Quiz [Quiz Title] has ended for [Class Name]. Review the submissions.',
        communicationChannel: ['In-App'],
        placeHolder: ['[Quiz Title]', '[Class Name]'],
        placeHolderOptions: [
          { value: '[Quiz Title]', label: 'Quiz Title' },
          { value: '[Class Name]', label: 'Class Name' },
        ],
        isEnable: true,
      },
      {
        name: 'Student',
        message: 'Quiz [Quiz Title] has closed. You can no longer submit responses.',
        communicationChannel: ['In-App'],
        placeHolder: ['[Quiz Title]'],
        placeHolderOptions: [{ value: '[Quiz Title]', label: 'Quiz Title' }],
        isEnable: true,
      },
      {
        name: 'Admin',
        message: 'Quiz [Quiz Title] window closed for all classes.',
        communicationChannel: ['In-App'],
        placeHolder: ['[Quiz Title]'],
        placeHolderOptions: [{ value: '[Quiz Title]', label: 'Quiz Title' }],
        isEnable: true,
      },
    ],
  },
  {
    id: '53',
    event: 'Quiz results published (optional)',
    triggerCondition: 'When the teacher publishes results or marks for the quiz.',
    recipient: [
      {
        name: 'Student',
        message: 'Results for quiz [Quiz Title] are now available. Check your score in the portal.',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Quiz Title]'],
        placeHolderOptions: [{ value: '[Quiz Title]', label: 'Quiz Title' }],
        isEnable: true,
      },
    ],
  },
  {
    id: '54',
    event: 'Low performance alert (optional)',
    triggerCondition: 'When a student scores below a set threshold.',
    recipient: [
      {
        name: 'Student',
        message: 'Your score in [Quiz Title] is below the passing threshold. Review your answers.',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Quiz Title]'],
        placeHolderOptions: [{ value: '[Quiz Title]', label: 'Quiz Title' }],
        isEnable: true,
      },
      {
        name: 'Teacher',
        message: 'Student [Student Name] scored below threshold in [Quiz Title].',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Student Name]', '[Quiz Title]'],
        placeHolderOptions: [
          { value: '[Student Name]', label: 'Student Name' },
          { value: '[Quiz Title]', label: 'Quiz Title' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '55',
    event: 'Quiz completion summary generated',
    triggerCondition: 'When all attempts are completed, and results are finalized.',
    recipient: [
      {
        name: 'Principal',
        message: 'Quiz completion summary for [Quiz Title] has been generated.',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Quiz Title]'],
        placeHolderOptions: [{ value: '[Quiz Title]', label: 'Quiz Title' }],
        isEnable: true,
      },
      {
        name: 'Admin',
        message: 'All quiz attempts for [Quiz Title] are finalized. Summary is now available.',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Quiz Title]'],
        placeHolderOptions: [{ value: '[Quiz Title]', label: 'Quiz Title' }],
        isEnable: true,
      },
    ],
  },
];

const ExaminationNotificationManagement = ({ dialog, setIsViewMode }: any) => {
  // Holds the currently selected notification row data for editing/viewing
  const [selectedData, setSelectedData] = useState<any>(null);
  // Determines whether the dialog is opened in view-only mode
  const [view, setView] = useState(false);

  return (
    <Box sx={{ height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      {dialog.value ? (
        <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
          <EditNotificationDialog
            data={selectedData}
            onClose={() => {
              dialog.onFalse();
              setSelectedData(null);
            }}
            isFromView={view}
          />
        </Card>
      ) : (
        <CustomizableTable
          tableTitle="Examination Notifications"
          wrapperProps={{ sx: { height: 1, minHeight: 0 } }}
          tableContainerProps={{ sx: { height: 1 } }}
          tableId="timetable-auto-notification-configuration"
          data={examinationNotificationsData}
          columns={[
            {
              id: 'event',
              label: 'Event',
            },
            {
              id: 'triggerCondition',
              label: 'Trigger Condition',
            },
            {
              id: 'recipient',
              label: 'Recipient',
              render(value, row) {
                return row.recipient.map((recipient: any) => (
                  <Box key={recipient.name}>{recipient.name.toUpperCase()}</Box>
                ));
              },
            },
            {
              id: 'isActive',
              label: 'Active',
              filterType: 'enum',
              isSort: false,
              enumOptions: NotificationStatusOptions,
              render(value, row) {
                return (
                  <Switch
                    slotProps={{ input: { 'aria-label': `Enable ${row.event} notification` } }}
                    checked={NotificationStatusType.Active === row.isActive}
                    disabled
                  />
                );
              },
            },
            {
              id: 'action',
              label: 'Action',
              isFilter: false,
              isSort: false,
              sticky: true,
              minWidth: 60,
              render(value, row) {
                return (
                  <ThreeDotsActions
                    editLabel={`Edit ${row.event} notification`}
                    viewLabel={`View ${row.event} notification`}
                    showThreeDots={false}
                    showEditIcon={false}
                    showViewIcon
                    handleViewClick={() => {
                      setSelectedData(row);
                      setView(true);
                      dialog.onTrue();
                      setIsViewMode(true);
                    }}
                  />
                );
              },
            },
          ]}
        />
      )}
    </Box>
  );
};
export default ExaminationNotificationManagement;
