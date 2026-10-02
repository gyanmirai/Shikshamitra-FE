import type { PropsWithChildren } from 'react';

import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { configureStore } from '@reduxjs/toolkit';
import { renderHook } from '@testing-library/react';
import { clearCachedAuthSession } from 'src/redux/session-cache';

import { useGradeEntryReview } from './use-grade-entry-review';

export const validReview = { isValid: true, blockers: [], warnings: [] };
export const markRow = {
  id: 'student-1',
  studentId: 'student-1',
  studentName: 'Arjun Megh',
  rollNo: '1',
  marks: 80,
  totalMarks: 100,
  grade: 'B+',
  feedback: 'Latest feedback',
  status: 1,
  attendanceStatus: 0,
};

export function setupReview(isDirty = false) {
  clearCachedAuthSession();
  mswServer.use(
    http.get('*/api/auth/session', () => HttpResponse.json(null)),
    http.post('*/api/academics/exams/:examId/marks/bulk-save', () =>
      HttpResponse.json({ data: {} })
    ),
    http.post('*/api/academics/exams/:examId/marks/draft', () => HttpResponse.json({ data: {} })),
    http.post('*/api/academics/exams/:examId/marks/validate', () =>
      HttpResponse.json({ data: validReview })
    )
  );
  const store = configureStore({
    reducer: { [api.reducerPath]: api.reducer },
    middleware: (getDefault) => getDefault().concat(api.middleware),
  });
  const wrapper = ({ children }: PropsWithChildren) => (
    <Provider store={store}>{children}</Provider>
  );
  const saveStates: string[] = [];
  let savedCount = 0;
  const hook = renderHook(
    (props: { examId: string; rows: (typeof markRow)[]; isDirty?: boolean }) =>
      useGradeEntryReview({
        isDirty,
        ...props,
        divisionId: 'division-1',
        subjectId: 'subject-1',
        onSaveStateChange: (state) => saveStates.push(state),
        onSaved: () => {
          savedCount += 1;
        },
      }),
    { initialProps: { examId: 'exam-1', rows: [markRow] }, wrapper }
  );
  return { ...hook, store, saveStates, getSavedCount: () => savedCount };
}

export function deferredResponse() {
  let release = () => {};
  const promise = new Promise<void>((resolve) => {
    release = resolve;
  });
  return { promise, release };
}
