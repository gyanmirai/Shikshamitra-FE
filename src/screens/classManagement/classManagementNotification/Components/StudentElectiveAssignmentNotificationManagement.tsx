'use client';

import React, { useState } from 'react';
import { Box, Card, Switch } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import EditNotificationDialog from 'src/screens/student/studentNotification/edit-notification-dialog';
import {
  NotificationStatusType,
  NotificationStatusOptions,
} from 'src/enums/notification-status-type';

// =================== Notification Data ===================
export const studentElectiveNotificationsData = [
  {
    id: '6',
    event: 'Elective assigned manually by Admin/Teacher',
    triggerCondition:
      'When an elective is directly assigned to a student (without their choice). After elective submission.',
    recipient: [
      {
        name: 'Student',
        message:
          'You have been assigned the elective [Elective Subject Name] by your teacher/admin.',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Elective Subject Name]'],
        placeHolderOptions: [{ value: '[Elective Subject Name]', label: 'Elective Subject Name' }],
        isEnable: true,
      },
    ],
  },
  {
    id: '7',
    event: 'Elective reassigned/changed',
    triggerCondition:
      'When an admin or teacher modifies a student’s elective subject after assignment.',
    recipient: [
      {
        name: 'Student',
        message:
          'Your elective has been changed to [Elective Subject Name]. Please review your updated assignment.',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Elective Subject Name]'],
        placeHolderOptions: [{ value: '[Elective Subject Name]', label: 'Elective Subject Name' }],
        isEnable: true,
      },
      {
        name: 'Class Teacher',
        message:
          'Elective reassignment completed for student [Student Name] — new elective: [Elective Subject Name].',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Student Name]', '[Elective Subject Name]'],
        placeHolderOptions: [
          { value: '[Student Name]', label: 'Student Name' },
          { value: '[Elective Subject Name]', label: 'Elective Subject Name' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '8',
    event: 'Elective assignment confirmed',
    triggerCondition: 'When the elective subject assignment process is finalized and locked.',
    recipient: [
      {
        name: 'Student',
        message:
          'Your elective subject [Elective Subject Name] has been confirmed. Changes can no longer be made.',
        communicationChannel: ['In-App'],
        placeHolder: ['[Elective Subject Name]'],
        placeHolderOptions: [{ value: '[Elective Subject Name]', label: 'Elective Subject Name' }],
        isEnable: true,
      },
      {
        name: 'Class Teacher',
        message: 'Elective assignment finalized for all students in [Class Name].',
        communicationChannel: ['In-App'],
        placeHolder: ['[Class Name]'],
        placeHolderOptions: [{ value: '[Class Name]', label: 'Class Name' }],
        isEnable: true,
      },
      {
        name: 'Admin',
        message:
          'Elective subject assignment has been successfully locked and confirmed for all divisions.',
        communicationChannel: ['In-App'],
        placeHolder: [],
        placeHolderOptions: [],
        isEnable: true,
      },
    ],
  },
];

// =================== Component ===================
const StudentElectiveAssignmentNotificationManagement = ({ dialog, setIsViewMode }: any) => {
  const [selectedData, setSelectedData] = useState<any>(null);
  const [view, setView] = useState(false);

  return (
    // <Box sx={{ height: '100%' }}>
    <>
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
          tableId="student-elective-notification-configuration"
          data={studentElectiveNotificationsData}
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
                return row.recipient.map((r: any) => (
                  <Box key={r.name}>{r.name.toUpperCase()}</Box>
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
                      console.log('Toggle active status:', event.target.checked);
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
              align: 'left',
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
                      setIsViewMode(false);
                    }}
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
    </>
    // </Box>
  );
};

export default StudentElectiveAssignmentNotificationManagement;
