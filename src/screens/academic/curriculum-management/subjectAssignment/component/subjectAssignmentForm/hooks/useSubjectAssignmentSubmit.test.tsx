import { useFormik } from 'formik';
import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { configureStore } from '@reduxjs/toolkit';
import { shikshaMitraToast } from 'src/components/toast';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';
import { act, render, screen, waitFor, fireEvent, renderHook } from '@testing-library/react';

import SubjectFormActions from '../SubjectFormActions';
import { useSubjectAssignmentSubmit } from './useSubjectAssignmentSubmit';

import type { ISubjectAssignmentFormValues } from '../type';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});

const initialValues: ISubjectAssignmentFormValues = {
  classId: 'nursery',
  className: 'Nursery',
  status: 1,
  subjects: [
    {
      subjectId: 'computer-science',
      subjectName: 'Computer Science',
      subjectCode: 'TTTT',
      subjectType: 0,
      teacherIds: ['teacher-id'],
      teachers: [],
      documents: [],
      learningGoal: '',
      prerequisites: '',
      description: '',
    },
  ],
};

function setup(assignmentId?: string) {
  const store = configureStore({
    reducer: { [api.reducerPath]: api.reducer },
    middleware: (defaults) => defaults().concat(api.middleware),
  });
  const onClose = vi.fn();
  const hook = renderHook(
    () => {
      const submission = useSubjectAssignmentSubmit({
        academicMediumId: 'medium',
        assignmentId,
        onClose,
      });
      return useFormik({ initialValues, onSubmit: submission.onSubmit });
    },
    { wrapper: ({ children }) => <Provider store={store}>{children}</Provider> }
  );
  return { ...hook, store, onClose };
}

describe('subject allocation submission', () => {
  beforeEach(() => {
    clearCachedAuthSession();
    mswServer.use(http.get('*/api/auth/session', () => HttpResponse.json(null)));
  });
  afterEach(() => {
    vi.restoreAllMocks();
    clearCachedAuthSession();
  });

  it.each([['Publish', 1], ['Save Draft', 0]] as const)('sends one request when %s is clicked', async (label, status) => {
    const requests: { status: number }[] = [];
    const errorToast = vi.spyOn(shikshaMitraToast, 'error');
    mswServer.use(http.post('*/api/academics/curriculum/subject-assignments', async ({ request }) => {
      requests.push(await request.json() as { status: number });
      return HttpResponse.json({ detail: 'This subject is already assigned to this class.' }, { status: 400 });
    }));
    const store = configureStore({ reducer: { [api.reducerPath]: api.reducer },
      middleware: (defaults) => defaults().concat(api.middleware) });
    function Form() {
      const submission = useSubjectAssignmentSubmit({ academicMediumId: 'medium', onClose: () => undefined });
      const form = useFormik({ initialValues, onSubmit: submission.onSubmit });
      return <form onSubmit={form.handleSubmit} aria-busy={form.isSubmitting}>
        <SubjectFormActions isAddLoading={submission.isAddLoading} isUpdateLoading={submission.isUpdateLoading}
          currentStatus={form.values.status} onCancel={() => undefined} onSubmit={form.handleSubmit}
          onDraft={() => { form.setFieldValue('status', 0); form.handleSubmit(); }}
          onPublish={() => { form.setFieldValue('status', 1); form.handleSubmit(); }} />
      </form>;
    }
    render(<Provider store={store}><Form /></Provider>);
    fireEvent.click(screen.getByRole('button', { name: label }));
    await waitFor(() => expect(errorToast).toHaveBeenCalledTimes(1));
    expect(requests).toHaveLength(1);
    expect(requests[0].status).toBe(status);
    store.dispatch(api.util.resetApiState());
  });

  it.each([undefined, 'assignment-id'])(
    'keeps teacher rejection inline and values intact for %s',
    async (id) => {
      const detail =
        'Dharmik Jinjala is not assigned to Nursery in Academic Permission. Select another teacher.';
      const errorToast = vi.spyOn(shikshaMitraToast, 'error');
      mswServer.use(
        http.all('*/api/academics/curriculum/subject-assignments*', () =>
          HttpResponse.json(
            {
              errorCode: 'Academic:Curriculum:020005',
              detail,
              data: { SubjectId: 'computer-science', Field: 'teacherIds' },
            },
            { status: 400 }
          )
        )
      );
      const { result, onClose, store } = setup(id);
      await act(async () => {
        await result.current.submitForm();
      });
      expect(result.current.status).toEqual({
        subjectId: 'computer-science',
        teacherError: detail,
      });
      expect(result.current.values).toEqual(initialValues);
      expect(errorToast).not.toHaveBeenCalled();
      expect(onClose).not.toHaveBeenCalled();
      store.dispatch(api.util.resetApiState());
    }
  );

  it('shows other business errors once', async () => {
    const errorToast = vi.spyOn(shikshaMitraToast, 'error');
    mswServer.use(
      http.post('*/api/academics/curriculum/subject-assignments', () =>
        HttpResponse.json(
          {
            errorCode: 'SubjectAssignment:SubjectAlreadyAssignedInClass',
            detail: 'This subject is already assigned to this class.',
          },
          { status: 400 }
        )
      )
    );
    const { result, onClose, store } = setup();
    await act(async () => {
      await result.current.submitForm();
    });
    expect(errorToast).toHaveBeenCalledExactlyOnceWith({
      message: 'This subject is already assigned to this class.',
    });
    expect(onClose).not.toHaveBeenCalled();
    store.dispatch(api.util.resetApiState());
  });

  it('shows caller scope denial beside Class without a toast', async () => {
    const detail = 'You do not have access to this class. Review your Academic Permission.';
    const errorToast = vi.spyOn(shikshaMitraToast, 'error');
    mswServer.use(
      http.post('*/api/academics/curriculum/subject-assignments', () =>
        HttpResponse.json({ errorCode: 'UserScope:AccessDenied', detail }, { status: 400 })
      )
    );
    const { result, onClose, store } = setup();
    await act(async () => {
      await result.current.submitForm();
    });
    expect(result.current.status).toEqual({ classError: detail });
    expect(errorToast).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
    store.dispatch(api.util.resetApiState());
  });

  it('closes after a valid allocation is published', async () => {
    mswServer.use(
      http.post('*/api/academics/curriculum/subject-assignments', () =>
        HttpResponse.json({ success: true })
      )
    );
    const { result, onClose, store } = setup();
    await act(async () => {
      await result.current.submitForm();
    });
    expect(onClose).toHaveBeenCalledExactlyOnceWith(null, true);
    store.dispatch(api.util.resetApiState());
  });
});
