import { NotificationStatusType } from 'src/enums/notification-status-type';

import type { INotificationData } from './types';

export const ANNOUNCEMENT_NOTIFICATIONS_DATA: INotificationData[] = [
  {
    id: '1',
    event: 'New Announcement',
    triggerCondition: 'When a new announcement is published.',
    isActive: NotificationStatusType.Active,
    recipient: [
      {
        name: 'Admin',
        message: 'A new announcement "[Announcement Title]" has been published.',
        communicationChannel: ['In-App'],
        placeHolder: ['[Announcement Title]'],
        placeHolderOptions: [{ value: '[Announcement Title]', label: 'Announcement Title' }],
        isEnable: true,
      },
      {
        name: 'Staff',
        message: 'Announcement: "[Announcement Title]"',
        communicationChannel: ['In-App'],
        placeHolder: ['[Announcement Title]'],
        placeHolderOptions: [{ value: '[Announcement Title]', label: 'Announcement Title' }],
        isEnable: true,
      },
    ],
  },
  {
    id: '2',
    event: 'Announcement Updated',
    triggerCondition: 'When an existing announcement is modified.',
    isActive: NotificationStatusType.Active,
    recipient: [
      {
        name: 'Admin',
        message: 'Announcement "[Announcement Title]" has been updated.',
        communicationChannel: ['In-App'],
        placeHolder: ['[Announcement Title]'],
        placeHolderOptions: [{ value: '[Announcement Title]', label: 'Announcement Title' }],
        isEnable: true,
      },
      {
        name: 'Staff',
        message: 'Updated announcement: "[Announcement Title]"',
        communicationChannel: ['In-App'],
        placeHolder: ['[Announcement Title]'],
        placeHolderOptions: [{ value: '[Announcement Title]', label: 'Announcement Title' }],
        isEnable: true,
      },
    ],
  },
  {
    id: '3',
    event: 'Announcement Deleted',
    triggerCondition: 'When an announcement is deleted.',
    isActive: NotificationStatusType.Inactive,
    recipient: [
      {
        name: 'Admin',
        message: 'Announcement "[Announcement Title]" has been deleted.',
        communicationChannel: ['In-App'],
        placeHolder: ['[Announcement Title]'],
        placeHolderOptions: [{ value: '[Announcement Title]', label: 'Announcement Title' }],
        isEnable: true,
      },
    ],
  },
];

export const EVENT_NOTIFICATIONS_DATA: INotificationData[] = [
  {
    id: '1',
    event: 'New Event Created',
    triggerCondition: 'When a new event is scheduled.',
    isActive: NotificationStatusType.Active,
    recipient: [
      {
        name: 'Admin',
        message: 'A new event "[Event Title]" has been scheduled.',
        communicationChannel: ['In-App'],
        placeHolder: ['[Event Title]'],
        placeHolderOptions: [{ value: '[Event Title]', label: 'Event Title' }],
        isEnable: true,
      },
      {
        name: 'Staff',
        message: 'Event: "[Event Title]" has been added to the calendar.',
        communicationChannel: ['In-App'],
        placeHolder: ['[Event Title]'],
        placeHolderOptions: [{ value: '[Event Title]', label: 'Event Title' }],
        isEnable: true,
      },
    ],
  },
  {
    id: '2',
    event: 'Event Updated',
    triggerCondition: 'When an event is modified.',
    isActive: NotificationStatusType.Active,
    recipient: [
      {
        name: 'Admin',
        message: 'Event "[Event Title]" has been updated.',
        communicationChannel: ['In-App'],
        placeHolder: ['[Event Title]'],
        placeHolderOptions: [{ value: '[Event Title]', label: 'Event Title' }],
        isEnable: true,
      },
      {
        name: 'Staff',
        message: 'Updated event: "[Event Title]"',
        communicationChannel: ['In-App'],
        placeHolder: ['[Event Title]'],
        placeHolderOptions: [{ value: '[Event Title]', label: 'Event Title' }],
        isEnable: true,
      },
    ],
  },
  {
    id: '3',
    event: 'Event Cancelled',
    triggerCondition: 'When an event is cancelled.',
    isActive: NotificationStatusType.Inactive,
    recipient: [
      {
        name: 'Admin',
        message: 'Event "[Event Title]" has been cancelled.',
        communicationChannel: ['In-App'],
        placeHolder: ['[Event Title]'],
        placeHolderOptions: [{ value: '[Event Title]', label: 'Event Title' }],
        isEnable: true,
      },
      {
        name: 'Staff',
        message: 'Cancelled event: "[Event Title]"',
        communicationChannel: ['In-App'],
        placeHolder: ['[Event Title]'],
        placeHolderOptions: [{ value: '[Event Title]', label: 'Event Title' }],
        isEnable: true,
      },
    ],
  },
];

export const SURVEY_NOTIFICATIONS_DATA: INotificationData[] = [
  {
    id: '1',
    event: 'New Survey Created',
    triggerCondition: 'When a new survey is published.',
    isActive: NotificationStatusType.Active,
    recipient: [
      {
        name: 'Admin',
        message: 'A new survey "[Survey Title]" has been published.',
        communicationChannel: ['In-App'],
        placeHolder: ['[Survey Title]'],
        placeHolderOptions: [{ value: '[Survey Title]', label: 'Survey Title' }],
        isEnable: true,
      },
      {
        name: 'Staff',
        message: 'Survey: "[Survey Title]" is now available.',
        communicationChannel: ['In-App'],
        placeHolder: ['[Survey Title]'],
        placeHolderOptions: [{ value: '[Survey Title]', label: 'Survey Title' }],
        isEnable: true,
      },
    ],
  },
  {
    id: '2',
    event: 'Survey Updated',
    triggerCondition: 'When an existing survey is modified.',
    isActive: NotificationStatusType.Active,
    recipient: [
      {
        name: 'Admin',
        message: 'Survey "[Survey Title]" has been updated.',
        communicationChannel: ['In-App'],
        placeHolder: ['[Survey Title]'],
        placeHolderOptions: [{ value: '[Survey Title]', label: 'Survey Title' }],
        isEnable: true,
      },
      {
        name: 'Staff',
        message: 'Updated survey: "[Survey Title]"',
        communicationChannel: ['In-App'],
        placeHolder: ['[Survey Title]'],
        placeHolderOptions: [{ value: '[Survey Title]', label: 'Survey Title' }],
        isEnable: true,
      },
    ],
  },
  {
    id: '3',
    event: 'Survey Closed',
    triggerCondition: 'When a survey is closed.',
    isActive: NotificationStatusType.Inactive,
    recipient: [
      {
        name: 'Admin',
        message: 'Survey "[Survey Title]" has been closed.',
        communicationChannel: ['In-App'],
        placeHolder: ['[Survey Title]'],
        placeHolderOptions: [{ value: '[Survey Title]', label: 'Survey Title' }],
        isEnable: true,
      },
      {
        name: 'Staff',
        message: 'Closed survey: "[Survey Title]"',
        communicationChannel: ['In-App'],
        placeHolder: ['[Survey Title]'],
        placeHolderOptions: [{ value: '[Survey Title]', label: 'Survey Title' }],
        isEnable: true,
      },
    ],
  },
];
