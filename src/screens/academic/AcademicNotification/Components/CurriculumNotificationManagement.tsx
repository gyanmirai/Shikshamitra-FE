import React, { useState } from 'react';
import { Box, Card, Switch } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import EditNotificationDialog from 'src/screens/student/studentNotification/editNotificationDialog';
import {
  NotificationStatusType,
  NotificationStatusOptions,
} from 'src/enums/notification-status-type';

const subjectNotificationsData = [
  //   {
  //     id: '1',
  //     event: 'New Subject Assigned to a Class',
  //     triggerCondition: 'After assigning the subject.',
  //     recipient: [
  //       {
  //         name: 'Primary Teacher',
  //         message:
  //           'Dear [Teacher Name], a new subject [Subject Name] has been assigned to [Class Name]. Please review the subject details and start preparing the syllabus.',
  //         communicationChannel: ['In-App', 'Email'],
  //         placeHolder: ['[Teacher Name]', '[Subject Name]', '[Class Name]'],
  //         placeHolderOptions: [
  //           { value: '[Teacher Name]', label: 'Teacher Name' },
  //           { value: '[Subject Name]', label: 'Subject Name' },
  //           { value: '[Class Name]', label: 'Class Name' },
  //         ],
  //         isEnable: true,
  //       },
  //     ],
  //   },
  //   {
  //     id: '2',
  //     event: 'Secondary Teacher Assigned',
  //     triggerCondition: 'After assigning the subject.',
  //     recipient: [
  //       {
  //         name: 'Secondary Teacher',
  //         message:
  //           'Dear [Teacher Name], you have been assigned as the secondary teacher for [Subject Name] in [Class Name]. Please review the details and coordinate with the primary teacher.',
  //         communicationChannel: ['In-App', 'Email'],
  //         placeHolder: ['[Teacher Name]', '[Subject Name]', '[Class Name]'],
  //         placeHolderOptions: [
  //           { value: '[Teacher Name]', label: 'Teacher Name' },
  //           { value: '[Subject Name]', label: 'Subject Name' },
  //           { value: '[Class Name]', label: 'Class Name' },
  //         ],
  //         isEnable: true,
  //       },
  //     ],
  //   },
  {
    id: '3',
    event: 'Subject Published',
    triggerCondition: 'When the subject status changes from Draft → Published.',
    recipient: [
      {
        name: 'Admin',
        message: 'The subject [Subject Name] for [Class Name] has been published successfully.',
        communicationChannel: ['In-App'],
        placeHolder: ['[Subject Name]', '[Class Name]'],
        placeHolderOptions: [
          { value: '[Subject Name]', label: 'Subject Name' },
          { value: '[Class Name]', label: 'Class Name' },
        ],
        isEnable: true,
      },
      {
        name: 'Principal',
        message:
          'The subject [Subject Name] for [Class Name] has been published successfully and is now available to teachers.',
        communicationChannel: ['In-App'],
        placeHolder: ['[Subject Name]', '[Class Name]'],
        placeHolderOptions: [
          { value: '[Subject Name]', label: 'Subject Name' },
          { value: '[Class Name]', label: 'Class Name' },
        ],
        isEnable: true,
      },
      {
        name: 'Primary Teacher',
        message:
          'The subject [Subject Name] for [Class Name] has been published successfully. Please review the syllabus and assigned materials.',
        communicationChannel: ['In-App'],
        placeHolder: ['[Subject Name]', '[Class Name]'],
        placeHolderOptions: [
          { value: '[Subject Name]', label: 'Subject Name' },
          { value: '[Class Name]', label: 'Class Name' },
        ],
        isEnable: true,
      },
      {
        name: 'Secondary Teacher',
        message:
          'The subject [Subject Name] for [Class Name] has been published successfully. Please review the syllabus and assigned materials.',
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
    id: '4',
    event: 'Subject Saved as Draft',
    triggerCondition: 'When the subject status changes from Published → Draft.',
    recipient: [
      {
        name: 'Admin',
        message: 'The subject [Subject Name] for [Class Name] has been moved back to draft status.',
        communicationChannel: ['In-App'],
        placeHolder: ['[Subject Name]', '[Class Name]'],
        placeHolderOptions: [
          { value: '[Subject Name]', label: 'Subject Name' },
          { value: '[Class Name]', label: 'Class Name' },
        ],
        isEnable: true,
      },
      {
        name: 'Principal',
        message:
          'The subject [Subject Name] for [Class Name] has been marked as draft by the Admin.',
        communicationChannel: ['In-App'],
        placeHolder: ['[Subject Name]', '[Class Name]'],
        placeHolderOptions: [
          { value: '[Subject Name]', label: 'Subject Name' },
          { value: '[Class Name]', label: 'Class Name' },
        ],
        isEnable: true,
      },
      {
        name: 'Primary Teacher',
        message:
          'The subject [Subject Name] for [Class Name] has been marked as draft by the Admin.',
        communicationChannel: ['In-App'],
        placeHolder: ['[Subject Name]', '[Class Name]'],
        placeHolderOptions: [
          { value: '[Subject Name]', label: 'Subject Name' },
          { value: '[Class Name]', label: 'Class Name' },
        ],
        isEnable: true,
      },
      {
        name: 'Secondary Teacher',
        message:
          'The subject [Subject Name] for [Class Name] has been marked as draft by the Admin.',
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
    id: '5',
    event: 'Teacher Reassigned',
    triggerCondition:
      'When a previously assigned teacher is replaced by a new teacher for a subject.',
    recipient: [
      {
        name: 'Previous Teacher',
        message:
          'Dear [Teacher Name], you are no longer assigned to [Subject Name] for [Class Name]. Please contact the administrator for more details.',
        communicationChannel: ['Email'],
        placeHolder: ['[Teacher Name]', '[Subject Name]', '[Class Name]'],
        placeHolderOptions: [
          { value: '[Teacher Name]', label: 'Teacher Name' },
          { value: '[Subject Name]', label: 'Subject Name' },
          { value: '[Class Name]', label: 'Class Name' },
        ],
        isEnable: true,
      },
      {
        name: 'New Teacher',
        message:
          'Dear [Teacher Name], you have been newly assigned to [Subject Name] for [Class Name]. Please review the subject details.',
        communicationChannel: ['Email'],
        placeHolder: ['[Teacher Name]', '[Subject Name]', '[Class Name]'],
        placeHolderOptions: [
          { value: '[Teacher Name]', label: 'Teacher Name' },
          { value: '[Subject Name]', label: 'Subject Name' },
          { value: '[Class Name]', label: 'Class Name' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '6',
    event: 'Subject Deleted',
    triggerCondition: 'When a subject assigned to a class is removed from the class.',
    recipient: [
      {
        name: 'Principal',
        message: 'The subject [Subject Name] for [Class Name] has been deleted by [Deleted By].',
        communicationChannel: ['In-App'],
        placeHolder: ['[Subject Name]', '[Class Name]', '[Deleted By]'],
        placeHolderOptions: [
          { value: '[Subject Name]', label: 'Subject Name' },
          { value: '[Class Name]', label: 'Class Name' },
          { value: '[Deleted By]', label: 'Deleted By' },
        ],
        isEnable: true,
      },
      {
        name: 'Primary Teacher',
        message:
          'The subject [Subject Name] for [Class Name] has been deleted. Please contact the Admin for more details.',
        communicationChannel: ['In-App'],
        placeHolder: ['[Subject Name]', '[Class Name]'],
        placeHolderOptions: [
          { value: '[Subject Name]', label: 'Subject Name' },
          { value: '[Class Name]', label: 'Class Name' },
        ],
        isEnable: true,
      },
      {
        name: 'Secondary Teacher',
        message:
          'The subject [Subject Name] for [Class Name] has been deleted. Please contact the Admin for more details.',
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
  //   {
  //     id: '7',
  //     event: 'Subject Access Level Changed',
  //     triggerCondition: 'When a teacher’s access level (e.g., Read/Write) for a subject is modified.',
  //     recipient: [
  //       {
  //         name: 'Affected Teacher',
  //         message:
  //           'Dear [Teacher Name], your access level for [Subject Name] in [Class Name] has been changed to [Access Level].',
  //         communicationChannel: ['In-App'],
  //         placeHolder: ['[Teacher Name]', '[Subject Name]', '[Class Name]', '[Access Level]'],
  //         placeHolderOptions: [
  //           { value: '[Teacher Name]', label: 'Teacher Name' },
  //           { value: '[Subject Name]', label: 'Subject Name' },
  //           { value: '[Class Name]', label: 'Class Name' },
  //           { value: '[Access Level]', label: 'Access Level' },
  //         ],
  //         isEnable: true,
  //       },
  //     ],
  //   },
  //   {
  //     id: '8',
  //     event: 'New Chapter Created',
  //     triggerCondition: 'When a new chapter is created under a subject for a specific class.',
  //     recipient: [
  //       {
  //         name: 'Primary Teacher',
  //         message:
  //           'A new chapter [Chapter Name] has been created under [Subject Name] for [Class Name]. Please review the chapter details and plan accordingly.',
  //         communicationChannel: ['In-App'],
  //         placeHolder: ['[Chapter Name]', '[Subject Name]', '[Class Name]'],
  //         placeHolderOptions: [
  //           { value: '[Chapter Name]', label: 'Chapter Name' },
  //           { value: '[Subject Name]', label: 'Subject Name' },
  //           { value: '[Class Name]', label: 'Class Name' },
  //         ],
  //         isEnable: true,
  //       },
  //       {
  //         name: 'Secondary Teacher',
  //         message:
  //           'A new chapter [Chapter Name] has been created under [Subject Name] for [Class Name]. Please review the chapter details and plan accordingly.',
  //         communicationChannel: ['In-App'],
  //         placeHolder: ['[Chapter Name]', '[Subject Name]', '[Class Name]'],
  //         placeHolderOptions: [
  //           { value: '[Chapter Name]', label: 'Chapter Name' },
  //           { value: '[Subject Name]', label: 'Subject Name' },
  //           { value: '[Class Name]', label: 'Class Name' },
  //         ],
  //         isEnable: true,
  //       },
  //     ],
  //   },
  //   {
  //     id: '9',
  //     event: 'Chapter Updated',
  //     triggerCondition: 'When chapter details (title, number, description, etc.) are modified.',
  //     recipient: [
  //       {
  //         name: 'Assigned Teachers',
  //         message:
  //           'The chapter [Chapter Name] under [Subject Name] for [Class Name] has been updated. Please review the latest details.',
  //         communicationChannel: ['In-App'],
  //         placeHolder: ['[Chapter Name]', '[Subject Name]', '[Class Name]'],
  //         placeHolderOptions: [
  //           { value: '[Chapter Name]', label: 'Chapter Name' },
  //           { value: '[Subject Name]', label: 'Subject Name' },
  //           { value: '[Class Name]', label: 'Class Name' },
  //         ],
  //         isEnable: true,
  //       },
  //       {
  //         name: 'Principal',
  //         message: 'A chapter [Chapter Name] under [Subject Name] for [Class Name] has been updated.',
  //         communicationChannel: ['In-App'],
  //         placeHolder: ['[Chapter Name]', '[Subject Name]', '[Class Name]'],
  //         placeHolderOptions: [
  //           { value: '[Chapter Name]', label: 'Chapter Name' },
  //           { value: '[Subject Name]', label: 'Subject Name' },
  //           { value: '[Class Name]', label: 'Class Name' },
  //         ],
  //         isEnable: true,
  //       },
  //     ],
  //   },
  {
    id: '10',
    event: 'Chapter Deleted',
    triggerCondition: 'When a chapter is deleted from a subject for a specific class.',
    recipient: [
      {
        name: 'Principal',
        message:
          'The chapter [Chapter Name] under [Subject Name] for [Class Name] has been deleted.',
        communicationChannel: ['In-App'],
        placeHolder: ['[Chapter Name]', '[Subject Name]', '[Class Name]'],
        placeHolderOptions: [
          { value: '[Chapter Name]', label: 'Chapter Name' },
          { value: '[Subject Name]', label: 'Subject Name' },
          { value: '[Class Name]', label: 'Class Name' },
        ],
        isEnable: true,
      },
      {
        name: 'Admin',
        message:
          'The chapter [Chapter Name] under [Subject Name] for [Class Name] has been removed.',
        communicationChannel: ['In-App'],
        placeHolder: ['[Chapter Name]', '[Subject Name]', '[Class Name]'],
        placeHolderOptions: [
          { value: '[Chapter Name]', label: 'Chapter Name' },
          { value: '[Subject Name]', label: 'Subject Name' },
          { value: '[Class Name]', label: 'Class Name' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '11',
    event: 'Chapter Marked as Completed',
    triggerCondition: 'When a chapter’s progress reaches 100% or is manually marked as completed.',
    recipient: [
      {
        name: 'Admin',
        message:
          'The chapter [Chapter Name] under [Subject Name] for [Class Name] has been marked as completed.',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Chapter Name]', '[Subject Name]', '[Class Name]'],
        placeHolderOptions: [
          { value: '[Chapter Name]', label: 'Chapter Name' },
          { value: '[Subject Name]', label: 'Subject Name' },
          { value: '[Class Name]', label: 'Class Name' },
        ],
        isEnable: true,
      },
      {
        name: 'Principal',
        message:
          'The chapter [Chapter Name] under [Subject Name] for [Class Name] has been marked as completed by the teacher.',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Chapter Name]', '[Subject Name]', '[Class Name]'],
        placeHolderOptions: [
          { value: '[Chapter Name]', label: 'Chapter Name' },
          { value: '[Subject Name]', label: 'Subject Name' },
          { value: '[Class Name]', label: 'Class Name' },
        ],
        isEnable: true,
      },
    ],
  },
  //   {
  //     id: '12',
  //     event: 'Resource Updated or Removed',
  //     triggerCondition: 'When a resource linked to a chapter is modified or deleted.',
  //     recipient: [
  //       {
  //         name: 'Assigned Teachers',
  //         message:
  //           'A resource linked to [Chapter Name] under [Subject Name] for [Class Name] has been updated or removed. Please review the resource list.',
  //         communicationChannel: ['In-App'],
  //         placeHolder: ['[Chapter Name]', '[Subject Name]', '[Class Name]'],
  //         placeHolderOptions: [
  //           { value: '[Chapter Name]', label: 'Chapter Name' },
  //           { value: '[Subject Name]', label: 'Subject Name' },
  //           { value: '[Class Name]', label: 'Class Name' },
  //         ],
  //         isEnable: true,
  //       },
  //     ],
  //   },
];

const CurriculumNotificationManagement = ({ dialog, setIsViewMode }: any) => {
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
          tableId="curriculum-auto-notification-configuration"
          data={subjectNotificationsData}
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
                  <Box key={recipient.name}>
                    <Box>{recipient.name.toUpperCase()}</Box>
                  </Box>
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
                  <Box>
                    <Switch
                      checked={NotificationStatusType.Active === row.isActive}
                      onChange={(event) => {
                        console.log(event.target.checked);
                      }}
                    />
                  </Box>
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

export default CurriculumNotificationManagement;
