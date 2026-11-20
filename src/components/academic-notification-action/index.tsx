'use client';

import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { hasGrantedPermission } from 'src/utils/permissions';
import { academicNotificationPermissions } from 'src/constants/academic-menu';
import { CommunicationChannelType } from 'src/redux/communication/communicationTypes';
import { notificationRecordId } from 'src/redux/academic-notifications/delivery-adapters';
import { useAcademicNotificationCatalogueQuery } from 'src/redux/academic-notifications/api';
import { academicNotificationCacheOwner } from 'src/redux/academic-notifications/request-context';

import { AcademicNotificationPreviewDialog } from './preview-dialog';

import type { AcademicNotificationActionProps, AcademicNotificationActionContext } from './preview-dialog';

export function useAcademicNotificationActionContext(eventKey: string, sourceId?: string | null): AcademicNotificationActionContext | undefined {
  const { user, sessionContext, permissions, permissionsInitialized } = useSelector((state: RootState) => state.auth);
  const identity = { userCacheKey: user?.sub ?? '', tenantCacheKey: sessionContext?.tenantId ?? '' };
  const savedSourceId = notificationRecordId(sourceId ?? null);
  const allowed = permissionsInitialized && Boolean(identity.userCacheKey && identity.tenantCacheKey && savedSourceId) &&
    hasGrantedPermission(permissions, academicNotificationPermissions.view) &&
    hasGrantedPermission(permissions, academicNotificationPermissions.send);
  const catalogue = useAcademicNotificationCatalogueQuery(identity, {
    skip: !allowed, refetchOnMountOrArgChange: true,
  });
  const data = catalogue.currentData;
  const event = data?.events.find((entry) => entry.definition.eventKey === eventKey);
  const availability = event?.manualAvailability ?? event?.availability;
  if (!allowed || !savedSourceId || catalogue.isError || !data || !event || !availability?.isAvailable ||
    !event.definition.supportedChannels.includes(CommunicationChannelType.InApp) ||
    !data.channels.some((option) => option.channel === CommunicationChannelType.InApp && option.isConfigured)) return undefined;
  return {
    identity,
    source: { eventKey, sourceId: savedSourceId, sourceType: event.definition.sourceType },
    options: event.definition.supportedChannels.map((channel) => ({
      channel, configured: data.channels.some((option) => option.channel === channel && option.isConfigured),
    })),
  };
}

export function AcademicNotificationAction(props: AcademicNotificationActionProps) {
  const { context, selectedRecipients, choices } = props;
  if (!choices && !selectedRecipients.length) return null;
  const key = JSON.stringify([academicNotificationCacheOwner(context.identity), context.source, context.options, selectedRecipients]);
  return <AcademicNotificationPreviewDialog key={key} {...props} />;
}
