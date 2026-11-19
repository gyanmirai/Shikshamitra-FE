import type { AcademicNotificationCacheIdentity } from './types';

export const academicNotificationsRoot = '/academic/notifications';
export const academicNotificationTemplateTag = 'AcademicNotificationTemplate' as const;

export function academicNotificationCacheOwner({ tenantCacheKey, userCacheKey }: AcademicNotificationCacheIdentity) {
  return `${tenantCacheKey}:${userCacheKey}`;
}
