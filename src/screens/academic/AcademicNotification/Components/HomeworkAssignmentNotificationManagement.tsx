import React, { useState } from 'react';
import { Box, Card, Switch } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import EditNotificationDialog from 'src/screens/student/studentNotification/edit-notification-dialog';
import {
  NotificationStatusType,
  NotificationStatusOptions,
} from 'src/enums/notification-status-type';

const homeworkAssignmentsNotificationsData = [
  {
    id: '2',
    event: 'Homework scheduled',
    triggerCondition: 'When the homework is scheduled with a publish date and due date.',
    recipient: [
      {
        name: 'Admin',
        message:
          'Homework for [Subject Name] in [Class Name] has been scheduled from [Publish Date] to [Due Date].',
        communicationChannel: ['In-App'],
        placeHolder: ['[Subject Name]', '[Class Name]', '[Publish Date]', '[Due Date]'],
        placeHolderOptions: [
          { value: '[Subject Name]', label: 'Subject Name' },
          { value: '[Class Name]', label: 'Class Name' },
          { value: '[Publish Date]', label: 'Publish Date' },
          { value: '[Due Date]', label: 'Due Date' },
        ],
        isEnable: true,
      },
      {
        name: 'Principal',
        message:
          'Homework for [Subject Name] ([Class Name]) has been scheduled between [Publish Date] and [Due Date].',
        communicationChannel: ['In-App'],
        placeHolder: ['[Subject Name]', '[Class Name]', '[Publish Date]', '[Due Date]'],
        placeHolderOptions: [
          { value: '[Subject Name]', label: 'Subject Name' },
          { value: '[Class Name]', label: 'Class Name' },
          { value: '[Publish Date]', label: 'Publish Date' },
          { value: '[Due Date]', label: 'Due Date' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '3',
    event: 'Homework published',
    triggerCondition: 'When the publish date arrives and the homework is made visible to students.',
    recipient: [
      {
        name: 'Student',
        message: 'New homework on [Subject Name] has been published. Submit before [Due Date].',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Subject Name]', '[Due Date]'],
        placeHolderOptions: [
          { value: '[Subject Name]', label: 'Subject Name' },
          { value: '[Due Date]', label: 'Due Date' },
        ],
        isEnable: true,
      },
      {
        name: 'Teachers',
        message: 'Homework for [Subject Name] has been published and is now visible to students.',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Subject Name]'],
        placeHolderOptions: [{ value: '[Subject Name]', label: 'Subject Name' }],
        isEnable: true,
      },
      {
        name: 'Admin',
        message: 'Homework for [Subject Name] in [Class Name] has been published.',
        communicationChannel: ['In-App', 'Email'],
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
    event: 'Homework manually published',
    triggerCondition: 'When a teacher manually publishes homework before or on the scheduled date.',
    recipient: [
      {
        name: 'Student',
        message: 'Homework for [Subject Name] has been published early. Submit before [Due Date].',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Subject Name]', '[Due Date]'],
        placeHolderOptions: [
          { value: '[Subject Name]', label: 'Subject Name' },
          { value: '[Due Date]', label: 'Due Date' },
        ],
        isEnable: true,
      },
      {
        name: 'Admin',
        message: 'Teacher has manually published homework for [Subject Name] ([Class Name]).',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Subject Name]', '[Class Name]'],
        placeHolderOptions: [
          { value: '[Subject Name]', label: 'Subject Name' },
          { value: '[Class Name]', label: 'Class Name' },
        ],
        isEnable: true,
      },
      {
        name: 'Principal',
        message: 'Manual publication of homework for [Subject Name] in [Class Name] has been done.',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Subject Name]', '[Class Name]'],
        placeHolderOptions: [
          { value: '[Subject Name]', label: 'Subject Name' },
          { value: '[Class Name]', label: 'Class Name' },
        ],
        isEnable: true,
      },
      {
        name: 'Teacher',
        message: 'You manually published homework for [Subject Name] in [Class Name].',
        communicationChannel: ['In-App', 'Email'],
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
    id: '6',
    event: 'Homework updated',
    triggerCondition:
      'When details (subject, chapter, due date, instructions, or attachments) are updated.',
    recipient: [
      {
        name: 'Student',
        message:
          'Homework for [Subject Name] has been updated. Please check for new details or files.',
        communicationChannel: ['In-App'],
        placeHolder: ['[Subject Name]'],
        placeHolderOptions: [{ value: '[Subject Name]', label: 'Subject Name' }],
        isEnable: true,
      },
      {
        name: 'Admin',
        message: 'Homework for [Subject Name] ([Class Name]) has been updated by the teacher.',
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
        message: 'Homework details updated for [Class Name] ([Subject Name]).',
        communicationChannel: ['In-App'],
        placeHolder: ['[Class Name]', '[Subject Name]'],
        placeHolderOptions: [
          { value: '[Class Name]', label: 'Class Name' },
          { value: '[Subject Name]', label: 'Subject Name' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '7',
    event: 'Homework deleted',
    triggerCondition: 'When homework is deleted before or after publishing.',
    recipient: [
      {
        name: 'Admin',
        message: 'Homework for [Subject Name] ([Class Name]) has been deleted by the teacher.',
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
        message: 'Homework on [Subject Name] for [Class Name] has been deleted.',
        communicationChannel: ['In-App'],
        placeHolder: ['[Subject Name]', '[Class Name]'],
        placeHolderOptions: [
          { value: '[Subject Name]', label: 'Subject Name' },
          { value: '[Class Name]', label: 'Class Name' },
        ],
        isEnable: true,
      },
      {
        name: 'Teacher',
        message: 'You deleted homework for [Subject Name] ([Class Name]).',
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
    id: '8',
    event: 'Homework submission started',
    triggerCondition: 'When students begin submitting homework after it’s published.',
    recipient: [
      {
        name: 'Teacher',
        message: 'Students have started submitting homework for [Subject Name] ([Class Name]).',
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
    id: '9',
    event: 'Homework submitted',
    triggerCondition: 'When a student submits homework successfully.',
    recipient: [
      {
        name: 'Teacher',
        message: '[Student Name] has submitted homework for [Subject Name].',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Student Name]', '[Subject Name]'],
        placeHolderOptions: [
          { value: '[Student Name]', label: 'Student Name' },
          { value: '[Subject Name]', label: 'Subject Name' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '10',
    event: 'Homework resubmitted (after correction)',
    triggerCondition: 'When a student re-submits homework after being asked for revision.',
    recipient: [
      {
        name: 'Teacher',
        message: '[Student Name] has re-submitted homework for [Subject Name] after correction.',
        communicationChannel: ['In-App'],
        placeHolder: ['[Student Name]', '[Subject Name]'],
        placeHolderOptions: [
          { value: '[Student Name]', label: 'Student Name' },
          { value: '[Subject Name]', label: 'Subject Name' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '11',
    event: 'Homework submission due reminder (1 day before due date)',
    triggerCondition: 'Automated reminder sent one day before the due date.',
    recipient: [
      {
        name: 'Student',
        message: 'Reminder: Homework for [Subject Name] is due tomorrow ([Due Date]).',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Subject Name]', '[Due Date]'],
        placeHolderOptions: [
          { value: '[Subject Name]', label: 'Subject Name' },
          { value: '[Due Date]', label: 'Due Date' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '12',
    event: 'Homework overdue',
    triggerCondition: 'When the due date passes and homework is not submitted.',
    recipient: [
      {
        name: 'Student',
        message: 'You missed the submission deadline for [Subject Name] homework.',
        communicationChannel: ['In-App'],
        placeHolder: ['[Subject Name]'],
        placeHolderOptions: [{ value: '[Subject Name]', label: 'Subject Name' }],
        isEnable: true,
      },
      {
        name: 'Teacher',
        message: '[Student Name] has not submitted homework for [Subject Name].',
        communicationChannel: ['In-App'],
        placeHolder: ['[Student Name]', '[Subject Name]'],
        placeHolderOptions: [
          { value: '[Student Name]', label: 'Student Name' },
          { value: '[Subject Name]', label: 'Subject Name' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '13',
    event: 'Teacher reviewed homework',
    triggerCondition: 'When a teacher reviews a student’s submission.',
    recipient: [
      {
        name: 'Student',
        message: 'Your homework for [Subject Name] has been reviewed by your teacher.',
        communicationChannel: ['In-App'],
        placeHolder: ['[Subject Name]'],
        placeHolderOptions: [{ value: '[Subject Name]', label: 'Subject Name' }],
        isEnable: true,
      },
    ],
  },
  {
    id: '14',
    event: 'Homework graded',
    triggerCondition: 'When a teacher grades or gives feedback on homework.',
    recipient: [
      {
        name: 'Student',
        message: 'Your homework for [Subject Name] has been graded. Check your feedback and marks.',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Subject Name]'],
        placeHolderOptions: [{ value: '[Subject Name]', label: 'Subject Name' }],
        isEnable: true,
      },
    ],
  },
  {
    id: '15',
    event: 'Homework feedback updated',
    triggerCondition: 'When a teacher updates feedback or grades after review.',
    recipient: [
      {
        name: 'Student',
        message: 'Your feedback for [Subject Name] has been updated. Please review the changes.',
        communicationChannel: ['In-App'],
        placeHolder: ['[Subject Name]'],
        placeHolderOptions: [{ value: '[Subject Name]', label: 'Subject Name' }],
        isEnable: true,
      },
    ],
  },
  {
    id: '16',
    event: 'Homework completed (all submissions received)',
    triggerCondition: 'When all students in the division have submitted their homework.',
    recipient: [
      {
        name: 'Teacher',
        message: 'All students from [Class Name] have submitted homework for [Subject Name].',
        communicationChannel: ['In-App'],
        placeHolder: ['[Class Name]', '[Subject Name]'],
        placeHolderOptions: [
          { value: '[Class Name]', label: 'Class Name' },
          { value: '[Subject Name]', label: 'Subject Name' },
        ],
        isEnable: true,
      },
      {
        name: 'Admin',
        message: 'Homework submission completed for [Class Name] ([Subject Name]).',
        communicationChannel: ['In-App'],
        placeHolder: ['[Class Name]', '[Subject Name]'],
        placeHolderOptions: [
          { value: '[Class Name]', label: 'Class Name' },
          { value: '[Subject Name]', label: 'Subject Name' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '18',
    event: 'Assignment scheduled',
    triggerCondition: 'When an assignment is scheduled with a publish and due date.',
    recipient: [
      {
        name: 'Admin',
        message:
          'Assignment for [Subject Name] in [Class Name] has been scheduled between [Publish Date] and [Due Date].',
        communicationChannel: ['In-App'],
        placeHolder: ['[Subject Name]', '[Class Name]', '[Publish Date]', '[Due Date]'],
        placeHolderOptions: [
          { value: '[Subject Name]', label: 'Subject Name' },
          { value: '[Class Name]', label: 'Class Name' },
          { value: '[Publish Date]', label: 'Publish Date' },
          { value: '[Due Date]', label: 'Due Date' },
        ],
        isEnable: true,
      },
      {
        name: 'Principal',
        message:
          'Assignment for [Subject Name] ([Class Name]) has been scheduled from [Publish Date] to [Due Date].',
        communicationChannel: ['In-App'],
        placeHolder: ['[Subject Name]', '[Class Name]', '[Publish Date]', '[Due Date]'],
        placeHolderOptions: [
          { value: '[Subject Name]', label: 'Subject Name' },
          { value: '[Class Name]', label: 'Class Name' },
          { value: '[Publish Date]', label: 'Publish Date' },
          { value: '[Due Date]', label: 'Due Date' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '19',
    event: 'Assignment published',
    triggerCondition:
      'When the assignment is made visible to students (manually or via scheduled publish).',
    recipient: [
      {
        name: 'Student',
        message:
          'New assignment on [Subject Name] has been published. Please submit before [Due Date].',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Subject Name]', '[Due Date]'],
        placeHolderOptions: [
          { value: '[Subject Name]', label: 'Subject Name' },
          { value: '[Due Date]', label: 'Due Date' },
        ],
        isEnable: true,
      },
      {
        name: 'Teacher',
        message:
          'Your assignment for [Subject Name] has been published and is now available to students.',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Subject Name]'],
        placeHolderOptions: [{ value: '[Subject Name]', label: 'Subject Name' }],
        isEnable: true,
      },
    ],
  },
  {
    id: '20',
    event: 'Assignment updated',
    triggerCondition:
      'When assignment details (title, due date, attached files, or questions) are updated.',
    recipient: [
      {
        name: 'Student',
        message:
          'Assignment details for [Subject Name] have been updated. Please review the new information.',
        communicationChannel: ['In-App'],
        placeHolder: ['[Subject Name]'],
        placeHolderOptions: [{ value: '[Subject Name]', label: 'Subject Name' }],
        isEnable: true,
      },
      {
        name: 'Admin',
        message: 'Assignment for [Subject Name] in [Class Name] has been updated by the teacher.',
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
    id: '21',
    event: 'Assignment deleted',
    triggerCondition: 'When an assignment is deleted before or after being published.',
    recipient: [
      {
        name: 'Admin',
        message: 'Assignment for [Subject Name] in [Class Name] has been deleted by the teacher.',
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
        message: 'Assignment on [Subject Name] for [Class Name] has been removed.',
        communicationChannel: ['In-App'],
        placeHolder: ['[Subject Name]', '[Class Name]'],
        placeHolderOptions: [
          { value: '[Subject Name]', label: 'Subject Name' },
          { value: '[Class Name]', label: 'Class Name' },
        ],
        isEnable: true,
      },
      {
        name: 'Teacher',
        message: 'You deleted the assignment for [Subject Name] ([Class Name]).',
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
    id: '22',
    event: 'Assignment submission started',
    triggerCondition: 'When students start submitting their assignments after it’s published.',
    recipient: [
      {
        name: 'Teacher',
        message: 'Students have started submitting assignments for [Subject Name] ([Class Name]).',
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
    id: '23',
    event: 'Assignment submitted',
    triggerCondition: 'When a student successfully submits an assignment.',
    recipient: [
      {
        name: 'Teacher',
        message: '[Student Name] has submitted the assignment for [Subject Name].',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Student Name]', '[Subject Name]'],
        placeHolderOptions: [
          { value: '[Student Name]', label: 'Student Name' },
          { value: '[Subject Name]', label: 'Subject Name' },
        ],
        isEnable: true,
      },
      {
        name: 'Admin',
        message: 'A new assignment submission has been received for [Subject Name] ([Class Name]).',
        communicationChannel: ['In-App', 'Email'],
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
    id: '24',
    event: 'Assignment resubmitted',
    triggerCondition: 'When a student re-submits after being asked to correct or improve.',
    recipient: [
      {
        name: 'Teacher',
        message: '[Student Name] has re-submitted the assignment for [Subject Name].',
        communicationChannel: ['In-App'],
        placeHolder: ['[Student Name]', '[Subject Name]'],
        placeHolderOptions: [
          { value: '[Student Name]', label: 'Student Name' },
          { value: '[Subject Name]', label: 'Subject Name' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '25',
    event: 'Assignment due reminder (1 day before)',
    triggerCondition: 'Automatically sent to students before the due date.',
    recipient: [
      {
        name: 'Student',
        message: 'Reminder: Assignment for [Subject Name] is due tomorrow ([Due Date]).',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Subject Name]', '[Due Date]'],
        placeHolderOptions: [
          { value: '[Subject Name]', label: 'Subject Name' },
          { value: '[Due Date]', label: 'Due Date' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '26',
    event: 'Assignment overdue',
    triggerCondition: 'When the assignment submission is not completed by the due date.',
    recipient: [
      {
        name: 'Student',
        message: 'You missed the submission deadline for the assignment in [Subject Name].',
        communicationChannel: ['In-App'],
        placeHolder: ['[Subject Name]'],
        placeHolderOptions: [{ value: '[Subject Name]', label: 'Subject Name' }],
        isEnable: true,
      },
      {
        name: 'Teacher',
        message: '[Student Name] has not submitted the assignment for [Subject Name].',
        communicationChannel: ['In-App'],
        placeHolder: ['[Student Name]', '[Subject Name]'],
        placeHolderOptions: [
          { value: '[Student Name]', label: 'Student Name' },
          { value: '[Subject Name]', label: 'Subject Name' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '27',
    event: 'Assignment graded',
    triggerCondition: 'When the teacher grades or provides evaluation/marks.',
    recipient: [
      {
        name: 'Student',
        message: 'Your assignment for [Subject Name] has been graded. Please review your marks.',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Subject Name]'],
        placeHolderOptions: [{ value: '[Subject Name]', label: 'Subject Name' }],
        isEnable: true,
      },
    ],
  },
  {
    id: '28',
    event: 'Assignment feedback updated',
    triggerCondition: 'When feedback or grade is modified after initial submission.',
    recipient: [
      {
        name: 'Student',
        message:
          'Your feedback for the assignment in [Subject Name] has been updated. Check for changes.',
        communicationChannel: ['In-App'],
        placeHolder: ['[Subject Name]'],
        placeHolderOptions: [{ value: '[Subject Name]', label: 'Subject Name' }],
        isEnable: true,
      },
    ],
  },
  {
    id: '29',
    event: 'Assignment review summary generated',
    triggerCondition: 'When the teacher completes all evaluations for a division/subject.',
    recipient: [
      {
        name: 'Principal',
        message: 'Review summary for [Subject Name] ([Class Name]) has been generated.',
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
        message: 'All evaluations for [Class Name] ([Subject Name]) have been completed.',
        communicationChannel: ['In-App'],
        placeHolder: ['[Class Name]', '[Subject Name]'],
        placeHolderOptions: [
          { value: '[Class Name]', label: 'Class Name' },
          { value: '[Subject Name]', label: 'Subject Name' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '30',
    event: 'Principal review (optional)',
    triggerCondition: 'When a principal reviews the overall performance of the assignment batch.',
    recipient: [
      {
        name: 'Teacher',
        message: 'Principal has reviewed the assignment results for [Subject Name] ([Class Name]).',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Subject Name]', '[Class Name]'],
        placeHolderOptions: [
          { value: '[Subject Name]', label: 'Subject Name' },
          { value: '[Class Name]', label: 'Class Name' },
        ],
        isEnable: true,
      },
      {
        name: 'Admin',
        message: 'Principal has reviewed assignment performance for [Class Name] ([Subject Name]).',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Class Name]', '[Subject Name]'],
        placeHolderOptions: [
          { value: '[Class Name]', label: 'Class Name' },
          { value: '[Subject Name]', label: 'Subject Name' },
        ],
        isEnable: true,
      },
    ],
  },
];

const HomeworkAssignmentNotificationManagement = ({ dialog }: any) => {
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
          data={homeworkAssignmentsNotificationsData}
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

export default HomeworkAssignmentNotificationManagement;
