import type { PropsWithChildren } from 'react';
import type { AdmissionOfferingListItem } from 'src/redux/student/admissions/admission-offerings-api';

import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { setPermissions } from 'src/redux/auth/authSlice';
import { it, vi, expect, afterEach, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { act, cleanup, renderHook } from '@testing-library/react';
import { admissionOfferingsApi } from 'src/redux/student/admissions/admission-offerings-api';
import { createDocumentTestStore } from 'src/redux/student/admissions/document-test-fixture';

import { useAdmissionOfferingActions } from './use-admission-offering-actions';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});

vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { success: vi.fn(), error: vi.fn() },
}));

const path = '*/api/student/enrollment/admissions/offerings';
const row = { id: 'offering-1' } as AdmissionOfferingListItem;
const listInput = { admissionCycleId: 'cycle-1' };
const { getAdmissionOfferings, getAdmissionOffering } = admissionOfferingsApi.endpoints;

let store: ReturnType<typeof createDocumentTestStore>;

beforeEach(() => {
  clearCachedAuthSession();
  store = createDocumentTestStore();
  store.dispatch(setPermissions([{ name: 'Students.Admissions.Offerings.Delete', isGranted: true }]));
  mswServer.use(http.get('*/api/auth/session', () => HttpResponse.json(null)));
});

afterEach(() => {
  cleanup();
  store.dispatch(api.util.resetApiState());
  clearCachedAuthSession();
});

it.each([false, true])(
  'refreshes the list after delete without requesting the deleted details (previously viewed: %s)',
  async (previouslyViewed) => {
    let deleted = false;
    const requests: string[] = [];
    const deleteStamps: (string | null)[] = [];
    mswServer.use(
      http.get(path, () => {
        requests.push('list');
        return HttpResponse.json({ items: deleted ? [] : [row], totalCount: deleted ? 0 : 1 });
      }),
      http.get(`${path}/${row.id}`, () => {
        requests.push(deleted ? 'detail after delete' : 'detail');
        return deleted
          ? new HttpResponse(null, { status: 404 })
          : HttpResponse.json({ ...row, concurrencyStamp: 'latest-stamp' });
      }),
      http.delete(`${path}/${row.id}`, ({ request }) => {
        requests.push('delete');
        deleteStamps.push(new URL(request.url).searchParams.get('concurrencyStamp'));
        deleted = true;
        return new HttpResponse(null, { status: 200 });
      })
    );

    await store.dispatch(getAdmissionOfferings.initiate(listInput)).unwrap();
    const { result } = renderHook(() => useAdmissionOfferingActions(null), {
      wrapper: ({ children }: PropsWithChildren) => <Provider store={store}>{children}</Provider>,
    });
    if (previouslyViewed) {
      await act(async () => result.current.openDetailed('view', row));
      act(() => result.current.closeDetails());
    }

    act(() => result.current.requestDelete(row));
    await act(async () => result.current.confirmAction());
    await Promise.all(store.dispatch(api.util.getRunningQueriesThunk()));

    expect(requests).toEqual([
      'list',
      ...(previouslyViewed ? ['detail'] : []),
      'detail',
      'delete',
      'list',
    ]);
    expect(deleteStamps).toEqual(['latest-stamp']);
    expect(getAdmissionOfferings.select(listInput)(store.getState()).data?.items).toEqual([]);
    expect(getAdmissionOffering.select(row.id)(store.getState()).data).toBeUndefined();
    expect(result.current.pendingAction).toBeNull();
    expect(result.current.commanding).toBe(false);
  }
);
