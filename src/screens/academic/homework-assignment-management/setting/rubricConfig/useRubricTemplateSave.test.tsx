import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { configureStore } from '@reduxjs/toolkit';
import { act, renderHook } from '@testing-library/react';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';
import { RubricWorkType } from 'src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/RubricAssessmentApi';

import { buildInitialValues } from './rubricFormValues';
import { useRubricTemplateSave } from './useRubricTemplateSave';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});

const values = {
  ...buildInitialValues(null),
  title: 'Reasoning',
  appliesToWorkType: RubricWorkType.Both,
  criteria: [{ ...buildInitialValues(null).criteria[0], title: 'Accuracy' }],
};

function setup() {
  const store = configureStore({
    reducer: { [api.reducerPath]: api.reducer },
    middleware: (defaults) => defaults().concat(api.middleware),
  });
  const onClose = vi.fn();
  const onSaved = vi.fn();
  const hook = renderHook(
    () => useRubricTemplateSave({ editData: null, onClose }, 'medium', onSaved),
    { wrapper: ({ children }) => <Provider store={store}>{children}</Provider> }
  );
  return { ...hook, store, onClose, onSaved };
}

describe('rubric draft persistence', () => {
  beforeEach(() => {
    clearCachedAuthSession();
    mswServer.use(http.get('*/api/auth/session', () => HttpResponse.json(null)));
  });
  afterEach(() => {
    clearCachedAuthSession();
  });

  it('creates once, updates subsequent saves, and publishes that same draft', async () => {
    const requests: string[] = [];
    mswServer.use(
      http.post('*/api/academic/rubrics', () => {
        requests.push('create');
        return HttpResponse.json({ id: 'saved', status: 0 });
      }),
      http.put('*/api/academic/rubrics/saved', () => {
        requests.push('update saved');
        return HttpResponse.json({ id: 'saved', status: 0 });
      }),
      http.post('*/api/academic/rubrics/saved/publish', () => {
        requests.push('publish saved');
        return new HttpResponse(null, { status: 204 });
      })
    );
    const { result, onSaved, onClose, store } = setup();
    await act(async () => {
      await result.current.submitRubric('draft', values, vi.fn());
    });
    await act(async () => {
      await result.current.submitRubric('draft', values, vi.fn());
    });
    await act(async () => {
      await result.current.submitRubric('publish', values, vi.fn());
    });
    expect(requests).toEqual(['create', 'update saved', 'update saved', 'publish saved']);
    expect(onSaved).toHaveBeenCalledTimes(3);
    expect(onSaved).toHaveBeenLastCalledWith(values);
    expect(onClose).toHaveBeenCalledTimes(1);
    store.dispatch(api.util.resetApiState());
  });

  it('rejects overlapping saves before validation or a network response finishes', async () => {
    let creates = 0;
    mswServer.use(
      http.post('*/api/academic/rubrics', () => {
        creates += 1;
        return HttpResponse.json({ id: 'saved', status: 0 });
      })
    );
    const { result, store } = setup();
    await act(async () => {
      await Promise.all([
        result.current.submitRubric('draft', values, vi.fn()),
        result.current.submitRubric('draft', values, vi.fn()),
      ]);
    });
    expect(creates).toBe(1);
    expect(result.current.isSaving).toBe(false);
    store.dispatch(api.util.resetApiState());
  });

  it('keeps an unsuccessful create retryable without retaining a nonexistent ID', async () => {
    let creates = 0;
    mswServer.use(
      http.post('*/api/academic/rubrics', () => {
        creates += 1;
        return creates === 1
          ? HttpResponse.json({ detail: 'Please retry' }, { status: 400 })
          : HttpResponse.json({ id: 'saved', status: 0 });
      })
    );
    const { result, onClose, onSaved, store } = setup();
    await act(async () => {
      await result.current.submitRubric('draft', values, vi.fn());
    });
    expect(onSaved).not.toHaveBeenCalled();
    await act(async () => {
      await result.current.submitRubric('draft', values, vi.fn());
    });
    expect(creates).toBe(2);
    expect(onSaved).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();
    store.dispatch(api.util.resetApiState());
  });
});
