import type { PropsWithChildren } from 'react';
import type { Standards } from 'src/types/school';

import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { academicType } from 'src/redux/tagTypes';
import { configureStore } from '@reduxjs/toolkit';
import { it, vi, expect, afterEach, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { act, waitFor, renderHook } from '@testing-library/react';

import { useEligibleCopyClasses } from './useEligibleCopyClasses';

vi.hoisted(() => { process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000'; });

const allClass = ['source', 'eligible', 'empty'].map((id) => ({ id, name: id })) as Standards[];

beforeEach(() => {
  clearCachedAuthSession();
  mswServer.use(http.get('*/api/auth/session', () => HttpResponse.json(null)));
});
afterEach(clearCachedAuthSession);

it('does not refetch abandoned copy candidates when assignment mutations invalidate the cache', async () => {
  const requests: string[] = [];
  mswServer.use(http.get('*/api/academics/curriculum/:standardId/subject-assignments', ({ params }) => {
    requests.push(String(params.standardId));
    return HttpResponse.json({ data: { totalCount: params.standardId === 'eligible' ? 3 : 0 } });
  }));
  const store = configureStore({
    reducer: { [api.reducerPath]: api.reducer },
    middleware: (defaults) => defaults().concat(api.middleware),
  });
  const wrapper = ({ children }: PropsWithChildren) => <Provider store={store}>{children}</Provider>;
  const mounted = renderHook(() => useEligibleCopyClasses({ open: true, allClass, sourceClassId: 'source' }), { wrapper });
  try {
    await waitFor(() => expect(mounted.result.current.eligibleClasses.map(({ id }) => id)).toEqual(['eligible']));
    mounted.unmount();
    act(() => { store.dispatch(api.util.invalidateTags([academicType.subjectAssignment])); });
    await Promise.all(store.dispatch(api.util.getRunningQueriesThunk()));
    expect(requests.sort()).toEqual(['eligible', 'empty']);
  } finally {
    mounted.unmount();
    store.dispatch(api.util.resetApiState());
  }
});
