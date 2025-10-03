import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

import communicationData from '../../../communicationData.json';

const isDev = process.env.NODE_ENV === 'development';

export const communicationApi = createApi({
  reducerPath: 'communicationApi',
  baseQuery: isDev
    ? axiosBaseQuery({ baseUrl: 'http://localhost:3001' })
    : async ({ url }) => {
        switch (url) {
          case '/classWiseAnnouncementData':
            return { data: communicationData.classWiseAnnouncementData };
          case '/eventData':
            return { data: communicationData.eventData };
          case '/schoolWiseAnnouncementData':
            return { data: communicationData.schoolWiseAnnouncementData };
          case '/holidayData':
            return { data: communicationData.holidayData };
          case '/meetingData':
            return { data: communicationData.meetingData };
          case '/announcementTypeData':
            return { data: communicationData.announcementTypeData };
          case '/eventTypeData':
            return { data: communicationData.eventTypeData };
          case '/holidayTypeData':
            return { data: communicationData.holidayTypeData };
          case '/importanceLevelData':
            return { data: communicationData.importanceLevelData };
          case '/deliveryChannelTypeData':
            return { data: communicationData.deliveryChannelTypeData };
          case '/notificationTemplateData':
            return { data: communicationData.notificationTemplateData };
          case '/notificationHistoryApi':
            return { data: communicationData.notificationHistoryData };
          default:
            return {
              error: {
                status: 404,
                data: 'No mock data found for this route',
              },
            };
        }
      },
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
  ],
  endpoints: () => ({}),
});
