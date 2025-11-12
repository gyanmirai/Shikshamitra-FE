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
export const teachersAssignmentNotificationsData = [
  {
    id: '1',
    event: 'Teacher Assigned to Subject & Division',
    triggerCondition:
      'When a teacher is newly assigned to teach a subject in a division of a class.',
    recipient: [
      {
        name: 'Teacher',
        message:
          'You have been assigned to teach [Subject Name] for [Class Name] - [Division Name].',
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
    id: '2',
    event: 'Multiple Teachers Assigned',
    triggerCondition: 'When multiple teachers are assigned in one action (bulk assignment).',
    recipient: [
      {
        name: 'Newly Assigned Teachers',
        message:
          'You have been assigned new subjects/divisions. Please check your updated schedule.',
        communicationChannel: ['In-App'],
        placeHolder: [],
        placeHolderOptions: [],
        isEnable: true,
      },
      {
        name: 'Principal',
        message:
          'Multiple teachers have been assigned to subjects/divisions. Review the assignment summary.',
        communicationChannel: ['In-App'],
        placeHolder: [],
        placeHolderOptions: [],
        isEnable: true,
      },
      {
        name: 'HOD',
        message:
          'Bulk teacher assignments completed. Please verify subject allocations for your department.',
        communicationChannel: ['In-App'],
        placeHolder: [],
        placeHolderOptions: [],
        isEnable: true,
      },
    ],
  },
  {
    id: '3',
    event: 'Teacher Unassigned / Removed',
    triggerCondition: 'When a teacher is unassigned from a subject or division.',
    recipient: [
      {
        name: 'Removed Teacher',
        message: 'You have been unassigned from [Subject Name] for [Class Name] - [Division Name].',
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
        name: 'HOD',
        message:
          'Teacher [Teacher Name] has been removed from [Subject Name] ([Class Name] - [Division Name]).',
        communicationChannel: ['In-App', 'Email'],
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
        name: 'Class Teacher',
        message: 'Teacher [Teacher Name] has been unassigned from your class for [Subject Name].',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Teacher Name]', '[Subject Name]'],
        placeHolderOptions: [
          { value: '[Teacher Name]', label: 'Teacher Name' },
          { value: '[Subject Name]', label: 'Subject Name' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '4',
    event: 'Teacher Reassigned (Replaced)',
    triggerCondition: 'When an existing teacher is replaced by another for a subject/division.',
    recipient: [
      {
        name: 'Old Teacher',
        message: 'You have been replaced for [Subject Name] ([Class Name] - [Division Name]).',
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
        name: 'New Teacher',
        message: 'You have been newly assigned to [Subject Name] ([Class Name] - [Division Name]).',
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
        name: 'HOD',
        message:
          'Teacher reassignment done for [Subject Name] ([Class Name] - [Division Name]): [Old Teacher] replaced by [New Teacher].',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: [
          '[Subject Name]',
          '[Class Name]',
          '[Division Name]',
          '[Old Teacher]',
          '[New Teacher]',
        ],
        placeHolderOptions: [
          { value: '[Subject Name]', label: 'Subject Name' },
          { value: '[Class Name]', label: 'Class Name' },
          { value: '[Division Name]', label: 'Division Name' },
          { value: '[Old Teacher]', label: 'Old Teacher' },
          { value: '[New Teacher]', label: 'New Teacher' },
        ],
        isEnable: true,
      },
      {
        name: 'Class Teacher',
        message:
          'Teacher reassignment occurred for [Subject Name] ([Class Name] - [Division Name]).',
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
    id: '9',
    event: 'Teacher Availability Conflict',
    triggerCondition: 'When a teacher is assigned to overlapping classes or timings.',
    recipient: [
      {
        name: 'Admin',
        message: 'Conflict detected: [Teacher Name] has overlapping classes at [Time Range].',
        communicationChannel: ['In-App'],
        placeHolder: ['[Teacher Name]', '[Time Range]'],
        placeHolderOptions: [
          { value: '[Teacher Name]', label: 'Teacher Name' },
          { value: '[Time Range]', label: 'Time Range' },
        ],
        isEnable: true,
      },
      {
        name: 'HOD',
        message: 'Teacher [Teacher Name] has a scheduling conflict with overlapping classes.',
        communicationChannel: ['In-App'],
        placeHolder: ['[Teacher Name]'],
        placeHolderOptions: [{ value: '[Teacher Name]', label: 'Teacher Name' }],
        isEnable: true,
      },
    ],
  },
];

// =================== Component ===================
const TeachersAssignmentNotificationManagement = ({ dialog, setIsViewMode }: any) => {
  const [selectedData, setSelectedData] = useState<any>(null);
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
          tableId="teachers-assignment-notification-configuration"
          data={teachersAssignmentNotificationsData}
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
    </Box>
  );
};

export default TeachersAssignmentNotificationManagement;
