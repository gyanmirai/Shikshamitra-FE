import { it, vi, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { act, waitFor, renderHook } from '@testing-library/react';
import { mapLibraryNotificationSettingsDto } from 'src/redux/library/library-adapters';

import { useNotificationComposer } from './useNotificationComposer';
import { notificationWrapper, notificationSettings } from '../notification-test-fixture';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
});
vi.mock('next-auth/react', () => ({ getSession: async () => null, signOut: vi.fn() }));
const member = {
  id: 'canonical-student-id',
  memberIdentifier: 'CARD-42',
  memberName: 'Asha',
  role: 0 as const,
  isActiveMembership: true,
  hasRecoverableObligation: false,
  isEligibleForNotification: true,
};

it('submits canonical member IDs once, without contact overrides, and retains the draft after failure', async () => {
  const submitted: unknown[] = [];
  let release: (() => void) | undefined;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  mswServer.use(
    http.post('http://library.test/api/library/notifications/send', async ({ request }) => {
      submitted.push(await request.json());
      await pending;
      return HttpResponse.json({ detail: 'Notification service unavailable' }, { status: 503 });
    })
  );
  const complete = vi.fn();
  const { result } = renderHook(
    () =>
      useNotificationComposer(
        true,
        mapLibraryNotificationSettingsDto(notificationSettings),
        complete
      ),
    notificationWrapper()
  );
  await act(async () => {
    await result.current.formik.setValues({
      eventType: 'dueDateReminder',
      channel: 'Email',
      subject: 'Return reminder',
      message: 'Dear {{memberName}}, please return Stories.',
      recipients: [member],
    });
  });
  act(() => {
    result.current.formik.handleSubmit();
    result.current.formik.handleSubmit();
  });
  await waitFor(() => expect(submitted).toHaveLength(1));
  expect(submitted[0]).toEqual({
    eventType: 'dueDateReminder',
    channel: 'Email',
    subject: 'Return reminder',
    message: 'Dear {{memberName}}, please return Stories.',
    recipients: [{ memberId: 'canonical-student-id', recipientRole: 'Member' }],
  });
  expect(result.current.busy).toBe(true);
  release?.();
  await waitFor(() => expect(result.current.error).toContain('Notification service unavailable'));
  expect(result.current.formik.values.recipients).toEqual([member]);
  expect(result.current.formik.values.message).toContain('please return Stories');
  expect(complete).not.toHaveBeenCalled();
});
