import { it, vi, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { act, render, screen, waitFor, fireEvent } from '@testing-library/react';

import { LibraryInboxScreen } from './LibraryInboxScreen';
import { notificationWrapper } from '../notification-test-fixture';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
});
vi.mock('next-auth/react', () => ({ getSession: async () => null, signOut: vi.fn() }));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/dashboard/library-inbox',
  useSearchParams: () => new URLSearchParams(),
}));
vi.mock('@iconify/react', async (original) => ({
  ...(await original<typeof import('@iconify/react')>()),
  Icon: () => null,
}));

it('removes the old account message and open detail immediately when the authenticated viewer changes', async () => {
  let requests = 0;
  let release: (() => void) | undefined;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  mswServer.use(
    http.get('http://library.test/api/library/inbox', async () => {
      requests += 1;
      if (requests > 1) await pending;
      return HttpResponse.json({
        items:
          requests === 1
            ? [
                {
                  id: 'private-a',
                  eventType: 'dueDateReminder',
                  subject: 'Guardian A private message',
                  message: 'Private message text',
                  sentAt: '2026-11-17T03:00:00Z',
                },
              ]
            : [],
        totalCount: requests === 1 ? 1 : 0,
        unreadCount: requests === 1 ? 1 : 0,
        currentPage: 1,
        pageSize: 20,
        totalPages: 1,
      });
    })
  );
  const harness = notificationWrapper([]);
  render(<LibraryInboxScreen />, harness);
  fireEvent.click(await screen.findByRole('row', { name: /Read Guardian A private message/ }));
  expect(screen.getByText('Private message text')).toBeInTheDocument();
  act(() => {
    harness.store.dispatch(harness.actions.switchViewer('guardian-b'));
  });
  await waitFor(() => expect(requests).toBe(2));
  expect(screen.queryByText('Private message text')).not.toBeInTheDocument();
  expect(screen.queryByText('Guardian A private message')).not.toBeInTheDocument();
  release?.();
});

it('does not request a school inbox for a host account', async () => {
  let requests = 0;
  mswServer.use(
    http.get('http://library.test/api/library/inbox', () => {
      requests += 1;
      return HttpResponse.json({ items: [] });
    })
  );
  const harness = notificationWrapper([]);
  harness.store.dispatch(harness.actions.switchMode('host'));
  render(<LibraryInboxScreen />, harness);
  expect(
    await screen.findByText(/Select a school account to use the Library inbox/)
  ).toBeInTheDocument();
  expect(requests).toBe(0);
});
