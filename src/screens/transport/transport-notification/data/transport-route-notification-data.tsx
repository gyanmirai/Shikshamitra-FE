interface PlaceHolderOption {
  value: string;
  label: string;
}

interface Recipient {
  name: string;
  message: string;
  communicationChannel: string[];
  placeHolderOptions: PlaceHolderOption[];
  isEnable: boolean;
}

interface Notification {
  id: number;
  event: string;
  triggerCondition: string;
  recipient: Recipient[];
}

export const notificationData: Notification[] = [
  {
    id: 1,
    event: 'New Route Created',
    triggerCondition: 'When a new route is successfully created.',
    recipient: [
      {
        name: 'admin',
        message:
          'A new route [Route Name] has been successfully created. Please review and assign a driver if needed.',
        communicationChannel: ['WhatsApp', 'Email'],
        placeHolderOptions: [{ value: '[Route Name]', label: 'Route Name' }],
        isEnable: true,
      },
      {
        name: 'driver',
        message: 'A new route [Route Name] has been added. You may be assigned to it soon.',
        communicationChannel: ['Email'],
        placeHolderOptions: [{ value: '[Route Name]', label: 'Route Name' }],
        isEnable: true,
      },
    ],
  },
  {
    id: 3,
    event: 'Route Assigned to Driver',
    triggerCondition: 'When a route is assigned to a driver.',
    recipient: [
      {
        name: 'admin',
        message: 'The route [Route Name] has been assigned to [Driver Name].',
        communicationChannel: ['Email', 'Dashboard'],
        placeHolderOptions: [
          { value: '[Route Name]', label: 'Route Name' },
          { value: '[Driver Name]', label: 'Driver Name' },
        ],
        isEnable: true,
      },
      {
        name: 'driver',
        message:
          'You have been assigned to the route [Route Name]. Check your schedule for details.',
        communicationChannel: ['WhatsApp', 'App Notification'],
        placeHolderOptions: [{ value: '[Route Name]', label: 'Route Name' }],
        isEnable: true,
      },
    ],
  },
  {
    id: 4,
    event: 'Student Assigned to Route',
    triggerCondition: 'When a student is assigned to a route.',
    recipient: [
      {
        name: 'admin',
        message: '[Student Name] has been assigned to [Route Name].',
        communicationChannel: ['Email'],
        placeHolderOptions: [
          { value: '[Student Name]', label: 'Student Name' },
          { value: '[Route Name]', label: 'Route Name' },
        ],
        isEnable: true,
      },
      {
        name: 'driver',
        message: 'A new student [Student Name] has been assigned to your route [Route Name].',
        communicationChannel: ['App Notification'],
        placeHolderOptions: [
          { value: '[Student Name]', label: 'Student Name' },
          { value: '[Route Name]', label: 'Route Name' },
        ],
        isEnable: true,
      },
      {
        name: 'parent',
        message:
          'Your child [Student Name] has been assigned to [Route Name]. Check details in the app.',
        communicationChannel: ['SMS', 'WhatsApp'],
        placeHolderOptions: [
          { value: '[Student Name]', label: 'Student Name' },
          { value: '[Route Name]', label: 'Route Name' },
        ],
        isEnable: true,
      },
    ],
  },

  {
    id: 5,
    event: 'New Stop Added',
    triggerCondition: 'When a new stop is added to a route.',
    recipient: [
      {
        name: 'Admin',
        message: 'A new stop [Stop Name] has been added to [Route Name].',
        communicationChannel: ['Email'],

        placeHolderOptions: [
          { value: '[Stop Name]', label: 'Stop Name' },
          { value: '[Route Name]', label: 'Route Name' },
        ],
        isEnable: true,
      },
      {
        name: 'Driver',
        message:
          'A new stop [Stop Name] has been added to your route. Update your schedule accordingly.',
        communicationChannel: ['Email'],

        placeHolderOptions: [{ value: '[Stop Name]', label: 'Stop Name' }],
        isEnable: true,
      },
    ],
  },
  {
    id: 6,
    event: 'Transport Service Request Submitted',
    triggerCondition: 'When a new transport request is submitted.',
    recipient: [
      {
        name: 'Admin',
        message:
          'A new transport request has been submitted for [Student Name]. Review and assign a route.',
        communicationChannel: ['Email'],

        placeHolderOptions: [{ value: '[Student Name]', label: 'Student Name' }],
        isEnable: true,
      },
      {
        name: 'Parent',
        message:
          'Your transport request for [Student Name] has been received. You will be notified once a route is assigned.',
        communicationChannel: ['Email'],

        placeHolderOptions: [{ value: '[Student Name]', label: 'Student Name' }],
        isEnable: true,
      },
    ],
  },
  {
    id: 7,
    event: 'Student Assigned to a Route',
    triggerCondition: 'When a student is assigned to a transport route.',
    recipient: [
      {
        name: 'Admin',
        message: '[Student Name] has been assigned to [Route Name].',
        communicationChannel: ['Email'],

        placeHolderOptions: [
          { value: '[Student Name]', label: 'Student Name' },
          { value: '[Route Name]', label: 'Route Name' },
        ],
        isEnable: true,
      },
      {
        name: 'Driver',
        message: 'A new student [Student Name] has been assigned to your route [Route Name].',
        communicationChannel: ['Email'],

        placeHolderOptions: [
          { value: '[Student Name]', label: 'Student Name' },
          { value: '[Route Name]', label: 'Route Name' },
        ],
        isEnable: true,
      },
      {
        name: 'Parent',
        message:
          'Your child [Student Name] has been assigned to [Route Name]. Check details in the app.',
        communicationChannel: ['Email'],

        placeHolderOptions: [
          { value: '[Student Name]', label: 'Student Name' },
          { value: '[Route Name]', label: 'Route Name' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: 8,
    event: 'Transport Request Declined',
    triggerCondition: 'When a transport request is declined.',
    recipient: [
      {
        name: 'Admin',
        message: 'The transport request for [Student Name] has been declined.',
        communicationChannel: ['Email'],

        placeHolderOptions: [{ value: '[Student Name]', label: 'Student Name' }],
        isEnable: true,
      },
      {
        name: 'Parent',
        message:
          'Unfortunately, the transport request for [Student Name] has been declined. Contact support for assistance.',
        communicationChannel: ['Email'],

        placeHolderOptions: [{ value: '[Student Name]', label: 'Student Name' }],
        isEnable: true,
      },
    ],
  },
];
