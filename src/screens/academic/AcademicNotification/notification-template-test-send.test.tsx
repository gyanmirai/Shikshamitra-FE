import type { AcademicNotificationTemplate } from 'src/redux/academic-notifications/template-types';

import { it, vi, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CommunicationChannelType } from 'src/redux/communication/communicationTypes';

import { templateActionError } from './use-notification-template-form';
import { NotificationTemplateActions } from './Components/notification-template-actions';

const mocks = vi.hoisted(() => ({
  testSend: vi.fn(), result: { data: undefined as unknown }, device: vi.fn(), active: vi.fn(), onError: vi.fn(),
}));

vi.mock('src/hooks/notifications/web-push-device', async (importOriginal) => ({
  ...await importOriginal<typeof import('src/hooks/notifications/web-push-device')>(),
  readPushDevice: mocks.device,
  isCurrentPushOwner: mocks.active,
}));

vi.mock('src/redux/academic-notifications/template-api', () => ({
  usePublishAcademicNotificationTemplateMutation: () => [vi.fn()],
  useRestoreAcademicNotificationTemplateDefaultMutation: () => [vi.fn()],
  useDeleteAcademicNotificationTemplateDraftMutation: () => [vi.fn()],
  useTestSendAcademicNotificationTemplateMutation: () => [mocks.testSend, mocks.result],
}));

const template: AcademicNotificationTemplate = {
  eventKey: 'Academic.Homework.Published', templateId: 'template', revisionId: 'revision',
  templateName: 'Homework notice', recipientKind: 'Guardian', languageCode: 'en', academicMediumId: null,
  channel: CommunicationChannelType.WebPush, revision: 1, subject: '', body: 'Homework notice',
  schemaVersion: 1, contentHash: 'hash', isPublished: true, isRetired: false, isCurrent: true,
  concurrencyStamp: 'revision-stamp', headerConcurrencyStamp: 'template-stamp',
  publishedAt: '2026-11-20T09:30:00Z', publishedByUserId: 'staff', isDeleted: false,
};

function openTest(
  channel: AcademicNotificationTemplate['channel'] = CommunicationChannelType.WebPush,
  queueStatus?: { isQueueWorkerEnabled: boolean }
) {
  render(<NotificationTemplateActions identity={{ tenantCacheKey: 'school', userCacheKey: 'staff' }}
    template={{ ...template, channel }} queueStatus={queueStatus} canManage canDelete disabled={false} testDisabled={false} busy={false}
    onBusy={vi.fn()} onSaved={vi.fn()} onDeleted={vi.fn()} onError={mocks.onError} />);
  fireEvent.click(screen.getByRole('button', { name: 'Send test' }));
  return screen.getByRole('button', { name: 'Queue test send' });
}

beforeEach(() => {
  vi.resetAllMocks();
  mocks.result.data = undefined;
  mocks.active.mockReturnValue(true);
  mocks.device.mockReturnValue({ owner: 'school:staff', id: 'browser-id' });
  mocks.testSend.mockReturnValue({ unwrap: () => Promise.resolve() });
});

it('warns before queueing an In-app test while delivery is paused', () => {
  expect(openTest(CommunicationChannelType.InApp, { isQueueWorkerEnabled: false })).toBeEnabled();
  expect(screen.getByRole('dialog')).toHaveTextContent('Notification processing is paused on this server.');
  expect(screen.getByRole('dialog')).toHaveTextContent(/expire before delivery/i);
});

it('includes the deadline and history link after queueing a test', async () => {
  mocks.result.data = {
    isSynthetic: true, operationId: 'test-operation', expiresAt: '2026-11-24T09:40:00Z',
  };
  const confirm = openTest(CommunicationChannelType.InApp, { isQueueWorkerEnabled: false });
  fireEvent.click(confirm);
  await screen.findByRole('button', { name: 'Send test' });
  expect(screen.getByRole('status')).toHaveTextContent(/delivery must start by/i);
  expect(screen.getByRole('status')).toHaveTextContent('Notification processing is paused on this server.');
  expect(screen.getByRole('link', { name: 'Delivery History' })).toHaveAttribute(
    'href', expect.stringContaining('operation=test-operation')
  );
});

it('confirms this browser and sends its selected subscription ID', async () => {
  const confirm = openTest();
  expect(screen.getByRole('dialog')).toHaveTextContent(/this browser/i);
  fireEvent.click(confirm);
  expect(mocks.testSend).toHaveBeenCalledWith(expect.objectContaining({
    command: { revisionId: 'revision', concurrencyStamp: 'revision-stamp', webPushSubscriptionId: 'browser-id' },
  }));
  await screen.findByRole('button', { name: 'Send test' });
});

it('directs an unenrolled browser to the bell before test send', () => {
  mocks.device.mockReturnValue({ owner: 'school:another-user', id: 'browser-id' });
  expect(openTest()).toBeDisabled();
  expect(screen.getByRole('dialog')).toHaveTextContent(/enable browser notifications from the bell/i);
  expect(mocks.testSend).not.toHaveBeenCalled();
});

it('requires reconfirmation if this browser changes after opening the dialog', () => {
  const confirm = openTest();
  mocks.device.mockReturnValue({ owner: 'school:staff', id: 'replacement' });
  fireEvent.click(confirm);
  expect(mocks.testSend).not.toHaveBeenCalled();
  expect(mocks.onError).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringMatching(/reopen/i) }), expect.any(String));
});

it('keeps the existing test request for email', async () => {
  fireEvent.click(openTest(CommunicationChannelType.Email));
  expect(mocks.testSend).toHaveBeenCalledWith(expect.objectContaining({
    command: { revisionId: 'revision', concurrencyStamp: 'revision-stamp' },
  }));
  await screen.findByRole('button', { name: 'Send test' });
});

it.each(['WebPushSubscriptionUnavailable', 'WebPushTestDeviceSelectionRequired'])(
  'gives actionable enrollment guidance for %s', (code) => {
    expect(templateActionError({ status: 403, data: { error: { code, message: 'Business rule violated.' } } }, 'Fallback'))
      .toMatch(/enable browser notifications from the bell/i);
  }
);
