import { communicationType } from 'src/redux/tagTypes';

import { communicationApi } from '../communicationApi';
import { channelLabel } from '../communicationMappers';

const mapCampaignStatusToAnnouncementStatus = (status: number) => {
  if (status >= 6) {
    return 2;
  }

  if (status >= 4) {
    return 1;
  }

  return 0;
};

const mapCampaignToAnnouncement = (campaign: any) => {
  const status = mapCampaignStatusToAnnouncementStatus(campaign.status);

  return {
    id: campaign.id,
    title: campaign.title,
    description: campaign.body || campaign.description || '',
    audience: [
      {
        value: 'recipients',
        label: `${campaign.recipientCount || campaign.eligibleRecipientCount || 0} recipients`,
        name: `${campaign.recipientCount || campaign.eligibleRecipientCount || 0} recipients`,
        color: '#1976d2',
      },
    ],
    startDate: campaign.scheduledAt || campaign.creationTime,
    endDate: campaign.scheduledAt || campaign.creationTime,
    createdBy: 'Communication',
    createdOn: campaign.creationTime,
    status,
    active: status,
    type: [
      {
        id: campaign.announcementTypeId,
        announcementType: campaign.campaignType || 'Announcement',
        color: '#1976d2',
      },
    ],
    durationUnit: '',
    duration: campaign.scheduledAt ? 'Scheduled' : 'Immediate',
    attachment: campaign.attachments || [],
    importance_level: campaign.importanceLevel,
    link: campaign.linkUrl || '',
    notification_preferences: (campaign.channels || []).map(channelLabel),
    isAllowAcknoledgement: campaign.requiresAcknowledgement,
    viewedBy: campaign.deliveredCount || 0,
  };
};

export const schoolWiseAnnouncementApi = communicationApi.injectEndpoints({
  endpoints: (builder) => ({
    getAnnouncements: builder.query({
      query: (params = {}) => ({
        url: '/announcements',
        method: 'GET',
        params,
      }),
      transformResponse: (response: any) => {
        const mapped = response?.items?.map(mapCampaignToAnnouncement) || [];
        return {
          ...response,
          items: mapped,
          data: mapped,
        };
      },
      providesTags: [communicationType.schoolWiseAnnouncement],
    }),
    addAnnouncement: builder.mutation({
      query: ({ academicMediumId, data }) => ({
        url: '/announcements',
        method: 'POST',
        body: data,
        params: {
          academicMediumId,
        },
      }),
      invalidatesTags: [communicationType.schoolWiseAnnouncement],
    }),
    updateAnnouncement: builder.mutation({
      query: ({ academicMediumId, data }) => ({
        url: '/announcements',
        method: 'PUT',
        body: data,
        params: {
          academicMediumId,
        },
      }),
      invalidatesTags: [communicationType.schoolWiseAnnouncement],
    }),
    deleteAnnouncement: builder.mutation({
      query: (arg) => {
        const id = typeof arg === 'string' ? arg : arg?.id;
        return {
          url: `/announcements/${id}`,
          method: 'DELETE',
          params: {
            academicMediumId: typeof arg === 'string' ? undefined : arg?.academicMediumId,
          },
        };
      },
      invalidatesTags: [communicationType.schoolWiseAnnouncement],
    }),
    getAnnouncementById: builder.query({
      query: ({ academicMediumId, id }) => ({
        url: `/announcements/${id}`,
        method: 'GET',
        params: {
          academicMediumId,
        },
      }),
      providesTags: [communicationType.schoolWiseAnnouncement],
    }),
    publishAnnouncement: builder.mutation({
      query: (arg) => {
        const id = typeof arg === 'string' ? arg : arg?.id;
        return {
          url: `/announcements/${id}/publish`,
          method: 'PUT',
          params: {
            academicMediumId: typeof arg === 'string' ? undefined : arg?.academicMediumId,
          },
        };
      },
      invalidatesTags: [communicationType.schoolWiseAnnouncement],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAnnouncementsQuery,
  useAddAnnouncementMutation,
  useUpdateAnnouncementMutation,
  useDeleteAnnouncementMutation,
  useGetAnnouncementByIdQuery,
  usePublishAnnouncementMutation,
} = schoolWiseAnnouncementApi;
