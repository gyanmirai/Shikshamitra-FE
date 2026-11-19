import { randomUUID } from 'node:crypto';
import { paged } from './data.mjs';
import { createNotificationTemplatesFixture } from './notification-templates.mjs';

const root = '/api/academic/notifications';
const eventKey = 'Academic.Homework.Published';
const templateId = '11111111-0000-4111-8111-111111111111';
const parentRule = {
  id: 'school-rule', eventKey, scope: {}, enabled: false, revision: 1,
  concurrencyStamp: 'school-stamp', configuration: null,
};

export function createNotificationRulesFixture() {
  let rule;
  const writes = [];
  const templateRequests = createNotificationTemplatesFixture();
  return {
    writes,
    handle(url, method, body, send) {
      if (url.pathname === `${root}/catalogue` && method === 'GET') {
        send(200, {
          events: [{
            definition: {
              eventKey, category: 'Homework', sourceType: 'Academic.Homework',
              linkBuilderKey: 'Academic.Homework', schemaVersion: 1, triggerType: 0, deliveryProfile: 0,
              recipientSelectors: ['PrimaryGuardian', 'AdditionalGuardians', 'StudentAccount'],
              supportedChannels: [3, 2, 0, 4],
              variables: [{ key: 'student_name', type: 0, required: true, sensitivity: 1 }],
              materialChangeFields: [], allowsQuietHoursBypass: false,
            },
            availability: { isAvailable: true, reasonCode: null },
          }],
          channels: [{ channel: 3, isConfigured: true }, { channel: 2, isConfigured: false }],
        });
      } else if (url.pathname === `${root}/rules` && method === 'GET') {
        const keys = ['academicYearId', 'boardId', 'mediumId', 'classId', 'divisionId'];
        const requestedScope = Object.fromEntries(keys.flatMap((key) => url.searchParams.has(key) ? [[key, url.searchParams.get(key)]] : []));
        send(200, paged([{ eventKey, requestedScope, effectiveRule: rule ?? parentRule, isInherited: !rule }]));
      } else if (url.pathname === `${root}/templates/options` && method === 'GET') {
        send(200, paged([{
          templateId, revisionId: 'published-revision', templateName: 'Homework notice',
          recipientKind: 'Guardian', channel: 3, languageCode: 'en', academicMediumId: null,
        }]));
      } else if (url.pathname === `${root}/rules/${eventKey}` && method === 'PUT') {
        if (body.concurrencyStamp !== rule?.concurrencyStamp) {
          send(409, { title: 'Rule changed' });
          return true;
        }
        writes.push(body);
        const { scope, enabled, timing, quietHours, ...settings } = body;
        rule = {
          id: 'scope-rule', eventKey, scope, enabled, revision: (rule?.revision ?? 0) + 1,
          concurrencyStamp: randomUUID(),
          configuration: {
            ...settings, schemaVersion: 1,
            timing: { ...timing, quietHoursEnabled: quietHours.enabled, quietStart: quietHours.start,
              quietEnd: quietHours.end, bypassQuietHours: quietHours.bypass },
          },
        };
        send(200, rule);
      } else return templateRequests(url, method, body, send);
      return true;
    },
  };
}
