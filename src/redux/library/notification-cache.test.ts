import { api } from 'src/redux/service';
import { it, vi, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { waitFor } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';

import { libraryInboxApi } from './inbox-api';
import { libraryNotificationsApi } from './notifications-api';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
});
vi.mock('next-auth/react', () => ({ getSession: async () => null, signOut: vi.fn() }));
const makeStore = () =>
  configureStore({
    reducer: { [api.reducerPath]: api.reducer },
    middleware: (defaults) => defaults().concat(api.middleware),
  });
const page = { items: [], totalCount: 0, currentPage: 1, pageSize: 20, totalPages: 0 };

it('refreshes subscribed setup, delivery history and private inbox after successful send while preserving queue counts', async () => {
  const reads = { setup: 0, history: 0, inbox: 0 };
  mswServer.use(
    http.get('http://library.test/api/library/notifications/settings', () => {
      reads.setup += 1;
      return HttpResponse.json({ items: [] });
    }),
    http.get('http://library.test/api/library/notifications/history', () => {
      reads.history += 1;
      return HttpResponse.json(page);
    }),
    http.get('http://library.test/api/library/inbox', () => {
      reads.inbox += 1;
      return HttpResponse.json({ ...page, unreadCount: 0 });
    }),
    http.post('http://library.test/api/library/notifications/send', () =>
      HttpResponse.json({ attempted: 1, queued: 1, sent: 0, skipped: 0, failed: 0, items: [] })
    )
  );
  const store = makeStore();
  const settings = store.dispatch(
    libraryNotificationsApi.endpoints.getLibraryNotificationSettings.initiate()
  );
  const history = store.dispatch(
    libraryNotificationsApi.endpoints.getLibraryNotificationHistory.initiate({
      page: 1,
      pageSize: 20,
    })
  );
  const inbox = store.dispatch(
    libraryInboxApi.endpoints.getLibraryInbox.initiate({
      viewer: 'tenant:person',
      page: 1,
      pageSize: 20,
      unreadOnly: false,
    })
  );
  await Promise.all([settings.unwrap(), history.unwrap(), inbox.unwrap()]);
  const outcome = await store
    .dispatch(
      libraryNotificationsApi.endpoints.sendLibraryNotification.initiate({
        eventType: 'dueDateReminder',
        channel: 'Email',
        subject: 'Reminder',
        message: 'Return Stories.',
        recipients: [{ memberId: 'person-id' }],
      })
    )
    .unwrap();
  expect(outcome).toMatchObject({ queued: 1, sent: 0 });
  await waitFor(() => expect(reads).toEqual({ setup: 2, history: 2, inbox: 2 }));
  settings.unsubscribe();
  history.unsubscribe();
  inbox.unsubscribe();
  store.dispatch(api.util.resetApiState());
});

it('does not refetch subscribed configuration after a rejected save', async () => {
  let reads = 0;
  mswServer.use(
    http.get('http://library.test/api/library/notifications/settings', () => {
      reads += 1;
      return HttpResponse.json({ items: [] });
    }),
    http.put('http://library.test/api/library/notifications/settings', () =>
      HttpResponse.json({ detail: 'Scope changed' }, { status: 403 })
    )
  );
  const store = makeStore();
  const settings = store.dispatch(
    libraryNotificationsApi.endpoints.getLibraryNotificationSettings.initiate()
  );
  await settings.unwrap();
  const result = await store.dispatch(
    libraryNotificationsApi.endpoints.updateLibraryNotificationSettings.initiate({
      studentInboxRouting: 'Guardians',
    })
  );
  expect(result).toHaveProperty('error.status', 403);
  expect(reads).toBe(1);
  settings.unsubscribe();
  store.dispatch(api.util.resetApiState());
});

it('keeps viewer identity only in private cache keys and never in the inbox request', async () => {
  const requested: string[] = [];
  mswServer.use(
    http.get('http://library.test/api/library/inbox', ({ request }) => {
      requested.push(new URL(request.url).search);
      return HttpResponse.json({ ...page, unreadCount: requested.length });
    })
  );
  const store = makeStore();
  const args = { page: 1, pageSize: 20, unreadOnly: false };
  const first = store.dispatch(
    libraryInboxApi.endpoints.getLibraryInbox.initiate({ ...args, viewer: 'tenant:guardian-a' })
  );
  expect((await first.unwrap()).unreadCount).toBe(1);
  const second = store.dispatch(
    libraryInboxApi.endpoints.getLibraryInbox.initiate({ ...args, viewer: 'tenant:guardian-b' })
  );
  expect((await second.unwrap()).unreadCount).toBe(2);
  expect(requested).toEqual([
    '?page=1&pageSize=20&unreadOnly=false',
    '?page=1&pageSize=20&unreadOnly=false',
  ]);
  first.unsubscribe();
  second.unsubscribe();
  store.dispatch(api.util.resetApiState());
});
