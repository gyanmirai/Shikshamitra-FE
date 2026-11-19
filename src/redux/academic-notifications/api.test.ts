import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { configureStore } from '@reduxjs/toolkit';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';

import { academicNotificationsApi as api } from './api';

vi.hoisted(() => { process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000'; });

const eventKey = 'Academic.Homework.Published';
const scope = {
  academicYearId: 'year-a', boardId: 'board-a', mediumId: 'medium-a', classId: 'class-a', divisionId: 'division-a',
};
const identity = { tenantCacheKey: 'tenant-a', userCacheKey: 'user-a' };
const createStore = () => configureStore({
  reducer: { [api.reducerPath]: api.reducer },
  middleware: (defaults) => defaults().concat(api.middleware),
});
let store: ReturnType<typeof createStore>;
let sessionIdentity: typeof identity;

beforeEach(() => {
  store = createStore();
  sessionIdentity = identity;
  clearCachedAuthSession();
  mswServer.use(http.get('*/api/auth/session', () => HttpResponse.json({
    accessToken: 'notification-test-token',
    profile: { sub: sessionIdentity.userCacheKey, tenantid: sessionIdentity.tenantCacheKey },
  })));
});

afterEach(() => {
  store.dispatch(api.util.resetApiState());
  clearCachedAuthSession();
});

describe('Academic notification client', () => {
  it('sends only the requested hierarchy and paging and isolates user and tenant cache entries', async () => {
    const requests: URLSearchParams[] = [];
    mswServer.use(http.get('*/api/academic/notifications/rules', ({ request }) => {
      requests.push(new URL(request.url).searchParams);
      return HttpResponse.json({ totalCount: requests.length, items: [] });
    }));

    const rules = { ...identity, scope, eventKey, skipCount: 10, maxResultCount: 10 };
    const readFor = (owner: typeof identity) => {
      sessionIdentity = owner;
      clearCachedAuthSession();
      return store.dispatch(api.endpoints.academicNotificationRules.initiate({ ...rules, ...owner })).unwrap();
    };
    expect((await readFor(identity)).totalCount).toBe(1);
    expect((await readFor({ ...identity, userCacheKey: 'user-b' })).totalCount).toBe(2);
    expect((await readFor({ ...identity, tenantCacheKey: 'tenant-b' })).totalCount).toBe(3);
    expect(requests.map((params) => Object.fromEntries(params))).toEqual(
      Array.from({ length: 3 }, () => ({
        ...scope, eventKey, skipCount: '10', maxResultCount: '10',
      }))
    );
  });

  it('sends the saved concurrency stamp and leaves the prior rule response available after a conflict', async () => {
    const rules = { ...identity, scope, eventKey, skipCount: 0, maxResultCount: 20 };
    const saved = {
      totalCount: 1,
      items: [{ eventKey, requestedScope: scope, effectiveRule: null, isInherited: false }],
    };
    const command = { scope, eventKey, enabled: false, concurrencyStamp: 'stale-stamp' };
    mswServer.use(
      http.get('*/api/academic/notifications/rules', () => HttpResponse.json(saved)),
      http.put('*/api/academic/notifications/rules/:eventKey', async ({ request, params }) => {
        expect(params.eventKey).toBe(eventKey);
        expect(await request.json()).toEqual(command);
        return HttpResponse.json({ detail: 'Rule changed' }, { status: 409 });
      })
    );

    await store.dispatch(api.endpoints.academicNotificationRules.initiate(rules)).unwrap();
    await expect(store.dispatch(api.endpoints.saveAcademicNotificationRule.initiate({
      ...identity, command,
    })).unwrap()).rejects.toMatchObject({ status: 409 });
    expect(api.endpoints.academicNotificationRules.select(rules)(store.getState()).data).toEqual(saved);
  });

  it('does not send a command owned by an earlier session', async () => {
    let writes = 0;
    mswServer.use(http.put('*/api/academic/notifications/rules/:eventKey', () => {
      writes += 1;
      return HttpResponse.json({});
    }));
    sessionIdentity = { ...identity, userCacheKey: 'user-b' };
    await expect(store.dispatch(api.endpoints.saveAcademicNotificationRule.initiate({
      ...identity,
      command: { eventKey, scope, enabled: false },
    })).unwrap()).rejects.toMatchObject({ status: 'CUSTOM_ERROR' });
    expect(writes).toBe(0);
  });

  it('loads every published option for the current event through metadata pages', async () => {
    const offsets: number[] = [];
    const templates = Array.from({ length: 101 }, (unused, index) => ({
      templateId: `template-${index}`,
      templateName: `Template ${index}`,
    }));
    mswServer.use(http.get('*/api/academic/notifications/templates/options', ({ request }) => {
      const params = new URL(request.url).searchParams;
      expect(params.get('eventKey')).toBe(eventKey);
      expect(params.get('academicMediumId')).toBe('medium-a');
      const offset = Number(params.get('skipCount'));
      offsets.push(offset);
      return HttpResponse.json({ items: templates.slice(offset, offset + 100), totalCount: templates.length });
    }));
    const result = await store.dispatch(api.endpoints.academicNotificationTemplateOptions.initiate({
      ...identity, eventKey, academicMediumId: 'medium-a',
    })).unwrap();
    expect(result.items).toHaveLength(101);
    expect(offsets).toEqual([0, 100]);
  });
});
