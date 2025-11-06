import React, { useState } from 'react';
import { Box, Card, Switch } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import EditNotificationDialog from 'src/screens/student/studentNotification/edit-notification-dialog';
import {
  NotificationStatusType,
  NotificationStatusOptions,
} from 'src/enums/notification-status-type';

export const timetableNotificationsData = [
  {
    id: '1',
    event: 'New timetable created (Draft)',
    triggerCondition: 'When a new timetable is created and saved as Draft for a specific class.',
    recipient: [
      {
        name: 'Admin',
        message: 'A new timetable for [Class Name] has been created and saved as a draft.',
        communicationChannel: ['In-App'],
        placeHolder: ['[Class Name]'],
        placeHolderOptions: [{ value: '[Class Name]', label: 'Class Name' }],
        isEnable: true,
      },
      {
        name: 'Principal',
        message:
          'A draft timetable has been created for [Class Name]. Please review before publishing.',
        communicationChannel: ['In-App'],
        placeHolder: ['[Class Name]'],
        placeHolderOptions: [{ value: '[Class Name]', label: 'Class Name' }],
        isEnable: true,
      },
    ],
  },
  {
    id: '2',
    event: 'Timetable published',
    triggerCondition: 'When the timetable status changes from Draft → Published.',
    recipient: [
      {
        name: 'Principal',
        message: 'The timetable for [Class Name] has been published successfully.',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Class Name]'],
        placeHolderOptions: [{ value: '[Class Name]', label: 'Class Name' }],
        isEnable: true,
      },
      {
        name: 'Teacher',
        message: 'The timetable for [Class Name] is now published. Please check your schedule.',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Class Name]'],
        placeHolderOptions: [{ value: '[Class Name]', label: 'Class Name' }],
        isEnable: true,
      },
      {
        name: 'Admin',
        message: 'The timetable for [Class Name] has been published by [Principal Name].',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Class Name]', '[Principal Name]'],
        placeHolderOptions: [
          { value: '[Class Name]', label: 'Class Name' },
          { value: '[Principal Name]', label: 'Principal Name' },
        ],
        isEnable: true,
      },
    ],
  },
  //   {
  //     id: '3',
  //     event: 'Timetable unpublished',
  //     triggerCondition: 'When the timetable status changes from Published → Unpublished.',
  //     recipient: [
  //       {
  //         name: 'Admin',
  //         message: 'The timetable for [Class Name] has been unpublished.',
  //         communicationChannel: ['In-App', 'Email'],
  //         placeHolder: ['[Class Name]'],
  //         placeHolderOptions: [{ value: '[Class Name]', label: 'Class Name' }],
  //         isEnable: true,
  //       },
  //       {
  //         name: 'Assigned Teachers',
  //         message: 'The timetable for [Class Name] has been unpublished temporarily.',
  //         communicationChannel: ['In-App', 'Email'],
  //         placeHolder: ['[Class Name]'],
  //         placeHolderOptions: [{ value: '[Class Name]', label: 'Class Name' }],
  //         isEnable: true,
  //       },
  //       {
  //         name: 'Principal',
  //         message: 'The timetable for [Class Name] has been reverted to draft status.',
  //         communicationChannel: ['In-App', 'Email'],
  //         placeHolder: ['[Class Name]'],
  //         placeHolderOptions: [{ value: '[Class Name]', label: 'Class Name' }],
  //         isEnable: true,
  //       },
  //     ],
  //   },
  {
    id: '4',
    event: 'Teacher assigned to a period',
    triggerCondition: 'When a teacher is assigned to a specific lecture/period in the timetable.',
    recipient: [
      {
        name: 'Teacher',
        message:
          'You have been assigned to teach [Subject Name] for [Class Name] in period [Period Number].',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Subject Name]', '[Class Name]', '[Period Number]'],
        placeHolderOptions: [
          { value: '[Subject Name]', label: 'Subject Name' },
          { value: '[Class Name]', label: 'Class Name' },
          { value: '[Period Number]', label: 'Period Number' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '5',
    event: 'Teacher replaced in timetable',
    triggerCondition:
      'When a teacher assigned to a particular lecture/subject is replaced with another teacher.',
    recipient: [
      {
        name: 'Teacher',
        message: 'You have been replaced for [Subject Name] in [Class Name].',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Subject Name]', '[Class Name]'],
        placeHolderOptions: [
          { value: '[Subject Name]', label: 'Subject Name' },
          { value: '[Class Name]', label: 'Class Name' },
        ],
        isEnable: true,
      },
      {
        name: 'New Teacher',
        message:
          'You have been assigned to [Subject Name] for [Class Name], replacing [Previous Teacher Name].',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Subject Name]', '[Class Name]', '[Previous Teacher Name]'],
        placeHolderOptions: [
          { value: '[Subject Name]', label: 'Subject Name' },
          { value: '[Class Name]', label: 'Class Name' },
          { value: '[Previous Teacher Name]', label: 'Previous Teacher Name' },
        ],
        isEnable: true,
      },
      {
        name: 'Admin',
        message:
          'Teacher replacement occurred in [Class Name] for [Subject Name]. [Previous Teacher Name] replaced by [New Teacher Name].',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: [
          '[Class Name]',
          '[Subject Name]',
          '[Previous Teacher Name]',
          '[New Teacher Name]',
        ],
        placeHolderOptions: [
          { value: '[Class Name]', label: 'Class Name' },
          { value: '[Subject Name]', label: 'Subject Name' },
          { value: '[Previous Teacher Name]', label: 'Previous Teacher Name' },
          { value: '[New Teacher Name]', label: 'New Teacher Name' },
        ],
        isEnable: true,
      },
    ],
  },
  //   {
  //     id: '6',
  //     event: 'Classroom assigned to a period',
  //     triggerCondition:
  //       'When a classroom is assigned for a particular lecture slot in the timetable.',
  //     recipient: [
  //       {
  //         name: 'Assigned Teacher',
  //         message:
  //           'Room [Room Number] has been assigned for your [Subject Name] lecture in [Class Name].',
  //         communicationChannel: ['In-App'],
  //         placeHolder: ['[Room Number]', '[Subject Name]', '[Class Name]'],
  //         placeHolderOptions: [
  //           { value: '[Room Number]', label: 'Room Number' },
  //           { value: '[Subject Name]', label: 'Subject Name' },
  //           { value: '[Class Name]', label: 'Class Name' },
  //         ],
  //         isEnable: true,
  //       },
  //     ],
  //   },
  {
    id: '8',
    event: 'Timetable updated',
    triggerCondition:
      'When any change (subject, teacher, room, or time slot) is made to an existing timetable.',
    recipient: [
      {
        name: 'Principal',
        message: 'The timetable for [Class Name] has been updated. Please review the changes.',
        communicationChannel: ['In-App'],
        placeHolder: ['[Class Name]'],
        placeHolderOptions: [{ value: '[Class Name]', label: 'Class Name' }],
        isEnable: true,
      },
      {
        name: 'Teacher',
        message:
          'The timetable for [Class Name] has been updated. Please review your assigned periods.',
        communicationChannel: ['In-App'],
        placeHolder: ['[Class Name]'],
        placeHolderOptions: [{ value: '[Class Name]', label: 'Class Name' }],
        isEnable: true,
      },
      {
        name: 'Student',
        message: 'Your class timetable has been updated. Check for any subject or teacher changes.',
        communicationChannel: ['In-App'],
        placeHolder: [],
        placeHolderOptions: [],
        isEnable: true,
      },
    ],
  },
  {
    id: '17',
    event: 'Temporary substitution assigned',
    triggerCondition: 'When a temporary teacher is assigned to cover a class due to absence.',
    recipient: [
      {
        name: 'Substitute Teacher',
        message:
          'You are assigned as a substitute for [Subject Name] in [Class Name] at [Period Time].',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Subject Name]', '[Class Name]', '[Period Time]'],
        placeHolderOptions: [
          { value: '[Subject Name]', label: 'Subject Name' },
          { value: '[Class Name]', label: 'Class Name' },
          { value: '[Period Time]', label: 'Period Time' },
        ],
        isEnable: true,
      },
      {
        name: 'Principal',
        message:
          '[Substitute Teacher Name] has been assigned temporarily for [Subject Name] in [Class Name].',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Substitute Teacher Name]', '[Subject Name]', '[Class Name]'],
        placeHolderOptions: [
          { value: '[Substitute Teacher Name]', label: 'Substitute Teacher Name' },
          { value: '[Subject Name]', label: 'Subject Name' },
          { value: '[Class Name]', label: 'Class Name' },
        ],
        isEnable: true,
      },
      {
        name: 'Student',
        message: 'Your class [Subject Name] will be taken by [Substitute Teacher Name] today.',
        communicationChannel: ['In-App'],
        placeHolder: ['[Subject Name]', '[Substitute Teacher Name]'],
        placeHolderOptions: [
          { value: '[Subject Name]', label: 'Subject Name' },
          { value: '[Substitute Teacher Name]', label: 'Substitute Teacher Name' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '20',
    event: 'Daily reminders',
    triggerCondition:
      'Automatically sent each morning summarizing the day’s lectures for teachers (if enabled).',
    recipient: [
      {
        name: 'All Teachers',
        message:
          'Good morning! Here’s your schedule for today: [Date] — [Total Lectures] lectures assigned.',
        communicationChannel: ['In-App', 'Push'],
        placeHolder: ['[Date]', '[Total Lectures]'],
        placeHolderOptions: [
          { value: '[Date]', label: 'Date' },
          { value: '[Total Lectures]', label: 'Total Lectures' },
        ],
        isEnable: true,
      },
    ],
  },
];

const TimetableNotificationManagement = ({ dialog }: any) => {
  // Holds the currently selected notification row data for editing/viewing
  const [selectedData, setSelectedData] = useState<any>(null);
  // Determines whether the dialog is opened in view-only mode
  const [view, setView] = useState(false);

  return (
    <Box sx={{ height: '100%' }}>
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
          tableId="timetable-auto-notification-configuration"
          data={timetableNotificationsData}
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
                    checked={NotificationStatusType.Active === row.isActive}
                    onChange={(event) => {
                      console.log(event.target.checked);
                    }}
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
                    showThreeDots={false}
                    showEditIcon
                    handleEditClick={() => {
                      setSelectedData(row);
                      dialog.onTrue();
                      setView(false);
                    }}
                    showViewIcon
                    handleViewClick={() => {
                      setSelectedData(row);
                      setView(true);
                      dialog.onTrue();
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

export default TimetableNotificationManagement;
