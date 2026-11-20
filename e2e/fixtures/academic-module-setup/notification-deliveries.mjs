import { paged } from './data.mjs';

const self = '/api/communication/notifications/me';
const academic = '/api/academic/notifications';
const creator = 'synthetic-host-user';
const deliveredAt = '2026-10-20T08:30:00Z';
export const notificationOperationId = '5d643be1-59a9-4d91-a7b1-7dbd9b673011';
const source = {
  eventKey: 'Academic.Homework.Published',
  sourceType: 'Academic.Homework',
  sourceId: '5d643be1-59a9-4d91-a7b1-7dbd9b673012',
};
const inboxItem = {
  id: '5d643be1-59a9-4d91-a7b1-7dbd9b673013',
  title: 'Homework notice',
  body: 'The synthetic class has new homework.',
  relativeLink: '/academic/dashboard',
  creationTime: deliveredAt,
  readAt: null,
  acknowledgedAt: null,
};
const history = [3, 7].map((status, index) => ({
  operationId: notificationOperationId,
  dispatchId: `5d643be1-59a9-4d91-a7b1-7dbd9b67302${index}`,
  attemptId: null,
  recipientSnapshotId: null,
  recipientKind: 'Guardian',
  channel: index === 0 ? 3 : 2,
  status,
  attemptNumber: 1,
  recordedAt: deliveredAt,
  acceptedAt: null,
  deliveredAt: index === 0 ? deliveredAt : null,
  readAt: null,
  reasonCode: index === 0 ? null : 'SmtpAcceptanceUnknown',
}));

const rejected = {
  ...history[1], dispatchId: '5d643be1-59a9-4d91-a7b1-7dbd9b673030',
  attemptId: '5d643be1-59a9-4d91-a7b1-7dbd9b673031', status: 5, attemptNumber: 5,
  reasonCode: 'SmtpTemporaryRejection', canRequestRetry: true,
};

export function createNotificationDeliveriesFixture(enabled = false, retry = undefined) {
  let item = { ...inboxItem };
  let rows = retry ? [...history, rejected] : history;
  return (url, method, owner, send) => {
    const path = url.pathname;
    const ownsInbox = enabled && owner === creator;
    if (path === `${self}/unread-count` && method === 'GET' && owner) {
      send(200, { unreadCount: ownsInbox && !item.readAt ? 1 : 0 });
    } else if (path === `${self}/inbox` && method === 'GET' && owner) {
      const unreadOnly = url.searchParams.get('unreadOnly') === 'true';
      send(200, paged(ownsInbox && (!unreadOnly || !item.readAt) ? [item] : []));
    } else if (path.startsWith(`${self}/inbox/`) && method === 'POST' && owner) {
      if (!ownsInbox) send(404, {});
      else if (path === `${self}/inbox/${item.id}/read`) {
        item = { ...item, readAt: deliveredAt };
        send(200, item);
      } else if (path === `${self}/inbox/${item.id}/acknowledge`) {
        item = { ...item, readAt: deliveredAt, acknowledgedAt: deliveredAt };
        send(200, item);
      } else send(404, {});
    } else if (enabled && owner && path === `${academic}/operations/${notificationOperationId}` && method === 'GET') {
      send(200, {
        ...source, operationId: notificationOperationId, status: 7, approvalRequired: false,
        createdAt: deliveredAt, publishedAt: null, scheduledAt: null, approvedAt: null,
        excludedBeforeDispatch: 0, intents: [],
        deliveries: [...new Map(rows.map((row) => [row.dispatchId, row])).values()]
          .map(({ channel, status }) => ({ channel, status, count: 1 })),
      });
    } else if (enabled && owner && path === `${academic}/history` && method === 'GET') {
      if (Object.entries(source).some(([key, value]) => url.searchParams.get(key) !== value)) send(403, {});
      else {
        const filter = url.searchParams.get('state');
        send(200, paged(filter === null ? rows : rows.filter((row) => row.status === Number(filter))));
      }
    } else if (enabled && retry && owner && path === `${academic}/dispatches/${rejected.dispatchId}/retry` && method === 'POST') {
      if (url.searchParams.get('expectedAttemptId') !== rejected.attemptId) { send(400, {}); return true; }
      rows = rows.map((row) => row === rejected ? { ...row, canRequestRetry: false } : row);
      if (retry === 'conflict') {
        send(409, { errorCode: 'Communication:Notification:RetryRequiresReview' });
      } else {
        rows = [...rows, { ...rejected, attemptId: null, attemptNumber: 6, status: 0, canRequestRetry: false }];
        send(200, { operationId: notificationOperationId, dispatchId: rejected.dispatchId, status: 0, nextAttemptAt: deliveredAt });
      }
    } else return false;
    return true;
  };
}
