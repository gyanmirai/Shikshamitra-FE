import { http, HttpResponse } from 'msw';
import { act } from '@testing-library/react';
import { mswServer } from 'src/test/mswServer';
import { it, vi, expect, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { mapBookDetailDto } from 'src/redux/library/library-adapters';

import { getInitialBookData } from '../Components/BookManageInitialValues';
import {
  largeBookId,
  currentBookDetail,
  renderExistingBookEditor,
  currentBookMutationResult,
} from './catalogue-large-holdings.fixture';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
});
vi.mock('next-auth/react', () => ({ getSession: async () => null, signOut: vi.fn() }));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { success: vi.fn(), error: vi.fn() },
}));
beforeEach(clearCachedAuthSession);

it('retains the frozen historic negative through an unrelated metadata update request', async () => {
  const source = { ...currentBookDetail(1), price: -1.25, priceText: '-1.25' };
  const initial = getInitialBookData(mapBookDetailDto(source));
  expect(initial.price).toBe('-1.25');
  const writes: unknown[] = [];
  mswServer.use(
    http.put(`http://library.test/api/library/books/${largeBookId}`, async ({ request }) => {
      writes.push(await request.json());
      return HttpResponse.json(currentBookMutationResult(1));
    })
  );
  const { result } = renderExistingBookEditor(initial);
  await act(async () => {
    await result.current.formik.setFieldValue('publisher', 'Updated school publisher');
  });
  let errors: Record<string, unknown> = {};
  await act(async () => {
    errors = await result.current.formik.validateForm();
  });
  expect(errors).toEqual({});
  await act(async () => {
    await result.current.saveCurrent(result.current.formik.values, false);
  });
  expect(writes).toHaveLength(1);
  expect(writes[0]).toMatchObject({
    publisher: 'Updated school publisher',
    price: null,
    priceText: '-1.25',
  });
  expect(writes[0]).not.toHaveProperty('copies');
  expect(result.current.error).toBe('');
});
