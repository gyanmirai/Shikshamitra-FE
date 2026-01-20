import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

const isDev = process.env.NODE_ENV === 'development';

export const communicationApi = createApi({
  reducerPath: 'communicationApi',
  baseQuery: axiosBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/communication`, // adjust base path as needed
  }),
  tagTypes: [
    'ClassWiseAnnouncement',
    'EventAnnouncement',
    'SchoolWiseAnnouncement',
    'Holiday',
    'MeetingDetails',
    'AnnouncementTypeOptions',
    'EventTypeOptions',
    'HolidayTypeOptions',
    'ImportanceLevelOptions',
    'DeliveryChannelTypeOptions',
    'NotificationTemplates',
    'NotificationHistory',
    'SentNotificationHistory',
    'Notifications',
  ],
  endpoints: () => ({}),
});
