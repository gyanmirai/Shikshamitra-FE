import type { ReactNode } from 'react';

import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { studentAdmissionsCrmType } from 'src/redux/tagTypes';
import { it, vi, expect, afterEach, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { act, cleanup, waitFor, renderHook } from '@testing-library/react';

import { createDocumentTestStore } from './document-test-fixture';
import { useGetAdmissionOfferingClassIdentitiesQuery } from './admission-offerings-api';

import type { AdmissionOfferingListItem } from './admission-offerings-api';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});

const path = '*/api/student/enrollment/admissions/offerings';
const scope = {
  admissionCycleId: 'cycle-1',
  boardId: 'board-1',
  mediumId: 'medium-1',
  campusId: null,
  track: 0 as const,
};
const offering = (standardId: string, overrides: Partial<AdmissionOfferingListItem> = {}) => ({
  ...scope,
  id: standardId,
  standardId,
  stageId: 'primary',
  isActive: true,
  ...overrides,
});
let store: ReturnType<typeof createDocumentTestStore>;
const wrapper = ({ children }: { children: ReactNode }) => (
  <Provider store={store}>{children}</Provider>
);

beforeEach(() => {
  clearCachedAuthSession();
  store = createDocumentTestStore();
  mswServer.use(http.get('*/api/auth/session', () => HttpResponse.json(null)));
});
afterEach(() => {
  cleanup();
  act(() => {
    store.dispatch(api.util.resetApiState());
  });
  clearCachedAuthSession();
});

it.each(['plain', 'enveloped'] as const)(
  'reads every page and includes inactive offerings with a %s response',
  async (shape) => {
    const requests: URLSearchParams[] = [];
    const items = [
      offering('class-1'),
      offering('class-2', { isActive: false }),
      offering('class-9', { stageId: 'secondary' }),
    ];
    mswServer.use(
      http.get(path, ({ request }) => {
        const params = new URL(request.url).searchParams;
        requests.push(params);
        const offset = Number(params.get('skipCount'));
        const page = { items: items.slice(offset, offset + 2), totalCount: items.length };
        return HttpResponse.json(shape === 'enveloped' ? { data: page } : page);
      })
    );
    const { result } = renderHook(() => useGetAdmissionOfferingClassIdentitiesQuery(scope), {
      wrapper,
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.currentData).toEqual([
      { standardId: 'class-1', stageId: 'primary' },
      { standardId: 'class-2', stageId: 'primary' },
      { standardId: 'class-9', stageId: 'secondary' },
    ]);
    expect(requests.map((params) => params.get('skipCount'))).toEqual(['0', '2']);
    requests.forEach((params) => {
      expect(params.get('admissionCycleId')).toBe(scope.admissionCycleId);
      expect(params.get('boardId')).toBe(scope.boardId);
      expect(params.get('mediumId')).toBe(scope.mediumId);
      expect(params.get('track')).toBe('0');
      expect(params.get('maxResultCount')).toBe('100');
      expect(params.has('isActive')).toBe(false);
      expect(params.has('availabilityStatus')).toBe(false);
      expect(params.has('campusId')).toBe(false);
      expect(params.has('entryMode')).toBe(false);
    });
  }
);

it('does not count another cycle, board, medium, campus or admission track as configured', async () => {
  mswServer.use(
    http.get(path, () =>
      HttpResponse.json({
        data: {
          totalCount: 6,
          items: [
            offering('configured'),
            offering('other-cycle', { admissionCycleId: 'cycle-2' }),
            offering('other-board', { boardId: 'board-2' }),
            offering('other-medium', { mediumId: 'medium-2' }),
            offering('rte', { track: 1 }),
            offering('campus', { campusId: 'campus-1' }),
          ],
        },
      })
    )
  );
  const { result } = renderHook(() => useGetAdmissionOfferingClassIdentitiesQuery(scope), {
    wrapper,
  });
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(result.current.currentData).toEqual([{ standardId: 'configured', stageId: 'primary' }]);
});

it('reports no configured classes when the complete list is empty', async () => {
  mswServer.use(http.get(path, () => HttpResponse.json({ items: [], totalCount: 0 })));
  const { result } = renderHook(() => useGetAdmissionOfferingClassIdentitiesQuery(scope), {
    wrapper,
  });
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(result.current.currentData).toEqual([]);
});

it.each(['failed', 'incomplete'] as const)(
  'does not expose partial availability after a %s later page',
  async (failure) => {
    mswServer.use(
      http.get(path, ({ request }) => {
        if (new URL(request.url).searchParams.get('skipCount') === '0') {
          return HttpResponse.json({ items: [offering('class-1')], totalCount: 2 });
        }
        return failure === 'failed'
          ? HttpResponse.json({ detail: 'Unavailable' }, { status: 500 })
          : HttpResponse.json({ items: [], totalCount: 2 });
      })
    );
    const { result } = renderHook(() => useGetAdmissionOfferingClassIdentitiesQuery(scope), {
      wrapper,
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.currentData).toBeUndefined();
  }
);

it('withholds old-cycle data during a cycle change and refreshes after offering mutations', async () => {
  let release: () => void = () => undefined;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  let configured = true;
  mswServer.use(
    http.get(path, async ({ request }) => {
      const cycle = new URL(request.url).searchParams.get('admissionCycleId');
      if (cycle === 'cycle-2') await pending;
      return HttpResponse.json({
        items: configured ? [offering('class-1', { admissionCycleId: cycle! })] : [],
        totalCount: configured ? 1 : 0,
      });
    })
  );
  const { result, rerender } = renderHook(
    ({ cycle }) =>
      useGetAdmissionOfferingClassIdentitiesQuery({ ...scope, admissionCycleId: cycle }),
    {
      wrapper,
      initialProps: { cycle: 'cycle-1' },
    }
  );
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  rerender({ cycle: 'cycle-2' });
  expect(result.current.currentData).toBeUndefined();
  expect(result.current.isFetching).toBe(true);
  release();
  await waitFor(() =>
    expect(result.current.currentData).toEqual([{ standardId: 'class-1', stageId: 'primary' }])
  );
  configured = false;
  act(() => {
    store.dispatch(api.util.invalidateTags([studentAdmissionsCrmType.admissionOffering]));
  });
  await waitFor(() => expect(result.current.currentData).toEqual([]));
});

it('skips the request before the academic scope is selected', () => {
  const request = vi.fn(() => HttpResponse.json({ items: [], totalCount: 0 }));
  mswServer.use(http.get(path, request));
  const { result } = renderHook(
    () => useGetAdmissionOfferingClassIdentitiesQuery(scope, { skip: true }),
    { wrapper }
  );
  expect(result.current.isUninitialized).toBe(true);
  expect(request).not.toHaveBeenCalled();
});
