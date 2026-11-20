import { it, vi, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { render, screen, within, waitFor, fireEvent } from '@testing-library/react';

import { NotificationHistoryWorkspace } from './NotificationHistoryWorkspace';
import { notificationWrapper, notificationSettings } from './notification-test-fixture';

const navigate = vi.hoisted(() => vi.fn());
vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
});

it('replaces the supported status equality filter in the URL instead of filtering only the loaded page', async () => {
  mswServer.use(
    http.get('http://library.test/api/library/notifications/settings', () =>
      HttpResponse.json(notificationSettings)
    ),
    http.get('http://library.test/api/library/notifications/history', () =>
      HttpResponse.json({ items: [], totalCount: 41, currentPage: 2, pageSize: 20, totalPages: 3 })
    )
  );
  render(<NotificationHistoryWorkspace />, notificationWrapper(['View']));
  fireEvent.click(await screen.findByRole('button', { name: 'Filter Status' }));
  const form = screen.getByRole('dialog', { name: 'Filter Status' });
  fireEvent.mouseDown(within(form).getByRole('combobox'));
  fireEvent.click(screen.getByRole('option', { name: 'Failed' }));
  fireEvent.click(within(form).getByRole('button', { name: 'Apply' }));
  await waitFor(() =>
    expect(navigate).toHaveBeenCalledWith(
      '/library/notification?tab=transactions&page=1&pageSize=20&channel=Email&status=Failed'
    )
  );
});
vi.mock('next-auth/react', () => ({ getSession: async () => null, signOut: vi.fn() }));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: navigate }),
  usePathname: () => '/library/notification',
  useSearchParams: () =>
    new URLSearchParams('tab=transactions&page=2&pageSize=20&channel=Email&status=Queued'),
}));
vi.mock('@iconify/react', async (original) => ({
  ...(await original<typeof import('@iconify/react')>()),
  Icon: () => null,
}));

it('requests the actual URL-backed scoped history page and hides send/run/retry for a View-only actor', async () => {
  let requested: URL | undefined;
  mswServer.use(
    http.get('http://library.test/api/library/notifications/settings', () =>
      HttpResponse.json(notificationSettings)
    ),
    http.get('http://library.test/api/library/notifications/history', ({ request }) => {
      requested = new URL(request.url);
      return HttpResponse.json({
        items: [
          {
            id: 'delivery-id',
            eventType: 'dueDateReminder',
            eventGroup: 'Transactions',
            eventName: 'Due date reminder',
            recipientName: 'Asha',
            channel: 'Email',
            status: 'Queued',
            subject: 'Page two reminder',
            creationTime: '2026-11-17T03:00:00Z',
            attemptCount: 0,
          },
        ],
        totalCount: 41,
        currentPage: 2,
        pageSize: 20,
        totalPages: 3,
      });
    })
  );
  render(<NotificationHistoryWorkspace />, notificationWrapper(['View']));
  expect(await screen.findByText('Page two reminder')).toBeInTheDocument();
  expect(requested?.searchParams.get('eventGroup')).toBe('Transactions');
  expect(requested?.searchParams.get('page')).toBe('2');
  expect(requested?.searchParams.get('pageSize')).toBe('20');
  expect(requested?.searchParams.get('channel')).toBe('Email');
  expect(requested?.searchParams.get('status')).toBe('Queued');
  expect(requested?.searchParams.has('academicYearId')).toBe(false);
  expect(screen.queryByRole('button', { name: 'Send message' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Run reminders' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /Retry delivery/ })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /Go to next page/i }));
  await waitFor(() =>
    expect(navigate).toHaveBeenCalledWith(
      '/library/notification?tab=transactions&page=3&pageSize=20&channel=Email&status=Queued'
    )
  );
});
