import { it, vi, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { mapLibraryNotificationHistoryDto } from 'src/redux/library/library-adapters';

import { notificationWrapper } from './notification-test-fixture';
import { NotificationRetryDialog } from './NotificationRetryDialog';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
});
vi.mock('next-auth/react', () => ({ getSession: async () => null, signOut: vi.fn() }));
vi.mock('@iconify/react', async (original) => ({
  ...(await original<typeof import('@iconify/react')>()),
  Icon: () => null,
}));

it('requires duplicate acknowledgment before retrying an unconfirmed email and keeps it after failure', async () => {
  let submitted: unknown;
  let release: (() => void) | undefined;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  mswServer.use(
    http.post(
      'http://library.test/api/library/notifications/history/history-id/retry',
      async ({ request }) => {
        submitted = await request.json();
        await pending;
        return HttpResponse.json(
          { detail: 'The delivery changed. Refresh history and review it.' },
          { status: 409 }
        );
      }
    )
  );
  const onClose = vi.fn();
  render(
    <NotificationRetryDialog
      item={mapLibraryNotificationHistoryDto({
        id: 'history-id',
        channel: 'Email',
        status: 'Unconfirmed',
        subject: 'Return reminder',
        recipientName: 'Guardian',
      })}
      onClose={onClose}
    />,
    notificationWrapper()
  );
  const acknowledge = screen.getByRole('checkbox', { name: /retry may send a duplicate email/ });
  expect(screen.getByRole('button', { name: 'Queue retry' })).toBeDisabled();
  fireEvent.click(acknowledge);
  fireEvent.click(screen.getByRole('button', { name: 'Queue retry' }));
  await waitFor(() => expect(submitted).toEqual({ acknowledgePossibleDuplicate: true }));
  expect(acknowledge).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  release?.();
  expect(
    await screen.findByText('The delivery changed. Refresh history and review it.')
  ).toBeInTheDocument();
  expect(acknowledge).toBeChecked();
  expect(onClose).not.toHaveBeenCalled();
});
