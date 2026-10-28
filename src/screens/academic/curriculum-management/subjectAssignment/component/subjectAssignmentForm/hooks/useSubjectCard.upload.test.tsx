import { useFormik } from 'formik';
import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { configureStore } from '@reduxjs/toolkit';
import { it, vi, expect, afterEach, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { act, waitFor, renderHook } from '@testing-library/react';

import { useSubjectCard } from './useSubjectCard';

import type { ISubjectAssignmentFormValues } from '../type';

vi.hoisted(() => { process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000'; });
beforeEach(() => {
  clearCachedAuthSession();
  mswServer.use(http.get('*/api/auth/session', () => HttpResponse.json(null)));
});
afterEach(() => clearCachedAuthSession());

it('uploads independent attachments concurrently, retains input order and stays busy until all finish', async () => {
  let active = 0;
  let maximum = 0;
  let fastCompletions = 0;
  let releaseFirst: () => void = () => undefined;
  const first = new Promise<void>((resolve) => { releaseFirst = resolve; });
  mswServer.use(http.post('*/api/files', async ({ request }) => {
    const data = await request.formData();
    const file = data.get('File') as File;
    active += 1;
    maximum = Math.max(maximum, active);
    if (file.name === 'a.pdf') await first;
    else fastCompletions += 1;
    active -= 1;
    return HttpResponse.json({ data: file.name });
  }));
  const initialValues: ISubjectAssignmentFormValues = {
    classId: 'class-1', status: 0,
    subjects: [{ subjectId: 'subject-1', subjectNo: 'subject-1', subjectType: 0,
      subjectName: 'Math', subjectCode: 'MATH', teachers: [], teacherIds: [], documents: [],
      learningGoal: '', prerequisites: '', description: '' }],
  };
  const store = configureStore({ reducer: { [api.reducerPath]: api.reducer }, middleware: (defaults) => defaults({ serializableCheck: false }).concat(api.middleware) });
  const probe = renderHook(() => {
    const formik = useFormik({ initialValues, onSubmit: () => undefined });
    const card = useSubjectCard({ formik, subject: formik.values.subjects[0], index: 0,
      onSubjectChange: () => undefined, activeSubjectId: 'subject-1' });
    return { formik, card };
  }, { wrapper: ({ children }) => <Provider store={store}>{children}</Provider> });
  let pending: Promise<void> | undefined;
  try {
    act(() => { pending = probe.result.current.card.handleDropzoneChange([
      'previous.pdf', ...['a.pdf', 'b.pdf', 'c.pdf'].map((name) => new File(['pdf'], name, { type: 'application/pdf' })),
    ]); });
    await waitFor(() => expect(maximum).toBeGreaterThan(1));
    await waitFor(() => expect(fastCompletions).toBe(2));
    expect(maximum).toBeLessThanOrEqual(3);
    expect(probe.result.current.card.isUploading).toBe(true);
    releaseFirst();
    await act(async () => { await pending; });
    expect(probe.result.current.formik.values.subjects[0].documents).toEqual(['previous.pdf', 'a.pdf', 'b.pdf', 'c.pdf']);
    expect(probe.result.current.card.isUploading).toBe(false);
  } finally {
    releaseFirst();
    await act(async () => { await pending; });
    probe.unmount(); store.dispatch(api.util.resetApiState());
  }
});
