import { Provider } from 'react-redux';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { configureStore } from '@reduxjs/toolkit';
import userEvent from '@testing-library/user-event';
import { createTheme } from 'src/theme/create-theme';
import { ThemeProvider } from '@mui/material/styles';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { render, screen, waitFor } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';
import { notificationSelfApi } from 'src/redux/communication/notification-self-api';

import { NotificationInbox } from './notification-inbox';

vi.hoisted(() => { process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000'; });

const tenant = 'school-a';
const originalOwner = 'school-a:user-a';
const switchedOwner = 'school-a:user-b';
const notice = {
  id: 'item-a', title: 'Mathematics homework', body: 'Read chapter one.',
  relativeLink: '//outside.example.test', creationTime: '2026-11-19T09:00:00Z',
  readAt: null, acknowledgedAt: null,
};

function createStore() {
  return configureStore({
    reducer: { [notificationSelfApi.reducerPath]: notificationSelfApi.reducer },
    middleware: (defaults) => defaults().concat(notificationSelfApi.middleware),
  });
}

function inbox(store: ReturnType<typeof createStore>, owner: string) {
  return (
    <Provider store={store}>
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <NotificationInbox owner={owner} unreadOnly={false} onOpen={vi.fn()} />
      </ThemeProvider>
    </Provider>
  );
}

describe('signed-in notification inbox', () => {
  let userId: string;

  beforeEach(() => {
    userId = 'user-a';
    clearCachedAuthSession();
    mswServer.use(http.get('*/api/auth/session', () => HttpResponse.json({
      accessToken: userId, profile: { sub: userId, tenantid: tenant },
    })));
  });

  it('keeps reading and acknowledging distinct and suppresses unsafe links', async () => {
    const commands: string[] = [];
    let item: { readAt: string | null; acknowledgedAt: string | null } & Omit<typeof notice, 'readAt' | 'acknowledgedAt'> = notice;
    mswServer.use(
      http.get('*/api/communication/notifications/me/inbox', () => HttpResponse.json({ totalCount: 1, items: [item] })),
      http.post('*/api/communication/notifications/me/inbox/item-a/:action', ({ params }) => {
        const action = String(params.action);
        commands.push(action);
        item = { ...item, readAt: notice.creationTime, acknowledgedAt: action === 'acknowledge' ? notice.creationTime : null };
        return HttpResponse.json(item);
      })
    );
    const user = userEvent.setup();
    render(inbox(createStore(), originalOwner));
    await screen.findByRole('heading', { name: notice.title });
    expect(screen.queryByRole('link', { name: 'Open record' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Mark as read' }));
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Mark as read' })).not.toBeInTheDocument());
    expect(screen.queryByText('Acknowledged')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Acknowledge' }));
    expect(await screen.findByText('Acknowledged')).toBeVisible();
    expect(commands).toEqual(['read', 'acknowledge']);
  });

  it('clears the previous owner’s visible rows and blocks a stale mutation before it reaches the API', async () => {
    const writes: string[] = [];
    mswServer.use(
      http.get('*/api/communication/notifications/me/inbox', ({ request }) => HttpResponse.json(
        request.headers.get('authorization') === 'Bearer user-a' ? { totalCount: 1, items: [notice] } : { totalCount: 0, items: [] }
      )),
      http.post('*/api/communication/notifications/me/inbox/item-a/read', () => {
        writes.push('read');
        return HttpResponse.json(notice);
      })
    );
    const store = createStore();
    const { rerender } = render(inbox(store, originalOwner));
    expect(await screen.findByRole('heading', { name: notice.title })).toBeVisible();
    userId = 'user-b';
    clearCachedAuthSession();
    rerender(inbox(store, switchedOwner));
    expect(screen.queryByRole('heading', { name: notice.title })).not.toBeInTheDocument();
    expect(await screen.findByText('You have no notifications yet.')).toBeVisible();
    await expect(store.dispatch(notificationSelfApi.endpoints.changePersonalNotificationItem.initiate({
      owner: originalOwner, id: notice.id, action: 'read',
    })).unwrap()).rejects.toMatchObject({ status: 'CUSTOM_ERROR' });
    expect(writes).toEqual([]);
  });

  it('offers a native download for an authenticated academic report link', async () => {
    const relativeLink = '/api/academic-reports/93ed784c-f9c2-4703-8745-752a15a3ac34/download';
    mswServer.use(
      http.get('*/api/communication/notifications/me/inbox', () => HttpResponse.json({
        totalCount: 1,
        items: [{ ...notice, title: 'Report export ready', relativeLink }],
      }))
    );

    render(inbox(createStore(), originalOwner));
    const download = await screen.findByRole('link', { name: 'Download report' });
    expect(download).toHaveAttribute('href', relativeLink);
    expect(download).not.toHaveAttribute('download');
    expect(screen.queryByRole('link', { name: 'Open record' })).not.toBeInTheDocument();
  });
});
