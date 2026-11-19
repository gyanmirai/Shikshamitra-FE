import { randomUUID } from 'node:crypto';
import { paged } from './data.mjs';

const root = '/api/academic/notifications/templates';

export function createNotificationTemplatesFixture() {
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
      const draft = {
        ...content, templateId, revisionId: randomUUID(), revision: (current?.revision ?? 0) + 1,
        schemaVersion: 1, contentHash: 'fixture', isCurrent: true, isPublished: false, isRetired: false,
        isDeleted: false, concurrencyStamp: randomUUID(), headerConcurrencyStamp: randomUUID(),
        publishedAt: null, publishedByUserId: null,
      };
      templates.set(templateId, [draft, ...history]);
      send(200, draft);
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
      else send(200, {
        isSynthetic: true,
        rendered: {
          isSuccess: true, subject: revision.subject, body: revision.body.replaceAll('{{student_name}}', 'Sample Student'),
          contentHash: revision.contentHash, linkUrl: null, errorCode: null,
        },
      });
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
