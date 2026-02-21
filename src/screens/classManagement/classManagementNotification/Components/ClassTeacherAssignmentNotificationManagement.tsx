'use client';

import React, { useState } from 'react';
import { Box, Card, Switch } from '@mui/material';
import sortQueryString from 'src/utils/sort-query-string';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import EditNotificationDialog from 'src/screens/student/studentNotification/editNotificationDialog';
import {
  NotificationStatusType,
  NotificationStatusOptions,
} from 'src/enums/notification-status-type';

// =================== Notification Data ===================
export const classTeacherAssignmentNotificationsData = [
  {
    id: '1',
    event: 'Class Teacher Assigned',
    triggerCondition: 'When a class teacher is assigned to a specific class/division.',
    recipient: [
      {
        name: 'Teacher',
        message: 'You have been assigned as Class Teacher for [Class Name] - [Division Name].',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Class Name]', '[Division Name]'],
        placeHolderOptions: [
          { value: '[Class Name]', label: 'Class Name' },
          { value: '[Division Name]', label: 'Division Name' },
        ],
        isEnable: true,
      },
      {
        name: 'HOD',
        message:
          'Class Teacher [Teacher Name] has been assigned to [Class Name] - [Division Name].',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Teacher Name]', '[Class Name]', '[Division Name]'],
        placeHolderOptions: [
          { value: '[Teacher Name]', label: 'Teacher Name' },
          { value: '[Class Name]', label: 'Class Name' },
          { value: '[Division Name]', label: 'Division Name' },
        ],
        isEnable: true,
      },
      {
        name: 'Admin',
        message: 'New class teacher assignment created for [Class Name] - [Division Name].',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Class Name]', '[Division Name]'],
        placeHolderOptions: [
          { value: '[Class Name]', label: 'Class Name' },
          { value: '[Division Name]', label: 'Division Name' },
        ],
        isEnable: true,
      },
      {
        name: 'Principal',
        message:
          '[Teacher Name] has been assigned as Class Teacher for [Class Name] - [Division Name].',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Teacher Name]', '[Class Name]', '[Division Name]'],
        placeHolderOptions: [
          { value: '[Teacher Name]', label: 'Teacher Name' },
          { value: '[Class Name]', label: 'Class Name' },
          { value: '[Division Name]', label: 'Division Name' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '3',
    event: 'Class Teacher Unassigned / Removed',
    triggerCondition: 'When a class teacher is unassigned from a class/division.',
    recipient: [
      {
        name: 'Removed Teacher',
        message: 'You have been unassigned from [Class Name] - [Division Name] as Class Teacher.',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Class Name]', '[Division Name]'],
        placeHolderOptions: [
          { value: '[Class Name]', label: 'Class Name' },
          { value: '[Division Name]', label: 'Division Name' },
        ],
        isEnable: true,
      },
      {
        name: 'HOD',
        message:
          '[Teacher Name] has been removed as Class Teacher for [Class Name] - [Division Name].',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Teacher Name]', '[Class Name]', '[Division Name]'],
        placeHolderOptions: [
          { value: '[Teacher Name]', label: 'Teacher Name' },
          { value: '[Class Name]', label: 'Class Name' },
          { value: '[Division Name]', label: 'Division Name' },
        ],
        isEnable: true,
      },
      {
        name: 'Admin',
        message:
          'Class Teacher unassigned from [Class Name] - [Division Name]. Update logs accordingly.',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Class Name]', '[Division Name]'],
        placeHolderOptions: [
          { value: '[Class Name]', label: 'Class Name' },
          { value: '[Division Name]', label: 'Division Name' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '4',
    event: 'Class Teacher Reassigned / Replaced',
    triggerCondition: 'When a new teacher replaces an existing class teacher.',
    recipient: [
      {
        name: 'Old Teacher',
        message: 'You have been replaced as Class Teacher for [Class Name] - [Division Name].',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Class Name]', '[Division Name]'],
        placeHolderOptions: [
          { value: '[Class Name]', label: 'Class Name' },
          { value: '[Division Name]', label: 'Division Name' },
        ],
        isEnable: true,
      },
      {
        name: 'New Teacher',
        message:
          'You have been newly assigned as Class Teacher for [Class Name] - [Division Name].',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Class Name]', '[Division Name]'],
        placeHolderOptions: [
          { value: '[Class Name]', label: 'Class Name' },
          { value: '[Division Name]', label: 'Division Name' },
        ],
        isEnable: true,
      },
      {
        name: 'HOD',
        message:
          'Class Teacher reassignment: [Old Teacher] replaced by [New Teacher] for [Class Name] - [Division Name].',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Old Teacher]', '[New Teacher]', '[Class Name]', '[Division Name]'],
        placeHolderOptions: [
          { value: '[Old Teacher]', label: 'Old Teacher' },
          { value: '[New Teacher]', label: 'New Teacher' },
          { value: '[Class Name]', label: 'Class Name' },
          { value: '[Division Name]', label: 'Division Name' },
        ],
        isEnable: true,
      },
      {
        name: 'Admin',
        message:
          'Class Teacher updated for [Class Name] - [Division Name]. [Old Teacher] replaced by [New Teacher].',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Old Teacher]', '[New Teacher]', '[Class Name]', '[Division Name]'],
        placeHolderOptions: [
          { value: '[Old Teacher]', label: 'Old Teacher' },
          { value: '[New Teacher]', label: 'New Teacher' },
          { value: '[Class Name]', label: 'Class Name' },
          { value: '[Division Name]', label: 'Division Name' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '9',
    event: 'Class Teacher Assignment Locked',
    triggerCondition:
      'When class teacher assignments for an academic year are finalized and locked.',
    recipient: [
      {
        name: 'All Class Teachers',
        message: 'Class teacher assignments for the academic year have been finalized and locked.',
        communicationChannel: ['In-App'],
        placeHolder: [],
        placeHolderOptions: [],
        isEnable: true,
      },
      {
        name: 'HOD',
        message: 'All class teacher assignments are now locked for the academic year.',
        communicationChannel: ['In-App'],
        placeHolder: [],
        placeHolderOptions: [],
        isEnable: true,
      },
      {
        name: 'Admin',
        message: 'Class teacher assignment locking process completed successfully.',
        communicationChannel: ['In-App'],
        placeHolder: [],
        placeHolderOptions: [],
        isEnable: true,
      },
    ],
  },
  {
    id: '10',
    event: 'Class Teacher Assignment Unlocked',
    triggerCondition: 'When admin reopens or allows editing after locking.',
    recipient: [
      {
        name: 'HOD',
        message: 'Class teacher assignment editing has been reopened for updates.',
        communicationChannel: ['In-App'],
        placeHolder: [],
        placeHolderOptions: [],
        isEnable: true,
      },
      {
        name: 'Admin',
        message: 'You have unlocked the class teacher assignments. Updates are now permitted.',
        communicationChannel: ['In-App'],
        placeHolder: [],
        placeHolderOptions: [],
        isEnable: true,
      },
    ],
  },
  {
    id: '13',
    event: 'Assignment Report Generated',
    triggerCondition:
      'When a summary or report of class teacher assignments is generated/exported.',
    recipient: [
      {
        name: 'Admin',
        message: 'A class teacher assignment summary report has been generated successfully.',
        communicationChannel: ['In-App'],
        placeHolder: [],
        placeHolderOptions: [],
        isEnable: true,
      },
      {
        name: 'HOD',
        message: 'Class teacher assignment report exported successfully for review.',
        communicationChannel: ['In-App'],
        placeHolder: [],
        placeHolderOptions: [],
        isEnable: true,
      },
    ],
  },
];

// =================== Component ===================
const ClassTeacherAssignmentNotificationManagement = ({ dialog, setIsViewMode }: any) => {
  const [selectedData, setSelectedData] = useState<any>(null);
  const [view, setView] = useState(false);
  const [query, setQuery] = useState({
    sorting: '',
    skipCount: 0,
    maxResultCount: 10,
  });
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
          tableId="class-teacher-assignment-notification-configuration"
          data={classTeacherAssignmentNotificationsData}
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
                    onChange={(event) => {}}
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
              align: 'left',
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
          serverSide
          onServerSort={(column, sortData) => {
            setQuery((prev) => ({
              ...prev,
              sorting: sortQueryString(sortData),
            }));
          }}
          onServerPagination={(page: number, rowsPerPage: number) => {
            setQuery((prev) => ({
              ...prev,
              skipCount: page * rowsPerPage,
              maxResultCount: rowsPerPage,
            }));
          }}
        />
      )}
    </Box>
  );
};

export default ClassTeacherAssignmentNotificationManagement;
