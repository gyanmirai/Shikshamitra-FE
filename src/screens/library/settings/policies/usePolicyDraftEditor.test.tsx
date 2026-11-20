import type { LibraryPolicyVersion } from 'src/redux/library/policy-types';

import React from 'react';
import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { configureStore } from '@reduxjs/toolkit';
import { act, renderHook } from '@testing-library/react';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';

import { usePolicyDraftEditor } from './usePolicyDraftEditor';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
});
vi.mock('next-auth/react', () => ({ getSession: async () => null, signOut: vi.fn() }));
beforeEach(clearCachedAuthSession);

const item: LibraryPolicyVersion = {
  id: 'version-id',
  policyId: 'policy-id',
  version: 1,
  status: 0,
  concurrencyStamp: 'stamp-1',
  name: 'Student lending',
  role: 0,
  effectiveFrom: '2026-11-16',
  effectiveTo: null,
  priority: 0,
  terms: {
    maxBooksAtTime: 0,
    reservationLimit: 0,
    loanDays: 14,
    dayCountingMode: 1,
    maxRenewals: 1,
    renewalDays: 7,
    pickupWindowDays: 2,
    moveDueDateToNextOpenDay: true,
  },
};
function setup(policy = item) {
  const onClose = vi.fn();
  const store = configureStore({
    reducer: { [api.reducerPath]: api.reducer },
    middleware: (defaults) => defaults().concat(api.middleware),
  });
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
  return {
    ...renderHook(({ snapshot }) => usePolicyDraftEditor('year-id', onClose, snapshot), {
      wrapper,
      initialProps: { snapshot: policy },
    }),
    onClose,
  };
}
describe('mounted policy draft mutations', () => {
  it('keeps the original concurrency stamp when a detail refresh arrives during an edit', async () => {
    let body: unknown;
    mswServer.use(
      http.put('http://library.test/api/library/policies/version-id', async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({ detail: 'Version changed.' }, { status: 409 });
      })
    );
    const { result, rerender } = setup();
    await act(async () => {
      await result.current.formik.setFieldValue('name', 'Unsaved draft');
    });
    rerender({
      snapshot: { ...item, name: 'Other librarian edit', concurrencyStamp: 'new-stamp' },
    });
    await act(async () => {
      await result.current.formik.submitForm();
    });
    expect(body).toMatchObject({ name: 'Unsaved draft', concurrencyStamp: 'stamp-1' });
    expect(result.current.formik.values.name).toBe('Unsaved draft');
    expect(result.current.formik.dirty).toBe(true);
  });
  it('preserves values, error and dirty state when the concurrency check rejects a save', async () => {
    let body: unknown;
    mswServer.use(
      http.put('http://library.test/api/library/policies/version-id', async ({ request }) => {
        body = await request.json();
        return HttpResponse.json(
          { detail: 'This version changed. Reload before saving.' },
          { status: 409 }
        );
      })
    );
    const { result, onClose } = setup();
    await act(async () => {
      await result.current.formik.setFieldValue('name', 'Draft retained');
    });
    await act(async () => {
      await result.current.formik.submitForm();
    });
    expect(body).toMatchObject({
      name: 'Draft retained',
      concurrencyStamp: 'stamp-1',
      terms: { maxBooksAtTime: 0 },
    });
    expect(result.current.formik.values.name).toBe('Draft retained');
    expect(result.current.formik.dirty).toBe(true);
    expect(result.current.error).toContain('Reload before saving');
    expect(result.current.formik.isSubmitting).toBe(false);
    expect(onClose).not.toHaveBeenCalled();
  });
  it('saves a next version only as a draft without requiring calendar readiness or publishing', async () => {
    let body: unknown;
    mswServer.use(
      http.post('http://library.test/api/library/policies', async ({ request }) => {
        expect(new URL(request.url).searchParams.get('academicYearId')).toBe('year-id');
        body = await request.json();
        return HttpResponse.json({ ...item, id: 'new-version', version: 2, status: 0 });
      })
    );
    const { result, onClose } = setup({ ...item, status: 1 });
    await act(async () => {
      await result.current.formik.setFieldValue('name', 'Next year terms');
    });
    await act(async () => {
      await result.current.formik.submitForm();
    });
    expect(body).toMatchObject({
      policyId: 'policy-id',
      name: 'Next year terms',
      terms: { reservationLimit: 0 },
    });
    expect(body).not.toHaveProperty('concurrencyStamp');
    expect(result.current.formik.dirty).toBe(false);
    expect(onClose).toHaveBeenCalledOnce();
  });
});
