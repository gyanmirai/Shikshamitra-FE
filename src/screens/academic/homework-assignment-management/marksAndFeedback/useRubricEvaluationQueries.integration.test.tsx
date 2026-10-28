// @vitest-environment jsdom

import type { PropsWithChildren } from 'react';

import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { vi, it, expect } from 'vitest';
import { mswServer } from 'src/test/mswServer';
import { http, delay, HttpResponse } from 'msw';
import { configureStore } from '@reduxjs/toolkit';
import { waitFor, renderHook } from '@testing-library/react';

import { useRubricEvaluationQueries } from './useRubricEvaluationQueries';

vi.hoisted(() => vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://localhost:4199'));

it('queries only the selected homework submission and clears the previous student while loading', async () => {
  const selectedRequests: URL[] = [];
  let classRequests = 0;
  const evaluation = (studentId: string, submissionId: string) => ({
    id: `evaluation-${studentId}`, rubricId: 'rubric', studentId,
    studentSubmissionId: submissionId, evaluatorId: 'teacher', totalMarks: 8,
    status: 0, scores: [],
  });
  mswServer.use(
    http.get(/\/api\/auth\/session$/, () => HttpResponse.json(null)),
    http.get('http://localhost:4199/api/academic/rubrics', () => HttpResponse.json([
      { id: 'rubric', title: 'Homework rubric', status: 1, criteria: [] },
    ])),
    http.get('http://localhost:4199/api/academic/rubrics/rubric/evaluations', () => {
      classRequests += 1;
      return HttpResponse.json([evaluation('one', 'submission-one'), evaluation('two', 'submission-two')]);
    }),
    http.get('http://localhost:4199/api/academic/rubrics/rubric/evaluations/submission/:submissionId', async ({ request, params }) => {
      const url = new URL(request.url);
      selectedRequests.push(url);
      if (url.searchParams.get('studentId') === 'two') await delay(100);
      return HttpResponse.json(evaluation(url.searchParams.get('studentId')!, String(params.submissionId)));
    })
  );
  const store = configureStore({
    reducer: { [api.reducerPath]: api.reducer },
    middleware: getDefault => getDefault().concat(api.middleware),
  });
  const wrapper = ({ children }: PropsWithChildren) => <Provider store={store}>{children}</Provider>;
  const { result, rerender } = renderHook(({ studentId, submissionId }) => useRubricEvaluationQueries({
    mode: 'homework', standardId: 'standard', subjectId: 'subject', taskId: 'task', studentId, submissionId,
  }), { wrapper, initialProps: { studentId: 'one', submissionId: 'submission-one' } });
  await waitFor(() => expect(result.current.currentEvaluation?.studentId).toBe('one'));
  expect(selectedRequests).toHaveLength(1);
  expect(classRequests).toBe(0);
  rerender({ studentId: 'two', submissionId: 'submission-two' });
  expect(result.current.currentEvaluation).toBeUndefined();
  await waitFor(() => expect(result.current.currentEvaluation?.studentId).toBe('two'));
  expect(selectedRequests).toHaveLength(2);
  expect(selectedRequests[1].searchParams.get('studentId')).toBe('two');
  expect(classRequests).toBe(0);
});
