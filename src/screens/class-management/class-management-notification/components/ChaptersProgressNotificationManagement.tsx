'use client';

import React, { useState } from 'react';
import { Box, Card, Switch } from '@mui/material';
import sortQueryString from 'src/utils/sort-query-string';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizable-table';
import EditNotificationDialog from 'src/screens/student/student-notification/editNotificationDialog';
import {
  NotificationStatusType,
  NotificationStatusOptions,
} from 'src/enums/notification-status-type';

// =================== Notification Data ===================
export const chaptersProgressNotificationsData = [
  {
    id: '1',
    event: 'Chapter progress updated',
    triggerCondition: 'When a teacher updates the progress percentage for a chapter.',
    recipient: [
      {
        name: 'Teacher (Self Confirmation)',
        message: 'You have successfully updated the progress for [Chapter Name] to [Progress %].',
        communicationChannel: ['In-App'],
        placeHolder: ['[Chapter Name]', '[Progress %]'],
        placeHolderOptions: [
          { value: '[Chapter Name]', label: 'Chapter Name' },
          { value: '[Progress %]', label: 'Progress %' },
        ],
        isEnable: true,
      },
      {
        name: 'Principal',
        message: 'Progress updated for [Chapter Name] by [Teacher Name] — now at [Progress %].',
        communicationChannel: ['In-App'],
        placeHolder: ['[Chapter Name]', '[Teacher Name]', '[Progress %]'],
        placeHolderOptions: [
          { value: '[Chapter Name]', label: 'Chapter Name' },
          { value: '[Teacher Name]', label: 'Teacher Name' },
          { value: '[Progress %]', label: 'Progress %' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '3',
    event: 'Chapter marked Completed (100%)',
    triggerCondition: 'When a teacher finalizes completion of a chapter for the division/section.',
    recipient: [
      {
        name: 'Teacher',
        message: 'You marked [Chapter Name] as completed (100%). Well done!',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Chapter Name]'],
        placeHolderOptions: [{ value: '[Chapter Name]', label: 'Chapter Name' }],
        isEnable: true,
      },
      {
        name: 'Class Teacher',
        message:
          'Chapter [Chapter Name] has been marked completed for your class by [Teacher Name].',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Chapter Name]', '[Teacher Name]'],
        placeHolderOptions: [
          { value: '[Chapter Name]', label: 'Chapter Name' },
          { value: '[Teacher Name]', label: 'Teacher Name' },
        ],
        isEnable: true,
      },
      {
        name: 'Students (Optional)',
        message: 'Chapter [Chapter Name] is now completed. Review all related resources.',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Chapter Name]'],
        placeHolderOptions: [{ value: '[Chapter Name]', label: 'Chapter Name' }],
        isEnable: true,
      },
    ],
  },
  {
    id: '6',
    event: 'Deadline approaching (T-3/T-1 days)',
    triggerCondition: 'When the planned completion date for a chapter is 3 or 1 day away.',
    recipient: [
      {
        name: 'Teacher',
        message:
          'Reminder: The planned completion deadline for [Chapter Name] is approaching ([Days Left] days remaining).',
        communicationChannel: ['In-App'],
        placeHolder: ['[Chapter Name]', '[Days Left]'],
        placeHolderOptions: [
          { value: '[Chapter Name]', label: 'Chapter Name' },
          { value: '[Days Left]', label: 'Days Left' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '9',
    event: 'Syllabus/Chapter details changed',
    triggerCondition:
      'When chapter title, sequence, or weightage is changed after progress tracking has started.',
    recipient: [
      {
        name: 'Teacher',
        message:
          'Chapter [Chapter Name] details have been updated — please review the latest version.',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Chapter Name]'],
        placeHolderOptions: [{ value: '[Chapter Name]', label: 'Chapter Name' }],
        isEnable: true,
      },
      {
        name: 'Subject Coordinator/HOD',
        message:
          'Syllabus update detected for [Chapter Name] — modifications applied to progress tracking.',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Chapter Name]'],
        placeHolderOptions: [{ value: '[Chapter Name]', label: 'Chapter Name' }],
        isEnable: true,
      },
      {
        name: 'Class Teacher',
        message: 'Chapter [Chapter Name] details have been updated after progress started.',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Chapter Name]'],
        placeHolderOptions: [{ value: '[Chapter Name]', label: 'Chapter Name' }],
        isEnable: true,
      },
    ],
  },
  {
    id: '10',
    event: 'Resource added/updated for chapter',
    triggerCondition:
      'When a new learning resource (document, video, etc.) is linked to a chapter.',
    recipient: [
      {
        name: 'Teacher (Owner)',
        message: 'New resource added/updated for [Chapter Name]. Please review linked materials.',
        communicationChannel: ['In-App'],
        placeHolder: ['[Chapter Name]'],
        placeHolderOptions: [{ value: '[Chapter Name]', label: 'Chapter Name' }],
        isEnable: true,
      },
      {
        name: 'Students (Optional)',
        message:
          'A new learning resource has been added for [Chapter Name]. Check your materials section.',
        communicationChannel: ['In-App'],
        placeHolder: ['[Chapter Name]'],
        placeHolderOptions: [{ value: '[Chapter Name]', label: 'Chapter Name' }],
        isEnable: true,
      },
    ],
  },
  {
    id: '11',
    event: 'Assessment linked to chapter',
    triggerCondition:
      'When a quiz/test/assignment is mapped to a chapter to measure learning progress.',
    recipient: [
      {
        name: 'Teacher',
        message: 'Assessment [Assessment Title] has been linked to [Chapter Name].',
        communicationChannel: ['In-App'],
        placeHolder: ['[Assessment Title]', '[Chapter Name]'],
        placeHolderOptions: [
          { value: '[Assessment Title]', label: 'Assessment Title' },
          { value: '[Chapter Name]', label: 'Chapter Name' },
        ],
        isEnable: true,
      },
      {
        name: 'Subject Coordinator/HOD',
        message: 'Assessment added for [Chapter Name] — ensure alignment with learning outcomes.',
        communicationChannel: ['In-App'],
        placeHolder: ['[Chapter Name]'],
        placeHolderOptions: [{ value: '[Chapter Name]', label: 'Chapter Name' }],
        isEnable: true,
      },
    ],
  },
  {
    id: '12',
    event: 'Teacher comment/remark added',
    triggerCondition:
      'When a teacher adds a pedagogical note or remark on a chapter (for blockers or reflection).',
    recipient: [
      {
        name: 'Subject Coordinator/HOD',
        message:
          'New comment added by [Teacher Name] on [Chapter Name]. Please review for any action required.',
        communicationChannel: ['In-App'],
        placeHolder: ['[Teacher Name]', '[Chapter Name]'],
        placeHolderOptions: [
          { value: '[Teacher Name]', label: 'Teacher Name' },
          { value: '[Chapter Name]', label: 'Chapter Name' },
        ],
        isEnable: true,
      },
      {
        name: 'Class Teacher',
        message: '[Teacher Name] added a remark/comment for [Chapter Name].',
        communicationChannel: ['In-App'],
        placeHolder: ['[Teacher Name]', '[Chapter Name]'],
        placeHolderOptions: [
          { value: '[Teacher Name]', label: 'Teacher Name' },
          { value: '[Chapter Name]', label: 'Chapter Name' },
        ],
        isEnable: true,
      },
    ],
  },
];

// =================== Component ===================
const ChaptersProgressNotificationManagement = ({ dialog, setIsViewMode }: any) => {
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
          tableId="chapters-progress-notification-configuration"
          data={chaptersProgressNotificationsData}
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
              align: 'left',
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

export default ChaptersProgressNotificationManagement;
