import { ids, paged } from './data.mjs';

const root = '/api/academic/notifications';
const owner = 'synthetic-host-user';
const studentId = 'a43c43cc-bbcf-43a5-9111-1260ba985601';
const subjectId = 'a43c43cc-bbcf-43a5-9111-1260ba985602';
const source = {
  sourceType: 'Academic.Homework',
  eventKey: 'Academic.Homework.Due',
  sourceId: 'a43c43cc-bbcf-43a5-9111-1260ba985603',
};
const reviewToken = 'a43c43cc-bbcf-43a5-9111-1260ba985604';
const operationId = 'a43c43cc-bbcf-43a5-9111-1260ba985605';
const task = { id: source.sourceId, title: 'Fraction practice', status: 1, submissionType: 0, evaluationRequired: true };
const definition = {
  eventKey: source.eventKey, sourceType: source.sourceType, category: 'Homework',
  linkBuilderKey: source.sourceType, schemaVersion: 1, triggerType: 1, deliveryProfile: 0,
  recipientSelectors: ['PrimaryGuardian', 'AdditionalGuardians', 'StudentAccount'],
  supportedChannels: [3, 2, 0, 4], variables: [], materialChangeFields: [], allowsQuietHoursBypass: false,
};

export const manualNotificationPermissions = [
  'Academics.Notification.View',
  'Academics.Notification.Send',
  'Academics.HomeworkAndAssignment.AssessmentAndFeedback.View',
];

export function createManualNotificationFixture() {
  const writes = { previews: [], confirmations: [] };
  return {
    writes,
    handle(url, method, body, caller, send) {
      if (caller !== owner) return false;
      const path = url.pathname;
      if (method === 'GET' && path === `/api/academics/curriculum/${ids.standard}/subject-assignments`) {
        send(200, { data: paged([{ id: 'subject-assignment', status: 1, subjects: [{ subjectId, subjectName: 'Mathematics' }] }]) });
      } else if (method === 'GET' && path === '/api/academic/homeworks') {
        send(200, paged([task]));
      } else if (method === 'GET' && path === '/api/homework/submissions') {
        send(200, { data: [{
          id: '00000000-0000-0000-0000-000000000000', studentId, studentName: 'Sample Learner',
          status: 0, rollNumber: 4, submissionType: 0, dueDate: '2027-04-21T12:00:00Z',
        }] });
      } else if (method === 'GET' && path === `${root}/catalogue`) {
        send(200, {
          events: [{ definition,
            availability: { isAvailable: false, reasonCode: 'Communication:Notification:SourceUnavailable' },
            manualAvailability: { isAvailable: true, reasonCode: null } }],
          channels: definition.supportedChannels.map((channel) => ({ channel, isConfigured: channel === 3 || channel === 2 })),
        });
      } else if (method === 'POST' && path === `${root}/manual/preview`) {
        if (Object.entries(source).some(([key, value]) => body[key] !== value) ||
          body.selectedRecipients?.length !== 1 || body.selectedRecipients[0].studentId !== studentId ||
          body.selectedRecipients[0].kind !== 'Student' || !body.channels?.includes(3)) {
          send(403, {});
          return true;
        }
        writes.previews.push(body);
        send(200, {
          reviewToken, expiresAt: new Date(Date.now() + 600000).toISOString(), eligibleRecipientCount: 1, requiresApproval: false,
          channels: body.channels.map((channel) => ({
            channel, eligibleRecipientCount: 1, readyDeliveryCount: channel === 3 ? 1 : 0,
            exclusions: channel === 2 ? [{ code: 'EmailMissing', count: 1 }] : [],
          })),
          samples: [{ templateId: 'template', revisionId: 'revision', recipientKind: 'Guardian', channel: 3, languageCode: 'en',
            isSynthetic: true, rendered: { isSuccess: true, subject: 'Homework due soon', body: 'Fraction practice is due tomorrow.' } }],
          blockingIssues: [],
        });
      } else if (method === 'POST' && path === `${root}/manual/send`) {
        if (!writes.previews.length || body.reviewToken !== reviewToken || !body.idempotencyKey ||
          Object.keys(body).some((key) => !['reviewToken', 'idempotencyKey'].includes(key))) {
          send(409, {});
          return true;
        }
        writes.confirmations.push(body);
        send(202, { operationId, status: 4 });
      } else if (method === 'GET' && path === `${root}/operations/${operationId}` && writes.confirmations.length) {
        send(200, {
          ...source, operationId, status: 4, approvalRequired: false, createdAt: new Date().toISOString(),
          publishedAt: null, scheduledAt: null, approvedAt: null, excludedBeforeDispatch: 0, intents: [], deliveries: [],
        });
      } else if (method === 'GET' && path === `${root}/history` && url.searchParams.get('operationId') === operationId) {
        send(200, paged([]));
      } else return false;
      return true;
    },
  };
}
