import type { PropsWithChildren } from 'react';

import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { configureStore } from '@reduxjs/toolkit';
import { vi, it, expect, describe, beforeEach } from 'vitest';
import { act, waitFor, renderHook } from '@testing-library/react';
import { lessonPlanApi } from 'src/redux/academicAPI/CurriculumManagementApi/LessonPlanApi/lesson-plan-api';

import { usePendingReviewCount } from './use-pending-review-count';

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
  return { store, wrapper };
};

describe('usePendingReviewCount', () => {
  beforeEach(() => {
    mswServer.use(http.get('*/api/auth/session', () => HttpResponse.json(null)));
  });

  it('does not request reviewer data for users without review access', () => {
    const getPlans = vi.fn(() => HttpResponse.json({ totalCount: 4, items: [] }));
    mswServer.use(http.get('*/api/academic/curriculum/lesson-plans', getPlans));
    const { wrapper } = createWrapper();

    const { result } = renderHook(
      () => usePendingReviewCount({ academicYearId: 'year-one', enabled: false }),
      { wrapper }
    );

    expect(result.current).toBe(0);
    expect(getPlans).not.toHaveBeenCalled();
  });

  it('loads only the submitted-plan total across the reviewer scope', async () => {
    const requestedUrls: URL[] = [];
    mswServer.use(
      http.get('*/api/academic/curriculum/lesson-plans', ({ request }) => {
        requestedUrls.push(new URL(request.url));
        return HttpResponse.json({ totalCount: 7, items: [] });
      })
    );
    const { wrapper } = createWrapper();

    const { result } = renderHook(
      () => usePendingReviewCount({ academicYearId: 'year-one', enabled: true }),
      { wrapper }
    );

    await waitFor(() => expect(result.current).toBe(7));
    expect(requestedUrls).toHaveLength(1);
    expect(Object.fromEntries(requestedUrls[0].searchParams)).toMatchObject({
      academicYearId: 'year-one',
      status: '1',
      maxResultCount: '1',
    });
    expect(requestedUrls[0].searchParams.has('academicMediumId')).toBe(false);
    expect(requestedUrls[0].searchParams.has('teacherId')).toBe(false);
  });

  it('refreshes the badge count after a review mutation', async () => {
    let pendingCount = 2;
    mswServer.use(
      http.get('*/api/academic/curriculum/lesson-plans', () =>
        HttpResponse.json({ totalCount: pendingCount, items: [] })
      ),
      http.post('*/api/academic/curriculum/lesson-plans/plan-one/approve', () => {
        pendingCount -= 1;
        return HttpResponse.json({});
      })
    );
    const { store, wrapper } = createWrapper();
    const { result } = renderHook(
      () => usePendingReviewCount({ academicYearId: 'year-one', enabled: true }),
      { wrapper }
    );
    await waitFor(() => expect(result.current).toBe(2));

    await act(async () => {
      await store
        .dispatch(
          lessonPlanApi.endpoints.approveLessonPlan.initiate({
            id: 'plan-one',
            body: { comment: '' },
          })
        )
        .unwrap();
    });

    await waitFor(() => expect(result.current).toBe(1));
  });
});
