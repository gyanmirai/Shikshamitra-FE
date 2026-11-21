import { it, vi, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { mapLibraryNotificationSettingDto } from 'src/redux/library/library-adapters';

import { NotificationTemplateDialog } from './NotificationTemplateDialog';
import { notificationSetting, notificationWrapper } from './notification-test-fixture';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
});
vi.mock('next-auth/react', () => ({ getSession: async () => null, signOut: vi.fn() }));
vi.mock('@iconify/react', async (original) => ({
  ...(await original<typeof import('@iconify/react')>()),
  Icon: () => null,
}));

it('locks the entire template editor while saving and keeps changed content after a rejected save', async () => {
  let submitted: unknown;
  let release: (() => void) | undefined;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  mswServer.use(
    http.put('http://library.test/api/library/notifications/settings', async ({ request }) => {
      submitted = await request.json();
      await pending;
      return HttpResponse.json(
        { detail: 'Your configuration authority changed.' },
        { status: 403 }
      );
    })
  );
  const onClose = vi.fn();
  render(
    <NotificationTemplateDialog
      setting={mapLibraryNotificationSettingDto(notificationSetting)}
      canEdit
      onClose={onClose}
    />,
    notificationWrapper()
  );
  fireEvent.change(screen.getByLabelText(/^Subject/), {
    target: { value: 'Preserve this content' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  await waitFor(() =>
    expect(submitted).toEqual({
      items: [{ id: 'setting-id', subjectTemplate: 'Preserve this content' }],
    })
  );
  expect(screen.getByLabelText(/^Subject/)).toBeDisabled();
  expect(screen.getByLabelText(/^Message/)).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'close' })).toBeDisabled();
  fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
  expect(onClose).not.toHaveBeenCalled();
  release?.();
  expect(await screen.findByText('Your configuration authority changed.')).toBeInTheDocument();
  expect(screen.getByLabelText(/^Subject/)).toHaveValue('Preserve this content');
  expect(onClose).not.toHaveBeenCalled();
});
