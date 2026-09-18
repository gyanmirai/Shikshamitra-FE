import type { PropsWithChildren } from 'react';

import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { configureStore } from '@reduxjs/toolkit';
import { vi, it, expect, describe, beforeEach } from 'vitest';
import { act, waitFor, renderHook } from '@testing-library/react';

import { useReviewQueueQuery, getReviewQueueQueryArgs } from './use-review-queue-query';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});

const createWrapper = () => {
  const store = configureStore({
    reducer: { [api.reducerPath]: api.reducer },
    middleware: (defaults) => defaults().concat(api.middleware),
  });
  const wrapper = ({ children }: PropsWithChildren) => (
    <Provider store={store}>{children}</Provider>
  );
  return { wrapper };
};

describe('useReviewQueueQuery', () => {
  beforeEach(() => {
    mswServer.use(http.get('*/api/auth/session', () => HttpResponse.json(null)));
  });

  it.each([
    ['pending', 1],
    ['approved', 2],
    ['rejected', 3],
    ['changes', 4],
    ['all', undefined],
  ] as const)('maps the %s tab to the backend status filter', (status, expected) => {
    expect(getReviewQueueQueryArgs('year-one', status)).toEqual({
      academicYearId: 'year-one',
      status: expected,
      maxResultCount: 1000,
    });
  });

  it('refetches for every status change, cached-tab revisit, and manual refresh', async () => {
    const requestedStatuses: Array<string | null> = [];
    mswServer.use(
      http.get('*/api/academic/curriculum/lesson-plans', ({ request }) => {
        requestedStatuses.push(new URL(request.url).searchParams.get('status'));
        return HttpResponse.json({ totalCount: 0, items: [] });
      })
    );
    const { wrapper } = createWrapper();
    const { result } = renderHook(
      () => useReviewQueueQuery({ academicYearId: 'year-one', enabled: true }),
      { wrapper }
    );

    await waitFor(() => expect(requestedStatuses).toEqual(['1']));

    act(() => result.current.setStatusFilter('approved'));
    await waitFor(() => expect(requestedStatuses).toEqual(['1', '2']));

    act(() => result.current.setStatusFilter('pending'));
    await waitFor(() => expect(requestedStatuses).toEqual(['1', '2', '1']));

    await act(async () => {
      await result.current.refetch();
    });
    await waitFor(() => expect(requestedStatuses).toEqual(['1', '2', '1', '1']));
  });
});
