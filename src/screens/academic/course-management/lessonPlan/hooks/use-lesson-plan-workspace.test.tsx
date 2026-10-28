import type { PropsWithChildren } from 'react';
import type { LessonWorkspaceInput } from 'src/redux/academicAPI/CurriculumManagementApi/LessonPlanApi/lesson-plan-workspace-contracts';

import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { configureStore } from '@reduxjs/toolkit';
import { vi, it, expect, describe, beforeEach } from 'vitest';
import { act, waitFor, renderHook } from '@testing-library/react';

import { useLessonPlanWorkspace } from './use-lesson-plan-workspace';

vi.hoisted(() => { process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000'; });

const createWrapper = () => {
  const store = configureStore({ reducer: { [api.reducerPath]: api.reducer },
    middleware: defaults => defaults().concat(api.middleware) });
  return ({ children }: PropsWithChildren) => <Provider store={store}>{children}</Provider>;
};

const scope = { academicYearId: 'year-one', academicMediumId: 'medium-one', teacherId: 'teacher-one', view: 'lessonList' };

describe('lesson plan workspace paging', () => {
  beforeEach(() => mswServer.use(http.get('*/api/auth/session', () => HttpResponse.json(null))));

  it.each(['lessonList', 'teacherDiary', 'reviewQueue'])('bounds the active %s request and uses the additive workspace', async view => {
    const requests: URL[] = [];
    mswServer.use(http.get('*/api/academic/curriculum/lesson-plans*', ({ request }) => {
      requests.push(new URL(request.url));
      return HttpResponse.json({ totalCount: 87, items: [], diaries: [], summary: {} });
    }));
    renderHook(() => useLessonPlanWorkspace({ ...scope, view }, true), { wrapper: createWrapper() });
    await waitFor(() => expect(requests).toHaveLength(1));
    expect(requests[0].pathname).toBe('/api/academic/curriculum/lesson-plans/workspace');
    expect(requests[0].searchParams.get('maxResultCount')).toBe('25');
    expect(requests[0].searchParams.get('skipCount')).toBe('0');
    expect(requests[0].searchParams.get('academicMediumId')).toBe(view === 'reviewQueue' ? null : 'medium-one');
    expect(requests[0].searchParams.get('teacherId')).toBe('teacher-one');
  });

  it('does not start any list request for the timeline or an inactive view', async () => {
    const requests: string[] = [];
    mswServer.use(http.get('*/api/academic/curriculum/lesson-plans*', ({ request }) => {
      requests.push(request.url);
      return HttpResponse.json({ totalCount: 0, items: [] });
    }));
    const { result } = renderHook(() => useLessonPlanWorkspace(scope, false), { wrapper: createWrapper() });
    expect(result.current.isUninitialized).toBe(true);
    expect(requests).toEqual([]);
  });

  it('uses server cohort summaries and the diaries associated with the current page', async () => {
    const summary = { reviewStatusCounts: { all: 8000, pending: 7000, approved: 900, rejected: 60, changes: 40 },
      quickCounts: { lessonsPlanned: 9000, diariesSubmitted: 8000, pendingDiaries: 1000, pendingApprovals: 7000, missedLessons: 3, syllabusDelayed: 5 },
      options: { teachers: ['Teacher outside current page'], classes: ['Class outside current page'] } };
    mswServer.use(http.get('*/api/academic/curriculum/lesson-plans/workspace', () => HttpResponse.json({
      totalCount: 2400, items: [{ id: 'plan-one', status: 1, teacherDiaryId: 'diary-one', plannedDate: '2026-10-20' }],
      diaries: [{ id: 'diary-one', lessonPlanId: 'plan-one', teacherId: 'teacher-one', status: 1, actualCompletionPercentage: 42 }], summary,
    })));
    const { result } = renderHook(() => useLessonPlanWorkspace(scope, true), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]).toMatchObject({ id: 'plan-one', planStatus: 'Submitted', diaryStatus: 'Draft' });
    expect(result.current.diaries[0]).toMatchObject({ id: 'diary-one', lessonPlanId: 'plan-one', diaryStatus: 'Submitted', actualCompletionPercentage: 42 });
    expect(result.current.totalCount).toBe(2400);
    expect(result.current.summary).toEqual(summary);
  });

  it('sends all table criteria to the server and resets paging when criteria change', async () => {
    const requests: URL[] = [];
    mswServer.use(http.get('*/api/academic/curriculum/lesson-plans/workspace', ({ request }) => {
      requests.push(new URL(request.url));
      return HttpResponse.json({ totalCount: 9000, items: [], diaries: [], summary: {} });
    }));
    const { result } = renderHook(() => useLessonPlanWorkspace(scope, true), { wrapper: createWrapper() });
    const params = () => requests.at(-1)!.searchParams;
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    act(() => result.current.tableProps.onServerPagination?.(3, 50));
    await waitFor(() => expect(params().get('skipCount')).toBe('100'));
    act(() => result.current.tableProps.onServerSearch?.(''));
    expect(result.current.tableProps.page).toBe(2);
    act(() => result.current.tableProps.onServerSearch?.('outside first page'));
    await waitFor(() => expect(params().get('searchTerm')).toBe('outside first page'));
    expect(params().get('skipCount')).toBe('0');
    const filters = [{ column: 'planStatus', type: 'equals', value: 'Approved', valueType: 'enum' }];
    act(() => result.current.tableProps.onServerPagination?.(2, 50));
    await waitFor(() => expect(params().get('skipCount')).toBe('50'));
    act(() => result.current.tableProps.onServerFilter?.(filters));
    await waitFor(() => expect(params().get('filters')).toBe(JSON.stringify(filters)));
    expect(params().get('skipCount')).toBe('0');
    act(() => result.current.tableProps.onServerSort?.('topic', [{ column: 'topic', direction: 'desc' }]));
    await waitFor(() => expect(params().get('sorts')).toBe('[{"column":"topic","direction":"desc"}]'));
    act(() => result.current.tableProps.onVisibleColumnsChange?.(['topic', 'teacherName']));
    await waitFor(() => expect(params().getAll('searchColumns')).toEqual(['topic', 'teacherName']));
    expect(params().get('searchTerm')).toBe('outside first page');
    expect(params().get('maxResultCount')).toBe('50');
    act(() => result.current.tableProps.onClearCriteria?.());
    await waitFor(() => expect(params().get('searchTerm')).toBe(''));
    expect(params().get('filters')).toBe('[]');
    expect(params().get('sorts')).toBe('[{"column":"topic","direction":"desc"}]');
    expect(result.current.tableProps.maxServerRowsPerPage).toBe(100);
    act(() => result.current.tableProps.onServerPagination?.(1, 9000));
    await waitFor(() => expect(params().get('maxResultCount')).toBe('100'));
  });

  it('resets domain paging and clears table criteria when academic scope changes', async () => {
    const requests: URL[] = [];
    mswServer.use(http.get('*/api/academic/curriculum/lesson-plans/workspace', ({ request }) => {
      requests.push(new URL(request.url));
      return HttpResponse.json({ totalCount: 9000, items: [], diaries: [], summary: {} });
    }));
    const { result, rerender } = renderHook((input: Omit<LessonWorkspaceInput, 'skipCount' | 'maxResultCount'>) =>
      useLessonPlanWorkspace(input, true), { initialProps: scope, wrapper: createWrapper() });
    const params = () => requests.at(-1)!.searchParams;
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    act(() => result.current.tableProps.onServerSearch?.('retained search'));
    await waitFor(() => expect(params().get('searchTerm')).toBe('retained search'));
    act(() => result.current.tableProps.onServerPagination?.(4, 50));
    await waitFor(() => expect(params().get('skipCount')).toBe('150'));
    rerender({ ...scope, uiCriteria: '{"classFilter":"Ten"}' });
    await waitFor(() => expect(params().get('uiCriteria')).toBe('{"classFilter":"Ten"}'));
    expect(params().get('skipCount')).toBe('0');
    expect(params().get('searchTerm')).toBe('retained search');
    rerender({ ...scope, academicYearId: 'year-two' });
    await waitFor(() => expect(params().get('academicYearId')).toBe('year-two'));
    expect(params().get('skipCount')).toBe('0');
    expect(params().get('maxResultCount')).toBe('25');
    expect(params().get('searchTerm')).toBe('');
    rerender(scope);
    await waitFor(() => expect(params().get('academicYearId')).toBe('year-one'));
    expect(params().get('skipCount')).toBe('0');
    expect(params().get('searchTerm')).toBe('');
  });
});
