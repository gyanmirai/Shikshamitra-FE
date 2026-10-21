import type { PropsWithChildren } from 'react';

import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { configureStore } from '@reduxjs/toolkit';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { act, waitFor, renderHook } from '@testing-library/react';

import { useDocumentEditor } from './use-document-editor';

import type { SchoolDocument } from '../types';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});

function wrapper() {
  const store = configureStore({
    reducer: { [api.reducerPath]: api.reducer },
    middleware: (defaults) => defaults({ serializableCheck: false }).concat(api.middleware),
  });
  return function Wrapper({ children }: PropsWithChildren) {
    return <Provider store={store}>{children}</Provider>;
  };
}

const saved: SchoolDocument = {
  id: 'record-1',
  name: 'Approval',
  category: 0,
  notes: null,
  uploadedBy: 'staff',
  creationTime: '2026-10-21T10:00:00Z',
  concurrencyStamp: 'opened-version',
  files: [{ id: 'file-1', fileName: 'approval.pdf', size: 8, contentType: 'application/pdf' }],
};

beforeEach(() => {
  clearCachedAuthSession();
  mswServer.use(http.get('*/api/auth/session', () => HttpResponse.json(null)));
});

describe('School document editor with real RTK Query', () => {
  it('keeps the original concurrency stamp and draft after a conflicting background refresh', async () => {
    const requests: FormData[] = [];
    mswServer.use(
      http.put('*/api/institute-setup/school-documents/record-1', async ({ request }) => {
        requests.push(await request.formData());
        return HttpResponse.json({ error: { message: 'Conflict' } }, { status: 409 });
      })
    );
    const close = vi.fn();
    const { result, rerender } = renderHook(({ document }) => useDocumentEditor(document, close), {
      initialProps: { document: saved },
      wrapper: wrapper(),
    });
    await act(async () => {
      await result.current.formik.setFieldValue('name', 'My draft');
    });
    rerender({
      document: { ...saved, name: 'Someone else edited', concurrencyStamp: 'new-version' },
    });
    await act(async () => {
      await result.current.formik.submitForm();
    });
    expect(requests[0].get('concurrencyStamp')).toBe('opened-version');
    expect(requests[0].get('name')).toBe('My draft');
    expect(result.current.formik.values.name).toBe('My draft');
    expect(result.current.error).toMatch(/changed while you were editing/);
    expect(close).not.toHaveBeenCalled();
  });

  it('preserves selected files after a failure and closes only after a successful retry', async () => {
    let attempt = 0;
    mswServer.use(
      http.post('*/api/institute-setup/school-documents', async ({ request }) => {
        const body = await request.formData();
        expect(body.getAll('files')).toHaveLength(1);
        attempt += 1;
        return HttpResponse.json(attempt === 1 ? { message: 'Temporary failure' } : saved, {
          status: attempt === 1 ? 503 : 200,
        });
      })
    );
    const close = vi.fn();
    const { result } = renderHook(() => useDocumentEditor(undefined, close), {
      wrapper: wrapper(),
    });
    const file = new File(['%PDF-1.7'], 'approval.pdf', { type: 'application/pdf' });
    await act(async () => {
      await result.current.formik.setValues({
        ...result.current.formik.values,
        name: 'Approval',
        category: 0,
        files: [file],
      });
    });
    await act(async () => {
      await result.current.formik.submitForm();
    });
    expect(result.current.formik.values.files[0]).toBe(file);
    expect(close).not.toHaveBeenCalled();
    await act(async () => {
      await result.current.formik.submitForm();
    });
    await waitFor(() => expect(close).toHaveBeenCalledOnce());
    expect(attempt).toBe(2);
  });
});
