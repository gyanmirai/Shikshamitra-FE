import { Provider } from 'react-redux';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { configureStore } from '@reduxjs/toolkit';
import userEvent from '@testing-library/user-event';
import { it, vi, expect, beforeEach } from 'vitest';
import { createTheme } from 'src/theme/create-theme';
import { ThemeProvider } from '@mui/material/styles';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { render, screen, within, waitFor } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';
import { notificationSelfApi } from 'src/redux/communication/notification-self-api';

import { NotificationPreferences } from './notification-preferences';

vi.hoisted(() => { process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000'; });

const root = '*/api/communication/notifications/me/preferences';
const category = 'Academic.Homework';
const owner = 'school-a:user-a';
const child = { studentId: 'child-a', displayName: 'Sample Learner' };
const saved = {
  category, studentId: child.studentId, enabledChannels: [2, 3, 4], languageCode: 'en',
  quietHoursEnabled: false, quietHoursStart: null, quietHoursEnd: null, concurrencyStamp: 'version-1',
};

function setup() {
  const close = vi.fn();
  const store = configureStore({
    reducer: {
      [notificationSelfApi.reducerPath]: notificationSelfApi.reducer,
      confirmPopup: (state = { isChanges: false }) => state,
    },
    middleware: (defaults) => defaults().concat(notificationSelfApi.middleware),
  });
  render(
    <Provider store={store}>
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <NotificationPreferences owner={owner} onClose={close} />
      </ThemeProvider>
    </Provider>
  );
  return { close, user: userEvent.setup() };
}

beforeEach(() => {
  clearCachedAuthSession();
  mswServer.use(
    http.get('*/api/auth/session', () => HttpResponse.json({
      accessToken: 'user-a', profile: { sub: 'user-a', tenantid: 'school-a' },
    })),
    http.get(`${root}/options`, () => HttpResponse.json({
      categories: [{ category, channels: [0, 2, 3, 4] }], students: [child],
    })),
    http.get(root, () => HttpResponse.json([saved]))
  );
});

it('loads authorized child choices and saves only the selected category and current revision', async () => {
  const writes: unknown[] = [];
  mswServer.use(http.put(root, async ({ request }) => {
    writes.push(await request.json());
    return HttpResponse.json({ ...saved, enabledChannels: [3, 4], concurrencyStamp: 'version-2' });
  }));
  const { close, user } = setup();
  await user.selectOptions(await screen.findByLabelText('Apply to'), child.studentId);
  expect(screen.getByRole('checkbox', { name: 'WhatsApp' })).not.toBeChecked();
  await user.click(screen.getByRole('checkbox', { name: 'Email' }));
  await user.click(screen.getByRole('button', { name: 'Submit' }));
  await waitFor(() => expect(close).toHaveBeenCalledTimes(1));
  expect(writes).toEqual([{ ...saved, enabledChannels: [3, 4] }]);
});

it('keeps edits after a conflict and confirms before using a fresh saved revision', async () => {
  const writes: unknown[] = [];
  let current = saved;
  mswServer.use(
    http.get(root, () => HttpResponse.json([current])),
    http.put(root, async ({ request }) => {
      writes.push(await request.json());
      if (writes.length === 1) {
        current = { ...saved, concurrencyStamp: 'version-2' };
        return new HttpResponse(null, { status: 409 });
      }
      return HttpResponse.json({ ...current, enabledChannels: [3, 4], concurrencyStamp: 'version-3' });
    })
  );
  const { close, user } = setup();
  await user.selectOptions(await screen.findByLabelText('Apply to'), child.studentId);
  await user.click(screen.getByRole('checkbox', { name: 'Email' }));
  await user.click(screen.getByRole('button', { name: 'Submit' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('changed');
  expect(screen.getByRole('checkbox', { name: 'Email' })).not.toBeChecked();
  await user.click(screen.getByRole('button', { name: 'Reload saved settings' }));
  const confirm = await screen.findByRole('dialog', { name: 'Discard Changes' });
  await user.click(within(confirm).getByRole('button', { name: 'Keep editing' }));
  expect(screen.getByRole('checkbox', { name: 'Email' })).not.toBeChecked();
  await user.click(screen.getByRole('button', { name: 'Reload saved settings' }));
  await user.click(within(await screen.findByRole('dialog', { name: 'Discard Changes' }))
    .getByRole('button', { name: 'Discard changes' }));
  await waitFor(() => expect(screen.getByRole('checkbox', { name: 'Email' })).toBeChecked());
  await user.click(screen.getByRole('checkbox', { name: 'Email' }));
  await user.click(screen.getByRole('button', { name: 'Submit' }));
  await waitFor(() => expect(close).toHaveBeenCalledTimes(1));
  expect(writes[1]).toMatchObject({ studentId: child.studentId, concurrencyStamp: 'version-2' });
});
