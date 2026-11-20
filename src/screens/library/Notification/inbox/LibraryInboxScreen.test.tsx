import { it, vi, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

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
const item = {
  id: 'inbox-id',
  eventType: 'dueDateReminder',
  subject: 'A real school reminder',
  message: 'Please return Stories.',
  memberName: 'Asha',
  sentAt: '2026-11-17T03:00:00Z',
  readAt: null,
};

it('loads a personal inbox without staff grants and records read only after a successful server response', async () => {
  let read = false;
  let posts = 0;
  let release: (() => void) | undefined;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  mswServer.use(
    http.get('http://library.test/api/library/inbox', () =>
      HttpResponse.json({
        items: [{ ...item, readAt: read ? '2026-11-17T04:00:00Z' : null }],
        totalCount: 1,
        unreadCount: read ? 0 : 1,
        currentPage: 1,
        pageSize: 20,
        totalPages: 1,
      })
    ),
    http.post('http://library.test/api/library/inbox/inbox-id/read', async () => {
      posts += 1;
      await pending;
      read = true;
      return HttpResponse.json({ ...item, readAt: '2026-11-17T04:00:00Z' });
    })
  );
  render(<LibraryInboxScreen />, notificationWrapper([]));
  fireEvent.click(await screen.findByRole('row', { name: /Read A real school reminder/ }));
  expect(posts).toBe(0);
  fireEvent.click(screen.getByRole('button', { name: 'Mark as read' }));
  await waitFor(() => expect(posts).toBe(1));
  expect(screen.getByRole('button', { name: 'Mark as read' })).toBeDisabled();
  expect(screen.getByLabelText('Unread messages')).toHaveTextContent('1');
  release?.();
  await waitFor(() => expect(screen.getByLabelText('Unread messages')).toHaveTextContent('0'));
});
