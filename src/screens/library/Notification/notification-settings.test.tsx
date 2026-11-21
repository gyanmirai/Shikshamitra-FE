import { it, vi, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { render, screen, fireEvent } from '@testing-library/react';

import LibraryNotificationGroupPanel from './Components/LibraryNotificationGroupPanel';
import { notificationWrapper, notificationSettings } from './notification-test-fixture';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
});
vi.mock('next-auth/react', () => ({ getSession: async () => null, signOut: vi.fn() }));
vi.mock('@iconify/react', async (original) => ({
  ...(await original<typeof import('@iconify/react')>()),
  Icon: () => null,
}));

it('keeps global settings read-only when the server denies authority despite Add permission', async () => {
  mswServer.use(
    http.get('http://library.test/api/library/notifications/settings', () =>
      HttpResponse.json({ ...notificationSettings, canManageSettings: false })
    ),
    http.get('http://library.test/api/library/notifications/history', () =>
      HttpResponse.json({ items: [], totalCount: 0 })
    )
  );
  render(<LibraryNotificationGroupPanel group="Transactions" />, notificationWrapper());
  expect(
    await screen.findByRole('switch', { name: 'Enable Due date reminder by Email' })
  ).toBeDisabled();
});

it('asks before discarding an edited template and retains it after keeping edits', async () => {
  mswServer.use(
    http.get('http://library.test/api/library/notifications/settings', () =>
      HttpResponse.json(notificationSettings)
    ),
    http.get('http://library.test/api/library/notifications/history', () =>
      HttpResponse.json({ items: [], totalCount: 0 })
    )
  );
  render(<LibraryNotificationGroupPanel group="Transactions" />, notificationWrapper());
  fireEvent.click(await screen.findByRole('button', { name: /Edit.*template/i }));
  fireEvent.change(screen.getByLabelText(/^Subject/), { target: { value: 'Keep this reminder' } });
  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Keep editing' }));
  expect(screen.getByLabelText(/^Subject/)).toHaveValue('Keep this reminder');
});
