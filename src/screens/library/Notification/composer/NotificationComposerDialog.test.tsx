import { it, vi, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { render, screen } from '@testing-library/react';

import { NotificationComposerDialog } from './NotificationComposerDialog';
import { notificationWrapper, notificationSettings } from '../notification-test-fixture';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
});
vi.mock('next-auth/react', () => ({ getSession: async () => null, signOut: vi.fn() }));
vi.mock('@iconify/react', async (original) => ({
  ...(await original<typeof import('@iconify/react')>()),
  Icon: () => null,
}));

it('keeps every send control disabled for a View-only actor without querying recipients', async () => {
  let recipientReads = 0;
  mswServer.use(
    http.get('http://library.test/api/library/notifications/settings', () =>
      HttpResponse.json(notificationSettings)
    ),
    http.get('http://library.test/api/library/notifications/recipients', () => {
      recipientReads += 1;
      return HttpResponse.json({ items: [] });
    })
  );
  render(
    <NotificationComposerDialog onClose={vi.fn()} onComplete={vi.fn()} />,
    notificationWrapper(['View'])
  );
  expect(await screen.findByText('Notification send authority is required.')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Submit message' })).toBeDisabled();
  expect(screen.getByRole('combobox', { name: /Library members/ })).toBeDisabled();
  expect(screen.getByLabelText(/^Subject/)).toBeDisabled();
  expect(recipientReads).toBe(0);
});
