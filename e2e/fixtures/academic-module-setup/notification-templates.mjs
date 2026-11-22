import { randomUUID } from 'node:crypto';
import { paged } from './data.mjs';

const root = '/api/academic/notifications/templates';

function makeDraft(content, templateId, revision) {
  return {
    ...content, templateId, revisionId: randomUUID(), revision,
    schemaVersion: 1, contentHash: 'fixture', isCurrent: true, isPublished: false, isRetired: false,
    isDeleted: false, concurrencyStamp: randomUUID(), headerConcurrencyStamp: randomUUID(),
    publishedAt: null, publishedByUserId: null,
  };
}

function samplePreview(message) {
  const substitute = (value) => value.replaceAll('{{student_name}}', 'Sample Student');
  return {
    isSynthetic: true,
    rendered: {
      isSuccess: true, subject: substitute(message.subject), body: substitute(message.body),
      contentHash: message.contentHash ?? 'fixture', linkUrl: null, errorCode: null,
    },
  };
}

export function createNotificationTemplatesFixture(queueTemplateTest) {
  const templates = new Map();
  return (url, method, input, send) => {
    if (url.pathname === root && method === 'GET') {
      const eventKey = url.searchParams.get('eventKey');
      const mediumId = url.searchParams.get('academicMediumId');
      send(200, paged(Array.from(templates.values()).map(([current]) => current).filter((template) =>
        template.eventKey === eventKey && (!template.academicMediumId || template.academicMediumId === mediumId)
      )));
      return true;
    }

    if (url.pathname === root && method === 'POST') {
      const { existingTemplateId, headerConcurrencyStamp, ...content } = input;
      const templateId = existingTemplateId ?? randomUUID();
      const history = templates.get(templateId) ?? [];
      const current = history[0];
      if (existingTemplateId && current?.headerConcurrencyStamp !== headerConcurrencyStamp) {
        send(409, { title: 'Template changed' });
        return true;
      }
      if (current) current.isCurrent = false;
      const draft = makeDraft(content, templateId, (current?.revision ?? 0) + 1);
      templates.set(templateId, [draft, ...history]);
      send(200, draft);
      return true;
    }

    if (url.pathname === `${root}/initialize-defaults` && method === 'POST') {
      if (input.eventKey !== 'Academic.Homework.Published') {
        send(400, { title: 'Unknown fixture event' });
        return true;
      }
      let added = 0;
      for (const [channel, suffix] of [[2, 'email'], [3, 'in-app']]) {
        const id = `homework-starter-${channel}`;
        if (templates.has(id)) continue;
        templates.set(id, [makeDraft({
          eventKey: input.eventKey, academicMediumId: null, recipientKind: 'Guardian',
          channel, languageCode: 'en', templateName: `Homework starter (${suffix})`,
          subject: 'Homework published', body: 'Homework for {{student_name}}',
        }, id, 1)]);
        added += 1;
      }
      send(200, added);
      return true;
    }

    if (url.pathname === `${root}/preview` && method === 'POST') {
      send(200, samplePreview(input));
      return true;
    }

    if (!url.pathname.startsWith(`${root}/`)) return false;
    const [id, action, revisionId] = url.pathname.slice(root.length + 1).split('/');
    const history = templates.get(id);
    if (!history) return false;
    if (action === 'history' && method === 'GET') {
      send(200, history);
      return true;
    }
    if (action === 'preview' && method === 'GET') {
      const revision = history.find((item) => item.revisionId === revisionId);
      if (!revision) send(404, {});
      else send(200, samplePreview(revision));
      return true;
    }
    if (action === 'test-send' && method === 'POST' && queueTemplateTest) {
      const current = history[0];
      if (input.revisionId !== current.revisionId || input.concurrencyStamp !== current.concurrencyStamp) {
        send(409, { title: 'Template changed' });
      } else {
        send(202, queueTemplateTest(current));
      }
      return true;
    }
    if (action !== 'publish' && action !== 'draft') return false;
    const current = history[0];
    if (current.isPublished || input.revisionId !== current.revisionId || input.concurrencyStamp !== current.concurrencyStamp) {
      send(409, { title: 'Template changed' });
      return true;
    }
    if (action === 'publish' && method === 'POST') {
      history.slice(1).filter((item) => item.isPublished).forEach((item) => { item.isRetired = true; });
      current.isPublished = true;
      current.publishedAt = new Date().toISOString();
    } else if (action === 'draft' && method === 'PUT') {
      current.subject = input.subject;
      current.body = input.body;
    } else return false;
    current.concurrencyStamp = randomUUID();
    current.headerConcurrencyStamp = randomUUID();
    send(200, current);
    return true;
  };
}
