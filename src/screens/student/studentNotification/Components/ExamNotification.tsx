import React, { useState } from 'react';
import { Box, Switch } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import EditNotificationDialog from 'src/screens/student/studentNotification/editNotificationDialog';
import {
  NotificationStatusType,
  NotificationStatusOptions,
} from 'src/enums/notification-status-type';

export const examNotificationsData = [
  {
    id: '1',
    event: 'Exam Schedule Published',
    triggerCondition: 'When the exam timetable is published by the school administration.',
    isActive: NotificationStatusType.Active,
    recipient: [
      {
        name: 'Student',
        message:
          'Your exam schedule for [Exam Name] has been published. First exam: [First Subject] on [First Date]. Please check the full timetable.',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Exam Name]', '[First Subject]', '[First Date]'],
        placeHolderOptions: [
          { value: '[Exam Name]', label: 'Exam Name' },
          { value: '[First Subject]', label: 'First Subject' },
          { value: '[First Date]', label: 'First Date' },
        ],
        isEnable: true,
      },
      {
        name: 'Parent',
        message:
          'Exam schedule for [Student Name] has been published for [Exam Name]. Please ensure your child is prepared.',
        communicationChannel: ['In-App', 'Email', 'SMS'],
        placeHolder: ['[Student Name]', '[Exam Name]'],
        placeHolderOptions: [
          { value: '[Student Name]', label: 'Student Name' },
          { value: '[Exam Name]', label: 'Exam Name' },
        ],
        isEnable: true,
      },
      {
        name: 'Teacher',
        message:
          'Exam schedule for [Exam Name] has been published for Class [Class]/[Division]. Please make necessary preparations.',
        communicationChannel: ['In-App'],
        placeHolder: ['[Exam Name]', '[Class]', '[Division]'],
        placeHolderOptions: [
          { value: '[Exam Name]', label: 'Exam Name' },
          { value: '[Class]', label: 'Class' },
          { value: '[Division]', label: 'Division' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '2',
    event: 'Admit Card / Hall Ticket Ready',
    triggerCondition:
      'When the exam admit card or hall ticket is generated and available for download.',
    isActive: NotificationStatusType.Active,
    recipient: [
      {
        name: 'Student',
        message:
          'Your admit card for [Exam Name] is ready. Please download and print it from the portal. Exam starts on [Start Date].',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Exam Name]', '[Start Date]'],
        placeHolderOptions: [
          { value: '[Exam Name]', label: 'Exam Name' },
          { value: '[Start Date]', label: 'Start Date' },
        ],
        isEnable: true,
      },
      {
        name: 'Parent',
        message:
          'Admit card for [Student Name] for [Exam Name] is now available. Please ensure your child carries it during the exam.',
        communicationChannel: ['In-App', 'SMS'],
        placeHolder: ['[Student Name]', '[Exam Name]'],
        placeHolderOptions: [
          { value: '[Student Name]', label: 'Student Name' },
          { value: '[Exam Name]', label: 'Exam Name' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '3',
    event: 'Exam Reminder',
    triggerCondition: 'Reminder sent 1 day before the exam date.',
    isActive: NotificationStatusType.Active,
    recipient: [
      {
        name: 'Student',
        message:
          'Reminder: Your [Subject] exam is scheduled for tomorrow, [Date] at [Time] in [Venue]. All the best!',
        communicationChannel: ['In-App', 'Email', 'SMS'],
        placeHolder: ['[Subject]', '[Date]', '[Time]', '[Venue]'],
        placeHolderOptions: [
          { value: '[Subject]', label: 'Subject' },
          { value: '[Date]', label: 'Date' },
          { value: '[Time]', label: 'Time' },
          { value: '[Venue]', label: 'Venue' },
        ],
        isEnable: true,
      },
      {
        name: 'Parent',
        message:
          "Reminder: [Student Name]'s [Subject] exam is tomorrow, [Date] at [Time]. Please ensure they are prepared.",
        communicationChannel: ['In-App', 'SMS'],
        placeHolder: ['[Student Name]', '[Subject]', '[Date]', '[Time]'],
        placeHolderOptions: [
          { value: '[Student Name]', label: 'Student Name' },
          { value: '[Subject]', label: 'Subject' },
          { value: '[Date]', label: 'Date' },
          { value: '[Time]', label: 'Time' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '4',
    event: 'Result Declared',
    triggerCondition: 'When exam results are published by the school.',
    isActive: NotificationStatusType.Active,
    recipient: [
      {
        name: 'Student',
        message:
          'Your results for [Exam Name] have been declared. You scored [Marks Obtained] out of [Total Marks]. Please check the portal for detailed marksheet.',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Exam Name]', '[Marks Obtained]', '[Total Marks]'],
        placeHolderOptions: [
          { value: '[Exam Name]', label: 'Exam Name' },
          { value: '[Marks Obtained]', label: 'Marks Obtained' },
          { value: '[Total Marks]', label: 'Total Marks' },
        ],
        isEnable: true,
      },
      {
        name: 'Parent',
        message:
          "[Student Name]'s results for [Exam Name] are out. Score: [Marks Obtained]/[Total Marks]. Login to the portal to view the detailed report.",
        communicationChannel: ['In-App', 'Email', 'SMS'],
        placeHolder: ['[Student Name]', '[Exam Name]', '[Marks Obtained]', '[Total Marks]'],
        placeHolderOptions: [
          { value: '[Student Name]', label: 'Student Name' },
          { value: '[Exam Name]', label: 'Exam Name' },
          { value: '[Marks Obtained]', label: 'Marks Obtained' },
          { value: '[Total Marks]', label: 'Total Marks' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '5',
    event: 'Student Failed / Needs Improvement',
    triggerCondition: 'When a student scores below the passing threshold in an exam.',
    isActive: NotificationStatusType.Inactive,
    recipient: [
      {
        name: 'Parent',
        message:
          'Dear [Parent Name], [Student Name] has not cleared the [Subject] exam. Score: [Marks Obtained]/[Total Marks]. Please schedule a meeting with the class teacher.',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: [
          '[Parent Name]',
          '[Student Name]',
          '[Subject]',
          '[Marks Obtained]',
          '[Total Marks]',
        ],
        placeHolderOptions: [
          { value: '[Parent Name]', label: 'Parent Name' },
          { value: '[Student Name]', label: 'Student Name' },
          { value: '[Subject]', label: 'Subject' },
          { value: '[Marks Obtained]', label: 'Marks Obtained' },
          { value: '[Total Marks]', label: 'Total Marks' },
        ],
        isEnable: true,
      },
      {
        name: 'Teacher',
        message:
          'Student [Student Name] scored [Marks Obtained]/[Total Marks] in [Subject] - below passing threshold. Follow-up required.',
        communicationChannel: ['In-App'],
        placeHolder: ['[Student Name]', '[Marks Obtained]', '[Total Marks]', '[Subject]'],
        placeHolderOptions: [
          { value: '[Student Name]', label: 'Student Name' },
          { value: '[Marks Obtained]', label: 'Marks Obtained' },
          { value: '[Total Marks]', label: 'Total Marks' },
          { value: '[Subject]', label: 'Subject' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '6',
    event: 'Re-evaluation Requested',
    triggerCondition: 'When a student or parent requests re-evaluation of exam papers.',
    isActive: NotificationStatusType.Inactive,
    recipient: [
      {
        name: 'Admin',
        message:
          'Re-evaluation request received: [Student Name] - [Subject] ([Exam Name]). Requested by: [Requested By].',
        communicationChannel: ['In-App'],
        placeHolder: ['[Student Name]', '[Subject]', '[Exam Name]', '[Requested By]'],
        placeHolderOptions: [
          { value: '[Student Name]', label: 'Student Name' },
          { value: '[Subject]', label: 'Subject' },
          { value: '[Exam Name]', label: 'Exam Name' },
          { value: '[Requested By]', label: 'Requested By' },
        ],
        isEnable: true,
      },
      {
        name: 'Parent',
        message:
          'Your re-evaluation request for [Student Name] - [Subject] has been received. We will notify you of the outcome within [Processing Days] working days.',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Student Name]', '[Subject]', '[Processing Days]'],
        placeHolderOptions: [
          { value: '[Student Name]', label: 'Student Name' },
          { value: '[Subject]', label: 'Subject' },
          { value: '[Processing Days]', label: 'Processing Days' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '7',
    event: 'Re-evaluation Result Updated',
    triggerCondition: 'When the re-evaluation outcome is published.',
    isActive: NotificationStatusType.Inactive,
    recipient: [
      {
        name: 'Student',
        message:
          'Re-evaluation result for [Subject] - [Exam Name]: Revised Score: [Revised Marks]/[Total Marks].',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Subject]', '[Exam Name]', '[Revised Marks]', '[Total Marks]'],
        placeHolderOptions: [
          { value: '[Subject]', label: 'Subject' },
          { value: '[Exam Name]', label: 'Exam Name' },
          { value: '[Revised Marks]', label: 'Revised Marks' },
          { value: '[Total Marks]', label: 'Total Marks' },
        ],
        isEnable: true,
      },
      {
        name: 'Parent',
        message:
          'Re-evaluation completed for [Student Name] - [Subject]. Revised Score: [Revised Marks]/[Total Marks].',
        communicationChannel: ['In-App', 'Email', 'SMS'],
        placeHolder: ['[Student Name]', '[Subject]', '[Revised Marks]', '[Total Marks]'],
        placeHolderOptions: [
          { value: '[Student Name]', label: 'Student Name' },
          { value: '[Subject]', label: 'Subject' },
          { value: '[Revised Marks]', label: 'Revised Marks' },
          { value: '[Total Marks]', label: 'Total Marks' },
        ],
        isEnable: true,
      },
    ],
  },
];

const ExamNotificationManagement = ({ dialog, setIsViewMode }: any) => {
  const [selectedData, setSelectedData] = useState<any>(null);
  const [view, setView] = useState(false);
  const [notifications, setNotifications] = useState(examNotificationsData);

  const handleToggleActive = (id: string, checked: boolean) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? {
              ...notification,
              isActive: checked ? NotificationStatusType.Active : NotificationStatusType.Inactive,
            }
          : notification
      )
    );
  };

  return (
    <Box sx={{ height: '100%' }}>
      {dialog.value ? (
        <EditNotificationDialog
          data={selectedData}
          onClose={() => {
            dialog.onFalse();
            setSelectedData(null);
          }}
          isFromView={view}
        />
      ) : (
        <CustomizableTable
          tableId="exam-auto-notification-configuration"
          data={notifications}
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
                      handleToggleActive(row.id, event.target.checked);
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

export default ExamNotificationManagement;
