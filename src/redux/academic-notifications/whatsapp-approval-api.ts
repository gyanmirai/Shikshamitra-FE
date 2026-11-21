import { api } from '../service';
import { academicNotificationCacheOwner } from './request-context';

import type { AcademicNotificationCacheIdentity } from './types';

export enum WhatsAppApprovalStatus {
  Draft,
  PendingApproval,
  Approved,
  Rejected,
  Paused,
  Disabled,
}

interface WhatsAppTemplateRevision {
  templateId: string;
  revisionId: string;
}

interface WhatsAppTemplateBinding extends WhatsAppTemplateRevision {
  id: string;
  providerSettingId: string;
  providerTemplateName: string;
  languageCode: string;
  providerTemplateId: string | null;
  providerStatus: WhatsAppApprovalStatus;
  lastSyncedAt: string | null;
}

export interface WhatsAppApprovalContext {
  providerSettingId: string | null;
  binding: WhatsAppTemplateBinding | null;
  bindingMatchesProvider: boolean;
}

const root = '/communication/notifications/providers/whatsapp/templates';

export const whatsAppApprovalApi = api.injectEndpoints({
  endpoints: (builder) => ({
    academicWhatsAppApproval: builder.query<WhatsAppApprovalContext, AcademicNotificationCacheIdentity & WhatsAppTemplateRevision>({
      query: ({ templateId, revisionId, ...identity }) => ({
        url: `${root}/context`, params: { templateId, revisionId },
        expectedSessionOwner: academicNotificationCacheOwner(identity),
      }),
    }),
    linkAcademicWhatsAppTemplate: builder.mutation<WhatsAppTemplateBinding, AcademicNotificationCacheIdentity & {
      command: WhatsAppTemplateRevision & { providerSettingId: string; providerTemplateName: string };
    }>({
      query: ({ command, ...identity }) => ({
        url: root, method: 'POST', body: command, expectedSessionOwner: academicNotificationCacheOwner(identity),
      }),
    }),
    updateAcademicWhatsAppApproval: builder.mutation<WhatsAppTemplateBinding, AcademicNotificationCacheIdentity & {
      bindingId: string;
      action: 'submit' | 'sync';
    }>({
      query: ({ bindingId, action, ...identity }) => ({
        url: `${root}/${encodeURIComponent(bindingId)}/${action}`, method: 'POST',
        expectedSessionOwner: academicNotificationCacheOwner(identity),
      }),
    }),
  }),
});

export const {
  useAcademicWhatsAppApprovalQuery,
  useLinkAcademicWhatsAppTemplateMutation,
  useUpdateAcademicWhatsAppApprovalMutation,
} = whatsAppApprovalApi;
