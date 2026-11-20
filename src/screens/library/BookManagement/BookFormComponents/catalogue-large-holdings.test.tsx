import { http, HttpResponse } from 'msw';
import { act } from '@testing-library/react';
import { mswServer } from 'src/test/mswServer';
import { it, vi, expect, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';

import {
  largeBookId,
  currentBookDetail,
  currentBookValues,
  renderExistingBookEditor,
  currentBookMutationResult,
} from './catalogue-large-holdings.fixture';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
});
vi.mock('next-auth/react', () => ({
  getSession: async () => null,
  signOut: vi.fn(),
}));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { success: vi.fn(), error: vi.fn() },
}));
beforeEach(clearCachedAuthSession);

it('allows unrelated metadata for 1001 API-shaped persisted holdings and writes no copy collection', async () => {
  const values = currentBookValues(1001);
  expect(values.copies).toHaveLength(1001);
  expect(
    values.copies.every((copy) => copy.copyId && copy.receivingReceiptId && !copy.canRemove)
  ).toBe(true);
  const writes: Record<string, unknown>[] = [];
  let copyWrites = 0;
  mswServer.use(
    http.put(`http://library.test/api/library/books/${largeBookId}`, async ({ request }) => {
      writes.push((await request.json()) as Record<string, unknown>);
      return HttpResponse.json(currentBookMutationResult(1001));
    }),
    http.put(`http://library.test/api/library/books/${largeBookId}/copies`, () => {
      copyWrites += 1;
      return HttpResponse.json(currentBookMutationResult(1001));
    })
  );
  const { result } = renderExistingBookEditor(values);
  await act(async () => {
    await result.current.formik.setFieldValue('publisher', 'Reviewed publisher');
  });
  let errors: Record<string, unknown> = {};
  await act(async () => {
    errors = await result.current.formik.validateForm();
  });
  expect(Object.keys(errors).filter((field) => field !== 'numberOfCopies')).toEqual([]);
  expect(errors.numberOfCopies).toBeUndefined();
  await act(async () => {
    await result.current.saveCurrent(result.current.formik.values, false);
  });
  expect(writes).toHaveLength(1);
  expect(writes[0]).toMatchObject({
    publisher: 'Reviewed publisher',
    numberOfCopies: 1001,
  });
  expect(writes[0]).not.toHaveProperty('copies');
  expect(copyWrites).toBe(0);
  expect(result.current.error).toBe('');
});

it('finishes metadata-only editing without replaying an unchanged stale full copy set', async () => {
  const opened = currentBookValues(2, false);
  const appended = currentBookDetail(3, false);
  expect(opened.copies).toHaveLength(2);
  expect(appended.copies).toHaveLength(3);
  expect(appended.copies[2].canRemove).toBe(true);
  let metadataWrites = 0;
  const copyWrites: unknown[] = [];
  mswServer.use(
    http.put(`http://library.test/api/library/books/${largeBookId}`, () => {
      metadataWrites += 1;
      return HttpResponse.json(currentBookMutationResult(3, false));
    }),
    http.put(`http://library.test/api/library/books/${largeBookId}/copies`, async ({ request }) => {
      copyWrites.push(await request.json());
      return HttpResponse.json(currentBookMutationResult(3, false));
    }),
    http.get(`http://library.test/api/library/books/${largeBookId}`, () =>
      HttpResponse.json(appended)
    )
  );
  const { result } = renderExistingBookEditor(opened);
  await act(async () => {
    await result.current.formik.setFieldValue('publisher', 'Reviewed publisher');
  });
  let errors: Record<string, unknown> = {};
  await act(async () => {
    errors = await result.current.formik.validateForm();
  });
  expect(errors).toEqual({});
  await act(async () => {
    await result.current.saveCurrent(result.current.formik.values, true);
  });
  expect(result.current.activeStep).toBe(1);
  await act(async () => {
    await result.current.saveCurrent(result.current.formik.values, true);
  });
  expect(metadataWrites).toBe(1);
  expect(copyWrites).toHaveLength(0);
  expect(result.current.error).toBe('');
});

it('keeps the existing bounded new-entry count instead of raising the global maximum', async () => {
  const existing = currentBookValues(1001);
  const draft = {
    ...existing,
    id: '',
    copies: existing.copies.map((copy, index) => ({
      ...copy,
      id: undefined,
      copyId: undefined,
      receivingReceiptId: null,
      canRemove: undefined,
      removalBlockedReason: null,
      accessionNo: `NEW/${index + 1}`,
    })),
  };
  const { result } = renderExistingBookEditor(draft);
  let errors: Record<string, unknown> = {};
  await act(async () => {
    errors = await result.current.formik.validateForm();
  });
  expect(errors.numberOfCopies).toBeDefined();
});
