import { randomUUID } from 'node:crypto';
import { paged } from './data.mjs';

const root = '/api/academic/notifications';
const personal = '/api/communication/notifications/me';
const owner = 'synthetic-host-user';
const sourceType = 'Academic.NotificationTemplateTest';

export function createNotificationTemplateTestFixture() {
  let template;
  let operationId;
  let recordedAt;
  let expiresAt;
  let delivered = false;
  let itemId;

  return {
    queue(current) {
      template = current;
      operationId = randomUUID();
      itemId = randomUUID();
      const now = Date.now();
      recordedAt = new Date(now).toISOString();
      expiresAt = new Date(now + 10 * 60_000).toISOString();
      delivered = false;
      return { operationId, status: 4, channel: template.channel, isSynthetic: true, expiresAt };
    },
    deliver() {
      if (!operationId) return false;
      delivered = true;
      return true;
    },
    handle(url, method, account, send) {
      if (method !== 'GET' || account !== owner) return false;
      if (url.pathname === `${personal}/unread-count`) {
        send(200, { unreadCount: delivered ? 1 : 0 });
      } else if (url.pathname === `${personal}/inbox`) {
        send(200, paged(delivered ? [{
          id: itemId, title: `[Test] ${template.subject}`, body: template.body.replaceAll('{{student_name}}', 'Sample Student'),
          relativeLink: null, creationTime: recordedAt, readAt: null, acknowledgedAt: null,
        }] : []));
      } else if (operationId && url.pathname === `${root}/operations/${operationId}`) {
        send(200, {
          operationId, status: delivered ? 6 : 4, eventKey: template.eventKey, sourceType, sourceId: template.templateId,
          isSynthetic: true, templateTestExpiresAt: expiresAt, templateTestExpiredBeforeDelivery: false,
          approvalRequired: false, createdAt: recordedAt, publishedAt: recordedAt,
          scheduledAt: null, approvedAt: null, intents: [], excludedBeforeDispatch: 0,
          deliveries: [{ channel: template.channel, status: delivered ? 3 : 0, count: 1 }],
        });
      } else if (operationId && url.pathname === `${root}/history` && url.searchParams.get('operationId') === operationId &&
        url.searchParams.get('sourceType') === sourceType && url.searchParams.get('sourceId') === template.templateId &&
        url.searchParams.get('eventKey') === template.eventKey) {
        send(200, paged([{
          operationId, dispatchId: itemId, attemptId: null, recipientSnapshotId: null, recipientKind: 'TestAccount',
          channel: template.channel, status: delivered ? 3 : 0, attemptNumber: delivered ? 1 : null,
          recordedAt, acceptedAt: delivered ? recordedAt : null, deliveredAt: delivered ? recordedAt : null,
          readAt: null, reasonCode: null,
        }]));
      } else return false;
      return true;
    },
  };
}
