import { api } from '../service';
import {
  academicNotificationsRoot,
  academicNotificationCacheOwner,
  academicNotificationTemplateTag,
} from './request-context';

import type { AcademicNotificationCacheIdentity } from './types';
import type { PagedResultDto } from '../communication/communicationTypes';
import type {
  AcademicNotificationTemplate,
  AcademicNotificationTemplateTest,
  CreateAcademicNotificationTemplate,
  AcademicNotificationTemplatePreview,
  AcademicNotificationTemplateRevisionCommand,
} from './template-types';

type TemplateRequest = AcademicNotificationCacheIdentity & { templateId: string };
type RevisionCommand = TemplateRequest & { command: AcademicNotificationTemplateRevisionCommand };
type ListRequest = AcademicNotificationCacheIdentity & {
  eventKey: string;
  academicMediumId?: string;
  search?: string;
  skipCount: number;
  maxResultCount: number;
};

const root = `${academicNotificationsRoot}/templates`;

function templateUrl(templateId: string) {
  return `${root}/${encodeURIComponent(templateId)}`;
}

function ownerTag(identity: AcademicNotificationCacheIdentity) {
  return { type: academicNotificationTemplateTag, id: academicNotificationCacheOwner(identity) };
}

function invalidateOnSuccess(_: unknown, error: unknown, identity: AcademicNotificationCacheIdentity) {
  return error ? [] : [ownerTag(identity)];
}

export const academicNotificationTemplateApi = api.enhanceEndpoints({ addTagTypes: [academicNotificationTemplateTag] }).injectEndpoints({
  endpoints: (builder) => ({
    academicNotificationTemplates: builder.query<PagedResultDto<AcademicNotificationTemplate>, ListRequest>({
      query: ({ tenantCacheKey, userCacheKey, ...params }) => ({
        url: root,
        params,
        expectedSessionOwner: academicNotificationCacheOwner({ tenantCacheKey, userCacheKey }),
      }),
      providesTags: (_, __, identity) => [ownerTag(identity)],
    }),
    academicNotificationTemplateHistory: builder.query<AcademicNotificationTemplate[], TemplateRequest>({
      query: ({ templateId, ...identity }) => ({
        url: `${templateUrl(templateId)}/history`, expectedSessionOwner: academicNotificationCacheOwner(identity),
      }),
      providesTags: (_, __, identity) => [ownerTag(identity)],
    }),
    academicNotificationTemplatePreview: builder.query<
      AcademicNotificationTemplatePreview, TemplateRequest & { revisionId: string }
    >({
      query: ({ templateId, revisionId, ...identity }) => ({
        url: `${templateUrl(templateId)}/preview/${encodeURIComponent(revisionId)}`,
        expectedSessionOwner: academicNotificationCacheOwner(identity),
      }),
      providesTags: (_, __, identity) => [ownerTag(identity)],
    }),
    createAcademicNotificationTemplate: builder.mutation<
      AcademicNotificationTemplate, AcademicNotificationCacheIdentity & { command: CreateAcademicNotificationTemplate }
    >({
      query: ({ command, ...identity }) => ({
        url: root, method: 'POST', body: command, expectedSessionOwner: academicNotificationCacheOwner(identity),
      }),
      invalidatesTags: invalidateOnSuccess,
    }),
    updateAcademicNotificationTemplateDraft: builder.mutation<
      AcademicNotificationTemplate, RevisionCommand & { command: { subject: string; body: string } }
    >({
      query: ({ templateId, command, ...identity }) => ({
        url: `${templateUrl(templateId)}/draft`, method: 'PUT', body: command,
        expectedSessionOwner: academicNotificationCacheOwner(identity),
      }),
      invalidatesTags: invalidateOnSuccess,
    }),
    publishAcademicNotificationTemplate: builder.mutation<AcademicNotificationTemplate, RevisionCommand>({
      query: ({ templateId, command, ...identity }) => ({
        url: `${templateUrl(templateId)}/publish`, method: 'POST', body: command,
        expectedSessionOwner: academicNotificationCacheOwner(identity),
      }),
      invalidatesTags: invalidateOnSuccess,
    }),
    restoreAcademicNotificationTemplateDefault: builder.mutation<
      AcademicNotificationTemplate, TemplateRequest & { command: { headerConcurrencyStamp: string } }
    >({
      query: ({ templateId, command, ...identity }) => ({
        url: `${templateUrl(templateId)}/restore-default`, method: 'POST', body: command,
        expectedSessionOwner: academicNotificationCacheOwner(identity),
      }),
      invalidatesTags: invalidateOnSuccess,
    }),
    deleteAcademicNotificationTemplateDraft: builder.mutation<void, RevisionCommand>({
      query: ({ templateId, command, ...identity }) => ({
        url: `${templateUrl(templateId)}/draft`, method: 'DELETE', body: command,
        expectedSessionOwner: academicNotificationCacheOwner(identity),
      }),
      invalidatesTags: invalidateOnSuccess,
    }),
    testSendAcademicNotificationTemplate: builder.mutation<AcademicNotificationTemplateTest, RevisionCommand>({
      query: ({ templateId, command, ...identity }) => ({
        url: `${templateUrl(templateId)}/test-send`, method: 'POST', body: command,
        expectedSessionOwner: academicNotificationCacheOwner(identity),
      }),
    }),
  }),
});

export const {
  useAcademicNotificationTemplatesQuery,
  useAcademicNotificationTemplateHistoryQuery,
  useLazyAcademicNotificationTemplatePreviewQuery,
  useCreateAcademicNotificationTemplateMutation,
  useUpdateAcademicNotificationTemplateDraftMutation,
  usePublishAcademicNotificationTemplateMutation,
  useRestoreAcademicNotificationTemplateDefaultMutation,
  useDeleteAcademicNotificationTemplateDraftMutation,
  useTestSendAcademicNotificationTemplateMutation,
} = academicNotificationTemplateApi;
