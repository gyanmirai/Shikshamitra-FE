const root = '/api/communication/notifications/providers/whatsapp/templates';
const providerSettingId = '60000000-0000-4000-8000-000000000001';
const bindingId = '60000000-0000-4000-8000-000000000002';

export function createWhatsAppApprovalFixture() {
  let revision;
  let binding = null;
  const writes = [];
  return {
    writes,
    handle(url, method, body, send) {
      if (url.pathname === `${root}/context` && method === 'GET') {
        revision = { templateId: url.searchParams.get('templateId'), revisionId: url.searchParams.get('revisionId') };
        send(200, { providerSettingId, binding, bindingMatchesProvider: binding !== null });
      } else if (url.pathname === root && method === 'POST') {
        if (body.providerSettingId !== providerSettingId || body.templateId !== revision?.templateId ||
            body.revisionId !== revision.revisionId) {
          send(409, { title: 'Template context changed' });
          return true;
        }
        writes.push({ action: 'link', ...body });
        binding = { ...body, id: bindingId, languageCode: 'en_US', providerStatus: 0, providerTemplateId: null, lastSyncedAt: null };
        send(200, binding);
      } else if (binding && method === 'POST' && [`${root}/${bindingId}/submit`, `${root}/${bindingId}/sync`].includes(url.pathname)) {
        const action = url.pathname.endsWith('/submit') ? 'submit' : 'sync';
        writes.push({ action, bindingId });
        binding = { ...binding, providerStatus: action === 'submit' ? 1 : 2, providerTemplateId: '3001',
          lastSyncedAt: new Date().toISOString() };
        send(200, binding);
      } else return false;
      return true;
    },
  };
}
