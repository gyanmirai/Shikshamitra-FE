import { Provider } from 'react-redux';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { configureStore } from '@reduxjs/toolkit';
import userEvent from '@testing-library/user-event';
import { createTheme } from 'src/theme/create-theme';
import { ThemeProvider } from '@mui/material/styles';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { render, screen, within, waitFor } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';
import { notificationSelfApi } from 'src/redux/communication/notification-self-api';

import { NotificationInbox } from './notification-inbox';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});

const tenant = 'school-a';
const originalOwner = 'school-a:user-a';
const switchedOwner = 'school-a:user-b';
const notice = {
  id: 'item-a',
  title: 'Mathematics homework',
  body: 'Read chapter one.',
  relativeLink: '//outside.example.test',
  creationTime: '2026-11-19T09:00:00Z',
  readAt: null,
  acknowledgedAt: null,
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
    mswServer.use(
      http.get('*/api/auth/session', () =>
        HttpResponse.json({
          accessToken: userId,
          profile: { sub: userId, tenantid: tenant },
        })
      )
    );
  });

  it('groups messages at the local day boundary and keeps the date on earlier messages', async () => {
    const now = new Date(2026, 10, 23, 0, 10);
    const todayItem = { ...notice, creationTime: now.toISOString() };
    const olderItem = {
      ...notice,
      id: 'item-b',
      title: 'Timetable was updated',
      creationTime: new Date(2026, 10, 22, 23, 55).toISOString(),
    };
    vi.setSystemTime(now);
    try {
      mswServer.use(
        http.get('*/api/communication/notifications/me/inbox', () =>
          HttpResponse.json({ totalCount: 2, items: [todayItem, olderItem] })
        )
      );

      render(inbox(createStore(), originalOwner));
      const today = await screen.findByRole('list', { name: 'Today' });
      const earlier = screen.getByRole('list', { name: 'Earlier' });
      expect(within(today).getByRole('heading', { name: todayItem.title })).toBeVisible();
      expect(within(today).getByText('12:10 am')).toHaveAttribute(
        'datetime',
        todayItem.creationTime
      );
      expect(within(earlier).getByRole('heading', { name: olderItem.title })).toBeVisible();
      expect(within(earlier).getByText('22 Nov 2026 11:55 pm')).toHaveAttribute(
        'datetime',
        olderItem.creationTime
      );
    } finally {
      vi.useRealTimers();
    }
  });

  it('keeps reading and acknowledging distinct and suppresses unsafe links', async () => {
    const commands: string[] = [];
    let item: { readAt: string | null; acknowledgedAt: string | null } & Omit<
      typeof notice,
      'readAt' | 'acknowledgedAt'
    > = notice;
    mswServer.use(
      http.get('*/api/communication/notifications/me/inbox', () =>
        HttpResponse.json({ totalCount: 1, items: [item] })
      ),
      http.post('*/api/communication/notifications/me/inbox/item-a/:action', ({ params }) => {
        const action = String(params.action);
        commands.push(action);
        item = {
          ...item,
          readAt: notice.creationTime,
          acknowledgedAt: action === 'acknowledge' ? notice.creationTime : null,
        };
        return HttpResponse.json(item);
      })
    );
    const user = userEvent.setup();
    render(inbox(createStore(), originalOwner));
    await screen.findByRole('heading', { name: notice.title });
    expect(screen.queryByRole('link', { name: 'Open record' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Mark as read' }));
    await waitFor(() => expect(screen.getByRole('heading', { name: notice.title })).toHaveFocus());
    expect(screen.queryByRole('button', { name: 'Mark as read' })).not.toBeInTheDocument();
    expect(screen.queryByText('Acknowledged')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Acknowledge' }));
    expect(await screen.findByText('Acknowledged')).toBeVisible();
    expect(commands).toEqual(['read', 'acknowledge']);
  });

  it('keeps the current rows visible when refreshing the inbox fails', async () => {
    let fail = false;
    mswServer.use(
      http.get('*/api/communication/notifications/me/inbox', () =>
        fail
          ? new HttpResponse(null, { status: 500 })
          : HttpResponse.json({ totalCount: 1, items: [notice] })
      )
    );

    const store = createStore();
    render(inbox(store, originalOwner));
    await screen.findByRole('heading', { name: notice.title });

    fail = true;
    store.dispatch(notificationSelfApi.internalActions.onFocus());
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Your notifications could not be refreshed.'
    );
    expect(screen.getByRole('heading', { name: notice.title })).toBeVisible();

    fail = false;
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }));
    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument());
    expect(screen.getByRole('heading', { name: notice.title })).toBeVisible();
  });

  it('hides cached rows after an unauthorized HTML response until a successful refresh', async () => {
    const inboxResponse = () => HttpResponse.json({ totalCount: 1, items: [notice] });
    let respond: () => Response = inboxResponse;
    mswServer.use(http.get('*/api/communication/notifications/me/inbox', () => respond()));

    const store = createStore();
    render(inbox(store, originalOwner));
    await screen.findByRole('heading', { name: notice.title });

    respond = () => HttpResponse.html('<h1>Unauthorized</h1>', { status: 401 });
    store.dispatch(notificationSelfApi.internalActions.onFocus());
    await screen.findByRole('alert');
    expect(screen.queryByRole('heading', { name: notice.title })).not.toBeInTheDocument();

    respond = inboxResponse;
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(await screen.findByRole('heading', { name: notice.title })).toBeVisible();
  });

  it('clears the previous owner’s visible rows and blocks a stale mutation before it reaches the API', async () => {
    const writes: string[] = [];
    mswServer.use(
      http.get('*/api/communication/notifications/me/inbox', ({ request }) =>
        HttpResponse.json(
          request.headers.get('authorization') === 'Bearer user-a'
            ? { totalCount: 1, items: [notice] }
            : { totalCount: 0, items: [] }
        )
      ),
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
    await expect(
      store
        .dispatch(
          notificationSelfApi.endpoints.changePersonalNotificationItem.initiate({
            owner: originalOwner,
            id: notice.id,
            action: 'read',
          })
        )
        .unwrap()
    ).rejects.toMatchObject({ status: 'CUSTOM_ERROR' });
    expect(writes).toEqual([]);
  });

  it('offers a native download for an authenticated academic report link', async () => {
    const relativeLink = '/api/academic-reports/93ed784c-f9c2-4703-8745-752a15a3ac34/download';
    mswServer.use(
      http.get('*/api/communication/notifications/me/inbox', () =>
        HttpResponse.json({
          totalCount: 1,
          items: [{ ...notice, title: 'Report export ready', relativeLink }],
        })
      )
    );

    render(inbox(createStore(), originalOwner));
    const download = await screen.findByRole('link', { name: 'Download report' });
    expect(download).toHaveAttribute('href', relativeLink);
    expect(download).not.toHaveAttribute('download');
    expect(screen.queryByRole('link', { name: 'Open record' })).not.toBeInTheDocument();
  });
});
