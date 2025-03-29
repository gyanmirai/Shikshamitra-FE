export interface Notification {
  date: string;
  time: string;
  message: string;
  communicationChannel: string;
  sentTo: string | string[]; // Can be a single recipient or an array of recipients
  receivedFrom: string;
}

export const data: Notification[] = [
  {
    date: '08-01-2025',
    time: '12:00 PM',
    message: 'This is a notification message.',
    communicationChannel: 'Email',
    sentTo: 'John Doe',
    receivedFrom: 'Admin',
  },
  {
    date: '08-01-2025',
    time: '12:00 PM',
    message: 'This is a notification message.',
    communicationChannel: 'Email',
    sentTo: ['abc', 'def'],
    receivedFrom: 'Admin',
  },
];
